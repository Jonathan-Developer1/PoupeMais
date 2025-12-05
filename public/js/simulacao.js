// ============================
// SALDO VISÍVEL / OLHO
// ============================
const saldo = document.getElementById("saldo");
const iconeOlho = document.getElementById("icone-olho");
let saldoVisivel = true;

iconeOlho.addEventListener("click", () => {
    saldoVisivel = !saldoVisivel;
    if (saldoVisivel) {
        // se tiver um data-valor, mostra; caso contrário "0,00"
        saldo.textContent = saldo.getAttribute("data-valor") ?? "0,00";
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



function getTipoTexto(tipo) {
    switch (tipo?.toString()) {
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
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Erro ao buscar simulações:", err);
        await Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível carregar o histórico de simulações.'
        });
        return [];
    }
}

function normalizarSim(sim) {
    sim.saldo_inicial = Number(sim.saldo_inicial) || 0;
    sim.porcentagem = Number(sim.porcentagem ?? sim.porcentagemSimulacao) || 0;
    sim.periodo = Number(sim.periodo) || 0;
    sim.aporte = Number(sim.aporte) || 0;
    sim.meta = Number(sim.meta) || 0;
    sim.aporte_necessario = Number(sim.aporte_necessario) || 0;

    if (!sim.dados_linha || sim.dados_linha === "null") sim.dados_linha = [];
    else if (typeof sim.dados_linha === "string") {
        try { sim.dados_linha = JSON.parse(sim.dados_linha); }
        catch { sim.dados_linha = []; }
    }
    if (!Array.isArray(sim.dados_linha)) sim.dados_linha = [];

    // se ainda vazio, gera com base nos campos atuais
    if (!sim.dados_linha.length) {
        sim.dados_linha = gerarDadosLinha({
            saldo_inicial: sim.saldo_inicial,
            porcentagem: sim.porcentagem,
            periodo: sim.periodo,
            tipo_simulacao: sim.tipo_simulacao ?? sim.tipo,
            aporte: sim.aporte,
            aporte_necessario: sim.aporte_necessario
        });
    }

    return sim;
}

async function renderizarHistorico() {
    container.innerHTML = "";
    const lista = await getSimulacoes();

    lista.forEach(rawSim => {
        const sim = normalizarSim(rawSim);

        const div = document.createElement("div");
        div.classList.add("card-item");
        div.innerHTML = `
            <div class="card-text">
                <h4>${sim.nome_simulacao ?? 'Sem nome'}</h4>
                <p>Tipo: ${getTipoTexto(sim.tipo_simulacao ?? sim.tipo)}</p>
            </div>
            <div>
                <span class="bi bi-trash3 btn-excluir" style="cursor:pointer;" title="Excluir"></span>
            </div>
        `;

        div.addEventListener("click", e => {
            if (!e.target.classList.contains("btn-excluir")) {
                atualizarResultado(sim);
                atualizarGraficoLinha(sim);
                atualizarGraficoPizza(sim);
            }
        });

        // excluir
        div.querySelector(".btn-excluir").addEventListener("click", async e => {
            e.stopPropagation();
            const result = await Swal.fire({
                title: 'Confirmar exclusão?',
                text: 'Deseja realmente excluir esta simulação?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Excluir',
                cancelButtonText: 'Cancelar'
            });
            if (result.isConfirmed) {
                excluirSimulacao(sim.id_simulacao ?? sim.id);
            }
        });

        container.appendChild(div);
    });

    
    if (lista.length > 0) {
        const first = normalizarSim(lista[0]);
        atualizarResultado(first);
        atualizarGraficoLinha(first);
        atualizarGraficoPizza(first);
    }
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

    document.getElementById("resMensagem").textContent = mensagens[sim.tipo_simulacao ?? sim.tipo] ?? mensagens["1"];
    document.getElementById("nomeSimul").textContent = sim.nome_simulacao ?? '';

    if ((sim.tipo_simulacao ?? sim.tipo) == "3") {
        document.getElementById("resValor").textContent =
            sim.aporte_necessario <= 0
                ? "Meta já alcançada sem aporte!"
                : Number(sim.aporte_necessario).toFixed(2);
    } else {
        const last = sim.dados_linha[sim.dados_linha.length - 1] || 0;
        document.getElementById("resValor").textContent = Number(last).toFixed(2);
    }

    const saldoFinal = (sim.saldo_inicial || 0) + ((sim.dados_linha[sim.dados_linha.length - 1]) || 0);
    document.getElementById("resTotal").textContent = Number(saldoFinal).toFixed(2);
}

// ============================
// GRÁFICOS
// ============================
let graficoLinha, graficoComparativo;

function atualizarGraficoLinha(sim) {
    const ctx = document.getElementById('grafico-linha1');
    if (!ctx) return;
    if (graficoLinha) graficoLinha.destroy();

    graficoLinha = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: sim.dados_linha.length }, (_, i) => i + 1),
            datasets: [{
                label: sim.nome_simulacao ?? '',
                data: sim.dados_linha.map(x => Number(x) || 0),
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
    if (!ctx2) return;
    const saldoInicial = Number(sim.saldo_inicial) || 0;
    const saldoExtra = Number(sim.dados_linha[sim.dados_linha.length - 1]) || 0;

    if (graficoComparativo) graficoComparativo.destroy();

    graficoComparativo = new Chart(ctx2, {
        type: "pie",
        data: {
            labels: ["Saldo Inicial", "Ganho da Simulação"],
            datasets: [{
                label: sim.nome_simulacao ?? '',
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
    const total = P * fator + A * ((fator - 1) / (i === 0 ? 1 : i));
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
    
    const P = Number(sim.saldo_inicial ?? sim.saldoInicial) || 0;
    const i = Number(sim.porcentagem ?? sim.porcentagemSimulacao) / 100 || 0;
    const n = Number(sim.periodo) || 0;
    let saldoAtual = P;
    const dadosLinha = [];

    let aporteMensal = 0;
    const tipo = (sim.tipo_simulacao ?? sim.tipo)?.toString();
    if (tipo === "2") aporteMensal = Number(sim.aporte) || 0;
    if (tipo === "3") aporteMensal = Number(sim.aporte_necessario) || 0;

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
    const tipo = document.querySelector("input[name='simulacaoTipo']:checked")?.value;
    document.getElementById("campoAporte").style.display = "none";
    document.getElementById("campoMeta").style.display = "none";

    if (tipo === "2") document.getElementById("campoAporte").style.display = "block";
    if (tipo === "3") document.getElementById("campoMeta").style.display = "block";
}

document.querySelectorAll("input[name='simulacaoTipo']")
    .forEach(radio => radio.addEventListener("change", atualizarCampos));

// ============================
// VALIDAÇÃO (permite saldo 0)
// ============================
function validarFormulario({ nome, saldoInicial, periodo, porcentagem, tipo }) {
    
    if (!nome) {
        Swal.fire({ icon: "warning", title: "Campos obrigatórios", text: "Preencha o nome da simulação!" });
        return false;
    }
    
    if (!periodo || isNaN(periodo) || Number(periodo) <= 0) {
        Swal.fire({ icon: "warning", title: "Campos obrigatórios", text: "Preencha um período válido!" });
        return false;
    }
    if (!porcentagem && porcentagem !== 0) {
        Swal.fire({ icon: "warning", title: "Campos obrigatórios", text: "Preencha a porcentagem!" });
        return false;
    }
    
    if (saldoInicial === "" || saldoInicial === null || isNaN(Number(saldoInicial))) {
        // permitir saldo 0
        Swal.fire({ icon: "warning", title: "Campos obrigatórios", text: "Preencha um saldo inicial válido (0 é permitido)!" });
        return false;
    }
    
    if (tipo === "2") {
        const aporte = Number(document.getElementById("aporte")?.value);
        if (isNaN(aporte)) {
            Swal.fire({ icon: "warning", title: "Campos obrigatórios", text: "Preencha um aporte válido!" });
            return false;
        }
    }
    if (tipo === "3") {
        const meta = Number(document.getElementById("meta")?.value);
        if (!meta || isNaN(meta)) {
            Swal.fire({ icon: "warning", title: "Campos obrigatórios", text: "Preencha a meta!" });
            return false;
        }
    }

    return true;
}

// ============================
// EXECUTA SIMULAÇÃO (valida antes)
// ============================
async function executarSimulacao() {
    const tipo = document.querySelector("input[name='simulacaoTipo']:checked")?.value;
    const nome = document.getElementById("nomeSimulacao").value.trim();
    const saldoInicial = document.getElementById("saldoInicial").value;
    const periodo = Number(document.getElementById("periodoSimulacao").value);
    const porcentagem = Number(document.getElementById("porcentagemSimulacao").value);

    const valido = validarFormulario({ nome, saldoInicial, periodo, porcentagem, tipo });
    if (!valido) return; // não prossegue se inválido

    // calcula o resultado para exibir
    if (tipo === "1") calcularJurosCompostos();
    else if (tipo === "2") calcularJurosCompostosAporte();
    else if (tipo === "3") window.aporteMetaAtual = calcularAporteNecessario();

    // só agora cria a simulação (após validação)
    await criarSimulacao();
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

    // segurança extra: valida novamente
    if (!validarFormulario({ nome, saldoInicial, periodo, porcentagem, tipo })) return;

    let aporte_necessario = tipo === "3" ? (window.aporteMetaAtual || calcularAporteNecessario()) : 0;

    const dadosSimulacaoParaGerar = {
        saldo_inicial: saldoInicial,
        periodo,
        porcentagem,
        tipo_simulacao: tipo,
        aporte,
        meta,
        aporte_necessario
    };

    const novaSimulacaoDB = {
        nome_simulacao: nome,
        saldo_inicial: saldoInicial,
        periodo,
        porcentagem,
        tipo_simulacao: tipo,
        aporte: tipo === "2" ? aporte : 0,
        meta,
        aporte_necessario,
        dados_linha: JSON.stringify(gerarDadosLinha(dadosSimulacaoParaGerar)),
        id_usuario: usuario.id
    };

    try {
        const res = await fetch("/api/simulacao/salvar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaSimulacaoDB)
        });

        if (!res.ok) throw new Error(`Erro ao salvar: ${res.status}`);

        const novaSimulacaoSalva = await res.json();

        // Normalizar retorno antes de usar
        const simNormalizada = normalizarSim({
            ...novaSimulacaoDB,
            ...novaSimulacaoSalva
        });

        await Swal.fire({
            icon: "success",
            title: "Simulação criada!",
            text: "A simulação foi registrada com sucesso.",
            timer: 1500,
            showConfirmButton: false
        });

        // Atualiza histórico completo e exibe a simulação recém-salva
        await renderizarHistorico();
        atualizarResultado(simNormalizada);
        atualizarGraficoLinha(simNormalizada);
        atualizarGraficoPizza(simNormalizada);

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
        await Swal.fire({ icon: "error", title: "Erro", text: "Não foi possível salvar a simulação." });
    }
}

// ============================
// EXCLUIR SIMULAÇÃO
// ============================
async function excluirSimulacao(id) {
    try {
        const res = await fetch("/api/simulacao/excluir", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_simulacao: id })
        });

        if (!res.ok) throw new Error(`Erro ao excluir: ${res.status}`);
        const data = await res.json();
        if (data.sucesso) {
            await renderizarHistorico();
            await Swal.fire({ icon: "success", title: "Excluído", text: "Simulação excluída." });
        } else {
            console.error(data.erro);
            await Swal.fire({ icon: "error", title: "Erro", text: "Não foi possível excluir a simulação." });
        }
    } catch (err) {
        console.error("Erro ao excluir simulação:", err);
        await Swal.fire({ icon: "error", title: "Erro", text: "Erro ao excluir simulação!" });
    }
}

// ============================
// EVENTO BOTÃO
// ============================
document.getElementById("botao-simulacao").addEventListener("click", executarSimulacao);

// ============================
// INICIALIZAÇÃO
// ============================
window.addEventListener('DOMContentLoaded', () => {
    atualizarCampos();
    renderizarHistorico();
});
