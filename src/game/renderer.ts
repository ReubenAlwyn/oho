function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  _frame: number
) {
  const T = TILE_SIZE;
  const x = player.pixelPos.x + T / 2;
  const y = player.pixelPos.y + T / 2;

  // Invincibility flash
  if (player.invincible && Math.floor(_frame / 4) % 2 === 0) return;

  const glowColor = player.type === "boy" ? COLORS.player : COLORS.neonPurple;
  const radius = T * 0.45;

  // Glow
  drawGlow(ctx, x, y, T * 0.8, glowColor, 0.5);

  // Character photo or fallback
  const img = player.type === "boy" ? boyImg : girlImg;
  const fallbackColor = player.type === "boy" ? "#00ccff" : "#c850ff";

  if (imgReady(img)) {
    drawCircularImage(ctx, img, x, y, radius);
  } else {
    // Fallback: solid colored circle
    ctx.fillStyle = fallbackColor;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(x - radius * 0.15, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    const eyeR = radius * 0.08;
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.05, eyeR, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.2, y - radius * 0.05, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.05, eyeR * 0.5, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.2, y - radius * 0.05, eyeR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Direction arrow
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.85;
  const arrowSize = T * 0.1;
  const armLen = T * 0.44;
  if (player.direction === "up") {
    ctx.beginPath();
    ctx.moveTo(x, y - armLen - T * 0.12);
    ctx.lineTo(x - arrowSize, y - armLen);
    ctx.lineTo(x + arrowSize, y - armLen);
    ctx.fill();
  } else if (player.direction === "down") {
    ctx.beginPath();
    ctx.moveTo(x, y + armLen + T * 0.12);
    ctx.lineTo(x - arrowSize, y + armLen);
    ctx.lineTo(x + arrowSize, y + armLen);
    ctx.fill();
  } else if (player.direction === "left") {
    ctx.beginPath();
    ctx.moveTo(x - armLen - T * 0.12, y);
    ctx.lineTo(x - armLen, y - arrowSize);
    ctx.lineTo(x - armLen, y + arrowSize);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + armLen + T * 0.12, y);
    ctx.lineTo(x + armLen, y - arrowSize);
    ctx.lineTo(x + armLen, y + arrowSize);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw CHUB — the fat guy enemy.