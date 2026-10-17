// Smart AI Controller for CPU Opponents in Animal Kombat

class FightingAI {
  constructor(fighter, difficulty = 'medium') {
    this.fighter = fighter;
    this.difficulty = difficulty; // 'easy', 'medium', 'hard', 'boss'
    this.decisionTimer = 0;
    this.reactionDelay = 0;
    this.currentAction = 'idle';
    this.crouchTimer = 0;        // frames to keep ducking
    this.pendingAirAttack = false; // attack when descending on the opponent
  }

  // Duck for a number of frames (dodges projectiles, sets up low sweeps)
  startCrouch(frames) {
    this.fighter.crouch();
    this.crouchTimer = frames;
  }

  // Jump towards the opponent and strike on the way down
  jumpIn(opponent) {
    const dir = this.fighter.x < opponent.x ? 1 : -1;
    this.fighter.jump(dir);
    this.pendingAirAttack = true;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
  }

  update(opponent, stage) {
    if (!this.fighter.canAct() || this.fighter.isDead || !opponent || opponent.isDead) return;

    // In training / dummy mode: stay completely still, face opponent, no attacks
    if (this.difficulty === 'dummy') {
      this.fighter.vx = 0;
      if (this.fighter.state === 'WALK') this.fighter.state = 'IDLE';
      return;
    }

    this.decisionTimer++;

    const f = this.fighter;
    const distNow = Math.abs(f.x - opponent.x);

    // --- Airborne behaviour: aerial strike when close ---
    if (!f.isGrounded) {
      if (this.pendingAirAttack && distNow < 140 && f.vy > -5) {
        if (Math.random() < 0.5) f.attackHeavy();
        else f.attackLight();
        this.pendingAirAttack = false;
      }
      return;
    }
    this.pendingAirAttack = false;

    // --- Holding a crouch ---
    if (this.crouchTimer > 0) {
      this.crouchTimer--;
      // low sweep when the opponent walks in close
      if (distNow < 105 && Math.random() < 0.12) {
        f.attackHeavy();
        this.crouchTimer = 0;
        return;
      }
      f.crouch();
      if (this.crouchTimer <= 0) f.standUp();
      return;
    }
    // Leftover crouch (e.g. after a low sweep): stand up so movement works again
    if (f.state === 'CROUCH') f.standUp();

    // Decision rates based on difficulty
    let decisionInterval = 18;
    let blockProbability = 0.35;
    let aggressiveBias = 0.6;

    if (this.difficulty === 'easy') {
      decisionInterval = 25;
      blockProbability = 0.2;
      aggressiveBias = 0.45;
    } else if (this.difficulty === 'hard') {
      decisionInterval = 10;
      blockProbability = 0.65;
      aggressiveBias = 0.8;
    } else if (this.difficulty === 'nightmare') {
      decisionInterval = 6;
      blockProbability = 0.85;
      aggressiveBias = 0.95;
    } else if (this.difficulty === 'boss' || this.fighter.charId === 'dragon') {
      decisionInterval = 8;
      blockProbability = 0.75;
      aggressiveBias = 0.85;
    }

    const dist = Math.abs(this.fighter.x - opponent.x);
    const isPlayerAttacking = ['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'SUPER'].includes(opponent.state);
    const isPlayerJumping = opponent.y < 460;

    // Reactive Defense: Check incoming player attack or projectile
    if (isPlayerAttacking && dist < 180) {
      if (Math.random() < blockProbability) {
        // Walk back to block
        if (this.fighter.facing === 1) {
          this.fighter.moveLeft();
        } else {
          this.fighter.moveRight();
        }
        return;
      }
    }

    // Check incoming projectiles
    const incomingProj = window.particleSystem.projectiles.find(p => p.owner === opponent);
    if (incomingProj) {
      const projDist = Math.abs(incomingProj.x - this.fighter.x);
      if (projDist < 250 && Math.random() < blockProbability + 0.15) {
        const r = Math.random();
        if (r < 0.35) {
          this.fighter.jump(); // Jump over projectile
        } else if (r < 0.7) {
          this.startCrouch(28); // Duck under projectile
        } else {
          // Block projectile
          if (this.fighter.facing === 1) this.fighter.moveLeft();
          else this.fighter.moveRight();
        }
        return;
      }
    }

    // Anti-Air: If opponent is jumping towards CPU, perform heavy attack or special
    if (isPlayerJumping && dist < 140 && Math.random() < 0.6) {
      if (Math.random() < 0.5) {
        this.fighter.attackHeavy();
      } else {
        this.fighter.specialMove();
      }
      return;
    }

    // Boss Vulcanus Special Patterns & Flight Tactics
    if (this.fighter.charId === 'dragon') {
      // If grounded, frequently take flight to dominate the skies
      if (!this.fighter.isFlying && Math.random() < 0.25) {
        this.fighter.jump();
      }

      // If flying, maneuver and rain fire
      if (this.fighter.isFlying) {
        // Glide towards optimal air-to-ground strike position
        if (this.fighter.x < opponent.x - 110) {
          this.fighter.moveRight();
        } else if (this.fighter.x > opponent.x + 110) {
          this.fighter.moveLeft();
        }

        // Aerial flame breath
        if (Math.random() < 0.08) {
          this.fighter.specialMove();
          return;
        }

        // Swooping diving kick / claw
        if (dist < 180 && Math.random() < 0.12) {
          if (Math.random() < 0.5) this.fighter.attackHeavy();
          else this.fighter.attackLight();
          return;
        }
      }

      // If super ready, unleash catastrophic meteor cataclysm!
      if (this.fighter.meter >= 100) {
        this.fighter.superMove();
        return;
      }

      // If at medium distance, blast flamethrower
      if (dist >= 140 && dist <= 420 && Math.random() < 0.15) {
        this.fighter.specialMove();
        return;
      }
    }

    // Standard fighter Super Move
    if (this.fighter.meter >= 100 && dist < 220 && Math.random() < 0.3) {
      this.fighter.superMove();
      return;
    }

    // Main Tactical Behavior Tree
    if (this.decisionTimer >= decisionInterval) {
      this.decisionTimer = 0;

      // Close Range Combat (< 110px)
      if (dist < 110) {
        const roll = Math.random();
        if (roll < 0.28) {
          this.fighter.attackLight(); // fast poke
        } else if (roll < 0.55) {
          this.fighter.attackHeavy(); // heavy hit
        } else if (roll < 0.70) {
          // low sweep from a crouch
          this.fighter.crouch();
          this.fighter.attackHeavy();
        } else if (roll < 0.80) {
          this.fighter.specialMove(); // special cancel
        } else if (roll < 0.90) {
          this.startCrouch(20); // duck under high attacks
        } else {
          this.fighter.jump(this.fighter.facing === 1 ? -1 : 1); // jump back
        }
      }
      // Mid Range Spacing (110px - 280px)
      else if (dist < 280) {
        const roll = Math.random();
        if (roll < 0.45) {
          // Approach opponent
          if (this.fighter.x < opponent.x) {
            this.fighter.moveRight();
          } else {
            this.fighter.moveLeft();
          }
        } else if (roll < 0.70) {
          this.fighter.specialMove(); // shoot projectile or dash
        } else if (roll < 0.88) {
          this.jumpIn(opponent); // jump-in aerial attack
        } else {
          this.fighter.standUp();
        }
      }
      // Far Range (> 280px)
      else {
        const roll = Math.random();
        if (roll < 0.55) {
          // Run towards opponent
          if (this.fighter.x < opponent.x) {
            this.fighter.moveRight();
          } else {
            this.fighter.moveLeft();
          }
        } else if (roll < 0.85) {
          // Projectile zoning
          this.fighter.specialMove();
        } else {
          this.jumpIn(opponent);
        }
      }
    }
  }
}

window.FightingAI = FightingAI;
