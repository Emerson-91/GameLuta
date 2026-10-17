// Fighter Combat Engine for Animal Kombat

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
      const w = 90;
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
      const w = this.charId === 'dog' ? 260 : 100;
      const h = 75;
      box = {
        x: dir === 1 ? this.x + 10 : this.x - (w + 10),
        y: this.y - this.height * 0.80,
        width: w,
        height: h,
        damage: 120 * this.power,
        isHeavy: true,
        knockback: 14 * dir,
        hitStun: 28
      };
    } else if (this.state === 'SUPER') {
      const w = 140;
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
      window.particleSystem.addText(this.x, this.y - this.height - 25, "DRONES IA ATIVADOS!", "#f97316", 24);
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

    // If Dragon Boss, launch meteor shower
    if (this.charId === 'dragon') {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          window.particleSystem.spawnProjectile(this, 'meteor');
        }, i * 220);
      }
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
      } else if (this.stateTimer <= 18) {
        this.attackPhase = 'recovery';
      } else {
        this.state = this.isCrouchAttacking ? 'CROUCH' : (this.isGrounded ? 'IDLE' : 'JUMP');
        this.isCrouchAttacking = false;
        this.attackPhase = '';
      }
    } else if (this.state === 'ATTACK_HEAVY') {
      if (this.stateTimer <= 7) {
        this.attackPhase = 'startup';
      } else if (this.stateTimer <= 16) {
        this.attackPhase = 'active';
      } else if (this.stateTimer <= 27) {
        this.attackPhase = 'recovery';
      } else {
        this.state = this.isCrouchAttacking ? 'CROUCH' : (this.isGrounded ? 'IDLE' : 'JUMP');
        this.isCrouchAttacking = false;
        this.attackPhase = '';
      }
    } else if (this.state === 'SPECIAL') {
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
