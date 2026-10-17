// Stages and Parallax Engine for Super Fighters Combat

const STAGES = {
  street: {
    id: 'street',
    name: 'Beco Urbano Neon',
    subtitle: 'Dojo das Ruas - Território Canino',
    imageSrc: 'assets/images/stage_street.jpg',
    groundY: 480,
    width: 1400,
    ambientColor: 'rgba(59, 130, 246, 0.08)',
    particles: 'rain',
    musicTheme: 'electronic_fury'
  },

  swamp: {
    id: 'swamp',
    name: 'Pântano dos Caimões',
    subtitle: 'Águas Negras do Jacaré',
    imageSrc: 'assets/images/stage_swamp.jpg',
    groundY: 480,
    width: 1400,
    ambientColor: 'rgba(34, 197, 94, 0.12)',
    particles: 'fireflies',
    musicTheme: 'swamp_drum'
  },

  bamboo: {
    id: 'bamboo',
    name: 'Bosque de Bambu Zen',
    subtitle: 'Fontes Termais do Mestre Kai',
    imageSrc: 'assets/images/stage_bamboo.jpg',
    groundY: 485,
    width: 1400,
    ambientColor: 'rgba(234, 179, 8, 0.08)',
    particles: 'petals',
    musicTheme: 'zen_strike'
  },

  temple: {
    id: 'temple',
    name: 'Teto do Templo Sagrado',
    subtitle: 'Domínio Sob a Lua Cheia',
    imageSrc: 'assets/images/stage_temple.jpg',
    groundY: 475,
    width: 1400,
    ambientColor: 'rgba(168, 85, 247, 0.10)',
    particles: 'moon_dust',
    musicTheme: 'shadow_ninja'
  },

  volcano: {
    id: 'volcano',
    name: 'Covil Vulcânico Ancestral',
    subtitle: 'Trono do Dragão Final Boss',
    imageSrc: 'assets/images/stage_volcano.jpg',
    groundY: 490,
    width: 1400,
    ambientColor: 'rgba(239, 68, 68, 0.18)',
    particles: 'embers',
    musicTheme: 'hellfire_boss'
  },

  servers: {
    id: 'servers',
    name: 'Data Center Matrix',
    subtitle: 'Sala dos Servidores - Domínio de Emerson',
    imageSrc: 'assets/images/stage_servers.jpg',
    groundY: 480,
    width: 1400,
    ambientColor: 'rgba(6, 182, 212, 0.12)',
    particles: 'data_bits',
    musicTheme: 'cyber_overload'
  },

  dev_room: {
    id: 'dev_room',
    name: 'Web Dev Cyber Studio',
    subtitle: 'Telas de Código & Cascata Matrix - Domínio do Natã',
    imageSrc: 'assets/images/stage_dev_room.jpg',
    groundY: 480,
    width: 1400,
    ambientColor: 'rgba(249, 115, 22, 0.08)',
    particles: 'matrix_code',
    musicTheme: 'electronic_fury'
  },

  ai_lab: {
    id: 'ai_lab',
    name: 'Laboratório Quântico de IA',
    subtitle: 'Cálculos Matemáticos & Robôs de IA - Domínio do Andrey',
    imageSrc: 'assets/images/stage_ai_lab.jpg',
    groundY: 480,
    width: 1400,
    ambientColor: 'rgba(16, 185, 129, 0.08)',
    particles: 'math_formulas',
    musicTheme: 'cyber_overload'
  }
};

const STAGE_KEYS = ['street', 'swamp', 'bamboo', 'temple', 'servers', 'dev_room', 'ai_lab', 'volcano'];

class StageManager {
  constructor() {
    this.currentStageKey = 'street';
    this.stageImages = {};
    this.ambientParticles = [];
    this.preloadImages();
    this.initParticles();
  }

  preloadImages() {
    STAGE_KEYS.forEach(key => {
      const img = new Image();
      img.src = STAGES[key].imageSrc;
      this.stageImages[key] = img;
    });
  }

  setStage(stageKey) {
    if (STAGES[stageKey]) {
      this.currentStageKey = stageKey;
      this.initParticles();
    }
  }

  getCurrentStage() {
    return STAGES[this.currentStageKey];
  }

  initParticles() {
    this.ambientParticles = [];
    const stage = this.getCurrentStage();
    const isSpecialText = stage.particles === 'matrix_code' || stage.particles === 'math_formulas';
    const count = isSpecialText ? 50 : 35;
    const codeChars = ['<div/>', '{ }', '</>', '0', '1', 'flex', 'const', 'grid', 'color', '#f50', '200', 'CSS', 'HTML', ';'];
    const mathSymbols = ['∫f(x)dx', '∇²', 'e=mc²', 'W·x+b', '∑xᵢ', 'Tᵢⱼₖ', 'λ', '∂E/∂w', 'σ(z)', '100% IA', 'AI ROBOT', 'MATRIX'];
    const pool = stage.particles === 'math_formulas' ? mathSymbols : codeChars;

    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random() * stage.width,
        y: Math.random() * 540,
        vx: (Math.random() - 0.5) * 1.5,
        vy: isSpecialText ? Math.random() * 2.2 + 1.2 : Math.random() * 1.5 + 0.5,
        size: Math.random() * 4 + 2,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.05,
        alpha: Math.random() * 0.7 + 0.3,
        char: pool[Math.floor(Math.random() * pool.length)],
        color: stage.particles === 'math_formulas' ? (Math.random() > 0.4 ? '#10b981' : (Math.random() > 0.5 ? '#38bdf8' : '#fde047')) : (Math.random() > 0.4 ? '#22c55e' : (Math.random() > 0.5 ? '#f97316' : '#38bdf8')),
        frameCounter: Math.floor(Math.random() * 10)
      });
    }
  }

  updateParticles() {
    const stage = this.getCurrentStage();
    const type = stage.particles;

    this.ambientParticles.forEach(p => {
      if (type === 'embers') {
        p.y -= Math.random() * 2 + 1;
        p.x += (Math.random() - 0.5) * 1.5;
        p.alpha -= 0.005;
        if (p.y < 0 || p.alpha <= 0) {
          p.y = stage.groundY + Math.random() * 50;
          p.x = Math.random() * stage.width;
          p.alpha = Math.random() * 0.8 + 0.2;
        }
      } else if (type === 'petals') {
        p.y += p.vy;
        p.x += Math.sin(p.y * 0.03) * 1.5 + 0.8;
        p.rot += p.vRot;
        if (p.y > 540) {
          p.y = -10;
          p.x = Math.random() * stage.width;
        }
      } else if (type === 'fireflies') {
        p.x += Math.sin(p.y * 0.05) * 1.2;
        p.y += Math.cos(p.x * 0.05) * 0.8;
        p.alpha = 0.4 + Math.sin(Date.now() * 0.005 + p.size) * 0.4;
      } else if (type === 'rain') {
        p.y += 14;
        p.x -= 4;
        if (p.y > 540) {
          p.y = -10;
          p.x = Math.random() * stage.width;
        }
      } else if (type === 'data_bits') {
        p.y -= 2.2;
        p.x += Math.sin(p.y * 0.04) * 0.8;
        if (p.y < 0) {
          p.y = 540;
          p.x = Math.random() * stage.width;
        }
      } else if (type === 'matrix_code') {
        p.y += p.vy;
        p.frameCounter = (p.frameCounter || 0) + 1;
        if (p.frameCounter % 9 === 0) {
          const chars = ['<div/>', '{ }', '</>', '0', '1', 'flex', 'const', 'grid', 'color', '#f50', '200', 'CSS', 'HTML', ';'];
          p.char = chars[Math.floor(Math.random() * chars.length)];
        }
        if (p.y > 540) {
          p.y = -20;
          p.x = Math.random() * stage.width;
        }
      } else if (type === 'math_formulas') {
        p.y += p.vy * 0.85;
        p.x += Math.sin(p.y * 0.03) * 0.6;
        p.frameCounter = (p.frameCounter || 0) + 1;
        if (p.frameCounter % 12 === 0) {
          const mathSymbols = ['∫f(x)dx', '∇²', 'e=mc²', 'W·x+b', '∑xᵢ', 'Tᵢⱼₖ', 'λ', '∂E/∂w', 'σ(z)', '100% IA', 'AI ROBOT', 'MATRIX'];
          p.char = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
        }
        if (p.y > 540) {
          p.y = -20;
          p.x = Math.random() * stage.width;
        }
      } else {
        // Moon dust
        p.y += Math.sin(p.x * 0.02) * 0.4;
        p.x += 0.3;
        if (p.x > stage.width) p.x = 0;
      }
    });
  }

  draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
    const stage = this.getCurrentStage();
    const img = this.stageImages[this.currentStageKey];

    ctx.save();

    // Draw Background with Parallax
    if (img && img.complete) {
      // Background draws with slight parallax shift (0.4 factor)
      const bgX = -cameraX * 0.35;
      ctx.drawImage(img, bgX - 100, 0, stage.width + 200, canvasHeight);
    } else {
      // Fallback stylized dark arena gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.6, '#1e293b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // World Space Transform for Ground and Foreground Elements
    ctx.translate(-cameraX, 0);

    // Draw Ambient Ground Glow / Magma line if Volcano or Dev Studio
    if (stage.id === 'volcano') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(0, stage.groundY - 10, stage.width, canvasHeight - stage.groundY + 10);
    } else if (stage.id === 'dev_room') {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.14)';
      ctx.fillRect(0, stage.groundY - 6, stage.width, canvasHeight - stage.groundY + 6);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, stage.groundY);
      ctx.lineTo(stage.width, stage.groundY);
      ctx.stroke();
    } else if (stage.id === 'ai_lab') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.fillRect(0, stage.groundY - 6, stage.width, canvasHeight - stage.groundY + 6);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, stage.groundY);
      ctx.lineTo(stage.width, stage.groundY);
      ctx.stroke();
    }

    // Draw Ambient Stage Particles
    this.ambientParticles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (stage.particles === 'embers') {
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage.particles === 'petals') {
        ctx.fillStyle = '#f472b6';
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage.particles === 'fireflies') {
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage.particles === 'rain') {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 3, p.y + 12);
        ctx.stroke();
      } else if (stage.particles === 'data_bits') {
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.font = '10px monospace';
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', p.x, p.y);
      } else if (stage.particles === 'matrix_code') {
        ctx.fillStyle = p.color || '#22c55e';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 9;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(p.char || '<div/>', p.x, p.y);
      } else if (stage.particles === 'math_formulas') {
        ctx.fillStyle = p.color || '#10b981';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.font = "bold 12px 'Courier New', monospace";
        ctx.fillText(p.char || '∫f(x)dx', p.x, p.y);
      } else {
        // Moon dust
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Ambient Color Wash
    ctx.restore();
    ctx.fillStyle = stage.ambientColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

window.STAGES = STAGES;
window.STAGE_KEYS = STAGE_KEYS;
window.stageManager = new StageManager();
