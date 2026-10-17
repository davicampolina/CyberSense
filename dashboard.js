/* ==========================================================================
   CYBERSENSE MVP - SPRINT 1
   dashboard.js - Lógica do Dashboard Analítico (Funcionalidade 4)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const selectFiltroModo = document.getElementById("filtro-modo");
  const btnSimularIgnorado = document.getElementById("btn-simular-ignorado");
  const feedbackDashboard = document.getElementById("feedback-dashboard");

  const elValorScore = document.getElementById("valor-score-imunidade");
  const elBarraScore = document.getElementById("barra-score-imunidade");
  const elDetalheScore = document.getElementById("detalhe-score-imunidade");

  const elFunilConfigurados = document.getElementById("funil-configurados");
  const elFunilEventos = document.getElementById("funil-eventos");
  const elFunilQuedas = document.getElementById("funil-quedas");
  const elFunilIgnorados = document.getElementById("funil-ignorados");

  const elBoxCalcanhar = document.getElementById("box-calcanhar-aquiles");
  const elResumoCategorias = document.getElementById("resumo-categorias-quedas");

  const tbodyHistorico = document.getElementById("tabela-historico-cliques");
  const tbodyBlocklist = document.getElementById("tabela-blocklist-atual");

  /**
   * Calcula e renderiza todas as métricas e tabelas do Dashboard
   * com base no filtro selecionado ("Geral", "Familiar" ou "Autodefesa").
   */
  function atualizarDashboard() {
    const modoSelecionado = selectFiltroModo.value;

    const templates = lerTabela(DB_KEYS.TEMPLATES);
    const campanhas = lerTabela(DB_KEYS.CAMPANHAS);
    const relampagos = lerTabela(DB_KEYS.RELAMPAGO);
    const todosCliques = lerTabela(DB_KEYS.CLIQUES);
    const blocklist = lerTabela(DB_KEYS.BLOCKLIST);

    // Mapa auxiliar de templates por id_template
    const mapaTemplates = {};
    templates.forEach((tpl) => {
      mapaTemplates[tpl.id_template] = tpl;
    });

    // 1. Filtra cliques conforme o modo selecionado
    const cliquesFiltrados =
      modoSelecionado === "Geral"
        ? todosCliques
        : todosCliques.filter((c) => c.modo_origem === modoSelecionado);

    // 2. Filtra total de campanhas/disparos configurados conforme o modo
    let totalConfigurados = 0;
    if (modoSelecionado === "Geral") {
      totalConfigurados = campanhas.length + relampagos.length;
    } else {
      totalConfigurados = campanhas.filter(
        (camp) => camp.modo_treino === modoSelecionado
      ).length;
    }

    // 3. Cálculo do Score de Imunidade (%)
    const totalEventos = cliquesFiltrados.length;
    const totalIgnorados = cliquesFiltrados.filter(
      (c) => c.acao_usuario === "Ignorou"
    ).length;
    const totalQuedas = cliquesFiltrados.filter(
      (c) => c.acao_usuario === "Clicou_Caiu"
    ).length;

    const percentualImunidade =
      totalEventos > 0 ? Math.round((totalIgnorados / totalEventos) * 100) : 0;

    elValorScore.textContent = `${percentualImunidade}%`;
    elBarraScore.style.width = `${percentualImunidade}%`;
    elDetalheScore.textContent = `${totalIgnorados} ignorado(s) de ${totalEventos} evento(s) registrado(s)`;

    // 4. Atualização do Funil de Simulações
    elFunilConfigurados.textContent = String(totalConfigurados);
    elFunilEventos.textContent = String(totalEventos);
    elFunilQuedas.textContent = String(totalQuedas);
    elFunilIgnorados.textContent = String(totalIgnorados);

    // 5. Diagnóstico "Calcanhar de Aquiles"
    const registrosQuedas = cliquesFiltrados.filter(
      (c) => c.acao_usuario === "Clicou_Caiu"
    );

    if (registrosQuedas.length === 0) {
      elBoxCalcanhar.textContent =
        "Nenhuma queda ('Clicou_Caiu') registrada para o filtro selecionado. Imunidade máxima até o momento!";
      elResumoCategorias.innerHTML = "";
    } else {
      const contagemParCategoriaGatilho = {};
      const contagemPorCategoria = {};

      registrosQuedas.forEach((queda) => {
        const tpl = mapaTemplates[queda.id_template];
        const categoria = tpl ? tpl.categoria_tag : "Desconhecida";
        const gatilho = tpl ? tpl.gatilho_mental : "Desconhecido";
        const chaveCombinada = `${categoria}|||${gatilho}`;

        contagemParCategoriaGatilho[chaveCombinada] =
          (contagemParCategoriaGatilho[chaveCombinada] || 0) + 1;
        contagemPorCategoria[categoria] =
          (contagemPorCategoria[categoria] || 0) + 1;
      });

      // Identifica a combinação Categoria + Gatilho com maior incidência
      let chaveMaiorIncidencia = "";
      let maiorQtd = 0;

      Object.keys(contagemParCategoriaGatilho).forEach((chave) => {
        if (contagemParCategoriaGatilho[chave] > maiorQtd) {
          maiorQtd = contagemParCategoriaGatilho[chave];
          chaveMaiorIncidencia = chave;
        }
      });

      const [categoriaCritica, gatilhoCritico] = chaveMaiorIncidencia.split("|||");
      const percentualFalhaCritica = Math.round(
        (maiorQtd / registrosQuedas.length) * 100
      );

      elBoxCalcanhar.textContent = `Vulnerabilidade Principal Detectada: ${percentualFalhaCritica}% dos cliques indevidos ocorreram em simulações da categoria ${categoriaCritica} utilizando o gatilho mental de ${gatilhoCritico}.`;

      const itensResumo = Object.keys(contagemPorCategoria)
        .map(
          (cat) =>
            `<span class="badge" style="margin-right: 0.35rem; margin-bottom: 0.25rem;">${cat}: ${contagemPorCategoria[cat]} queda(s)</span>`
        )
        .join("");

      elResumoCategorias.innerHTML = `<strong>Distribuição de quedas por categoria:</strong><div style="margin-top: 0.35rem;">${itensResumo}</div>`;
    }

    // 6. Renderiza Tabela de Histórico Recente (ordenado do mais recente para o mais antigo)
    const cliquesOrdenados = [...cliquesFiltrados].sort(
      (a, b) => Number(b.id_clique) - Number(a.id_clique)
    );

    if (cliquesOrdenados.length === 0) {
      tbodyHistorico.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center;">Nenhum evento registrado para este filtro.</td>
        </tr>
      `;
    } else {
      tbodyHistorico.innerHTML = cliquesOrdenados
        .map((registro) => {
          const tpl = mapaTemplates[registro.id_template];
          const nomeTemplate = tpl
            ? `${tpl.titulo} (${tpl.categoria_tag} / ${tpl.gatilho_mental})`
            : registro.id_template;

          const badgeAcao =
            registro.acao_usuario === "Clicou_Caiu"
              ? `<span class="badge badge-danger">Clicou_Caiu</span>`
              : `<span class="badge badge-success">Ignorou</span>`;

          return `
            <tr>
              <td>#${registro.id_clique}</td>
              <td><span class="badge">${escaparHTML(registro.modo_origem)}</span></td>
              <td>
                <strong>${escaparHTML(registro.nome_vitima)}</strong><br>
                <small>${escaparHTML(registro.contato_vitima)}</small>
              </td>
              <td>${escaparHTML(nomeTemplate)}</td>
              <td>${badgeAcao}</td>
              <td>${escaparHTML(registro.data_hora)}</td>
            </tr>
          `;
        })
        .join("");
    }

    // 7. Renderiza Tabela da Blocklist Atual
    if (blocklist.length === 0) {
      tbodyBlocklist.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center;">Nenhum contato na blocklist.</td>
        </tr>
      `;
    } else {
      tbodyBlocklist.innerHTML = blocklist
        .map(
          (item) => `
            <tr>
              <td>#${item.id_bloqueio}</td>
              <td><strong>${escaparHTML(item.contato_bloqueado)}</strong></td>
              <td>${escaparHTML(item.data_optout)}</td>
            </tr>
          `
        )
        .join("");
    }
  }

  /**
   * Simula um usuário ignorando um golpe (+1 Ignorado) em cybersense_cliques
   * e recalcula o Dashboard imediatamente.
   */
  function simularUsuarioIgnorandoGolpe() {
    const todosCliques = lerTabela(DB_KEYS.CLIQUES);
    const campanhas = lerTabela(DB_KEYS.CAMPANHAS);
    const templates = lerTabela(DB_KEYS.TEMPLATES);

    const modoFiltro = selectFiltroModo.value;
    const modoAlvo =
      modoFiltro === "Familiar" || modoFiltro === "Autodefesa"
        ? modoFiltro
        : "Familiar";

    // Busca campanha correspondente ao modo para manter dados coerentes
    const campanhaRef =
      campanhas.find((c) => c.modo_treino === modoAlvo) || campanhas[0];

    const templateAleatorio =
      templates.length > 0
        ? templates[Math.floor(Math.random() * templates.length)]
        : { id_template: "tpl_pix" };

    const novoIdClique =
      todosCliques.reduce((max, item) => Math.max(max, Number(item.id_clique) || 0), 0) + 1;

    const novoRegistro = {
      id_clique: novoIdClique,
      origem_id: campanhaRef ? campanhaRef.id_campanha : 1,
      modo_origem: modoAlvo,
      id_template: templateAleatorio.id_template,
      nome_vitima: campanhaRef ? campanhaRef.nome_alvo : "Dona Lúcia",
      contato_vitima: campanhaRef ? campanhaRef.contato_alvo : "31999990001",
      acao_usuario: "Ignorou",
      data_hora: obterDataHoraAtual()
    };

    todosCliques.push(novoRegistro);
    salvarTabela(DB_KEYS.CLIQUES, todosCliques);

    atualizarDashboard();

    feedbackDashboard.textContent = `Registro #${novoIdClique} adicionado com sucesso: ${novoRegistro.nome_vitima} (${novoRegistro.modo_origem}) ignorou a simulação (${novoRegistro.id_template}). Score de Imunidade recalculado!`;
    feedbackDashboard.classList.remove("hidden");
  }

  /**
   * Função utilitária simples para evitar quebra de HTML na tabela.
   */
  function escaparHTML(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Eventos de interface
  selectFiltroModo.addEventListener("change", atualizarDashboard);
  btnSimularIgnorado.addEventListener("click", simularUsuarioIgnorandoGolpe);

  // Sincronização automática caso outra aba registre clique ou opt-out
  window.addEventListener("storage", () => {
    atualizarDashboard();
  });

  // Inicialização
  atualizarDashboard();
});

