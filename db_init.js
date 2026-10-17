/* ==========================================================================
   CYBERSENSE MVP - SPRINT 1
   db_init.js - Inicialização (Data Seeding) e Utilitários do localStorage
   ========================================================================== */

const DB_KEYS = {
  TEMPLATES: "cybersense_templates",
  CAMPANHAS: "cybersense_campanhas",
  RELAMPAGO: "cybersense_relampago",
  CLIQUES: "cybersense_cliques",
  BLOCKLIST: "cybersense_blocklist"
};

const SEED_DATA = {
  templates: [
    {
      id_template: "tpl_alfandega",
      titulo: "Aviso de Retenção: Taxa Alfandegária Pendente",
      categoria_tag: "Compras Online",
      gatilho_mental: "Urgencia",
      texto_isca:
        "Prezado(a) destinatário(a), seu pacote internacional código BR89421094X encontra-se retido na fiscalização aduaneira. Confirme seus dados e regularize a guia pendente nas próximas 2 horas para evitar o retorno imediato ao remetente.",
      texto_botao: "Regularizar e Liberar Encomenda Agora",
      indicios_raiox: [
        "Gatilho Mental de Urgência Extrema: impõe prazo curto (2 horas) para impedir que a vítima verifique a informação com calma.",
        "Ausência de Identificação Oficial: órgãos oficiais e transportadoras exigem consulta apenas no portal oficial ou aplicativo autenticado, nunca por links avulsos.",
        "Código de Rastreio Genérico: utiliza um código fictício apenas para criar aparência de legitimidade.",
        "Coleta Direta de Dados Pessoais: solicita confirmação imediata de nome e contato fora do ambiente seguro da loja onde a compra foi feita."
      ]
    },
    {
      id_template: "tpl_ifood",
      titulo: "Semana Premiada: Cupom Exclusivo de R$ 80,00 Liberado!",
      categoria_tag: "Delivery",
      gatilho_mental: "Ganancia",
      texto_isca:
        "Parabéns! Seu perfil foi selecionado na ação promocional relâmpago de Delivery. Você ganhou 1 (um) Voucher de R$ 80,00 sem valor mínimo de pedido. Restam apenas 7 vouchers disponíveis neste lote!",
      texto_botao: "Resgatar Meu Cupom de R$ 80,00",
      indicios_raiox: [
        "Gatilho Mental da Ganância / Recompensa Fácil: oferece benefício financeiro alto (R$ 80 sem valor mínimo) sem que o usuário tenha participado de sorteio.",
        "Escassez Artificial: afirma que 'restam apenas 7 vouchers' para forçar o clique impulsivo.",
        "Link Externo ao Aplicativo: cupons legítimos de aplicativos de entrega aparecem diretamente na aba 'Cupons' dentro do próprio app oficial.",
        "Solicitação de Cadastro em Página Avulsa: usa a promessa do prêmio para capturar telefone e e-mail de usuários reais."
      ]
    },
    {
      id_template: "tpl_pix",
      titulo: "Alerta Crítico de Segurança: Bloqueio Preventivo PIX",
      categoria_tag: "Bancos",
      gatilho_mental: "Medo",
      texto_isca:
        "ALERTA DE SEGURANÇA: Identificamos um agendamento PIX suspeito no valor de R$ 1.850,00 a partir de um novo dispositivo. Se você NÃO reconhece esta transação, valide sua titularidade imediatamente abaixo para cancelar o envio e evitar o bloqueio total da conta.",
      texto_botao: "Cancelar PIX Suspeito e Validar Titularidade",
      indicios_raiox: [
        "Gatilho Mental do Medo: simula perda financeira iminente (R$ 1.850,00) para gerar pânico e reação imediata.",
        "Falsa Central de Segurança: bancos nunca enviam links externos por SMS, WhatsApp ou e-mail para cancelar um PIX em andamento.",
        "Ameaça de Bloqueio de Conta: pressiona o usuário a fornecer dados rapidamente sob pretexto de proteção cadastral.",
        "Falta de Personalização Bancária Real: mensagens legítimas não pedem preenchimento de formulários em páginas web desconhecidas."
      ]
    }
  ],

  campanhas: [
    {
      id_campanha: 1,
      modo_treino: "Familiar",
      nome_alvo: "Dona Lúcia",
      contato_alvo: "31999990001",
      tags_interesse: ["Bancos", "Compras Online"],
      nivel_dificuldade: "Iniciante",
      frequencia_mensal: 2,
      status_campanha: "Ativa"
    },
    {
      id_campanha: 2,
      modo_treino: "Autodefesa",
      nome_alvo: "Maria",
      contato_alvo: "maria@email.com",
      tags_interesse: ["Delivery", "Compras Online"],
      nivel_dificuldade: "Intermediario",
      frequencia_mensal: 3,
      status_campanha: "Ativa"
    }
  ],

  relampago: [
    {
      id_relampago: 1,
      id_template: "tpl_ifood",
      nome_remetente: "Thiago",
      tipo_disparo: "Grupo_WhatsApp",
      contato_direto: "",
      link_gerado:
        "simulacao.html?modo=Relampago&origem_id=1&template=tpl_ifood&remetente=Thiago"
    }
  ],

  cliques: [
    {
      id_clique: 1,
      origem_id: 1,
      modo_origem: "Familiar",
      id_template: "tpl_pix",
      nome_vitima: "Dona Lúcia",
      contato_vitima: "31999990001",
      acao_usuario: "Clicou_Caiu",
      data_hora: "14/10/2026, 09:15:20"
    },
    {
      id_clique: 2,
      origem_id: 1,
      modo_origem: "Familiar",
      id_template: "tpl_alfandega",
      nome_vitima: "Dona Lúcia",
      contato_vitima: "31999990001",
      acao_usuario: "Ignorou",
      data_hora: "15/10/2026, 11:30:05"
    },
    {
      id_clique: 3,
      origem_id: 2,
      modo_origem: "Autodefesa",
      id_template: "tpl_alfandega",
      nome_vitima: "Maria",
      contato_vitima: "maria@email.com",
      acao_usuario: "Clicou_Caiu",
      data_hora: "15/10/2026, 16:42:10"
    },
    {
      id_clique: 4,
      origem_id: 2,
      modo_origem: "Autodefesa",
      id_template: "tpl_ifood",
      nome_vitima: "Maria",
      contato_vitima: "maria@email.com",
      acao_usuario: "Ignorou",
      data_hora: "16/10/2026, 10:12:44"
    },
    {
      id_clique: 5,
      origem_id: 1,
      modo_origem: "Relampago",
      id_template: "tpl_ifood",
      nome_vitima: "Carlos Eduardo",
      contato_vitima: "31997776655",
      acao_usuario: "Clicou_Caiu",
      data_hora: "16/10/2026, 19:05:33"
    }
  ],

  blocklist: [
    {
      id_bloqueio: 1,
      contato_bloqueado: "31988887777",
      data_optout: "13/10/2026, 18:00:00"
    }
  ]
};

/**
 * Inicializa o banco de dados no localStorage caso alguma chave não exista
 * ou caso forceReset seja verdadeiro.
 */
function initCyberSenseDB(forceReset = false) {
  if (forceReset || !localStorage.getItem(DB_KEYS.TEMPLATES)) {
    localStorage.setItem(DB_KEYS.TEMPLATES, JSON.stringify(SEED_DATA.templates));
  }
  if (forceReset || !localStorage.getItem(DB_KEYS.CAMPANHAS)) {
    localStorage.setItem(DB_KEYS.CAMPANHAS, JSON.stringify(SEED_DATA.campanhas));
  }
  if (forceReset || !localStorage.getItem(DB_KEYS.RELAMPAGO)) {
    localStorage.setItem(DB_KEYS.RELAMPAGO, JSON.stringify(SEED_DATA.relampago));
  }
  if (forceReset || !localStorage.getItem(DB_KEYS.CLIQUES)) {
    localStorage.setItem(DB_KEYS.CLIQUES, JSON.stringify(SEED_DATA.cliques));
  }
  if (forceReset || !localStorage.getItem(DB_KEYS.BLOCKLIST)) {
    localStorage.setItem(DB_KEYS.BLOCKLIST, JSON.stringify(SEED_DATA.blocklist));
  }
}

/**
 * Lê uma tabela do localStorage retornando sempre um Array válido.
 */
function lerTabela(chave) {
  try {
    const raw = localStorage.getItem(chave);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Erro ao ler tabela do localStorage:", chave, err);
    return [];
  }
}

/**
 * Salva um Array na tabela correspondente do localStorage.
 */
function salvarTabela(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

/**
 * Normaliza contatos (telefone ou e-mail) em minúsculas e sem espaços extras.
 * Se não for e-mail (não contém '@'), remove também caracteres de pontuação telefônica
 * como parênteses, traços e espaços internos para garantir precisão na blocklist.
 */
function normalizarContato(contato) {
  const limpo = String(contato || "").trim().toLowerCase();
  if (!limpo.includes("@")) {
    return limpo.replace(/[\s()-]/g, "");
  }
  return limpo;
}

/**
 * Verifica se um contato consta na cybersense_blocklist.
 */
function verificarContatoNaBlocklist(contato) {
  const alvoNormalizado = normalizarContato(contato);
  if (!alvoNormalizado) return false;
  const blocklist = lerTabela(DB_KEYS.BLOCKLIST);
  return blocklist.some(
    (item) => normalizarContato(item.contato_bloqueado) === alvoNormalizado
  );
}

/**
 * Retorna data e hora atual formatada em padrão legível pt-BR.
 */
function obterDataHoraAtual() {
  return new Date().toLocaleString("pt-BR");
}

/**
 * Limpa os dados do sistema no localStorage, recria o seed de fábrica e recarrega a tela.
 */
function resetarDadosDeFabrica() {
  localStorage.removeItem(DB_KEYS.TEMPLATES);
  localStorage.removeItem(DB_KEYS.CAMPANHAS);
  localStorage.removeItem(DB_KEYS.RELAMPAGO);
  localStorage.removeItem(DB_KEYS.CLIQUES);
  localStorage.removeItem(DB_KEYS.BLOCKLIST);
  initCyberSenseDB(true);
  window.location.reload();
}

// Executa o seed imediatamente ao importar o script
initCyberSenseDB(false);

// Vincula o botão global de Resetar Dados de Fábrica presente na barra de navegação
document.addEventListener("DOMContentLoaded", () => {
  const botoesReset = document.querySelectorAll(".js-reset-seed");
  botoesReset.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      resetarDadosDeFabrica();
    });
  });
});

