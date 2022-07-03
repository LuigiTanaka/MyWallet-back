import { cadastrarUsuario, loginUsuario } from "../controllers/authController.js";
import { Router } from "express";
import validaCadastro from "../middlewares/validaCadastro.js";
import validaUsuario from "../middlewares/validaUsuario.js";

const router = Router();

router.post("/sign-up", validaCadastro, cadastrarUsuario);
router.post("/sign-in", validaUsuario, loginUsuario);

export default router;