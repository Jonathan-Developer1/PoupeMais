//NOVA SENHA

function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
}

document.getElementById("btn-finalizar").addEventListener("click", async (e) => {
    e.preventDefault();

    const token = getTokenFromUrl();
    if (!token) {
        Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Link inválido. O token de segurança não foi encontrado.",
        });
        return;
    }

    const novaSenha = document.getElementById("nova-senha").value;
    const confirmaSenha = document.getElementById("confirma-senha").value;

    if (novaSenha === "" || confirmaSenha === "") {
        Swal.fire({
            icon: "warning",
            title: "Campos obrigatórios",
            text: "Preencha a nova senha e a confirmação!",
        });
        return;
    }

    if (novaSenha !== confirmaSenha) {
        Swal.fire({
            icon: "error",
            title: "Atenção",
            text: "A nova senha e a confirmação precisam ser iguais.",
        });
        return;
    }
    
    // Pergunta de confirmação antes de enviar
    const confirmacao = await Swal.fire({
        title: "Confirmar redefinição?",
        text: "Deseja usar esta nova senha?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, redefinir",
        cancelButtonText: "Cancelar"
    });

    if (!confirmacao.isConfirmed) {
        return;
    }


    // Envia o token e a nova senha para a rota de redefinição do backend
    const res = await fetch("/api/usuario/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token: token,
            nova_senha: novaSenha
        })
    });

    const resposta = await res.json();

    if (resposta.sucesso) {
        Swal.fire({
            icon: "success",
            title: "Senha redefinida!",
            text: resposta.mensagem,
            timer: 2500,
            showConfirmButton: false,
        });

        // Redireciona para a tela de login
        setTimeout(() => {
            window.location.href = "/login"; 
        }, 2500);
        
    } else {
        // Mostra o erro retornado pelo backend (ex: token inválido/expirado)
        Swal.fire({
            icon: "error",
            title: "Erro ao redefinir",
            text: resposta.mensagem,
        });
    }

});