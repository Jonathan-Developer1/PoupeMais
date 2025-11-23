document.querySelector(".btn-cadastro").addEventListener("click", async () => {

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    const resposta = await fetch("/api/cadastrarUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
    });

    const data = await resposta.json();

    if (data.sucesso) {
        alert("Usuário cadastrado com sucesso!");
        window.location.href = "login.html";
    } else {
        alert(data.mensagem || "Erro ao cadastrar usuário.");
    }
});
