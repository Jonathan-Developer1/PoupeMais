document.getElementById("btn-alterar").addEventListener("click", async (e) => {

    e.preventDefault();
    const email = document.getElementById("email-alterar").value;
    const novaSenha = document.getElementById("senha-alterar").value;

    if (novaSenha === "" || email === "") {
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
    const res = await fetch("/api/usuario/alterar-esquecimento-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email,
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
            showConfirmButton: false,
            
        });

        
    } else {
        Swal.fire({
            icon: "error",
            title: "Erro",
            text: resposta.mensagem,
        });
    }
    window.location.href = "/login";
});