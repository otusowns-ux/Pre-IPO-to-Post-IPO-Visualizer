import { clamp } from "../shared/math.js";
import { PRIVATE_END, IPO_END, YEAR_DAYS, fundingEras, cohorts } from "./data.js";
import { createPhases } from "./phases.js";

const phases = createPhases();

export function postIpoDay(progress) {
  if (progress < IPO_END) return -1;
  return Math.round(clamp((progress - IPO_END) / (1 - IPO_END), 0, 1) * YEAR_DAYS);
}

export function eraVisibility(progress) {
  return clamp(progress / PRIVATE_END, 0, 1);
}

export function ipoProgress(progress) {
  return clamp((progress - PRIVATE_END) / (IPO_END - PRIVATE_END), 0, 1);
}

export function unlockStrength(cohort, day, state) {
  if (day < 0) return 0;
  if (day < cohort.unlockDay) return 0;
  const age = day - cohort.unlockDay;
  const ramp = clamp(age / 18, 0, 1);
  if (cohort.isMusk) return ramp * (state.muskSell / 100);
  if (cohort.id === "float") return ramp * (state.float / 12);
  return ramp;
}

export function soldForCohort(cohort, day, state) {
  const strength = unlockStrength(cohort, day, state);
  let base = cohort.sellable;
  if (cohort.id === "float") base = state.float * 0.9;
  if (cohort.isMusk) base = cohort.sellable * (state.muskSell / 100);
  return base * strength;
}

export function cumulativeSecondary(day, state, progress) {
  if (day < 0) {
    const tenderVis = clamp((progress - 0.28) / 0.12, 0, 1);
    return tenderVis * fundingEras.find((e) => e.id === "tender").amount;
  }
  let total = fundingEras.find((e) => e.id === "tender").amount * 0.4;
  cohorts.forEach((c) => {
    total += soldForCohort(c, day, state);
  });
  return total;
}

export function latestPressure(day, state) {
  if (day < 0) return 0;
  let best = 0;
  let bestPressure = 0;
  cohorts.forEach((c) => {
    if (day >= c.unlockDay) {
      const age = day - c.unlockDay;
      if (age <= 40 && c.unlockDay >= best) {
        best = c.unlockDay;
        let p = c.pressure * unlockStrength(c, day, state);
        if (c.isMusk) p *= 0.5 + state.muskSell / 100;
        bestPressure = p * (1.15 - state.demand / 200);
      }
    }
  });
  return clamp(bestPressure, 0, 100);
}

export function nextUnlockInfo(day) {
  if (day < 0) return "IPO day";
  const upcoming = cohorts
    .filter((c) => c.unlockDay > day)
    .sort((a, b) => a.unlockDay - b.unlockDay);
  if (!upcoming.length) return "None";
  const next = upcoming[0];
  const left = next.unlockDay - day;
  return `${next.name} (${left}d)`;
}

export function illustrativePrice(day, state, progress) {
  if (day < 0) return null;
  const t = day / YEAR_DAYS;
  let level = 100 + state.demand * 0.35 - state.float * 0.4;
  cohorts.forEach((c) => {
    if (day >= c.unlockDay) {
      const shock = Math.exp(-(day - c.unlockDay) / 28);
      let hit = c.pressure * 0.35 * shock;
      if (c.isMusk) hit *= state.muskSell / 40;
      if (c.id === "float") hit *= state.float / 15;
      level -= hit * (1.1 - state.demand / 180);
    }
  });
  const wave = Math.sin(t * Math.PI * 6 + progress * 4) * (6 - t * 3);
  return clamp(level + wave, 42, 160);
}

export function currentPhase(progress) {
  return phases.find((phase) => phase.when(progress));
}

export function muskLockLabel(day, state) {
  if (day < 0) return "Pre-IPO";
  if (day < 365) return `Locked (${365 - day}d)`;
  return state.muskSell > 0 ? `${state.muskSell}% selling` : "Unlocked";
}
