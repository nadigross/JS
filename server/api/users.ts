import { Router, Request, Response } from "express";
import { loginSchema, insertUserSchema } from "./models.js";
import { UserRepository } from "../src/db/client.js";

const router = Router();

const userRepository = new UserRepository();


router.post("/login", async (req: Request, res: Response) => {
    const loginData = await loginSchema.parseAsync(req.body);
    const user = await userRepository.findByUsername(loginData.username);
    if (!user) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
    }
    const isMatch = loginData.password === user.password;
    if (!isMatch) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
    }
    const { password, ...rest } = user;
    res.json(rest);
});

router.post("/signup", async (req: Request, res: Response) => {
    const userData = await insertUserSchema.parseAsync(req.body);
    const user = await userRepository.create(userData);
    res.json(user);
});

router.delete("/:id", async (req: Request, res: Response) => {
    const deleted = await userRepository.delete(parseInt(req.params.id));
    if (deleted) {
        res.json({ message: "User deleted." });
    } else {
        res.status(404).json({ message: "User not found." });
    }
});

router.put("/:id", async (req: Request, res: Response) => {
    const user = await userRepository.update(parseInt(req.params.id), req.body);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found." });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    const user = await userRepository.findById(parseInt(req.params.id));
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found." });
    }
});




export default router;