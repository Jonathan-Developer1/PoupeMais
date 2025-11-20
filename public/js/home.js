//const API_URL_CADASTRO = 'http://localhost:5000/api/transacoes'; //MUDAR PARA A ROTA CORRETA DO BANCO DE DASDOS
import { cadastrarTransacao } from "./cadastro.js";


const button = document.getElementById("botao-cadastro");
const tabelaUltimas = document.getElementById("tabela-ultimas");
let array = [];
let arrayUltima = [];

const categorias = {
    receita: [
        { id: 1, nome: "Salário" },
        { id: 2, nome: "Comissão" },
        { id: 3, nome: "Aluguel" },
        { id: 4, nome: "Venda" },
        { id: 5, nome: "Investimentos" },
        { id: 6, nome: "Juros" },
        { id: 7, nome: "Dividendos" },
        { id: 8, nome: "Herança" },
        { id: 9, nome: "Outros" },
        { id: 10, nome: "Freelance" }
    ],
    despesa: [
        { id: 11, nome: "Aluguel" },
        { id: 13, nome: "Condomínio" },
        { id: 14, nome: "Água" },
        { id: 12, nome: "Luz" },
        { id: 15, nome: "Alimentação" },
        { id: 16, nome: "Lazer" },
        { id: 17, nome: "Gás" },
        { id: 18, nome: "Cartão" },
        { id: 19, nome: "Transporte" },
        { id: 20, nome: "Plano de Saude" },
        { id: 22, nome: "Outros" },
        { id: 21, nome: "Financiamento" }
    ]
};


let usuario = JSON.parse(localStorage.getItem('usuario'));
let saldoUsuario = await pegarSaldo();
const data = document.getElementById("data-transacao")

if(data)
data.valueAsDate = new Date();

window.atualizaValor = async function atualizaValor(transacao_id) {
    try {
        const resposta = await fetch("/api/valor", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_transacao: transacao_id })
        });

        const json = await resposta.json();
        
        console.log(json.dados[0])
        if (json) {
            const respostaSaldo = await fetch("/api/saldo/atualizar", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dados: json.dados[0], id_usuario: usuario.id })
            });

            const jsonSaldo = await respostaSaldo.json();
            

            if (jsonSaldo.sucesso) {
                saldoUsuario = await pegarSaldo();
                animacaoOlho();
               
            } else {
                console.log("erro");
            }
        }

    } catch (erro) {
        console.error('Erro de rede ou na requisição:', erro);
    }
}


async function pegarSaldo(){
    try
    {
        const resposta = await fetch("/api/saldo", 
            {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ id_usuario: usuario.id })
            })
            const json = await resposta.json()

            if(json)
            {
                return json[0].saldo;
                
            }
             else {
                // Tenta ler o erro do corpo da resposta JSON
                alert(`ERRO ao cadastrar (Status ${resposta.status}): ${json.message || resposta.statusText}`);
            }

        } catch (erro) {
            console.error('Erro de rede ou na requisição:', erro);
        }
    
}


listarTransacoes();
animacaoOlho();
pegarSaldo();



// Função para pegar o nome da categoria pelo id
function getNomeCategoria(tipo, id) {
    const lista = categorias[tipo];
    const categoriaEncontrada = lista.find(c => c.id == id);
    return categoriaEncontrada ? categoriaEncontrada.nome : "Desconhecido";
}

//Animação do olho para o saldo
function animacaoOlho()
{
const iconeOlho = document.getElementById("icone-olho");
const saldo = document.getElementById('saldo');

let saldoVisivel = true;
saldo.textContent = saldoUsuario;

iconeOlho.addEventListener("click", () => {
    saldoVisivel = !saldoVisivel;

    if (saldoVisivel) {
        saldo.textContent = saldoUsuario;
        iconeOlho.classList.remove("bi-eye");
        iconeOlho.classList.add("bi-eye-slash");
    } else {
        saldo.textContent = "•••••";
        iconeOlho.classList.remove("bi-eye-slash");
        iconeOlho.classList.add("bi-eye");
    }
});
}


const tipoSelect = document.getElementById("tipo");
const categoriaSelect = document.getElementById("categoria");

async function listarTransacoes() {
    try {
        const resposta = await fetch(`/api/transacoes/${usuario.id}`);
        const json = await resposta.json();

        if (json) {
            // Ajusta os objetos para incluir o nome da categoria antes de enviar para cadastrarTransacao
            const jsonAjustado = json.map(e => ({
                ...e,
                categoria: getNomeCategoria(e.tipo, e.id_categoria)
            }));
            cadastrarTransacao(jsonAjustado);
        } else {
            alert("Erro ao carregar transações");
        }

    } catch (erro) {
        console.error("Erro ao buscar transações:", erro);
    }
}



if (tipoSelect && categoriaSelect) {
    tipoSelect.addEventListener("change", () => {
        const tipoSelecionado = tipoSelect.value;


        categoriaSelect.innerHTML = '<option value="" selected disabled>Inserir categoria</option>';

        // Adiciona as novas opções conforme o tipo
        if (tipoSelecionado && categorias[tipoSelecionado]) {
            categorias[tipoSelecionado].forEach(cat => {
                const option = document.createElement("option");
                option.textContent = cat.nome;
                option.value = cat.id; // AGORA ENVIA O ID CORRETO
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
            id_usuario: usuario.id,
            // IDs do HTML modificado:
            nome: document.getElementById("descricao-transacao").value,
            tipo: document.getElementById("tipo").value,
            categoria: document.getElementById("categoria").value,
            // Certifique-se de que o input seja do tipo 'number' no HTML para garantir o valor
            valor: parseFloat(document.getElementById("valor-transacao").value),
            parcelas: parseFloat(document.getElementById("parcelas").value),
            data: document.getElementById("data-transacao").value // yyyy-mm-dd
        };

        try {
            // 2. Envio dos dados para a API (Backend)
            const resposta = await fetch("/api/transacao", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transacao)
            });

            const json = await resposta.json();
            // 3. Verifica o status da resposta
            if (json.sucesso) {
                listarTransacoes();
                data.valueAsDate = new Date();
                alert("Transação cadastrada com sucesso!");
                formCadastro.reset(); // Limpa o formulário
                // Garante que o select de categoria volte ao estado inicial (disabled)
                categoriaSelect.innerHTML = '<option value="" selected disabled>Inserir categoria</option>';


            } else {
                // Tenta ler o erro do corpo da resposta JSON
                alert(`ERRO ao cadastrar (Status ${resposta.status}): ${json.message || resposta.statusText}`);
            }

        } catch (erro) {
            console.error('Erro de rede ou na requisição:', erro);
        }
    });
}

window.excluirTransacao = async function excluirTransacao(id_transacao) {
    
    try
    {
        const resposta = await fetch("/api/excluir",{
            method: 'POST',
            headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ transacao_id: id_transacao })
            });

        const json = await resposta.json();
        console.log(json);

        if(json.sucesso)
        {
            listarTransacoes();
        }
        
    }
    catch(error)
{
    console.log(error);
}
}
