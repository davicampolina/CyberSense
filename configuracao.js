/* ==========================================================================
   CYBERSENSE MVP - SPRINT 1
   configuracao.js - Lógica de Configuração do Treino Contínuo (Funcionalidade 1)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const formCampanha = document.getElementById("form-campanha");
  const radiosModo = document.querySelectorAll('input[name="modo_treino"]');

  const grupoNomeAlvo = document.getElementById("grupo-nome-alvo");
  const inputNomeAlvo = document.getElementById("input-nome-alvo");

  const labelContatoAlvo = document.getElementById("label-contato-alvo");
  const inputContatoAlvo = document.getElementById("input-contato-alvo");

  const grupoNivelDificuldade = document.getElementById("grupo-nivel-dificuldade");
  const selectNivelDificuldade = document.getElementById("select-nivel-dificuldade");

  const grupoFrequenciaMensal = document.getElementById("grupo-frequencia-mensal");
  const selectFrequenciaMensal = document.getElementById("select-frequencia-mensal");

  const alertaConfiguracao = document.getElementById("alerta-configuracao");
  const tbodyCampanhas = document.getElementById("tabela-campanhas");

  /**
   * Retorna o modo de treino atualmente selecionado nos radio buttons.
   */
  function obterModoSelecionado() {
    const radioMarcado = document.querySelector('input[name="modo_treino"]:checked');
    return radioMarcado ? radioMarcado.value : "Familiar";
  }

  /**
   * Adapta dinamicamente os campos visíveis do formulário conforme o modo selecionado.
   */
  function atualizarCamposPorModo() {
    const modo = obterModoSelecionado();
    ocultarAlerta();

    if (modo === "Familiar") {
      grupoNomeAlvo.classList.remove("hidden");
      grupoNivelDificuldade.classList.remove("hidden");
      grupoFrequenciaMensal.classList.add("hidden");
      labelContatoAlvo.textContent = "Contato do Protegido (Telefone ou E-mail):";
    } else {
      // Modo Autodefesa: oculta Nome/Nível de dificuldade e exibe Meu Contato + Frequência Mensal
      grupoNomeAlvo.classList.add("hidden");
      grupoNivelDificuldade.classList.add("hidden");
      grupoFrequenciaMensal.classList.remove("hidden");
      labelContatoAlvo.textContent = "Meu Contato (Telefone ou E-mail):";
    }
  }

  /**
   * Exibe mensagem de feedback (erro ou sucesso) na tela.
   */
  function exibirAlerta(mensagem, tipo = "danger") {
    alertaConfiguracao.className = `alert-box alert-${tipo}`;
    alertaConfiguracao.textContent = mensagem;
    alertaConfiguracao.classList.remove("hidden");
  }

  function ocultarAlerta() {
    alertaConfiguracao.classList.add("hidden");
    alertaConfiguracao.textContent = "";
  }

  /**
   * Seleciona um template coerente com as tags de interesse da campanha
   * para o botão "Simular Envio Agora".
   */
  function escolherTemplateParaCampanha(tagsInteresse) {
    const templates = lerTabela(DB_KEYS.TEMPLATES);
    if (templates.length === 0) return "tpl_alfandega";

    if (Array.isArray(tagsInteresse) && tagsInteresse.length > 0) {
      const compativel = templates.find((tpl) =>
        tagsInteresse.includes(tpl.categoria_tag)
      );
      if (compativel) return compativel.id_template;
    }

    return templates[0].id_template;
  }

  /**
   * Renderiza a listagem de todas as campanhas cadastradas em cybersense_campanhas.
   */
  function renderizarTabelaCampanhas() {
    const campanhas = lerTabela(DB_KEYS.CAMPANHAS);

    if (campanhas.length === 0) {
      tbodyCampanhas.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center;">Nenhuma campanha cadastrada.</td>
        </tr>
      `;
      return;
    }

    tbodyCampanhas.innerHTML = campanhas
      .map((camp) => {
        const isAtiva = camp.status_campanha === "Ativa";
        const badgeStatus = isAtiva
          ? `<span class="badge badge-active">Ativa</span>`
          : `<span class="badge badge-optout">Cancelada_OptOut</span>`;

        const tagsFormatadas = Array.isArray(camp.tags_interesse)
          ? camp.tags_interesse
              .map((t) => `<span class="badge" style="margin-right: 0.25rem;">${escaparHTML(t)}</span>`)
              .join("")
          : "";

        const idTemplateSimulacao = escolherTemplateParaCampanha(camp.tags_interesse);
        const urlSimulacao =
          `simulacao.html?modo=${encodeURIComponent(camp.modo_treino)}` +
          `&origem_id=${encodeURIComponent(camp.id_campanha)}` +
          `&template=${encodeURIComponent(idTemplateSimulacao)}` +
          `&nome_alvo=${encodeURIComponent(camp.nome_alvo)}` +
          `&contato_alvo=${encodeURIComponent(camp.contato_alvo)}`;

        const botaoSimular = isAtiva
          ? `<a href="${urlSimulacao}" class="btn btn-sm">Simular Envio Agora</a>`
          : `<button type="button" class="btn btn-sm" disabled>Bloqueado (Opt-Out)</button>`;

        return `
          <tr>
            <td>#${camp.id_campanha}</td>
            <td><strong>${escaparHTML(camp.modo_treino)}</strong></td>
            <td>
              <strong>${escaparHTML(camp.nome_alvo)}</strong><br>
              <small>${escaparHTML(camp.contato_alvo)}</small>
            </td>
            <td>${tagsFormatadas}</td>
            <td>
              Nível: ${escaparHTML(camp.nivel_dificuldade)}<br>
              <small>Freq.: ${Number(camp.frequencia_mensal)}x / mês</small>
            </td>
            <td>${badgeStatus}</td>
            <td>${botaoSimular}</td>
          </tr>
        `;
      })
      .join("");
  }

  /**
   * Processa o envio do formulário validando a Trava Ética Preventiva (cybersense_blocklist).
   */
  function salvarNovaCampanha(event) {
    event.preventDefault();
    ocultarAlerta();

    const modo = obterModoSelecionado();
    const contatoBruto = inputContatoAlvo.value.trim();
    const contatoNormalizado = normalizarContato(contatoBruto);

    if (!contatoNormalizado) {
      exibirAlerta(
        "Por favor, informe um Contato válido (Telefone ou E-mail).",
        "danger"
      );
      return;
    }

    // Validação do Nome quando estiver no Modo Familiar
    let nomeAlvoFinal = "Autodefesa (Próprio Usuário)";
    if (modo === "Familiar") {
      const nomeDigitado = inputNomeAlvo.value.trim();
      if (!nomeDigitado) {
        exibirAlerta(
          "No Modo Familiar, é obrigatório informar o Nome do Protegido.",
          "danger"
        );
        return;
      }
      nomeAlvoFinal = nomeDigitado;
    } else {
      // No modo Autodefesa gera identificação amigável a partir do contato
      nomeAlvoFinal = `Autodefesa (${contatoBruto})`;
    }

    // Coleta das Tags de Interesse marcadas
    const checkboxesMarcados = Array.from(
      document.querySelectorAll('input[name="tags_interesse"]:checked')
    ).map((cb) => cb.value);

    if (checkboxesMarcados.length === 0) {
      exibirAlerta(
        "Selecione pelo menos uma Tag de Interesse para personalizar os testes.",
        "danger"
      );
      return;
    }

    // TRAVA ÉTICA PREVENTIVA OBRIGATÓRIA: verifica se o contato consta em cybersense_blocklist
    if (verificarContatoNaBlocklist(contatoNormalizado)) {
      exibirAlerta(
        `BLOQUEIO ÉTICO PREVENTIVO: O contato "${contatoBruto}" solicitou Opt-out permanente e consta na cybersense_blocklist. O cadastro desta campanha foi impedido em respeito à privacidade do usuário.`,
        "danger"
      );
      return;
    }

    const campanhas = lerTabela(DB_KEYS.CAMPANHAS);
    const novoId =
      campanhas.reduce((max, item) => Math.max(max, Number(item.id_campanha) || 0), 0) + 1;

    const nivelDificuldade =
      modo === "Familiar" ? selectNivelDificuldade.value : "Intermediario";
    const frequenciaMensal =
      modo === "Autodefesa" ? Number(selectFrequenciaMensal.value) : 2;

    const novaCampanha = {
      id_campanha: novoId,
      modo_treino: modo,
      nome_alvo: nomeAlvoFinal,
      contato_alvo: contatoBruto,
      tags_interesse: checkboxesMarcados,
      nivel_dificuldade: nivelDificuldade,
      frequencia_mensal: frequenciaMensal,
      status_campanha: "Ativa"
    };

    campanhas.push(novaCampanha);
    salvarTabela(DB_KEYS.CAMPANHAS, campanhas);

    renderizarTabelaCampanhas();

    // Limpa campos de texto mantendo o modo selecionado
    inputNomeAlvo.value = "";
    inputContatoAlvo.value = "";

    exibirAlerta(
      `Campanha #${novoId} (${modo}) cadastrada com sucesso para "${nomeAlvoFinal}"! Use o botão "Simular Envio Agora" na tabela abaixo para testar.`,
      "success"
    );
  }

  function escaparHTML(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Eventos
  radiosModo.forEach((radio) => {
    radio.addEventListener("change", atualizarCamposPorModo);
  });

  formCampanha.addEventListener("submit", salvarNovaCampanha);

  window.addEventListener("storage", () => {
    renderizarTabelaCampanhas();
  });

  // Inicialização
  atualizarCamposPorModo();
  renderizarTabelaCampanhas();
});

