// Character Definitions and Art Renderers for Super Fighters

const CHARACTERS = {
  dog: {
    id: 'dog',
    name: 'Unicão',
    title: 'O Super Cão Cósmico (Força Celestial)',
    lore: 'O lendário guerreiro canino de pelagem azul cósmica e músculos de titã. Mestre absoluto do boxe celestial e da fúria cósmica: o Super Cão carrega em cada golpe o impacto de uma estrela!',
    portrait: 'assets/images/portrait_dog.jpg',
    baseHp: 1550, // MUITO FORTE!
    speed: 6.0,
    power: 1.48, // Socos titânicos
    defense: 1.30, // Couraça celestial
    jumpForce: 15.5,
    themeColor: '#0284c7',
    auraColor: 'rgba(56, 189, 248, 0.55)',
    projectileType: 'bone_blast',
    specialName: 'Impacto Astral',
    superName: 'Fúria Celestial do Super Cão',
    width: 65,
    height: 115,
    colors: {
      fur: '#0284c7',
      furDark: '#0c4a6e',
      snout: '#38bdf8',
      headband: '#f59e0b',
      wraps: '#ffffff',
      pants: '#0369a1',
      eye: '#fde047'
    },
    p2Colors: {
      fur: '#7c3aed',
      furDark: '#4c1d95',
      snout: '#a855f7',
      headband: '#fde047',
      wraps: '#ffffff',
      pants: '#581c87',
      eye: '#38bdf8'
    }
  },

  alligator: {
    id: 'alligator',
    name: 'Brutus',
    title: 'O Crocodilo do Pântano',
    lore: 'O monstro brutal dos pântanos escuros, com dentes afiados e uma força de mandíbula capaz de quebrar ossos.',
    portrait: 'assets/images/portrait_alligator.jpg',
    baseHp: 1180,
    speed: 4.2,
    power: 1.25,
    defense: 1.15,
    jumpForce: 15.2,
    themeColor: '#16a34a',
    auraColor: 'rgba(22, 163, 74, 0.4)',
    projectileType: 'mud_splash',
    specialName: 'Giro da Morte',
    superName: 'Mandíbula de Titã',
    width: 75,
    height: 118,
    colors: {
      fur: '#15803d',
      furDark: '#14532d',
      snout: '#166534',
      headband: '#ca8a04',
      wraps: '#64748b',
      pants: '#3f3f46',
      eye: '#eab308'
    },
    p2Colors: {
      fur: '#0284c7',
      furDark: '#075985',
      snout: '#0369a1',
      headband: '#ef4444',
      wraps: '#94a3b8',
      pants: '#18181b',
      eye: '#f97316'
    }
  },

  capybara: {
    id: 'capybara',
    name: 'Mestre Kai',
    title: 'A Capivara Zen',
    lore: 'O mestre da serenidade absoluta. Seu foco interior canaliza rajadas de Chi devastadoras.',
    portrait: 'assets/images/portrait_capybara.jpg',
    baseHp: 1050,
    speed: 4.8,
    power: 1.0,
    defense: 1.2,
    jumpForce: 15.0,
    themeColor: '#f59e0b',
    auraColor: 'rgba(245, 158, 11, 0.4)',
    projectileType: 'zen_orb',
    specialName: 'Esfera de Chi',
    superName: 'Iluminação Devastadora',
    width: 70,
    height: 110,
    colors: {
      fur: '#b45309',
      furDark: '#78350f',
      snout: '#92400e',
      headband: '#fbbf24',
      wraps: '#fffbeb',
      pants: '#d97706',
      eye: '#10b981'
    },
    p2Colors: {
      fur: '#6b7280',
      furDark: '#374151',
      snout: '#4b5563',
      headband: '#38bdf8',
      wraps: '#f1f5f9',
      pants: '#0284c7',
      eye: '#a855f7'
    }
  },

  owl: {
    id: 'owl',
    name: 'Nocturna',
    title: 'A Coruja Shinobi',
    lore: 'Assassina silenciosa da noite que domina o ar e arremessa penas afiadas como shurikens mortais.',
    portrait: 'assets/images/portrait_owl.jpg',
    baseHp: 900,
    speed: 6.2,
    power: 0.95,
    defense: 0.9,
    jumpForce: 16.0,
    themeColor: '#8b5cf6',
    auraColor: 'rgba(139, 92, 246, 0.4)',
    projectileType: 'feather_blade',
    specialName: 'Shuriken de Penas',
    superName: 'Tempestade da Meia-Noite',
    width: 60,
    height: 110,
    colors: {
      fur: '#3730a3',
      furDark: '#1e1b4b',
      snout: '#f59e0b',
      headband: '#c084fc',
      wraps: '#a855f7',
      pants: '#312e81',
      eye: '#facc15'
    },
    p2Colors: {
      fur: '#0d9488',
      furDark: '#134e4a',
      snout: '#fb923c',
      headband: '#2dd4bf',
      wraps: '#5eead4',
      pants: '#115e59',
      eye: '#ec4899'
    }
  },

  tiger: {
    id: 'tiger',
    name: 'Kharg',
    title: 'O Tigre das Lâminas',
    lore: 'Predador feroz que fatiará qualquer oponente com suas garras de aço e velocidade explosiva.',
    portrait: 'assets/images/portrait_tiger.jpg',
    baseHp: 980,
    speed: 5.8,
    power: 1.15,
    defense: 0.95,
    jumpForce: 14.8,
    themeColor: '#06b6d4',
    auraColor: 'rgba(6, 182, 212, 0.4)',
    projectileType: 'claw_wave',
    specialName: 'Salto Predador',
    superName: 'Mil Lâminas Selvagens',
    width: 68,
    height: 116,
    colors: {
      fur: '#ea580c',
      furDark: '#18181b',
      snout: '#f97316',
      headband: '#06b6d4',
      wraps: '#0891b2',
      pants: '#431407',
      eye: '#06b6d4'
    },
    p2Colors: {
      fur: '#f8fafc',
      furDark: '#334155',
      snout: '#e2e8f0',
      headband: '#e11d48',
      wraps: '#be123c',
      pants: '#1e293b',
      eye: '#f43f5e'
    }
  },

  bear: {
    id: 'bear',
    name: 'Ursus',
    title: 'O Berserker do Ártico',
    lore: 'Uma força colateral da natureza. Seus golpes esmagam montanhas e causam abalos sísmicos.',
    portrait: 'assets/images/portrait_bear.jpg',
    baseHp: 1250,
    speed: 3.8,
    power: 1.35,
    defense: 1.25,
    jumpForce: 15.0,
    themeColor: '#38bdf8',
    auraColor: 'rgba(56, 189, 248, 0.4)',
    projectileType: 'ice_spike',
    specialName: 'Pancada Sísmica',
    superName: 'Terremoto Glacial',
    width: 82,
    height: 122,
    colors: {
      fur: '#451a03',
      furDark: '#1c0a00',
      snout: '#78350f',
      headband: '#38bdf8',
      wraps: '#94a3b8',
      pants: '#27272a',
      eye: '#38bdf8'
    },
    p2Colors: {
      fur: '#e2e8f0',
      furDark: '#94a3b8',
      snout: '#cbd5e1',
      headband: '#3b82f6',
      wraps: '#64748b',
      pants: '#0f172a',
      eye: '#60a5fa'
    }
  },

  gorilla: {
    id: 'gorilla',
    name: 'Kongo',
    title: 'O Titã Primata',
    lore: 'Punhos pesados como ferro fundido. Um brawler implacável que arremessa pedras gigantes.',
    portrait: 'assets/images/portrait_gorilla.jpg',
    baseHp: 1100,
    speed: 4.6,
    power: 1.2,
    defense: 1.1,
    jumpForce: 15.2,
    themeColor: '#eab308',
    auraColor: 'rgba(234, 179, 8, 0.4)',
    projectileType: 'boulder',
    specialName: 'Arremesso de Rocha',
    superName: 'Impacto Sísmico Titânico',
    width: 78,
    height: 118,
    colors: {
      fur: '#262626',
      furDark: '#0a0a0a',
      snout: '#404040',
      headband: '#eab308',
      wraps: '#71717a',
      pants: '#171717',
      eye: '#fbbf24'
    },
    p2Colors: {
      fur: '#78350f',
      furDark: '#451a03',
      snout: '#92400e',
      headband: '#ef4444',
      wraps: '#a1a1aa',
      pants: '#3f1d0b',
      eye: '#f97316'
    }
  },

  wolf: {
    id: 'wolf',
    name: 'Guará',
    title: 'O Lobo do Cerrado',
    lore: 'Rápido como um raio vermelho, desfere chutes em chamas com pernas longas e ágeis.',
    portrait: 'assets/images/portrait_wolf.jpg',
    baseHp: 950,
    speed: 6.0,
    power: 1.05,
    defense: 0.95,
    jumpForce: 15.0,
    themeColor: '#f97316',
    auraColor: 'rgba(249, 115, 22, 0.4)',
    projectileType: 'fire_fang',
    specialName: 'Chute Chamejante',
    superName: 'Fúria da Matilha',
    width: 64,
    height: 116,
    colors: {
      fur: '#ea580c',
      furDark: '#18181b',
      snout: '#27272a',
      headband: '#fde047',
      wraps: '#fb923c',
      pants: '#09090b',
      eye: '#fde047'
    },
    p2Colors: {
      fur: '#6366f1',
      furDark: '#1e1b4b',
      snout: '#312e81',
      headband: '#a5f3fc',
      wraps: '#818cf8',
      pants: '#0f172a',
      eye: '#22d3ee'
    }
  },

  cat: {
    id: 'cat',
    name: 'Kage',
    title: 'A Sombra Felina',
    lore: 'Mestre da velocidade e furtividade, surge atrás de suas presas antes mesmo do som do golpe ecoar.',
    portrait: 'assets/images/portrait_cat.jpg',
    baseHp: 880,
    speed: 6.5,
    power: 0.9,
    defense: 0.85,
    jumpForce: 16.5,
    themeColor: '#10b981',
    auraColor: 'rgba(16, 185, 129, 0.4)',
    projectileType: 'kunai_shadow',
    specialName: 'Passo Sombrio',
    superName: 'Dança das Mil Sombras',
    width: 58,
    height: 108,
    colors: {
      fur: '#1f2937',
      furDark: '#030712',
      snout: '#111827',
      headband: '#10b981',
      wraps: '#059669',
      pants: '#064e3b',
      eye: '#10b981'
    },
    p2Colors: {
      fur: '#f43f5e',
      furDark: '#881337',
      snout: '#be123c',
      headband: '#fef08a',
      wraps: '#fda4af',
      pants: '#4c0519',
      eye: '#fef08a'
    }
  },

  dragon: {
    id: 'dragon',
    name: 'Vulcanus',
    title: 'O Dragão Ancestral (CHEFÃO FINAL SUPREMO)',
    lore: 'O soberano titânico das chamas profundas despertado após milênios. Com envergadura colossal e domínio dos céus, paira sobre a arena, expele torrentes de lava e invoca chuvas de meteoros.',
    portrait: 'assets/images/portrait_dragon.jpg',
    baseHp: 2100, // Vida monumental de Chefão Final
    speed: 4.8,
    power: 1.70, // Poder titânico
    defense: 1.50, // Escamas de obsidiana impenetráveis
    jumpForce: 16.0,
    themeColor: '#ef4444',
    auraColor: 'rgba(239, 68, 68, 0.75)',
    projectileType: 'dragon_fire',
    specialName: 'Sopro de Lava',
    superName: 'Cataclismo Meteórico',
    width: 140, // 1.5x maior que personagens padrão (70 -> 140)
    height: 200, // 1.5x maior que personagens padrão (120 -> 200)
    isBoss: true,
    canFly: true, // Habilidade de voo exclusiva!
    colors: {
      fur: '#1c1917',
      furDark: '#0c0a09',
      snout: '#292524',
      headband: '#f97316',
      wraps: '#b91c1c',
      pants: '#7f1d1d',
      eye: '#ef4444'
    },
    p2Colors: {
      fur: '#172554',
      furDark: '#090d16',
      snout: '#1e3a8a',
      headband: '#38bdf8',
      wraps: '#1d4ed8',
      pants: '#1e3a8a',
      eye: '#38bdf8'
    }
  },

  emerson: {
    id: 'emerson',
    name: 'Emerson',
    title: 'O Mestre dos Servidores',
    lore: 'O lendário arquiteto de sistemas e senhor dos servidores. Com força titânica e poder do Data Center, desfere socos elétricos, sobrecargas de terminal e comandos SUDO que apagam qualquer oponente!',
    portrait: 'assets/images/portrait_emerson.jpg',
    baseHp: 1700, // SUPER FORTE!
    speed: 5.9,
    power: 1.55, // Dano colossal!
    defense: 1.40, // Armadura de servidor!
    jumpForce: 15.2,
    themeColor: '#06b6d4',
    auraColor: 'rgba(6, 182, 212, 0.65)',
    projectileType: 'cable_kamehameha',
    specialName: 'Kamehameha de Cabos de Rede',
    superName: 'SUDO KILL -9 / PURGE TOTAL',
    width: 72,
    height: 122,
    colors: {
      fur: '#1e293b',
      furDark: '#0f172a',
      snout: '#fbbf24',
      headband: '#06b6d4',
      wraps: '#f8fafc',
      pants: '#1d4ed8',
      eye: '#38bdf8'
    },
    p2Colors: {
      fur: '#7f1d1d',
      furDark: '#450a0a',
      snout: '#f59e0b',
      headband: '#ef4444',
      wraps: '#ffffff',
      pants: '#991b1b',
      eye: '#fde047'
    }
  },
  nata: {
    id: 'nata',
    name: 'Natã',
    title: 'O Mestre do Frontend & Código',
    lore: 'O lendário mestre do desenvolvimento e arquitetura web. Seus reflexos compilam golpes na velocidade da luz e seu ki projeta tags semânticas, estilos responsivos e o devastador Hadouken de HTML e CSS!',
    portrait: 'assets/images/portrait_nata.jpg',
    baseHp: 1450,
    speed: 6.2,
    power: 1.45,
    defense: 1.25,
    jumpForce: 15.6,
    themeColor: '#f97316',
    auraColor: 'rgba(249, 115, 22, 0.65)',
    projectileType: 'code_tag',
    specialName: 'Syntax Burst',
    superName: 'HADOUKEN HTML & CSS (DISPLAY: FLEX)',
    width: 68,
    height: 118,
    colors: {
      fur: '#ea580c',
      furDark: '#1e293b',
      snout: '#fcd34d',
      headband: '#3b82f6',
      wraps: '#2563eb',
      pants: '#1d4ed8',
      eye: '#38bdf8'
    },
    p2Colors: {
      fur: '#10b981',
      furDark: '#047857',
      snout: '#fde047',
      headband: '#06b6d4',
      wraps: '#111827',
      pants: '#064e3b',
      eye: '#a7f3d0'
    }
  },

  andrey: {
    id: 'andrey',
    name: 'Andrey',
    title: 'O Mestre da Inteligência Artificial',
    lore: 'Visionário supremo e arquiteto de redes neurais quânticas. Mestre dos cálculos futuristas e artes marciais cibernéticas, Andrey canaliza punhos de energia esmeralda pura e comanda robôs de IA autônomos!',
    portrait: 'assets/images/portrait_andrey.jpg',
    baseHp: 1600,
    speed: 6.1,
    power: 1.50,
    defense: 1.35,
    jumpForce: 15.4,
    themeColor: '#10b981',
    auraColor: 'rgba(16, 185, 129, 0.65)',
    projectileType: 'ai_robot',
    specialName: 'Ataque Drones de IA',
    superName: 'SOBRECARGA NEURAL QUANTUM',
    width: 70,
    height: 120,
    colors: {
      fur: '#10b981',
      furDark: '#047857',
      snout: '#fcd34d',
      headband: '#06b6d4',
      wraps: '#ffffff',
      pants: '#18181b',
      eye: '#34d399'
    },
    p2Colors: {
      fur: '#f59e0b',
      furDark: '#b45309',
      snout: '#fde047',
      headband: '#8b5cf6',
      wraps: '#ffffff',
      pants: '#3b82f6',
      eye: '#60a5fa'
    }
  }
};

// Preload pixel art fighting sprites (14 poses) for EVERY character:
// idle, idle2, punch, kick, special, crouch, jump, fall, fly, walk1, walk2, back1, back2, knockdown
const SPRITE_POSES = ['idle', 'idle2', 'punch', 'kick', 'special', 'crouch', 'jump', 'fall', 'fly', 'walk1', 'walk2', 'back1', 'back2', 'knockdown'];
const fighterSprites = {};
Object.keys(CHARACTERS).forEach(id => {
  if (!window.SPRITE_META || !window.SPRITE_META[id]) return;
  fighterSprites[id] = {};
  SPRITE_POSES.forEach(pose => {
    const img = new Image();
    img.src = `assets/images/sprites/${id}_${pose}.png`;
    fighterSprites[id][pose] = img;
  });
});

// Character Select Order for Menus and Arcade Ladder (All 13 Fighters)
const PLAYABLE_ROSTER = ['dog', 'emerson', 'nata', 'andrey', 'alligator', 'capybara', 'owl', 'tiger', 'bear', 'gorilla', 'wolf', 'cat', 'dragon'];
const FULL_ROSTER = [...PLAYABLE_ROSTER];

// Choose which sprite pose matches the fighter's current state
function pickSpritePose(f) {
  const s = f.state;
  if (s === 'KNOCKDOWN' || s === 'DEFEAT') {
    if (f.isGrounded) return 'fall';
    return 'knockdown';
  }
  if (f.isFlying) {
    if (s === 'ATTACK_LIGHT') return 'punch';
    if (s === 'ATTACK_HEAVY') return 'kick';
    if (s === 'SPECIAL' || s === 'SUPER') return 'special';
    return 'fly';
  }
  if (s === 'CROUCH') return 'crouch';
  if (s === 'JUMP') return 'jump';
  if (s === 'SPECIAL' || s === 'SUPER') return 'special';
  if (s === 'ATTACK_HEAVY') {
    if (f.isCrouchAttacking) return 'crouch';
    if (f.isAirAttacking || !f.isGrounded) return 'kick';
    return (f.attackPhase === 'startup' && f.stateTimer < 3) ? 'idle' : 'kick';
  }
  if (s === 'ATTACK_LIGHT') {
    if (f.isCrouchAttacking) return 'crouch';
    if (f.isAirAttacking || !f.isGrounded) return 'jump';
    return (f.attackPhase === 'startup' && f.stateTimer < 3) ? 'idle' : 'punch';
  }
  if (!f.isGrounded) return 'jump';
  if (s === 'WALK' || (Math.abs(f.vx) > 0.35 && f.isGrounded)) {
    const dir = f.vx * f.facing;
    const step = (Math.floor(f.animTimer / 6) % 2 === 0);
    if (dir >= 0) {
      return step ? 'walk1' : 'walk2';
    } else {
      return step ? 'back1' : 'back2';
    }
  }
  // Fluid 2-frame breathing / bouncing idle animation
  return (Math.floor(f.animTimer / 12) % 2 === 0) ? 'idle' : 'idle2';
}

// Draws a glowing impact burst (fist / foot hit effect)
function drawImpactFlare(ctx, x, y, radius, color, t) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  // speed lines
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + t * 0.4;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * radius * 0.45, y + Math.sin(a) * radius * 0.45);
    ctx.lineTo(x + Math.cos(a) * radius * 1.1, y + Math.sin(a) * radius * 1.1);
    ctx.stroke();
  }
  ctx.restore();
}

// Pixel-art sprite renderer used by ALL characters. Returns false if the
// sprites are not available yet (then the procedural renderer is used).
function drawFighterSprite(ctx, fighter) {
  const char = CHARACTERS[fighter.charId];
  const meta = window.SPRITE_META && window.SPRITE_META[char.id];
  const imgs = fighterSprites[char.id];
  if (!meta || !imgs) return false;

  const pose = pickSpritePose(fighter);
  let img = imgs[pose];
  let m = meta[pose];
  if (!img || !img.complete || !img.naturalWidth || !m) {
    img = imgs['idle'];
    m = meta['idle'];
    if (!img || !img.complete || !img.naturalWidth || !m) return false;
  }

  const isFacingRight = fighter.facing === 1;
  const t = fighter.animTimer;
  const state = fighter.state;
  const isAttack = ['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'SUPER'].includes(state);

  // Same on-screen scale for every pose of this character
  const scale = (char.height * 1.32) / meta.idle.h;
  const fw = m.w * scale;
  const fh = m.h * scale;
  const ax = m.ax * fw;

  // Ground level (for the shadow while jumping)
  let groundY = fighter.y;
  if (window.stageManager && window.stageManager.getCurrentStage) {
    const st = window.stageManager.getCurrentStage();
    if (st) groundY = st.groundY;
  }
  const airHeight = Math.max(0, groundY - fighter.y);

  ctx.save();
  ctx.translate(fighter.x, fighter.y);
  if (!isFacingRight) ctx.scale(-1, 1);

  // --- Shadow on the floor (shrinks while airborne) ---
  const shadowScale = Math.max(0.35, 1 - airHeight / 260);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * shadowScale})`;
  ctx.beginPath();
  ctx.ellipse(0, airHeight, char.width * 0.75 * shadowScale, 12 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- Pose transforms ---
  let offX = 0;
  let offY = 0;
  let rot = 0;
  let sx = 1;
  let sy = 1;

  if (fighter.isFlying) {
    offY = Math.sin(t * 0.15) * 8; // hovering wing rhythm
    rot = Math.sin(t * 0.08) * 0.03 + Math.max(-0.25, Math.min(0.25, fighter.vx * 0.04));
    sy = 1 + Math.sin(t * 0.22) * 0.025;
  } else if (state === 'IDLE' || state === 'VICTORY') {
    sy = 1 + Math.sin(t * 0.12) * 0.018; // breathing
    sx = 1 - Math.sin(t * 0.12) * 0.008;
    if (state === 'VICTORY') offY = -Math.abs(Math.sin(t * 0.15)) * 14;
  } else if (state === 'WALK') {
    offY = -Math.abs(Math.sin(t * 0.25)) * 5;
    rot = Math.sin(t * 0.25) * 0.04 + 0.03 * Math.sign(fighter.vx * fighter.facing);
  } else if (state === 'CROUCH') {
    sy = 1 + Math.sin(t * 0.12) * 0.012;
  } else if (state === 'JUMP') {
    // lean forward when rising, tuck when falling
    rot = Math.max(-0.2, Math.min(0.2, fighter.vy * 0.012));
    if (fighter.vx * fighter.facing > 1) rot += 0.1;
  } else if (pose === 'walk1' || pose === 'walk2' || pose === 'back1' || pose === 'back2') {
    offY = (pose === 'walk1' || pose === 'back1') ? -2 : 0;
  } else if (state === 'BLOCK') {
    offX = -6;
    rot = -0.09;
  } else if (state === 'HIT') {
    offX = -10;
    rot = -0.2;
  } else if (state === 'KNOCKDOWN' || state === 'DEFEAT') {
    const onFloor = fighter.isGrounded;
    if (pose === 'fall') {
      // The fall sprite is already pre-rendered flat on the floor
      rot = 0;
      offX = 0;
      offY = 0;
    } else if (pose === 'knockdown') {
      rot = -0.15;
      offX = -12;
      offY = -8;
    } else {
      rot = onFloor ? -Math.PI / 2 : -Math.PI / 3;
      offX = onFloor ? fh * 0.35 : -20;
      offY = onFloor ? -ax * 0.85 : 0;
    }
  } else if (isAttack) {
    if (fighter.isCrouchAttacking) {
      offX = fighter.attackPhase === 'active' ? 16 : 6;
      rot = 0.06;
    } else if (fighter.isAirAttacking || !fighter.isGrounded) {
      rot = fighter.attackPhase === 'active' ? 0.38 : 0.15; // diving strike
      offX = fighter.attackPhase === 'active' ? 10 : 0;
    } else if (fighter.attackPhase === 'active') {
      offX = state === 'ATTACK_LIGHT' ? 6 : 14;
      rot = state === 'ATTACK_LIGHT' ? 0.02 : 0.05;
    } else if (fighter.attackPhase === 'recovery') {
      offX = 4;
    }
  }

  ctx.save();
  ctx.translate(offX, offY);
  // Rotate around the body center (around the feet when lying down)
  const pivotY = (state === 'KNOCKDOWN' || state === 'DEFEAT') ? 0 : -fh * 0.45;
  ctx.translate(0, pivotY);
  ctx.rotate(rot);
  ctx.translate(0, -pivotY);
  ctx.scale(sx, sy);

  // --- Glow / aura / flashes ---
  const filters = [];
  const isMirror = fighter.isP2 && window.gameEngine && window.gameEngine.p1 &&
    window.gameEngine.p1.charId === fighter.charId;
  if (isMirror) filters.push('hue-rotate(150deg) saturate(1.25)');

  if (fighter.hitFlashTimer > 0 && fighter.hitFlashTimer % 2 === 0) {
    filters.push('brightness(0) invert(1)'); // white hit flash silhouette
  } else if (state === 'HIT') {
    filters.push('sepia(0.6) saturate(3) hue-rotate(-30deg)'); // reddish pain tint
  }
  if (filters.length) ctx.filter = filters.join(' ');

  if (fighter.invulnerableTimer > 0 && Math.floor(t / 3) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }

  if (state === 'SUPER' || state === 'SPECIAL' || fighter.isSuperCharged) {
    ctx.shadowColor = char.themeColor;
    ctx.shadowBlur = state === 'SUPER' ? 34 : (state === 'SPECIAL' ? 22 : 12 + Math.sin(t * 0.2) * 6);
  } else if (char.isBoss || char.id === 'emerson' || char.id === 'dog') {
    ctx.shadowColor = char.auraColor || char.themeColor;
    ctx.shadowBlur = 10;
  }

  ctx.drawImage(img, -ax, -fh, fw, fh);

  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // --- Attack impact flares ---
  if (isAttack && fighter.attackPhase === 'active') {
    const heavy = state !== 'ATTACK_LIGHT';
    const radius = state === 'SUPER' ? 38 : (heavy ? 28 : 20);
    let fx;
    let fy;
    if (fighter.isCrouchAttacking) {
      fx = fw - ax + 4;
      fy = -fh * 0.2; // low sweep
    } else if (pose === 'jump') {
      fx = fw - ax;
      fy = -fh * 0.3; // diving knee / kick
    } else if (pose === 'kick') {
      fx = fw - ax + 10;
      fy = -fh * 0.58; // powerful kick impact zone
    } else if (pose === 'special') {
      fx = fw - ax + 14;
      fy = -fh * 0.65; // special blast impact zone
    } else {
      fx = fw - ax - 4;
      fy = -fh * 0.68; // fist at end of extended arm
    }
    drawImpactFlare(ctx, fx, fy, radius, char.themeColor, t);
  }

  // --- Blocking shield ---
  if (state === 'BLOCK') {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(fw * 0.25, -fh * 0.55, fh * 0.42, -Math.PI / 2.6, Math.PI / 2.6);
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
  return true;
}

// Helper to draw fighters dynamically on canvas
function drawFighterCanvas(ctx, fighter) {
  // Every character now has pixel-art sprites; fall back to vector art while loading
  if (drawFighterSprite(ctx, fighter)) return;

  const char = CHARACTERS[fighter.charId];
  const col = fighter.isP2 ? char.p2Colors : char.colors;
  const isFacingRight = fighter.facing === 1;

  ctx.save();
  ctx.translate(fighter.x, fighter.y);
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }

  const w = char.width;
  const h = char.height;

  // Shadow under feet
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.55, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // If in Super Mode or Charging, draw energetic aura
  if (fighter.isSuperCharged || fighter.state === 'SUPER') {
    ctx.save();
    ctx.shadowColor = char.themeColor;
    ctx.shadowBlur = 24;
    ctx.strokeStyle = char.themeColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -h * 0.5, h * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Flash white when hit
  if (fighter.hitFlashTimer > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.restore();
    return;
  }

  // Animation offsets based on state
  let bobY = 0;
  let punchOffset = 0;
  let kickOffset = 0;
  let legSpread = 0;
  let crouchScale = 1.0;

  if (fighter.state === 'IDLE') {
    bobY = Math.sin(fighter.animTimer * 0.12) * 3;
  } else if (fighter.state === 'WALK') {
    bobY = Math.abs(Math.sin(fighter.animTimer * 0.25)) * 6;
    legSpread = Math.sin(fighter.animTimer * 0.25) * 12;
  } else if (fighter.state === 'JUMP') {
    bobY = -10;
    legSpread = -8;
  } else if (fighter.state === 'CROUCH') {
    crouchScale = 0.7;
    bobY = 15;
  } else if (fighter.state === 'ATTACK_LIGHT') {
    punchOffset = 28;
  } else if (fighter.state === 'ATTACK_HEAVY') {
    kickOffset = 36;
    punchOffset = 15;
  } else if (fighter.state === 'SPECIAL') {
    punchOffset = 22;
  } else if (fighter.state === 'SUPER') {
    punchOffset = 32;
    kickOffset = 24;
  } else if (fighter.state === 'BLOCK') {
    punchOffset = -10;
  } else if (fighter.state === 'HIT') {
    bobY = 4;
    ctx.rotate(isFacingRight ? -0.15 : 0.15);
  } else if (fighter.state === 'KNOCKDOWN') {
    ctx.rotate(isFacingRight ? -Math.PI / 2.3 : Math.PI / 2.3);
    ctx.translate(0, -w * 0.5);
  }

  // Apply crouch squash
  ctx.save();
  ctx.scale(1, crouchScale);

  // --- DRAW DRAGON WINGS IF DRAGON ---
  if (char.id === 'dragon') {
    ctx.fillStyle = '#7f1d1d';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-10, -h * 0.65 + bobY);
    ctx.lineTo(-w * 0.8, -h * 0.95 + bobY);
    ctx.lineTo(-w * 0.4, -h * 0.55 + bobY);
    ctx.lineTo(-w * 0.85, -h * 0.45 + bobY);
    ctx.lineTo(-15, -h * 0.45 + bobY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Fire trail
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(-w * 0.75, -h * 0.85 + bobY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- DRAW TAIL (for Dog, Alligator, Tiger, Wolf, Cat, Dragon) ---
  if (['dog', 'alligator', 'tiger', 'wolf', 'cat', 'dragon'].includes(char.id)) {
    ctx.strokeStyle = col.furDark;
    ctx.lineWidth = char.id === 'alligator' || char.id === 'dragon' ? 14 : 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const tailSway = Math.sin(fighter.animTimer * 0.15) * 12;
    ctx.moveTo(-w * 0.25, -h * 0.35 + bobY);
    ctx.quadraticCurveTo(-w * 0.75, -h * 0.45 + tailSway + bobY, -w * 0.85, -h * 0.25 + tailSway + bobY);
    ctx.stroke();
  }

  // --- LEGS ---
  ctx.fillStyle = col.pants;
  ctx.strokeStyle = col.furDark;
  ctx.lineWidth = 2;

  // Back Leg
  ctx.fillRect(-w * 0.35 - legSpread * 0.5, -h * 0.38 + bobY, w * 0.28, h * 0.38);
  ctx.strokeRect(-w * 0.35 - legSpread * 0.5, -h * 0.38 + bobY, w * 0.28, h * 0.38);

  // Front Leg (extends if kicking)
  if (kickOffset > 0) {
    ctx.save();
    ctx.translate(w * 0.1, -h * 0.35 + bobY);
    ctx.rotate(0.3);
    ctx.fillRect(0, -10, w * 0.35 + kickOffset, h * 0.22);
    ctx.strokeRect(0, -10, w * 0.35 + kickOffset, h * 0.22);
    // Paw/Foot Claws
    ctx.fillStyle = col.wraps;
    ctx.fillRect(w * 0.28 + kickOffset, -10, 12, h * 0.22);
    ctx.restore();
  } else {
    ctx.fillRect(w * 0.08 + legSpread * 0.5, -h * 0.38 + bobY, w * 0.28, h * 0.38);
    ctx.strokeRect(w * 0.08 + legSpread * 0.5, -h * 0.38 + bobY, w * 0.28, h * 0.38);
  }

  // Boots / Foot wraps
  ctx.fillStyle = col.wraps;
  ctx.fillRect(-w * 0.35 - legSpread * 0.5, -h * 0.08, w * 0.32, h * 0.08);
  if (kickOffset === 0) {
    ctx.fillRect(w * 0.08 + legSpread * 0.5, -h * 0.08, w * 0.32, h * 0.08);
  }

  // --- TORSO / CHEST ---
  ctx.fillStyle = col.fur;
  ctx.beginPath();
  ctx.roundRect(-w * 0.38, -h * 0.72 + bobY, w * 0.76, h * 0.42, 8);
  ctx.fill();
  ctx.stroke();

  // Belt / Gi sash
  ctx.fillStyle = col.headband;
  ctx.fillRect(-w * 0.38, -h * 0.40 + bobY, w * 0.76, 10);

  // Chest highlights / markings
  ctx.fillStyle = col.snout;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.56 + bobY, w * 0.22, h * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- HEAD ---
  ctx.fillStyle = col.fur;
  ctx.beginPath();
  ctx.roundRect(-w * 0.32, -h * 0.98 + bobY, w * 0.64, h * 0.32, 10);
  ctx.fill();
  ctx.stroke();

  // Ears / Horns
  if (char.id === 'dragon') {
    // Horns
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, -h * 0.95 + bobY);
    ctx.lineTo(-w * 0.4, -h * 1.15 + bobY);
    ctx.lineTo(-w * 0.1, -h * 0.98 + bobY);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.1, -h * 0.98 + bobY);
    ctx.lineTo(w * 0.35, -h * 1.15 + bobY);
    ctx.lineTo(w * 0.2, -h * 0.95 + bobY);
    ctx.fill();
  } else if (char.id === 'owl') {
    // Feathers
    ctx.fillStyle = col.headband;
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, -h * 0.95 + bobY);
    ctx.lineTo(-w * 0.35, -h * 1.08 + bobY);
    ctx.lineTo(-w * 0.15, -h * 0.95 + bobY);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.15, -h * 0.95 + bobY);
    ctx.lineTo(w * 0.35, -h * 1.08 + bobY);
    ctx.lineTo(w * 0.25, -h * 0.95 + bobY);
    ctx.fill();
  } else {
    // Animal Ears
    ctx.fillStyle = col.furDark;
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, -h * 0.95 + bobY);
    ctx.lineTo(-w * 0.32, -h * 1.08 + bobY);
    ctx.lineTo(-w * 0.12, -h * 0.95 + bobY);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.12, -h * 0.95 + bobY);
    ctx.lineTo(w * 0.28, -h * 1.08 + bobY);
    ctx.lineTo(w * 0.24, -h * 0.95 + bobY);
    ctx.fill();
  }

  // Snout / Beak / Maw
  ctx.fillStyle = col.snout;
  if (char.id === 'alligator') {
    // Long caiman snout
    ctx.beginPath();
    ctx.roundRect(w * 0.1, -h * 0.84 + bobY, w * 0.48, h * 0.16, 4);
    ctx.fill();
    ctx.stroke();
    // Teeth
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(w * 0.15 + i * 9, -h * 0.76 + bobY, 4, 6);
    }
  } else if (char.id === 'dragon') {
    // Dragon jaw
    ctx.beginPath();
    ctx.roundRect(w * 0.08, -h * 0.85 + bobY, w * 0.42, h * 0.18, 4);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.fillRect(w * 0.15, -h * 0.78 + bobY, 18, 5); // fire glow in mouth
  } else if (char.id === 'owl') {
    // Sharp Beak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(w * 0.15, -h * 0.82 + bobY);
    ctx.lineTo(w * 0.38, -h * 0.76 + bobY);
    ctx.lineTo(w * 0.15, -h * 0.70 + bobY);
    ctx.fill();
  } else {
    // Normal animal muzzle
    ctx.beginPath();
    ctx.roundRect(w * 0.05, -h * 0.82 + bobY, w * 0.32, h * 0.16, 6);
    ctx.fill();
    // Black nose
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(w * 0.32, -h * 0.78 + bobY, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Headband / Ninja Band
  ctx.fillStyle = col.headband;
  ctx.fillRect(-w * 0.32, -h * 0.92 + bobY, w * 0.64, 8);
  // Headband knot tails waving behind
  ctx.beginPath();
  const tailWave = Math.sin(fighter.animTimer * 0.2) * 6;
  ctx.moveTo(-w * 0.32, -h * 0.90 + bobY);
  ctx.lineTo(-w * 0.6, -h * 0.85 + tailWave + bobY);
  ctx.lineTo(-w * 0.32, -h * 0.82 + bobY);
  ctx.fill();

  // Eye
  ctx.fillStyle = col.eye;
  ctx.beginPath();
  ctx.ellipse(w * 0.12, -h * 0.85 + bobY, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w * 0.11, -h * 0.87 + bobY, 2, 2);

  // --- ARMS / WEAPONS ---
  // Back Arm
  ctx.fillStyle = col.furDark;
  ctx.fillRect(-w * 0.30, -h * 0.68 + bobY, w * 0.22, h * 0.25);

  // Front Arm (Punching / Blocking / Idle)
  ctx.save();
  ctx.fillStyle = col.fur;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;

  if (fighter.state === 'BLOCK') {
    // Both arms guarding face
    ctx.fillStyle = col.wraps;
    ctx.fillRect(w * 0.05, -h * 0.85 + bobY, w * 0.25, h * 0.35);
    ctx.strokeRect(w * 0.05, -h * 0.85 + bobY, w * 0.25, h * 0.35);
  } else if (punchOffset > 0) {
    // Punching forward
    ctx.fillRect(0, -h * 0.68 + bobY, w * 0.42 + punchOffset, h * 0.2);
    ctx.strokeRect(0, -h * 0.68 + bobY, w * 0.42 + punchOffset, h * 0.2);

    // Fist / Claws
    ctx.fillStyle = col.wraps;
    ctx.fillRect(w * 0.35 + punchOffset, -h * 0.70 + bobY, 18, h * 0.24);

    // Claws or fire fist effect
    if (char.id === 'tiger' || char.id === 'cat') {
      ctx.strokeStyle = char.themeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.45 + punchOffset, -h * 0.70 + bobY);
      ctx.lineTo(w * 0.58 + punchOffset, -h * 0.74 + bobY);
      ctx.moveTo(w * 0.45 + punchOffset, -h * 0.62 + bobY);
      ctx.lineTo(w * 0.60 + punchOffset, -h * 0.60 + bobY);
      ctx.stroke();
    }
  } else {
    // Guard stance
    ctx.fillRect(w * 0.05, -h * 0.68 + bobY, w * 0.25, h * 0.22);
    ctx.strokeRect(w * 0.05, -h * 0.68 + bobY, w * 0.25, h * 0.22);
    // Fist wraps
    ctx.fillStyle = col.wraps;
    ctx.fillRect(w * 0.20, -h * 0.72 + bobY, 14, 16);
  }
  ctx.restore();

  ctx.restore(); // end crouch scale
  ctx.restore(); // end fighter transform
}

window.CHARACTERS = CHARACTERS;
window.PLAYABLE_ROSTER = PLAYABLE_ROSTER;
window.FULL_ROSTER = FULL_ROSTER;
window.drawFighterCanvas = drawFighterCanvas;
