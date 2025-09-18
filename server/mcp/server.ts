import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";
import express from "express";
import { log_response } from "../api/utils.js";
import { UserRepository } from "../src/db/client.js";
import { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { insertUserSchema } from "../api/models.js";

class Server {
  private server: McpServer;
  private transport: StreamableHTTPServerTransport;
  private serverName: string;
  private serverVersion: string = "1.0.0";
  private app: express.Application;
  private port: number;
  private userRepository: UserRepository;
  private transports: { [sessionId: string]: StreamableHTTPServerTransport };

  constructor(serverName: string, port: number = 8000) {
    this.serverName = serverName;
    this.transports = {};
    this.server = new McpServer({
      name: serverName,
      version: this.serverVersion,
      capabilities: {
        resources: {},
        tools: {},
      },
    });

    this.userRepository = new UserRepository();

    this.transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
      onsessioninitialized: (sessionId) => {
        console.log(`Session initialized: ${sessionId}`);
      },
      onsessionclosed: (sessionId) => {
        console.log(`Session closed: ${sessionId}`);
      },
    });

    this.transport.onerror = (error: Error) => {
      console.error(`[MCP Transport Error]: ${error.message}`);
      console.error(error.stack);
    };

    this.transport.onclose = () => {
      console.log(`[MCP Transport]: Connection closed`);
    };

    this.app = express();
    this.app.use(express.json());
    this.app.use(log_response);

    // MCP endpoints
    this.app.post("/mcp", async (req, res) => {
      await this.transport.handleRequest(req, res, req.body);
    });

    this.app.get("/mcp", async (req, res) => {
      await this.transport.handleRequest(req, res);
    });

    this.app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error(`[Express Error]: ${err.message}`);
        console.error(err.stack);

        res.status(500).json({
          error: "Internal Server Error",
          message:
            process.env.NODE_ENV === "development"
              ? err.message
              : "An error occurred processing your request",
        });
      }
    );
    this.port = port;
  }

  setUpTransport() {}

  async registerServerTools() {
    this.server.registerTool(
      "register_user",
      {
        title: "Register User",
        description: "Register new user",
        inputSchema: {
          username: z.string(),
          password: z.string(),
          email: z.string(),
        },
      },
      async ({ username, password, email }) => {
        const user = await this.userRepository.create({
          username,
          password,
          email,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(user),
            },
          ],
        };
      }
    );
  }

  async registerServerResources() {
    this.server.registerResource(
      "users",
      new ResourceTemplate("users://", { list: undefined }),
      {
        title: "All Users",
        description: "Retrieve all users",
      },
      async (uri, {}) => {
        const users = await this.userRepository.list();
        return {
          contents: [
            {
              uri: uri.href,
              text: users.map((user) => user.username).join(", "),
            },
          ],
        };
      }
    );
    this.server.registerResource(
      "user",
      new ResourceTemplate("users://{userMail}", { list: undefined }),
      {
        title: "User",
        description: "User profile information",
      },
      async (uri, { userMail }) => {
        const user = await this.userRepository.findByEmail(userMail as string);
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(user),
            },
          ],
        };
      }
    );
  }

  async registerServerPrompts() {
    this.server.registerPrompt(
      "Happy Birthday",
      {
        title: "Happy Birthday",
        description: "Sing happy birthday to the user",
        argsSchema: { name: z.string() },
      },
      ({ name }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Happy birthday to ${name}!`,
            },
          },
        ],
      })
    );
  }

  get ServerName() {
    return this.serverName;
  }

  get ServerVersion() {
    return this.serverVersion;
  }

  get ServerPort() {
    return this.port;
  }

  get Server() {
    return this.server;
  }

  async start() {
    await this.registerServerTools()
      .then(() => this.registerServerResources())
      .then(() => this.registerServerPrompts())
      .then(() => this.server.connect(this.transport));
    this.app.listen(this.port, () => {
      console.log(
        `MCP HTTP server running on http://localhost:${this.port}/mcp`
      );
    });
  }
}

export default Server;
