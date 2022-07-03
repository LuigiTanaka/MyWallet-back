import joi from "joi";

export default function validaUsuario(req, res, next) {
    const usuarioLogin = req.body;

    const usuarioSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = usuarioSchema.validate(usuarioLogin);

    if(error) {
        return res.status(422).send("campos não preenchidos corretamente")
    }

    next();
}