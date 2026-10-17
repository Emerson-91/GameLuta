// Visual Effects, Projectiles and Particle System for Animal Kombat

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.projectiles = [];
    this.bots = [];
    this.floatingTexts = [];
    this.screenShake = 0;
    this.shakeDecay = 0.9;
    this.superFreezeTimer = 0;

    // Andrey's Combat Bot sprite
    this.botImg = new Image();
    this.botImg.src = 'assets/images/sprites/andrey_bot.png';
  }

  reset() {
    this.particles = [];
    this.projectiles = [];
    this.bots = [];
    this.floatingTexts = [];
    this.screenShake = 0;
    this.superFreezeTimer = 0;
  }

  // Trigger Screen Shake
  shake(intensity = 12) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  // Freeze screen for dramatic impact / Super
  superFreeze(frames = 30) {
    this.superFreezeTimer = frames;
  }

  // Add floating combat text (e.g., "COMBO x3", "COUNTER!", "SUPER FINISH!")
  addText(x, y, text, color = '#facc15', size = 26) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      vy: -2.2,
      alpha: 1.0,
      life: 55
    });
  }

  // Create Hitspark on hit
  createHitspark(x, y, isHeavy = false, color = '#f59e0b') {
    const count = isHeavy ? 20 : 10;
    const baseSpeed = isHeavy ? 7 : 4;
    this.shake(isHeavy ? 14 : 6);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * baseSpeed + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? color : '#ffffff',
        size: Math.random() * (isHeavy ? 5 : 3) + 2,
        life: Math.random() * 15 + 10,
        maxLife: 25,
        type: 'spark'
      });
    }

    // Impact ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 5,
      maxRadius: isHeavy ? 45 : 25,
      color: color,
      lineWidth: isHeavy ? 4 : 2,
      life: 12,
      maxLife: 12,
      type: 'ring'
    });
  }

  // Create Block Spark
  createBlockSpark(x, y) {
    this.shake(3);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#38bdf8',
        size: Math.random() * 3 + 2,
        life: 12,
        maxLife: 12,
        type: 'spark'
      });
    }

    // Hexagonal shield pulse
    this.particles.push({
      x,
      y,
      radius: 8,
      maxRadius: 30,
      color: '#38bdf8',
      lineWidth: 3,
      life: 10,
      maxLife: 10,
      type: 'ring'
    });
  }

  // Slash Trail
  createSlashTrail(x, y, facing, color = '#f97316', size = 45) {
    this.particles.push({
      x,
      y,
      facing,
      radius: size,
      color,
      alpha: 1.0,
      life: 14,
      maxLife: 14,
      type: 'slash'
    });
  }

  // Fire / Chi Puff
  createFlameBurst(x, y, count = 15, color = '#ef4444') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 1,
        color: Math.random() > 0.5 ? color : '#f97316',
        size: Math.random() * 8 + 4,
        life: 20,
        maxLife: 20,
        type: 'smoke'
      });
    }
  }

  // Spawn a Projectile
  spawnProjectile(owner, type) {
    const dir = owner.facing;
    const startX = owner.x + dir * (owner.width * 0.6);
    const startY = owner.y - owner.height * 0.65;

    let speed = 9;
    let damage = 80 * owner.power;
    let radius = 18;
    let color = owner.themeColor;

    if (type === 'dragon_fire') {
      speed = 11;
      damage = 130 * owner.power;
      radius = 28;
      color = '#ef4444';
    } else if (type === 'boulder') {
      speed = 7.5;
      damage = 110 * owner.power;
      radius = 22;
      color = '#71717a';
    } else if (type === 'feather_blade') {
      speed = 12;
      damage = 65 * owner.power;
      radius = 14;
      color = '#c084fc';
    } else if (type === 'zen_orb') {
      speed = 8.5;
      damage = 90 * owner.power;
      radius = 20;
      color = '#fbbf24';
    } else if (type === 'bone_blast') {
      speed = 12.5;
      damage = 115 * owner.power; // Unicão's Cosmic Astral Blast!
      radius = 24;
      color = '#38bdf8';
      this.shake(9);
    } else if (type === 'server_packet') {
      speed = 13.5;
      damage = 145 * owner.power; // Emerson's super powerful cyber surge!
      radius = 24;
      color = '#06b6d4';
    } else if (type === 'code_tag') {
      speed = 11.5;
      damage = 100 * owner.power; // Natã's fast HTML/CSS tag special
      radius = 18;
      color = '#f97316';
    } else if (type === 'ai_robot') {
      speed = 12.8;
      damage = 135 * owner.power; // Andrey's autonomous AI Combat Robot
      radius = 25;
      color = '#10b981';
      this.shake(8);
    } else if (type === 'code_hadouken') {
      speed = 14;
      damage = 260 * owner.power; // Natã's massive HTML/CSS Hadouken Super!
      radius = 34;
      color = '#f97316';
      this.shake(16);
      this.addText(owner.x, owner.y - owner.height - 35, "HADOUKEN CSS & HTML!", "#f97316", 28);
    } else if (type === 'meteor') {
      // Dragon Boss special meteor falling from the sky!
      this.projectiles.push({
        owner,
        type: 'meteor',
        x: Math.random() * 800 + 200,
        y: -50,
        vx: (Math.random() - 0.5) * 2,
        vy: 10,
        radius: 25,
        damage: 120,
        color: '#ea580c',
        life: 120,
        isFalling: true
      });
      return;
    }

    this.projectiles.push({
      owner,
      type,
      x: startX,
      y: startY,
      vx: dir * speed,
      vy: 0,
      radius,
      damage,
      color,
      life: 90
    });
  }

  // Spawn Natã's multi-projectile HTML/CSS code burst!
  spawnCodeBurst(owner, snippet, index) {
    const dir = owner.facing;
    const startX = owner.x + dir * (owner.width * 0.65);
    const startY = (owner.y - owner.height * 0.65) + (index - 2) * 14;
    const speed = 11.5 + Math.random() * 2;
    const damage = 28 * owner.power;

    this.projectiles.push({
      owner,
      type: 'code_burst',
      codeText: snippet,
      x: startX,
      y: startY,
      vx: dir * speed,
      vy: (index - 2) * 0.45,
      radius: 20,
      damage,
      color: index % 2 === 0 ? '#f97316' : '#38bdf8',
      life: 90
    });
  }

  // Spawn Emerson's falling Cat6 RJ45 Network Cable!
  spawnNetworkCable(owner) {
    let targetX = owner.x + owner.facing * 230;
    if (window.gameEngine && window.gameEngine.p1 && window.gameEngine.p2) {
      const opp = (owner === window.gameEngine.p1) ? window.gameEngine.p2 : window.gameEngine.p1;
      if (opp) targetX = opp.x + (Math.random() - 0.5) * 60;
    }

    const cableColors = ['#0284c7', '#2563eb', '#eab308', '#16a34a', '#06b6d4'];
    const chosenColor = cableColors[Math.floor(Math.random() * cableColors.length)];

    this.projectiles.push({
      owner,
      type: 'network_cable',
      cableColor: chosenColor,
      x: targetX,
      y: -35,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 12.5 + Math.random() * 2.5,
      radius: 24,
      damage: 32 * owner.power,
      color: chosenColor,
      life: 120,
      isFalling: true
    });
  }

  // Spawn Emerson's horizontal Kamehameha Cat6 RJ45 Network Cable power projectile!
  spawnCableKamehameha(owner, index, isSuper = false) {
    const dir = owner.facing;
    // Launch point directly from Emerson's outstretched Kamehameha hands
    const startX = owner.x + dir * (owner.width * 1.05);
    const startY = (owner.y - owner.height * 0.58) + (index - (isSuper ? 4.5 : 2.5)) * 11;
    const speed = isSuper ? (16 + Math.random() * 3) : (14 + Math.random() * 2.5);
    const damage = (isSuper ? 42 : 34) * owner.power;

    const cableColors = ['#0284c7', '#eab308', '#64748b', '#06b6d4', '#16a34a', '#2563eb'];
    const chosenColor = cableColors[index % cableColors.length];

    this.projectiles.push({
      owner,
      type: 'cable_kamehameha',
      cableColor: chosenColor,
      index,
      isSuper,
      x: startX,
      y: startY,
      vx: dir * speed,
      vy: (index - (isSuper ? 4.5 : 2.5)) * 0.42,
      radius: 24,
      damage,
      color: '#06b6d4',
      life: 85
    });

    // Muzzle flash of electricity around Emerson's hands
    for (let s = 0; s < 5; s++) {
      this.particles.push({
        type: 'spark',
        x: startX + (Math.random() - 0.5) * 16,
        y: startY + (Math.random() - 0.5) * 16,
        vx: dir * (5 + Math.random() * 6),
        vy: (Math.random() - 0.5) * 4,
        color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24',
        life: 18,
        size: 3.5
      });
    }
  }

  // Spawn Andrey's 2 Combat Bots from the sky, hovering and shooting downward for 3 seconds!
  spawnAndreyBots(owner, isSuper = false) {
    let targetX = owner.x + owner.facing * 230;
    if (window.gameEngine && window.gameEngine.p1 && window.gameEngine.p2) {
      const opp = (owner === window.gameEngine.p1) ? window.gameEngine.p2 : window.gameEngine.p1;
      if (opp) targetX = opp.x;
    }

    this.shake(9);
    this.addText(owner.x, owner.y - owner.height - 35, "DRONES IA ENVIADOS!", "#f97316", 22);

    // Bot 1: descends from above left
    this.bots.push({
      owner,
      isSuper,
      x: targetX - 70,
      y: -95,
      hoverY: 130,
      offsetX: -70,
      state: 'enter',
      timer: 180, // 3 seconds at 60 FPS
      shootCooldown: 8,
      shootMuzzleToggle: false,
      muzzleTimer: 0,
      vy: 0
    });

    // Bot 2: descends from above right
    this.bots.push({
      owner,
      isSuper,
      x: targetX + 70,
      y: -145,
      hoverY: 155,
      offsetX: 70,
      state: 'enter',
      timer: 180, // 3 seconds at 60 FPS
      shootCooldown: 12,
      shootMuzzleToggle: true,
      muzzleTimer: 0,
      vy: 0
    });
  }

  update(fighters) {
    // Screen Shake decay
    if (this.screenShake > 0.1) {
      this.screenShake *= this.shakeDecay;
    } else {
      this.screenShake = 0;
    }

    // Super Freeze check
    if (this.superFreezeTimer > 0) {
      this.superFreezeTimer--;
      return;
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      ft.alpha = ft.life / 55;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      if (p.type === 'spark') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
      } else if (p.type === 'ring') {
        p.radius += (p.maxRadius - p.radius) * 0.25;
      } else if (p.type === 'smoke') {
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.94;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Andrey's Autonomous Combat Bots
    if (this.bots && this.bots.length > 0) {
      for (let b = this.bots.length - 1; b >= 0; b--) {
        const bot = this.bots[b];

        if (bot.muzzleTimer > 0) bot.muzzleTimer--;

        // Find opponent
        let target = null;
        if (fighters && fighters.length > 0) {
          target = fighters.find(f => f !== bot.owner);
        }

        if (bot.state === 'enter') {
          // Descend from sky
          bot.y += (bot.hoverY - bot.y) * 0.14 + 1.5;
          // Thruster trail upwards
          if (Math.random() < 0.6) {
            this.particles.push({
              x: bot.x + (Math.random() - 0.5) * 16,
              y: bot.y - 12,
              vx: (Math.random() - 0.5) * 1.5,
              vy: -2 - Math.random() * 2,
              color: Math.random() > 0.5 ? '#f97316' : '#fde047',
              life: 14,
              maxLife: 14,
              size: 3,
              type: 'spark'
            });
          }
          if (Math.abs(bot.y - bot.hoverY) < 6) {
            bot.y = bot.hoverY;
            bot.state = 'shoot';
            this.shake(5);
          }
        } else if (bot.state === 'shoot') {
          // Hover and track target horizontally
          const targetBaseX = target ? target.x : (bot.owner ? bot.owner.x + bot.owner.facing * 200 : bot.x);
          const desiredX = targetBaseX + bot.offsetX;
          bot.x += (desiredX - bot.x) * 0.055;
          bot.y = bot.hoverY + Math.sin((180 - bot.timer) * 0.12) * 6;

          // Shooting downward
          bot.shootCooldown--;
          if (bot.shootCooldown <= 0) {
            bot.shootCooldown = 6; // shoots every 6 frames = 10 shots/sec per bot
            bot.shootMuzzleToggle = !bot.shootMuzzleToggle;
            bot.muzzleTimer = 3;

            const spawnX = bot.x + (bot.shootMuzzleToggle ? -14 : 14);
            const spawnY = bot.y + 24;

            this.projectiles.push({
              owner: bot.owner,
              type: 'bot_laser',
              x: spawnX,
              y: spawnY,
              vx: (Math.random() - 0.5) * 1.2,
              vy: 16.5,
              radius: 12,
              damage: (bot.isSuper ? 8.5 : 6.5) * (bot.owner ? bot.owner.power : 1),
              color: '#f97316',
              life: 75,
              isFalling: true
            });

            if (window.soundEngine && Math.random() < 0.35) {
              window.soundEngine.playHitLight();
            }
          }

          bot.timer--;
          if (bot.timer <= 0) {
            bot.state = 'exit';
            bot.vy = 0;
          }
        } else if (bot.state === 'exit') {
          // Rocket straight up into space
          bot.vy = (bot.vy || 0) - 1.5;
          bot.y += bot.vy;

          // Rocket exhaust downwards
          for (let k = 0; k < 2; k++) {
            this.particles.push({
              x: bot.x + (Math.random() - 0.5) * 18,
              y: bot.y + 20,
              vx: (Math.random() - 0.5) * 2,
              vy: 4 + Math.random() * 4,
              color: Math.random() > 0.5 ? '#f97316' : '#facc15',
              life: 16,
              maxLife: 16,
              size: 4,
              type: 'spark'
            });
          }

          if (bot.y < -150) {
            this.bots.splice(b, 1);
          }
        }
      }
    }

    // Update Projectiles & Check Collision against Opponent
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life--;

      // Spawn trail sparks
      if (Math.random() < 0.6) {
        this.particles.push({
          x: proj.x,
          y: proj.y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color: proj.color,
          size: Math.random() * 4 + 2,
          life: 10,
          maxLife: 10,
          type: 'spark'
        });
      }

      // Code trail for Natã's Hadouken
      if (proj.type === 'code_hadouken' && Math.random() < 0.7) {
        const codeTokens = ['<div>', '<style>', '{flex}', '</>', ';', '<script>', '200 OK', '#f97316', '!important'];
        const tok = codeTokens[Math.floor(Math.random() * codeTokens.length)];
        this.particles.push({
          x: proj.x + (Math.random() - 0.5) * 20,
          y: proj.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2.5 - proj.vx * 0.15,
          vy: (Math.random() - 0.5) * 2.5,
          color: Math.random() > 0.5 ? '#38bdf8' : '#f97316',
          charText: tok,
          life: 22,
          maxLife: 22,
          type: 'code_char'
        });
      }

      // Cable Kamehameha electric trail & data packets
      if (proj.type === 'cable_kamehameha' && Math.random() < 0.65) {
        const packets = ['10Gbps', 'Cat6', 'RJ45', 'ETH', '1', '0', '⚡', 'TCP/IP', 'SYNC'];
        const pkt = packets[Math.floor(Math.random() * packets.length)];
        this.particles.push({
          x: proj.x - proj.vx * 0.35,
          y: proj.y + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 2 - proj.vx * 0.12,
          vy: (Math.random() - 0.5) * 2,
          color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24',
          charText: pkt,
          life: 20,
          maxLife: 20,
          type: 'code_char'
        });
      }

      // Cosmic astral trail for Unicão's Astral Blast
      if (proj.type === 'bone_blast' && Math.random() < 0.8) {
        const cosmicColors = ['#38bdf8', '#c084fc', '#f472b6', '#ffffff', '#60a5fa'];
        this.particles.push({
          x: proj.x + (Math.random() - 0.5) * 16,
          y: proj.y + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 3 - proj.vx * 0.15,
          vy: (Math.random() - 0.5) * 3,
          color: cosmicColors[Math.floor(Math.random() * cosmicColors.length)],
          size: Math.random() * 4 + 2,
          life: 18,
          maxLife: 18,
          type: 'spark'
        });
        if (Math.random() < 0.45) {
          const cosmicSymbols = ['✦', '★', '✧', '⭐', '✨'];
          this.particles.push({
            x: proj.x - proj.vx * 0.25,
            y: proj.y + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: cosmicColors[Math.floor(Math.random() * cosmicColors.length)],
            charText: cosmicSymbols[Math.floor(Math.random() * cosmicSymbols.length)],
            life: 20,
            maxLife: 20,
            type: 'code_char'
          });
        }
      }

      // Check collision with target fighter
      const target = fighters.find(f => f !== proj.owner);
      if (target && !target.isDead && target.state !== 'KNOCKDOWN') {
        const dx = proj.x - target.x;
        const dy = proj.y - (target.y - target.height * 0.5);
        const dist = Math.hypot(dx, dy);

        if (dist < proj.radius + target.width * 0.45) {
          // Hit target!
          target.receiveHit(proj.damage, false, proj.owner);
          this.createHitspark(proj.x, proj.y, true, proj.color);

          if (proj.type === 'code_hadouken') {
            this.shake(20);
            this.addText(proj.x, proj.y - 40, "<200 OK: COMPILED!>", "#38bdf8", 24);
            const bursts = ['{ }', '</>', '<div/>', ';', '$', 'CSS3', 'HTML5', 'display: flex', 'status: 200'];
            for (let k = 0; k < 12; k++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9,
                color: k % 2 === 0 ? '#38bdf8' : '#f97316',
                charText: bursts[k % bursts.length],
                life: 30,
                maxLife: 30,
                type: 'code_char'
              });
            }
          } else if (proj.type === 'code_burst') {
            const tok = proj.codeText || '<div/>';
            this.addText(proj.x, proj.y - 25, tok, proj.color, 16);
            for (let k = 0; k < 4; k++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: proj.color,
                charText: tok,
                life: 20,
                maxLife: 20,
                type: 'code_char'
              });
            }
          } else if (proj.type === 'cable_kamehameha' || proj.type === 'network_cable') {
            const isKame = proj.type === 'cable_kamehameha';
            this.shake(isKame ? 14 : 10);
            this.addText(proj.x, proj.y - 30, isKame ? "⚡ 10Gbps CONECTADO!" : "⚡ RJ45 CONECTADO!", "#06b6d4", 20);
            this.createHitspark(proj.x, proj.y, true, '#06b6d4');
            const bursts = ['10Gbps', 'Cat6', 'RJ45', '⚡', 'ACK', 'ETH'];
            for (let k = 0; k < 8; k++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                color: k % 2 === 0 ? '#38bdf8' : '#fbbf24',
                size: 3.5,
                charText: bursts[k % bursts.length],
                life: 20,
                maxLife: 20,
                type: 'code_char'
              });
            }
          } else if (proj.type === 'ai_robot') {
            this.shake(14);
            this.addText(proj.x, proj.y - 32, "⚡ IA: PREDIÇÃO 100%!", "#10b981", 20);
            this.createHitspark(proj.x, proj.y, true, '#10b981');
            const aiBursts = ['IA', 'ROBOT', '∫dx', '100%', 'TENSOR', 'NEURAL', '⚡', 'AI', 'PREDICT'];
            for (let k = 0; k < 8; k++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: k % 2 === 0 ? '#10b981' : '#38bdf8',
                charText: aiBursts[k % aiBursts.length],
                life: 25,
                maxLife: 25,
                type: 'code_char'
              });
            }
          } else if (proj.type === 'bone_blast') {
            this.shake(14);
            this.addText(proj.x, proj.y - 32, "✨ PODER CÓSMICO! ✨", "#38bdf8", 22);
            this.createHitspark(proj.x, proj.y, true, '#c084fc');
            const cosmicSymbols = ['✦', '★', '✧', '⭐', '✨', 'COSMOS'];
            for (let k = 0; k < 8; k++) {
              this.particles.push({
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9,
                color: k % 2 === 0 ? '#38bdf8' : '#c084fc',
                size: 4,
                charText: cosmicSymbols[k % cosmicSymbols.length],
                life: 25,
                maxLife: 25,
                type: 'code_char'
              });
            }
          } else if (proj.type === 'bot_laser') {
            this.shake(4);
            this.createHitspark(proj.x, proj.y, false, '#f97316');
            if (Math.random() < 0.28) {
              const bTexts = ['PEW!', 'IA STRIKE', 'TARGET LOCK', '99.9%', 'CRIT'];
              this.addText(proj.x, proj.y - 22, bTexts[Math.floor(Math.random() * bTexts.length)], '#f97316', 15);
            }
          }

          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Ground or out of bounds
      if (proj.x < -100 || proj.x > 1500 || proj.y > 515 || proj.life <= 0) {
        if (proj.type === 'meteor') {
          this.createFlameBurst(proj.x, 480, 20, '#ea580c');
          this.shake(8);
        } else if (proj.type === 'bot_laser') {
          this.createHitspark(proj.x, Math.min(proj.y, 510), false, '#f97316');
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  draw(ctx, cameraX) {
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Apply Screen Shake if active
    if (this.screenShake > 0.5) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Draw Projectiles
    this.projectiles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      // Glow filter
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = p.color;

      if (p.type === 'bone_blast') {
        // Unicão's Astral Cosmic Energy Sphere & Stellar Core
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 24;

        // Outer cosmic nebula gradient
        const cosmicGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, p.radius);
        cosmicGrad.addColorStop(0, '#ffffff');
        cosmicGrad.addColorStop(0.25, '#7dd3fc');
        cosmicGrad.addColorStop(0.65, '#c084fc');
        cosmicGrad.addColorStop(1, 'rgba(14, 165, 233, 0.1)');
        ctx.fillStyle = cosmicGrad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Brilliant starlight core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.42, 0, Math.PI * 2);
        ctx.fill();

        // 4-pointed radiant stellar flare
        ctx.strokeStyle = '#f0abfc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-p.radius * 1.35, 0);
        ctx.lineTo(p.radius * 1.35, 0);
        ctx.moveTo(0, -p.radius * 1.35);
        ctx.lineTo(0, p.radius * 1.35);
        ctx.stroke();

        // Orbiting celestial ring
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.15, p.radius * 0.48, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'feather_blade') {
        // Coruja feather razor
        ctx.beginPath();
        ctx.moveTo(p.radius * 1.5, 0);
        ctx.lineTo(-p.radius, -8);
        ctx.lineTo(-p.radius * 0.5, 0);
        ctx.lineTo(-p.radius, 8);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'dragon_fire' || p.type === 'meteor') {
        // Dragon Fireball / Meteor
        const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, p.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#fde047');
        grad.addColorStop(0.7, '#ea580c');
        grad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'boulder') {
        // Gorilla stone
        ctx.fillStyle = '#52525b';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'server_packet') {
        // Emerson Cyber Server Packet
        ctx.fillStyle = '#0891b2';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-p.radius, -12, p.radius * 2, 24, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = "900 11px 'Orbitron', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡DATA', 0, 0);
      } else if (p.type === 'code_tag') {
        // Natã normal special: Fast glowing HTML/CSS tag projectile
        const tags = ['<div/>', '</>', '{css}', '<main>', '<span>', 'flex:1'];
        const text = tags[Math.floor(p.life / 7) % tags.length];
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.5;
        const w = 50;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -13, w, 26, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = "bold 12px monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
      } else if (p.type === 'code_burst') {
        // Natã Special: Multiple flying HTML/CSS code snippet projectiles
        const text = p.codeText || '<div/>';
        const isTag = text.startsWith('<');
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;

        ctx.font = "bold 13px 'Courier New', monospace";
        const tw = ctx.measureText(text).width;
        const bw = Math.max(56, tw + 20);
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -14, bw, 28, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isTag ? '#f97316' : '#38bdf8';
        ctx.font = "900 9px monospace";
        ctx.fillText(isTag ? 'HTML' : 'CSS', -bw / 2 + 12, -16);

        ctx.fillStyle = '#f8fafc';
        ctx.font = "bold 12px 'Courier New', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);

        // Flame thrust behind code
        ctx.fillStyle = p.color;
        const tdir = p.vx > 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(tdir * (bw / 2), 0);
        ctx.lineTo(tdir * (bw / 2 + 14), -6);
        ctx.lineTo(tdir * (bw / 2 + 22), 0);
        ctx.lineTo(tdir * (bw / 2 + 14), 6);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'network_cable') {
        // Emerson Special: RJ45 Network Cat6 cable falling from the sky!
        const cableColor = p.cableColor || '#0284c7';
        ctx.strokeStyle = cableColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;

        // Flexible snake/coiled cable body
        ctx.beginPath();
        ctx.moveTo(0, -60);
        ctx.bezierCurveTo(-12, -40, 12, -20, 0, -8);
        ctx.stroke();

        // Strain relief boot
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-5, -12, 10, 8, 2);
        ctx.fill();

        // Transparent Crystal RJ45 Connector Head
        ctx.fillStyle = 'rgba(241, 245, 249, 0.94)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-7, -4, 14, 16, 2);
        ctx.fill();
        ctx.stroke();

        // RJ45 Clip tab
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(12, 5);
        ctx.lineTo(7, 10);
        ctx.closePath();
        ctx.fill();

        // 8 Gold contact pins
        ctx.fillStyle = '#f59e0b';
        for (let pin = 0; pin < 8; pin++) {
          ctx.fillRect(-5 + pin * 1.3, 10, 1, 3);
        }

        // Electric sparks around the connector
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        for (let s = 0; s < 3; s++) {
          const a = (s / 3) * Math.PI + (p.life * 0.4);
          ctx.beginPath();
          ctx.moveTo(0, 12);
          ctx.lineTo(Math.cos(a) * 12, 12 + Math.sin(a) * 12);
          ctx.stroke();
        }
      } else if (p.type === 'cable_kamehameha') {
        // Emerson Special: Horizontal High-Speed Cat6 RJ45 Cable Kamehameha Stream!
        const dir = p.vx >= 0 ? 1 : -1;
        const cableColor = p.cableColor || '#0284c7';
        const t = (85 - p.life) * 0.45;

        ctx.save();
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 14;

        // 1. Flexible waving Cat6 cable body trailing backward from connector
        ctx.strokeStyle = cableColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const wave1 = Math.sin(t * 1.5) * 7;
        const wave2 = Math.cos(t * 1.5) * 7;
        ctx.moveTo(-dir * 72, wave1);
        ctx.bezierCurveTo(-dir * 46, wave2, -dir * 20, -wave1, 0, 0);
        ctx.stroke();

        // 2. High-speed electricity wrapping the cable
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-dir * 62, -wave1);
        ctx.lineTo(-dir * 32, wave1);
        ctx.lineTo(-dir * 10, -wave2);
        ctx.stroke();

        // 3. Strain relief rubber boot
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(dir === 1 ? -10 : 2, -6, 8, 12, 2);
        ctx.fill();

        // 4. Crystal Clear Transparent RJ-45 Connector Body
        ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(dir === 1 ? -2 : -16, -7, 18, 14, 2);
        ctx.fill();
        ctx.stroke();

        // 5. Plastic locking clip tab
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        if (dir === 1) {
          ctx.moveTo(-2, -7);
          ctx.lineTo(8, -14);
          ctx.lineTo(12, -7);
        } else {
          ctx.moveTo(2, -7);
          ctx.lineTo(-8, -14);
          ctx.lineTo(-12, -7);
        }
        ctx.closePath();
        ctx.fill();

        // 6. 8 Gold Plated Contact Pins (front tip of connector)
        ctx.fillStyle = '#f59e0b';
        const tipX = dir === 1 ? 14 : -16;
        for (let pin = 0; pin < 8; pin++) {
          ctx.fillRect(tipX, -5 + pin * 1.3, dir * 3, 1);
        }

        // 7. Electric Plasma Kamehameha Spark Corona at the tip
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        for (let s = 0; s < 4; s++) {
          const a = (s / 4) * Math.PI * 2 + t * 2;
          ctx.beginPath();
          ctx.moveTo(tipX + dir * 2, 0);
          ctx.lineTo(tipX + dir * 2 + Math.cos(a) * 14, Math.sin(a) * 14);
          ctx.stroke();
        }

        ctx.restore();
      } else if (p.type === 'ai_robot') {
        // Andrey Special: High-Tech Flying AI Combat Droid!
        ctx.save();
        const t = (90 - p.life) * 0.3;
        const dir = p.vx >= 0 ? 1 : -1;
        if (dir === -1) ctx.scale(-1, 1);

        // 1. Plasma Thruster Exhaust
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(-22, -6);
        ctx.lineTo(-34 - Math.sin(t * 3) * 6, -2);
        ctx.lineTo(-22, 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-22, 6);
        ctx.lineTo(-34 - Math.sin(t * 3 + 1) * 6, 10);
        ctx.lineTo(-22, 14);
        ctx.closePath();
        ctx.fill();

        // 2. Aerodynamic Mecha Chassis
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(-20, -14, 40, 28, 8);
        ctx.fill();
        ctx.stroke();

        // Dark Visor Window
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-4, -9, 20, 18, 4);
        ctx.fill();

        // Glowing Emerald Optical Sensor / Cyclops Eye
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(6, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Optical Pupil
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(7, -1, 2, 0, Math.PI * 2);
        ctx.fill();

        // Cyber Antenna / Holographic Emitter
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(4, -22);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(4, -22, 3, 0, Math.PI * 2);
        ctx.fill();

        // Holographic Target HUD in front of robot
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(28, 0, 10, 0, Math.PI * 2);
        ctx.moveTo(18, 0); ctx.lineTo(38, 0);
        ctx.moveTo(28, -10); ctx.lineTo(28, 10);
        ctx.stroke();

        // "AI" badge on robot armor
        ctx.fillStyle = '#047857';
        ctx.font = "900 8px 'Orbitron', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI', -10, 0);

        ctx.restore();
      } else if (p.type === 'code_hadouken') {
        // Natã SUPER: Devastating HADOUKEN OF HTML & CSS CODE!
        const t = (90 - p.life) * 0.18;
        // 1. Multi-layered Plasma Core
        const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, p.radius * 1.25);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#38bdf8');
        grad.addColorStop(0.65, '#f97316');
        grad.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.25, 0, Math.PI * 2);
        ctx.fill();

        // 2. Swirling CSS Rings
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.2, p.radius * 0.55, t, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fdba74';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.2, p.radius * 0.55, -t * 1.3, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Orbiting HTML / CSS Tag badges around the Hadouken ball!
        const orbitTags = [
          '<div class="hadouken">',
          'display: flex;',
          '<style>',
          'box-shadow: 0 0 50px;',
          'npm run dev',
          '<!DOCTYPE html>',
          '<script>',
          '{ color: #f97316; }',
          '!important',
          'margin: 0 auto;'
        ];

        ctx.font = "bold 11px monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let k = 0; k < 4; k++) {
          const angle = t * 1.8 + (k * Math.PI / 2);
          const ox = Math.cos(angle) * (p.radius + 26);
          const oy = Math.sin(angle) * (p.radius + 16);
          const tagText = orbitTags[(Math.floor(p.life / 6) + k) % orbitTags.length];

          const tw = ctx.measureText(tagText).width;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
          ctx.strokeStyle = (k % 2 === 0) ? '#38bdf8' : '#f97316';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(ox - tw / 2 - 5, oy - 9, tw + 10, 18, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = (k % 2 === 0) ? '#38bdf8' : '#fdba74';
          ctx.fillText(tagText, ox, oy);
        }

        // 4. Center Emblem
        ctx.fillStyle = '#ffffff';
        ctx.font = "900 12px 'Orbitron', monospace";
        ctx.fillText('<CSS / HTML>', 0, 0);
      } else if (p.type === 'bot_laser') {
        // Andrey's Bot downward plasma laser bolt
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 16;

        // Outer glowing plasma beam
        const grad = ctx.createLinearGradient(0, -18, 0, 18);
        grad.addColorStop(0, 'rgba(251, 146, 60, 0.2)');
        grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.95)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 1)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.roundRect(-4.5, -18, 9, 36, 4.5);
        ctx.fill();

        // Core bright beam
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-1.8, -14, 3.6, 28, 2);
        ctx.fill();

        // Energy rings around beam
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 10, 8, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Default glowing energy sphere
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Draw Andrey's Combat Bots
    if (this.bots && this.bots.length > 0) {
      this.bots.forEach(bot => {
        ctx.save();
        ctx.translate(bot.x, bot.y);

        // 1. Thruster jet / exhaust flames under the bot's bottom feet
        const flameH = 10 + Math.random() * 14;
        const flameGrad = ctx.createLinearGradient(0, 22, 0, 22 + flameH);
        flameGrad.addColorStop(0, 'rgba(249, 115, 22, 0.95)');
        flameGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.85)');
        flameGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = flameGrad;

        // Left thruster flame
        ctx.beginPath();
        ctx.moveTo(-16, 22);
        ctx.lineTo(-8, 22);
        ctx.lineTo(-12, 22 + flameH);
        ctx.closePath();
        ctx.fill();

        // Right thruster flame
        ctx.beginPath();
        ctx.moveTo(8, 22);
        ctx.lineTo(16, 22);
        ctx.lineTo(12, 22 + flameH);
        ctx.closePath();
        ctx.fill();

        // 2. Targeting laser guide line when in shooting state
        if (bot.state === 'shoot') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(0, 24);
          ctx.lineTo(0, 360);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 3. Draw Bot Sprite (or pixel-art fallback)
        const bw = 70;
        const bh = 56;
        if (this.botImg && this.botImg.complete && this.botImg.naturalWidth > 0) {
          ctx.drawImage(this.botImg, -bw / 2, -bh / 2, bw, bh);
        } else {
          // Fallback matching the uploaded terracotta 8-bit bot
          ctx.fillStyle = '#d97757';
          // Head / main body
          ctx.fillRect(-22, -20, 44, 34);
          // Left ear/arm
          ctx.fillRect(-28, -8, 6, 12);
          // Right ear/arm
          ctx.fillRect(22, -8, 6, 12);
          // 4 Bottom prongs
          ctx.fillRect(-22, 14, 8, 14);
          ctx.fillRect(-8, 14, 8, 14);
          ctx.fillRect(0, 14, 8, 14);
          ctx.fillRect(14, 14, 8, 14);
          // Eyes (> <)
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('>', -11, -3);
          ctx.fillText('<', 11, -3);
        }

        // 4. Muzzle flash if just fired
        if (bot.muzzleTimer > 0) {
          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(bot.shootMuzzleToggle ? -14 : 14, 25, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
    }

    // Draw Particles
    this.particles.forEach(p => {
      ctx.save();
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);

      if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'code_char') {
        ctx.fillStyle = p.color;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillText(p.charText, p.x, p.y);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.lineWidth;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'slash') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 6;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, -0.6, 0.6, p.facing === -1);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw Floating Combat Texts
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `900 ${ft.size}px 'Impact', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  }
}

window.particleSystem = new ParticleSystem();
