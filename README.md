# SUPER FIGHTERS COMBAT

Um jogo de luta 2D estilo Arcade desenvolvido em HTML5 Canvas, JavaScript puro (ES6+) e Web Audio API. O jogo conta com um elenco de 13 lutadores com sprites e golpes exclusivos, sistema de combos, projéteis, barras de energia (Especial e Super), múltiplos modos de jogo, diálogos de história e suporte a controles no teclado e telas sensíveis ao toque.

---

## Modos de Jogo

- **Modo História (Torre Arcade)**: Suba os degraus da torre de combate enfrentando oponentes com diálogos de rivalidade personalizados até desafiar os chefes supremos e o temível **Vulcanus**.
- **Modo Versus Local (P1 vs P2)**: Enfrente amigos no mesmo teclado ou dispositivo.
- **Batalha contra IA**: Partida rápida contra a máquina com seleção dinâmica de dificuldade.
- **Treinamento Livre**: Pratique combinações de golpes, mobilidade e controle de distância com medidores regeneráveis e sem contagem de tempo.

---

## Elenco de Lutadores (Roster)

O jogo possui 13 personagens equilibrados com atributos e projéteis únicos:

| Personagem | Título | Especial | Super |
| :--- | :--- | :--- | :--- |
| **Unicão** | O Super Cão Cósmico | Impacto Astral | Fúria Celestial do Super Cão |
| **Brutus** | O Crocodilo do Pântano | Giro da Morte | Mandíbula de Titã |
| **Mestre Kai** | A Capivara Zen | Esfera de Chi | Iluminação Devastadora |
| **Nocturna** | A Coruja Shinobi | Lâmina da Noite | Tempestade de Penas Sombrias |
| **Kharg** | O Tigre das Lâminas | Corte Selvagem | Fúria do Predador Supremo |
| **Ursus** | O Berserker do Ártico | Impacto Glacial | Avalanche Esmagadora |
| **Kongo** | O Titã Primata | Terremoto Sísmico | Fúria Primordial do Rei |
| **Guará** | O Lobo do Cerrado | Uivo Voraz | Alcateia Relâmpago |
| **Kage** | A Sombra Felina | Passo Fantasma | Dança das Garras Ocultas |
| **Emerson** | O Mestre dos Servidores | Pacote 10Gbps | Purge de Datacenter Supremo |
| **Natã** | O Mestre do Frontend & Código | Disparo de Scripts | Compilação Lendária sem Bugs |
| **Andrey** | O Mestre da Inteligência Artificial | Predição Neural | Algoritmo Quântico Singular |
| **Vulcanus** | O Dragão Ancestral *(Chefão Final)* | Chama Abissal | Cataclismo de Magma Ancestral |

---

## Controles do Jogo

Todos os menus podem ser navegados diretamente pelo teclado via **WASD** ou **Setas** (`Enter`/`Espaço` para confirmar e `Esc` para voltar).

### Player 1 (Solo / Versus P1)

| Ação | Tecla Principal | Alternativa |
| :--- | :--- | :--- |
| **Mover para Esquerda / Bloquear** | `A` | `Seta Esquerda` (em modo Solo) |
| **Mover para Direita / Avançar** | `D` | `Seta Direita` (em modo Solo) |
| **Abaixar** | `S` | `Seta Baixo` (em modo Solo) |
| **Pular** | `W` | `Seta Cima` (em modo Solo) |
| **Soco** | `F` | - |
| **Chute** | `G` | - |
| **Golpe Especial** | `H` *(Consome 50% de energia)* | - |
| **Super Golpe** | `Barra de Espaço` *(Consome 100% de energia)* | - |

### Player 2 (Modo Versus)

| Ação | Tecla | Teclado Numérico |
| :--- | :--- | :--- |
| **Movimentação** | `Setas direcionais` | - |
| **Soco** | `J` | `Numpad 4` |
| **Chute** | `K` | `Numpad 5` |
| **Golpe Especial** | `L` *(Consome 50% de energia)* | `Numpad 6` |
| **Super Golpe** | `Enter` *(Consome 100% de energia)* | `Numpad 0` |

### Comandos de Sistema

- **Pausar Partida**: `Esc` ou `P`
- **Alternar Controles Touch / Virtuais**: Botão `CONTROLES` no topo da tela ou pelo menu.

---

## Mecânicas de Combate

1. **Defesa (Block)**: Mantenha pressionada a direção contrária ao oponente (`A` se estiver à esquerda, `D` se estiver à direita) para bloquear e mitigar a maior parte do dano recebido.
2. **Barra de Especial (50%)**: Acumulada ao desferir e receber golpes. Permite invocar projéteis e ataques de alto dano.
3. **Barra de Super (100% - MAX)**: Desbloqueia o golpe cinematográfico definitivo do lutador, causando dano crítico e efeitos de partículas massivos.
4. **Recuperação de Queda (Knockdown Recovery)**: Ao ser arremessado ao chão por golpes pesados, o lutador possui quadros de invulnerabilidade momentânea ao levantar.

---

## Estrutura do Projeto

```text
GameLuta/
├── index.html              # Estrutura principal do jogo, menus arcade e telas HUD
├── style.css               # Estilização completa, layouts responsivos e efeitos arcade
├── README.md               # Documentação técnica e guia do jogador
├── assets/
│   ├── images/             # Retratos e sprites dos lutadores (idle, ataque, queda, vitória)
│   ├── video/              # Vídeo de apresentação inicial dos lutadores
│   └── favicon.ico         # Ícone da aplicação
├── js/
│   ├── game.js             # Loop principal, gerenciamento de estados, menus e lógica do jogo
│   ├── characters.js       # Definições de atributos, paletas e renderização dos 13 lutadores
│   ├── fighter.js          # Física, hitboxes, estados (andar, pular, soco, chute, queda) e IA
│   ├── particles.js        # Sistema de partículas, efeitos visuais, impactos e projéteis
│   ├── stories.js          # Diálogos, prólogos, epílogos e histórias de rivalidade da torre
│   ├── ui.js               # HUD de batalha, barras de vida/especial e banners de combate
│   └── audio.js            # Sintetizador via Web Audio API (música dinâmica e SFX retrô)
└── tools/
    ├── generate_intro_video.py  # Script para geração e atualização do vídeo de apresentação
    └── extract_sprites.py       # Utilitários de corte e alinhamento de sprites
```

---

## Como Executar Localmente

Como o jogo utiliza requisições para carregamento assíncrono de sprites, imagens e áudio, recomenda-se executá-lo em um servidor web local:

### Com Python 3

```bash
# Clone ou acesse a pasta do repositório
cd GameLuta

# Inicie o servidor local na porta 8080 (ou qualquer outra porta desejada)
python3 -m http.server 8080
```

Abra o seu navegador em [http://localhost:8080](http://localhost:8080).

### Com Node.js (`http-server` ou `serve`)

```bash
npx serve .
# ou
npx http-server -p 8080 .
```

---

## Tecnologias Utilizadas

- **HTML5 Canvas**: Renderização acelerada em 60 FPS com animações spriteadas e efeitos de partículas dinâmicos.
- **JavaScript Moderno (ES6+)**: Orientação a objetos limpa e modular sem necessidade de build tools pesadas.
- **Web Audio API**: Geração de som procedural e efeitos sonoros arcade com latência zero e suporte a trilhas dinâmicas sintetizadas em tempo real.
- **Vanilla CSS3**: Design temático arcade, responsivo e adaptável a telas desktop, tablets e mobile.
