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
// HISTÓRICO
// ============================
const container = document.getElementById("historicoSimulacao");
const usuario = JSON.parse(localStorage.getItem('usuario'));
//verificando se existe um usuário

if (localStorage.length == 0) {
    window.location.href = "/";
}
function getTipoTexto(tipo) {
    switch (tipo.toString()) {
        case "1": return "Redução de despesas";
        case "2": return "Aumento de receitas";
        case "3": return "Investimento com rendimento";
        case "4": return "Meta de economia";
        default: return "Outro";
    }
}
async function getSimulacoes() {
    try {
        const res = await fetch(`/api/simulacao/listar/${usuario.id}`);
        return await res.json();
    } catch (err) {
        console.error("Erro ao buscar simulações:", err);
        return [];
    }
}

// ============================
// RENDERIZA HISTÓRICO
// ============================
async function renderizarHistorico() {
    container.innerHTML = "";
    const lista = await getSimulacoes();

    lista.forEach(sim => {
        const div = document.createElement("div");
        div.classList.add("card-item");
        div.innerHTML = `
            <div class="card-text">
                <h4>${sim.nome_simulacao}</h4>
                <p>Tipo: ${getTipoTexto(sim.tipo_simulacao)}</p>
            </div>
            <div>
                <span class="bi bi-trash3 btn-excluir" cursor:pointer; margin-left:10px;"></span>
            </div>
        `;

        // Clique no card inteiro (exceto lixeira) exibe simulação
        div.addEventListener("click", (e) => {
            if (!e.target.classList.contains("btn-excluir")) {
                // Se dados_linha não existir, calcula
                if (!sim.dados_linha) {
                    const dadosLinha = [];
                    let saldoAtual = sim.saldo_inicial;
                    for (let i = 1; i <= sim.periodo; i++) {
                        saldoAtual += saldoAtual * (sim.porcentagem / 100);
                        dadosLinha.push(parseFloat(saldoAtual.toFixed(2)));
                    }
                    sim.dados_linha = dadosLinha;
                }

                atualizarResultado(sim);
                atualizarGraficoLinha(sim);
                atualizarGraficoPizza(sim);
            }
        });

        // Clique lixeira
        div.querySelector(".btn-excluir").addEventListener("click", (e) => {
            e.stopPropagation();
            excluirSimulacao(sim.id_simulacao);
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

    document.getElementById("resMensagem").textContent = mensagens[sim.tipo_simulacao] || "Resultado da simulação";
    document.getElementById("nomeSimul").textContent = sim.nome_simulacao;
    document.getElementById("resValor").textContent = sim.dados_linha[sim.dados_linha.length - 1].toFixed(2);

    const saldoFinal = sim.saldo_inicial + sim.dados_linha[sim.dados_linha.length - 1];
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
            labels: Array.from({ length: sim.dados_linha.length }, (_, i) => i + 1),
            datasets: [{
                label: sim.nome_simulacao,
                data: sim.dados_linha,
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
    const ctx2 = document.getElementById("grafico2");

    const saldoInicial = sim.saldo_inicial;
    const saldoExtra = sim.dados_linha[sim.dados_linha.length - 1];

    if (graficoPizza) graficoPizza.destroy();
    if (graficoComparativo) graficoComparativo.destroy();

    graficoComparativo = new Chart(ctx2, {
        type: "pie",
        data: {
            labels: ["Saldo Inicial", "Ganho da Simulação"],
            datasets: [{
                label: sim.nome_simulacao,
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
async function criarSimulacao() {
    const nome = document.getElementById("nomeSimulacao").value.trim();
    const saldoInicial = parseFloat(document.getElementById("saldoInicial").value.replace(/\D/g, "")) || 0;
    const periodo = parseInt(document.getElementById("periodoSimulacao").value.trim());
    const porcentagem = parseFloat(document.getElementById("porcentagemSimulacao").value.trim());
    const tipo = document.querySelector("input[name='simulacaoTipo']:checked");

    if (!nome || !saldoInicial || !periodo || !porcentagem || !tipo) {
        Swal.fire({
            icon: "warning",
            title: "Campos obrigatórios",
            text: "Preencha todos os campos!",
        });
        return;
    }

    const dadosLinha = [];
    let saldoAtual = saldoInicial;
    for (let i = 1; i <= periodo; i++) {
        saldoAtual += saldoAtual * (porcentagem / 100);
        dadosLinha.push(parseFloat(saldoAtual.toFixed(2)));
    }

    const novaSimulacao = {
        nome_simulacao: nome,
        saldo_inicial: saldoInicial,
        periodo,
        porcentagem,
        tipo_simulacao: tipo.value,
        dados_linha: dadosLinha,
        id_usuario: usuario.id
    };

    try {
        const res = await fetch("/api/simulacao/salvar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaSimulacao)
        });

        const simSalva = await res.json(); // Recebe simulação salva com id_simulacao real

         Swal.fire({
            icon: "success",
            title: "Simulação criada!",
            text: "A simulação foi registrada com sucesso.",
            timer: 2000,
            showConfirmButton: false
        });

        // Atualiza histórico completo
        await renderizarHistorico();

        // Atualiza gráficos e resultado usando dados do backend
        atualizarResultado({ ...novaSimulacao, id_simulacao: simSalva.id_simulacao });
        atualizarGraficoLinha({ ...novaSimulacao, id_simulacao: simSalva.id_simulacao });
        atualizarGraficoPizza({ ...novaSimulacao, id_simulacao: simSalva.id_simulacao });

    } catch (err) {
        console.error("Erro ao salvar simulação:", err);
    }
}

// ============================
// EXCLUIR SIMULAÇÃO 
// ============================
async function excluirSimulacao(id) {
    try {
        await fetch("/api/simulacao/excluir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_simulacao: id })
        });

        await renderizarHistorico();

        const resNome = document.getElementById("nomeSimul").textContent;
        if (!document.querySelector(`#historicoSimulacao div:contains("${resNome}")`)) {
            document.getElementById("resMensagem").textContent = "AQUI APARECERÁ O RESULTADO DA SIMULAÇÃO";
            document.getElementById("nomeSimul").textContent = "";
            document.getElementById("resValor").textContent = "0,00";
            document.getElementById("resTotal").textContent = "0,00";
            if (graficoLinha) graficoLinha.destroy();
            if (graficoPizza) graficoPizza.destroy();
            document.getElementById("valorTotal").textContent = "+0,00";
        }

    } catch (err) {
        console.error("Erro ao excluir simulação:", err);
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
