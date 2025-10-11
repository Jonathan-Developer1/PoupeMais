//Animação do olho para o saldo
const saldo = document.getElementById("saldo");
const iconeOlho = document.getElementById("icone-olho");

let saldoVisivel = true;

iconeOlho.addEventListener("click", () => {
    saldoVisivel = !saldoVisivel;

    if (saldoVisivel) {
        saldo.textContent = "0,00";
        iconeOlho.classList.remove("bi-eye");
        iconeOlho.classList.add("bi-eye-slash");
    } else {
        saldo.textContent = "•••••";
        iconeOlho.classList.remove("bi-eye-slash");
        iconeOlho.classList.add("bi-eye");
    }
});
