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

    if (result.length > 0) {
      res.json({
        sucesso: true,
        saldo: result[0].saldo,
        id: result[0].id
      });
    } else {
      res.json({ sucesso: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar o banco" });
  }
});

// cadastrar novo usuário
app.post("/api/cadastrarUsuario", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {

    // verificar se já existe e-mail cadastrado
    const existe = await execSQLQuery(`
      SELECT * FROM Usuarios WHERE Email='${email}'
    `);

    if (existe.length > 0) {
      return res.json({ sucesso: false, mensagem: "E-mail já cadastrado!" });
    }

    // inserir novo usuário com saldo inicial zero
    await execSQLQuery(`
      INSERT INTO Usuarios (Nome, Email, Senha, Saldo)
      VALUES ('${nome}', '${email}', '${senha}', 0)
    `);

    res.json({ sucesso: true });

  } catch (error) {
    console.error("❌ Erro ao cadastrar usuário:", error);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
});


//saldo
app.post("/api/saldo", async (req, res) => {
  const { id_usuario } = req.body;

  try {
    const result = await execSQLQuery(
      `SELECT saldo FROM Usuarios WHERE id = ${id_usuario}`
    );
    if (result.length > 0) {
      res.json(result)
    } else {
      res.json({ sucesso: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar o banco" });
  }
})

//cadastro
app.post("/api/transacao", async (req, res) => {
  const transacao = req.body;

  const transacoes = Array.isArray(transacao) ? transacao : [transacao];
  const conn = await getConnection();
  const promises = transacoes.map(e =>
  {
    
     const request = new sql.Request(conn); 
    
    request.input("id_usuario", sql.Int, e.id_usuario);
    //
    request.input("nome", sql.VarChar(200), e.nome);
    request.input("tipo", sql.VarChar(50), e.tipo);
    request.input("valor", sql.Decimal(18, 2), e.valor);
    request.input("parcelas", sql.Int, e.parcelas || 1);
    request.input("data", sql.Date, e.data);

    request.input("id_categoria", sql.Int, e.categoria);

    return request.query(`
      INSERT INTO transacoes
        (id_usuario, nome, tipo, valor, parcelas, confirmada, data, id_categoria)
      VALUES 
        (@id_usuario, @nome, @tipo, @valor, @parcelas, 0, @data, @id_categoria)
    `);
  });

  await Promise.all(promises);

    res.json({ sucesso: true });

    res.status(500).json({ erro: error.message });
  });


//carregar transações
app.get("/api/transacoes/:id_usuario", async (req, res) => {
  const id_usuario = req.params.id_usuario;

  try {
    const result = await execSQLQuery(`
SELECT 
  t.id_transacao,
  t.id_usuario,
  t.nome,
  t.tipo,
  t.valor,
  t.parcelas,
  t.confirmada,
  t.data,
  t.id_categoria,
  c.nome_categoria 
  FROM 
  Transacoes t
  JOIN 
  Categorias c ON t.id_categoria = c.id_categoria
  WHERE 
  t.id_usuario = ${id_usuario}
  `);

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar o banco" });
  }
});

//pegar valor
app.post("/api/valor/confirmar", async (req, res) => {
  const {id_transacao} = req.body;
  try {
    const result = await execSQLQuery(`SELECT * FROM Transacoes WHERE id_transacao = ${id_transacao}`);

    await execSQLQuery(`
    UPDATE Transacoes
    SET confirmada = 1
    WHERE id_transacao = ${id_transacao};
  `);


    res.json({ sucesso: true, dados: result });


  } catch (error) {
    console.error("Erro ao selecionar transação:");
    res.status(500).json({ erro: error.message });
  }
});


app.post("/api/valor/cancelar", async (req, res) => {
  const {id_transacao} = req.body;
  try {
    const result = await execSQLQuery(`SELECT * FROM Transacoes WHERE id_transacao = ${id_transacao}`);
    
    await execSQLQuery(`
    UPDATE Transacoes
    SET confirmada = 0
    WHERE id_transacao = ${id_transacao};
  `);
   
    
    res.json({ sucesso: true, dados: result});
    

  } catch (error) {
    console.error("Erro ao selecionar transação:");
    res.status(500).json({ erro: error.message });
  }
});
//confirmar transação

app.post("/api/saldo/atualizar/confirmar", async (req, res) => {
  const result = req.body;


  try {

    if (result.dados.tipo == "despesa") {
      await execSQLQuery(`UPDATE Usuarios SET saldo = saldo - ${result.dados.valor} WHERE id = ${result.id_usuario}`)
    }
    else if (result.dados.tipo == "receita") {
      await execSQLQuery(`UPDATE Usuarios SET saldo = saldo + ${result.dados.valor} WHERE id = ${result.id_usuario}`)
    }

    res.json({ sucesso: true, dados: result });


  } catch (error) {
    console.error("Erro ao selecionar transação:");
    res.status(500).json({ erro: error.message });
  }
});


//cancelar transação

app.post("/api/saldo/atualizar/cancelar", async (req, res) => {
  const result = req.body;
  
  
  try {

   if(result.dados.tipo == "despesa")
   {
    await execSQLQuery(`UPDATE Usuarios SET saldo = saldo + ${result.dados.valor} WHERE id = ${result.id_usuario}`)
   }
   else if(result.dados.tipo == "receita")
   {
    await execSQLQuery(`UPDATE Usuarios SET saldo = saldo - ${result.dados.valor} WHERE id = ${result.id_usuario}`)
   }
  
    res.json({sucesso: true, dados: result});
    

  } catch (error) {
    console.error("Erro ao selecionar transação:");
    res.status(500).json({ erro: error.message });
  }
});

app.post("/api/excluir/", async (req, res) => {
  const { transacao_id } = req.body;


  try {
    await execSQLQuery(`DELETE FROM Transacoes WHERE id_transacao = ${transacao_id}`);

    res.json({ sucesso: true });
  }
  catch (error) {
    console.log(error);
  }
})

//HistoricoMensal:

app.get("/api/historico/ultimo/:id_usuario", async (req, res) => {
  const id_usuario = req.params.id_usuario;

  try {
    const result = await execSQLQuery(`
      SELECT TOP 1 
        mes,
        ano,
        total_receitas,
        total_despesas,
        economia
      FROM HistoricoMensal
      WHERE id_usuario = ${id_usuario}
      ORDER BY ano DESC, mes DESC;
    `);

    res.json(result[0] || {});

  } catch (error) {
    console.error("Erro ao consultar último histórico:", error);
    res.status(500).json({ erro: error.message });
  }
});


app.listen(3000, () => {
  console.log("Servidor funcionando em http://localhost:3000");
});