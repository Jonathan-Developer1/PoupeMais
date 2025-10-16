// ======== SALDOS/DESPESAS/RECEITA/ECONOMIA =========










// ======== GRÁFICOS =========
// ======== GRÁFICO DE Evolução Financeira =========
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
            size: 16,       
            weight: 'bold'  
          },
          padding: 50,      
          color: '#000'     
        }
      }
    },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });

   // ======== GRÁFICO DE DESPESAS =========
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

// ======== GRÁFICO DE RECEITAS =========
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
