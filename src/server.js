import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config(); // carrega as variáveis do .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let connection = null;


//arquivo .env p config:
/*
DB_SERVER=
DB_NAME=
DB_USER=
DB_PASS=
*/
const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// função de conexão
export async function getConnection() {
  if (connection) return connection;
  try {
    connection = await sql.connect(config);
    console.log("✅ Conectado ao SQL Server!");
    return connection;
  } catch (err) {
    console.error("❌ Erro ao conectar:");
    console.error(JSON.stringify(err, null, 2));
    throw err;
  }
}

// executa uma query SQL
export async function execSQLQuery(sqlQuery) {
  const conn = await getConnection();
  const request = new sql.Request(conn);
  const { recordset } = await request.query(sqlQuery);
  return recordset;
}

// servidor
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// rota inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// login
app.post("/login.html", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await execSQLQuery(
      `SELECT * FROM Usuarios WHERE Email='${email}' AND Senha='${senha}'`
    );
    console.log(result);
    if (result.length > 0) {
      res.json({ sucesso: true });
    } else {
      res.json({ sucesso: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar o banco" });
  }
});

// Testezinho de bacana pra ver se tá bom
app.get("/test-users", async (req, res) => {
  try {
    const result = await execSQLQuery("SELECT * FROM Usuarios");
    console.log("/test-users ->", result);
    res.json(result);
  } catch (err) {
    console.error("❌ /test-users erro completo:", err); 
    res.status(500).json({ erro: "Erro ao buscar usuários", detalhe: err });
  }
});


app.listen(3000, () => {
  console.log("Servidor funcionando em http://localhost:3000");
});
