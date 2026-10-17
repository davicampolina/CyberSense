/* ==========================================================================
   CYBERSENSE MVP - SPRINT 1
   simulacao.js - Lógica da Página Falsa (Isca), Interceptação Raio-X e Opt-out
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const navSistemaSimulacao = document.getElementById("nav-sistema-simulacao");
  const secaoEstado1Isca = document.getElementById("estado-1-isca");
  const secaoEstado2Interceptacao = document.getElementById("estado-2-interceptacao");

  const elIscaTagTopo = document.getElementById("isca-tag-topo");
  const elIscaTitulo = document.getElementById("isca-titulo");
  const elIscaTexto = document.getElementById("isca-texto");
  const alertaErroIsca = document.getElementById("alerta-erro-isca");

  const formIscaFalsa = document.getElementById("form-isca-falsa");
  const inputVitimaNome = document.getElementById("input-vitima-nome");
  const inputVitimaContato = document.getElementById("input-vitima-contato");
  const btnAcaoIsca = document.getElementById("btn-acao-isca");

  const elMensagemAcolhimento = document.getElementById("mensagem-acolhimento-modo");
  const elResumoRegistroClique = document.getElementById("resumo-registro-clique");

  const elRaioxCategoria = document.getElementById("raiox-categoria");
  const elRaioxGatilho = document.getElementById("raiox-gatilho");
  const elRaioxTituloOriginal = document.getElementById("raiox-titulo-original");
  const elRaioxTextoOriginal = document.getElementById("raiox-texto-original");
  const listaIndiciosRaiox = document.getElementById("lista-indicios-raiox");

  const elOptoutContatoExibicao = document.getElementById("optout-contato-exibicao");
  const btnOptout = document.getElementById("btn-optout");
  const feedbackOptout = document.getElementById("feedback-optout");

  // Leitura dos parâmetros da URL (URLSearchParams)
  const params = new URLSearchParams(window.location.search);
  const paramModo = params.get("modo");
  const paramOrigemId = params.get("origem_id");
  const paramTemplate = params.get("template");
  const paramRemetente = params.get("remetente");
  const paramNomeAlvo = params.get("nome_alvo");
  const paramContatoAlvo = params.get("contato_alvo");

  // Define modo, origem e remetente com fallback seguro para demonstração caso aberto sem parâmetros
  const modoAtual =
    paramModo === "Familiar" || paramModo === "Autodefesa" || paramModo === "Relampago"
      ? paramModo
      : "Familiar";
  const origemIdAtual = paramOrigemId ? Number(paramOrigemId) || 1 : 1;
  const remetenteAtual =
    paramRemetente && paramRemetente.trim() ? paramRemetente.trim() : "Thiago";

  // Localiza o template correspondente em cybersense_templates
  const templates = lerTabela(DB_KEYS.TEMPLATES);
  const templateSelecionado =
    templates.find((t) => t.id_template === paramTemplate) ||
    templates[0] || {
      id_template: "tpl_alfandega",
      titulo: "Aviso de Retenção: Taxa Alfandegária Pendente",
      categoria_tag: "Compras Online",
      gatilho_mental: "Urgencia",
      texto_isca:
        "Seu pacote encontra-se retido na fiscalização aduaneira. Confirme seus dados nas próximas 2 horas.",
      texto_botao: "Liberar Encomenda Agora",
      indicios_raiox: ["Gatilho de urgência artificial.", "Link fora do portal oficial."]
    };

  // Variáveis de estado preenchidas após o clique na isca
  let contatoVitimaCapturado = "";
  let nomeVitimaCapturado = "";

  /**
   * Renderiza o Estado 1 (A Isca Falsa) ao carregar a página.
   */
  function inicializarEstado1Isca() {
    elIscaTagTopo.textContent = `Comunicado Importante • Setor: ${templateSelecionado.categoria_tag}`;
    elIscaTitulo.textContent = templateSelecionado.titulo;
    elIscaTexto.textContent = templateSelecionado.texto_isca;
    btnAcaoIsca.textContent = templateSelecionado.texto_botao;

    if (paramNomeAlvo) {
      inputVitimaNome.value = paramNomeAlvo;
    }
    if (paramContatoAlvo) {
      inputVitimaContato.value = paramContatoAlvo;
    }
  }

  /**
   * Processa a submissão do formulário da Isca Falsa, registra a queda em
   * cybersense_cliques e transiciona para o Estado 2 (Interceptação Didática e Raio-X).
   */
  function interceptarSubmissaoIsca(event) {
    event.preventDefault();
    alertaErroIsca.classList.add("hidden");

    const nomeDigitado = inputVitimaNome.value.trim();
    const contatoDigitado = inputVitimaContato.value.trim();

    if (!nomeDigitado || !contatoDigitado) {
      alertaErroIsca.textContent =
        "Para prosseguir com a confirmação na simulação, preencha os campos obrigatórios de Nome e Telefone/E-mail.";
      alertaErroIsca.classList.remove("hidden");
      return;
    }

    nomeVitimaCapturado = nomeDigitado;
    contatoVitimaCapturado = contatoDigitado;

    // 1. Registra imediatamente em cybersense_cliques com acao_usuario: "Clicou_Caiu"
    const todosCliques = lerTabela(DB_KEYS.CLIQUES);
    const novoIdClique =
      todosCliques.reduce(
        (max, item) => Math.max(max, Number(item.id_clique) || 0),
        0
      ) + 1;

    const dataHoraAtual = obterDataHoraAtual();

    const novoRegistroClique = {
      id_clique: novoIdClique,
      origem_id: origemIdAtual,
      modo_origem: modoAtual,
      id_template: templateSelecionado.id_template,
      nome_vitima: nomeVitimaCapturado,
      contato_vitima: contatoVitimaCapturado,
      acao_usuario: "Clicou_Caiu",
      data_hora: dataHoraAtual
    };

    todosCliques.push(novoRegistroClique);
    salvarTabela(DB_KEYS.CLIQUES, todosCliques);

    // 2. Configura a mensagem de acolhimento conforme o modo
    if (modoAtual === "Familiar") {
      elMensagemAcolhimento.textContent =
        "Calma! Você não caiu em um golpe de verdade. Este é um treinamento configurado por um familiar para sua proteção.";
    } else if (modoAtual === "Autodefesa") {
      elMensagemAcolhimento.textContent =
        "Te pegamos! Você acabou de cair no seu próprio teste de segurança configurado no modo Autodefesa.";
    } else {
      elMensagemAcolhimento.textContent = `Te pegamos, ${nomeVitimaCapturado}! Você acabou de cair na simulação relâmpago que ${remetenteAtual} enviou!`;
    }

    elResumoRegistroClique.textContent = `Interação educativa registrada no banco local (cybersense_cliques #${novoIdClique}) em ${dataHoraAtual} | Modo: ${modoAtual} | Alvo: ${nomeVitimaCapturado} (${contatoVitimaCapturado}).`;

    // 3. Renderiza o Raio-X da Ameaça
    elRaioxCategoria.textContent = `Categoria: ${templateSelecionado.categoria_tag}`;
    elRaioxGatilho.textContent = `Gatilho Mental: ${templateSelecionado.gatilho_mental}`;
    elRaioxTituloOriginal.textContent = templateSelecionado.titulo;
    elRaioxTextoOriginal.textContent = templateSelecionado.texto_isca;

    const indicios = Array.isArray(templateSelecionado.indicios_raiox)
      ? templateSelecionado.indicios_raiox
      : [];

    listaIndiciosRaiox.innerHTML = indicios
      .map((indicio) => `<li>${escaparHTML(indicio)}</li>`)
      .join("");

    // 4. Configura seção de Opt-out
    elOptoutContatoExibicao.textContent = contatoVitimaCapturado;

    // 5. Oculta Estado 1 e exibe Estado 2 + Barra de Navegação do Sistema
    secaoEstado1Isca.classList.add("hidden");
    secaoEstado2Interceptacao.classList.remove("hidden");
    navSistemaSimulacao.classList.remove("hidden");
    document.title = "CyberSense - Interceptação Didática e Raio-X";
  }

  /**
   * Executa o Opt-out Ético:
   * - Insere o contato da vítima em cybersense_blocklist (sem duplicatas)
   * - Atualiza status_campanha de campanhas vinculadas para "Cancelada_OptOut"
   * - Desabilita o botão e exibe mensagem de confirmação
   */
  function executarOptOut() {
    if (!contatoVitimaCapturado) return;

    const contatoNorm = normalizarContato(contatoVitimaCapturado);
    const blocklist = lerTabela(DB_KEYS.BLOCKLIST);

    const jaBloqueado = blocklist.some(
      (item) => normalizarContato(item.contato_bloqueado) === contatoNorm
    );

    if (!jaBloqueado) {
      const novoIdBloqueio =
        blocklist.reduce(
          (max, item) => Math.max(max, Number(item.id_bloqueio) || 0),
          0
        ) + 1;

      blocklist.push({
        id_bloqueio: novoIdBloqueio,
        contato_bloqueado: contatoVitimaCapturado,
        data_optout: obterDataHoraAtual()
      });

      salvarTabela(DB_KEYS.BLOCKLIST, blocklist);
    }

    // Percorre cybersense_campanhas e altera status_campanha de qualquer campanha vinculada para "Cancelada_OptOut"
    const campanhas = lerTabela(DB_KEYS.CAMPANHAS);
    let qtdCampanhasCanceladas = 0;

    const campanhasAtualizadas = campanhas.map((camp) => {
      if (normalizarContato(camp.contato_alvo) === contatoNorm) {
        if (camp.status_campanha !== "Cancelada_OptOut") {
          qtdCampanhasCanceladas++;
        }
        return {
          ...camp,
          status_campanha: "Cancelada_OptOut"
        };
      }
      return camp;
    });

    salvarTabela(DB_KEYS.CAMPANHAS, campanhasAtualizadas);

    btnOptout.disabled = true;
    btnOptout.textContent = "Opt-out Confirmado (Contato Bloqueado)";

    feedbackOptout.textContent = `Confirmado! O contato "${contatoVitimaCapturado}" foi inserido permanentemente na cybersense_blocklist e ${qtdCampanhasCanceladas} campanha(s) ativa(s) vinculada(s) tiveram seu status alterado para "Cancelada_OptOut".`;
    feedbackOptout.classList.remove("hidden");
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
  formIscaFalsa.addEventListener("submit", interceptarSubmissaoIsca);
  btnOptout.addEventListener("click", executarOptOut);

  // Inicialização
  inicializarEstado1Isca();
});

