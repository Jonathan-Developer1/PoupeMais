// ============================
// SALDO VISÍVEL / OLHO
// ============================
const saldo = document.getElementById("saldo");
const iconeOlho = document.getElementById("icone-olho");
let saldoVisivel = true;

iconeOlho.addEventListener("click", () => {
    saldoVisivel = !saldoVisivel;
    if (saldoVisivel) {
        saldo.textContent = saldo.getAttribute("data-valor") || "0,00";
        iconeOlho.classList.remove("bi-eye");
        iconeOlho.classList.add("bi-eye-slash");
    } else {
        saldo.textContent = "•••••";
        iconeOlho.classList.remove("bi-eye-slash");
        iconeOlho.classList.add("bi-eye");
    }
});

// ============================
// LOCALSTORAGE / HISTÓRICO
// ============================
const container = document.getElementById("historicoSimulacao");

function getSimulacoes() {
    const simulacoes = localStorage.getItem("simulacoes");
    return simulacoes ? JSON.parse(simulacoes) : [];
}

function salvarSimulacoes(lista) {
    localStorage.setItem("simulacoes", JSON.stringify(lista));
}

function getTipoTexto(tipo) {
    switch(tipo) {
        case "1": return "Redução de despesas";
        case "2": return "Aumento de receitas";
        case "3": return "Investimento com rendimento";
        case "4": return "Meta de economia";
        default: return "Outro";
    }
}

// ============================
// RENDERIZA HISTÓRICO
// ============================
function renderizarHistorico() {
    container.innerHTML = "";
    const lista = getSimulacoes();

    lista.forEach(sim => {
        const div = document.createElement("div");
        div.classList.add("card-item");
        div.innerHTML = `
            <div class="card-text">
                <h4>${sim.nome}</h4>
                <p>Tipo: ${getTipoTexto(sim.tipoSimulacao)}</p>
            </div>
            <div>
                <span class="btn-excluir" style="color:red; cursor:pointer; margin-left:10px;">🗑️</span>
            </div>
        `;

        // Clique no card inteiro (exceto lixeira) exibe simulação
        div.addEventListener("click", (e) => {
            if (!e.target.classList.contains("btn-excluir")) {
                atualizarResultado(sim);
                atualizarGraficoLinha(sim);
                atualizarGraficoPizza(sim);
            }
        });

        // Clique lixeira
        div.querySelector(".btn-excluir").addEventListener("click", (e) => {
            e.stopPropagation();
            excluirSimulacao(sim.id);
        });

        container.appendChild(div);
    });
}

// ============================
// RESULTADO DA SIMULAÇÃO
// ============================
function atualizarResultado(sim) {
    const mensagens = {
        "1": `Se você reduzir ${sim.porcentagem}% das despesas mensais, em ${sim.periodo} meses poderá economizar:`,
        "2": `Se você aumentar ${sim.porcentagem}% das receitas, em ${sim.periodo} meses poderá alcançar:`,
        "3": `Investindo com rendimento de ${sim.porcentagem}% ao mês durante ${sim.periodo} meses, você terá:`,
        "4": `Ao seguir sua meta de economia de ${sim.porcentagem}% por ${sim.periodo} meses, você conseguirá economizar:`
    };

    document.getElementById("resMensagem").textContent = mensagens[sim.tipoSimulacao] || "Resultado da simulação";
    document.getElementById("nomeSimul").textContent = sim.nome;
    document.getElementById("resValor").textContent = sim.dadosLinha[sim.dadosLinha.length - 1].toFixed(2);

    const saldoFinal = sim.saldoInicial + sim.dadosLinha[sim.dadosLinha.length - 1];
    document.getElementById("resTotal").textContent = saldoFinal.toFixed(2);
}

// ============================
// GRÁFICO DE LINHA
// ============================
let graficoLinha;
function atualizarGraficoLinha(sim) {
    const ctx = document.getElementById('grafico-linha1');
    if (graficoLinha) graficoLinha.destroy();

    graficoLinha = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: sim.dadosLinha.length}, (_, i) => i + 1),
            datasets: [{
                label: sim.nome,
                data: sim.dadosLinha,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ============================
// GRÁFICO DE PIZZA
// ============================
let graficoPizza, graficoComparativo;

function atualizarGraficoPizza(sim) {
    const ctx1 = document.getElementById("grafico1");
    const ctx2 = document.getElementById("grafico2"); // segundo canvas

    const saldoInicial = sim.saldoInicial;
    const saldoExtra = sim.dadosLinha[sim.dadosLinha.length - 1];

    if (graficoPizza) graficoPizza.destroy();
    if (graficoComparativo) graficoComparativo.destroy();

    // Gráfico pizza no primeiro canvas
    graficoPizza = new Chart(ctx1, {
        type: "pie",
        data: {
            labels: ["Saldo Inicial", "Ganho da Simulação"],
            datasets: [{
                data: [saldoInicial, saldoExtra],
                backgroundColor: ["#4CAF50", "#FFA500"],
                borderColor: ["#003A14", "#FF8C00"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Exemplo de uso do segundo canvas (comparativo ou outro gráfico)
    graficoComparativo = new Chart(ctx2, {
        type: "pie", 
        data: {
            labels: ["Saldo Inicial", "Ganho da Simulação"],
            datasets: [{
                label: sim.nome,
                data: [saldoInicial, saldoExtra],
                backgroundColor: ["#4CAF50", "#FFA500"]
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    document.getElementById("valorTotal").textContent = `+${(saldoInicial + saldoExtra).toFixed(2)}`;
}


// ============================
// CRIAR SIMULAÇÃO
// ============================
function criarSimulacao() {
    const nome = document.getElementById("nomeSimulacao").value.trim();
    const saldoInicial = parseFloat(document.getElementById("saldoInicial").value.replace(/\D/g, "")) || 0;
    const periodo = parseInt(document.getElementById("periodoSimulacao").value.trim());
    const porcentagem = parseFloat(document.getElementById("porcentagemSimulacao").value.trim());
    const tipo = document.querySelector("input[name='simulacaoTipo']:checked");

    if (!nome || !saldoInicial || !periodo || !porcentagem || !tipo) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const dadosLinha = [];
    let saldoAtual = saldoInicial;
    for (let i = 1; i <= periodo; i++) {
        saldoAtual += saldoAtual * (porcentagem / 100);
        dadosLinha.push(parseFloat(saldoAtual.toFixed(2)));
    }

    const novaSimulacao = {
        id: Date.now(),
        nome,
        saldoInicial,
        periodo,
        porcentagem,
        tipoSimulacao: tipo.value,
        dadosLinha
    };

    const lista = getSimulacoes();
    lista.push(novaSimulacao);
    salvarSimulacoes(lista);

    renderizarHistorico();
    atualizarResultado(novaSimulacao);
    atualizarGraficoLinha(novaSimulacao);
    atualizarGraficoPizza(novaSimulacao);
}

// ============================
// EXCLUIR SIMULAÇÃO
// ============================
function excluirSimulacao(id) {
    let lista = getSimulacoes();
    lista = lista.filter(sim => sim.id !== id);
    salvarSimulacoes(lista);
    renderizarHistorico();

    const resNome = document.getElementById("nomeSimul").textContent;
    if (!lista.find(sim => sim.nome === resNome)) {
        document.getElementById("resMensagem").textContent = "AQUI APARECERÁ O RESULTADO DA SIMULAÇÃO";
        document.getElementById("nomeSimul").textContent = "";
        document.getElementById("resValor").textContent = "0,00";
        document.getElementById("resTotal").textContent = "0,00";
        if (graficoLinha) graficoLinha.destroy();
        if (graficoPizza) graficoPizza.destroy();
        document.getElementById("valorTotal").textContent = "+0,00";
    }
}

// ============================
// EVENTO BOTÃO
// ============================
document.getElementById("botao-simulacao").addEventListener("click", criarSimulacao);

// ============================
// INICIALIZAÇÃO
// ============================
renderizarHistorico();