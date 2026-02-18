import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import connectDB from "./config/db";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1", router);
const port = process.env.PORT;

app.get("/health-check", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running successfully 🚀",
  });
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
});
