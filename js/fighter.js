// Fighter Combat Engine for Super Fighters Combat

class Fighter {
  constructor(charId, isP2 = false, isCpu = false) {
    this.charId = charId;
    this.isP2 = isP2;
    this.isCpu = isCpu;
    this.charData = CHARACTERS[charId];

    this.resetStats();
  }

  resetStats() {
    const data = this.charData;
    this.maxHp = data.baseHp;
    this.hp = this.maxHp;
    this.maxMeter = 100;
    this.meter = (window.gameEngine && window.gameEngine.mode === 'training') ? 100 : 0; // Inicia em 0 na luta para carregar durante o combate
    this.meterRechargeDelay = 0; // Espera de 1 segundo após usar especial
    this.isSuperCharged = false;

    this.speed = data.speed;
    this.power = data.power;
    this.defense = data.defense;
    this.jumpForce = data.jumpForce;
    this.width = data.width;
    this.height = data.height;
    this.themeColor = data.themeColor;

    // Position & Physics
    this.x = this.isP2 ? 900 : 350;
    this.y = 480;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.85;
    this.facing = this.isP2 ? -1 : 1;
    this.isGrounded = true;
    this.isCrouchAttacking = false;
    this.isAirAttacking = false;
    this.usedAirAttack = false;
    this.isHoldingBack = false;
    this.holdBackTimer = 0;

    // Flight mechanics (Dragon boss)
    this.canFly = !!this.charData.canFly || this.charId === 'dragon';
    this.isFlying = false;
    this.flightAltitude = 135;
    this.flyTimer = 0;

    // State machine
    this.state = 'IDLE'; // IDLE, WALK, JUMP, CROUCH, ATTACK_LIGHT, ATTACK_HEAVY, SPECIAL, SUPER, BLOCK, HIT, KNOCKDOWN, VICTORY, DEFEAT
    this.stateTimer = 0;
    this.animTimer = 0;
    this.attackPhase = ''; // 'startup', 'active', 'recovery'
    this.hasHitThisAttack = false;

    // Timers
    this.hitStunTimer = 0;
    this.blockStunTimer = 0;
    this.hitFlashTimer = 0;
    this.invulnerableTimer = 0;

    // Combo tracker
    this.comboCount = 0;
    this.comboResetTimer = 0;

    // Rounds won
    this.roundsWon = 0;
    this.isDead = false;
  }

  // Set position for round start
  spawn(x, y, facing) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.hp = this.maxHp; // Vida 100% cheia para o novo round!
    this.state = 'IDLE';
    this.stateTimer = 0;
    this.animTimer = 0;
    this.hasHitThisAttack = false;
    this.isGrounded = true;
    this.isCrouchAttacking = false;
    this.isAirAttacking = false;
    this.usedAirAttack = false;
    this.isHoldingBack = false;
    this.holdBackTimer = 0;
    this.hitStunTimer = 0;
    this.blockStunTimer = 0;
    this.hitFlashTimer = 0;
    this.isDead = false;
    this.isFlying = false;
    this.flightAltitude = 85;
    this.flyTimer = 0;
  }

  // Get current Hurtbox
  getHurtbox() {
    let h = this.height;
    if (this.state === 'CROUCH') {
      h *= 0.58; // Significantly lowers hurtbox when ducking to dodge projectiles!
    } else if (this.state === 'JUMP') {
      h *= 0.85;
    }

    if (this.charId === 'dragon') {
      // Dragon is 1.5x bigger and has massive wings, torso and dangling tail in flight
      const dw = this.width * 1.15;
      const dh = this.isFlying ? this.height * 1.25 : this.height;
      return {
        x: this.x - dw * 0.45,
        y: this.y - dh,
        width: dw,
        height: dh
      };
    }

    return {
      x: this.x - this.width * 0.45,
      y: this.y - h,
      width: this.width * 0.9,
      height: h
    };
  }

  // Get active Hitbox during attacks
  getHitbox() {
    if (this.attackPhase !== 'active' || this.hasHitThisAttack) return null;

    const dir = this.facing;
    const isDragon = this.charId === 'dragon';
    let box = null;

    if (this.isCrouchAttacking) {
      // Low sweep attack near ground
      box = {
        x: dir === 1 ? this.x + 10 : this.x - 90,
        y: this.y - this.height * 0.35,
        width: 85,
        height: 40,
        damage: 65 * this.power,
        isHeavy: true,
        knockback: 7 * dir,
        hitStun: 20
      };
    } else if (isDragon) {
      // --- BOSS VULCANUS ATTACK HITBOXES (GROUND & FLIGHT) ---
      // Whether flying or grounded, the dragon's punches/claws strike downwards and forwards
      // so they reliably hit normal-sized and crouching fighters!
      if (this.state === 'ATTACK_LIGHT') {
        // Dragon Claw / Fire Fist: strikes downward-forward arc to hit grounded characters
        const w = 150;
        const h = this.isFlying ? 170 : 110;
        const topY = this.isFlying ? (this.y - this.height * 0.55) : (this.y - this.height * 0.75);
        box = {
          x: dir === 1 ? this.x + 10 : this.x - (w + 10),
          y: topY,
          width: w,
          height: h,
          damage: 55 * this.power,
          isHeavy: false,
          knockback: 6 * dir,
          hitStun: 18
        };
      } else if (this.state === 'ATTACK_HEAVY') {
        // Dragon Tail / Wing Sweep: massive downward smash
        const w = 180;
        const h = this.isFlying ? 180 : 130;
        const topY = this.isFlying ? (this.y - this.height * 0.55) : (this.y - this.height * 0.70);
        box = {
          x: dir === 1 ? this.x + 15 : this.x - (w + 15),
          y: topY,
          width: w,
          height: h,
          damage: 95 * this.power,
          isHeavy: true,
          knockback: 11 * dir,
          hitStun: 25
        };
      } else if (this.state === 'SPECIAL') {
        // Melee fire breath arc
        const w = 210;
        const h = this.isFlying ? 160 : 110;
        const topY = this.isFlying ? (this.y - this.height * 0.5) : (this.y - this.height * 0.75);
        box = {
          x: dir === 1 ? this.x + 10 : this.x - (w + 10),
          y: topY,
          width: w,
          height: h,
          damage: 120 * this.power,
          isHeavy: true,
          knockback: 14 * dir,
          hitStun: 28
        };
      } else if (this.state === 'SUPER') {
        const w = 220;
        box = {
          x: dir === 1 ? this.x : this.x - (w + 10),
          y: this.y - this.height * 0.95,
          width: w,
          height: this.height * 1.1,
          damage: 260 * this.power,
          isHeavy: true,
          knockback: 20 * dir,
          hitStun: 38
        };
      }
    } else if (this.isAirAttacking) {
      // --- PLAYER AERIAL ATTACKS (JUMP + PUNCH & JUMP + KICK) ---
      if (this.state === 'ATTACK_LIGHT') {
        // Aerial Anti-Air Punch: angled upwards and forwards to reach flying dragons!
        const w = 95;
        const h = 85;
        box = {
          x: dir === 1 ? this.x + 5 : this.x - (w + 5),
          y: this.y - this.height * 0.95,
          width: w,
          height: h,
          damage: 55 * this.power,
          isHeavy: false,
          knockback: 5 * dir,
          hitStun: 18
        };
      } else {
        // Aerial Heavy Kick: diving / flying kick with wide coverage
        const w = 105;
        const h = 75;
        box = {
          x: dir === 1 ? this.x + 5 : this.x - (w + 5),
          y: this.y - this.height * 0.80,
          width: w,
          height: h,
          damage: 80 * this.power,
          isHeavy: true,
          knockback: 8 * dir,
          hitStun: 22
        };
      }
    } else if (this.state === 'ATTACK_LIGHT') {
      // Ground Light Punch: generous upward reach to clip hovering enemies!
      const w = 75;
      const h = 55;
      box = {
        x: dir === 1 ? this.x + 10 : this.x - (w + 10),
        y: this.y - this.height * 0.85,
        width: w,
        height: h,
        damage: 45 * this.power,
        isHeavy: false,
        knockback: 4 * dir,
        hitStun: 14
      };
    } else if (this.state === 'ATTACK_HEAVY') {
      const w = this.charId === 'gorilla' ? 120 : (this.charId === 'owl' ? 110 : 90);
      const h = 65;
      box = {
        x: dir === 1 ? this.x + 12 : this.x - (w + 12),
        y: this.y - this.height * 0.80,
        width: w,
        height: h,
        damage: 85 * this.power,
        isHeavy: true,
        knockback: 9 * dir,
        hitStun: 22
      };
    } else if (this.state === 'SPECIAL') {
      const w = this.charId === 'dog' ? 260 : (this.charId === 'gorilla' ? 210 : (this.charId === 'owl' ? 180 : (this.charId === 'capybara' ? 140 : (this.charId === 'cat' ? 160 : 100))));
      const h = this.charId === 'gorilla' ? 110 : (this.charId === 'owl' ? 95 : (this.charId === 'capybara' ? 95 : (this.charId === 'cat' ? 85 : 75)));
      box = {
        x: dir === 1 ? this.x + 10 : this.x - (w + 10),
        y: this.y - this.height * 0.85,
        width: w,
        height: h,
        damage: 120 * this.power,
        isHeavy: true,
        knockback: 16 * dir,
        hitStun: 30
      };
    } else if (this.state === 'SUPER') {
      const w = this.charId === 'cat' ? 180 : 140;
      box = {
        x: dir === 1 ? this.x : this.x - (w + 10),
        y: this.y - this.height * 0.95,
        width: w,
        height: this.height * 0.95,
        damage: 240 * this.power,
        isHeavy: true,
        knockback: 18 * dir,
        hitStun: 35
      };
    }

    return box;
  }

  // Can the fighter perform a new action?
  canAct() {
    if (this.isDead) return false;
    if (['HIT', 'KNOCKDOWN', 'VICTORY', 'DEFEAT'].includes(this.state)) return false;
    if (this.hitStunTimer > 0 || this.blockStunTimer > 0) return false;
    if (['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'SUPER'].includes(this.state)) {
      return false; // must wait for recovery
    }
    return true;
  }

  // --- Fighter Inputs ---
  // Holding the direction away from the opponent = blocking (expires shortly after release)
  setHoldingBack() {
    this.isHoldingBack = true;
    this.holdBackTimer = 4;
  }

  moveLeft() {
    if (!this.canAct()) return;
    if (this.facing === 1) this.setHoldingBack();
    if (this.state === 'CROUCH' && !this.isFlying) return; // crouch-block: hold back while ducking
    this.vx = -this.speed * (this.isFlying ? 1.25 : 1.0);
    if (this.isGrounded && this.state !== 'JUMP' && !['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'SUPER', 'HIT', 'KNOCKDOWN', 'DEFEAT', 'VICTORY'].includes(this.state)) {
      this.state = 'WALK';
    }
  }

  moveRight() {
    if (!this.canAct()) return;
    if (this.facing === -1) this.setHoldingBack();
    if (this.state === 'CROUCH' && !this.isFlying) return; // crouch-block: hold back while ducking
    this.vx = this.speed * (this.isFlying ? 1.25 : 1.0);
    if (this.isGrounded && this.state !== 'JUMP' && !['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'SUPER', 'HIT', 'KNOCKDOWN', 'DEFEAT', 'VICTORY'].includes(this.state)) {
      this.state = 'WALK';
    }
  }

  jump(dir = 0) {
    if (!this.canAct()) return;
    if (this.canFly) {
      if (!this.isFlying) {
        this.isFlying = true;
        this.flightAltitude = 85;
        this.vy = -this.jumpForce * 0.75;
        this.isGrounded = false;
        this.state = 'JUMP';
        window.soundEngine.playWhoosh();
      } else {
        // Ascend slightly while in flight (capped at 110 so fighters can always reach with jump attacks)
        this.flightAltitude = Math.min(110, this.flightAltitude + 20);
        this.vy = -3;
        window.soundEngine.playWhoosh();
      }
      return;
    }
    if (this.isGrounded) {
      this.vy = -this.jumpForce;
      this.state = 'JUMP';
      this.isGrounded = false;
      this.isAirAttacking = false;
      this.isCrouchAttacking = false;
      this.usedAirAttack = false;
      if (dir !== 0) {
        this.vx = dir * this.speed * 1.15;
      }
      window.soundEngine.playWhoosh();
    }
  }

  crouch() {
    if (!this.canAct()) return;
    if (this.isFlying) {
      // Descend or land
      this.flightAltitude = Math.max(0, this.flightAltitude - 45);
      this.vy = 6;
      if (this.flightAltitude <= 20) {
        this.isFlying = false;
        this.isGrounded = true;
        this.state = 'CROUCH';
      }
      return;
    }
    if (this.isGrounded && this.state !== 'ATTACK_LIGHT' && this.state !== 'ATTACK_HEAVY') {
      this.state = 'CROUCH';
      this.vx = 0;
    }
  }

  standUp() {
    if (this.state === 'CROUCH' || this.state === 'WALK') {
      this.state = 'IDLE';
    }
    this.vx = 0;
    this.isHoldingBack = false;
    this.holdBackTimer = 0;
  }

  // Air attacks are limited to one per jump, except for flying dragons
  canAirAttack() {
    return this.isGrounded || this.isFlying || !this.usedAirAttack;
  }

  attackLight() {
    if (!this.canAct() || !this.canAirAttack()) return;
    this.isCrouchAttacking = this.state === 'CROUCH';
    this.isAirAttacking = !this.isGrounded || this.state === 'JUMP';
    if (this.isAirAttacking) this.usedAirAttack = true;
    this.state = 'ATTACK_LIGHT';
    this.stateTimer = 0;
    this.attackPhase = 'startup';
    this.hasHitThisAttack = false;
    if (this.isGrounded) this.vx = 0;
    window.soundEngine.playWhoosh();
  }

  attackHeavy() {
    if (!this.canAct() || !this.canAirAttack()) return;
    this.isCrouchAttacking = this.state === 'CROUCH';
    this.isAirAttacking = !this.isGrounded || this.state === 'JUMP';
    if (this.isAirAttacking) this.usedAirAttack = true;
    this.state = 'ATTACK_HEAVY';
    this.stateTimer = 0;
    this.attackPhase = 'startup';
    this.hasHitThisAttack = false;
    if (this.isGrounded) this.vx = 0;
    window.soundEngine.playWhoosh();
  }

  specialMove() {
    if (!this.canAct()) return;
    if (this.meter < 50) return; // Especial pronto com apenas 50% da barra (muito mais rápido que o Super)!

    // Consome 50% da barra e espera 1 segundo antes de começar a encher novamente
    this.meter = Math.max(0, this.meter - 50);
    this.isSuperCharged = this.meter >= 100;
    this.meterRechargeDelay = 60; // 60 frames = 1 segundo de espera!

    this.state = 'SPECIAL';
    this.stateTimer = 0;
    this.attackPhase = 'startup';
    this.hasHitThisAttack = false;
    this.vx = 0;
    window.soundEngine.playSpecial();

    // If Natã, launch a barrage of HTML & CSS code fragments flying at opponent!
    if (this.charId === 'nata') {
      const codeSnippets = [
        '<div class="box">',
        'display: flex;',
        'justify-content: center;',
        'color: #ff5500;',
        '<span role="code">'
      ];
      codeSnippets.forEach((snippet, idx) => {
        setTimeout(() => {
          if (this.state === 'SPECIAL' && !this.isDead) {
            window.soundEngine.playProjectile();
            window.particleSystem.spawnCodeBurst(this, snippet, idx);
          }
        }, 35 + idx * 55);
      });
      return;
    }

    // If Emerson, fire the legendary Kamehameha of Cat6 RJ45 Network Cables!
    if (this.charId === 'emerson') {
      window.particleSystem.addText(this.x, this.y - this.height - 25, "KAMEHAMEHA RJ45!", "#06b6d4", 24);
      window.particleSystem.shake(14);
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          if (!this.isDead && (this.state === 'SPECIAL' || this.stateTimer < 35)) {
            window.soundEngine.playProjectile();
            window.particleSystem.spawnCableKamehameha(this, i);
          }
        }, 30 + i * 45);
      }
      return;
    }

    // If Andrey, deploy 2 autonomous AI Combat Bots from the sky shooting down for 3 seconds!
    if (this.charId === 'andrey') {
      window.particleSystem.addText(this.x, this.y - this.height - 25, "DUPLA DE DRONES IA!", "#f97316", 24);
      setTimeout(() => {
        if (!this.isDead && (this.state === 'SPECIAL' || this.stateTimer < 35)) {
          window.soundEngine.playSpecial();
          window.particleSystem.spawnAndreyBots(this, false);
        }
      }, 40);
      return;
    }

    // If Unicão, unleash the cosmic Astral Impact!
    if (this.charId === 'dog') {
      window.particleSystem.addText(this.x, this.y - this.height - 25, "IMPACTO ASTRAL!", "#38bdf8", 24);
      window.particleSystem.shake(12);
      setTimeout(() => {
        if (!this.isDead && (this.state === 'SPECIAL' || this.stateTimer < 35)) {
          window.soundEngine.playSpecial();
          window.particleSystem.spawnProjectile(this, 'bone_blast');
        }
      }, 35);
      return;
    }

    // If Dragon Vulcanus, unleash meteor shower raining from the sky for 3 seconds!
    if (this.charId === 'dragon') {
      window.particleSystem.addText(this.x, this.y - this.height - 25, "CHUVA DE METEOROS!", "#ea580c", 26);
      window.particleSystem.shake(14);
      window.particleSystem.spawnDragonMeteorShower(this, 180);
      return;
    }

    // If Capybara Mestre Kai, flying dragon kick surging forward across the screen!
    if (this.charId === 'capybara') {
      window.particleSystem.addText(this.x, this.y - this.height - 25, "CHUTE DO DRAGÃO CHI!", "#f59e0b", 26);
      window.soundEngine.playSpecial();
      window.particleSystem.shake(12);
      this.vx = this.facing * 16.5;
      this.vy = -3;
      this.isGrounded = false;
      this.attackPhase = 'active';
      return;
    }

    // If Cat Kage, shadow claw triple slash wave!
    if (this.charId === 'cat') {
      window.soundEngine.playSpecial();
      window.particleSystem.shake(10);
      window.particleSystem.addText(this.x, this.y - this.height - 25, "GARRAS DA SOMBRA!", "#10b981", 24);
      window.particleSystem.createSlashTrail(this.x + this.facing * 35, this.y - this.height * 0.5, this.facing, '#10b981', 40);
      for (let i = 0; i < 16; i++) {
        window.particleSystem.particles.push({
          x: this.x + this.facing * (20 + Math.random() * 40),
          y: this.y - this.height * 0.55 + (Math.random() - 0.5) * 30,
          vx: this.facing * (4 + Math.random() * 5),
          vy: (Math.random() - 0.5) * 4,
          color: Math.random() > 0.5 ? '#10b981' : '#34d399',
          life: 18,
          maxLife: 18,
          size: 3.5,
          type: 'spark'
        });
      }
      return;
    }

    // If Gorilla Kongo, explosive seismic titan punch with earth blast & rock burst!
    if (this.charId === 'gorilla') {
      window.particleSystem.addText(this.x, this.y - this.height - 25, "IMPACTO SÍSMICO TITÂNICO!", "#eab308", 26);
      window.particleSystem.shake(14);
      window.soundEngine.playHitHeavy();
      window.soundEngine.playSpecial();
      this.vx = this.facing * 5.0; // powerful lunging punch forward
      window.particleSystem.createImpactRing(this.x + this.facing * 60, this.y, '#f59e0b', true);
      for (let i = 0; i < 24; i++) {
        window.particleSystem.particles.push({
          x: this.x + this.facing * (40 + Math.random() * 55),
          y: this.y - 10 - Math.random() * 50,
          vx: this.facing * (3 + Math.random() * 6),
          vy: -3 - Math.random() * 5,
          color: Math.random() > 0.4 ? '#f59e0b' : (Math.random() > 0.5 ? '#ea580c' : '#78350f'),
          life: 25,
          maxLife: 25,
          size: 4 + Math.random() * 3,
          type: 'spark'
        });
      }
      setTimeout(() => {
        if (!this.isDead && (this.state === 'SPECIAL' || this.stateTimer < 35)) {
          window.particleSystem.spawnProjectile(this, 'boulder');
        }
      }, 40);
      return;
    }

    // If Owl Nocturna, summon swirling shinobi vortex tornado!
    if (this.charId === 'owl') {
      window.particleSystem.addText(this.x, this.y - this.height - 25, "TORNADO SHINOBI!", "#8b5cf6", 24);
      window.particleSystem.shake(12);
      window.soundEngine.playSpecial();
      for (let i = 0; i < 16; i++) {
        window.particleSystem.particles.push({
          x: this.x + this.facing * (30 + Math.random() * 40),
          y: this.y - this.height * 0.5 + (Math.random() - 0.5) * 40,
          vx: this.facing * (3 + Math.random() * 4),
          vy: -2 - Math.random() * 3,
          color: Math.random() > 0.5 ? '#8b5cf6' : '#c4b5fd',
          life: 20,
          maxLife: 20,
          size: 3.5,
          type: 'spark'
        });
      }
      setTimeout(() => {
        if (!this.isDead && (this.state === 'SPECIAL' || this.stateTimer < 35)) {
          window.soundEngine.playProjectile();
          window.particleSystem.spawnProjectile(this, 'tornado');
        }
      }, 35);
      return;
    }

    // If projectile character, spawn projectile during active phase
    const projType = this.charData.projectileType;
    setTimeout(() => {
      if (this.state === 'SPECIAL' && !this.isDead) {
        window.soundEngine.playProjectile();
        window.particleSystem.spawnProjectile(this, projType);
      }
    }, 45);
  }

  superMove() {
    if (!this.canAct()) return;
    if (this.meter < 100) return; // requires full super bar

    this.meter = 0;
    this.isSuperCharged = false;
    this.meterRechargeDelay = 60; // Espera 1 segundo para começar a encher novamente
    this.state = 'SUPER';
    this.stateTimer = 0;
    this.attackPhase = 'startup';
    this.hasHitThisAttack = false;
    this.vx = 0;

    // Dramatic freeze & sound
    window.soundEngine.playSuperActivate();
    window.particleSystem.superFreeze(35);
    window.particleSystem.shake(16);
    window.particleSystem.addText(this.x, this.y - this.height - 30, this.charData.superName.toUpperCase(), this.themeColor, 32);

    // If Dragon Vulcanus, unleash the devastating Magma Fire Torrent Super!
    if (this.charId === 'dragon') {
      setTimeout(() => {
        if (!this.isDead) {
          window.particleSystem.spawnDragonSuperFlame(this);
        }
      }, 100);
    }

    // If Bear Ursus, unleash Terremoto Glacial seismic frost blast!
    if (this.charId === 'bear') {
      setTimeout(() => {
        if (!this.isDead && window.particleSystem) {
          window.particleSystem.shake(18);
          for (let i = 0; i < 35; i++) {
            window.particleSystem.particles.push({
              x: this.x + this.facing * (40 + Math.random() * 120),
              y: this.y - Math.random() * 90,
              vx: this.facing * (5 + Math.random() * 8),
              vy: -2 - Math.random() * 5,
              color: Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#ffffff' : '#0284c7'),
              life: 25,
              maxLife: 25,
              size: 5,
              type: 'spark'
            });
          }
        }
      }, 80);
    }

    // If Natã, launch HTML/CSS Hadouken Super!
    if (this.charId === 'nata') {
      setTimeout(() => {
        if (!this.isDead) {
          window.soundEngine.playProjectile();
          window.particleSystem.spawnProjectile(this, 'code_hadouken');
        }
      }, 160);
    }

    // If Capybara Mestre Kai, unleash blazing Chi crescent wave from the kick!
    if (this.charId === 'capybara') {
      setTimeout(() => {
        if (!this.isDead) {
          window.soundEngine.playProjectile();
          window.particleSystem.shake(16);
          window.particleSystem.spawnProjectile(this, 'fire_kick_crescent');
        }
      }, 70);
    }

    // If Cat Kage, crossed arms glowing X claw slash cataclysm!
    if (this.charId === 'cat') {
      setTimeout(() => {
        if (!this.isDead && window.particleSystem) {
          window.particleSystem.shake(20);
          window.particleSystem.addText(this.x, this.y - this.height - 35, "★ CORTE X DAS SOMBRAS! ★", "#10b981", 28);
          window.particleSystem.createSlashTrail(this.x + this.facing * 45, this.y - this.height * 0.5, this.facing, '#10b981', 60);
          for (let i = 0; i < 35; i++) {
            window.particleSystem.particles.push({
              x: this.x + this.facing * (30 + Math.random() * 80),
              y: this.y - Math.random() * 110,
              vx: this.facing * (6 + Math.random() * 8),
              vy: (Math.random() - 0.5) * 8,
              color: Math.random() > 0.4 ? '#10b981' : (Math.random() > 0.5 ? '#34d399' : '#a7f3d0'),
              life: 25,
              maxLife: 25,
              size: 5,
              type: 'spark'
            });
          }
        }
      }, 70);
    }

    // If Andrey, deploy supreme squad of AI Combat Bots from the sky!
    if (this.charId === 'andrey') {
      setTimeout(() => {
        if (!this.isDead) {
          window.soundEngine.playSpecial();
          window.particleSystem.spawnAndreyBots(this, true);
        }
      }, 120);
    }

    // If Emerson, unleash the SUPER KAMEHAMEHA 10Gbps DATA PURGE!
    if (this.charId === 'emerson') {
      window.particleSystem.shake(22);
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (!this.isDead) {
            window.soundEngine.playProjectile();
            window.particleSystem.spawnCableKamehameha(this, i, true);
          }
        }, 80 + i * 55);
      }
    }

    // If Owl Nocturna, unleash razor feather storm barrage!
    if (this.charId === 'owl') {
      window.particleSystem.shake(20);
      window.particleSystem.addText(this.x, this.y - this.height - 35, "★ TEMPESTADE DE PENAS SHINOBI! ★", "#8b5cf6", 26);
      for (let i = 0; i < 14; i++) {
        setTimeout(() => {
          if (!this.isDead) {
            window.soundEngine.playHitLight();
            const p = window.particleSystem.spawnProjectile(this, 'feather_blade');
            if (p) {
              p.vy = (Math.random() - 0.5) * 3.5;
              p.damage = 22 * this.power;
            }
          }
        }, 40 + i * 45);
      }
    }
  }

  // Receive Hit or Block
  receiveHit(damage, isHeavy, attacker) {
    if (this.isDead || this.invulnerableTimer > 0) return;

    // Check if Blocking
    const isBlocking = this.isHoldingBack || this.state === 'BLOCK';
    if (isBlocking && this.state !== 'HIT' && this.state !== 'KNOCKDOWN') {
      // Blocked!
      const blockedDamage = Math.max(3, damage * 0.15);
      this.hp -= blockedDamage / this.defense;
      this.blockStunTimer = isHeavy ? 14 : 8;
      this.state = 'BLOCK';
      this.vx = -4 * this.facing;
      this.addMeter(2);
      if (attacker) attacker.addMeter(3);

      window.soundEngine.playBlock();
      window.particleSystem.createBlockSpark(this.x, this.y - this.height * 0.6);
      window.particleSystem.addText(this.x, this.y - this.height * 0.7, 'BLOQUEIO', '#38bdf8', 18);
      return;
    }

    // Direct Hit Connected!
    const effectiveDamage = damage / this.defense;
    this.hp -= effectiveDamage;
    this.hitStunTimer = isHeavy ? 24 : 15;
    this.hitFlashTimer = 6;
    this.addMeter(isHeavy ? 5 : 4);
    if (attacker) {
      // Requisito: A cada dois socos ou dois chutes aumente 15% a 20%:
      // 1 Soco (light): +8.5% (2 socos = 17%, no intervalo de 15% a 20%)
      // 1 Chute (heavy): +10.0% (2 chutes = 20%)
      attacker.addMeter(isHeavy ? 10.0 : 8.5);
    }

    // Sound and Sparks
    if (isHeavy) {
      window.soundEngine.playHitHeavy();
      window.particleSystem.createHitspark(this.x, this.y - this.height * 0.6, true, attacker ? attacker.themeColor : '#f59e0b');
    } else {
      window.soundEngine.playHitLight();
      window.particleSystem.createHitspark(this.x, this.y - this.height * 0.6, false, attacker ? attacker.themeColor : '#f59e0b');
    }

    // Knockback
    const kbDir = attacker ? attacker.facing : -this.facing;
    this.vx = (isHeavy ? 10 : 5) * kbDir;

    // Heavy hits can cause knockdown
    if (isHeavy && (this.y < 470 || damage > 90 || this.hp <= 0)) {
      this.isFlying = false;
      this.state = 'KNOCKDOWN';
      this.stateTimer = 0;
      this.vy = -7;
    } else {
      this.state = 'HIT';
      this.stateTimer = 0;
    }

    // Track Attacker Combo
    if (attacker) {
      attacker.comboCount++;
      attacker.comboResetTimer = 60;
      if (attacker.comboCount > 1) {
        let label = `COMBO x${attacker.comboCount}!`;
        let col = '#fbbf24';
        if (attacker.comboCount >= 5) {
          label = `BRUTAL x${attacker.comboCount}!`;
          col = '#ef4444';
        } else if (attacker.comboCount >= 3) {
          label = `SAVAGE x${attacker.comboCount}!`;
          col = '#f97316';
        }
        window.particleSystem.addText(attacker.x, attacker.y - attacker.height - 20, label, col, 28);
      }
    }

    // Check Death
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.state = 'DEFEAT';
      window.soundEngine.playKO();
      window.particleSystem.superFreeze(40);
      window.particleSystem.shake(25);
    }
  }

  addMeter(amount) {
    if (this.meterRechargeDelay > 0) return; // Bloqueado durante o 1 segundo de espera!
    this.meter = Math.min(this.maxMeter, this.meter + amount);
    if (this.meter >= this.maxMeter) {
      this.isSuperCharged = true;
    }
  }

  // Update fighter physics, timers, states
  update(stage, opponent) {
    this.animTimer++;

    // Super Freeze check
    if (window.particleSystem.superFreezeTimer > 0) return;

    // Special Meter recharge delay & passive regeneration
    if (this.meterRechargeDelay > 0) {
      this.meterRechargeDelay--;
      // Permanece em 0 durante o 1 segundo de espera
    } else if (this.meter < this.maxMeter && !this.isDead) {
      // Mais demorado para carregar: regeneração passiva mínima para valorizar a luta ativa
      const regenRate = (window.gameEngine && window.gameEngine.mode === 'training') ? 0.50 : 0.03;
      this.addMeter(regenRate);
    }

    // Combo timer decay
    if (this.comboResetTimer > 0) {
      this.comboResetTimer--;
      if (this.comboResetTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // Flash timer
    if (this.hitFlashTimer > 0) this.hitFlashTimer--;
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;

    // Block input expires a few frames after the back direction is released
    if (this.holdBackTimer > 0) {
      this.holdBackTimer--;
      if (this.holdBackTimer <= 0) this.isHoldingBack = false;
    }

    // Auto Face Opponent when grounded/flying and not attacking
    if (opponent && this.canAct() && (this.isGrounded || this.isFlying)) {
      this.facing = this.x < opponent.x ? 1 : -1;
    }

    // Apply Flight Physics or Gravity & Ground Collision
    if (this.isFlying) {
      this.isGrounded = false;
      this.flyTimer++;
      const targetFlyY = stage.groundY - (this.flightAltitude || 85);
      this.vy += (targetFlyY - this.y) * 0.08;
      this.vy *= 0.86;
      this.vx *= 0.94; // air glide drag

      // Embers floating down from dragon wings
      if (this.charId === 'dragon' && this.animTimer % 5 === 0) {
        window.particleSystem.createBlockSpark(this.x + (Math.random() - 0.5) * 80, this.y - 30);
      }
    } else if (this.y < stage.groundY || this.vy < 0) {
      this.vy += this.gravity;
      this.isGrounded = false;
    } else {
      this.y = stage.groundY;
      this.vy = 0;
      const wasAir = !this.isGrounded;
      this.isGrounded = true;
      if (wasAir) {
        this.isAirAttacking = false;
        this.usedAirAttack = false;
        if (this.state === 'JUMP' || this.state === 'ATTACK_LIGHT' || this.state === 'ATTACK_HEAVY') {
          this.state = 'IDLE';
          this.attackPhase = '';
          window.particleSystem.createBlockSpark(this.x, stage.groundY - 5);
        }
      }
    }

    // Apply Velocities
    this.x += this.vx;
    this.y += this.vy;
    if (this.y > stage.groundY) this.y = stage.groundY;

    // Body Separation Pushback
    if (opponent && !this.isDead && !opponent.isDead) {
      const minDistance = (this.width + opponent.width) * 0.44;
      const dx = this.x - opponent.x;
      const dy = Math.abs(this.y - opponent.y);
      if (Math.abs(dx) < minDistance && dy < 95) {
        const push = (minDistance - Math.abs(dx)) * 0.35;
        const sign = dx >= 0 ? 1 : -1;
        this.x += sign * push;
        opponent.x -= sign * push;
      }
    }

    // Friction on ground
    if (this.isGrounded) {
      this.vx *= 0.82;
      if (Math.abs(this.vx) < 0.2) this.vx = 0;
      if (this.vx === 0 && this.state === 'WALK') {
        this.state = 'IDLE';
      }
    }

    // Stage & Camera Viewport Bounds (Prevents fighters from disappearing off edges)
    let minX = 75;
    let maxX = stage.width - 75;

    if (window.gameEngine && window.gameEngine.cameraX !== undefined) {
      const camX = window.gameEngine.cameraX;
      const camW = window.gameEngine.canvasWidth || 1280;
      const margin = Math.max(55, this.width * 0.45);
      minX = Math.max(minX, camX + margin);
      maxX = Math.min(maxX, camX + camW - margin);
    }

    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;

    // State Timers & Phase Transitions
    this.stateTimer++;

    // Hitstun & Blockstun decay
    if (this.hitStunTimer > 0) {
      this.hitStunTimer--;
      if (this.hitStunTimer <= 0 && this.state === 'HIT') {
        this.state = 'IDLE';
      }
    }

    if (this.blockStunTimer > 0) {
      this.blockStunTimer--;
      if (this.blockStunTimer <= 0 && this.state === 'BLOCK') {
        this.state = 'IDLE';
      }
    }

    // Attack Frame Data
    if (this.state === 'ATTACK_LIGHT') {
      if (this.stateTimer <= 4) {
        this.attackPhase = 'startup';
      } else if (this.stateTimer <= 11) {
        this.attackPhase = 'active';
        if (this.charId === 'dragon' && (this.isFlying || !this.isGrounded) && this.stateTimer === 5) {
          if (window.particleSystem) {
            for (let i = 0; i < 8; i++) {
              window.particleSystem.particles.push({
                x: this.x + this.facing * 75,
                y: this.y - this.height * 0.45,
                vx: this.facing * (2.5 + Math.random() * 4),
                vy: (Math.random() - 0.5) * 3,
                color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
                life: 14,
                maxLife: 14,
                size: 3.5,
                type: 'spark'
              });
            }
          }
        }
      } else if (this.stateTimer <= 18) {
        this.attackPhase = 'recovery';
      } else {
        this.state = this.isCrouchAttacking ? 'CROUCH' : (this.isFlying ? 'IDLE' : (this.isGrounded ? 'IDLE' : 'JUMP'));
        this.isCrouchAttacking = false;
        this.attackPhase = '';
      }
    } else if (this.state === 'ATTACK_HEAVY') {
      if (this.stateTimer <= 7) {
        this.attackPhase = 'startup';
      } else if (this.stateTimer <= 16) {
        this.attackPhase = 'active';
        if (this.charId === 'dragon' && (this.isFlying || !this.isGrounded) && this.stateTimer === 8) {
          if (window.particleSystem) {
            window.particleSystem.shake(4);
            for (let i = 0; i < 12; i++) {
              window.particleSystem.particles.push({
                x: this.x + this.facing * 85,
                y: this.y - this.height * 0.25,
                vx: this.facing * (3 + Math.random() * 5),
                vy: (Math.random() - 0.5) * 4,
                color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444',
                life: 16,
                maxLife: 16,
                size: 4,
                type: 'spark'
              });
            }
          }
        }
      } else if (this.stateTimer <= 27) {
        this.attackPhase = 'recovery';
      } else {
        this.state = this.isCrouchAttacking ? 'CROUCH' : (this.isFlying ? 'IDLE' : (this.isGrounded ? 'IDLE' : 'JUMP'));
        this.isCrouchAttacking = false;
        this.attackPhase = '';
      }
    } else if (this.state === 'SPECIAL') {
      if (this.charId === 'capybara') {
        // Capybara's Flying Dragon Kick sweeps forward across the screen with two sprites!
        if (this.stateTimer <= 38) {
          this.attackPhase = 'active';
          this.vx = 15.5 * this.facing;
          if (this.animTimer % 2 === 0 && window.particleSystem) {
            window.particleSystem.particles.push({
              x: this.x - this.facing * 25 + (Math.random() - 0.5) * 15,
              y: this.y - 35 + (Math.random() - 0.5) * 20,
              vx: -this.facing * (2 + Math.random() * 3),
              vy: (Math.random() - 0.5) * 2,
              color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444',
              life: 15,
              maxLife: 15,
              size: 4,
              type: 'spark'
            });
          }
        } else if (this.stateTimer <= 46) {
          this.attackPhase = 'recovery';
          this.vx *= 0.82;
        } else {
          this.state = this.isGrounded ? 'IDLE' : 'JUMP';
          this.attackPhase = '';
        }
      } else {
        if (this.stateTimer <= 5) {
          this.attackPhase = 'startup';
        } else if (this.stateTimer <= 16) {
          this.attackPhase = 'active';
          this.vx = 5.5 * this.facing; // dash forward faster during special
        } else if (this.stateTimer <= 25) {
          this.attackPhase = 'recovery';
        } else {
          this.state = 'IDLE';
          this.attackPhase = '';
        }
      }
    } else if (this.state === 'SUPER') {
      if (this.stateTimer <= 16) {
        this.attackPhase = 'startup';
      } else if (this.stateTimer <= 36) {
        this.attackPhase = 'active';
        this.vx = 7 * this.facing; // devastating dash
      } else if (this.stateTimer <= 52) {
        this.attackPhase = 'recovery';
      } else {
        this.state = 'IDLE';
        this.attackPhase = '';
      }
    } else if (this.state === 'KNOCKDOWN') {
      this.isFlying = false;
      if (this.y >= stage.groundY && this.stateTimer > 40) {
        // Get up from floor
        this.state = 'IDLE';
        this.invulnerableTimer = 18; // wake-up invulnerability
        if (this.canFly && Math.random() < 0.65) {
          // Dragon spreads wings and takes flight on wake-up!
          this.isFlying = true;
          this.flightAltitude = 85;
          this.vy = -5;
        }
      }
    } else if (this.state === 'VICTORY') {
      this.vx = 0;
      if (this.isFlying) {
        if (this.y < stage.groundY) {
          this.y = Math.min(stage.groundY, this.y + 5);
        }
        if (this.y >= stage.groundY) {
          this.y = stage.groundY;
          this.isFlying = false;
          this.isGrounded = true;
        }
      }
      if (this.charId === 'dragon') {
        if (this.stateTimer === 1) {
          if (window.soundEngine) window.soundEngine.playSpecial();
        } else if (this.stateTimer === 72) {
          if (window.particleSystem) {
            window.particleSystem.shake(10);
            for (let i = 0; i < 18; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 80,
                y: this.y - Math.random() * 120,
                vx: (Math.random() - 0.5) * 4,
                vy: -3 - Math.random() * 4,
                color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
                life: 25,
                maxLife: 25,
                size: 4,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 126) {
          if (window.soundEngine) window.soundEngine.playSuperActivate();
          if (window.particleSystem) {
            window.particleSystem.shake(18);
            window.particleSystem.addText(this.x, this.y - this.height - 35, "★ O CATACLISMO DE VULCANUS! ★", "#ef4444", 28);
            for (let i = 0; i < 35; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 100,
                y: this.y - Math.random() * 150,
                vx: (Math.random() - 0.5) * 6,
                vy: -4 - Math.random() * 6,
                color: Math.random() > 0.4 ? '#ef4444' : (Math.random() > 0.5 ? '#f59e0b' : '#fde047'),
                life: 30,
                maxLife: 30,
                size: 5,
                type: 'spark'
              });
            }
          }
        }

        if (this.stateTimer >= 126 && this.animTimer % 4 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 90,
            y: this.y - 20 - Math.random() * 100,
            vx: (Math.random() - 0.5) * 2.5,
            vy: -2 - Math.random() * 3,
            color: Math.random() > 0.5 ? '#ef4444' : '#f59e0b',
            life: 22,
            maxLife: 22,
            size: 4,
            type: 'spark'
          });
        }
      }
      if (this.charId === 'emerson') {
        if (this.stateTimer === 62) {
          // Surge of blue electric aura
          if (window.particleSystem) {
            window.particleSystem.shake(8);
            for (let i = 0; i < 14; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 55,
                y: this.y - Math.random() * 85,
                vx: (Math.random() - 0.5) * 3,
                vy: -2 - Math.random() * 4,
                color: Math.random() > 0.5 ? '#38bdf8' : '#22d3ee',
                life: 20,
                maxLife: 20,
                size: 4,
                type: 'spark'
              });
            }
          }
          if (window.soundEngine) window.soundEngine.playSpecial();
        } else if (this.stateTimer === 100) {
          // Full power Akuma / Super Saiyan aura burst!
          if (window.particleSystem) {
            window.particleSystem.shake(16);
            window.particleSystem.addText(this.x, this.y - this.height - 30, "★ PURGE SUPREMO! ★", "#22d3ee", 26);
            for (let i = 0; i < 26; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 75,
                y: this.y - Math.random() * 130,
                vx: (Math.random() - 0.5) * 5,
                vy: -4 - Math.random() * 6,
                color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
                life: 25,
                maxLife: 25,
                size: 5,
                type: 'spark'
              });
            }
          }
          if (window.soundEngine) window.soundEngine.playSuperActivate();
        }

        // Continuous subtle aura particles while in pose 3 or 4
        if (this.stateTimer > 62 && this.animTimer % 4 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 60,
            y: this.y - Math.random() * 60,
            vx: (Math.random() - 0.5) * 2,
            vy: -3 - Math.random() * 3,
            color: Math.random() > 0.3 ? '#38bdf8' : '#e0f2fe',
            life: 18,
            maxLife: 18,
            size: 3.5,
            type: 'spark'
          });
        }
      } else if (this.charId === 'andrey') {
        // Andrey 5-stage Terminator Transformation Sequence
        if (this.stateTimer === 24) {
          // Cybernetic Ocular Unit online
          if (window.particleSystem) {
            window.particleSystem.createHitspark(this.x + 12 * this.facing, this.y - this.height * 0.85, false, '#ef4444');
          }
          if (window.soundEngine) window.soundEngine.playHitLight();
        } else if (this.stateTimer === 50) {
          // Cyber arm & metal core revealed
          if (window.particleSystem) {
            window.particleSystem.createHitspark(this.x, this.y - this.height * 0.55, true, '#10b981');
          }
          if (window.soundEngine) window.soundEngine.playSpecial();
        } else if (this.stateTimer === 80) {
          // Electrical discharge from endoskeleton
          if (window.particleSystem) {
            window.particleSystem.shake(8);
            for (let i = 0; i < 14; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 50,
                y: this.y - Math.random() * 80,
                vx: (Math.random() - 0.5) * 4,
                vy: -2 - Math.random() * 4,
                color: Math.random() > 0.4 ? '#38bdf8' : '#fbbf24',
                life: 20,
                maxLife: 20,
                size: 3.5,
                type: 'spark'
              });
            }
          }
          if (window.soundEngine) window.soundEngine.playHitHeavy();
        } else if (this.stateTimer === 112) {
          // Full Terminator God transformation
          if (window.particleSystem) {
            window.particleSystem.shake(16);
            window.particleSystem.addText(this.x, this.y - this.height - 30, "★ SISTEMA IA: ANIKILAÇÃO TOTAL! ★", "#10b981", 24);
            for (let i = 0; i < 28; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 70,
                y: this.y - Math.random() * 120,
                vx: (Math.random() - 0.5) * 6,
                vy: -3 - Math.random() * 6,
                color: Math.random() > 0.5 ? '#10b981' : '#f97316',
                life: 25,
                maxLife: 25,
                size: 4.5,
                type: 'spark'
              });
            }
          }
          if (window.soundEngine) window.soundEngine.playSuperActivate();
        }

        // Sparks & heat while in cyborg form (poses 4 and 5)
        if (this.stateTimer > 80 && this.animTimer % 4 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 55,
            y: this.y - Math.random() * 70,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 3,
            color: Math.random() > 0.5 ? '#f97316' : '#38bdf8',
            life: 16,
            maxLife: 16,
            size: 3,
            type: 'spark'
          });
        }
      } else if (this.charId === 'alligator') {
        // Brutus Swamp King Victory Roar & Emerald Aura Burst
        if (this.stateTimer === 1) {
          if (window.particleSystem) {
            window.particleSystem.shake(16);
            window.particleSystem.addText(this.x, this.y - this.height - 30, "★ FÚRIA DO PÂNTANO! ★", "#22c55e", 26);
            for (let i = 0; i < 30; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 80,
                y: this.y - Math.random() * 120,
                vx: (Math.random() - 0.5) * 5,
                vy: -3 - Math.random() * 6,
                color: Math.random() > 0.4 ? '#22c55e' : (Math.random() > 0.5 ? '#84cc16' : '#15803d'),
                life: 25,
                maxLife: 25,
                size: 5,
                type: 'spark'
              });
            }
          }
          if (window.soundEngine) window.soundEngine.playSuperActivate();
        }

        // Continuous green fire aura while celebrating victory
        if (this.animTimer % 3 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 70,
            y: this.y - 10 - Math.random() * 100,
            vx: (Math.random() - 0.5) * 3,
            vy: -3 - Math.random() * 4,
            color: Math.random() > 0.3 ? '#22c55e' : '#a3e635',
            life: 20,
            maxLife: 20,
            size: 4,
            type: 'spark'
          });
        }
      } else if (this.charId === 'bear') {
        // Bear Ursus Lumberjack Log Break & Mountain Berserker Roar
        if (this.stateTimer === 58) {
          // Moment the log is struck and begins to crack
          if (window.soundEngine) window.soundEngine.playHitHeavy();
          if (window.particleSystem) {
            window.particleSystem.shake(8);
            for (let i = 0; i < 14; i++) {
              window.particleSystem.particles.push({
                x: this.x + this.facing * 35 + (Math.random() - 0.5) * 40,
                y: this.y - this.height * 0.45 + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 5,
                vy: -2 - Math.random() * 4,
                color: Math.random() > 0.5 ? '#78350f' : '#38bdf8',
                life: 20,
                maxLife: 20,
                size: 3.5,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 90) {
          // Log snaps completely in two! Explosive splinter burst!
          if (window.soundEngine) window.soundEngine.playSpecial();
          if (window.particleSystem) {
            window.particleSystem.shake(14);
            for (let i = 0; i < 24; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 70,
                y: this.y - this.height * 0.45 + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 7,
                vy: -3 - Math.random() * 5,
                color: Math.random() > 0.4 ? '#92400e' : (Math.random() > 0.5 ? '#b45309' : '#38bdf8'),
                life: 25,
                maxLife: 25,
                size: 4.5,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 125) {
          // Double bicep roar of triumph with frost aura!
          if (window.soundEngine) window.soundEngine.playSuperActivate();
          if (window.particleSystem) {
            window.particleSystem.shake(16);
            window.particleSystem.addText(this.x, this.y - this.height - 30, "★ FORÇA DA MONTANHA! ★", "#38bdf8", 26);
            for (let i = 0; i < 30; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 75,
                y: this.y - Math.random() * 110,
                vx: (Math.random() - 0.5) * 5,
                vy: -3 - Math.random() * 6,
                color: Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#ffffff' : '#0284c7'),
                life: 25,
                maxLife: 25,
                size: 4.5,
                type: 'spark'
              });
            }
          }
        }

        // Frost crystals from headband/eyes while in final victory pose
        if (this.stateTimer > 125 && this.animTimer % 4 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 45,
            y: this.y - this.height * 0.75 - Math.random() * 25,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 3,
            color: Math.random() > 0.4 ? '#38bdf8' : '#e0f2fe',
            life: 18,
            maxLife: 18,
            size: 3.5,
            type: 'spark'
          });
        }
      } else if (this.charId === 'capybara') {
        // Mestre Kai Zen Enlightenment Sequence
        if (this.stateTimer === 65) {
          // Putting on Orange Kimono / Centering Ki
          if (window.soundEngine) window.soundEngine.playHitLight();
        } else if (this.stateTimer === 100) {
          // Gassho Reverence Bow - Pure Chi Focus
          if (window.soundEngine) window.soundEngine.playSpecial();
          if (window.particleSystem) {
            window.particleSystem.shake(6);
            for (let i = 0; i < 16; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 45,
                y: this.y - this.height * 0.55 + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 4,
                vy: -2 - Math.random() * 3,
                color: Math.random() > 0.5 ? '#f59e0b' : '#fbbf24',
                life: 20,
                maxLife: 20,
                size: 3.5,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 135) {
          // Ascension to Lotus Float with Golden Halo Awakening!
          if (window.soundEngine) window.soundEngine.playSuperActivate();
          if (window.particleSystem) {
            window.particleSystem.shake(12);
            window.particleSystem.addText(this.x, this.y - this.height - 40, "★ ILUMINAÇÃO ZEN SUPREMA! ★", "#f59e0b", 26);
            for (let i = 0; i < 30; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 80,
                y: this.y - Math.random() * 110,
                vx: (Math.random() - 0.5) * 5,
                vy: -3 - Math.random() * 5,
                color: Math.random() > 0.4 ? '#f59e0b' : (Math.random() > 0.5 ? '#fbbf24' : '#fef08a'),
                life: 25,
                maxLife: 25,
                size: 4.5,
                type: 'spark'
              });
            }
          }
        }

        // Golden Chi sparkles levitating upward around floating lotus (pose 5)
        if (this.stateTimer > 135 && this.animTimer % 3 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 65,
            y: this.y - 15 - Math.random() * 85,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -2 - Math.random() * 2.5,
            color: Math.random() > 0.4 ? '#fbbf24' : (Math.random() > 0.5 ? '#fef08a' : '#f59e0b'),
            life: 22,
            maxLife: 22,
            size: 3.5,
            type: 'spark'
          });
        }
      } else if (this.charId === 'nata') {
        // Nata Rockstar Electric Guitar Victory Sequence
        // Guitar sounds are played EXCLUSIVELY during Nata's victory when he wins the round!
        if (this.stateTimer === 1) {
          // Strap on & amp plug-in click
          if (window.soundEngine) window.soundEngine.playNataGuitarVictory('prep');
        } else if (this.stateTimer === 60) {
          // Power chord hit
          if (window.soundEngine) window.soundEngine.playNataGuitarVictory('chord');
        } else if (this.stateTimer === 95) {
          // Strumming power chord riff (D5 -> E5 -> G5)
          if (window.soundEngine) window.soundEngine.playNataGuitarVictory('strum');
        } else if (this.stateTimer === 130) {
          // Epic Rockstar Guitar Solo Lick with Screaming Bends & Vibrato!
          if (window.soundEngine) window.soundEngine.playNataGuitarVictory('solo');
          if (window.particleSystem) {
            window.particleSystem.shake(14);
            window.particleSystem.addText(this.x, this.y - this.height - 40, "★ ROCKSTAR SHREDDING SOLO! ★", "#f43f5e", 26);
            for (let i = 0; i < 30; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 80,
                y: this.y - Math.random() * 110,
                vx: (Math.random() - 0.5) * 6,
                vy: -3 - Math.random() * 5,
                color: Math.random() > 0.4 ? '#f43f5e' : (Math.random() > 0.5 ? '#f59e0b' : '#38bdf8'),
                life: 25,
                maxLife: 25,
                size: 4.5,
                type: 'spark'
              });
            }
          }
        }

        // Floating musical notes while strumming (poses 4 and 5)
        if (this.stateTimer >= 95 && this.animTimer % 7 === 0 && window.particleSystem) {
          const noteChars = ['♪', '♫', '♬', '♩'];
          const noteColors = ['#f43f5e', '#f59e0b', '#38bdf8', '#a855f7', '#fbbf24'];
          window.particleSystem.particles.push({
            x: this.x + this.facing * 30 + (Math.random() - 0.5) * 50,
            y: this.y - this.height * 0.5 + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -2.2 - Math.random() * 1.5,
            noteText: noteChars[Math.floor(Math.random() * noteChars.length)],
            color: noteColors[Math.floor(Math.random() * noteColors.length)],
            size: 16 + Math.floor(Math.random() * 8),
            life: 30,
            maxLife: 30,
            type: 'music_note'
          });
        }

        // Electric rock stage sparks while shredding in pose 5
        if (this.stateTimer >= 130 && this.animTimer % 3 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 70,
            y: this.y - 20 - Math.random() * 80,
            vx: (Math.random() - 0.5) * 3,
            vy: -2 - Math.random() * 3,
            color: Math.random() > 0.5 ? '#f43f5e' : '#f59e0b',
            life: 18,
            maxLife: 18,
            size: 3.5,
            type: 'spark'
          });
        }
      } else if (this.charId === 'cat') {
        // Cat Kage Paw-Licking Shinobi Grooming Victory Sequence
        if (this.stateTimer === 1) {
          if (window.soundEngine) window.soundEngine.playSpecial();
        } else if (this.stateTimer === 58) {
          // Sitting down and lifting paw
          if (window.soundEngine) window.soundEngine.playHitLight();
        } else if (this.stateTimer === 88) {
          // Licking paw with pink tongue - sparkling clean
          if (window.soundEngine) window.soundEngine.playConfirm();
          if (window.particleSystem) {
            for (let i = 0; i < 12; i++) {
              window.particleSystem.particles.push({
                x: this.x + this.facing * 22 + (Math.random() - 0.5) * 20,
                y: this.y - this.height * 0.45 + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 2.5,
                vy: -1.5 - Math.random() * 2,
                color: Math.random() > 0.5 ? '#10b981' : '#f472b6', // emerald & cute pink
                life: 18,
                maxLife: 18,
                size: 3,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 125) {
          // Ear grooming with satisfied wink!
          if (window.soundEngine) window.soundEngine.playSuperActivate();
          if (window.particleSystem) {
            window.particleSystem.shake(8);
            window.particleSystem.addText(this.x, this.y - this.height - 35, "★ KAGE: PERFEIÇÃO FELINA! ★", "#10b981", 24);
            for (let i = 0; i < 22; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 55,
                y: this.y - Math.random() * 85,
                vx: (Math.random() - 0.5) * 3.5,
                vy: -2 - Math.random() * 3,
                color: Math.random() > 0.4 ? '#10b981' : (Math.random() > 0.5 ? '#34d399' : '#f472b6'),
                life: 22,
                maxLife: 22,
                size: 3.5,
                type: 'spark'
              });
            }
          }
        }

        // Gentle sparkles around face during grooming (pose 4 and 5)
        if (this.stateTimer >= 88 && this.animTimer % 5 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + this.facing * 18 + (Math.random() - 0.5) * 35,
            y: this.y - this.height * 0.45 - Math.random() * 25,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.5 - Math.random() * 1.5,
            color: Math.random() > 0.5 ? '#34d399' : '#fbcfe8',
            life: 16,
            maxLife: 16,
            size: 2.5,
            type: 'spark'
          });
        }
      } else if (this.charId === 'dog') {
        // Unicão Graduation Victory Sequence
        // Sound and fanfare are played EXCLUSIVELY when Unicão wins the round!
        if (this.stateTimer === 1) {
          // Putting on graduation gown over yellow shirt
          if (window.soundEngine) window.soundEngine.playUnicaoCongratulations('robe');
        } else if (this.stateTimer === 28) {
          // Fastening collar button
          if (window.soundEngine) window.soundEngine.playHitLight();
        } else if (this.stateTimer === 58) {
          // Putting on graduation cap
          if (window.soundEngine) window.soundEngine.playUnicaoCongratulations('cap');
          if (window.particleSystem) {
            for (let i = 0; i < 8; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 35,
                y: this.y - this.height * 0.95 - Math.random() * 15,
                vx: (Math.random() - 0.5) * 2,
                vy: -1.5 - Math.random() * 2,
                color: Math.random() > 0.5 ? '#38bdf8' : '#fbbf24',
                life: 18,
                maxLife: 18,
                size: 3,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 88) {
          // Receiving diploma scroll
          if (window.soundEngine) window.soundEngine.playUnicaoCongratulations('scroll');
          if (window.particleSystem) {
            for (let i = 0; i < 10; i++) {
              window.particleSystem.particles.push({
                x: this.x + this.facing * 25 + (Math.random() - 0.5) * 20,
                y: this.y - this.height * 0.5 + (Math.random() - 0.5) * 25,
                vx: (Math.random() - 0.5) * 2,
                vy: -1.5 - Math.random() * 2,
                color: Math.random() > 0.4 ? '#ef4444' : '#fef08a',
                life: 18,
                maxLife: 18,
                size: 3,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 125) {
          // Triumphant Grand Congratulations Fanfare with diploma raised high!
          if (window.soundEngine) window.soundEngine.playUnicaoCongratulations('fanfare');
          if (window.particleSystem) {
            window.particleSystem.shake(12);
            window.particleSystem.addText(this.x, this.y - this.height - 35, "★ UNICÃO GRADUADO: CONGRATULATIONS! ★", "#0284c7", 24);
            // Colorful graduation confetti explosion!
            const confettiColors = ['#f59e0b', '#38bdf8', '#ec4899', '#10b981', '#fbbf24', '#a855f7'];
            for (let i = 0; i < 35; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 80,
                y: this.y - this.height * 0.6 - Math.random() * 80,
                vx: (Math.random() - 0.5) * 6,
                vy: -3 - Math.random() * 5,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                life: 30,
                maxLife: 30,
                size: 4 + Math.random() * 3,
                type: 'spark'
              });
            }
          }
        }

        // Continuous celebratory confetti rain while Unicão raises his diploma (pose 5)
        if (this.stateTimer >= 125 && this.animTimer % 4 === 0 && window.particleSystem) {
          const confettiColors = ['#f59e0b', '#38bdf8', '#ec4899', '#10b981', '#fbbf24', '#a855f7', '#ffffff'];
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 90,
            y: this.y - this.height - 20 - Math.random() * 50,
            vx: (Math.random() - 0.5) * 2.5,
            vy: 1.5 + Math.random() * 2.0, // gently falling celebration confetti
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            life: 35,
            maxLife: 35,
            size: 3.5 + Math.random() * 2.5,
            type: 'spark'
          });
        }
      } else if (this.charId === 'gorilla') {
        // Gorilla Kongo Chest-Beating Victory Sequence
        if (this.stateTimer === 1) {
          if (window.soundEngine) window.soundEngine.playSpecial();
        } else if (this.stateTimer === 24) {
          // Left fist chest thump!
          if (window.soundEngine) window.soundEngine.playHitHeavy();
          if (window.particleSystem) {
            window.particleSystem.shake(6);
            for (let i = 0; i < 10; i++) {
              window.particleSystem.particles.push({
                x: this.x + this.facing * 12 + (Math.random() - 0.5) * 25,
                y: this.y - this.height * 0.65 + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 3,
                vy: -1.5 - Math.random() * 2,
                color: Math.random() > 0.5 ? '#f59e0b' : '#fbbf24',
                life: 15,
                maxLife: 15,
                size: 3.5,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 50) {
          // Right fist chest thump!
          if (window.soundEngine) window.soundEngine.playHitHeavy();
          if (window.particleSystem) {
            window.particleSystem.shake(7);
            for (let i = 0; i < 12; i++) {
              window.particleSystem.particles.push({
                x: this.x - this.facing * 8 + (Math.random() - 0.5) * 25,
                y: this.y - this.height * 0.65 + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 3.5,
                vy: -1.5 - Math.random() * 2,
                color: Math.random() > 0.5 ? '#f59e0b' : '#fbbf24',
                life: 15,
                maxLife: 15,
                size: 3.5,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 76) {
          // Double fist chest pound with roar!
          if (window.soundEngine) window.soundEngine.playHitHeavy();
          if (window.particleSystem) {
            window.particleSystem.shake(10);
            for (let i = 0; i < 18; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 45,
                y: this.y - this.height * 0.65 + (Math.random() - 0.5) * 25,
                vx: (Math.random() - 0.5) * 4.5,
                vy: -2 - Math.random() * 3,
                color: Math.random() > 0.4 ? '#f59e0b' : '#fef08a',
                life: 18,
                maxLife: 18,
                size: 4,
                type: 'spark'
              });
            }
          }
        } else if (this.stateTimer === 112) {
          // Mighty King Kong victory flex & roar!
          if (window.soundEngine) window.soundEngine.playSuperActivate();
          if (window.particleSystem) {
            window.particleSystem.shake(14);
            window.particleSystem.addText(this.x, this.y - this.height - 35, "★ KONGO: O REI PRIMATA! ★", "#eab308", 26);
            for (let i = 0; i < 28; i++) {
              window.particleSystem.particles.push({
                x: this.x + (Math.random() - 0.5) * 75,
                y: this.y - this.height * 0.7 - Math.random() * 50,
                vx: (Math.random() - 0.5) * 5.5,
                vy: -3 - Math.random() * 4,
                color: Math.random() > 0.4 ? '#eab308' : (Math.random() > 0.5 ? '#f59e0b' : '#fef08a'),
                life: 25,
                maxLife: 25,
                size: 4.5,
                type: 'spark'
              });
            }
          }
        }

        // Continuous golden aura sparks during roaring flex (pose 5)
        if (this.stateTimer >= 112 && this.animTimer % 4 === 0 && window.particleSystem) {
          window.particleSystem.particles.push({
            x: this.x + (Math.random() - 0.5) * 65,
            y: this.y - 15 - Math.random() * 75,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 2,
            color: Math.random() > 0.5 ? '#eab308' : '#fbbf24',
            life: 20,
            maxLife: 20,
            size: 3.5,
            type: 'spark'
          });
        }
      }
    }

    // Check Melee Hitbox against Opponent Hurtbox
    const hitbox = this.getHitbox();
    if (hitbox && opponent && !opponent.isDead) {
      const hurtbox = opponent.getHurtbox();
      const isOverlap = (
        hitbox.x < hurtbox.x + hurtbox.width &&
        hitbox.x + hitbox.width > hurtbox.x &&
        hitbox.y < hurtbox.y + hurtbox.height &&
        hitbox.y + hitbox.height > hurtbox.y
      );

      if (isOverlap) {
        this.hasHitThisAttack = true;
        opponent.receiveHit(hitbox.damage, hitbox.isHeavy, this);
      }
    }
  }

  draw(ctx) {
    window.drawFighterCanvas(ctx, this);
  }
}

window.Fighter = Fighter;
