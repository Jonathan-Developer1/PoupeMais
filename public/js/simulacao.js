//Animação do olho para o saldo
const saldo = document.getElementById("saldo");
const iconeOlho = document.getElementById("icone-olho");
const saldoAtual = saldo.textContent;

let saldoVisivel = true;

iconeOlho.addEventListener("click", () => {
    saldoVisivel = !saldoVisivel;

    if (saldoVisivel) {
        saldo.textContent = saldoAtual;
        iconeOlho.classList.remove("bi-eye");
        iconeOlho.classList.add("bi-eye-slash");
    } else {
        saldo.textContent = "•••••";
        iconeOlho.classList.remove("bi-eye-slash");
        iconeOlho.classList.add("bi-eye");
    }
});










// Exemplo: salvar e carregar simulações (temporariamente)

const container = document.getElementById("historicoSimulacao");

// Carregar simulações salvas (string separada por ;)
let simulacoes = localStorage.getItem("simulacoes");
let lista = simulacoes ? simulacoes.split(";") : [];

// Exibir simulações na tela
function renderizarHistorico() {
  container.innerHTML = "";
  lista.forEach(item => {
    if (item.trim() !== "") {
      const div = document.createElement("div");
      div.classList.add("card-item");
      div.innerHTML = `
        <div class="card-text">
          <h4>${item}</h4>
        </div>
        <span>›</span>
      `;
      container.appendChild(div);
    }
  });
}

// Adicionar nova simulação
function adicionarSimulacao(nome) {
  lista.push(nome);
  localStorage.setItem("simulacoes", lista.join(";"));
  renderizarHistorico();
}

// Inicializa
renderizarHistorico();

// Exemplo de uso (botão fictício)
document.getElementById("btnAdd").addEventListener("click", () => {
  const nome = prompt("Nome da simulação:");
  if (nome) adicionarSimulacao(nome);
});

