document
  .querySelector(".btn-login")
  .addEventListener("click", async (e) => {
    e.preventDefault();

const email = document.getElementById('email').value;
const senha = document.getElementById('senha').value;

  const resposta = await fetch("/login.html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, senha: senha}),
    });
    console.log(resposta);

const data = await resposta.json();

    if (data.sucesso) {
      alert("Login bem-sucedido!");
      window.location.href = "home.html";
    } else {
      alert("E-mail ou senha incorretos.");
    }
  });
