import { clamp, ease } from "../shared/math.js";
import { phases, phaseIndex } from "./phases.js";

export const roundPalette = ["#2e7d58", "#3c8f66", "#4f9f73", "#6aa978", "#8a9954", "#9f7d32"];
export const roundNames = ["Seed", "Series A", "Series B", "Series C", "Series D", "Growth"];

export function roundModel(state) {
  const weights = [0.035, 0.12, 0.22, 0.3, 0.35, 0.42].slice(0, state.rounds);
  const totalWeight = weights.reduce((sum, item) => sum + item, 0);
  let running = 0;

  return weights.map((weight, index) => {
    const amount = Math.max(1, Math.round(state.capital * weight / totalWeight));
    running += amount;
    const valuationMultiple = [8, 6, 5, 4.2, 3.7, 3.3][index] || 3;
    const valuation = Math.round(running * valuationMultiple + index * state.capital * 0.22);

    return {
      name: roundNames[index],
      amount,
      cumulative: running,
      valuation,
      color: roundPalette[index]
    };
  });
}

export function ownershipModel(state, progress) {
  const roundDilution = [0.17, 0.19, 0.16, 0.12, 0.09, 0.08];
  const optionPool = 0.12;
  const fundedProgress = clamp((progress - 0.06) / 0.4, 0, 1);
  const activeRounds = Math.min(state.rounds, Math.floor(state.rounds * fundedProgress + 0.001));
  let founders = 1;
  const investorSlices = [];

  for (let i = 0; i < state.rounds; i += 1) {
    const dilution = i < activeRounds ? roundDilution[i] : 0;
    founders *= 1 - dilution;
    investorSlices.push({
      name: roundNames[i],
      share: dilution,
      color: roundPalette[i],
      active: i < activeRounds
    });
  }

  const optionSlice = optionPool * clamp(fundedProgress, 0, 1);
  founders = Math.max(0.15, founders - optionSlice * 0.45);

  return {
    founders,
    optionPool: optionSlice,
    investors: investorSlices
  };
}

export function marketDays(state, progress) {
  return Math.round(clamp((progress - 0.58) / 0.42, 0, 1) * Math.max(365, state.lockup + 60));
}

export function currentCompanyX(w, wallX, progress) {
  const leftStart = Math.max(94, w * 0.17);
  const leftLate = wallX - Math.max(70, w * 0.08);
  const publicSpot = wallX + Math.max(62, w * 0.085);

  if (progress < 0.5) {
    return leftStart + (leftLate - leftStart) * ease(clamp(progress / 0.5, 0, 1));
  }

  return leftLate + (publicSpot - leftLate) * ease(clamp((progress - 0.5) / 0.2, 0, 1));
}

export function metricsFor(state, progress) {
  const rounds = roundModel(state);
  const ownership = ownershipModel(state, progress);
  const fundedCount = Math.min(
    state.rounds,
    Math.floor(state.rounds * clamp((progress - 0.06) / 0.4, 0, 1) + 0.001)
  );
  const cashRaised = rounds.slice(0, fundedCount).reduce((sum, item) => sum + item.amount, 0);
  const postIpo = clamp((progress - 0.56) / 0.44, 0, 1);
  const ipoPrimary = Math.round(state.capital * 0.42 * clamp((progress - 0.54) / 0.2, 0, 1));
  const lockupFactor = clamp((marketDays(state, progress) - state.lockup) / 60, 0, 1);
  const exitCash = Math.round(state.capital * state.selloff / 100 * 0.82 * lockupFactor);
  const floatVolatility = clamp((25 - state.float) / 20, 0, 1.2);
  const fairPrice = 10 + state.capital / 50 + state.demand / 12 - state.selloff / 18 + floatVolatility * 1.8;
  const wave = Math.sin(progress * Math.PI * 8) * (1 - Math.min(postIpo, 0.85)) * 1.2;
  const price = clamp(10 + (fairPrice - 10) * postIpo + wave, 3.25, 42);
  const index = phaseIndex(progress);

  return {
    rounds,
    ownership,
    cashRaised: cashRaised + ipoPrimary,
    exitCash,
    price,
    phase: phases[index]
  };
}
