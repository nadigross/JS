import Server from "./server.js";
import { z } from "zod";

export const registerServerTools = (server: Server) => {
  server.Server.tool(
    "register_user",
    "register new user",
    { username: z.string(), password: z.string() },
    async ({ username, password }) => {
      return {
        content: [
          {
            type: "text",
            text: `User registered successfully ${username}, ${password}`,
          },
        ],
      };
    }
  );
};
