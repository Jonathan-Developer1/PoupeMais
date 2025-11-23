//  SALDOS/DESPESAS/RECEITA/ECONOMIA  

async function pegarSaldo() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const resposta = await fetch("/api/saldo", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_usuario: usuario.id })
  });

  const json = await resposta.json();
  return json[0].saldo;
}

async function carregarResumo() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const resposta = await fetch(`/api/historico/ultimo/${usuario.id}`);
  const dados = await resposta.json();

  return dados;
}

async function preencherResumo() {
  const dados = await carregarResumo();

  const saldo = await pegarSaldo();

  document.getElementById("saldo-atual").innerText =
    Number(saldo).toFixed(2);

  document.getElementById("receitas-totais").innerText =
    Number(dados.total_receitas).toFixed(2);

  document.getElementById("despesas-totais").innerText =
    Number(dados.total_despesas).toFixed(2);

  document.getElementById("economia").innerText =
    Number(dados.economia).toFixed(2);
}

preencherResumo();


                                                // GRÁFICOS
// GRÁFICO DE Evolução Financeira 
// ======================================================
// GRÁFICO DE EVOLUÇÃO FINANCEIRA (CONECTADO AO BANCO)
// ======================================================

async function montarGraficoEvolucao() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const ctx = document.getElementById('graficoEvolucao');

  try {
    // 1. Busca os dados no servidor que acabamos de criar
    const resposta = await fetch(`/api/grafico/evolucao/${usuario.id}`);
    const dados = await resposta.json();

    // 2. Prepara os arrays vazios para separar os dados
    const labelsMeses = [];
    const dadosReceitas = [];
    const dadosDespesas = [];
    const dadosSaldo = [];

    // 3. Separa o JSON que veio do banco em listas para o gráfico
    dados.forEach(item => {
      labelsMeses.push(item.mes); // Nome do mês (ex: 'Nov')
      dadosReceitas.push(item.total_receitas);
      dadosDespesas.push(item.total_despesas);
      dadosSaldo.push(item.economia); // Ou 'saldo', dependendo da sua view
    });

    // 4. Cria o gráfico com os dados reais
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labelsMeses, // Meses do banco
        datasets: [
          {
            label: 'Receitas',
            data: dadosReceitas, // Receitas do banco
            borderColor: '#0f5132',
            backgroundColor: '#0f5132',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Despesas',
            data: dadosDespesas, // Despesas do banco
            borderColor: '#dc3545',
            backgroundColor: '#dc3545',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Saldo Geral',
            data: dadosSaldo, // Saldo do banco
            borderColor: '#d9d700',
            backgroundColor: '#d9d700',
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { font: { size: 12, weight: 'bold' }, color: '#000' }
          }
        },
        layout: { padding: 10 },
        scales: { y: { beginAtZero: false } }
      }
    });

  } catch (erro) {
    console.error("Erro ao carregar gráfico:", erro);
  }
}

// Chama a função para rodar
montarGraficoEvolucao();

//  HISTÓRICO DE PERÍODO 
const historico = [
  { mes: 'Nov/2024', receita: 1280, despesa: 600 },
  { mes: 'Dez/2024', receita: 1200, despesa: 800 },
  { mes: 'Jan/2025', receita: 6000, despesa: 3647 },
  { mes: 'Fev/2025', receita: 2500, despesa: 1100 },
  { mes: 'Mar/2025', receita: 1500, despesa: 1000 },
  { mes: 'Abr/2025', receita: 1900, despesa: 1600 },
  { mes: 'Mai/2025', receita: 7000, despesa: 4800 },
  { mes: 'Jun/2025', receita: 3500, despesa: 3200 },
  { mes: 'Jul/2025', receita: 1900, despesa: 2000 },
  { mes: 'Ago/2025', receita: 8000, despesa: 1350 },
  { mes: 'Set/2025', receita: 1500, despesa: 1100 },
  { mes: 'Out/2025', receita: 945, despesa: 840 },

];

const tbody = document.getElementById('tabelaHistorico');

historico.forEach(item => {
  const row = `
    <tr class="text-center">
      <td>${item.mes}</td>
      <td class="text-success fw-bold">R$ ${item.receita}</td>
      <td class="text-danger fw-bold">R$ ${item.despesa}</td>
    </tr>
  `;
  tbody.innerHTML += row;
});



// GRÁFICO DE DESPESAS
const ctxDespesas = document.getElementById('graficoDespesas');
new Chart(ctxDespesas, {
  type: 'pie',
  data: {
    labels: ['Aluguel', 'Alimentação', 'Transporte', 'Lazer'],
    datasets: [{
      data: [35, 25, 20, 20],
      backgroundColor: ['#000dffff', '#228B22', '#f5dc00ff', '#00ffffff']
    }]
  },
  options: {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#000'
        }
      }
    }
  }
});

// GRÁFICO DE RECEITAS 
const ctxReceitas = document.getElementById('graficoReceitas');
new Chart(ctxReceitas, {
  type: 'pie',
  data: {
    labels: ['Salário', 'Freelas', 'Investimentos', 'Outros'],
    datasets: [{
      data: [50, 25, 15, 10],
      backgroundColor: ['#000dffff', '#228B22', '#f5dc00ff', '#00ffffff']
    }]
  },
  options: {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#000'
        }
      }
    }
  }
});

// RECEITAS VS DESPESAS 
const ctxReceitasDespesas = document.getElementById('graficoReceitasDespesas');

new Chart(ctxReceitasDespesas, { // 🔹 aqui usa a mesma variável
  type: 'bar',
  data: {
    labels: ['Receitas', 'Despesas'],
    datasets: [{
      data: [4500, 3200],
      backgroundColor: ['#2e8b57', '#dc3545'],
      barThickness: 15
    }]
  },
  options: {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { display: false } },
      y: {
        ticks: { color: '#013220', font: { size: 14, weight: 'bold' } },
        grid: { display: false }
      }
    }
  }
});



