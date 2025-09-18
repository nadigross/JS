import { Request, Response, NextFunction } from "express";

export function log_response(req: Request, res: Response, next: NextFunction){
    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        ip: req.ip,
    });
    next();
}