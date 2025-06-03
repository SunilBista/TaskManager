import express from "express";
import type { Request, Response } from "express";
import dbConfig from "./config/dbConfig";
import router from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import taskRoutes from "./routes/taskRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import cors from "cors";
import http from "http";
import { setSocketInstance } from "./controllers/taskController";
import { Server } from "socket.io";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_ORIGIN];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
dbConfig()
  .then(() => {
    const port: number = parseInt(process.env.PORT || "3000", 10);
    server.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Failed to connect to database", error);
  });

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  }
  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
  });
});

setSocketInstance(io);
app.use("/api/auth", router);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req: Request, res: Response): void => {
  res.send("home");
});
