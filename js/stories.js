// ============================================================================
// SUPER FIGHTERS - SISTEMA DE NARRATIVA, HISTÓRIAS E DIÁLOGOS DO MODO ARCADE
// Contém prólogos, diálogos de vitória, derrotas e finais épicos para os 11 lutadores
// ============================================================================

window.GAME_STORIES = {
  // --- 1. PRÓLOGOS DE CADA LUTADOR (Antes de iniciar a Torre Arcade) ---
  prologues: {
    dog: {
      title: 'A JORNADA DO SUPER CÃO CÓSMICO',
      text: 'Nascido nas ruas e forjado na lealdade, Unicão despertou poderes cósmicos ancestrais ao contemplar o céu noturno. Agora, o dragão tirano Vulcanus ameaça incinerar todas as cidades dos animais. Unicão veste suas faixas de combate e parte para subir a grande torre do torneio, determinado a proteger seus amigos e provar que o espírito do Super Cão é invencível!'
    },
    emerson: {
      title: 'O DESPERTAR DO ARQUITETO DE SISTEMAS',
      text: 'No coração do Data Center Matrix, Emerson detectou anomalias térmicas extremas: o fogo primordial do dragão Vulcanus está superaquecendo os nós do universo e corrompendo as conexões vitais. Munido de seus comandos SUDO, luvas de condução quântica e força bruta titânica, Emerson adentra o torneio para purgar todos os bugs, derrotar os mestres das arenas e restaurar o Uptime Eterno!'
    },
    nata: {
      title: 'NATÃ - O ARQUITETO DO CÓDIGO E DESENVOLVIMENTO',
      text: 'Diretamente do universo da engenharia de software e da arquitetura web, Natã despertou o poder supremo de materializar linhas de código em puro poder de combate. Seus golpes fluem com sintaxe semântica, tags HTML puras e cascatas de CSS inquebráveis. Ao saber que o dragão tirano Vulcanus está superaquecendo a infraestrutura mundial com bugs de fogo, Natã ajusta seu gi de batalha, compila seus algoritmos e parte para disparar o lendário Hadouken de HTML e CSS no topo da torre do torneio!'
    },
    andrey: {
      title: 'ANDREY - O MESTRE DA INTELIGÊNCIA ARTIFICIAL E REDES NEURAIS',
      text: 'Diretamente de seu laboratório quântico futurista cercado por cálculos tensoriais, matrizes multidimensionais e robôs de IA autônomos, Andrey previu através de modelos preditivos profundos que o dragão Vulcanus causaria o colapso térmico global. Vestindo seu lendário manto do Ducks de Anaheim, óculos de precisão quântica e punhos imbuídos com chamas de plasma verde esmeralda, Andrey calibra seus robôs de combate autônomos e entra no torneio para demonstrar que a matemática do futuro e a Inteligência Artificial superam qualquer força bruta!'
    },
    alligator: {
      title: 'O REINADO DO PANTANAL PROFUNDO',
      text: 'Brutus, o senhor incontestado dos pântanos e mangues, não aceita nenhum outro rei sobre a terra. O calor sufocante do vulcão de Vulcanus está secando as águas sagradas de seu clã. Com mandíbulas de aço e sua cauda destruidora, Brutus entra na torre para esmagar os rivais um a um e reivindicar o trono absoluto.'
    },
    capybara: {
      title: 'O CAMINHO DA ILUMINAÇÃO SERENA',
      text: 'Nas montanhas de bambu, Mestre Zen meditou por décadas até harmonizar o Chi da natureza. A fúria do torneio ameaça romper o equilíbrio universal. Com paciência inabalável, golpes circulares milenares e passos suaves, Mestre Zen decide ensinar aos combatentes que a verdadeira força não reside na raiva, mas na serenidade suprema.'
    },
    owl: {
      title: 'OS PERGAMINHOS DA NOITE ETERNA',
      text: 'Athena, sábia sacerdotisa do Templo Noturno, leu nas constelações o prenúncio da erupção do Grande Vulcão. Para selar a profecia sombria, ela precisará derrotar os maiores campeões e coletar as nove essências do torneio antes que o fogo de Vulcanus consuma o conhecimento de mil gerações.'
    },
    tiger: {
      title: 'O INSTINTO DO GUERREIRO INDOMÁVEL',
      text: 'Toramaru vive pela pureza do combate. Nascido nas selvas tempestuosas, ele busca apenas oponentes que levem seu estilo das Garras Flamejantes ao limite absoluto. Para Toramaru, a torre do torneio é o desafio supremo: cada vitória é um passo mais próximo do duelo lendário contra o dragão ancestral.'
    },
    bear: {
      title: 'O URSO DE FERRO DAS FLORESTAS DO NORTE',
      text: 'Ursus descende dos antigos guardiões boreais. Ele desceu das geleiras perpétuas quando sentiu a terra tremer com os passos de Vulcanus. Suas patas envoltas em faixas de linho e gelo são muralhas impenetráveis. Ele lutará até o fim para preservar as terras selvagens do inverno.'
    },
    gorilla: {
      title: 'A COROA DE OURO DA SELVA SAGRADA',
      text: 'Kongo, o titã de músculos de ébano e faixa dourada, protege sua tribo com honra de guerreiro. Ninguém entra em suas terras sem ser testado pelo impacto de seus punhos de montanha. Ele entra no torneio para provar que a lealdade e a coragem superam qualquer labareda.'
    },
    wolf: {
      title: 'O MITO DAS CHAMAS DO CERRADO',
      text: 'Guará carrega o fogo sagrado do Cerrado brasileiro em suas veias. Rápido como o vento da savana e feroz como a tempestade de brasas, ele não teme feras nem dragões. Com a faixa de sua pátria na testa, Guará corre em direção à torre para gravar seu nome no firmamento dos imortais.'
    },
    cat: {
      title: 'A SOMBRA DA NOITE OCULTA',
      text: 'Kage atua nas frestas invisíveis da história. Como o último grande mestre shinobi felino, ele foi contratado pelo conselho secreto para silenciar a besta do vulcão antes que ela desperte completamente. Seus passos são silenciosos; seu corte é mortal.'
    },
    dragon: {
      title: 'A RESSURREIÇÃO DO IMPÉRIO DE MAGMA',
      text: 'Vulcanus despertou de seu sono milenar sob as rochas vulcânicas. Ao ver as pequenas criaturas disputando territórios em suas terras ancestrais, o soberano das chamas alça voo com suas asas colossais para submeter todos os animais ao seu império de cinzas e fogo!'
    }
  },

  // --- 2. FRASES DE CONFRONTO ANTES DA LUTA (Pré-Batalha) ---
  getMatchDialogue: function(heroId, oppId) {
    const dialogues = {
      dog: {
        alligator: 'Cuidado onde pisa, jacaré! Minha agilidade supera mordidas maiores que a sua!',
        emerson: 'Mestre Emerson! Vamos ver se a velocidade celestial supera a largura de banda do seu servidor!',
        dragon: 'Seu reinado de terror acaba aqui, Vulcanus! O coração do Super Cão não queima no seu fogo!',
        default: 'Guarda alta! Vou lutar com toda a força do meu coração!'
      },
      emerson: {
        dog: 'Vamos calibrar seus pacotes cósmicos, Unicão! Veja se aguenta o clock do meu processador!',
        nata: 'Natã! Vejamos se seu frontend aguenta a sobrecarga e o throughput dos meus servidores de produção!',
        andrey: 'Andrey! Vamos ver se sua Inteligência Artificial prevê a velocidade de transmissão da minha fibra óptica!',
        dragon: 'Vulcanus, seu processo de magma está consumindo recursos demais. Hora do SUDO KILL -9!',
        default: 'Analisando padrões de ataque... Sistema pronto para compilar a vitória!'
      },
      nata: {
        emerson: 'Mestre Emerson! Você cuida do backend e da infra, mas a interface e o estilo da vitória pertencem ao meu frontend!',
        andrey: 'Andrey! Seu modelo de IA é impressionante, mas quero ver ele renderizar sem quebrar o layout do meu CSS!',
        dragon: 'Vulcanus! Suas chamas não passam de um erro 500 no console. Prepare-se para o Hadouken de tags HTML e CSS!',
        dog: 'Grande Unicão! Vamos ver se sua força cósmica aguenta um display: flex com flex-direction: column na sua guarda!',
        default: 'npm run fight! Meu código está limpo, semântico e pronto para compilar sua derrota!'
      },
      andrey: {
        emerson: 'Emerson! A infraestrutura é essencial, mas quem calcula as decisões preditivas é a minha Inteligência Artificial!',
        nata: 'Natã! O frontend ficou espetacular, mas agora encare a inferência profunda dos meus robôs de IA autônomos!',
        dragon: 'Vulcanus! Meus tensores já calcularam 100% de probabilidade da sua derrota. Drones de IA, ataque total!',
        dog: 'Unicão! Sua lealdade cósmica é nobre, mas a precisão matemática da minha IA é matematicamente absoluta!',
        default: 'Cálculo de trajetória concluído. A convergência da sua derrota é matematicamente inevitável!'
      },
      dragon: {
        dog: 'Um mero cãozinho ousa encarar o soberano do magma? Você virará cinzas!',
        emerson: 'Seus servidores e fios de metal derreterão diante do meu sopro primordial!',
        nata: 'Um mero desenvolvedor quer desafiar o fogo ancestral? Vou queimar seus códigos e frameworks!',
        andrey: 'Seus robôs de metal e equações matemáticas serão fundidos como sucata na minha fornalha!',
        default: 'Curvem-se diante das asas do cataclismo! Nenhum mortal escapa da fornalha!'
      }
    };

    const heroTalk = dialogues[heroId] && (dialogues[heroId][oppId] || dialogues[heroId].default) ||
      'Prepare-se! Este duelo decidirá quem avança rumo ao topo da torre!';
    return heroTalk;
  },

  // --- 3. FRASES DE VITÓRIA APÓS CADA LUTA DA TORRE ---
  getVictoryQuote: function(heroId, oppId) {
    const quotes = {
      dog: 'Nunca subestime o Super Cão! Essa vitória foi pelos meus amigos!',
      emerson: 'Processo encerrado com código 0! Servidor estável e oponente desativado com sucesso.',
      nata: 'Compilado com sucesso! Zero erros, zero warnings e um Hadouken de CSS que redefiniu seu layout!',
      andrey: 'Inferência concluída com 100% de acurácia! Robôs de IA retornando à base com a vitória.',
      alligator: 'A força da minha mandíbula é absoluta. Ninguém nada mais fundo que Brutus!',
      capybara: 'A calma superou a fúria. Descanse em paz e aprenda com a derrota.',
      owl: 'A estratégia da mente sempre vence a brutalidade cega. O destino estava traçado.',
      tiger: 'Meus reflexos são o próprio relâmpago! Seu estilo ainda precisa de mil anos de treino!',
      bear: 'Como uma avalanche! Ninguém resiste à força esmagadora dos meus braços!',
      gorilla: 'A selva tem apenas um rei! Seus golpes não moveram nem um fio da minha pele!',
      wolf: 'O fogo do cerrado queima mais forte! Ninguém corre mais rápido que o Lobo Guará!',
      cat: 'Você nem viu de onde veio o golpe. Volte para a escuridão e treine mais.',
      dragon: 'Cinzas e ruínas... Quem mais se atreve a desafiar o sopro dos deuses?'
    };
    return quotes[heroId] || 'Grande vitória! A jornada pela torre continua!';
  },

  // --- 4. FRASES DE DERROTA (Quando o jogador perde na torre) ---
  getDefeatQuote: function(oppId) {
    const taunts = {
      dog: 'Levante e tente de novo! Mostre mais determinação!',
      emerson: 'Erro 500: Conexão interrompida! Reinicie seu treino e venha para o próximo deploy!',
      nata: 'Sintaxe inválida! Refaça seus testes unitários antes de subir para a produção!',
      andrey: 'Overfitting detectado! Seus dados de entrada foram insuficientes para antecipar minha IA!',
      alligator: 'Mais uma presa engolida pela correnteza do pântano!',
      capybara: 'Respire fundo... A pressa foi o seu maior inimigo.',
      owl: 'Eu já havia previsto cada movimento seu. Tente decifrar os enigmas da noite.',
      tiger: 'Fraco demais! Não serviu nem para afiar minhas garras!',
      bear: 'O inverno do norte não tem piedade dos despreparados.',
      gorilla: 'Você bateu como um galho seco. Tente de novo quando tiver músculos de verdade!',
      wolf: 'Muito lento para o vento do cerrado! Ficou para trás comendo poeira!',
      cat: 'Um ninja nunca deixa rastros... e você não me acertou nem uma vez.',
      dragon: 'Insolente! Ajoelhe-se diante do senhor das chamas ou seja consumido pela lava!'
    };
    return taunts[oppId] || 'Você foi derrotado! Insira créditos para continuar!';
  },

  // --- 5. FINAIS CINEMATOGRÁFICOS COMPLETOS (Vitória sobre o último Boss) ---
  championEndings: {
    dog: {
      title: 'UNICÃO - O SUPER CÃO CÓSMICO',
      epithet: 'LEALDADE INABALÁVEL, CORAÇÃO DE OURO E O PROTETOR DOS AMIGOS',
      text: `Com um salto acrobático e a explosão de ki estelar do lendário Super Cão, <strong>Unicão</strong> desferiu o golpe de misericórdia sobre Vulcanus, dissipando as labaredas infernais do dragão em uma gloriosa chuva de auroras boreais coloridas!<br><br>
      As ruas, praças e florestas de todas as regiões comemoraram em uníssono: o cãozinho leal que começou sua jornada para defender sua matilha agora é reverenciado como o <strong>Super Cão Protetor Supremo do Universo</strong>.<br><br>
      Na grande cerimônia das estrelas, Unicão vestiu sua toga de formatura de herói cósmico, segurou seu canudo de ouro e ergueu o punho em triunfo: seu juramento de proteger a todos com coragem e amor foi gravado para sempre no firmamento das galáxias!`,
      quote: 'Latir pelo bem, lutar pelos amigos e jamais recuar! Enquanto houver esperança no coração, o Super Cão sempre vencerá!'
    },

    emerson: {
      title: 'EMERSON - O ARQUITETO DO UNIVERSO 100% UPTIME',
      epithet: 'SENHOR DOS SERVIDORES, REDUNDÂNCIA TOTAL E COMANDANTE DO TERMINAL',
      text: `No topo do vulcão em erupção, enquanto Vulcanus rugia rios de magma, <strong>Emerson</strong> permaneceu calmo com a serenidade de quem já enfrentou queda de cluster em plena Black Friday. Desferindo sua sequência devastadora de chutes elétricos de alta voltagem e socos carregados com terawatts de energia pura, Emerson encurralou o monstro ancestral!<br><br>
      Abrindo seu terminal quântico portátil, Emerson executou o comando definitivo: <strong>sudo systemctl kill vulcanus-daemon -s SIGKILL && sudo purge --force magma-core</strong>. As lavas do dragão foram condensadas em silício puro e reconfiguradas em uma infraestrutura universal de servidores redundantes de latência zero!<br><br>
      Todo o ecossistema agora opera com <strong>100% de Uptime</strong>, zero pacotes perdidos e failover instantâneo. Emerson serviu-se de uma caneca fumegante de café forte no cume do Data Center Central: o mundo agora tem o Arquiteto Lendário no controle do Terminal!`,
      quote: 'Uptime restaurado em 100%. Latência zero. Podem dar deploy na sexta-feira com tranquilidade, porque aqui o servidor nunca cai!'
    },

    nata: {
      title: 'NATÃ - O COMPILADOR SUPREMO DA REALIDADE DIGITAL',
      epithet: 'ARQUITETO DE INTERFACES, ROCKSTAR DO CSS E MESTRE DO DISPLAY: FLEX',
      text: `Diante da fornalha incandescente do dragão, <strong>Natã</strong> concentrou toda a força de suas tags semânticas e folhas de estilo universais. Desviando das bolas de fogo com movimentos semânticos perfeitos, ele disparou o colossal <strong>HADOUKEN DE HTML & CSS (DISPLAY: FLEX / ALIGN-ITEMS: CENTER / JUSTIFY-CONTENT: SPACE-BETWEEN)</strong>!<br><br>
      A onda massiva de tags coloridas, seletores universais e transições suaves envolveu Vulcanus, re-renderizando a estrutura caótica do monstro em código limpo, modular e livre de qualquer bug! O vulcão foi transformado em um majestoso palco de festival de rock iluminado por luzes neon e som surround 8K.<br><br>
      Natã plugou sua guitarra elétrica nos amplificadores cósmicos de Emerson e tocou o mais eletrizante solo da história do Super Fighters Combat, enquanto registrava seu commit final para a eternidade: <em>git commit -m "Vulcanus refatorado com sucesso. Mundo 100% responsivo!"</em>.`,
      quote: 'Zero erros, zero warnings no console e layout 100% responsivo. A vitória não é apenas vencer... é vencer com estilo semântico!'
    },

    andrey: {
      title: 'ANDREY - O ARQUITETO DA SINGULARIDADE QUÂNTICA',
      epithet: 'DOUTOR DAS REDES PROFUNDAS, COMANDANTE DOS DRONES DE PLASMA E GÊNIO DO DUCKS',
      text: `Vestindo com orgulho seu lendário manto do Ducks de Anaheim e seus óculos de precisão quântica, <strong>Andrey</strong> calibrou seus modelos de redes neurais profundas. Enquanto Vulcanus mergulhava dos céus em um turbilhão de fogo, a IA de Andrey já havia simulado 47 bilhões de possibilidades antes do golpe aterrissar!<br><br>
      Com um gesto preciso, Andrey ativou seu enxame de robôs de combate autônomos. Orbitando em sincronia quântica perfeita, os drones dispararam um vórtice de plasma esmeralda que neutralizou a energia caótica do dragão em nível subatômico, encerrando a batalha com elegância matemática impecável.<br><br>
      O Laboratório Quântico de Andrey tornou-se o epicentro de uma nova era de harmonia: cidades inteligentes alimentadas por energia limpa, robôs protetores e algoritmos que garantem a paz universal em todas as arenas!`,
      quote: 'A matemática do universo é absoluta. Cada variável foi calculada, e a convergência da paz foi matematicamente demonstrada!'
    },

    alligator: {
      title: 'BRUTUS - O IMPERADOR DO PANTANAL PROFUNDO',
      epithet: 'MANDÍBULAS DE TITÂNIO, SENHOR DOS RIOS E TERROR DAS CORRENTES',
      text: `Com um rugido ensurdecedor que abalou a crosta terrestre, <strong>Brutus</strong> nadou contra a torrente de lava incandescente com sua couraça escamosa impenetrável. Travando suas mandíbulas de aço na cauda de Vulcanus, aplicou o lendário <strong>Giro da Morte Cataclísmico de 360 Graus</strong>!<br><br>
      O impacto arremessou o dragão contra o leito vulcânico, partindo as rochas e fazendo brotar torrentes de água fresca e pura do aquífero ancestral. As labaredas foram extintas e a vida voltou a florescer nas margens sagradas.<br><br>
      Brutus retornou aos seus domínios ovacionado por milhares de jacarés, ariranhas e aves pantaneiras, consagrando o Pantanal como o império mais poderoso e temido da terra!`,
      quote: 'Nas minhas águas manda quem tem dente! O fogo do dragão virou vapor e o Pantanal continua sendo a terra do rei Brutus!'
    },

    capybara: {
      title: 'MESTRE ZEN - A HARMONIA SUPREMA DA PAZ UNIVERSAL',
      epithet: 'PACIÊNCIA MILENAR, MESTRE DO CHI SUAVE E O CORAÇÃO IMUTÁVEL',
      text: `Enquanto todos os guerreiros lutavam com fúria e sangue nos olhos, <strong>Mestre Zen</strong> subiu a grande torre com passos suaves e uma tigela de chá verde nas patas. Quando Vulcanus disparou sua onda máxima de destruição, a nobre capivara apenas fechou os olhos, respirou fundo e flutuou suavemente em posição de lótus.<br><br>
      Utilizando o princípio do Chi Suave da Natureza, Mestre Zen acolheu o fogo do dragão, transformando a ira cósmica em anéis de névoa perfumada de flor de lótus. Desarmado em espírito e corpo, o outrora tirano pousou humildemente ao lado da capivara e pediu para aprender a meditar.<br><br>
      O antigo covil da destruição tornou-se as famosas Termas Zen do Cume, onde lutadores de todas as galáxias descansam suas armas e aprendem que a maior vitória é dominar a própria mente!`,
      quote: 'A rocha mais dura é polida pela água suave. Não há fogueira que resista à serenidade de uma mente em paz.'
    },

    owl: {
      title: 'ATHENA - A SÁBIA DOS CÉUS E DA ETERNIDADE',
      epithet: 'ARQUIVISTA DAS CONSTELAÇÕES, VOO DA MEIA-NOITE E MENTE SUPREMA',
      text: `Abrindo suas asas cor de ametista sob o céu estrelado, <strong>Athena</strong> já havia previsto cada movimento da batalha nos pergaminhos da astronomia sagrada. Conjurando tornados de penas místicas que desviaram cada labareda do dragão, ela desferiu o golpe de asas da iluminação bem no ponto focal da fera.<br><br>
      Ativando os Nove Pergaminhos Celestiais, Athena selou a fúria de Vulcanus sob uma constelação mágica que jamais se apagará no firmamento, convertendo a energia do vulcão em uma estrela guia para os navegantes do mundo inteiro.<br><br>
      Athena fundou a Grande Academia Noturna das Alturas, onde a sabedoria ancestral, a filosofia e as artes marciais são preservadas para que a luz da razão nunca mais seja ofuscada pelas sombras!`,
      quote: 'A força bruta pode quebrar montanhas, mas apenas a inteligência e o saber são capazes de reescrever o destino.'
    },

    tiger: {
      title: 'TORAMARU - O SOBERANO DO ESTILO DAS MIL GARRAS',
      epithet: 'RELÂMPAGO DA SELVA, PUNHOS DE AÇO E CORAGEM DE TIGRE',
      text: `Para <strong>Toramaru</strong>, o combate é a mais pura forma de arte e superação interior. No clímax da batalha nas alturas, seus reflexos superaram o próprio raio: ativando o lendário <strong>Estilo das Mil Garras Flamejantes</strong>, seus punhos rasgaram o ar gerando chamas azuis mais quentes que a própria lava!<br><br>
      Cortando a tempestade de fogo em duas metades com um corte fulminante em X de precisão cirúrgica, Toramaru fez o soberano dos ares cair de joelhos, consagrando-se como o Maior Artista Marcial da História.<br><br>
      Recusando tronos e glórias vazias, Toramaru amarrou suas faixas de combate e partiu em uma nova peregrinação pelos picos do mundo, sempre em busca de elevar seu espírito marcial a novos horizontes!`,
      quote: 'O verdadeiro guerreiro não busca troféus... busca a perfeição de cada movimento. Minha garra é a lâmina da minha alma!'
    },

    bear: {
      title: 'URSUS - O BALUARTE INQUEBRÁVEL DA TAIGA',
      epithet: 'COLOSSO DO GELO, FORÇA TITÂNICA E GUARDIÃO DAS NEVES',
      text: `Marchando contra o calor sufocante do vulcão sem recuar um único passo, <strong>Ursus</strong> sustentou o peso das garras de Vulcanus em seu peito de ferro. Com músculos forjados nas nevascas do norte e patas envoltas em faixas de linho e gelo perpétuo, o urso rugiu como uma avalanche!<br><br>
      Desferindo o <strong>Impacto Sísmico da Geleira Primordial</strong>, Ursus quebrou a crosta vulcânica e extinguiu os rios de magma, soterrando a fúria da fornalha ancestral sob pilares gigantescos de quartzo e gelo indestrutível!<br><br>
      O inverno do norte preservou seus domínios sagrados. Ursus retornou à floresta boreal onde foi recebido com festas e danças tribais, coroado para sempre como o Baluarte Protetor de todas as criaturas das terras selvagens.`,
      quote: 'O fogo consome tudo por um instante, mas o gelo e a rocha permanecem para sempre. O norte nunca cairá!'
    },

    gorilla: {
      title: 'KONGO - O REI ABSOLUTO DO IMPÉRIO PRIMATA',
      epithet: 'FORÇA TITÂNICA, COROA DOURADA E O MAJESTOSO SENHOR DA SELVA',
      text: `Batendo no peito de ébano como tambores de guerra ancestrais, <strong>Kongo</strong> suportou o sopro das chamas com coragem indomável. Avançando com passos de montanha, o grande gorila agarrou os dois chifres maciços de Vulcanus no ar e desferiu um arremesso telúrico que estremeceu todo o continente!<br><br>
      Provando que a coragem de quem luta para proteger sua família supera qualquer labareda mágica, Kongo colocou a lendária Coroa de Ouro sobre a cabeça e soltou o rugido do verdadeiro Rei da Terra.<br><br>
      Todas as tribos da grande selva foram unificadas sob um código de lealdade, bravura e justiça. A guarda de gorilas de Kongo agora garante que a paz reine soberana por incontáveis gerações!`,
      quote: 'Músculo de verdade serve para proteger quem não pode lutar. A selva tem um rei, e sua honra é inabalável!'
    },

    wolf: {
      title: 'LOBO GUARÁ - O MITO INVENCÍVEL DO CERRADO BRASILEIRO',
      epithet: 'CHAMA DOURADA, VELOCIDADE DA LUZ E O ESPÍRITO DAS SAVANAS',
      text: `Carregando o fogo solar do Cerrado brasileiro em suas veias, o <strong>Lobo Guará</strong> correu em círculos tão velozes que gerou um ciclone de brasas douradas ao redor da cratera vulcânica. Com a faixa verde e amarela reluzindo na testa, superou Vulcanus na sua própria velocidade!<br><br>
      Ao desferir a mordida solar definitiva, Guará dispersou as cinzas do tirano e devolveu o brilho do sol ao horizonte. Ele subiu ao cume mais alto da cordilheira e soltou um uivo cristalino que ecoou pelas noites enluaradas de todo o país.<br><br>
      Guará tornou-se o herói mítico celebrado por todo o povo: o guardião invencível das savanas, rápido como o vento, feroz como a tempestade e eterno em sua bravura!`,
      quote: 'No rastro do Lobo Guará só fica poeira e vitória! O cerrado tem coração valente e alma que nunca se apaga!'
    },

    cat: {
      title: 'KAGE - A ORDEM OCULTA DAS GARRAS DE JADE',
      epithet: 'PASSO INVISÍVEL, CORTE SILENCIOSO E O FANTASMA DA MEIA-NOITE',
      text: `Nem mesmo as labaredas de um dragão ancestral conseguem queimar aquilo que não pode ser visto nem ouvido. Deslizando pelas sombras do vulcão como uma brisa silenciosa, <strong>Kage</strong> desferiu cortes de jade imperceptíveis nos pontos vitais de chakra de Vulcanus.<br><br>
      Antes que a primeira labareda tocasse o chão, o titã alado desmoronou sem sequer compreender de onde vieram os golpes. Kage limpou suas lâminas com elegância, lambeu sua pata com serenidade felina e desapareceu no nevoeiro matinal sem deixar um único rastro.<br><br>
      Ele agora lidera a Ordem Oculta de Vigilantes das Sombras, garantindo do silêncio da noite que nenhum tirano volte a ameaçar a harmonia do mundo!`,
      quote: 'A verdadeira força não precisa fazer barulho. Um sussurro na escuridão basta para mudar o destino do mundo.'
    },

    dragon: {
      title: 'VULCANUS - O IMPERADOR ETERNO DOS CÉUS DE FOGO',
      epithet: 'FOGO PRIMORDIAL, ASAS DO CATACLISMO E O SENHOR DO MAGMA',
      text: `Submetendo todos os desafiantes da grande torre ao fogo de suas chamas milenares, <strong>Vulcanus</strong> abriu suas asas colossais de cem metros e cobriu o firmamento com um espetáculo de auroras cósmicas e meteoros incandescentes!<br><br>
      O dragão primordial não destruiu a terra: ele a refinou no fogo sagrado, eliminando todas as fraquezas e forjando uma era de ouro onde apenas os guerreiros mais bravos e valorosos têm a honra de contemplar o trono de magma.<br><br>
      Seu império de calor, honra e luz agora brilha por toda a eternidade, unindo céus, montanhas e estrelas sob o voo triunfal do maior titã que as eras já conheceram!`,
      quote: 'Curvem-se, criaturas mortais! As cinzas do passado deram lugar ao império eterno das chamas imortais!'
    }
  }
};
