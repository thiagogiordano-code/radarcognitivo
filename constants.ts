import { Question, VarkType, KolbType, Course } from './types';

// Substitua a URL abaixo pelo link direto da sua imagem de logo
export const LOGO_URL = "https://placehold.co/600x200/020617/3b82f6/png?text=Thiago+Giordano+Siqueira%0AEncontrar+a+informa%C3%A7%C3%A3o+certa.+Ensinar+o+caminho.&font=roboto";

export const WELCOME_MESSAGE = `Olá! Eu sou o Prof. Thiago Giordano Siqueira e estarei com você nesta jornada para descobrir como você aprende melhor.

Todos nós temos um jeito único de aprender. Com poucos minutos, você vai identificar seu perfil de aprendizagem e receber recomendações personalizadas para estudar com mais prazer, foco e resultado.`;

export const COURSE_OPTIONS = [
  Course.ARQUIVOLOGIA,
  Course.BIBLIOTECONOMIA,
  Course.MUSEOLOGIA,
  Course.MESTRADO_PPGB,
  Course.DOUTORADO_PPGB,
  Course.OUTROS
];

export const PROFILE_DESCRIPTIONS = {
  VARK: {
    [VarkType.VISUAL]: "Você aprende melhor visualizando. Gráficos, diagramas, mapas mentais, slides coloridos e vídeos são ferramentas essenciais. Você tende a 'ver' a informação em sua mente e gosta de organizar ideias espacialmente.",
    [VarkType.AURAL]: "Você aprende melhor ouvindo e falando. Discussões em grupo, podcasts, palestras e explicar a matéria em voz alta funcionam muito bem para você. O silêncio absoluto pode não ser o melhor ambiente.",
    [VarkType.READ_WRITE]: "Você aprende melhor lendo e escrevendo. Listas, anotações detalhadas, livros, artigos e resumos escritos são seus melhores aliados. Você gosta de ver as palavras no papel e tem facilidade com textos.",
    [VarkType.KINESTHETIC]: "Você aprende melhor fazendo. A prática, exemplos da vida real, estudos de caso, simulações e experiências 'mão na massa' são fundamentais. Ficar muito tempo parado apenas ouvindo pode ser difícil."
  },
  KOLB: {
    [KolbType.ATIVO]: "Você gosta de se envolver em novas experiências aqui e agora. Tem mente aberta, é entusiasta e gosta de desafios. Aprende melhor quando há novidade, problemas imediatos para resolver e trabalho em equipe.",
    [KolbType.REFLEXIVO]: "Você prefere observar e pensar sobre as experiências de diferentes perspectivas. Coleta dados e analisa cuidadosamente antes de chegar a uma conclusão. Aprende melhor quando tem tempo para pensar, observar e ouvir antes de agir.",
    [KolbType.TEORICO]: "Você integra observações em teorias complexas e logicamente sólidas. Analisa problemas de forma vertical, passo a passo e lógica. Gosta de modelos, sistemas, conceitos abstratos e racionalidade.",
    [KolbType.PRAGMATICO]: "Você gosta de experimentar teorias, técnicas e ideias para ver se funcionam na prática. Busca novas ideias e a oportunidade de experimentá-las imediatamente. É prático, direto ao ponto e focado na resolução de problemas reais."
  }
};

export const PDF_MESSAGES = {
  GRADUATION: `Neste estágio da graduação, seu foco está na construção das bases conceituais e desenvolvimento da autonomia. Conhecer seu estilo de aprendizagem permitirá que você escolha métodos mais adequados ao seu perfil, evitando sobrecargas e aumentando seu prazer em aprender.\n\nUse este laudo como uma bússola pessoal, adaptando o que aprende à sua realidade prática e explorando estratégias que facilitem seu percurso universitário.`,
  MASTERS: `O mestrado exige uma aprendizagem mais autodirigida, crítica e reflexiva. Compreender como você aprende permite que otimize a leitura de artigos, a escrita acadêmica e a organização da pesquisa.\n\nEste laudo serve como um instrumento de autoconhecimento acadêmico, ajudando você a manter o foco, respeitar seu ritmo e construir uma rotina de estudos mais estratégica e sustentável.`,
  PHD: `O doutorado é um espaço de produção de conhecimento original, onde a gestão do tempo e da energia mental é vital. Seu perfil de aprendizagem pode ajudá-lo(a) a reconhecer gatilhos de produtividade e bloqueios cognitivos, além de orientar a forma como você conduz leituras críticas, escrita científica e discussões teóricas.\n\nEste laudo é uma ferramenta de metacognição aplicada, que coloca você no controle do seu processo de aprender, criar e inovar no campo da pesquisa.`,
  GENERAL: `Cada curso traz desafios e métodos próprios de aprendizagem. Este laudo revela como você funciona melhor cognitivamente, emocionalmente e estrategicamente diante do aprendizado.\n\nUse as orientações a seguir para adaptar seus estudos à sua realidade — seja na graduação, pós ou formação técnica. O autoconhecimento é seu aliado mais poderoso.`
};

export const VARK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Você precisa aprender a usar um novo software complexo. O que você prefere?",
    options: [
      { label: "Olhar diagramas e capturas de tela no manual.", value: VarkType.VISUAL },
      { label: "Conversar com alguém que já sabe usar.", value: VarkType.AURAL },
      { label: "Ler as instruções escritas passo a passo.", value: VarkType.READ_WRITE },
      { label: "Começar a clicar e descobrir na prática.", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 2,
    text: "Você vai dar instruções de caminho para um colega. Como você faz?",
    options: [
      { label: "Desenha um mapa.", value: VarkType.VISUAL },
      { label: "Explica verbalmente ('vire à direita, depois siga...').", value: VarkType.AURAL },
      { label: "Escreve a lista de ruas e direções.", value: VarkType.READ_WRITE },
      { label: "Vai junto com ele ou usa gestos para apontar.", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 3,
    text: "Ao se preparar para uma prova importante, você costuma:",
    options: [
      { label: "Analisar gráficos e esquemas do livro.", value: VarkType.VISUAL },
      { label: "Discutir o conteúdo com o professor ou colegas.", value: VarkType.AURAL },
      { label: "Ler suas anotações e resumos várias vezes.", value: VarkType.READ_WRITE },
      { label: "Refazer exercícios e simular a prova.", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 4,
    text: "Você comprou um móvel para montar. Sua primeira atitude é:",
    options: [
      { label: "Olhar as figuras do manual de montagem.", value: VarkType.VISUAL },
      { label: "Pedir para alguém ler as instruções enquanto você monta.", value: VarkType.AURAL },
      { label: "Ler atentamente todo o manual antes de começar.", value: VarkType.READ_WRITE },
      { label: "Pegar as ferramentas e tentar encaixar as peças.", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 5,
    text: "No tempo livre, você prefere:",
    options: [
      { label: "Olhar fotos, redes sociais visuais ou arte.", value: VarkType.VISUAL },
      { label: "Ouvir podcasts ou música.", value: VarkType.AURAL },
      { label: "Ler livros ou artigos.", value: VarkType.READ_WRITE },
      { label: "Praticar esportes ou atividades manuais.", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 6,
    text: "Quando o professor está explicando, o que mais te ajuda?",
    options: [
      { label: "Quando ele usa slides coloridos e esquemas.", value: VarkType.VISUAL },
      { label: "A entonação de voz e as explicações orais.", value: VarkType.AURAL },
      { label: "Textos de apoio e referências bibliográficas.", value: VarkType.READ_WRITE },
      { label: "Exemplos práticos e estudos de caso reais.", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 7,
    text: "Para lembrar de uma lista de tarefas, você:",
    options: [
      { label: "Visualiza a lista na mente ou usa post-its coloridos.", value: VarkType.VISUAL },
      { label: "Repete a lista em voz alta para si mesmo.", value: VarkType.AURAL },
      { label: "Escreve a lista em um papel ou app.", value: VarkType.READ_WRITE },
      { label: "Lembra das ações associadas (ex: andar até o banco).", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 8,
    text: "Você tem um problema técnico no computador. Você:",
    options: [
      { label: "Procura um vídeo tutorial mostrando a tela.", value: VarkType.VISUAL },
      { label: "Liga para o suporte técnico.", value: VarkType.AURAL },
      { label: "Lê a documentação de ajuda ou fóruns.", value: VarkType.READ_WRITE },
      { label: "Tenta mexer nas configurações até funcionar.", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 9,
    text: "Você está em um museu. O que chama sua atenção?",
    options: [
      { label: "O design das exposições e as imagens.", value: VarkType.VISUAL },
      { label: "O áudio-guia ou a explicação do monitor.", value: VarkType.AURAL },
      { label: "As placas de texto explicativo nas obras.", value: VarkType.READ_WRITE },
      { label: "As interações táteis e experiências práticas.", value: VarkType.KINESTHETIC },
    ]
  },
  {
    id: 10,
    text: "Ao escolher uma disciplina optativa, o que pesa mais?",
    options: [
      { label: "Se o material didático é visualmente rico.", value: VarkType.VISUAL },
      { label: "Se o professor é um bom orador.", value: VarkType.AURAL },
      { label: "Se há boa bibliografia disponível.", value: VarkType.READ_WRITE },
      { label: "Se há visitas técnicas ou laboratório.", value: VarkType.KINESTHETIC },
    ]
  }
];

export const KOLB_QUESTIONS: Question[] = [
  {
    id: 11,
    text: "Diante de um desafio acadêmico, você tende a:",
    options: [
      { label: "Agir imediatamente para resolver.", value: KolbType.ATIVO },
      { label: "Pensar sobre as causas antes de agir.", value: KolbType.REFLEXIVO },
      { label: "Consultar teorias que expliquem o problema.", value: KolbType.TEORICO },
      { label: "Testar uma solução para ver se funciona.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 12,
    text: "Em um trabalho em grupo, você assume o papel de:",
    options: [
      { label: "Quem motiva e puxa a execução.", value: KolbType.ATIVO },
      { label: "Quem observa e ouve as opiniões.", value: KolbType.REFLEXIVO },
      { label: "Quem organiza a estrutura lógica do trabalho.", value: KolbType.TEORICO },
      { label: "Quem foca em terminar no prazo e ser prático.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 13,
    text: "Você aprende melhor quando:",
    options: [
      { label: "Está envolvido em experiências novas.", value: KolbType.ATIVO },
      { label: "Tem tempo para observar e analisar.", value: KolbType.REFLEXIVO },
      { label: "Entende a lógica e os conceitos por trás.", value: KolbType.TEORICO },
      { label: "Vê uma aplicação prática imediata.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 14,
    text: "Quando recebe uma nova informação, você:",
    options: [
      { label: "Gosta de compartilhar e discutir logo.", value: KolbType.ATIVO },
      { label: "Gosta de ponderar sobre ela sozinho.", value: KolbType.REFLEXIVO },
      { label: "Tenta encaixá-la em modelos que já conhece.", value: KolbType.TEORICO },
      { label: "Pensa: 'Como posso usar isso hoje?'.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 15,
    text: "Sua maior força na aprendizagem é:",
    options: [
      { label: "Ter iniciativa e liderança.", value: KolbType.ATIVO },
      { label: "Ter imaginação e cautela.", value: KolbType.REFLEXIVO },
      { label: "Ter raciocínio lógico e abstrato.", value: KolbType.TEORICO },
      { label: "Ter objetividade e foco em resultados.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 16,
    text: "Você não gosta de aulas que:",
    options: [
      { label: "Sejam passivas demais, só ouvindo.", value: KolbType.ATIVO },
      { label: "Pulem de tópico sem tempo para pensar.", value: KolbType.REFLEXIVO },
      { label: "Sejam desorganizadas ou sem embasamento.", value: KolbType.TEORICO },
      { label: "Sejam puramente teóricas sem conexão real.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 17,
    text: "Para tomar uma decisão, você:",
    options: [
      { label: "Confia no instinto e vai.", value: KolbType.ATIVO },
      { label: "Considera todos os pontos de vista.", value: KolbType.REFLEXIVO },
      { label: "Analisa os fatos racionalmente.", value: KolbType.TEORICO },
      { label: "Escolhe a opção mais funcional.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 18,
    text: "Ao resolver um problema, você prefere:",
    options: [
      { label: "Brainstorming e tentativa e erro.", value: KolbType.ATIVO },
      { label: "Refletir sobre problemas similares passados.", value: KolbType.REFLEXIVO },
      { label: "Criar um modelo ou sistema.", value: KolbType.TEORICO },
      { label: "Buscar a solução técnica mais rápida.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 19,
    text: "Você se descreve como uma pessoa:",
    options: [
      { label: "Enérgica e espontânea.", value: KolbType.ATIVO },
      { label: "Cuidadosa e observadora.", value: KolbType.REFLEXIVO },
      { label: "Lógica e disciplinada.", value: KolbType.TEORICO },
      { label: "Realista e direta.", value: KolbType.PRAGMATICO },
    ]
  },
  {
    id: 20,
    text: "O feedback que mais te ajuda é:",
    options: [
      { label: "Aquele que me desafia a fazer de novo.", value: KolbType.ATIVO },
      { label: "Aquele que me faz pensar sobre minha postura.", value: KolbType.REFLEXIVO },
      { label: "Aquele que aponta erros conceituais.", value: KolbType.TEORICO },
      { label: "Aquele que me mostra como melhorar o resultado final.", value: KolbType.PRAGMATICO },
    ]
  }
];