let usuarioTemp = {};

document.querySelector(".btn-cadastro").addEventListener("click", async () => {

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    usuarioTemp = { nome, email, senha };

    const resposta = await fetch("/api/cadastrarUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
    });

    
    const data = await resposta.json();

    if (data.sucesso) {
        alert("Código enviado para seu e-mail!");

        // mostra a área de verificação
        document.getElementById("verificacao").style.display = "block";

    } else {
        alert(data.mensagem || "Erro ao enviar código.");
    }
});

document.getElementById("btn-confirmar").addEventListener("click", async () => {

    const codigo = document.getElementById("codigo").value;

    if (!codigo) {
        alert("Digite o código recebido!");
        return;
    }

    const resposta = await fetch("/api/verificarCodigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: usuarioTemp.email,
            codigo
        })
    });

    const data = await resposta.json();

    if (!data.validado) {
        alert("Código incorreto!");
        return;
    }


    const respostaCadastro = await fetch("/api/cadastrarUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioTemp)
    });

    const resultado = await respostaCadastro.json();

    if (resultado.sucesso) {
        alert("Usuário cadastrado com sucesso!");
        window.location.href = "login.html";
    } else {
        alert(resultado.mensagem || "Erro ao cadastrar usuário.");
    }
});