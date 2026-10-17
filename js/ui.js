// UI and HUD Manager for Animal Kombat

class UIManager {
  constructor() {
    this.bannerText = '';
    this.bannerSubtext = '';
    this.bannerTimer = 0;
    this.bannerColor = '#ef4444';
    this.bannerScale = 1.0;

    // Delayed health drain bars for visual polish
    this.p1LagHp = 1000;
    this.p2LagHp = 1000;
  }

  showBanner(text, subtext = '', duration = 120, color = '#f59e0b') {
    this.bannerText = text;
    this.bannerSubtext = subtext;
    this.bannerTimer = duration;
    this.bannerColor = color;
    this.bannerScale = 0.5;
  }

  updateHUD(p1, p2, roundTime) {
    // P1 Health & Meter
    const p1HpPercent = (p1.hp / p1.maxHp) * 100;
    const p1MeterPercent = (p1.meter / p1.maxMeter) * 100;
    const p1Bar = document.getElementById('p1-hp-fill');
    const p1Lag = document.getElementById('p1-hp-lag');
    const p1Meter = document.getElementById('p1-meter-fill');
    const p1MeterText = document.getElementById('p1-meter-text');

    if (p1Bar) p1Bar.style.width = `${Math.max(0, p1HpPercent)}%`;
    if (p1Lag) {
      if (this.p1LagHp > p1.hp) {
        this.p1LagHp -= (this.p1LagHp - p1.hp) * 0.08;
      } else {
        this.p1LagHp = p1.hp;
      }
      p1Lag.style.width = `${Math.max(0, (this.p1LagHp / p1.maxHp) * 100)}%`;
    }
    if (p1Meter) {
      p1Meter.style.width = `${p1MeterPercent}%`;
      if (p1.meter >= 100) {
        p1Meter.parentElement.classList.remove('meter-special');
        p1Meter.parentElement.classList.add('meter-max');
        p1MeterText.innerText = '★ SUPER PRONTO (100%) ★';
      } else if (p1.meter >= 50) {
        p1Meter.parentElement.classList.remove('meter-max');
        p1Meter.parentElement.classList.add('meter-special');
        p1MeterText.innerText = `⚡ ESPECIAL PRONTO (${Math.floor(p1.meter)}%)`;
      } else if (p1.meterRechargeDelay > 0) {
        p1Meter.parentElement.classList.remove('meter-max', 'meter-special');
        p1MeterText.innerText = 'ESPECIAL: AGUARDE 1s...';
      } else {
        p1Meter.parentElement.classList.remove('meter-max', 'meter-special');
        p1MeterText.innerText = `ESPECIAL: ${Math.floor(p1.meter)}/50%`;
      }
    }

    // P2 Health & Meter
    const p2HpPercent = (p2.hp / p2.maxHp) * 100;
    const p2MeterPercent = (p2.meter / p2.maxMeter) * 100;
    const p2Bar = document.getElementById('p2-hp-fill');
    const p2Lag = document.getElementById('p2-hp-lag');
    const p2Meter = document.getElementById('p2-meter-fill');
    const p2MeterText = document.getElementById('p2-meter-text');

    if (p2Bar) p2Bar.style.width = `${Math.max(0, p2HpPercent)}%`;
    if (p2Lag) {
      if (this.p2LagHp > p2.hp) {
        this.p2LagHp -= (this.p2LagHp - p2.hp) * 0.08;
      } else {
        this.p2LagHp = p2.hp;
      }
      p2Lag.style.width = `${Math.max(0, (this.p2LagHp / p2.maxHp) * 100)}%`;
    }
    if (p2Meter) {
      p2Meter.style.width = `${p2MeterPercent}%`;
      if (p2.meter >= 100) {
        p2Meter.parentElement.classList.remove('meter-special');
        p2Meter.parentElement.classList.add('meter-max');
        p2MeterText.innerText = '★ SUPER PRONTO (100%) ★';
      } else if (p2.meter >= 50) {
        p2Meter.parentElement.classList.remove('meter-max');
        p2Meter.parentElement.classList.add('meter-special');
        p2MeterText.innerText = `⚡ ESPECIAL PRONTO (${Math.floor(p2.meter)}%)`;
      } else if (p2.meterRechargeDelay > 0) {
        p2Meter.parentElement.classList.remove('meter-max', 'meter-special');
        p2MeterText.innerText = 'ESPECIAL: AGUARDE 1s...';
      } else {
        p2Meter.parentElement.classList.remove('meter-max', 'meter-special');
        p2MeterText.innerText = `ESPECIAL: ${Math.floor(p2.meter)}/50%`;
      }
    }

    // Timer
    const timerElem = document.getElementById('match-timer');
    if (timerElem) {
      timerElem.innerText = Math.max(0, Math.ceil(roundTime));
      if (roundTime <= 10) {
        timerElem.classList.add('timer-low');
      } else {
        timerElem.classList.remove('timer-low');
      }
    }

    // Rounds Won Emblems
    this.updateRoundEmblems('p1-rounds', p1.roundsWon);
    this.updateRoundEmblems('p2-rounds', p2.roundsWon);
  }

  updateRoundEmblems(containerId, count) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    const dots = cont.querySelectorAll('.round-dot');
    dots.forEach((dot, idx) => {
      if (idx < count) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }

  resetHUD(p1, p2) {
    this.p1LagHp = p1.maxHp;
    this.p2LagHp = p2.maxHp;
    const p1Name = document.getElementById('p1-name');
    const p2Name = document.getElementById('p2-name');
    const p1Port = document.getElementById('p1-hud-portrait');
    const p2Port = document.getElementById('p2-hud-portrait');

    if (p1Name) p1Name.innerText = p1.charData.name.toUpperCase();
    if (p2Name) p2Name.innerText = p2.charData.name.toUpperCase();
    if (p1Port) p1Port.src = p1.charData.portrait;
    if (p2Port) p2Port.src = p2.charData.portrait;
  }

  drawAnnouncerBanner(ctx, canvasWidth, canvasHeight) {
    if (this.bannerTimer <= 0) return;

    this.bannerTimer--;

    // Banner zoom in animation
    if (this.bannerScale < 1.0) {
      this.bannerScale += (1.0 - this.bannerScale) * 0.25;
    }

    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2 - 40);
    ctx.scale(this.bannerScale, this.bannerScale);

    // Dark backdrop banner bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(-canvasWidth / 2, -55, canvasWidth, 110);

    // Accent lines
    ctx.strokeStyle = this.bannerColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-canvasWidth / 2, -55);
    ctx.lineTo(canvasWidth / 2, -55);
    ctx.moveTo(-canvasWidth / 2, 55);
    ctx.lineTo(canvasWidth / 2, 55);
    ctx.stroke();

    // Text styling
    ctx.font = "900 64px 'Impact', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = this.bannerColor;
    ctx.shadowBlur = 24;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.strokeText(this.bannerText, 0, -5);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.bannerText, 0, -5);

    // Subtext if present
    if (this.bannerSubtext) {
      ctx.font = "700 22px 'Arial Black', sans-serif";
      ctx.fillStyle = this.bannerColor;
      ctx.fillText(this.bannerSubtext, 0, 35);
    }

    ctx.restore();
  }
}

window.uiManager = new UIManager();
