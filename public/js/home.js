
//const API_URL_CADASTRO = 'http://localhost:5000/api/transacoes'; //MUDAR PARA A ROTA CORRETA DO BANCO DE DASDOS
import { cadastrarTransacao } from "./cadastro.js";


const button = document.getElementById("botao-cadastro");
const tabelaUltimas = document.getElementById("tabela-ultimas");
let array = [];
let arrayUltima = [];

const categorias = {
    receita: ["Salário", "Comissão", "Freelance", "Aluguel", "Venda", "Investimentos", "Juros", "Dividendos", "Herança", "Outros"],
    despesa: ["Aluguel", "Condomínio", "Água", "Luz", "Gás", "Cartão", "Alimentação", "Transporte", "Plano de Saúde", "Financiamento", "Lazer", "Outros"]
};



let usuario = JSON.parse(localStorage.getItem('usuario'));
let saldoUsuario = await pegarSaldo();
const data = document.getElementById("data-transacao")

data.valueAsDate = new Date();

async function atualizaValor(transacao_id)
{
   try{
      const resposta = await fetch("/api/valor",
        {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ id_transacao: transacao_id })
        })
        const json = await resposta.json();
        if(json)
      {
        await fetch(`/api/saldo/${json[0].id_usuario}`,
            {
            
            method: 'POST', 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ dados: json})
      })
      }
   }
   catch(erro)
   {
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
pegarSaldo();




//Animação do olho para o saldo
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



const tipoSelect = document.getElementById("tipo");
const categoriaSelect = document.getElementById("categoria");

async function listarTransacoes()
{
try {
            // 2. Envio dos dados para a API (Backend)
            const resposta = await fetch("/api/transacoes", {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ id_usuario: usuario.id }) 
            });

            const json = await resposta.json();
            // 3. Verifica o status da resposta
            if (json) {
               cadastrarTransacao(json);
            } else {
                // Tenta ler o erro do corpo da resposta JSON
                alert(`ERRO ao cadastrar (Status ${resposta.status}): ${json.message || resposta.statusText}`);
            }

        } catch (erro) {
            console.error('Erro de rede ou na requisição:', erro);
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
            id_usuario: usuario.id,
            // IDs do HTML modificado:
            descricao: document.getElementById("descricao-transacao").value,
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