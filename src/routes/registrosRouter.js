import { getRegistros, cadastrarRegistro } from "../controllers/registrosController.js";
import { Router } from "express";
import validaRegistro from "../middlewares/validaRegistro.js";

const router = Router();

router.get("/registros", getRegistros);
router.post("/registros", validaRegistro, cadastrarRegistro);

export default router;