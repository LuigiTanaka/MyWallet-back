import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRouter.js";
import registrosRouter from "./routes/registrosRouter.js";
import validaToken from "./middlewares/validaToken.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(validaToken, registrosRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Estou rodando!"));