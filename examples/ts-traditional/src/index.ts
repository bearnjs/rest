import createApp, { Request, Response } from "@bearn/rest";
import "./controllers/users";
import { usersRouter } from "./routes/users";

const app = createApp({
  host: "0.0.0.0",
  port: 8000,
  rootPrefix: "/api",
  cors: {
    credentials: true,
    origin: "http://localhost:5173"
  },
  printRoutes: true
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "OK" });
});

app.use(usersRouter);

app.start();
