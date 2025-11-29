import nodemailer from "nodemailer";
const codigosAtivos = {};
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

// cadastrar novo usuário e enviar código
app.post("/api/enviarCodigo", async (req, res) => {
  const { email } = req.body;
  const codigo = Math.floor(100000 + Math.random() * 900000);
  codigosAtivos[email] = codigo;

  try {
    const enviado = await enviarCodigo(email, codigo);
    res.json({ sucesso: enviado });
  } catch (erro) {
    console.log(erro);
    res.json({ sucesso: false });
  }
});

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
    console.error(" Erro ao cadastrar usuário:", error);
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
  const promises = transacoes.map(e => {

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
  const { id_transacao } = req.body;
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
  const { id_transacao } = req.body;
  try {
    const result = await execSQLQuery(`SELECT * FROM Transacoes WHERE id_transacao = ${id_transacao}`);

    await execSQLQuery(`
    UPDATE Transacoes
    SET confirmada = 0
    WHERE id_transacao = ${id_transacao};
  `);


    res.json({ sucesso: true, dados: result });


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

    if (result.dados.tipo == "despesa") {
      await execSQLQuery(`UPDATE Usuarios SET saldo = saldo + ${result.dados.valor} WHERE id = ${result.id_usuario}`)
    }
    else if (result.dados.tipo == "receita") {
      await execSQLQuery(`UPDATE Usuarios SET saldo = saldo - ${result.dados.valor} WHERE id = ${result.id_usuario}`)
    }

    res.json({ sucesso: true, dados: result });


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



//Pegar ultimas transações
app.post("/api/ultimas-transacoes", async (req, res) => {

  const { id_usuario } = req.body;
  try {
    const result = await execSQLQuery(`SELECT TOP 5 * FROM Transacoes WHERE id_usuario = ${id_usuario} AND confirmada = 1
ORDER BY data DESC`);

    if (result.length > 1)

      res.json({ sucesso: true, dados: result })

  }
  catch (error) {
    console.log(error);
  }

});


// Rota para buscar os dados dos últimos 12 meses para o gráfico
app.get("/api/grafico/evolucao/:id_usuario", async (req, res) => {
  const id_usuario = req.params.id_usuario;

  try {
    // Busca os últimos 12 registros da sua View HistoricoMensal
    // Obs: Se a ordem dos meses vier errada, precisamos adicionar um ORDER BY no SQL depois
    const result = await execSQLQuery(`
      SELECT TOP 12 
        mes, 
        total_receitas, 
        total_despesas, 
        economia 
      FROM HistoricoMensal 
      WHERE id_usuario = ${id_usuario}
    `);

    res.json(result);

  } catch (error) {
    console.error("Erro ao buscar dados do gráfico:", error);
    res.status(500).json({ erro: error.message });
  }
});


// Rota para pegar dados agrupados por categoria (para os gráficos de pizza)
// Exemplo de uso: /api/grafico/categorias/1/despesa
app.get("/api/grafico/categorias/:id_usuario/:tipo", async (req, res) => {
  const { id_usuario, tipo } = req.params;

  try {
    // Essa query soma o valor total de cada categoria para aquele usuário e tipo
    const result = await execSQLQuery(`
      SELECT 
        c.nome_categoria, 
        SUM(t.valor) as total
      FROM Transacoes t
      JOIN Categorias c ON t.id_categoria = c.id_categoria
      WHERE t.id_usuario = ${id_usuario} 
      AND t.tipo = '${tipo}'
      GROUP BY c.nome_categoria
    `);

    res.json(result);

  } catch (error) {
    console.error(`Erro ao buscar categorias de ${tipo}:`, error);
    res.status(500).json({ erro: error.message });
  }
});


//===============================
//PAGINA SIMULAÇÃO
//===============================

app.post("/api/simulacao/salvar", async (req, res) => {
  const {
    nome_simulacao,
    saldo_inicial,
    periodo,
    porcentagem,
    tipo_simulacao,
    dados_linha,
    id_usuario
  } = req.body;

  try {
    const result = await execSQLQuery(`
      INSERT INTO Simulacoes (
        nome_simulacao,
        saldo_inicial,
        periodo,
        porcentagem,
        tipo_simulacao,
        dados_linha,
        data_criacao,
        id_usuario
      )
      VALUES (
        '${nome_simulacao}',
        ${saldo_inicial},
        ${periodo},
        ${porcentagem},
        ${tipo_simulacao},
        '${dados_linha}',
        GETDATE(),
        ${id_usuario}
      );
      SELECT * FROM Simulacoes WHERE id_simulacao = SCOPE_IDENTITY();
    `);

    res.json(result[0]);

  } catch (error) {
    console.error("Erro ao salvar simulação:", error);
    res.status(500).json({ erro: error.message });
  }
});

app.get("/api/simulacao/listar/:id_usuario", async (req, res) => {
  const id_usuario = req.params.id_usuario;

  try {
    const result = await execSQLQuery(`
      SELECT 
        id_simulacao,
        nome_simulacao,
        saldo_inicial,
        periodo,
        porcentagem,
        tipo_simulacao,
        data_criacao
      FROM Simulacoes
      WHERE id_usuario = ${id_usuario}
      ORDER BY data_criacao DESC
    `);

    res.json(result);

  } catch (error) {
    console.error("Erro ao listar simulações:", error);
    res.status(500).json({ erro: error.message });
  }
});

app.get("/api/simulacao/:id_simulacao", async (req, res) => {
  const id = req.params.id_simulacao;

  try {
    const result = await execSQLQuery(`
      SELECT *
      FROM Simulacoes
      WHERE id_simulacao = ${id}
    `);

    res.json(result[0] || {});

  } catch (error) {
    console.error("Erro ao buscar simulação:", error);
    res.status(500).json({ erro: error.message });
  }
});

app.post("/api/simulacao/excluir", async (req, res) => {
  const { id_simulacao } = req.body;

  try {
    await execSQLQuery(`
      DELETE FROM Simulacoes
      WHERE id_simulacao = ${id_simulacao}
    `);

    res.json({ sucesso: true });

  } catch (error) {
    console.error("Erro ao excluir simulação:", error);
    res.status(500).json({ erro: error.message });
  }
});

//pegar ia
app.post("/api/ia", async (req, res) => 
{
console.log("BODY RECEBIDO:", req.body);
 const  dadosIa  = req.body;

const dadosSerializados = JSON.stringify(dadosIa);

try{
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
   body: JSON.stringify({
    model: "x-ai/grok-4.1-fast:free",
    messages: [
      { role: "system", content: `Você é um assistente que irá analisar gráficos de gastos e oferecer sugestões para o consumidor, usando esses dados: ${dadosSerializados}. Responda de forma resumida` },
      { role: "user", content: `Use apenas esses ${dadosSerializados}  para dar sugestões de economia.`}
    ]
  })

});


const data = await response.json();
res.json(data.choices[0].message.content);
}
catch(error)
{
  console.log(error);
}

})


//===============================
//PAGINA PERFIL
//===============================

//Rota para carregar dados do usuário
app.get("/api/usuario/:id_usuario", async (req, res) => {
    const id = req.params.id_usuario;

    try {
        const result = await execSQLQuery(`
            SELECT Nome, Email FROM Usuarios WHERE id = ${id}
        `);

        res.json(result[0] || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao carregar dados do usuário" });
    }
});

//Rota para alterar a senha do banco
app.post("/api/usuario/alterar-senha", async (req, res) => {
    const { id_usuario, senha_atual, nova_senha } = req.body;

    try {
        // verificar senha atual
        const usuario = await execSQLQuery(`
            SELECT Senha FROM Usuarios WHERE id = ${id_usuario}
        `);

        if (usuario.length === 0)
            return res.json({ sucesso: false, mensagem: "Usuário não encontrado." });

        if (usuario[0].Senha !== senha_atual)
            return res.json({ sucesso: false, mensagem: "Senha atual incorreta!" });

        // atualizar senha
        await execSQLQuery(`
            UPDATE Usuarios 
            SET Senha = '${nova_senha}'
            WHERE id = ${id_usuario}
        `);

        res.json({ sucesso: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao alterar senha" });
    }
});

app.listen(3000, () => {
  console.log("Servidor funcionando em http://localhost:3000");
});