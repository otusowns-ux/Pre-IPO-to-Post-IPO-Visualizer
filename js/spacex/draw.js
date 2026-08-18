import { clamp, ease } from "../shared/math.js";
import { PRIVATE_END, IPO_END, YEAR_DAYS, fundingEras, cohorts } from "./data.js";
import {
  postIpoDay,
  eraVisibility,
  ipoProgress,
  unlockStrength,
  soldForCohort,
  illustrativePrice
} from "./model.js";

export function createSpacexDraw(draw) {
  const { ctx, line, arrow, circle, text, roundRect, labelBadge } = draw;

  function drawIpoWall(x, top, bottom) {
    ctx.save();
    ctx.strokeStyle = "#c45c12";
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 10]);
    ctx.beginPath();
    for (let y = top; y <= bottom; y += 22) {
      const offset = Math.sin(y * 0.11) * 8;
      ctx.lineTo(x + offset, y);
    }
    ctx.stroke();
    ctx.restore();
    text("IPO", x, top - 22, 15, "#9a4a10", 800);
  }

  function companyX(w, wallX, progress) {
    const leftStart = Math.max(110, w * 0.2);
    const leftLate = wallX - Math.max(70, w * 0.08);
    const publicSpot = wallX + Math.max(58, w * 0.08);
    if (progress < PRIVATE_END) {
      return leftStart + (leftLate - leftStart) * ease(progress / PRIVATE_END);
    }
    const cross = clamp((progress - PRIVATE_END) / 0.12, 0, 1);
    return leftLate + (publicSpot - leftLate) * ease(cross);
  }

  function eraPosition(index, count, w, h, wallX) {
    const t = count === 1 ? 0.5 : index / (count - 1);
    const x = w * 0.07 + t * Math.max(1, wallX - w * 0.22);
    const y = h * (index % 2 === 0 ? 0.24 : 0.58) + Math.sin(index * 1.1) * 10;
    return { x, y };
  }

  function drawCompany(x, y, progress, publicMode) {
    const funded = fundingEras
      .filter((e) => !e.isExit)
      .reduce((sum, era, i) => {
        const vis = clamp(eraVisibility(progress) * fundingEras.length - i, 0, 1);
        return sum + era.amount * vis;
      }, 0);

    circle(x, y, 34, publicMode ? "rgba(196, 92, 18, 0.16)" : "rgba(26, 79, 140, 0.14)", publicMode ? "rgba(196, 92, 18, 0.9)" : "rgba(26, 79, 140, 0.55)", 3);
    circle(x, y, 18, publicMode ? "#c45c12" : "#1a4f8c", "white", 3);
    text("SpaceX", x, y + 54, 14, "#0f1720", 850);
    if (!publicMode) {
      labelBadge([`raised ~$${funded.toFixed(1)}B`], x, y - 52, {
        color: "#0f1720",
        size: 12,
        fill: "rgba(255,255,255,.85)"
      });
    } else {
      labelBadge(["public SpaceX"], x, y - 52, {
        color: "#9a4a10",
        size: 12,
        fill: "rgba(255,255,255,.88)"
      });
    }
  }

  function drawFunding(progress, w, h, wallX) {
    const centerY = h * 0.42;
    const cx = companyX(w, wallX, progress);
    const vis = eraVisibility(progress);
    const erasVisible = Math.ceil(fundingEras.length * clamp(vis + 0.05, 0, 1));

    fundingEras.forEach((era, i) => {
      const { x, y } = eraPosition(i, fundingEras.length, w, h, wallX);
      const active = i < erasVisible;
      const alpha = active ? 1 : 0.18;
      const fill = era.isExit ? `rgba(180, 61, 61, ${0.05 + alpha * 0.1})` : `rgba(31, 122, 77, ${0.05 + alpha * 0.08})`;
      const stroke = era.isExit ? `rgba(180, 61, 61, ${0.2 + alpha * 0.45})` : `rgba(31, 122, 77, ${0.18 + alpha * 0.42})`;

      roundRect(x - 48, y - 28, 96, 56, 8, fill, stroke);
      circle(x - 34, y, 7, era.color, "white", 1.5);
      text(era.name, x + 8, y - 10, 11, `rgba(15, 23, 32, ${0.4 + alpha * 0.55})`, 850);
      text(era.years, x + 8, y + 6, 10, `rgba(90, 101, 112, ${0.45 + alpha * 0.5})`, 700);
      text(era.isExit ? `exit $${era.amount}B` : `+$${era.amount}B`, x + 8, y + 20, 11, `rgba(15, 23, 32, ${0.45 + alpha * 0.5})`, 800);

      const fly = clamp((vis * fundingEras.length - i) / 1.1, 0, 1);
      if (fly > 0 && fly < 1 && !era.isExit) {
        const px = x + (cx - x) * ease(fly);
        const py = y + (centerY - y) * ease(fly);
        arrow(x + 28, y, px - 20, py, `rgba(31, 122, 77, ${0.35 + alpha * 0.4})`, 2);
        circle(px, py, 5, "rgba(31, 122, 77, 0.9)", "white", 2);
      }

      if (era.isExit && fly > 0.2) {
        const out = clamp((fly - 0.2) / 0.8, 0, 1);
        arrow(x - 10, y + 34, x - 10, y + 34 + 28 * out, `rgba(180, 61, 61, ${0.5 + alpha * 0.35})`, 2);
        if (out > 0.4) text("secondary", x, y + 68, 10, "rgba(180, 61, 61, 0.9)", 750);
      }
    });

    drawCompany(cx, centerY, progress, progress > IPO_END - 0.02);
  }

  function drawUnlockTimeline(progress, w, h, wallX) {
    if (progress < IPO_END - 0.02) return;

    const day = Math.max(0, postIpoDay(progress));
    const x0 = wallX + 28;
    const x1 = w - 28;
    const y = h - 78;
    const width = x1 - x0;

    roundRect(x0 - 12, y - 42, width + 24, 78, 8, "rgba(255,255,255,.72)", "rgba(15,23,32,.12)");
    text("Year-one unlock calendar", x0, y - 28, 12, "#5a6570", 850, "left");
    text("Day 0", x0, y + 22, 11, "#5a6570", 700, "left");
    text("Day 365", x1, y + 22, 11, "#5a6570", 700, "right");

    line(x0, y, x1, y, "rgba(15,23,32,.2)", 2);

    const markers = [
      { day: 0, label: "Float", color: "#5a6570", big: false },
      { day: 90, label: "Early VCs", color: "#1f7a4d", big: false },
      { day: 180, label: "Growth + Emp", color: "#c45c12", big: false },
      { day: 365, label: "Musk", color: "#6b2d8b", big: true }
    ];

    markers.forEach((m) => {
      const mx = x0 + (m.day / YEAR_DAYS) * width;
      const reached = day >= m.day;
      const r = m.big ? 8 : 5;
      line(mx, y - (m.big ? 14 : 8), mx, y + (m.big ? 14 : 8), m.color, m.big ? 2.5 : 1.5);
      circle(mx, y, r, reached ? m.color : "white", m.color, 2);
      if (m.big) {
        labelBadge([m.label, "day 365"], mx, y - 28, {
          color: reached ? "#6b2d8b" : "#5a6570",
          size: 11,
          fill: reached ? "rgba(107, 45, 139, 0.1)" : "rgba(255,255,255,.9)",
          stroke: reached ? "rgba(107, 45, 139, 0.35)" : "rgba(15,23,32,.12)"
        });
      } else {
        text(m.label, mx, y - 16, 10, reached ? m.color : "#5a6570", 750);
      }
    });

    const playX = x0 + (day / YEAR_DAYS) * width;
    line(playX, y - 20, playX, y + 20, "#0f1720", 2);
    circle(playX, y, 4, "#0f1720", "white", 1.5);
    text(`Day ${day}`, playX, y + 36, 11, "#0f1720", 850);
  }

  function drawMarket(state, progress, w, h, wallX) {
    const ipo = ipoProgress(progress);
    const day = postIpoDay(progress);
    const centerY = h * 0.42;
    const cx = companyX(w, wallX, progress);
    const exchangeX = Math.min(w - 100, wallX + Math.max(120, w * 0.2));

    if (ipo > 0 || day >= 0) {
      const show = day >= 0 ? 1 : ipo;
      roundRect(exchangeX - 54, centerY - 34, 108, 68, 8, "rgba(255,255,255,.75)", "rgba(26,79,140,.25)");
      text("Public", exchangeX, centerY - 12, 13, "#1a4f8c", 850);
      text("market", exchangeX, centerY + 8, 13, "#1a4f8c", 850);

      const primary = 8 * show;
      const secondaryDay = Math.max(state.float * 0.35, 4) * show;
      arrow(cx + 36, centerY - 24, exchangeX - 58, centerY - 24, "rgba(31, 122, 77, 0.78)", 2.5, [6, 5]);
      arrow(exchangeX - 58, centerY + 26, cx + 36, centerY + 26, "rgba(196, 92, 18, 0.72)", 2, [4, 5]);
      labelBadge([`primary ~$${primary.toFixed(0)}B`, "to SpaceX"], exchangeX - 80, centerY - 62, {
        color: "#1f7a4d",
        fill: "rgba(255,255,255,.9)"
      });
      labelBadge([`secondary ~$${secondaryDay.toFixed(1)}B`, "to holders"], wallX + 12, centerY + 72, {
        color: "#9a4a10",
        fill: "rgba(255,255,255,.92)",
        align: "left"
      });
    }

    if (day >= 0) {
      const exitSlots = cohorts.filter((c) => c.id !== "float");
      exitSlots.forEach((cohort, i) => {
        const strength = unlockStrength(cohort, day, state);
        if (strength <= 0) return;

        const slotY = h * 0.18 + i * (h * 0.12);
        const slotX = Math.min(w - 48, exchangeX + 70 + (i % 2) * 16);
        const sold = soldForCohort(cohort, day, state);
        const alpha = 0.35 + strength * 0.55;

        circle(slotX, slotY, cohort.isMusk ? 9 : 6, cohort.color, "white", 1.5);
        arrow(slotX - 8, slotY, exchangeX + 50, centerY - 10 + i * 4, `rgba(180, 61, 61, ${alpha})`, cohort.isMusk ? 2.5 : 2);
        text(`${cohort.name}`, slotX + 12, slotY - 8, 11, cohort.color, 800, "left");
        text(`exit $${sold.toFixed(1)}B`, slotX + 12, slotY + 8, 11, `rgba(180, 61, 61, ${0.7 + strength * 0.3})`, 800, "left");

        if (cohort.isMusk && strength > 0.15) {
          labelBadge(["Musk unlock", "year one"], slotX + 8, slotY - 28, {
            color: "#6b2d8b",
            size: 11,
            fill: "rgba(107, 45, 139, 0.12)",
            stroke: "rgba(107, 45, 139, 0.35)",
            align: "left"
          });
        }
      });

      const buyers = Math.round(3 + state.demand / 18);
      for (let i = 0; i < buyers; i += 1) {
        const y = h * 0.2 + i * ((h * 0.4) / Math.max(buyers - 1, 1));
        const x = Math.min(w - 36, exchangeX + 100);
        circle(x, y, 5 + state.demand / 90, `rgba(26, 79, 140, ${0.25 + state.demand / 200})`, "white", 1.5);
      }
    }

    if (day >= 0 || ipo > 0.5) {
      const chartX = wallX + 70;
      const chartY = h * 0.72;
      const chartW = Math.max(160, w - chartX - 36);
      const chartH = 70;
      const tMax = day < 0 ? 0.05 : day / YEAR_DAYS;

      line(chartX, chartY, chartX + chartW, chartY, "rgba(15,23,32,.22)", 1);
      line(chartX, chartY - chartH, chartX, chartY, "rgba(15,23,32,.14)", 1);
      text("price path", chartX, chartY - chartH - 10, 11, "#5a6570", 750, "left");

      ctx.save();
      ctx.strokeStyle = "#1a4f8c";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const points = 48;
      for (let i = 0; i < points; i += 1) {
        const t = (i / (points - 1)) * tMax;
        const simDay = Math.round(t * YEAR_DAYS);
        const price = illustrativePrice(simDay, state, progress) || 100;
        const x = chartX + t * chartW;
        const y = chartY - ((price - 40) / 120) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      [90, 180, 365].forEach((unlockDay) => {
        if (day >= unlockDay) {
          const ux = chartX + (unlockDay / YEAR_DAYS) * chartW;
          if (ux <= chartX + chartW * tMax + 1) {
            line(ux, chartY - chartH, ux, chartY, "rgba(180,61,61,.25)", 1, [3, 3]);
          }
        }
      });
    }

    drawUnlockTimeline(progress, w, h, wallX);
  }

  function render(state, progress, w, h) {
    const wallX = w * 0.5;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < 18; i += 1) {
      const x = i * w / 18;
      line(x, 76, x, h - 90, "rgba(15,23,32,.035)", 1);
    }

    drawIpoWall(wallX, 88, h - 130);
    drawFunding(progress, w, h, wallX);
    drawMarket(state, progress, w, h, wallX);
  }

  return { render };
}
