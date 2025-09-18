import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { log_response } from "./utils";
import router from "./users";

dotenv.config();

const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export function createApp(): Application {
  const app = express();

  app.use(express.json());
  
  app.use(cors(corsOptions));
  app.use(log_response);
  app.use("/v1/users", router);
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err) {
      let errors;
      try {
        errors = JSON.parse(err.message);
      } catch (e) {
        errors = [err.message];
      }
    return res.status(400).json({
        success: false,
        message: err.name,
        errors: errors,
        stack: err.stack
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  });

  return app;
}

export const app = createApp();
