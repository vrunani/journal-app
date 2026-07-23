import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./src/routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Journal backend running on http://localhost:${PORT}`);
});
