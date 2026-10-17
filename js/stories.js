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
      title: 'UNICÃO - O SUPER CÃO CÓSMICO E GUARDIÃO ETERNO',
      text: `Com um salto acrobático e o impacto estelar do lendário Super Cão Cósmico, Unicão desferiu o golpe de misericórdia sobre Vulcanus, dissipando as chamas infernais do dragão em uma chuva de auroras boreais coloridas.<br><br>
      As ruas e florestas de todas as regiões comemoraram: o cão que começou com determinação pura agora é reverenciado como o Super Cão protetor supremo do planeta. Unicão recebeu a lendária Coleira de Ouro Cósmica e jurou continuar protegendo a todos, garantindo que a paz reine absoluta nas arenas!`
    },

    emerson: {
      title: 'EMERSON - O ARQUITETO DO UNIVERSO 100% UPTIME',
      text: `Executando com calma hercúlea o comando supremo <strong>sudo systemctl kill vulcanus-daemon -s SIGKILL</strong>, Emerson canalizou gigawatts de potência quântica através de suas luvas térmicas. As lavas do dragão foram condensadas em silício puro e reconfiguradas em servidores de ultra-alta performance!<br><br>
      Todo o ecossistema agora opera com 100% de disponibilidade, zero latência e arquitetura redundante perfeita. Emerson ergueu sua caneca de café sagrada no cume do vulcão: o mundo agora tem o Arquiteto Lendário no controle do Terminal!`
    },

    nata: {
      title: 'NATÃ - O COMPILADOR SUPREMO DA REALIDADE DIGITAL',
      text: `Concentrando toda a energia de suas tags semânticas e folhas de estilo universais, Natã disparou o colossal <strong>HADOUKEN DE HTML & CSS / DISPLAY: FLEX!</strong>. A onda massiva de tags coloridas, classes semânticas e seletores universais envolveu Vulcanus, re-renderizando a estrutura do dragão em código limpo, estável e livre de bugs!<br><br>
      O ecossistema digital foi salvo: as interfaces ficaram 100% responsivas em todos os dispositivos, o Uptime atingiu a perfeição e o mundo celebrou a aliança perfeita entre o Frontend de Natã e os Servidores de Emerson. Natã ergueu seu troféu de código dourado e publicou o commit final: <em>git commit -m "Vulcanus defeated: world deployed to production successfully!"</em>.`
    },

    andrey: {
      title: 'ANDREY - A ERA DA INTELIGÊNCIA ARTIFICIAL E DA SINGULARIDADE',
      text: `Combinando cálculos matemáticos quânticos de altíssima ordem com o comando supremo do seu enxame de robôs de IA autônomos, Andrey desferiu o golpe de misericórdia sobre Vulcanus: um turbilhão de tensores e raios esmeralda que reconfiguraram a rede neural do dragão para o modo pacífico!<br><br>
      O Laboratório Quântico de Andrey tornou-se o epicentro de uma nova era de harmonia cibernética. Junto a Emerson nos servidores e Natã no desenvolvimento de sistemas, Andrey implementou a Singularidade Tecnológica Perfeita: cidades futuristas alimentadas por inteligência limpa, robôs protetores e algoritmos que garantem a paz universal em todas as arenas!`
    },

    alligator: {
      title: 'BRUTUS - O IMPERADOR DO PANTANAL PROFUNDO',
      text: `Com um rugido ensurdecedor que abalou a crosta terrestre, Brutus agarrou a cauda do dragão e aplicou o mítico *Giro da Morte Cataclísmico*, arremessando Vulcanus contra as paredes de magma e apagando a fornalha ancestral.<br><br>
      As águas puras voltaram a inundar os leitos sagrados. Brutus retornou aos seus domínios ovacionado por milhares de jacarés e répteis, consagrando o Pantanal como o império mais poderoso e temido da terra.`
    },

    capybara: {
      title: 'MESTRE ZEN - A HARMONIA SUPREMA DA PAZ UNIVERSAL',
      text: `Sem desferir uma única gota de ódio, Mestre Zen utilizou a energia suave do Chi da Natureza para redirecionar o calor de Vulcanus, acalmando o coração raivoso do dragão até transformá-lo em uma nobre fonte termal de meditação.<br><br>
      O antigo vulcão da destruição tornou-se o maior templo de retiro espiritual do reino animal. Mestres e guerreiros de todas as terras viajam para aprender com a capivara que derrotou a fúria com a serenidade.`
    },

    owl: {
      title: 'ATHENA - A GUARDIÃ DA GRANDE BIBLIOTECA CELESTIAL',
      text: `Abrindo suas asas cor de ametista, Athena conjurou os símbolos arcanos dos Pergaminhos Noturnos, selando os poderes de Vulcanus sob uma constelação mágica que jamais se apagará no firmamento.<br><br>
      Com a vitória, Athena reuniu o conhecimento de todos os campeões e fundou a Grande Academia dos Céus, onde a sabedoria ancestral é protegida para que a luz da razão nunca mais seja ofuscada pelo fogo da ignorância.`
    },

    tiger: {
      title: 'TORAMARU - O SOBERANO DO ESTILO DAS MIL GARRAS',
      text: `Com um corte fulminante mais veloz que o raio, Toramaru rasgou o ar com suas garras flamejantes e superou o sopro de Vulcanus no ápice do duelo. O dragão caiu de joelhos diante da perfeição da técnica marcial do tigre.<br><br>
      Toramaru atingiu o topo absoluto das artes marciais mundiais. Ele agora viaja pelos quatro cantos do mundo como uma lenda viva, treinando a próxima geração de guerreiros com coragem, disciplina e honra inquebrantável.`
    },

    bear: {
      title: 'URSUS - O BALUARTE INQUEBRÁVEL DA TAIGA',
      text: `Com um golpe sísmico de seus punhos congelados, Ursus quebrou a crosta vulcânica e extinguiu os rios de magma, soterrando a fúria de Vulcanus sob pilares de rocha e gelo eterno.<br><br>
      O inverno do norte preservou seus domínios. Ursus retornou à floresta boreal onde foi recebido com festas ancestrais, agora imortalizado como o guardião que defendeu a terra com a força dos gigantes da floresta.`
    },

    gorilla: {
      title: 'KONGO - O REI ABSOLUTO DO IMPÉRIO PRIMATA',
      text: `Batendo no peito de ébano como tambores de guerra, Kongo suportou o impacto das chamas e ergueu o dragão pelos chifres, demonstrando a força bruta inigualável do clã dos primatas.<br><br>
      Kongo unificou todas as tribos da grande selva sob um código de justiça, lealdade e bravura. A coroa de ouro brilha sobre sua cabeça enquanto sua guarda de gorilas garante que a paz reine por muitas gerações.`
    },

    wolf: {
      title: 'LOBO GUARÁ - O MITO INVENCÍVEL DO CERRADO BRASILEIRO',
      text: `Envolto em uma aura de fogo solar resplandecente, o Lobo Guará correu em círculos tão velozes que gerou um redemoinho de fogo dourado, superando Vulcanus no seu próprio elemento.<br><br>
      Com a faixa verde e amarela erguida no cume da montanha, Guará tornou-se o herói mítico celebrado por todo o país. Sua lenda corre pelas noites enluaradas do Cerrado: onde houver perigo, o lobo flamejante surgirá para defender seu povo!`
    },

    cat: {
      title: 'KAGE - A ORDEM OCULTA DAS GARRAS DE JADE',
      text: `Com uma velocidade que desafiou as leis da física, Kage deslizou pelas sombras das labaredas e cravou seus golpes vitais nos pontos de chakra de Vulcanus, desarmando o dragão sem emitir um único som.<br><br>
      Ao amanhecer, o dragão jazia derrotado e o ninja felino havia desaparecido no nevoeiro matinal. Kage fundou a Ordem Oculta de Vigilantes das Sombras, protegendo o mundo em segredo dos perigos que caminham na escuridão.`
    },

    dragon: {
      title: 'VULCANUS - O DEUS SOBERANO DO COSMOS DE MAGMA',
      text: `Derrotando o formidável Arquiteto Emerson no cume da torre, Vulcanus absorveu os servidores quânticos e fundiu a tecnologia dos terminais com seu fogo primordial ancestral.<br><br>
      O mundo agora treme perante a Divindade Suprema dos Céus de Lava! Nenhuma criatura ousa desafiar a tempestade de meteoros de Vulcanus, cujo império eterno agora rege terra, céu e dados por toda a eternidade!`
    }
  }
};
