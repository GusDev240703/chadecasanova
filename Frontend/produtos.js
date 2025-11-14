import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
      const SUPABASE_URL = "https://tumuyoettpwottsyzvry.supabase.co";
      const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1bXV5b2V0dHB3b3R0c3l6dnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTM3MTcsImV4cCI6MjA3MjIyOTcxN30.FQFZy3S7A82GU45H-k94-0WhOaNwMkpi7Aa_8DMaiLM";
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const TABELA = "presentes";

      // Boas-vindas
      const convidado = localStorage.getItem("convidado");
      if (convidado) {
        document.getElementById(
          "boasVindas"
        ).textContent = `Olá, ${convidado}! Escolha um presente para reservar.`;
      }

      // Mapeamento de cores
      function mapearCor(cor) {
        if (!cor) return { hex: "transparent", nome: "Sem cor" };
        const cores = {
          Preto: ["#0F0E0E", "black"],
          Branco: ["#fff", "white"],
          Vermelho: ["#FF0000", "red"],
          Azul: ["#254D70", "blue"],
          Marinho: ["#131D4F", "dark blue"],
          Verde: ["#008000", "green"],
          Amarelo: ["#FFFF00", "yellow"],
          Inox: ["#44444E", "inox"],
          Rosa: ["#FFC0CB", "pink"],
          Roxo: ["#800080", "purple"],
          Laranja: ["#FFA500", "orange"],
          Amadeirado: ["#7B4019", "wood"],
          Bege: ["#E5E3D4", "beige"],
          Dourado: ["#FFD700", "gold"],
          Prata: ["#C0C0C0", "silver"],
          Cinza: ["#393E46", "gray"],
          Marrom: ["#4F200D", "brown"],
          "Rosa Claro": ["#E5BEB5", "light-pink"],
        };
        const corNormalizada = cor.trim().toLowerCase();
        for (let nome in cores) {
          if (nome.toLowerCase() === corNormalizada) {
            return { hex: cores[nome][0], nome: nome };
          }
        }
        let hex = cor.startsWith("#") ? cor : `#${cor}`.toUpperCase();
        for (let nome in cores) {
          if (cores[nome].map((c) => c.toUpperCase()).includes(hex)) {
            return { hex, nome };
          }
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
          container.innerHTML = ""; // Remove loading

          if (!data || data.length === 0) {
            container.innerHTML =
              "<div class='erro' style='grid-column:1/-1;padding:30px;color:#c62828;'>Nenhum item encontrado.</div>";
            return;
          }

          data.forEach((item, index) => {
            const { id, produto, reservado, cor, imagem, voltagem } = item;
            const corInfo = mapearCor(cor);

            const bloco = document.createElement("div");
            bloco.className = "produto";
            bloco.style.setProperty("--i", index);

            bloco.innerHTML = `
            <img loading="lazy" src="${imagem || "placeholder.png"}" alt="${
              produto || "Produto"
            }" />
            <p class="nomeProduto">${produto || "Produto sem nome"}</p>
            <div class="cor-container" data-cor-nome="${corInfo.nome}">
              <span class="circle" style="background:${corInfo.hex}"></span>
              <span>${corInfo.nome}</span>
            </div>
            <p class="voltagem">${voltagem || "Sem voltagem"}</p>
            <p class="status ${reservado ? "indisponivel" : "disponivel"}">
              ${reservado ? "Indisponível" : "Disponível"}
            </p>
            <button ${
              reservado ? "disabled" : ""
            } data-id="${id}" aria-label="Reservar ${produto}">
              ${reservado ? "Indisponível" : "Reservar"}
            </button>
          `;

            bloco
              .querySelector("button")
              ?.addEventListener("click", () => reservarProduto(id));
            container.appendChild(bloco);
          });

          // === CARD PIX FIXO ===
          const pixCard = document.createElement("div");
          pixCard.className = "produto pix-card";
          pixCard.id = "pix-card";
          pixCard.innerHTML = `
          <img loading="lazy" src="https://api.qrserver.com/v1/create-qr-code/?data=gusta240703@gmail.com&size=200x200" alt="QR Code Pix" />
          <p class="nomeProduto">Pix</p>
          <p>Obrigado por nos ajudar em nossa nova jornada!</p>
          <p class="pix-key">Chave Pix: <br>gusta240703@gmail.com</p>
          <button class="pix-btn" onclick="copyPix()">Copiar chave Pix</button>
        `;
          container.appendChild(pixCard);

          ativarFiltro();
        } catch (e) {
          console.error("Erro ao carregar produtos.", e);
          document.getElementById(
            "produtos"
          ).innerHTML = `<div style="grid-column:1/-1;color:#c62828;padding:30px;">Erro ao carregar. Tente novamente.</div>`;
        }
      }

      // Reservar produto
      async function reservarProduto(id) {
        try {
          const { error } = await supabase
            .from(TABELA)
            .update({ reservado: true })
            .eq("id", id);
          if (error) throw error;
          window.location.href = "agradecimentos.html";
        } catch (err) {
          alert("Erro ao reservar. Tente novamente.");
        }
      }

      // Filtro + botão limpar
      function ativarFiltro() {
        const inputFiltro = document.getElementById("filtroProduto");
        const limparBtn = document.getElementById("limparFiltro");

        const filtrar = () => {
          const filtro = inputFiltro.value.toLowerCase();
          const blocos = document.querySelectorAll(".produto:not(.pix-card)");
          blocos.forEach((bloco) => {
            const nomeProduto = bloco
              .querySelector(".nomeProduto")
              .textContent.toLowerCase();
            bloco.style.display = nomeProduto.includes(filtro)
              ? "flex"
              : "none";
          });
          limparBtn.classList.toggle("visible", filtro.length > 0);
        };

        inputFiltro.addEventListener("input", filtrar);
        limparBtn.addEventListener("click", () => {
          inputFiltro.value = "";
          inputFiltro.focus();
          filtrar();
        });
      }

      // Copiar Pix
      window.copyPix = function () {
        const chave = "gusta240703@gmail.com";
        navigator.clipboard
          .writeText(chave)
          .then(() => {
            const btn = document.querySelector(".pix-btn");
            const textoOriginal = btn.textContent;
            btn.textContent = "Copiado!";
            btn.style.background = "#388e3c";
            setTimeout(() => {
              btn.textContent = textoOriginal;
              btn.style.background = "#4CAF50";
            }, 2000);
          })
          .catch(() => {
            alert("Falha ao copiar. Tente manualmente.");
          });
      };

      // Iniciar
      carregarProdutos();