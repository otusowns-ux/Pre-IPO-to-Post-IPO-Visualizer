import { clamp, ease } from "../shared/math.js";
import {
  roundModel,
  ownershipModel,
  marketDays,
  currentCompanyX
} from "./model.js";

export function createGenericDraw(draw) {
  const { ctx, line, arrow, circle, text, roundRect, labelBadge } = draw;

  function drawIpoWall(x, top, bottom) {
    ctx.save();
    ctx.strokeStyle = "#b36a1e";
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 10]);
    ctx.beginPath();
    for (let y = top; y <= bottom; y += 22) {
      const offset = Math.sin(y * 0.11) * 8;
      ctx.lineTo(x + offset, y);
    }
    ctx.stroke();
    ctx.restore();
    text("IPO", x, top - 22, 15, "#8f5418", 800);
  }

  function drawOwnershipStack(state, progress, w, h, wallX) {
    const ownership = ownershipModel(state, progress);
    const x = Math.max(18, w * 0.055);
    const y = h - 158;
    const width = Math.max(210, wallX - x - 40);
    const height = 18;
    let cursor = x;

    roundRect(x - 10, y - 30, width + 20, 68, 8, "rgba(255,255,255,.68)", "rgba(23,33,43,.12)");
    text("ownership stack", x, y - 16, 12, "#5d6975", 800, "left");

    const foundersWidth = width * ownership.founders;
    roundRect(cursor, y, foundersWidth, height, 4, "rgba(37, 99, 169, .76)", "rgba(255,255,255,.9)");
    cursor += foundersWidth;

    const optionWidth = width * ownership.optionPool;
    const activeInvestors = ownership.investors.filter((slice) => slice.active);
    const rawInvestorTotal = activeInvestors.reduce((sum, slice) => sum + slice.share, 0);
    const investorWidth = Math.max(0, width - foundersWidth - optionWidth);

    activeInvestors.forEach((slice, index) => {
      const sliceWidth = rawInvestorTotal > 0 ? investorWidth * (slice.share / rawInvestorTotal) : 0;
      if (sliceWidth < 2) return;
      roundRect(cursor, y, sliceWidth, height, 2, `${slice.color}cc`, "rgba(255,255,255,.65)");
      cursor += sliceWidth;
      if (sliceWidth > 22) text(String(index + 1), cursor - sliceWidth / 2, y + height / 2, 9, "white", 850);
    });

    if (optionWidth > 3) {
      roundRect(x + width - optionWidth, y, optionWidth, height, 2, "rgba(179, 106, 30, .72)", "rgba(255,255,255,.65)");
    }

    text(`founders ${Math.round(ownership.founders * 100)}%`, x, y + 34, 12, "#2563a9", 850, "left");
    text(`option pool ${Math.round(ownership.optionPool * 100)}%`, x + width, y + 34, 12, "#8f5418", 850, "right");
  }

  function drawLockupTimer(state, progress, w, h, wallX) {
    const start = clamp((progress - 0.58) / 0.42, 0, 1);
    if (start <= 0) return;

    const days = marketDays(state, progress);
    const timerX = wallX + 44;
    const timerY = h - 158;
    const timerW = Math.max(160, w - timerX - 32);
    const timerH = 12;
    const fill = clamp(days / state.lockup, 0, 1);
    const unlocked = days >= state.lockup;

    roundRect(timerX - 10, timerY - 26, timerW + 20, 66, 8, "rgba(255,255,255,.65)", "rgba(23,33,43,.12)");
    text(`lockup ${Math.min(days, state.lockup)} / ${state.lockup} days`, timerX, timerY - 13, 12, unlocked ? "#b43d3d" : "#5d6975", 850, "left");
    roundRect(timerX, timerY, timerW, timerH, 6, "rgba(23,33,43,.08)", "rgba(23,33,43,.08)");
    roundRect(timerX, timerY, timerW * fill, timerH, 6, unlocked ? "rgba(180,61,61,.78)" : "rgba(179,106,30,.72)", "rgba(255,255,255,.4)");
    text(unlocked ? "insider shares unlock" : "most insiders still locked", timerX, timerY + 31, 12, unlocked ? "#b43d3d" : "#5d6975", 800, "left");
  }

  function investorPosition(index, count, w, h, wallX) {
    const t = count === 1 ? 0.5 : index / (count - 1);
    const x = w * 0.09 + t * Math.max(1, wallX - w * 0.23);
    const y = h * (index % 2 === 0 ? 0.26 : 0.64) + Math.sin(index * 1.3) * 12;
    return { x, y };
  }

  function drawCompany(x, y, state, rounds, progress, publicMode = false) {
    const fundedProgress = clamp((progress - 0.06) / 0.4, 0, 1);
    const fundedCash = Math.round(state.capital * fundedProgress);
    const latestRound = rounds[Math.min(rounds.length - 1, Math.floor(rounds.length * fundedProgress))] || rounds[0];
    const valuation = latestRound ? Math.round(latestRound.valuation * fundedProgress) : 0;

    circle(x, y, 31, publicMode ? "rgba(179, 106, 30, 0.18)" : "rgba(37, 99, 169, 0.16)", publicMode ? "rgba(179, 106, 30, 0.92)" : "rgba(37, 99, 169, 0.58)", 3);
    circle(x, y, 17, publicMode ? "#b36a1e" : "#2563a9", "white", 3);
    if (!publicMode) text("Company", x, y + 52, 13, "#17212b", 850);
    if (!publicMode) {
      labelBadge([`cash $${fundedCash}M`, `value $${valuation}M`], x, y - 52, {
        color: "#17212b",
        size: 12,
        fill: "rgba(255,255,255,.8)"
      });
    }
  }

  function drawFunding(state, progress, w, h, wallX) {
    const centerY = h * 0.48;
    const companyX = currentCompanyX(w, wallX, progress);
    const rounds = roundModel(state);
    const roundsVisible = Math.ceil(state.rounds * clamp((progress - 0.04) / 0.42, 0, 1));

    for (let i = 0; i < state.rounds; i += 1) {
      const round = rounds[i];
      const { x, y } = investorPosition(i, state.rounds, w, h, wallX);
      const active = i < roundsVisible;
      const alpha = active ? 1 : 0.2;
      roundRect(x - 42, y - 24, 84, 48, 8, `rgba(46, 125, 88, ${0.05 + alpha * 0.08})`, `rgba(46, 125, 88, ${0.18 + alpha * 0.42})`);
      circle(x - 30, y, 7, round.color, "white", 1.5);
      text(round.name, x + 5, y - 7, 11, `rgba(46, 81, 68, ${0.45 + alpha * 0.55})`, 850);
      text(`$${round.amount}M`, x + 5, y + 10, 12, `rgba(23, 33, 43, ${0.48 + alpha * 0.52})`, 850);

      const fly = clamp((progress - 0.1 - i * 0.045) / 0.22, 0, 1);
      const px = x + (companyX - x) * ease(fly);
      const py = y + (centerY - y) * ease(fly);
      if (fly > 0 && fly < 1) {
        arrow(x + 24, y, px - 22, py, `rgba(46, 125, 88, ${0.32 + alpha * 0.45})`, 2);
        circle(px, py, 5, "rgba(46, 125, 88, 0.9)", "white", 2);
      }
    }

    drawCompany(companyX, centerY, state, rounds, progress, progress > 0.58);
    drawOwnershipStack(state, progress, w, h, wallX);
  }

  function drawMarket(state, progress, w, h, wallX) {
    const start = clamp((progress - 0.54) / 0.46, 0, 1);
    const days = marketDays(state, progress);
    const lockupFactor = clamp((days - state.lockup) / 60, 0, 1);
    const sellStart = clamp((progress - 0.63) / 0.26, 0, 1) * lockupFactor;
    const demandStart = clamp((progress - 0.7) / 0.24, 0, 1);
    const centerY = h * 0.48;
    const companyX = currentCompanyX(w, wallX, progress);
    const exchangeX = Math.min(w - 110, wallX + Math.max(126, w * 0.21));
    const rounds = roundModel(state);

    if (start > 0) {
      roundRect(exchangeX - 54, centerY - 34, 108, 68, 8, "rgba(255,255,255,.72)", "rgba(37,99,169,.25)");
      text("Public", exchangeX, centerY - 12, 13, "#2563a9", 850);
      text("market", exchangeX, centerY + 8, 13, "#2563a9", 850);
      arrow(companyX + 33, centerY - 28, exchangeX - 58, centerY - 28, "rgba(46, 125, 88, 0.78)", 2.5, [6, 5]);
      arrow(exchangeX - 58, centerY + 30, companyX + 33, centerY + 30, "rgba(179, 106, 30, 0.72)", 2, [4, 5]);
      labelBadge([`primary $${Math.round(state.capital * 0.42 * start)}M`, "to company"], exchangeX - 88, centerY - 62, {
        color: "#2e7d58",
        fill: "rgba(255,255,255,.88)"
      });
      labelBadge([`secondary $${Math.round(state.capital * 0.18 * start)}M`, "to holders"], wallX + 10, centerY + 72, {
        color: "#8f5418",
        fill: "rgba(255,255,255,.9)",
        align: "left"
      });
    }

    for (let i = 0; i < state.rounds; i += 1) {
      const { x, y } = investorPosition(i, state.rounds, w, h, wallX);
      const cashOut = Math.round(rounds[i].amount * state.selloff / 100 * 1.6);
      const exit = clamp(sellStart - i * 0.04, 0, 1);
      if (exit > 0) {
        const markerX = x + 42;
        const markerY = y - 4;
        arrow(markerX + 18, markerY, markerX + 3, markerY, "rgba(180, 61, 61, 0.72)", 2);
        circle(markerX + 3, markerY, 4.5, "rgba(180, 61, 61, 0.92)", "white", 1.5);
        text(`+$${cashOut}M`, x, y + 38, 11, "rgba(180, 61, 61, 0.95)", 850);
      }
    }

    const buyers = Math.round(4 + state.demand / 13);
    for (let i = 0; i < buyers; i += 1) {
      const y = h * 0.22 + i * ((h * 0.52) / Math.max(buyers - 1, 1));
      const x = Math.min(w - 42, exchangeX + 92 + (i % 3) * 18);
      const buy = clamp(demandStart - i * 0.025, 0, 1);
      if (demandStart > 0) {
        circle(x, y, 6 + state.demand / 80, `rgba(37, 99, 169, ${0.25 + demandStart * 0.55})`, "white", 1.5);
        if (buy > 0) {
          const px = x + (exchangeX + 56 - x) * ease(buy);
          const py = y + (centerY - y) * ease(buy);
          arrow(x - 10, y, px, py, "rgba(37, 99, 169, 0.55)", 2);
        }
      }
    }

    if (start > 0) {
      const chartX = wallX + 82;
      const chartY = h * 0.68;
      const chartW = w - chartX - 36;
      const chartH = 96;
      line(chartX, chartY, chartX + chartW, chartY, "rgba(23,33,43,.26)", 1);
      line(chartX, chartY - chartH, chartX, chartY, "rgba(23,33,43,.16)", 1);
      text("2x", chartX - 10, chartY - chartH + 6, 10, "#5d6975", 750, "right");
      text("1x", chartX - 10, chartY - 45, 10, "#5d6975", 750, "right");
      text(".5x", chartX - 10, chartY - 8, 10, "#5d6975", 750, "right");

      const path = (target, color, width, dash = []) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        const points = 42;
        for (let i = 0; i < points; i += 1) {
          const t = i / (points - 1);
          const x = chartX + t * chartW * start;
          const curve = 1 - Math.exp(-t * 2.4);
          const noise = Math.sin(t * Math.PI * 3 + progress * 7) * (1 - t) * 8;
          const y = chartY - 44 - target * curve - noise;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      };

      path(48, "rgba(46,125,88,.22)", 2, [5, 6]);
      path(0, "rgba(93,105,117,.2)", 2, [5, 6]);
      path(-34, "rgba(180,61,61,.18)", 2, [5, 6]);

      ctx.save();
      ctx.strokeStyle = "#2563a9";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const points = 42;
      const floatVolatility = clamp((25 - state.float) / 20, 0, 1.2);
      const pressure = state.selloff * lockupFactor;
      const target = (state.demand - pressure) * 0.46 + floatVolatility * 14;
      for (let i = 0; i < points; i += 1) {
        const t = i / (points - 1);
        const wave = Math.sin(t * Math.PI * 3 + progress * 7) * (1 - t) * (14 + floatVolatility * 10);
        const trend = target * t;
        const x = chartX + t * chartW * start;
        const y = chartY - 44 - trend - wave;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      text(`${state.float}% float`, chartX + chartW, chartY - chartH + 18, 12, "#2563a9", 850, "right");
    }

    drawLockupTimer(state, progress, w, h, wallX);
  }

  function render(state, progress, w, h) {
    const wallX = w * 0.52;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < 18; i += 1) {
      const x = i * w / 18;
      line(x, 76, x, h - 76, "rgba(23,33,43,.035)", 1);
    }

    drawIpoWall(wallX, 88, h - 118);
    drawFunding(state, progress, w, h, wallX);
    drawMarket(state, progress, w, h, wallX);
  }

  return { render };
}
