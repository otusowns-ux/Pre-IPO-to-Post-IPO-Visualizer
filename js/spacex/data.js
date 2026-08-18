export const PRIVATE_END = 0.4;
export const IPO_END = 0.55;
export const YEAR_DAYS = 365;

export const fundingEras = [
  { id: "founding", name: "Founding", years: "2002–08", amount: 0.1, color: "#1f7a4d", note: "Seed + early capital" },
  { id: "earlyVc", name: "Early VCs", years: "2008–15", amount: 1.2, color: "#2f8f5c", note: "Series rounds" },
  { id: "growth", name: "Growth", years: "2015–20", amount: 4.5, color: "#3c9f6a", note: "Falcon / Starlink" },
  { id: "mega", name: "Mega rounds", years: "2020–25", amount: 12, color: "#c45c12", note: "Late private capital" },
  { id: "tender", name: "Pre-IPO tenders", years: "2022–25", amount: 2.5, color: "#b43d3d", note: "Secondary liquidity", isExit: true }
];

export const cohorts = [
  { id: "float", name: "Day-one float", unlockDay: 0, sellable: 8, color: "#5a6570", pressure: 18 },
  { id: "earlyVc", name: "Early VCs", unlockDay: 90, sellable: 22, color: "#1f7a4d", pressure: 28 },
  { id: "growth", name: "Growth investors", unlockDay: 180, sellable: 35, color: "#c45c12", pressure: 32 },
  { id: "employees", name: "Employees", unlockDay: 180, sellable: 18, color: "#1a4f8c", pressure: 22 },
  { id: "musk", name: "Musk", unlockDay: 365, sellable: 80, color: "#6b2d8b", pressure: 55, isMusk: true }
];
