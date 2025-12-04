
document.getElementById("btn-solicitar").addEventListener("click", async (e) => {

    e.preventDefault();
    
    const email = document.getElementById("email-redefinir").value; 

    if (email === "") {
        Swal.fire({
            icon: "warning",
            title: "Campo obrigatório",
            text: "Por favor, preencha seu e-mail!",
        });
        return;
    }

    // loading enquanto espera o envio do e-mail
    Swal.fire({
        title: 'Enviando link...',
        text: 'Aguarde um momento',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    });

    // Envia o email para a nova rota do backend
    const res = await fetch("/api/usuario/solicitar-redefinicao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
    });


    Swal.fire({
        icon: "success",
        title: "Link enviado!",
        text: "Verifique sua caixa de entrada. O link de redefinição foi enviado para o seu e-mail.",
        timer: 3500,
        showConfirmButton: false,
    });
});