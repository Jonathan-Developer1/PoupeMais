
// pega ID salvo no login
const usuario = JSON.parse(localStorage.getItem("usuario"));
const usuarioID = usuario.id;

console.log(usuario.id);

//verificando se existe um usuário
if(localStorage.length == 0)
{
    window.location.href = "/";
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
        Swal.fire({
            icon: "warning",
            title: "Campos obrigatórios",
            text: "Preencha todos os campos!",
        });
        return;
    }

    // Pergunta se deseja realmente alterar a senha 
    const confirmacao = await Swal.fire({
        title: "Confirmar alteração?",
        text: "Deseja realmente alterar sua senha?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, alterar",
        cancelButtonText: "Cancelar"
    });

    if (!confirmacao.isConfirmed) {
        Swal.fire({
            title: "Operação cancelada",
            icon: "info",
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }

    // Se confirmar, envia pro backend
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
        Swal.fire({
            icon: "success",
            title: "Senha alterada!",
            text: "Sua senha foi modificada com sucesso.",
            timer: 2000,
            showConfirmButton: false
        });

        document.getElementById("senha-atual").value = "";
        document.getElementById("nova-senha").value = "";
    } else {
        Swal.fire({
            icon: "error",
            title: "Erro",
            text: resposta.mensagem,
        });
    }
});

// ===============================
// 3. LOGOUT
// ===============================

window.sair = function sair()
{
    localStorage.clear();
}