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

//Categorias para receita e despesa
const tipoSelect = document.getElementById("tipo");
const categoriaSelect = document.getElementById("categoria");

const categorias = {
    receita: ["Salário", "Comissão", "Freelance", "Aluguel", "Venda", "Investimentos", "Juros", "Dividendos", "Herança", "Outros"],
    despesa: ["Aluguel", "Condomínio", "Água", "Luz", "Gás", "Cartão", "Alimentação", "Transporte", "Plano de Saúde", "Financiamento", "Lazer", "Outros"]
};

tipoSelect.addEventListener("change", () => {
    const tipoSelecionado = tipoSelect.value;

    // Limpa as opções anteriores
    categoriaSelect.innerHTML = '<option value="" selected disabled>Inserir categoria</option>';

    // Adiciona as novas opções conforme o tipo
    if (tipoSelecionado && categorias[tipoSelecionado]) {
        categorias[tipoSelecionado].forEach(cat => {
            const option = document.createElement("option");
            option.textContent = cat;
            option.value = cat.toLowerCase();
            categoriaSelect.appendChild(option);
        });
    }
});
