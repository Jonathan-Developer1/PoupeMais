import { cadastrarTransacao, addUltimas } from "./cadastro.js";

//Dados para os selects de meses
const mes = [

    { value: 0, nome: "Janeiro" },
    { value: 1, nome: "Fevereiro" },
    { value: 2, nome: "Março" },
    { value: 3, nome: "Abril" },
    { value: 4, nome: "Maio" },
    { value: 5, nome: "Junho" },
    { value: 6, nome: "Julho" },
    { value: 7, nome: "Agosto" },
    { value: 8, nome: "Setembro" },
    { value: 9, nome: "Outubro" },
    { value: 10, nome: "Novembro" },
    { value: 11, nome: "Dezembro" }

];

//Dados para as categorias
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
        { id: 9, nome: "Freelance" },
        { id: 10, nome: "Outros" }
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
        { id: 21, nome: "Financiamento" },
        { id: 22, nome: "Outros" }
    ]
};

//Pega o usuario passado pelo locaStorage
let usuario = JSON.parse(localStorage.getItem('usuario'));

//verificando se existe um usuário
if (localStorage.length == 0) {
    window.location.href = "/";
}
//Passa o saldo atual para a variavel
let saldoUsuario = await pegarSaldo();



//Atualiza para a data atual
const data = document.getElementById("data-transacao");


function atualizaData() {
    if (data)
        data.valueAsDate = new Date();
}

// ===============================
// 1. iNICIALIZAÇÃO
// ===============================
listarTransacoes();
listarUltimasTransacoes();
animacaoOlho();
pegarSaldo();
atualizaData();

// ===============================
// 2. CONFIRMAÇÃO DE TRANSAÇÕES
// ===============================
window.confirmarTransacao = async function confirmarTransacao(transacao_id) {
    try {
        const resposta = await fetch("/api/valor/confirmar", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_transacao: transacao_id })
        });

        const json = await resposta.json();

        if (json) {
            const respostaSaldo = await fetch("/api/saldo/atualizar/confirmar", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dados: json.dados[0], id_usuario: usuario.id })
            });

            const jsonSaldo = await respostaSaldo.json();


            if (jsonSaldo.sucesso) {
                saldoUsuario = await pegarSaldo();
                listarTransacoes();
                listarUltimasTransacoes();
                animacaoOlho();
                atualizaData();

            } else {
                console.log("erro");
            }
        }

    } catch (erro) {
        console.error('Erro de rede ou na requisição:', erro);
    }
}
// ===============================
// 3. CANCELAMENTO DE TRANSAÇÕES
// ===============================
window.desfazerTransacao = async function desfazerTransacao(transacao_id) {
    try {
        const resposta = await fetch("/api/valor/cancelar", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_transacao: transacao_id })
        });

        const json = await resposta.json();

        if (json) {
            const respostaSaldo = await fetch("/api/saldo/atualizar/cancelar", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dados: json.dados[0], id_usuario: usuario.id })
            });

            const jsonSaldo = await respostaSaldo.json();


            if (jsonSaldo.sucesso) {
                saldoUsuario = await pegarSaldo();
                listarTransacoes();
                listarUltimasTransacoes();
                animacaoOlho();
                atualizaData();

            } else {
                console.log("erro");
            }
        }

    } catch (erro) {
        console.error('Erro de rede ou na requisição:', erro);
    }
}

// ===============================
// 4. PEGAR SALDO DO USUÁRIO
// ===============================
async function pegarSaldo() {
    try {
        const resposta = await fetch("/api/saldo",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_usuario: usuario.id })
            })
        const json = await resposta.json()

        if (json) {
            const dinheiro = json[0].saldo.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
            return dinheiro;

        }
        else {
            // Tenta ler o erro do corpo da resposta JSON
            alert(`ERRO ao cadastrar (Status ${resposta.status}): ${json.message || resposta.statusText}`);
        }

    } catch (erro) {
        console.error('Erro de rede ou na requisição:', erro);
    }

}





// ===============================
// 5. PEGAR O NOME DA CATEGORIA
// ===============================
function getNomeCategoria(tipo, id) {
    const lista = categorias[tipo];
    const categoriaEncontrada = lista.find(c => c.id == id);
    return categoriaEncontrada ? categoriaEncontrada.nome : "Desconhecido";
}

// ===============================
// 6. ANIMAÇÃO DO OLHO DO SALDO
// ===============================
function animacaoOlho() {
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

// ===============================
// 7. BUSCA AS TRANSAÇÕES
// ===============================
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

//Selecionando os selects
export const filtromes = document.getElementById("filter-mestransacoes");
export const filtroano = document.getElementById("filter-anotransacoes");

//Atualizando para as datas atuais
const mesAtual = new Date().getMonth();
const anoAtual = new Date().getFullYear();




if (filtromes) {

    //Criar opções de filtro de mes
    mes.forEach(mes => {
        const option = document.createElement("option");
        option.textContent = mes.nome;
        option.value = mes.value; // AGORA ENVIA O ID CORRETO
        filtromes.appendChild(option);
    });


    // Pega as mudanças no filtro de mes
    filtromes.addEventListener("change", (e) => {
        e.preventDefault();

        listarTransacoes();


    });
}

if (filtromes)
    filtromes.value = mesAtual;


if (filtroano) {
    filtroano.value = anoAtual;
    //Pega as mudanças no filtro de ano
    filtroano.addEventListener("change", (e) => {
        e.preventDefault();

        listarTransacoes();

    });
}

//Criar opções de categorias
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


// ===============================
// 8. CADASTRAR NOVA TRANSAÇÃO
// ===============================
const formCadastro = document.getElementById("formCadastroTransacao");

if (formCadastro) {
    formCadastro.addEventListener("submit", async (evento) => {
        evento.preventDefault(); // Impede o envio padrão do formulário
        let parcelas = parseFloat(document.getElementById("parcelas").value)
        const parcelaOriginal = parcelas;
        let transacao = [];

        //Alteração nas datas parceladas
        const dataP = document.getElementById("data-transacao").value;
        const dataAtualizada = new Date(dataP);

        dataAtualizada.setDate(dataAtualizada.getDate() + 1);


        //Cadastro de transações parceladas
        if (parcelas > 1) {

            function generateNumericID() {
                return Date.now() % 100000000;
            }
            const id_parcela = generateNumericID();

            for (let i = 0; i < parcelaOriginal; i++) {
                const dataParcelas = new Date(dataAtualizada);
                if (dataParcelas.getDate() > 28) {
                    dataParcelas.setDate(28);
                }

                dataParcelas.setMonth(dataParcelas.getMonth() + i);


                transacao.push({
                    id_usuario: usuario.id,
                    nome: document.getElementById("descricao-transacao").value,
                    tipo: document.getElementById("tipo").value,
                    categoria: document.getElementById("categoria").value,
                    valor: parseFloat(document.getElementById("valor-transacao").value / parcelaOriginal),
                    parcelas: parcelas,
                    data: dataParcelas,
                    id_parcela: id_parcela
                })
                parcelas--;

            }
        }
        //Cadastro de transações comuns
        else {
            transacao = {
                id_usuario: usuario.id,
                nome: document.getElementById("descricao-transacao").value,
                tipo: document.getElementById("tipo").value,
                categoria: document.getElementById("categoria").value,
                valor: parseFloat(document.getElementById("valor-transacao").value),
                parcelas: parseFloat(document.getElementById("parcelas").value),
                data: dataAtualizada,
                id_parcela: null
            };
        }
        try {
            const resposta = await fetch("/api/transacao", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transacao)
            });

            const json = await resposta.json();
            if (json.sucesso) {
                listarTransacoes();

                Swal.fire({
                    title: "Tudo certo!",
                    text: "Transação cadastrada com sucesso!",
                    icon: "success"
                });
                formCadastro.reset(); // Limpa o formulário
                atualizaData();
                // Garante que o select de categoria volte ao estado inicial (disabled)
                categoriaSelect.innerHTML = '<option value="" selected disabled>Inserir categoria</option>';


            } else {
                alert(`ERRO ao cadastrar (Status ${resposta.status}): ${json.message || resposta.statusText}`);
            }

        } catch (erro) {
            console.error('Erro de rede ou na requisição:', erro);
        }
    });
}

// ===============================
// 9. EXCLUIR TRANSAÇÃO
// ===============================
window.excluirTransacao = async function excluirTransacao(id_transacao) {

    try {
        const resposta = await fetch("/api/excluir/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transacao_id: id_transacao })
        });

        const json = await resposta.json();


        if (json.sucesso) {
            listarTransacoes();
        }

    }
    catch (error) {
        console.log(error);
    }
}

// ===============================
// 10. EXCLUIR PARCELAS
// ===============================
window.excluirParcelas = async function excluirParcelas(id_parcela) {

    try {
        const resposta = await fetch("/api/excluirParcelas/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ parcelas_id: id_parcela })
        });

        const json = await resposta.json();


        if (json.sucesso) {
            listarTransacoes();
        }

    }
    catch (error) {
        console.log(error);
    }
}

// =========================================
// 11. BUSCA ULTIMAS TRANSAÇÕES CONFIRMADAS
// =========================================
async function listarUltimasTransacoes() {
    try {
        const resposta = await fetch("/api/ultimas-transacoes",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_usuario: usuario.id })
            });

        const json = await resposta.json();

        if (json.sucesso) {
            console.log(json.sucesso);
            addUltimas(json.dados);
        }
        else
        {
            addUltimas(json.dados);
            return;
        }
    }
    catch (error) {
        console.log(error);
    }
}