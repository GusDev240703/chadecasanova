// Remove o splash após as animações (cerca de 12 segundos no total)
setTimeout(() => {
  const splash = document.getElementById("splash-screen");
  splash.style.opacity = "0";
  setTimeout(() => splash.remove(), 1500);
}, 12500);

function salvarNome() {
  const nome = document.getElementById("nomeConvidado").value.trim();
  if (nome === "") {
    alert("Por favor, digite seu nome Heart");
    return;
  }
  localStorage.setItem("nomeConvidado", nome);

  // Redirecionamento corrigido
  window.location.href = "./produtos.html";
}