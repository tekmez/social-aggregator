import express, { Application, Request, Response } from "express";

const app: Application = express();

app.use(express.json());

// Health Check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

export { app };
