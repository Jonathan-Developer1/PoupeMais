//Animação do olho para o saldo
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

// pega ID salvo no login
const usuarioID = localStorage.getItem("id_usuario");

//verificando se existe um usuário

if(localStorage.length == 0)
{
    window.location.href = "/index.html";
}
// ===============================
// 1. CARREGAR DADOS DO USUÁRIO
// ===============================
async function carregarPerfil() {
    if (!usuarioID) return;

    const res = await fetch("/api/usuario/" + usuarioID);
    const dados = await res.json();

    document.getElementById("nome").value = dados.Nome;
    document.getElementById("email").value = dados.Email;
}

carregarPerfil();

// ===============================
// 2. ALTERAR SENHA
// ===============================
document.getElementById("botao-alterar").addEventListener("click", async () => {

    const senhaAtual = document.getElementById("senha-atual").value;
    const novaSenha = document.getElementById("nova-senha").value;

    if (senhaAtual === "" || novaSenha === "") {
        alert("Preencha todos os campos!");
        return;
    }

    const res = await fetch("/api/usuario/alterar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: usuarioID,
            senha_atual: senhaAtual,
            nova_senha: novaSenha
        })
    });

    const resposta = await res.json();

    if (resposta.sucesso) {
        alert("Senha alterada com sucesso!");
        document.getElementById("senha-atual").value = "";
        document.getElementById("nova-senha").value = "";
    } else {
        alert(resposta.mensagem);
    }
});

//função de logout

window.sair = function sair()
{
    localStorage.clear();
}