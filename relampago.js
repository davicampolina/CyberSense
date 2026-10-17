/* ==========================================================================
   CYBERSENSE MVP - SPRINT 1
   relampago.js - Lógica do Treino Relâmpago e Radar ao Vivo (Funcionalidade 2)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const formRelampago = document.getElementById("form-relampago");
  const inputNomeRemetente = document.getElementById("input-nome-remetente");
  const radiosTipoDisparo = document.querySelectorAll('input[name="tipo_disparo"]');
  const grupoTelefoneAlvo = document.getElementById("grupo-telefone-alvo");
  const inputTelefoneAlvo = document.getElementById("input-telefone-alvo");
  const selectModeloGolpe = document.getElementById("select-modelo-golpe");
  const alertaRelampago = document.getElementById("alerta-relampago");

  const boxLinkGerado = document.getElementById("box-link-gerado");
  const textoLinkGerado = document.getElementById("texto-link-gerado");
  const btnCopiarLink = document.getElementById("btn-copiar-link");
  const linkTestarNovaAba = document.getElementById("link-testar-nova-aba");
  const feedbackCopia = document.getElementById("feedback-copia");

  const btnAtualizarRadar = document.getElementById("btn-atualizar-radar");
  const contadorQuedasRelampago = document.getElementById("contador-quedas-relampago");
  const tbodyRadarQuedas = document.getElementById("tabela-radar-quedas");
  const tbodyIscasCriadas = document.getElementById("tabela-iscas-criadas");

  /**
   * Carrega dinamicamente os modelos de golpe de cybersense_templates no select.
   */
  function carregarTemplatesNoSelect() {
    const templates = lerTabela(DB_KEYS.TEMPLATES);
    selectModeloGolpe.innerHTML = templates
      .map(
        (tpl) =>
          `<option value="${escaparHTML(tpl.id_template)}">${escaparHTML(tpl.titulo)} [${escaparHTML(tpl.categoria_tag)} - Gatilho: ${escaparHTML(tpl.gatilho_mental)}]</option>`
      )
      .join("");
  }

  /**
   * Obtém o tipo de disparo marcado ("Grupo_WhatsApp" ou "Disparo_Direto").
   */
  function obterTipoDisparo() {
    const marcado = document.querySelector('input[name="tipo_disparo"]:checked');
    return marcado ? marcado.value : "Grupo_WhatsApp";
  }

  /**
   * Exibe ou oculta o campo de Telefone do Alvo conforme a mecânica de disparo.
   */
  function atualizarVisibilidadeTelefone() {
    const tipo = obterTipoDisparo();
    if (tipo === "Disparo_Direto") {
      grupoTelefoneAlvo.classList.remove("hidden");
    } else {
      grupoTelefoneAlvo.classList.add("hidden");
      inputTelefoneAlvo.value = "";
    }
  }

  function exibirAlerta(mensagem, tipo = "danger") {
    alertaRelampago.className = `alert-box alert-${tipo}`;
    alertaRelampago.textContent = mensagem;
    alertaRelampago.classList.remove("hidden");
  }

  function ocultarAlerta() {
    alertaRelampago.classList.add("hidden");
    alertaRelampago.textContent = "";
  }

  /**
   * Gera a isca relâmpago, salva em cybersense_relampago e exibe o link parametrizado.
   */
  function gerarIscaRelampago(event) {
    event.preventDefault();
    ocultarAlerta();
    feedbackCopia.classList.add("hidden");

    const nomeRemetente = inputNomeRemetente.value.trim();
    const tipoDisparo = obterTipoDisparo();
    const contatoDireto =
      tipoDisparo === "Disparo_Direto" ? inputTelefoneAlvo.value.trim() : "";
    const idTemplate = selectModeloGolpe.value;

    if (!nomeRemetente) {
      exibirAlerta("Informe o Nome do Remetente para gerar a isca relâmpago.", "danger");
      return;
    }

    if (tipoDisparo === "Disparo_Direto" && !contatoDireto) {
      exibirAlerta(
        "Para a mecânica 'Disparo Direto SMS', informe o Telefone do Alvo.",
        "danger"
      );
      return;
    }

    // Caso seja Disparo Direto, respeita também a Trava Ética da Blocklist
    if (
      tipoDisparo === "Disparo_Direto" &&
      verificarContatoNaBlocklist(contatoDireto)
    ) {
      exibirAlerta(
        `BLOQUEIO ÉTICO: O contato "${contatoDireto}" solicitou Opt-out permanente e consta na cybersense_blocklist. Não é permitido gerar Disparo Direto para este número.`,
        "danger"
      );
      return;
    }

    const listaRelampago = lerTabela(DB_KEYS.RELAMPAGO);
    const novoIdRelampago =
      listaRelampago.reduce(
        (max, item) => Math.max(max, Number(item.id_relampago) || 0),
        0
      ) + 1;

    // Formato obrigatório: simulacao.html?modo=Relampago&origem_id=[ID]&template=[ID_TEMPLATE]&remetente=[NOME]
    let linkGerado =
      `simulacao.html?modo=Relampago` +
      `&origem_id=${encodeURIComponent(novoIdRelampago)}` +
      `&template=${encodeURIComponent(idTemplate)}` +
      `&remetente=${encodeURIComponent(nomeRemetente)}`;

    if (tipoDisparo === "Disparo_Direto" && contatoDireto) {
      linkGerado += `&contato_alvo=${encodeURIComponent(contatoDireto)}`;
    }

    const novoDisparo = {
      id_relampago: novoIdRelampago,
      id_template: idTemplate,
      nome_remetente: nomeRemetente,
      tipo_disparo: tipoDisparo,
      contato_direto: contatoDireto,
      link_gerado: linkGerado
    };

    listaRelampago.push(novoDisparo);
    salvarTabela(DB_KEYS.RELAMPAGO, listaRelampago);

    // Exibe caixa destacada com a URL gerada
    textoLinkGerado.textContent = linkGerado;
    linkTestarNovaAba.href = linkGerado;
    boxLinkGerado.classList.remove("hidden");

    atualizarRadarAoVivo();
  }

  /**
   * Copia o link gerado para a área de transferência.
   */
  function copiarLinkGerado() {
    const urlRelativa = textoLinkGerado.textContent.trim();
    if (!urlRelativa) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(urlRelativa)
        .then(() => mostrarFeedbackCopia("Link copiado para a área de transferência!"))
        .catch(() => copiarViaFallback(urlRelativa));
    } else {
      copiarViaFallback(urlRelativa);
    }
  }

  function copiarViaFallback(texto) {
    const tempInput = document.createElement("textarea");
    tempInput.value = texto;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    mostrarFeedbackCopia("Link copiado para a área de transferência!");
  }

  function mostrarFeedbackCopia(msg) {
    feedbackCopia.textContent = msg;
    feedbackCopia.classList.remove("hidden");
  }

  /**
   * Atualiza o Bloco B (Radar ao Vivo): contador total de quedas no modo Relâmpago,
   * tabela em tempo real de vítimas e lista de iscas relâmpago criadas.
   */
  function atualizarRadarAoVivo() {
    const templates = lerTabela(DB_KEYS.TEMPLATES);
    const listaRelampago = lerTabela(DB_KEYS.RELAMPAGO);
    const todosCliques = lerTabela(DB_KEYS.CLIQUES);

    const mapaTemplates = {};
    templates.forEach((tpl) => {
      mapaTemplates[tpl.id_template] = tpl;
    });

    // Filtra quedas do modo Relampago
    const quedasRelampago = todosCliques
      .filter(
        (c) => c.modo_origem === "Relampago" && c.acao_usuario === "Clicou_Caiu"
      )
      .sort((a, b) => Number(b.id_clique) - Number(a.id_clique));

    contadorQuedasRelampago.textContent = `Cliques na isca: ${quedasRelampago.length}`;

    // Renderiza tabela de vítimas que caíram no modo Relampago
    if (quedasRelampago.length === 0) {
      tbodyRadarQuedas.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center;">Nenhuma queda registrada no modo Relâmpago ainda.</td>
        </tr>
      `;
    } else {
      tbodyRadarQuedas.innerHTML = quedasRelampago
        .map((queda) => {
          const tpl = mapaTemplates[queda.id_template];
          const tituloIsca = tpl
            ? `${tpl.titulo} (${tpl.categoria_tag})`
            : queda.id_template;

          return `
            <tr>
              <td><strong>${escaparHTML(queda.nome_vitima)}</strong></td>
              <td>${escaparHTML(queda.contato_vitima)}</td>
              <td>${escaparHTML(tituloIsca)}</td>
              <td>${escaparHTML(queda.data_hora)}</td>
            </tr>
          `;
        })
        .join("");
    }

    // Renderiza tabela de iscas relâmpago criadas
    const iscasOrdenadas = [...listaRelampago].sort(
      (a, b) => Number(b.id_relampago) - Number(a.id_relampago)
    );

    if (iscasOrdenadas.length === 0) {
      tbodyIscasCriadas.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center;">Nenhuma isca relâmpago criada.</td>
        </tr>
      `;
    } else {
      tbodyIscasCriadas.innerHTML = iscasOrdenadas
        .map((isca) => {
          const tpl = mapaTemplates[isca.id_template];
          const nomeTpl = tpl ? tpl.titulo : isca.id_template;
          const detalheTipo =
            isca.tipo_disparo === "Disparo_Direto"
              ? `Disparo_Direto (${isca.contato_direto})`
              : "Grupo_WhatsApp";

          return `
            <tr>
              <td>#${isca.id_relampago}</td>
              <td>
                <strong>${escaparHTML(isca.nome_remetente)}</strong><br>
                <small>${escaparHTML(detalheTipo)}</small>
              </td>
              <td>${escaparHTML(nomeTpl)}</td>
              <td>
                <a href="${escaparHTML(isca.link_gerado)}" target="_blank" rel="noopener" class="btn btn-sm">
                  Testar em Nova Aba
                </a>
              </td>
            </tr>
          `;
        })
        .join("");
    }
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
  radiosTipoDisparo.forEach((radio) => {
    radio.addEventListener("change", atualizarVisibilidadeTelefone);
  });

  formRelampago.addEventListener("submit", gerarIscaRelampago);
  btnCopiarLink.addEventListener("click", copiarLinkGerado);
  btnAtualizarRadar.addEventListener("click", atualizarRadarAoVivo);

  // Atualiza automaticamente o Radar ao Vivo quando outra aba registrar queda no localStorage
  window.addEventListener("storage", () => {
    atualizarRadarAoVivo();
  });

  // Inicialização
  carregarTemplatesNoSelect();
  atualizarVisibilidadeTelefone();
  atualizarRadarAoVivo();
});

