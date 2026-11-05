export interface Article {
  id: string;
  title: string;
  dek: string;
  category: 'Futebol' | 'Corrida de Rua' | 'Ciclismo' | 'Esportes' | 'Política' | 'Editoriais';
  subcategory?: 'Regional' | 'Nacional' | 'Internacional' | 'Calendário' | 'Treino' | 'Estrada' | 'Opinião';
  badgeColor?: 'blue' | 'red' | 'yellow';
  author: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
    publishedCount: number;
    social: { twitter?: string; instagram?: string };
  };
  publishedAt: string;
  readTime: string;
  readCount: string;
  imageBg: string; // CSS gradient or image representation
  imageCaption: string;
  imageCredit: string;
  heroTag?: string;
  leadParagraph: string;
  content: Array<{
    type: 'paragraph' | 'heading' | 'quote' | 'stats' | 'video' | 'nextGame';
    text?: string;
    quoteAuthor?: string;
    quoteRole?: string;
    stats?: Array<{ label: string; value: string; detail: string; percent: number; isHome?: boolean }>;
    videoDuration?: string;
    videoCaption?: string;
  }>;
  tags: string[];
  commentsCount: number;
  initialComments: Array<{
    id: string;
    author: string;
    avatar: string;
    time: string;
    isEditor?: boolean;
    text: string;
    likes: number;
  }>;
}

export interface LiveMatch {
  id: string;
  tournament: string;
  minute: string;
  isLive: boolean;
  statusText: string;
  homeTeam: {
    name: string;
    shortName: string;
    crestBg: string;
    score: number;
  };
  awayTeam: {
    name: string;
    shortName: string;
    crestBg: string;
    score: number;
  };
  stadium: string;
  events: Array<{
    minute: string;
    team: 'home' | 'away';
    type: 'goal' | 'yellow' | 'red' | 'sub';
    player: string;
    detail?: string;
  }>;
  stats: {
    possession: [number, number];
    shots: [number, number];
    shotsOnTarget: [number, number];
    corners: [number, number];
    fouls: [number, number];
  };
}

export interface StandingsRow {
  position: number;
  team: string;
  shortName: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDiff: number;
  crestColor: string;
}

export const INITIAL_STANDINGS: StandingsRow[] = [
  { position: 1, team: 'Palmeiras', shortName: 'PAL', points: 62, played: 28, won: 19, drawn: 5, lost: 4, goalDiff: 28, crestColor: '#16a34a' },
  { position: 2, team: 'Flamengo', shortName: 'FLA', points: 61, played: 27, won: 19, drawn: 4, lost: 4, goalDiff: 26, crestColor: '#dc2626' },
  { position: 3, team: 'Botafogo', shortName: 'BOT', points: 54, played: 28, won: 16, drawn: 6, lost: 6, goalDiff: 18, crestColor: '#111827' },
  { position: 4, team: 'Corinthians', shortName: 'COR', points: 49, played: 28, won: 14, drawn: 7, lost: 7, goalDiff: 11, crestColor: '#1f2937' },
  { position: 5, team: 'São Paulo', shortName: 'SAO', points: 47, played: 28, won: 13, drawn: 8, lost: 7, goalDiff: 9, crestColor: '#dc2626' },
  { position: 6, team: 'Internacional', shortName: 'INT', points: 45, played: 28, won: 12, drawn: 9, lost: 7, goalDiff: 7, crestColor: '#ef4444' },
  { position: 7, team: 'Grêmio', shortName: 'GRE', points: 43, played: 28, won: 12, drawn: 7, lost: 9, goalDiff: 4, crestColor: '#0284c7' },
  { position: 8, team: 'Fortaleza', shortName: 'FOR', points: 41, played: 28, won: 11, drawn: 8, lost: 9, goalDiff: 2, crestColor: '#2563eb' }
];

export const INITIAL_MATCHES: LiveMatch[] = [
  {
    id: 'm1',
    tournament: 'Brasileirão Série A',
    minute: "78'",
    isLive: true,
    statusText: 'AO VIVO',
    stadium: 'Allianz Parque, São Paulo',
    homeTeam: { name: 'Palmeiras', shortName: 'PAL', crestBg: '#16a34a', score: 2 },
    awayTeam: { name: 'Corinthians', shortName: 'COR', crestBg: '#111827', score: 1 },
    events: [
      { minute: "18'", team: 'away', type: 'goal', player: 'Yuri Alberto', detail: 'Chute rasteiro da entrada da área' },
      { minute: "47'", team: 'home', type: 'goal', player: 'Estêvão', detail: 'Giro rápido entre dois zagueiros' },
      { minute: "53'", team: 'home', type: 'goal', player: 'Endrick', detail: 'Finalização de primeira após escanteio' },
      { minute: "68'", team: 'away', type: 'yellow', player: 'Fagner', detail: 'Falta tática no meio-campo' }
    ],
    stats: {
      possession: [54, 46],
      shots: [11, 6],
      shotsOnTarget: [4, 3],
      corners: [6, 3],
      fouls: [12, 16]
    }
  },
  {
    id: 'm2',
    tournament: 'Brasileirão Série A',
    minute: "62'",
    isLive: true,
    statusText: 'AO VIVO',
    stadium: 'Maracanã, Rio de Janeiro',
    homeTeam: { name: 'Flamengo', shortName: 'FLA', crestBg: '#dc2626', score: 2 },
    awayTeam: { name: 'Fortaleza', shortName: 'FOR', crestBg: '#2563eb', score: 0 },
    events: [
      { minute: "24'", team: 'home', type: 'goal', player: 'Pedro', detail: 'Cabeceio no ângulo' },
      { minute: "58'", team: 'home', type: 'goal', player: 'Arrascaeta', detail: 'Cobrança de falta magistral' }
    ],
    stats: {
      possession: [62, 38],
      shots: [14, 5],
      shotsOnTarget: [6, 1],
      corners: [7, 2],
      fouls: [9, 14]
    }
  },
  {
    id: 'm3',
    tournament: 'Copa do Brasil • Final',
    minute: 'Intervalo',
    isLive: false,
    statusText: 'Intervalo',
    stadium: 'Arena do Grêmio, Porto Alegre',
    homeTeam: { name: 'Grêmio', shortName: 'GRE', crestBg: '#0284c7', score: 1 },
    awayTeam: { name: 'Internacional', shortName: 'INT', crestBg: '#dc2626', score: 1 },
    events: [
      { minute: "14'", team: 'home', type: 'goal', player: 'Cristaldo', detail: 'Pênalti convertido com categoria' },
      { minute: "39'", team: 'away', type: 'goal', player: 'Alan Patrick', detail: 'Finalização colocada de fora da área' },
      { minute: "44'", team: 'home', type: 'yellow', player: 'Kannemann' }
    ],
    stats: {
      possession: [49, 51],
      shots: [7, 7],
      shotsOnTarget: [3, 3],
      corners: [4, 4],
      fouls: [14, 15]
    }
  },
  {
    id: 'm4',
    tournament: 'Série B • Rodada 34',
    minute: 'Encerrado',
    isLive: false,
    statusText: 'FIM DE JOGO',
    stadium: 'Rei Pelé, Maceió',
    homeTeam: { name: 'CRB', shortName: 'CRB', crestBg: '#991b1b', score: 3 },
    awayTeam: { name: 'CSA', shortName: 'CSA', crestBg: '#1e40af', score: 2 },
    events: [
      { minute: "12'", team: 'home', type: 'goal', player: 'Anselmo Ramon' },
      { minute: "30'", team: 'away', type: 'goal', player: 'Robinho' },
      { minute: "75'", team: 'home', type: 'goal', player: 'Léo Pereira' },
      { minute: "84'", team: 'away', type: 'goal', player: 'Tomas Bastos' },
      { minute: "90+2'", team: 'home', type: 'goal', player: 'Gegê' }
    ],
    stats: {
      possession: [52, 48],
      shots: [15, 12],
      shotsOnTarget: [7, 5],
      corners: [8, 5],
      fouls: [18, 19]
    }
  },
  {
    id: 'm5',
    tournament: 'Premier League',
    minute: "34'",
    isLive: true,
    statusText: 'AO VIVO',
    stadium: 'Etihad Stadium, Manchester',
    homeTeam: { name: 'Manchester City', shortName: 'MCI', crestBg: '#38bdf8', score: 1 },
    awayTeam: { name: 'Liverpool', shortName: 'LIV', crestBg: '#dc2626', score: 0 },
    events: [
      { minute: "19'", team: 'home', type: 'goal', player: 'Haaland', detail: 'Assistência de De Bruyne' }
    ],
    stats: {
      possession: [58, 42],
      shots: [8, 4],
      shotsOnTarget: [3, 1],
      corners: [5, 2],
      fouls: [6, 8]
    }
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'palmeiras-corinthians-virada',
    title: 'Palmeiras vira sobre o Corinthians nos acréscimos e assume a liderança do Brasileirão',
    dek: 'Com dois gols em sete minutos, o Verdão encerra jejum de cinco anos em clássicos e chega a 62 pontos, abrindo três de vantagem na ponta.',
    category: 'Futebol',
    subcategory: 'Nacional',
    badgeColor: 'yellow',
    heroTag: 'Clássico Paulista',
    author: {
      name: 'Ricardo Menezes',
      role: 'Repórter de futebol',
      avatar: 'RM',
      bio: 'Repórter de futebol há 11 anos, cobre Palmeiras e o Campeonato Brasileiro desde a Série B. Escreve sobre tática, bastidores e a rotina dos clubes paulistas.',
      publishedCount: 142,
      social: { twitter: '@ricardo_menezes', instagram: '@menezes_futebol' }
    },
    publishedAt: '3 de novembro de 2026, 22h47',
    readTime: '6 min de leitura',
    readCount: '24,8 mil leituras',
    imageBg: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #dc2626 100%)',
    imageCaption: 'Torcida do Palmeiras celebra o gol da virada nos acréscimos no Allianz Parque',
    imageCredit: 'Foto: Divulgação / Plantão Esportivo',
    leadParagraph: 'O Palmeiras virou o placar sobre o Corinthians nos acréscimos da segunda etapa, em um Allianz Parque lotado, e assumiu a liderança isolada do Campeonato Brasileiro. Com o gol de Estêvão aos 47 minutos e o de Endrick aos 53, o Verdão reverteu a desvantagem construída pelo Corinthians em um primeiro tempo de muita marcação, e encerrou um jejum de cinco anos sem vencer o rival em clássicos disputados no estádio.',
    content: [
      {
        type: 'paragraph',
        text: 'Ao término de 90 minutos marcados por disputas intensas no meio-campo e poucas chances claras, a partida parecia caminhar para uma vitória alvinegra até que a entrada de Facundo Torres, aos 31 minutos do segundo tempo, mudou a intensidade do time mandante. Foi dele o cruzamento que desmontou a defesa alvinegra e abriu o caminho para a virada.'
      },
      {
        type: 'heading',
        text: 'O jogo e a postura tática'
      },
      {
        type: 'paragraph',
        text: 'O Corinthians começou melhor, com pressão alta e troca de passes rápida, e chegou ao gol aos 18 minutos com Yuri Alberto, que aproveitou sobra após chute de fora da área. O Palmeiras reagiu com paciência, equilibrou a posse no fim da primeira etapa e teve nos pés de Raphael Veiga as melhores oportunidades antes do intervalo, sem conseguir transformá-las em gols.'
      },
      {
        type: 'paragraph',
        text: 'No segundo tempo, o técnico alviverde promoveu três alterações e recuperou o controle do meio-campo. A equipe passou a ocupar o terço final com mais frequência, mas esbarrou em um goleiro que fez ao menos quatro defesas difíceis antes de falhar no lance decisivo.'
      },
      {
        type: 'quote',
        text: 'Não é sobre o placar em um momento, é sobre o time acreditar até o último segundo. Hoje o grupo mostrou caráter e isso vale mais que três pontos na tabela.',
        quoteAuthor: 'Abel Ferreira',
        quoteRole: 'Treinador do Palmeiras em entrevista coletiva pós-jogo'
      },
      {
        type: 'heading',
        text: 'A virada nos acréscimos'
      },
      {
        type: 'paragraph',
        text: 'Aos 47 minutos, Estêvão recebeu entre dois zagueiros, girou e finalizou rasteiro no canto esquerdo para empatar o clássico. A torcida explodiu, e o Palmeiras seguiu no ataque. Seis minutos depois, em uma cobrança de escanteio que sobrou na intermediária, Endrick antecipou a marcação e chutou de primeira para decretar a virada, aos 53 minutos.'
      },
      {
        type: 'stats',
        stats: [
          { label: 'Posse de bola', value: '54%', detail: 'Palmeiras 54% × 46% Corinthians', percent: 54, isHome: true },
          { label: 'Finalizações', value: '17', detail: 'Palmeiras 11 × 6 Corinthians', percent: 65, isHome: true },
          { label: 'Chutes a gol', value: '7', detail: 'Palmeiras 4 × 3 Corinthians', percent: 57, isHome: false },
          { label: 'Escanteios', value: '9', detail: 'Palmeiras 6 × 3 Corinthians', percent: 67, isHome: true }
        ]
      },
      {
        type: 'heading',
        text: 'O que muda na tabela'
      },
      {
        type: 'paragraph',
        text: 'Com os três pontos, o Palmeiras chega a 62 e abre um ponto de vantagem sobre o Flamengo, que ainda tem uma partida a menos. O Corinthians, com 49, perde a chance de se aproximar da ponta e precisa de reação imediata para não se distanciar da zona de classificação à Copa Libertadores.'
      },
      {
        type: 'video',
        videoDuration: '2:34',
        videoCaption: 'Melhores momentos: gols e lances polêmicos do clássico paulista'
      },
      {
        type: 'nextGame',
        text: 'Próximos jogos: Palmeiras x Vasco — dom., 8/11, 16h (Allianz Parque) · Cuiabá x Corinthians — qua., 11/11, 20h30 (Arena Pantanal).'
      }
    ],
    tags: ['Palmeiras', 'Corinthians', 'Brasileirão', 'Clássico Paulista', 'Virada', 'Série A'],
    commentsCount: 24,
    initialComments: [
      {
        id: 'c1',
        author: 'Marcos Pereira',
        avatar: 'MP',
        time: 'há 2 horas',
        isEditor: true,
        text: 'Virada de quem não desiste. Os últimos dez minutos foram de cair o queixo — a leitura do lance do Estêvão no empate já mostra o que foi o clássico.',
        likes: 31
      },
      {
        id: 'c2',
        author: 'Juliana Alves',
        avatar: 'JA',
        time: 'há 3 horas',
        text: 'Esse Endrick é outro patamar. Quarta participação direta contra o rival nesta temporada, e ainda vem decidindo jogo grande. Agora é segurar a ponta.',
        likes: 18
      },
      {
        id: 'c3',
        author: 'Rafael Souza',
        avatar: 'RS',
        time: 'há 5 horas',
        text: 'O Corinthians jogou bem no primeiro tempo e não aproveitou para matar. A defesa do goleiro no segundo tempo foi o que segurou o placar por tanto tempo.',
        likes: 9
      }
    ]
  },
  {
    id: 'flamengo-palmeiras-lideranca',
    title: 'Flamengo vira sobre o Palmeiras e acirra a disputa pelo título nacional',
    dek: 'Dois gols no segundo tempo, uma expulsão e uma atuação de garra no Maracanã colocam o time rubro-negro na briga direta pelo topo.',
    category: 'Futebol',
    subcategory: 'Regional',
    badgeColor: 'yellow',
    heroTag: 'Destaque da Rodada',
    author: {
      name: 'Rafael Tavares',
      role: 'Colunista de Futebol',
      avatar: 'RT',
      bio: 'Colunista do Plantão Esportivo, especialista em futebol carioca e torneios sul-americanos.',
      publishedCount: 215,
      social: { twitter: '@rafael_tavares' }
    },
    publishedAt: '4 de novembro de 2026, 08h15',
    readTime: '5 min de leitura',
    readCount: '19,2 mil leituras',
    imageBg: 'linear-gradient(135deg, #1e3a8a 0%, #111827 70%, #dc2626 140%)',
    imageCaption: 'Maracanã em festa com a atuação do Flamengo na reta final',
    imageCredit: 'Foto: Divulgação / Redação',
    leadParagraph: 'Diante de mais de 65 mil torcedores no Maracanã, o Flamengo mostrou força coletiva para reverter um placar adverso e conquistar três pontos cruciais que mantêm o campeonato em aberto a poucas rodadas do encerramento.',
    content: [
      {
        type: 'paragraph',
        text: 'A partida começou em ritmo frenético com os visitantes abrindo o placar logo aos 9 minutos. No entanto, o ajuste tático no intervalo colocou Arrascaeta e Pedro como protagonistas absolutos da segunda etapa.'
      },
      {
        type: 'quote',
        text: 'Nosso torcedor joga junto quando o time mostra essa intensidade. Essa vitória nos dá moral para a reta final.',
        quoteAuthor: 'Filipe Luís',
        quoteRole: 'Técnico do Flamengo'
      },
      {
        type: 'stats',
        stats: [
          { label: 'Posse de bola', value: '59%', detail: 'Flamengo 59% × 41% Palmeiras', percent: 59, isHome: true },
          { label: 'Finalizações', value: '19', detail: 'Flamengo 13 × 6 Palmeiras', percent: 68, isHome: true }
        ]
      }
    ],
    tags: ['Flamengo', 'Maracanã', 'Brasileirão', 'Título'],
    commentsCount: 16,
    initialComments: [
      {
        id: 'fc1',
        author: 'Guilherme Silva',
        avatar: 'GS',
        time: 'há 1 hora',
        text: 'O Maracanã tremeu ontem! Campeonato totalmente indefinido, emoção até a última rodada.',
        likes: 14
      }
    ]
  },
  {
    id: 'maratona-sp-recorde',
    title: 'Maratona de São Paulo bate recorde de inscritos e ganha novo percurso na Paulista',
    dek: 'Com 45 mil atletas confirmados, a prova de outubro estreia trecho na Avenida Paulista e passagem inédita pelo Parque Ibirapuera.',
    category: 'Corrida de Rua',
    subcategory: 'Calendário',
    badgeColor: 'red',
    heroTag: 'Corrida de Rua',
    author: {
      name: 'Juliana Prado',
      role: 'Especialista em Corrida e Endurance',
      avatar: 'JP',
      bio: 'Maratonista e jornalista esportiva, cobrindo o circuito de provas de rua pelo Brasil e pelo mundo há mais de uma década.',
      publishedCount: 98,
      social: { instagram: '@juliana_prado_run' }
    },
    publishedAt: '4 de novembro de 2026, 07h30',
    readTime: '4 min de leitura',
    readCount: '12,5 mil leituras',
    imageBg: 'linear-gradient(160deg, #111827 0%, #1e3a8a 80%)',
    imageCaption: 'Corredores cruzando o Obelisco do Ibirapuera na largada antecipada',
    imageCredit: 'Foto: Organização / Maratona de SP',
    leadParagraph: 'A principal prova de 42 km do país quebrou todos os registros históricos de adesão para a temporada 2026. A alteração no traçado foi desenhada para oferecer menores desníveis e favorecer a quebra de recordes pessoais.',
    content: [
      {
        type: 'paragraph',
        text: 'Além da prova clássica de 42 km, o evento contará com categorias de 21 km (meia maratona), 10 km e 5 km, com postos de hidratação e reposição isotônica a cada 2.500 metros.'
      },
      {
        type: 'quote',
        text: 'Ouvimos as demandas dos corredores amadores e das assessorias esportivas para criar uma maratona mais fluida e segura.',
        quoteAuthor: 'Eduardo Fontes',
        quoteRole: 'Diretor técnico da prova'
      }
    ],
    tags: ['Maratona', 'São Paulo', 'Avenida Paulista', 'Corrida de Rua', 'Endurance'],
    commentsCount: 9,
    initialComments: [
      {
        id: 'mc1',
        author: 'Carla Nogueira',
        avatar: 'CN',
        time: 'há 2 horas',
        text: 'Inscrita na minha primeira maratona! O percurso novo parece sensacional para quem busca RP.',
        likes: 12
      }
    ]
  },
  {
    id: 'ciclismo-volta-parana',
    title: 'Brasileiro conquista etapa rainha da Volta do Paraná em chegada eletrizante',
    dek: 'Após 180 quilômetros de fuga e subidas íngremes, o ciclista paranaense bate o pelotão no sprint e veste a camisa amarela.',
    category: 'Ciclismo',
    subcategory: 'Estrada',
    badgeColor: 'blue',
    heroTag: 'Ciclismo de Estrada',
    author: {
      name: 'Marcos Velloso',
      role: 'Correspondente de Ciclismo',
      avatar: 'MV',
      bio: 'Jornalista especializado em ciclismo de estrada, mountain bike e competições UCI no Brasil e na Europa.',
      publishedCount: 112,
      social: { twitter: '@marcos_ciclismo' }
    },
    publishedAt: '4 de novembro de 2026, 06h50',
    readTime: '4 min de leitura',
    readCount: '9,8 mil leituras',
    imageBg: 'linear-gradient(120deg, #dc2626 0%, #111827 75%)',
    imageCaption: 'Pelotão cortando a Serra do Mar em ritmo acelerado',
    imageCredit: 'Foto: Federação Paranaense de Ciclismo',
    leadParagraph: 'A quinta etapa da Volta Ciclística do Paraná exigiu resistência extrema sob sol forte. O sprint final em declive coroou uma fuga de quase quatro horas montada por quatro atletas nacionais.',
    content: [
      {
        type: 'paragraph',
        text: 'Com a vitória na etapa, o ciclista assume a liderança geral com uma vantagem de 18 segundos sobre o vice-líder colombiano, restando apenas duas etapas para a consagração.'
      }
    ],
    tags: ['Ciclismo', 'Volta do Paraná', 'Velocidade', 'Sprint', 'UCI'],
    commentsCount: 5,
    initialComments: []
  },
  {
    id: 'politica-clubes-empresa',
    title: 'Ministério do Esporte anuncia novas diretrizes de governança para SAFs e clubes-empresa',
    dek: 'Proposta prevê rigorosa transparência contábil, limite de endividamento e proteção aos direitos de representação do associado e do sócio-torcedor.',
    category: 'Política',
    subcategory: 'Opinião',
    badgeColor: 'blue',
    author: {
      name: 'Helena Alves',
      role: 'Analista de Política Esportiva',
      avatar: 'HA',
      bio: 'Advogada e jornalista, especialista em direito desportivo, gestão pública e financiamento de programas esportivos no Brasil.',
      publishedCount: 84,
      social: { twitter: '@helena_esporte' }
    },
    publishedAt: '4 de novembro de 2026, 08h00',
    readTime: '5 min de leitura',
    readCount: '8,4 mil leituras',
    imageBg: 'linear-gradient(135deg, #1e3a8a, #0f766e)',
    imageCaption: 'Plenário do Ministério durante audiência sobre o modelo das SAFs',
    imageCredit: 'Foto: Agência Brasil',
    leadParagraph: 'O Ministério do Esporte apresentou nesta quarta-feira uma minuta com novas exigências de conformidade para clubes que optaram pela transformação em Sociedade Anônima do Futebol (SAF).',
    content: [
      {
        type: 'paragraph',
        text: 'A medida surge após casos recentes de inadimplência em fundos de investimento que adquiriram direitos federativos de agremiações tradicionais.'
      }
    ],
    tags: ['Política Esportiva', 'SAF', 'Clubes-empresa', 'Legislação'],
    commentsCount: 11,
    initialComments: []
  },
  {
    id: 'editorial-preco-ingressos',
    title: 'O preço do ingresso e o silenciamento do torcedor tradicional nas arenas',
    dek: 'Coluna analisa o impacto da elitização desenfreada dos estádios no espetáculo das arquibancadas e na formação de novos torcedores.',
    category: 'Editoriais',
    subcategory: 'Opinião',
    badgeColor: 'blue',
    author: {
      name: 'Rafael Tavares',
      role: 'Colunista de Futebol',
      avatar: 'RT',
      bio: 'Colunista do Plantão Esportivo, especialista em futebol carioca e torneios sul-americanos.',
      publishedCount: 215,
      social: { twitter: '@rafael_tavares' }
    },
    publishedAt: '3 de novembro de 2026, 17h00',
    readTime: '6 min de leitura',
    readCount: '15,6 mil leituras',
    imageBg: 'linear-gradient(135deg, #7f1d1d, #111827)',
    imageCaption: 'Arquibancada com torcedores em partida decisiva',
    imageCredit: 'Foto: Plantão Esportivo',
    leadParagraph: 'O futebol brasileiro vive um paradoxo: nunca faturou tanto com bilheteria e camarotes, mas nunca esteve tão distante do perfil socioeconômico da esmagadora maioria de quem o construiu.',
    content: [
      {
        type: 'paragraph',
        text: 'Transformar o estádio em um centro de consumo premium é uma escolha de mercado legítima para os balanços financeiros, mas tem um custo cultural irreparável para o pertencimento comunitário.'
      },
      {
        type: 'quote',
        text: 'O futebol não pertence a acionistas ou patrocinadores de ocasião. Pertence a quem passou a vida nas arquibancadas de cimento transmitindo a paixão aos filhos.',
        quoteAuthor: 'Rafael Tavares',
        quoteRole: 'Colunista'
      }
    ],
    tags: ['Editorial', 'Ingressos', 'Torcida', 'Arenas', 'Cultura'],
    commentsCount: 32,
    initialComments: []
  },
  {
    id: 'selecao-convocacao-novembro',
    title: 'Seleção convoca 26 atletas para os amistosos de novembro com 3 estreantes',
    dek: 'Lista divulgada pela CBF inclui retorno de zagueiro recuperado de lesão e oportunidades para jovens talentos do Brasileirão.',
    category: 'Futebol',
    subcategory: 'Nacional',
    badgeColor: 'red',
    author: {
      name: 'Lucas Campos',
      role: 'Repórter de Seleção',
      avatar: 'LC',
      bio: 'Cobre o dia a dia da Seleção Brasileira e torneios internacionais desde a Copa de 2018.',
      publishedCount: 130,
      social: { twitter: '@lucas_campos' }
    },
    publishedAt: '4 de novembro de 2026, 06h10',
    readTime: '4 min de leitura',
    readCount: '14,1 mil leituras',
    imageBg: 'linear-gradient(135deg, #facc15, #15803d)',
    imageCaption: 'Anúncio oficial da convocação na sede da CBF no Rio de Janeiro',
    imageCredit: 'Foto: CBF / Divulgação',
    leadParagraph: 'A Seleção Brasileira entra na reta preparatória para as eliminatórias com novidades nos setores de meio-campo e ataque, priorizando velocidade e intensidade na transição defensiva.',
    content: [
      {
        type: 'paragraph',
        text: 'Os confrontos marcados contra seleções europeias servirão de teste decisivo para fixar a base titular que disputará o ciclo mundialista.'
      }
    ],
    tags: ['Seleção Brasileira', 'CBF', 'Amistosos', 'Futebol'],
    commentsCount: 18,
    initialComments: []
  },
  {
    id: 'corinthians-reforco-12-milhoes',
    title: 'Corinthians fecha contratação de volante titular por 12 milhões de euros',
    dek: 'Jogador aprovado nos exames médicos assina vínculo de quatro temporadas e já treina com o elenco no CT Joaquim Grava.',
    category: 'Futebol',
    subcategory: 'Regional',
    badgeColor: 'yellow',
    author: {
      name: 'Lucas Campos',
      role: 'Repórter de Futebol',
      avatar: 'LC',
      bio: 'Repórter de clubes paulistas do Plantão Esportivo.',
      publishedCount: 130,
      social: { twitter: '@lucas_campos' }
    },
    publishedAt: '4 de novembro de 2026, 07h15',
    readTime: '3 min de leitura',
    readCount: '11,3 mil leituras',
    imageBg: 'linear-gradient(135deg, #111827, #374151)',
    imageCaption: 'Novo atleta corinthiano no centro de treinamento da equipe',
    imageCredit: 'Foto: Rodrigo Coca / Ag. Corinthians',
    leadParagraph: 'A diretoria alvinegra confirmou na manhã desta quarta-feira a formalização da transferência que vinha sendo negociada há mais de três semanas com o futebol europeu.',
    content: [
      {
        type: 'paragraph',
        text: 'Com características de marcação agressiva e boa saída de bola, o volante chega para suprir uma carência apontada pela comissão técnica desde o meio da temporada.'
      }
    ],
    tags: ['Corinthians', 'Mercado da Bola', 'Reforço', 'Brasileirão'],
    commentsCount: 8,
    initialComments: []
  },
  {
    id: 'atletismo-recorde-400m',
    title: 'Brasileira bate recorde sul-americano dos 400 metros rasos na Europa',
    dek: 'Atleta cravou 50s12 em competição internacional na Espanha e garantiu índice direto para o mundial de atletismo.',
    category: 'Esportes',
    badgeColor: 'blue',
    author: {
      name: 'Camila Nunes',
      role: 'Repórter de Esportes Olímpicos',
      avatar: 'CN',
      bio: 'Especialista em atletismo, natação, ginástica e esportes do ciclo olímpico brasileiro.',
      publishedCount: 76,
      social: { instagram: '@camila_olimpica' }
    },
    publishedAt: '4 de novembro de 2026, 06h20',
    readTime: '3 min de leitura',
    readCount: '7,9 mil leituras',
    imageBg: 'linear-gradient(135deg, #1e3a8a, #0f766e)',
    imageCaption: 'Chegada triunfal nos 400m rasos em Madri',
    imageCredit: 'Foto: World Athletics',
    leadParagraph: 'Com uma reta final avassaladora, a velocista nacional superou a marca que durava mais de oito anos e colocou o Brasil no top 5 mundial da temporada.',
    content: [
      {
        type: 'paragraph',
        text: 'A evolução consistente nos tempos consolida a atleta como uma das maiores esperanças de medalha para o país nas grandes competições globais.'
      }
    ],
    tags: ['Atletismo', 'Recorde', 'Esportes Olímpicos', 'Velocidade'],
    commentsCount: 7,
    initialComments: []
  },
  {
    id: 'corrida-noturna-curitiba',
    title: 'Corrida Noturna de Curitiba reúne 8 mil atletas com trajeto iluminado pela orla e Jardim Botânico',
    dek: 'Percursos de 5 e 10 km contaram com música ao vivo, pontos de hidratação e arrecadação de alimentos para comunidades locais.',
    category: 'Corrida de Rua',
    subcategory: 'Calendário',
    badgeColor: 'red',
    author: {
      name: 'Juliana Prado',
      role: 'Especialista em Corrida',
      avatar: 'JP',
      bio: 'Cobriu centenas de provas de rua no Brasil e no exterior.',
      publishedCount: 98,
      social: { instagram: '@juliana_prado_run' }
    },
    publishedAt: '4 de novembro de 2026, 05h45',
    readTime: '3 min de leitura',
    readCount: '6,4 mil leituras',
    imageBg: 'linear-gradient(135deg, #dc2626, #facc15)',
    imageCaption: 'Largada noturna com luzes de LED na capital paranaense',
    imageCredit: 'Foto: Divulgação / Corrida Noturna',
    leadParagraph: 'A temperatura amena de 19°C favoreceu o clima de confraternização e o alto rendimento dos corredores na noite de sábado em Curitiba.',
    content: [
      {
        type: 'paragraph',
        text: 'O formato noturno segue ganhando espaço no calendário brasileiro como uma alternativa para evitar as altas temperaturas do dia e atrair famílias inteiras.'
      }
    ],
    tags: ['Corrida Noturna', 'Curitiba', '5k', '10k', 'Corrida de Rua'],
    commentsCount: 4,
    initialComments: []
  }
];

export interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  date: string;
  gradientBg: string;
  views: string;
  category: string;
}

export const PORTAL_VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    title: 'Melhores momentos do clássico no Allianz Parque',
    subtitle: 'Gols de Estêvão e Endrick e lances da virada histórica nos acréscimos',
    duration: '4:32',
    date: 'há 3 h',
    gradientBg: 'linear-gradient(135deg, #1e3a8a, #dc2626)',
    views: '45,2 mil views',
    category: 'Futebol'
  },
  {
    id: 'v2',
    title: 'Bastidores da montagem da Maratona de São Paulo',
    subtitle: 'Como a equipe técnica estruturou o novo percurso na Paulista e Ibirapuera',
    duration: '7:18',
    date: 'ontem',
    gradientBg: 'linear-gradient(135deg, #dc2626, #111827)',
    views: '18,6 mil views',
    category: 'Corrida de Rua'
  },
  {
    id: 'v3',
    title: 'Entrevista exclusiva com o líder da Volta do Paraná',
    subtitle: 'O pedalista conta os detalhes da fuga de 180 km e a preparação para a serra',
    duration: '11:05',
    date: 'há 2 dias',
    gradientBg: 'linear-gradient(135deg, #111827, #facc15)',
    views: '12,9 mil views',
    category: 'Ciclismo'
  }
];

export interface Columnist {
  id: string;
  name: string;
  beat: string;
  region: string;
  avatar: string;
  gradient: string;
  bio: string;
  latestArticleId: string;
  latestArticleTitle: string;
}

export const PORTAL_COLUMNISTS: Columnist[] = [
  {
    id: 'col-1',
    name: 'Rafael Tavares',
    beat: 'Futebol',
    region: 'Rio de Janeiro',
    avatar: 'RT',
    gradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    bio: 'Análise tática, bastidores dos clubes cariocas e debates estruturais do esporte.',
    latestArticleId: 'editorial-preco-ingressos',
    latestArticleTitle: 'O preço do ingresso e o silenciamento do torcedor tradicional nas arenas'
  },
  {
    id: 'col-2',
    name: 'Juliana Prado',
    beat: 'Corrida de rua',
    region: 'São Paulo',
    avatar: 'JP',
    gradient: 'linear-gradient(135deg, #dc2626, #111827)',
    bio: 'Periodização de treinos, nutrição esportiva e cobertura das maiores maratonas.',
    latestArticleId: 'maratona-sp-recorde',
    latestArticleTitle: 'Maratona de São Paulo bate recorde de inscritos'
  },
  {
    id: 'col-3',
    name: 'Marcos Velloso',
    beat: 'Ciclismo',
    region: 'Paraná',
    avatar: 'MV',
    gradient: 'linear-gradient(135deg, #111827, #1e3a8a)',
    bio: 'Ciclismo de pista, provas de estrada e o cenário das equipes nacionais.',
    latestArticleId: 'ciclismo-volta-parana',
    latestArticleTitle: 'Brasileiro conquista etapa rainha da Volta do Paraná'
  },
  {
    id: 'col-4',
    name: 'Helena Alves',
    beat: 'Política Esportiva',
    region: 'Brasília',
    avatar: 'HA',
    gradient: 'linear-gradient(135deg, #0f766e, #1e3a8a)',
    bio: 'Direito desportivo, projetos de lei no Congresso e governança das federações.',
    latestArticleId: 'politica-clubes-empresa',
    latestArticleTitle: 'Ministério do Esporte anuncia novas diretrizes de governança para SAFs'
  }
];
