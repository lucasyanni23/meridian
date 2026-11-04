/* =====================================================================
   MERIDIAN: VICE COAST — CONTEÚDO DO SITE
   Edite os textos aqui. Tudo o que aparece no site sai deste arquivo.

   • Imagens: coloque o arquivo em public/img/ e preencha o campo "img"
     (ex.: img: "img/torre-meridian.jpg"). Vazio = arte provisória.
   • Vagas: o "id" de cada vaga é usado no banco de dados e nas regras
     do Firestore. Se criar novas vagas, siga o padrão faccao-numero e
     atualize a função validSlot em firestore.rules.
   ===================================================================== */

window.MV_DATA = {
  rp: {
    nome: "Meridian",
    sub: "Vice Coast",
    cenario: "Miami, 2026",
    estilo: "Textual · +25 linhas",
    plataforma: "WhatsApp",
    tags: ["Succession", "Narcos", "Miami Vice"],
    tagline: "Uma miragem néon rosa e azul elétrico construída sobre areia, sangue e notas de cem dólares.",
    resumo: "O império corporativo da Família Castillo, construído sobre lavagem de dinheiro, estremece com a ausência do patriarca. Enquanto os herdeiros brigam pelo trono, a Família Navarro tenta tomar a coroa, o Cartel Los Huesos exige seus lucros e uma Força-Tarefa policial fecha o cerco.",
    prazoFichaHoras: 72
  },

  sinopse: {
    titulo: "Bem-vindos à Vice Coast.",
    paragrafos: [
      "Essa história começa antes da chegada dos próprios pais fundadores. Miami, outrora terra do povo Tequesta, se tornaria no século XX a Magic City: a vitrine de centenas de impérios destinados à ascensão e à queda, à glória e à derrota.",
      "Na cidade néon, dividida entre o luxo clássico dos anos 80 e a ganância das start-ups, a fachada tropical esconde tramas sangrentas em que a glória e o poder são o destino final.",
      "Tudo gira em torno da poderosa Família Castillo. Pioneiros do ramo petrolífero regional, são herdeiros de Pierre Castillo, empresário cubano que chegou à cidade na década de 1950. Com o crescimento da Castillo Co., a diversificação dos investimentos fez dos Castillo donos do maior conglomerado bancário da costa leste: o Meridian Bank.",
      "O ar da cidade, engolido pelos verões quentes e chuvosos da costa caribenha, sempre carregou o cheiro de dinheiro novo. Nos anos 80, quando as lanchas cruzavam a baía de madrugada e as malas de dinheiro vivo lotavam os cofres de Brickell, o Meridian Bank aprendeu a não fazer perguntas. Cada dólar sujo que entrava em Miami saía limpo, carimbado com o sobrenome Castillo.",
      "Quarenta anos depois, o império é uma máquina corporativa impecável: torres de vidro, fundos de investimento, contratos com o porto e assentos nos conselhos que decidem o futuro da cidade. Por baixo do verniz, a lavanderia nunca parou de funcionar. Só ficou mais sofisticada.",
      "Até que Alejandro Castillo desapareceu. Há três semanas o patriarca não é visto em público. A versão oficial fala em tratamento médico na Suíça. Nos corredores da Torre Meridian, ninguém sabe se ele está vivo, preso ou escondido, e ninguém tem coragem de perguntar em voz alta.",
      "A ausência abriu uma rachadura no trono. Victoria segura a empresa com mão de ferro, Julian se prepara para herdar o que acredita ser seu e Valentina parece determinada a incendiar tudo o que a família construiu.",
      "Do outro lado da baía, a Família Navarro sente cheiro de sangue na água. Donos das noites de South Beach, dos cassinos e de um fluxo cada vez maior de criptomoedas, os Navarro querem mais do que concorrer com os Castillo. Querem a coroa.",
      "Nos fundos de Little Havana, o Cartel Los Huesos acompanha tudo com impaciência. Durante décadas, o Meridian Bank lavou o dinheiro deles sem atrasos. Agora as remessas atrasam e El Cardenal começa a cobrar a conta à sua maneira.",
      "No meio do fogo cruzado, a Força-Tarefa de Miami fecha o cerco com escutas, mandados e informantes. O problema é que nem todo distintivo serve ao mesmo senhor.",
      "Quatro forças. Vinte peças. Uma cidade que nunca dorme e nunca esquece. Na Vice Coast, todo mundo tem um preço. A pergunta é quem vai pagar primeiro."
    ],
    linhaDoTempo: [
      { ano: "Antes de 1800", titulo: "Terra Tequesta", texto: "O povo Tequesta vive às margens do rio Miami e da baía de Biscayne, muito antes de qualquer arranha-céu." },
      { ano: "1896", titulo: "Nasce a Magic City", texto: "Miami é incorporada como cidade e cresce tão rápido que ganha o apelido que carrega até hoje." },
      { ano: "1957", titulo: "Pierre Castillo desembarca", texto: "Vindo de Havana com capital do petróleo e um plano, o patriarca fundador começa a comprar terrenos perto do porto." },
      { ano: "1982", titulo: "Nasce o Meridian Bank", texto: "Alejandro Castillo compra um banco regional em Brickell e o transforma na maior instituição financeira da costa leste." },
      { ano: "1986", titulo: "O acordo", texto: "As primeiras contas do Cartel Los Huesos são abertas no Meridian. Dinheiro vivo entra, dinheiro limpo sai." },
      { ano: "2019", titulo: "Os Navarro sobem", texto: "Dante Navarro assume os negócios da família e leva boates e cassinos para as apostas online e as criptomoedas." },
      { ano: "2026", titulo: "A ausência", texto: "Alejandro Castillo some dos holofotes. Começa a guerra pela coroa da Vice Coast." }
    ]
  },

  faccoes: [
    {
      id: "castillo",
      nome: "Dinastia Castillo",
      curto: "Castillo",
      cor: "#F2C36B",
      eyebrow: "THE ESTABLISHED EMPIRE",
      tags: "BANKING • OIL • DYNASTY",
      poder: "Infraestrutura, bancos e lavagem em grande escala",
      resumo: "Monopólio da infraestrutura, poder corporativo e lavagem de dinheiro em grande escala.",
      galeria: [
        { rotulo: "Sede", titulo: "Torre Meridian, Brickell", img: "" },
        { rotulo: "Território", titulo: "Port of Miami", img: "" },
        { rotulo: "Residência", titulo: "Mansão em Star Island", img: "" }
      ],
      historiaTitulo: "O dinheiro mais limpo de Miami é o mais sujo.",
      historia: [
        "Os Castillo chegaram a Miami com dinheiro de petróleo e a ambição de quem perdeu um país. Pierre Castillo deixou Havana nos anos 1950 e, em uma década, já negociava combustível com metade dos portos do Caribe.",
        "O filho, Alejandro, transformou a fortuna em império. Comprou um banco regional em Brickell, rebatizou-o de Meridian Bank e fez dele o maior conglomerado financeiro da costa leste.",
        "O que os relatórios anuais não contam é como o banco cresceu tão rápido. Nos anos 80, o Meridian virou a lavanderia preferida de quem precisava transformar dinheiro vivo em respeitabilidade. Contas offshore, construtoras de fachada e contratos superfaturados com o porto passaram a mover bilhões sem deixar rastro.",
        "Hoje os Castillo são donos de arranha-céus, de assentos em conselhos, de campanhas políticas e da maior parte do porto. São convidados para todos os bailes de caridade e temidos em todas as reuniões de diretoria.",
        "Há três semanas, Alejandro desapareceu. Victoria assumiu o comando com a frieza de quem esperou a vida toda por isso. Julian, o herdeiro, conta os dias para o testamento. Valentina, a filha que ninguém consegue controlar, sabe de coisas que poderiam derrubar a família inteira.",
        "Fora do sangue, dois nomes sustentam o império: Arthur Sterling, que garante que cada contêiner chegue ao destino certo, e Elena Rostova, a advogada que sabe exatamente onde estão enterrados todos os segredos.",
        "Os Castillo sempre venceram porque ninguém enxergava as rachaduras. Pela primeira vez, a cidade inteira está olhando."
      ],
      perfil: [
        { rotulo: "Recursos", texto: "Meridian Bank, Castillo Co., construtoras, contratos com o porto e políticos na folha de pagamento." },
        { rotulo: "Território", texto: "Brickell, Star Island e o Port of Miami." },
        { rotulo: "Ponto fraco", texto: "Um trono vazio. Sem Alejandro, cada herdeiro joga para si e o cartel exige garantias." }
      ],
      tracos: [
        { rotulo: "Cabelos", texto: "Castanho-escuro a preto, lisos ou ondulados." },
        { rotulo: "Olhos", texto: "Castanho, mel ou verde." },
        { rotulo: "Pele", texto: "Clara, oliva ou morena clara, com subtom quente." }
      ],
      vagas: [
        { id: "castillo-1", papel: "Patriarca / Matriarca", nome: "Victoria Castillo", img: "", desc: "Com Alejandro fora de cena, é ela quem assina os cheques e decide quem sobrevive. Elegante, calculista e disposta a sacrificar qualquer um, até os próprios filhos, para manter o império de pé.", nota: "Alejandro Castillo, o patriarca ausente, fica nas mãos do mestre." },
        { id: "castillo-2", papel: "O Herdeiro Legítimo", nome: "Julian Castillo", img: "", desc: "Criado para o trono desde o berço. Julian acredita que o império é seu por direito e está pronto para provar isso, mesmo que precise passar por cima da mãe." },
        { id: "castillo-3", papel: "A Ovelha Negra", nome: "Valentina Castillo", img: "", desc: "Festas, escândalos e manchetes. Finge não se importar com os negócios, mas guarda segredos capazes de levar a família inteira para a cadeia." },
        { id: "castillo-4", papel: "O Diretor de Logística", nome: "Arthur Sterling", img: "", desc: "O homem do porto. Controla rotas, contêineres e a papelada que faz cargas impossíveis parecerem legais. Leal aos Castillo, ou ao menos ao salário deles." },
        { id: "castillo-5", papel: "A Advogada", nome: "Elena Rostova", img: "", desc: "Fria, brilhante e sempre três jogadas à frente. Conhece cada contrato, cada conta offshore e cada acordo enterrado. Se ela falar, a dinastia cai." }
      ]
    },
    {
      id: "navarro",
      nome: "Família Navarro",
      curto: "Navarro",
      cor: "#FF5FA2",
      eyebrow: "THE NEW MONEY",
      tags: "CASINOS • NIGHTLIFE • CRYPTO",
      poder: "Cassinos, boates, chantagem e lavagem por cripto e apostas",
      resumo: "Os rivais. Cassinos, boates, chantagem tecnológica e lavagem por cripto e apostas.",
      galeria: [
        { rotulo: "Sede", titulo: "Boate Neon Mirage", img: "" },
        { rotulo: "Território", titulo: "Ocean Drive", img: "" },
        { rotulo: "Residência", titulo: "Cobertura em Miami Beach", img: "" }
      ],
      historiaTitulo: "A noite tem dono. E ele quer o dia também.",
      historia: [
        "Os Navarro não herdaram Miami. Compraram a cidade uma madrugada de cada vez.",
        "A família começou com um único clube em Ocean Drive, nos anos 90. O velho Navarro sabia que, depois da meia-noite, a elite fala demais, bebe demais e assina qualquer coisa. O que acontecia nas salas VIP virava favor, e o favor virava poder.",
        "Dante Navarro levou esse instinto para o século XXI. Transformou as boates em um império de entretenimento, abriu cassinos, lançou plataformas de apostas online e montou uma rede de lavagem por criptomoedas que nenhum regulador consegue rastrear direito.",
        "Hoje a Neon Mirage é o lugar onde senadores, herdeiros e traficantes dividem o mesmo sofá, e cada conversa é gravada por câmeras que só Izzy Navarro sabe onde estão.",
        "Por mais dinheiro que tenham, os Navarro continuam sendo tratados como novos-ricos. Os Castillo nunca os convidaram para a mesa principal. Com o patriarca rival desaparecido, Dante decidiu que não precisa de convite.",
        "O plano é simples e brutal: roubar o cartel dos Castillo, tomar o porto e provar que o dinheiro antigo de Miami é só isso, antigo."
      ],
      perfil: [
        { rotulo: "Recursos", texto: "Boates, cassinos, plataformas de apostas, carteiras cripto e um arquivo de vídeos comprometedores." },
        { rotulo: "Território", texto: "South Beach e Ocean Drive, neutros na aparência e controlados nas sombras." },
        { rotulo: "Ponto fraco", texto: "Dinheiro rápido atrai atenção rápida. A Força-Tarefa já está de olho nas carteiras digitais." }
      ],
      tracos: [
        { rotulo: "Cabelos", texto: "Castanho médio a preto, lisos, ondulados ou cacheados." },
        { rotulo: "Olhos", texto: "Castanho-escuro, âmbar ou mel." },
        { rotulo: "Pele", texto: "Oliva, morena clara ou morena." }
      ],
      vagas: [
        { id: "navarro-1", papel: "O Visionário (CEO)", nome: "Dante Navarro", img: "", desc: "Arrogante, moderno e impiedoso. Fala em disrupção nas entrevistas e em extorsão nas reuniões privadas. Quer a coroa dos Castillo e acha que já merece." },
        { id: "navarro-2", papel: "A Dona da Noite", nome: "Isabella “Izzy” Navarro", img: "", desc: "Gerencia as boates, a lista VIP e o fluxo de segredos que passa por elas. Sabe quem traiu, quem se excedeu e quem pagou para esquecer." },
        { id: "navarro-3", papel: "A Espiã Corporativa", nome: "Catalina Cruz ou Roxanne Vane", img: "", desc: "Sedutora e letal. Entra onde os Navarro não passam pela porta da frente e volta com o que ninguém deveria saber.", nota: "Quem reservar escolhe qual dos dois nomes usar." },
        { id: "navarro-4", papel: "O Agente de Lavagem", nome: "Silas Reed", img: "", desc: "Gênio das finanças obscuras. Transforma fichas de cassino, apostas e criptomoedas em dinheiro limpo mais rápido que qualquer banco." },
        { id: "navarro-5", papel: "O Chefe de Segurança", nome: "Hector “Blindado” Silva", img: "", desc: "Comanda a milícia privada dos Navarro. Ex-militar, poucas palavras e nenhum remorso. Quando a negociação falha, quem resolve é ele." }
      ]
    },
    {
      id: "huesos",
      nome: "Cartel Los Huesos",
      curto: "Los Huesos",
      cor: "#FF7A59",
      eyebrow: "THE CRIMINAL CORE",
      tags: "CASH • BLOOD • SUPPLY",
      poder: "Dinheiro vivo sem fim, força letal e o produto",
      resumo: "O núcleo criminoso. Dinheiro vivo infinito, força letal rápida e os fornecedores do produto.",
      galeria: [
        { rotulo: "Sede", titulo: "Café La Palma, Little Havana", img: "" },
        { rotulo: "Território", titulo: "Armazém 42, no porto", img: "" },
        { rotulo: "Refúgio", titulo: "Pista 7, Everglades", img: "" }
      ],
      historiaTitulo: "Todo império de Miami tem um fornecedor.",
      historia: [
        "Ninguém sabe ao certo de onde veio o nome. Alguns dizem que é pelos ossos que nunca foram encontrados. Outros, que o cartel chega até o osso de qualquer negócio em que encosta.",
        "Los Huesos abastece Miami desde os anos 80. Enquanto a cidade crescia em vidro e néon, o cartel crescia por baixo: rotas marítimas, pistas clandestinas nos Everglades e uma rede de comércios de fachada em Little Havana.",
        "O acordo com os Castillo sempre foi simples. O cartel traz o dinheiro vivo, o Meridian Bank devolve dinheiro limpo e ninguém faz perguntas. Durante quarenta anos, funcionou.",
        "Joaquín “El Cardenal” Garza herdou esse acordo e o protegeu com pragmatismo e paciência. Mas paciência tem limite. Desde o sumiço de Alejandro, as remessas atrasam, os contadores do banco evitam ligações e alguém está desviando rotas no porto.",
        "Os Navarro já fizeram uma proposta. A polícia aperta o cerco. E dentro do próprio cartel, alguém está falando demais.",
        "El Cardenal ainda não decidiu se vai salvar o acordo ou queimar a cidade. Só sabe que alguém vai pagar."
      ],
      perfil: [
        { rotulo: "Recursos", texto: "Dinheiro vivo sem fim, rotas de contrabando, armas e um senador na folha de pagamento." },
        { rotulo: "Território", texto: "Little Havana e o Armazém 42, no porto." },
        { rotulo: "Ponto fraco", texto: "Um rato dentro de casa e um parceiro bancário que parou de atender o telefone." }
      ],
      tracos: [],
      vagas: [
        { id: "huesos-1", papel: "El Jefe / O Patrão", nome: "Joaquín “El Cardenal” Garza", img: "", desc: "Líder intocável e pragmático. Fala baixo, nunca levanta a voz e nunca perdoa. Prefere negociar, mas não hesita quando o negócio exige sangue." },
        { id: "huesos-2", papel: "O Sicário Chefe", nome: "Diego “Sangre” Ochoa", img: "", desc: "O braço armado do cartel. Violento, leal e imprevisível. Quando El Cardenal precisa mandar um recado, Diego é o mensageiro." },
        { id: "huesos-3", papel: "A Contrabandista de Luxo", nome: "Esmeralda Soto", img: "", desc: "Transita entre a alta sociedade e o porto com a mesma elegância. Iates, galerias de arte e malas diplomáticas: tudo serve para o produto chegar." },
        { id: "huesos-4", papel: "O Negociador Corrupto", nome: "Senador William Hayes", img: "", desc: "Discursa contra o crime em Tallahassee e recebe envelopes em Miami. Comprado pelo cartel, cortejado pelos Navarro e vigiado pela polícia." },
        { id: "huesos-5", papel: "O Rato (Informante)", nome: "Luis “Lucho” Delgado", img: "", desc: "Trabalha para o cartel e vaza para a polícia. Vive no meio, com medo dos dois lados, e sabe que um erro é o fim." }
      ]
    },
    {
      id: "forca",
      nome: "Força-Tarefa de Miami",
      curto: "Força-Tarefa",
      cor: "#5CD2F2",
      eyebrow: "THE LAW",
      tags: "BADGES • WIRES • WARRANTS",
      poder: "O Estado: escutas, mandados e informantes",
      resumo: "O núcleo policial. Poder do Estado, escutas e mandados, travados por burocracia e corrupção interna.",
      galeria: [
        { rotulo: "Sede", titulo: "Quartel da Força-Tarefa", img: "" },
        { rotulo: "Território", titulo: "Marina de Coconut Grove", img: "" },
        { rotulo: "Operação", titulo: "Sala de escuta", img: "" }
      ],
      historiaTitulo: "Um distintivo não diz de que lado você está.",
      historia: [
        "A Força-Tarefa de Miami nasceu de uma promessa de campanha: limpar a cidade do dinheiro sujo. Reúne detetives da polícia local, agentes federais e uma promotora que precisa de resultados antes da próxima eleição.",
        "No papel, eles têm tudo: escutas autorizadas, mandados, acesso a dados bancários e uma lista de alvos que inclui os sobrenomes mais poderosos da cidade.",
        "Na prática, têm burocracia, orçamento curto e um problema que ninguém admite: alguém lá dentro vaza as operações antes que elas aconteçam.",
        "Ray Callahan conhece Miami há trinta anos e sabe que ninguém nessa cidade é inocente, nem ele. David Miller chegou de Washington acreditando que dá para vencer sem sujar as mãos. Maya Lin ouve tudo, e o que ela guarda vale mais que qualquer mandado.",
        "Com o sumiço de Alejandro Castillo, a Força-Tarefa enxerga a maior oportunidade em décadas. Se a dinastia rachar, alguém vai falar. A questão é se a polícia chega antes do cartel."
      ],
      perfil: [
        { rotulo: "Recursos", texto: "Escutas, mandados, dados bancários, informantes e o peso do Estado." },
        { rotulo: "Território", texto: "Quartel em Downtown e encontros noturnos na Marina de Coconut Grove." },
        { rotulo: "Ponto fraco", texto: "Um policial comprado dentro da equipe e uma promotora mais preocupada com as câmeras do que com a verdade." }
      ],
      tracos: [],
      vagas: [
        { id: "forca-1", papel: "O Detetive Veterano", nome: "Ray Callahan", img: "", desc: "Quebra regras, sabe de tudo e não confia em ninguém. Trinta anos de Miami ensinaram que justiça e lei raramente andam juntas." },
        { id: "forca-2", papel: "O Agente do DEA", nome: "David Miller", img: "", desc: "O forasteiro idealista e incorruptível. Veio de Washington para derrubar o cartel e ainda acredita que pode fazer isso pelas regras." },
        { id: "forca-3", papel: "A Especialista em Grampos", nome: "Maya Lin", img: "", desc: "Hacker e técnica da polícia. Ouve as ligações, lê as mensagens e decide o que chega aos relatórios. É dona dos segredos de todo mundo." },
        { id: "forca-4", papel: "O Policial Comprado", nome: "Det. Tony Rossi", img: "", desc: "Sorri nas reuniões e sabota as operações. Recebe dos criminosos, deve favores a mais de um lado e vive com medo de ser descoberto." },
        { id: "forca-5", papel: "A Promotora / Capitã", nome: "Evelyn Vance", img: "", desc: "Focada em mídia e reeleição. Quer uma prisão espetacular antes de novembro e não se importa muito com quem vai pagar o preço." }
      ]
    }
  ],

  /* Independentes: personagens criados do zero pelo jogador, sem facção.
     "vagas" é quantas pessoas podem ter aquela profissão.
     "nivel": "comum" (até 3), "especializada" (até 2) ou "alta" (1).
     Os ids das vagas ficam ind-<id>-1, ind-<id>-2... Se mudar a lista ou as
     quantidades, atualize a função validSlot em firestore.rules. */
  independentes: {
    id: "independentes",
    nome: "Cidadãos de Miami",
    curto: "Independentes",
    cor: "#A5B4FF",
    eyebrow: "NO FLAG · CITIZENS OF MIAMI",
    tags: "WORK • HUSTLE • SURVIVAL",
    poder: "Nenhum sobrenome por trás. Só o que você sabe e quem você conhece.",
    resumo: "Personagens criados por você, com profissões comuns da cidade. Sem facção, sem bandeira e com muito a perder.",
    historiaTitulo: "Nem todo mundo em Miami responde a um sobrenome.",
    historia: [
      "Entre as torres dos Castillo, as boates dos Navarro e as ruas do cartel, a cidade continua funcionando. Alguém serve as bebidas, dirige os carros, costura os feridos e assina as sentenças.",
      "Personagens independentes não pertencem a nenhuma facção. Você cria o nome, a história e as ligações. Pode se aliar a qualquer lado, trair todos ou só tentar sobreviver ao fogo cruzado.",
      "Quanto mais alta e específica a profissão, menos vagas existem. As de alto escalão têm uma vaga só."
    ],
    perfil: [
      { rotulo: "Como funciona", texto: "Escolha uma profissão, reserve a vaga e crie o personagem do zero na ficha." },
      { rotulo: "Liberdade", texto: "Sem facção fixa. Alianças, dívidas e lealdades nascem em cena." },
      { rotulo: "Limite", texto: "Uma vaga por jogador, como em qualquer facção." }
    ],
    niveis: {
      comum: { nome: "Comum", regra: "até 3 vagas" },
      especializada: { nome: "Especializada", regra: "até 2 vagas" },
      alta: { nome: "Alto escalão", regra: "1 vaga" }
    },
    profissoes: [
      { id: "bartender", nome: "Bartender", nivel: "comum", vagas: 3,
        desc: "Atrás do balcão de um bar de Ocean Drive ou de Little Havana, ouve mais segredos do que qualquer padre. Sabe quem bebe com quem e quem paga a conta." },
      { id: "estudante", nome: "Estudante universitário(a)", nivel: "comum", vagas: 3,
        desc: "Vive de bolsa, festa e bico. Fácil de recrutar, fácil de manipular, fácil de esquecer. Precisa ter 18 anos ou mais." },
      { id: "motorista", nome: "Motorista de aplicativo", nivel: "comum", vagas: 2,
        desc: "Roda a cidade inteira de madrugada. Já levou senador para o endereço errado e pacote que não devia estar no porta-malas." },
      { id: "salvavidas", nome: "Salva-vidas de South Beach", nivel: "comum", vagas: 2,
        desc: "Torre colorida, binóculo e a melhor vista da praia mais vigiada de Miami. Vê quem chega de lancha e quem não volta." },
      { id: "influencer", nome: "Influenciador(a) digital", nivel: "comum", vagas: 2,
        desc: "Vive de stories em cobertura emprestada e convites VIP. Uma postagem pode lançar alguém ou começar um escândalo." },
      { id: "dj", nome: "DJ", nivel: "comum", vagas: 2,
        desc: "Toca nas noites da Neon Mirage e nas festas de Star Island. Conhece todo mundo que importa depois da meia-noite." },
      { id: "tatuador", nome: "Tatuador(a)", nivel: "comum", vagas: 2,
        desc: "Estúdio em Wynwood e agenda cheia de gente perigosa. Cada tatuagem conta de que lado a pessoa está." },
      { id: "mecanico", nome: "Mecânico(a)", nivel: "comum", vagas: 2,
        desc: "Oficina em Hialeah, especialista em carros esporte e lanchas. Não pergunta por que o fundo falso do carro precisa de reparo." },
      { id: "enfermeiro", nome: "Enfermeiro(a)", nivel: "especializada", vagas: 2,
        desc: "Plantão no pronto-socorro, onde chegam os feridos que ninguém quer registrar. Sabe costurar uma bala e esquecer o rosto." },
      { id: "jornalista", nome: "Jornalista", nivel: "especializada", vagas: 2,
        desc: "Repórter de um jornal local em crise, atrás da matéria que pode derrubar uma dinastia ou fazer alguém sumir." },
      { id: "corretor", nome: "Corretor(a) de imóveis", nivel: "especializada", vagas: 2,
        desc: "Vende coberturas em Brickell para compradores que pagam à vista e sem perguntas. A lavanderia mais elegante da cidade." },
      { id: "advogado", nome: "Advogado(a)", nivel: "especializada", vagas: 2,
        desc: "Escritório próprio e clientes de todos os lados. Defende quem paga melhor e guarda o sigilo de quem paga mais." },
      { id: "juiz", nome: "Juiz(a)", nivel: "alta", vagas: 1,
        desc: "Toga no tribunal do condado de Miami-Dade. Cada mandado e cada sentença passam pela sua mesa, e todo mundo quer saber o seu preço." },
      { id: "medico", nome: "Médico(a) cirurgião(ã)", nivel: "alta", vagas: 1,
        desc: "Chefe de cirurgia num grande hospital. Salva vidas de dia e atende pacientes particulares à noite, em salas sem prontuário." },
      { id: "legista", nome: "Médico(a) legista", nivel: "alta", vagas: 1,
        desc: "Assina a causa da morte. Um laudo seu pode encerrar uma investigação ou começar uma guerra." },
      { id: "detetive", nome: "Detetive particular", nivel: "alta", vagas: 1,
        desc: "Ex-policial com escritório em cima de uma lavanderia em Little Havana. Trabalha para quem paga: esposas desconfiadas, herdeiros e, às vezes, a própria polícia." }
    ]
  },

  /* Locais: "faccao" é o id de quem controla (ou "neutro").
     "mapa" posiciona o ponto no mapa estilizado (x de 0 a 360, y de 0 a 440). */
  bairros: [
    { id: "south-beach", nome: "South Beach / Ocean Drive", coord: "25.7826° N · 80.1341° W", faccao: "navarro", img: "img/south-beach.webp", mapa: { x: 292, y: 262 },
      texto: "O coração do néon. Turistas, carros esporte e hotéis Art Déco. Território neutro de aparências, controlado nas sombras pelos Navarro." },
    { id: "brickell", nome: "Brickell", coord: "25.7601° N · 80.1936° W", faccao: "castillo", img: "", mapa: { x: 148, y: 272 },
      texto: "Distrito financeiro de arranha-céus de vidro e sedes corporativas. Onde os Castillo reinam absolutos por meio de construtoras e bancos de investimento." },
    { id: "little-havana", nome: "Little Havana", coord: "25.7735° N · 80.2200° W", faccao: "huesos", img: "", mapa: { x: 78, y: 250 },
      texto: "Cultura, restaurantes familiares e charutarias. Nos fundos de comércios de fachada, o Cartel Los Huesos gerencia seu império de rua e distribui ordens." },
    { id: "porto", nome: "Port of Miami", coord: "25.7781° N · 80.1700° W", faccao: "castillo", disputa: true, img: "", mapa: { x: 210, y: 248 },
      texto: "Labirinto de contêineres e guindastes gigantes. O ponto logístico mais disputado do jogo, hoje sob posse dos Castillo." }
  ],

  locais: [
    { id: "mansao", nome: "Mansão Castillo", bairro: "Star Island", faccao: "castillo", img: "", mapa: { x: 248, y: 226 },
      texto: "Fortaleza hipervigiada. Cenário das festas da alta sociedade e das reuniões de emergência da dinastia." },
    { id: "neon-mirage", nome: "Boate Neon Mirage", bairro: "South Beach", faccao: "navarro", img: "", mapa: { x: 300, y: 292 },
      texto: "Salas VIP à prova de som onde a elite fecha acordos, se excede e é filmada em segredo para futuras chantagens." },
    { id: "marina", nome: "Marina de Coconut Grove", bairro: "Coconut Grove", faccao: "forca", img: "", mapa: { x: 118, y: 362 },
      texto: "Lanchas abandonadas e iates de luxo. Ponto de encontro sombrio, muito usado pela polícia para falar com informantes no meio da noite." },
    { id: "armazem-42", nome: "Armazém 42", bairro: "Port of Miami", faccao: "huesos", img: "", mapa: { x: 228, y: 252 },
      texto: "Setor do porto supostamente abandonado, usado como base do cartel e ponto de entrega de armamento pesado." },
    { id: "torre-meridian", nome: "Torre Meridian", bairro: "Brickell", faccao: "castillo", novo: true, img: "", mapa: { x: 144, y: 290 },
      texto: "Sede do Meridian Bank. Quarenta andares de vidro espelhado. O cofre de verdade fica três níveis abaixo da garagem." },
    { id: "la-palma", nome: "Café La Palma", bairro: "Little Havana", faccao: "huesos", novo: true, img: "", mapa: { x: 64, y: 266 },
      texto: "Café cubano, dominó na calçada e o melhor cortadito da Calle Ocho. A sala dos fundos é onde El Cardenal recebe visitas." },
    { id: "quartel", nome: "Quartel da Força-Tarefa", bairro: "Downtown", faccao: "forca", novo: true, img: "", mapa: { x: 150, y: 222 },
      texto: "Dois andares alugados num prédio federal discreto. Quadro de suspeitos, café ruim e escutas ligadas 24 horas por dia." },
    { id: "pista-7", nome: "Pista 7", bairro: "Everglades", faccao: "huesos", novo: true, img: "", mapa: { x: 26, y: 150 },
      texto: "Uma pista de pouso de terra no meio do pântano. Aviões pequenos chegam sem luzes e partem antes do amanhecer." }
  ],

  regras: {
    aviso: "Rascunho inicial. Ajuste à vontade no arquivo data.js.",
    dinamica: [
      { rotulo: "Grupo principal (ON)", texto: "Somente narração dentro do personagem: ações, diálogos e cenas. Posts com no mínimo 25 linhas, em terceira pessoa." },
      { rotulo: "Grupo OFF", texto: "Conversa entre jogadores, avisos, combinação de cenas e dúvidas. O que é dito no OFF não existe dentro da história." },
      { rotulo: "Mestre", texto: "Narra os eventos da cidade (manchetes, operações policiais, festas, golpes) e decide o resultado dos conflitos." }
    ],
    lista: [
      { titulo: "Respeito vem primeiro", texto: "Nada de ataques pessoais, preconceito ou exposição de jogadores. Conflito é entre personagens, nunca entre pessoas." },
      { titulo: "Atividade", texto: "Poste pelo menos uma vez a cada 5 dias ou avise sua ausência no OFF. Sem aviso por 7 dias, a vaga pode ser liberada." },
      { titulo: "Sem metagaming", texto: "Seu personagem só sabe o que viveu em cena. Informação lida no OFF ou em cenas de outras pessoas não pode ser usada." },
      { titulo: "Sem powerplay", texto: "Não controle o personagem de outra pessoa nem decida sozinho o resultado de uma ação contra ele." },
      { titulo: "Mortes e prisões", texto: "Só com consentimento do jogador ou em eventos anunciados pelo mestre com antecedência." },
      { titulo: "Conflitos e dados", texto: "Quando duas ações se chocam (tiroteio, perseguição, roubo), o mestre pode rolar um d20 no OFF. Cargo e recursos da facção dão bônus." },
      { titulo: "Conteúdo", texto: "Crime, violência e drogas fazem parte da história, mas sem descrições extremamente gráficas. Conteúdo sexual explícito não é permitido no grupo." },
      { titulo: "Personagens adultos", texto: "Todos os personagens e faceclaims têm 18 anos ou mais. Cada faceclaim só pode ser usado uma vez no elenco." },
      { titulo: "Reservas e fichas", texto: "A reserva vale por 72 horas. Envie a ficha pelo Painel. Depois da aprovação, o link do grupo aparece no seu Painel." }
    ]
  }
};
