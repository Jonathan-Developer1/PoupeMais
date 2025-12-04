const codigosAtivos = {};
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sql from "mssql";
import dotenv from "dotenv";
import { enviarCodigo } from "../public/js/email.js";
import { marked, Marked } from "marked";
import { enviarBoasVindas } from "../public/js/email.js";

dotenv.config(); // carrega as variáveis do .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();

app.use(express.static(path.join(__dirname, "../public")));

let connection = null;

// arquivo .env p config:
/*
DB_SERVER=
DB_NAME=
DB_USER=
DB_PASS=
*/

// ===============================
// 1. CONFIGS DO BANCO DE DADOS
// ===============================
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

// ===============================
// 2. CONEXÃO NO BANCO DE DADOS
// ===============================
export async function getConnection() {
  if (connection) return connection;
  try {
    connection = await sql.connect(config);
    console.log("Conectado ao SQL Server!");
    return connection;
  } catch (err) {
    console.error("Erro ao conectar:");
    console.error(JSON.stringify(err, null, 2));
    throw err;
  }
}

// ===============================
// 3. FUNÇÃO DE EXECUÇÃO DE QUERYS
// ===============================
export async function execSQLQuery(sqlQuery) {
  const conn = await getConnection();
  const request = new sql.Request(conn);
  const { recordset } = await request.query(sqlQuery);
  return recordset;
}
app.use(express.json());

// ===============================
// 4. ROTA DE LOGIN
// ===============================
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

// ===============================
// 5. ROTA DE CADASTRO DE USUÁRIO E ENVIO DE CÓDIGO
// ===============================
app.post("/api/enviarCodigo", async (req, res) => {
  const { email } = req.body;
  const codigo = Math.floor(100000 + Math.random() * 900000);
  codigosAtivos[email] = codigo;

  try {

    const enviado = await enviarCodigo(email, codigo);
    res.json({ sucesso: enviado });
  } catch (erro) {
    console.log("Erro ao tentar enviar código pela Brevo:", erro);
    res.json({ sucesso: false });
  }
});

// ===============================
// 6. VERIFICAÇÃO DE CÓDIGO
// ===============================
app.post("/api/verificarCodigo", (req, res) => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ validado: false, mensagem: "Email ou código faltando" });
  }

  const codigoCorreto = codigosAtivos[email];

  if (codigoCorreto && parseInt(codigo) === codigoCorreto) {
    //remover o código após verificação
    delete codigosAtivos[email];
    return res.json({ validado: true });
  } else {
    return res.json({ validado: false });
  }
});

// ===============================
// 7. CADASTRO DE USUÁRIO
// ===============================
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

    // enviar e-mail de boas-vindas
    const enviado = await enviarBoasVindas(email, nome);
    if (!enviado) console.log("Erro ao enviar e-mail de boas-vindas");

    res.json({ sucesso: true });

  } catch (error) {
    console.error(" Erro ao cadastrar usuário:", error);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
});

// ===============================
// 8. ROTA QUE BUSCA DADOS DO USUÁRIO
// ===============================
app.get("/api/usuario/:id_usuario", async (req, res) => {
  const id  = req.params.id_usuario;
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

// ===============================
// 9. ROTA PARA ALTERAÇÃO DE SENHA
// ===============================
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


// ===============================
// 10. ROTA QUE BUSCA O SALDO
// ===============================
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

// ===============================
// 11. ROTA PARA CADASTRO DE TRANSAÇÕES
// ===============================
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
    request.input("id_parcela", sql.Int, e.id_parcela);

    return request.query(`
   INSERT INTO transacoes
    (id_usuario, nome, tipo, valor, parcelas, confirmada, data, id_categoria, id_parcela)
   VALUES 
    (@id_usuario, @nome, @tipo, @valor, @parcelas, 0, @data, @id_categoria, @id_parcela)
  `);
  });

  await Promise.all(promises);

  res.json({ sucesso: true });

});


// ===============================
// 12. ROTA QUE BUSCA AS TRANSAÇÕES
// ===============================
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
 t.id_parcela,
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

// ===============================
// 13. ROTAS QUE CONFIRMAM TRANSAÇÕES
// ===============================
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


// ===============================
// 14. ROTAS QUE CANCELAM TRANSAÇÕES
// ===============================
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

// ===============================
// 15. ROTA DE EXCLUSÃO DE PARCELAS
// ===============================
app.post("/api/excluirParcelas/", async (req, res) => {
  const { parcelas_id } = req.body;


  try {
    await execSQLQuery(`DELETE FROM Transacoes WHERE id_parcela = ${parcelas_id}`);

    res.json({ sucesso: true });
  }
  catch (error) {
    console.log(error);
  }
})

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

// ===============================
// 16. ROTA QUE BUSCA O HISTÓRICO MENSAL
// ===============================

app.get("/api/historico/ultimo/:id_usuario", async (req, res) => {
  const id_usuario = req.params.id_usuario;

  try {
    const result = await execSQLQuery(`
    SELECT TOP 1 
      MONTH(data) as mes,
      YEAR(data) as ano,
      SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_receitas,
      SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_despesas,
      SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END) as economia
    FROM Transacoes
    WHERE id_usuario = ${id_usuario} AND confirmada = 1
    GROUP BY YEAR(data), MONTH(data)
    ORDER BY ano DESC, mes DESC;
  `);

    res.json(result[0] || {});

  } catch (error) {
    console.error("Erro ao consultar último histórico:", error);
    res.status(500).json({ erro: error.message });
  }
});

// ===================================================
// 17. ROTA QUE BUSCA AS ULTIMAS TRANSAÇÕES CONFIRMADAS
// ===================================================
app.post("/api/ultimas-transacoes", async (req, res) => {

  const { id_usuario } = req.body;
  try {
    const result = await execSQLQuery(`SELECT TOP 5 * FROM Transacoes WHERE id_usuario = ${id_usuario} AND confirmada = 1
ORDER BY data DESC`);

    if (result.length >= 1)

      res.json({ sucesso: true, dados: result })

  }
  catch (error) {
    console.log(error);
  }

});


// ===============================================
// 18. ROTA QUE BUSCA OS DADOS DOS ULTIMOS 12 MESES
// ===============================================
app.get("/api/grafico/evolucao/:id_usuario", async (req, res) => {
  const id_usuario = req.params.id_usuario;

  try {
    // ALTERAÇÃO: Substituído a View HistoricoMensal por uma query direta para poder filtrar por 'confirmada = 1'
    const result = await execSQLQuery(`
      SELECT TOP 12 
        MONTH(data) as mes, -- Retorna o número do mês
        YEAR(data) as ano,
        SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_receitas,
        SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_despesas,
        SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END) as economia
      FROM Transacoes 
      WHERE id_usuario = ${id_usuario}
      AND confirmada = 1
      GROUP BY YEAR(data), MONTH(data)
      ORDER BY ano DESC, mes DESC
    `);

    res.json(result);

  } catch (error) {
    console.error("Erro ao buscar dados do gráfico:", error);
    res.status(500).json({ erro: error.message });
  }
});


// ===============================
// 19. ROTA QUE BUSCA OS DADOS POR CATEGORIA
// ===============================
app.get("/api/grafico/categorias/:id_usuario/:tipo", async (req, res) => {
  const { id_usuario, tipo } = req.params;

  try {
    // Essa query soma o valor total de cada categoria para aquele usuário e tipo
    // ADICIONADO: AND t.confirmada = 1
    const result = await execSQLQuery(`
   SELECT 
    c.nome_categoria, 
    SUM(t.valor) as total
   FROM Transacoes t
   JOIN Categorias c ON t.id_categoria = c.id_categoria
   WHERE t.id_usuario = ${id_usuario} 
   AND t.tipo = '${tipo}'
   AND t.confirmada = 1
   GROUP BY c.nome_categoria
  `);

    res.json(result);

  } catch (error) {
    console.error(`Erro ao buscar categorias de ${tipo}:`, error);
    res.status(500).json({ erro: error.message });
  }
});

// ===============================
// 20. ROTA PARA SALVAR SIMULAÇÕES
// ===============================
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

// ===============================
// 21. ROTAS PARA SIMULAÇÕES
// ===============================
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

// ===============================
// 22. ROTA PARA A API DE IA
// ===============================
app.post("/api/ia", async (req, res) => {

  const dadosIa = req.body;

  const dadosSerializados = JSON.stringify(dadosIa);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "x-ai/grok-4.1-fast:free",
        messages: [
          { role: "system", content: `Você é um assistente que irá analisar gráficos de gastos e oferecer sugestões para o consumidor, usando esses dados: ${dadosSerializados}. Responda de forma resumida. Não sugira outros apps` },
          { role: "user", content: `Use apenas esses ${dadosSerializados}  para dar sugestões de economia.` }
        ]
      })

    });


    const data = await response.json();
    res.json(marked(data.choices[0].message.content));
  }
  catch (error) {
    console.log(error);
    res.json("Sem sugestões no momento");
  }

})

// ===============================
// ROTAS DE PÁGINAS
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "login.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "home.html"));
});

app.get("/graficos", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "graficos.html"));
});

app.get("/simulacao", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "simulacao.html"));
});

app.get("/perfil", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "perfil.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "cadastrarUsuario.html"));
});
app.get("/alterarsenha", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "alterarSenha.html"));
});

// ===============================
// ABERTURA SERVIDOR
// ===============================

app.listen(3000, () => {
  console.log("Servidor funcionando em http://localhost:3000");
});