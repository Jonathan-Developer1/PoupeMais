document.querySelector(".btn-login").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const resposta = await fetch("/login.html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, senha: senha }),
  });

  const dados = await resposta.json();

  if (dados.sucesso) {

    Swal.fire({
      title: "Login realizado!",
      text: "Bem-vindo ao PoupeMais!",
      icon: "success",
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      localStorage.setItem("usuario", JSON.stringify({
        id: dados.id,
        nome: dados.nome,
        email: email
      }));

      window.location.href = "home";
    });

  } else {

    Swal.fire({
      title: "Erro",
      text: "E-mail ou senha incorretos.",
      icon: "error",
      confirmButtonText: "OK"
    });

  }
});


// Link botão de cadastro
document.querySelector('.btn-cadastro').addEventListener('click', function () {
  window.location.href = 'cadastro';
});
