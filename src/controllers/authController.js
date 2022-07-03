import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);
const promise = mongoClient.connect();
promise.then(() => {
    db = mongoClient.db(process.env.MONGO_DATABASE);
});

export async function cadastrarUsuario(req, res) {
    const usuario = req.body;
    const senhaHash = bcrypt.hashSync(usuario.password, 10);

    try {
        const emailJaCadastrado = await db.collection("usuarios").findOne({ email: usuario.email });

        if(emailJaCadastrado) {
            return res.status(409).send("email já cadastrado")
        }

        await db.collection("usuarios").insertOne({ ...usuario, password: senhaHash });
        res.status(200).send("usuario criado com sucesso!");
    } catch (error) {
        res.status(500).send("erro ao cadastrar usuário");
    }
}

export async function loginUsuario(req, res) {
    const usuarioLogin = req.body;

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
        res.status(500).send("erro ao logar usuário");
    }
}