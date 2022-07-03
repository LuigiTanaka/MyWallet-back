import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL);
const promise = mongoClient.connect();
promise.then(() => {
    db = mongoClient.db(process.env.MONGO_DATABASE);
});

export default async function validaToken(req, res, next) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    const sessao = await db.collection("sessoes").findOne({ token });

    if(!sessao) {
        return res.status(401).send("token inválido");
    }

    res.locals.sessao = sessao;

    next();
}