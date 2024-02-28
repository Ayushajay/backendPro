import express, { json } from "express";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extends: true }));
app.use(express.static("Public"));
app.use(cookieParser());

// routes
import userRouter from "./routes/user.router.js";

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use("/api/v1/users", userRouter);

export { app };
