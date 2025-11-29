// ======================================================
// 1. FUNÇÕES UTILITÁRIAS E DADOS GERAIS
// ======================================================

let dadosIa = {};
function getUsuario() {
  return JSON.parse(localStorage.getItem("usuario"));
}

async function pegarSaldo() {
  const usuario = getUsuario();
  try {
    const resposta = await fetch("/api/saldo", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_usuario: usuario.id })
    });
    const json = await resposta.json();
    return json[0].saldo;
  } catch (error) {
    console.error("Erro ao buscar saldo:", error);
    return 0;
  }
}

async function carregarResumo() {
  const usuario = getUsuario();
  try {
    const resposta = await fetch(`/api/historico/ultimo/${usuario.id}`);
    const dados = await resposta.json();
    return dados;
  } catch (error) {
    console.error("Erro ao buscar resumo:", error);
    return { total_receitas: 0, total_despesas: 0, economia: 0 };
  }
}

// Preenche os números do topo E desenha o gráfico de barras comparativo
async function preencherResumoEGraficoBarra() {
  const dados = await carregarResumo();
  const saldo = await pegarSaldo();

  // 1. Atualiza os textos no HTML
  if (document.getElementById("saldo-atual"))
    document.getElementById("saldo-atual").innerText = Number(saldo).toFixed(2);
  
  if (document.getElementById("receitas-totais"))
    document.getElementById("receitas-totais").innerText = Number(dados.total_receitas).toFixed(2);
  
  if (document.getElementById("despesas-totais"))
    document.getElementById("despesas-totais").innerText = Number(dados.total_despesas).toFixed(2);
  
  if (document.getElementById("economia"))
    document.getElementById("economia").innerText = Number(dados.economia).toFixed(2);

  // 2. Chama o gráfico de barras passando esses valores exatos
  montarGraficoBarras(dados.total_receitas, dados.total_despesas);
}

// Inicia o processo do Resumo
preencherResumoEGraficoBarra();


// ======================================================
// 2. GRÁFICO DE EVOLUÇÃO FINANCEIRA (LINHA)
// ======================================================

async function montarGraficoEvolucao() {
  const usuario = getUsuario();
  const ctx = document.getElementById('graficoEvolucao');

  if (!ctx) return; // Segurança caso não ache o elemento

  try {
    const resposta = await fetch(`/api/grafico/evolucao/${usuario.id}`);
    const dados = await resposta.json();
   
    

    const labelsMeses = [];
    const dadosReceitas = [];
    const dadosDespesas = [];
    const dadosSaldo = [];

    // Organiza os dados retornados do banco
    dados.forEach(item => {
      labelsMeses.push(item.mes);
      dadosIa.mes = item.mes;
      dadosReceitas.push(item.total_receitas);
      dadosIa.receita = item.total_receitas;
      dadosDespesas.push(item.total_despesas);
       dadosIa.despesa = item.total_despesas;
      dadosSaldo.push(item.economia);
      dadosIa.saldo = item.economia;
    });
    

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labelsMeses,
        datasets: [
          {
            label: 'Receitas',
            data: dadosReceitas,
            borderColor: '#0f5132',
            backgroundColor: '#0f5132',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Despesas',
            data: dadosDespesas,
            borderColor: '#dc3545',
            backgroundColor: '#dc3545',
            tension: 0.3,
            fill: false
          },
          {
            label: 'Saldo Geral',
            data: dadosSaldo,
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

    // APROVEITA OS MESMOS DADOS PARA ENCHER A TABELA
    preencherTabelaHistorico(dados);
    

  } catch (erro) {
    console.error("Erro ao carregar gráfico evolução:", erro);
  }
}




// ======================================================
// 3. TABELA DE HISTÓRICO
// ======================================================

function preencherTabelaHistorico(dados) {
  const tbody = document.getElementById('tabelaHistorico');
  if (!tbody) return;

  tbody.innerHTML = ''; // Limpa antes de preencher

  // Dica: Se quiser inverter a ordem (mais recente em cima), use dados.reverse() aqui
  
  dados.forEach(item => {
    const row = `
      <tr class="text-center">
        <td>${item.mes}</td>
        <td class="text-success fw-bold">R$ ${Number(item.total_receitas).toFixed(2)}</td>
        <td class="text-danger fw-bold">R$ ${Number(item.total_despesas).toFixed(2)}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}


// ======================================================
// 4. GRÁFICOS DE PIZZA (CATEGORIAS)
// ======================================================

async function carregarGraficoPizza(tipo, idCanvas) {
  const usuario = getUsuario();
  const ctx = document.getElementById(idCanvas);
  
  if (!ctx) return;

  try {
    const resposta = await fetch(`/api/grafico/categorias/${usuario.id}/${tipo}`);
    const dados = await resposta.json();
    
    
    
    
    if (dados.length === 0) {
        // Se não tiver dados, cria um gráfico vazio ou esconde
        console.log(`Sem dados para o gráfico de ${tipo}`);
        return;
    }
    else
    {
      dadosIa.categorias = dados;
    }

    const labels = dados.map(item => item.nome_categoria);
    const valores = dados.map(item => item.total);
    const cores = ['#000dffff', '#228B22', '#f5dc00ff', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#6610f2'];

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: valores,
          backgroundColor: cores
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { font: { size: 14, weight: 'bold' }, color: '#000' }
          }
        }
      }
    });

  } catch (erro) {
    console.error(`Erro ao carregar gráfico de ${tipo}:`, erro);
  }
}

// Chama as funções
async function incializar() {
await carregarGraficoPizza('despesa', 'graficoDespesas');
await carregarGraficoPizza('receita', 'graficoReceitas');
await montarGraficoEvolucao();
await chamaIa(dadosIa);
}

incializar();



// ======================================================
// 5. GRÁFICO RECEITAS VS DESPESAS (BARRAS) - CORRIGIDO
// ======================================================

// Variável global para guardar a "memória" do gráfico e poder apagar depois
let chartInstanceReceitasDespesas = null;

function montarGraficoBarras(receitaTotal, despesaTotal) {
  const ctx = document.getElementById('graficoReceitasDespesas');
  if (!ctx) return;

  // 1. Debug: Vai aparecer no console do navegador (F12) os valores que chegaram
  console.log("Tentando desenhar gráfico. Receita:", receitaTotal, "Despesa:", despesaTotal);

  // 2. Proteção: Converte para número e, se for nulo, vira Zero.
  const valorReceita = Number(receitaTotal || 0);
  const valorDespesa = Number(despesaTotal || 0);

  // 3. Limpeza: Se já existir um gráfico antigo, destrói ele antes de criar o novo
  if (chartInstanceReceitasDespesas) {
    chartInstanceReceitasDespesas.destroy();
  }

  // 4. Criação do novo gráfico
  chartInstanceReceitasDespesas = new Chart(ctx, { 
    type: 'bar',
    data: {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [valorReceita, valorDespesa], 
        backgroundColor: ['#2e8b57', '#dc3545'],
        barThickness: 30
      }]
    },
    options: {
      indexAxis: 'y', // Barra deitada
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
}

//pegar api
async function chamaIa(dadosIa) {
  
  
  try
  {
    
    const resposta = await fetch("/api/ia", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosIa)
            });

    const json = await resposta.json();
    const sugestao = document.getElementById("sugestao-ia");
    sugestao.innerHTML = json;
  }
  catch(error)
  {
    console.log(error);
  }
}





