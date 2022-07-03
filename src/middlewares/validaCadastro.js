import joi from "joi";

export default function validaCadastro(req, res, next) {
    const usuario = req.body;

    const usuarioSchema = joi.object({
        name: joi.string().pattern(/^[a-zA-Z]{2,}$/).required(),
        email: joi.string().email().required(),
        password: joi.string().pattern(/.{5,}/).required()
    });

    const { error } = usuarioSchema.validate(usuario);

    if(error) {
        return res.status(422).send("campos não preenchidos corretamente: os nomes não podem conter números e precisam ter pelo menos 2 caracteres e as senhas precisam ter pelo menos 5 caracteres")
    }

    next();
}