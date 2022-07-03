import joi from "joi";

export default function validaRegistro(req, res, next) {
    const registro = req.body;
    registro.value = registro.value.replace(",", ".");

    const registroSchema = joi.object({
        title: joi.string().required(),
        value: joi.number().required(),
        type: joi.string().valid("entrada").valid("saida").required()
    });

    const { error } = registroSchema.validate(registro);

    if(error) {
        return res.status(422).send("campos não preenchidos corretamente");
    }

    next();
}