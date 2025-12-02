document.querySelector(".btn-login").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const resposta = await fetch("/login.html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, senha: senha }),
  });

  const data = await resposta.json();

  if (data.sucesso) {
    alert("Login bem-sucedido!");

    //Salvando dados no localStorage
  localStorage.setItem("usuario", JSON.stringify({
  id: data.id,
  nome: data.nome,
  email: email
}));

    window.location.href = "home.html";
  } else {
    alert("E-mail ou senha incorretos.");
  }
});

// Link botão de cadastro
document.querySelector('.btn-cadastro').addEventListener('click', function () {
  window.location.href = 'cadastrarUsuario.html';
});
