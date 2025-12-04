let usuarioTemp = {};

document.querySelector(".btn-cadastro").addEventListener("click", async () => {

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!nome || !email || !senha) {
         Swal.fire({
            icon: "warning",
            title: "Campos obrigatórios",
            text: "Preencha todos os campos!",
        });
        return;
    }

    usuarioTemp = { nome, email, senha };

    //rota enviar codigo
    const resposta = await fetch("/api/enviarCodigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    
console.log("Resposta servidor:", resposta);

    const data = await resposta.json();

    if (data.sucesso) {
        Swal.fire({
            icon: "success",
            title: "Código enviado!",
            text: "Verifique seu e-mail.",
        });

        document.getElementById("verificacao").style.display = "block";
        const envio = document.querySelector(".btn-cadastro");
        envio.innerHTML = "REENVIAR";
        envio.style = "background-color:white; color: green"
        

    } else {
        Swal.fire({
            icon: "error",
            title: "Erro",
            text: data.mensagem || "Erro ao enviar código.",
        });
    }
    console.log("JSON recebido:", data);

});

const inputs = document.querySelectorAll("#inputs input");



inputs.forEach((input, i) => 
{
    input.addEventListener("input", () =>
    {
        if(input.value && i < inputs.length - 1)
        {
            inputs[i + 1].focus();
        }
    })

    input.addEventListener("keydown", (e) =>
{
    if(e.key == "Backspace" && !input.value && i > 0)
    {
        inputs[i - 1].focus();
    }
})
})



document.getElementById("inputs").addEventListener("paste", (e) => 
{
    const dados = e.clipboardData.getData("text").trim();

    
        [...dados].forEach((num, i )=>
        {
            inputs[i].value = num;
        }
        )
    
})


document.getElementById("btn-confirmar").addEventListener("click", async () => {

    let codigo = "";

    inputs.forEach((input) =>
    {
        console.log(input.value);
        codigo += input.value;
    })


    if (!codigo) {
        Swal.fire({
            icon: "warning",
            title: "Código obrigatório",
            text: "Digite o código recebido!",
        });
        return;
    }

    // verifica código
    const resposta = await fetch("/api/verificarCodigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: usuarioTemp.email,
            codigo
        })
    });

    console.log("Resposta servidor:", resposta);

    const data = await resposta.json();

    if (!data.validado) {
       Swal.fire({
            icon: "error",
            title: "Código incorreto!",
            text: "Tente novamente.",
        });
        return;
    }
    console.log("JSON recebido:", data);


    //Cadastrar usuário
    const respostaCadastro = await fetch("/api/cadastrarUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioTemp)
    });

    const resultado = await respostaCadastro.json();

    if (resultado.sucesso) {
        Swal.fire({
            icon: "success",
            title: "Cadastro realizado!",
            text: "Usuário cadastrado com sucesso!",
        }).then(() => {
            window.location.href = "login";
        });
    } else {
        Swal.fire({
            icon: "error",
            title: "Erro ao cadastrar",
            text: resultado.mensagem || "Erro ao cadastrar usuário.",
        });
    }
});
