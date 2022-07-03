import dayjs from "dayjs";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);
const promise = mongoClient.connect();
promise.then(() => {
    db = mongoClient.db(process.env.MONGO_DATABASE);
});

export async function getRegistros(req, res) {
    const sessao = res.locals.sessao;

    const registros = await db.collection("registros").find({ idUsuario: new ObjectId(sessao.idUsuario) }).toArray();

    res.send(registros);
}

export async function cadastrarRegistro(req, res) {
    const registro = req.body;
    const newValue = parseFloat(registro.value).toFixed(2).replace(".", ",");
    const sessao = res.locals.sessao;

    try {
        await db.collection("registros").insertOne({ ...registro, value: newValue, idUsuario: sessao.idUsuario, day: dayjs().format("DD/MM") });
        res.status(200).send("registro criado com sucesso!");
    } catch (error) {
        res.status(500).send("erro ao criar o registro");
    }
}