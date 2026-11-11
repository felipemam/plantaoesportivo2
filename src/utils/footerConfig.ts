export interface InstitutionalItemConfig {
  id: string;
  label: string;
  modalTitle: string;
  modalContent: string;
}

export interface FooterTextConfig {
  brandBio: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterButtonText: string;
  copyrightText: string;
  companyInfoText: string;
  developerLabel: string;
  developerCredit: string;
  institutionalItems: InstitutionalItemConfig[];
}

export const DEFAULT_FOOTER_CONFIG: FooterTextConfig = {
  brandBio:
    'Jornalismo esportivo independente, com cobertura diária e em tempo real de futebol, corrida de rua, ciclismo e política esportiva.',
  newsletterTitle: 'Newsletter',
  newsletterSubtitle: 'Receba o resumo esportivo de hora em hora.',
  newsletterButtonText: 'Assinar',
  copyrightText: '© 2026 Plantão Esportivo. Todos os direitos reservados.',
  companyInfoText: 'CNPJ 00.000.000/0001-00 • Redação Central em São Paulo, SP',
  developerLabel: 'Desenvolvido por:',
  developerCredit: 'FELIPE MARCELO ALECRIM MACIEL | SOLUÇÕES INTERATIVAS E MÍDIAS SOCIAIS',
  institutionalItems: [
    {
      id: 'sobre',
      label: 'Sobre a redação',
      modalTitle: 'Sobre a Redação',
      modalContent:
        'O Plantão Esportivo é um portal de jornalismo esportivo brasileiro independente, fundado em 2026. Nossa redação é composta por repórteres, colunistas e analistas dedicados à cobertura ágil, transparente e fundamentada em dados sobre futebol, modalidades olímpicas, atletismo de rua e políticas públicas do esporte.'
    },
    {
      id: 'expediente',
      label: 'Expediente',
      modalTitle: 'Expediente',
      modalContent:
        'Direção Editorial: Rafael Tavares\nEditora Executiva: Juliana Prado\nChefia de Reportagem: Lucas Campos\nCorrespondente de Ciclismo: Marcos Velloso\nAnálise de Políticas Públicas: Helena Alves\nTecnologia & Dados: Redação Digital SP.'
    },
    {
      id: 'trabalhe',
      label: 'Trabalhe conosco',
      modalTitle: 'Trabalhe Conosco',
      modalContent:
        'Interessado em fazer parte da equipe de cobertura esportiva do Plantão? Envie seu currículo e portfólio para redacao@plantaoesportivo.com.br com o assunto "Talentos Plantão 2026".'
    },
    {
      id: 'privacidade',
      label: 'Política de privacidade',
      modalTitle: 'Política de Privacidade & Termos',
      modalContent:
        'O Plantão Esportivo respeita sua privacidade e atua em conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018). Seus dados cadastrais de newsletter nunca são compartilhados ou comercializados com terceiros.'
    },
    {
      id: 'contato',
      label: 'Contato',
      modalTitle: 'Fale com a Redação',
      modalContent:
        'Sugestões de pauta, correções e parcerias comerciais:\nE-mail: contato@plantaoesportivo.com.br\nWhatsApp da Redação: (11) 98765-4321\nEndereço: Av. Paulista, 1000 - Bela Vista, São Paulo, SP.'
    }
  ]
};

const STORAGE_KEY = 'plantao_footer_config_v1';

export function mergeFooterConfig(partial?: Partial<FooterTextConfig> | null): FooterTextConfig {
  if (!partial || typeof partial !== 'object') {
    return {
      ...DEFAULT_FOOTER_CONFIG,
      institutionalItems: DEFAULT_FOOTER_CONFIG.institutionalItems.map((item) => ({ ...item }))
    };
  }

  const mergedItems = Array.isArray(partial.institutionalItems) && partial.institutionalItems.length > 0
    ? partial.institutionalItems.map((item, idx) => {
        const fallback = DEFAULT_FOOTER_CONFIG.institutionalItems[idx] || {
          id: `item-${idx}`,
          label: 'Link Institucional',
          modalTitle: 'Informação Institucional',
          modalContent: ''
        };
        return {
          id: item.id || fallback.id,
          label: typeof item.label === 'string' && item.label.trim() ? item.label.trim() : fallback.label,
          modalTitle:
            typeof item.modalTitle === 'string' && item.modalTitle.trim()
              ? item.modalTitle.trim()
              : fallback.modalTitle,
          modalContent:
            typeof item.modalContent === 'string' && item.modalContent.trim()
              ? item.modalContent.trim()
              : fallback.modalContent
        };
      })
    : DEFAULT_FOOTER_CONFIG.institutionalItems.map((item) => ({ ...item }));

  return {
    brandBio:
      typeof partial.brandBio === 'string' && partial.brandBio.trim()
        ? partial.brandBio.trim()
        : DEFAULT_FOOTER_CONFIG.brandBio,
    newsletterTitle:
      typeof partial.newsletterTitle === 'string' && partial.newsletterTitle.trim()
        ? partial.newsletterTitle.trim()
        : DEFAULT_FOOTER_CONFIG.newsletterTitle,
    newsletterSubtitle:
      typeof partial.newsletterSubtitle === 'string' && partial.newsletterSubtitle.trim()
        ? partial.newsletterSubtitle.trim()
        : DEFAULT_FOOTER_CONFIG.newsletterSubtitle,
    newsletterButtonText:
      typeof partial.newsletterButtonText === 'string' && partial.newsletterButtonText.trim()
        ? partial.newsletterButtonText.trim()
        : DEFAULT_FOOTER_CONFIG.newsletterButtonText,
    copyrightText:
      typeof partial.copyrightText === 'string' && partial.copyrightText.trim()
        ? partial.copyrightText.trim()
        : DEFAULT_FOOTER_CONFIG.copyrightText,
    companyInfoText:
      typeof partial.companyInfoText === 'string' && partial.companyInfoText.trim()
        ? partial.companyInfoText.trim()
        : DEFAULT_FOOTER_CONFIG.companyInfoText,
    developerLabel:
      typeof partial.developerLabel === 'string' && partial.developerLabel.trim()
        ? partial.developerLabel.trim()
        : DEFAULT_FOOTER_CONFIG.developerLabel,
    developerCredit:
      typeof partial.developerCredit === 'string' && partial.developerCredit.trim()
        ? partial.developerCredit.trim()
        : DEFAULT_FOOTER_CONFIG.developerCredit,
    institutionalItems: mergedItems
  };
}

export function loadFooterConfig(): FooterTextConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mergeFooterConfig(null);
    return mergeFooterConfig(JSON.parse(raw));
  } catch {
    return mergeFooterConfig(null);
  }
}

export function saveFooterConfig(config: FooterTextConfig): FooterTextConfig {
  const sanitized = mergeFooterConfig(config);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // ignore storage errors
  }
  return sanitized;
}

export function resetFooterConfig(): FooterTextConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return mergeFooterConfig(null);
}
