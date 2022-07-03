import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL);
const promise = mongoClient.connect();
promise.then(() => {
    db = mongoClient.db(process.env.MONGO_DATABASE);
});

app.post("/sign-up", async (req, res) => {
    const usuario = req.body;

    const usuarioSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = usuarioSchema.validate(usuario);

    if(error) {
        return res.status(422).send("campos não preenchidos corretamente")
    }

    const senhaHash = bcrypt.hashSync(usuario.password, 10);

    try {
        await db.collection("usuarios").insertOne({ ...usuario, password: senhaHash });
        res.status(200).send("usuario criado com sucesso!");
    } catch (error) {
        res.status(500).send("erro ao cadastrar usuário");
    }
});

app.post("/sign-in", async (req, res) => {
    const usuarioLogin = req.body;

    const usuarioSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = usuarioSchema.validate(usuarioLogin);

    if(error) {
        return res.status(422).send("campos não preenchidos corretamente")
    }

    try {
        const usuarioBanco = await db.collection("usuarios").findOne({ email: usuarioLogin.email });

        const senhaCorreta = bcrypt.compareSync(usuarioLogin.password, usuarioBanco.password);

        if(!usuarioBanco || !senhaCorreta) {
            return res.status(401).send("senha ou email incorretos");
        }

        const token = uuid();

        await db.collection("sessoes").insertOne({
            token,
            idUsuario: usuarioBanco._id
        })

        delete usuarioBanco.password;

        res.status(200).send({ ...usuarioBanco, token });
    } catch (error) {
        res.status(500).send("erro ao cadastrar usuário");
    }
});

app.get("/registros", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    const sessao = await db.collection("sessoes").findOne({ token });

    if(!sessao) {
        return res.status(401).send("token inválido");
    }

    const registros = await db.collection("registros").find({ idUsuario: new ObjectId(sessao.idUsuario) }).toArray();

    res.send(registros);
});

app.post("/registros", async (req, res) => {
    const registro = req.body;

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    
    const sessao = await db.collection("sessoes").findOne({ token });

    console.log(registro);
    console.log(sessao);

    if(!sessao) {
        return res.status(401).send("token inválido");
    }

    const registroSchema = joi.object({
        title: joi.string().required(),
        value: joi.number().required(),
        type: joi.string().valid("entrada").valid("saida").required()
    });

    const { error } = registroSchema.validate(registro);

    if(error) {
        return res.status(422).send("campos não preenchidos corretamente");
    }

    const newValue = parseFloat(registro.value).toFixed(2).replace(".", ",");

    try {
        await db.collection("registros").insertOne({ ...registro, value: newValue, idUsuario: sessao.idUsuario, day: dayjs().format("DD/MM") });
        res.status(200).send("registro criado com sucesso!");
    } catch (error) {
        res.status(500).send("erro ao criar o registro");
    }

});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Estou rodando!"));