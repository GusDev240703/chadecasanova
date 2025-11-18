import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://tumuyoettpwottsyzvry.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bXV5b2V0dHB3b3R0c3l6dnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTM3MTcsImV4cCI6MjA3MjIyOTcxN30.FQFZy3S7A82GU45H-k94-0WhOaNwMkpi7Aa_8DMaiLM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TABELA = "presentes";

let produtoIdParaReservar = null;

// Boas-vindas
const convidado = localStorage.getItem("convidado");
if (convidado) {
  document.getElementById(
    "boasVindas"
  ).textContent = `Olá, ${convidado}! Escolha um presente para reservar.`;
}

// Mapeamento de cores (igual antes)
function mapearCor(cor) {
  if (!cor) return { hex: "transparent", nome: "Sem cor" };
  const cores = {
    Preto: ["#0F0E0E"],
    Branco: ["#fff"],
    Vermelho: ["#FF0000"],
    Azul: ["#254D70"],
    Marinho: ["#131D4F"],
    Verde: ["#008000"],
    Amarelo: ["#FFFF00"],
    Inox: ["#44444E"],
    Rosa: ["#FFC0CB"],
    Roxo: ["#800080"],
    Laranja: ["#FFA500"],
    Amadeirado: ["#7B4019"],
    Bege: ["#E5E3D4"],
    Dourado: ["#FFD700"],
    Prata: ["#C0C0C0"],
    Cinza: ["#393E46"],
    Marrom: ["#4F200D"],
    "Rosa Claro": ["#E5BEB5"],
  };
  const corNormalizada = cor.trim().toLowerCase();
  for (let nome in cores) {
    if (nome.toLowerCase() === corNormalizada)
      return { hex: cores[nome][0], nome };
  }
  const hex = cor.startsWith("#") ? cor : `#${cor}`.toUpperCase();
  for (let nome in cores) {
    if (cores[nome][0].toUpperCase() === hex) return { hex, nome };
  }
  return { hex, nome: hex };
}

// Carregar produtos
async function carregarProdutos() {
  try {
    const { data, error } = await supabase
      .from(TABELA)
      .select("*")
      .order("produto", { ascending: true });
    if (error) throw error;

    const container = document.getElementById("produtos");
    container.innerHTML = ""; // remove o loading

    if (!data || data.length === 0) {
      container.innerHTML =
        "<div style='grid-column:1/-1;color:#c62828;padding:40px;'>Nenhum presente cadastrado.</div>";
      return;
    }

    data.forEach((item, index) => {
      const { id, produto, reservado, cor, imagem, voltagem } = item;
      const corInfo = mapearCor(cor);

      const bloco = document.createElement("div");
      bloco.className = "produto";
      bloco.innerHTML = `
        <img loading="lazy" src="${
          imagem || "placeholder.png"
        }" alt="${produto}">
        <p class="nomeProduto">${produto}</p>
        <div class="cor-container"><span class="circle" style="background:${
          corInfo.hex
        }"></span><span>${corInfo.nome}</span></div>
        <p class="voltagem">${voltagem || "Sem voltagem"}</p>
        <p class="status ${reservado ? "indisponivel" : "disponivel"}">${
        reservado ? "Indisponível" : "Disponível"
      }</p>
        <button ${reservado ? "disabled" : ""} data-id="${id}">${
        reservado ? "Indisponível" : "Reservar"
      }</button>
      `;

      if (!reservado) {
        bloco
          .querySelector("button")
          .addEventListener("click", () => reservarProduto(id, produto));
      }
      container.appendChild(bloco);
    });

    // CARD PIX (agora sem o maldito "SSS")
    const pixCard = document.createElement("div");
    pixCard.className = "produto pix-card";
    pixCard.id = "pix-card";
    pixCard.innerHTML = `
      <img loading="lazy" src="https://api.qrserver.com/v1/create-qr-code/?data=gusta240703@gmail.com&size=200x200" alt="QR Code Pix">
      <p class="nomeProduto">Pix</p>
      <p>Obrigado por nos ajudar em nossa nova jornada!</p>
      <p class="pix-key">Chave Pix: <br>gusta240703@gmail.com</p>
      <button class="pix-btn" onclick="copyPix()">Copiar chave Pix</button>
    `;
    container.appendChild(pixCard);

    ativarFiltro(); // agora a função existe!
  } catch (e) {
    console.error(e);
    document.getElementById(
      "produtos"
    ).innerHTML = `<div style="grid-column:1/-1;color:#c62828;padding:40px;">Erro ao carregar. Tente novamente.</div>`;
  }
}

// Modal de confirmação
function reservarProduto(id, nomeProduto) {
  produtoIdParaReservar = id;
  document.getElementById("nomeProdutoModal").textContent = nomeProduto;
  document.getElementById("modalConfirmacao").style.display = "flex";
}

// Tudo que depende do DOM
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalConfirmacao");

  // Fechar clicando fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Cancelar
  document.getElementById("btnCancelar").addEventListener("click", () => {
    modal.style.display = "none";
    produtoIdParaReservar = null;
  });

  // Confirmar
  document
    .getElementById("btnConfirmar")
    .addEventListener("click", async () => {
      modal.style.display = "none";
      if (!produtoIdParaReservar) return;

      try {
        const nome = localStorage.getItem("convidado") || "Convidado";
        const { error } = await supabase
          .from(TABELA)
          .update({ reservado: true, convidado: nome })
          .eq("id", String(produtoIdParaReservar));

        if (error) throw error;

        // Atualiza visualmente
        const btn = document.querySelector(
          `button[data-id="${produtoIdParaReservar}"]`
        );
        btn.disabled = true;
        btn.textContent = "Indisponível";
        btn.closest(".produto").querySelector(".status").textContent =
          "Indisponível";
        btn
          .closest(".produto")
          .querySelector(".status")
          .classList.replace("disponivel", "indisponivel");

        setTimeout(() => (window.location.href = "agradecimentos.html"), 800);
      } catch (err) {
        alert("Erro ao reservar. Tente novamente.");
        console.error(err);
      } finally {
        produtoIdParaReservar = null;
      }
    });
});

// Filtro
function ativarFiltro() {
  const input = document.getElementById("filtroProduto");
  const limpar = document.getElementById("limparFiltro");

  const filtrar = () => {
    const termo = input.value.toLowerCase();
    document.querySelectorAll(".produto:not(.pix-card)").forEach((p) => {
      const nome = p.querySelector(".nomeProduto").textContent.toLowerCase();
      p.style.display = nome.includes(termo) ? "flex" : "none";
    });
    limpar.classList.toggle("visible", termo.length > 0);
  };

  input.addEventListener("input", filtrar);
  limpar.addEventListener("click", () => {
    input.value = "";
    input.focus();
    filtrar();
  });
}

// Copiar Pix
window.copyPix = function () {
  navigator.clipboard
    .writeText("gusta240703@gmail.com")
    .then(() => {
      const btn = document.querySelector(".pix-btn");
      const original = btn.textContent;
      btn.textContent = "Copiado!";
      btn.style.background = "#388e3c";
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = "";
      }, 2000);
    })
    .catch(() => alert("Falha ao copiar."));
};

// Inicia tudo
carregarProdutos();
