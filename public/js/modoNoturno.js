//================================
//MODO NOTURNO
//================================
const btn = document.getElementById("toggle-theme");
const body = document.body;

// Verifica se já existe tema salvo
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    btn.textContent = "☀️";
}

btn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    // Se estiver no modo escuro, salva
    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        btn.textContent = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        btn.textContent = "🌙";
    }
});