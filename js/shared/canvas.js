export function createDraw(ctx, options = {}) {
  const fontFamily = options.fontFamily || "system-ui, sans-serif";
  const ink = options.ink || "#17212b";
  const strokeDefault = options.strokeDefault || "rgba(23,33,43,.2)";
  const rectStroke = options.rectStroke || "rgba(23,33,43,.15)";

  function line(x1, y1, x2, y2, color, width = 2, dash = []) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function arrow(x1, y1, x2, y2, color, width = 2, dash = []) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = 10;
    line(x1, y1, x2, y2, color, width, dash);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function elbowArrow(points, color, width = 2, dash = []) {
    const end = points[points.length - 1];
    const beforeEnd = points[points.length - 2];
    const angle = Math.atan2(end.y - beforeEnd.y, end.x - beforeEnd.x);
    const headLength = 10;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function circle(x, y, radius, fill, stroke = strokeDefault, width = 1) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function text(copy, x, y, size, color = ink, weight = 700, align = "center") {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(copy, x, y);
    ctx.restore();
  }

  function roundRect(x, y, width, height, radius, fill, stroke = rectStroke) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function labelBadge(lines, x, y, badgeOptions = {}) {
    const size = badgeOptions.size || 12;
    const color = badgeOptions.color || ink;
    const fill = badgeOptions.fill || "rgba(255,255,255,.86)";
    const stroke = badgeOptions.stroke || "rgba(23,33,43,.12)";
    const align = badgeOptions.align || "center";
    const weight = badgeOptions.weight || 800;
    const paddingX = 8;
    const paddingY = 6;
    const lineHeight = size + 4;

    ctx.save();
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    const width = Math.max(...lines.map((lineItem) => ctx.measureText(lineItem).width)) + paddingX * 2;
    const height = lines.length * lineHeight + paddingY * 2 - 4;
    const left = align === "left" ? x : align === "right" ? x - width : x - width / 2;
    roundRect(left, y - height / 2, width, height, 6, fill, stroke);
    ctx.restore();

    lines.forEach((lineItem, index) => {
      const tx = align === "left" ? x + paddingX : align === "right" ? x - paddingX : x;
      text(lineItem, tx, y - (lines.length - 1) * lineHeight / 2 + index * lineHeight, size, color, weight, align);
    });
  }

  return {
    ctx,
    line,
    arrow,
    elbowArrow,
    circle,
    text,
    roundRect,
    labelBadge
  };
}
