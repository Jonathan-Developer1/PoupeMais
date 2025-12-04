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
        iconeOlho.classList.replace("bi-eye", "bi-eye-slash");
    } else {
        saldo.textContent = "•••••";
        iconeOlho.classList.replace("bi-eye-slash", "bi-eye");
    }
});

// ============================
// HISTÓRICO DE SIMULAÇÕES
// ============================
const container = document.getElementById("historicoSimulacao");
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = "/";

if (localStorage.length == 0) {
    window.location.href = "/";
}
function getTipoTexto(tipo) {
    switch (tipo.toString()) {
        case "1": return "Juros Compostos";
        case "2": return "Juros Compostos + Aportes";
        case "3": return "Cálculo de Meta";
        default: return "Outro";
    }
}

async function getSimulacoes() {
    try {
        const res = await fetch(`/api/simulacao/listar/${usuario.id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Erro ao buscar simulações:", err);
        return [];
    }
}

async function renderizarHistorico() {
    container.innerHTML = "";
    const lista = await getSimulacoes();

    lista.forEach(sim => {
        sim.saldo_inicial = Number(sim.saldo_inicial) || 0;
        sim.periodo = Number(sim.periodo) || 0;
        sim.porcentagem = Number(sim.porcentagem) || 0;
        sim.aporte = Number(sim.aporte) || 0;
        sim.meta = Number(sim.meta) || 0;
        sim.aporte_necessario = Number(sim.aporte_necessario) || 0;

        // Garantir que dados_linha seja sempre array
        if (!sim.dados_linha || sim.dados_linha === "null") sim.dados_linha = [];
        else if (typeof sim.dados_linha === "string") {
            try { sim.dados_linha = JSON.parse(sim.dados_linha); } 
            catch { sim.dados_linha = []; }
        }
        if (!Array.isArray(sim.dados_linha)) sim.dados_linha = [];
        if (!sim.dados_linha.length) sim.dados_linha = gerarDadosLinha(sim);

        const div = document.createElement("div");
        div.classList.add("card-item");
        div.innerHTML = `
            <div class="card-text">
                <h4>${sim.nome_simulacao}</h4>
                <p>Tipo: ${getTipoTexto(sim.tipo_simulacao)}</p>
            </div>
            <div>
                <span class="bi bi-trash3 btn-excluir" style="cursor:pointer;"></span>
            </div>
        `;

        div.addEventListener("click", e => {
            if (!e.target.classList.contains("btn-excluir")) {
                atualizarResultado(sim);
                atualizarGraficoLinha(sim);
                atualizarGraficoPizza(sim);
            }
        });

        div.querySelector(".btn-excluir").addEventListener("click", e => {
            e.stopPropagation();
            excluirSimulacao(sim.id_simulacao);
        });

        container.appendChild(div);
    });
}

// ============================
// RESULTADO
// ============================
function atualizarResultado(sim) {
    const metaCorrigida = Number(sim.meta) || 0;
    const mensagens = {
        "1": `Investindo com rendimento de ${sim.porcentagem}% ao mês durante ${sim.periodo} meses, você terá:`,
        "2": `Investindo com aporte mensal durante ${sim.periodo} meses, você terá:`,
        "3": `Para alcançar sua meta de R$ ${metaCorrigida}, você precisará investir:`
    };

    document.getElementById("resMensagem").textContent = mensagens[sim.tipo_simulacao];
    document.getElementById("nomeSimul").textContent = sim.nome_simulacao;

    if (sim.tipo_simulacao === 3) {
        document.getElementById("resValor").textContent =
            sim.aporte_necessario <= 0
                ? "Meta já alcançada sem aporte!"
                : sim.aporte_necessario.toFixed(2);
    } else {
        document.getElementById("resValor").textContent =
            sim.dados_linha[sim.dados_linha.length - 1].toFixed(2);
    }

    const saldoFinal = (sim.saldo_inicial || 0) + sim.dados_linha[sim.dados_linha.length - 1];
    document.getElementById("resTotal").textContent = saldoFinal.toFixed(2);
}

// ============================
// GRÁFICOS
// ============================
let graficoLinha, graficoComparativo;

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
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function atualizarGraficoPizza(sim) {
    const ctx2 = document.getElementById("grafico2");
    const saldoInicial = sim.saldo_inicial || 0;
    const saldoExtra = sim.dados_linha[sim.dados_linha.length - 1];

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

    document.getElementById("valorTotal").textContent =
        `+${(saldoInicial + saldoExtra).toFixed(2)}`;
}

// ============================
// FUNÇÕES DE CÁLCULO
// ============================
function calcularJurosCompostos() {
    const P = Number(document.getElementById("saldoInicial").value);
    const i = Number(document.getElementById("porcentagemSimulacao").value) / 100;
    const n = Number(document.getElementById("periodoSimulacao").value);
    const montante = P * Math.pow(1 + i, n);
    document.getElementById("resValor").textContent = montante.toFixed(2);
}

function calcularJurosCompostosAporte() {
    const P = Number(document.getElementById("saldoInicial").value);
    const A = Number(document.getElementById("aporte").value);
    const i = Number(document.getElementById("porcentagemSimulacao").value) / 100;
    const n = Number(document.getElementById("periodoSimulacao").value);
    const fator = Math.pow(1 + i, n);
    const total = P * fator + A * ((fator - 1) / i);
    document.getElementById("resValor").textContent = total.toFixed(2);
}

function calcularAporteNecessario() {
    const P = Number(document.getElementById("saldoInicial").value) || 0;
    const M = Number(document.getElementById("meta").value);
    const i = Number(document.getElementById("porcentagemSimulacao").value) / 100;
    const n = Number(document.getElementById("periodoSimulacao").value);

    let aporte;
    if (i === 0) aporte = (M - P) / n;
    else aporte = (M - P * Math.pow(1 + i, n)) / ((Math.pow(1 + i, n) - 1) / i);

    document.getElementById("resValor").textContent =
        aporte <= 0 ? "Meta já alcançada sem aporte!" : aporte.toFixed(2);

    return aporte;
}

// ============================
// GERAR DADOS LINHA
// ============================
function gerarDadosLinha(sim) {
    const P = sim.saldo_inicial || 0;
    const i = sim.porcentagem / 100;
    const n = sim.periodo;
    let saldoAtual = P;
    const dadosLinha = [];

    let aporteMensal = 0;
    if (sim.tipo_simulacao === "2") aporteMensal = sim.aporte || 0;
    if (sim.tipo_simulacao === "3") aporteMensal = sim.aporte_necessario || 0;

    for (let mes = 1; mes <= n; mes++) {
        saldoAtual = saldoAtual * (1 + i) + aporteMensal;
        dadosLinha.push(parseFloat(saldoAtual.toFixed(2)));
    }

    return dadosLinha;
}

// ============================
// ATUALIZA CAMPOS DEPENDENDO DO TIPO
// ============================
function atualizarCampos() {
    const tipo = document.querySelector("input[name='simulacaoTipo']:checked").value;
    document.getElementById("campoAporte").style.display = "none";
    document.getElementById("campoMeta").style.display = "none";

    if (tipo === "2") document.getElementById("campoAporte").style.display = "block";
    if (tipo === "3") document.getElementById("campoMeta").style.display = "block";
}

document.querySelectorAll("input[name='simulacaoTipo']")
    .forEach(radio => radio.addEventListener("change", atualizarCampos));

// ============================
// EXECUTA SIMULAÇÃO
// ============================
function executarSimulacao() {
    const tipo = document.querySelector("input[name='simulacaoTipo']:checked").value;

    if (tipo === "1") calcularJurosCompostos();
    else if (tipo === "2") calcularJurosCompostosAporte();
    else if (tipo === "3") window.aporteMetaAtual = calcularAporteNecessario();

    criarSimulacao();
}

// ============================
// CRIAR SIMULAÇÃO
// ============================
async function criarSimulacao() {
    const nome = document.getElementById("nomeSimulacao").value.trim();
    const saldoInicial = Number(document.getElementById("saldoInicial").value) || 0;
    const periodo = Number(document.getElementById("periodoSimulacao").value);
    const porcentagem = Number(document.getElementById("porcentagemSimulacao").value);
    const tipo = document.querySelector("input[name='simulacaoTipo']:checked").value;
    const aporte = Number(document.getElementById("aporte")?.value || 0);
    const meta = tipo === "3" ? Number(document.getElementById("meta")?.value || 0) : 0;

    if (!nome || (!saldoInicial && tipo !== "3") || !periodo || !porcentagem) {
        alert("Preencha todos os campos obrigatórios!");
    }

    let aporte_necessario = tipo === "3" ? window.aporteMetaAtual || calcularAporteNecessario() : 0;

    const novaSimulacaoDB = {
        nome_simulacao: nome,
        saldo_inicial: saldoInicial,
        periodo,
        porcentagem,
        tipo_simulacao: tipo,
        aporte: tipo === "2" ? aporte : 0,
        meta,
        aporte_necessario,
        dados_linha: JSON.stringify(gerarDadosLinha({
            saldo_inicial: saldoInicial,
            periodo,
            porcentagem,
            tipo_simulacao: tipo,
            aporte: tipo === "2" ? aporte : 0,
            meta,
            aporte_necessario
        })),
        id_usuario: usuario.id
    };

    try {
        const res = await fetch("/api/simulacao/salvar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaSimulacaoDB)
        });
        const novaSimulacaoSalva = await res.json();
     // Recebe simulação salva com id_simulacao real

         Swal.fire({
            icon: "success",
            title: "Simulação criada!",
            text: "A simulação foi registrada com sucesso.",
            timer: 2000,
            showConfirmButton: false
        });

        // Atualiza histórico completo
        await renderizarHistorico();
        atualizarResultado(novaSimulacaoSalva);
        atualizarGraficoLinha(novaSimulacaoSalva);
        atualizarGraficoPizza(novaSimulacaoSalva);

        // Resetar campos
        document.getElementById("nomeSimulacao").value = "";
        document.getElementById("saldoInicial").value = "";
        document.getElementById("periodoSimulacao").value = "";
        document.getElementById("porcentagemSimulacao").value = "";
        document.getElementById("aporte").value = "";
        document.getElementById("meta").value = "";
        atualizarCampos();
    } catch (err) {
        console.error("Erro ao salvar simulação:", err);
    }
}

// ============================
// EXCLUIR SIMULAÇÃO
// ============================
async function excluirSimulacao(id) {
    if (!confirm("Deseja realmente excluir esta simulação?")) return;

    try {
        const res = await fetch("/api/simulacao/excluir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_simulacao: id })
        });

        const data = await res.json();
        if (data.sucesso) {
            await renderizarHistorico();
        } else {
            alert("Erro ao excluir simulação!");
            console.error(data.erro);
        }
    } catch (err) {
        console.error("Erro ao excluir simulação:", err);
        alert("Erro ao excluir simulação!");
    }
}

// ============================
// EVENTO BOTÃO
// ============================
document.getElementById("botao-simulacao").addEventListener("click", executarSimulacao);

// ============================
// INICIALIZAÇÃO
// ============================
window.onload = () => {
    atualizarCampos();
    renderizarHistorico();
}
