//  SALDOS/DESPESAS/RECEITA/ECONOMIA










// GRÁFICOS
// GRÁFICO DE Evolução Financeira 
const ctx = document.getElementById('graficoEvolucao');
new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [
          {
            label: 'Receitas',
            data: [1000, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600],
            borderColor: '#0f5132',
            backgroundColor: '#c',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Despesas',
            data: [800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350],
            borderColor: '#dc3545',
            backgroundColor: '#dc3545',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Saldo Geral',
            data: [200, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250],
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
      labels: {
        font: {
          size: 12, 
          weight: 'bold'
        },
        padding: 20, 
        color: '#000'
      }
    }
  },
  layout: {
    padding: 10 
  },
  scales: {
    y: {
      beginAtZero: false
    }
  }
}

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


//  HISTÓRICO DE PERÍODO 
const historico = [
  { mes: 'Jan/2025', receita: 1200, despesa: 800 },
  { mes: 'Fev/2025', receita: 950, despesa: 1100 },
  { mes: 'Mar/2025', receita: 1500, despesa: 1000 },
  { mes: 'Ago/2025', receita: 1900, despesa: 1600 },
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
