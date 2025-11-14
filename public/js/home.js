const API_URL_CADASTRO = 'http://localhost:5000/api/transacoes'; //MUDAR PARA A ROTA CORRETA DO BANCO DE DASDOS

const categorias = {
    receita: ["Salário", "Comissão", "Freelance", "Aluguel", "Venda", "Investimentos", "Juros", "Dividendos", "Herança", "Outros"],
    despesa: ["Aluguel", "Condomínio", "Água", "Luz", "Gás", "Cartão", "Alimentação", "Transporte", "Plano de Saúde", "Financiamento", "Lazer", "Outros"]
};




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



const tipoSelect = document.getElementById("tipo");
const categoriaSelect = document.getElementById("categoria");

if (tipoSelect && categoriaSelect) {
    tipoSelect.addEventListener("change", () => {
        const tipoSelecionado = tipoSelect.value;

        
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
}



// ENVIO DO CADASTRO PARA O BACKEND (API)


const formCadastro = document.getElementById("formCadastroTransacao");

if (formCadastro) {
    formCadastro.addEventListener("submit", async (evento) => {
        evento.preventDefault(); // Impede o envio padrão do formulário

        // 1. Coleta e mapeamento dos dados do formulário
        const transacao = {
            // IDs do HTML modificado:
            descricao: document.getElementById("descricao-transacao").value,
            tipo: document.getElementById("tipo").value,
            categoria: document.getElementById("categoria").value,
            // Certifique-se de que o input seja do tipo 'number' no HTML para garantir o valor
            valor: parseFloat(document.getElementById("valor-transacao").value), 
            data: document.getElementById("data-transacao").value // yyyy-mm-dd
        };

        try {
            // 2. Envio dos dados para a API (Backend)
            const resposta = await fetch(API_URL_CADASTRO, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(transacao) 
            });

            // 3. Verifica o status da resposta
            if (resposta.ok) {
                alert("Transação cadastrada com sucesso!");
                formCadastro.reset(); // Limpa o formulário
                // Garante que o select de categoria volte ao estado inicial (disabled)
                categoriaSelect.innerHTML = '<option value="" selected disabled>Inserir categoria</option>'; 
                

            } else {
                // Tenta ler o erro do corpo da resposta JSON
                const erro = await resposta.json();
                alert(`ERRO ao cadastrar (Status ${resposta.status}): ${erro.message || resposta.statusText}`);
            }

        } catch (erro) {
            console.error('Erro de rede ou na requisição:', erro);
            alert("Não foi possível conectar ao servidor. Verifique se a API está rodando em " + API_URL_CADASTRO);
        }
    });
}