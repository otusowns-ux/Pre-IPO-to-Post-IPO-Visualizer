export const phases = [
  {
    title: "Private company forms",
    copy: "Seed investors put the first money in. The company stays the same visual size; the numbers show what changes.",
    label: "Seed"
  },
  {
    title: "Private rounds fund the company",
    copy: "Seed, Series A, Series B, and later investors send cash into the company, while founder ownership is diluted.",
    label: "Series"
  },
  {
    title: "The company crosses the IPO wall",
    copy: "Primary IPO shares send cash to the company. Secondary shares send cash to existing holders, not the business.",
    label: "IPO"
  },
  {
    title: "Lockup limits insider selling",
    copy: "Most pre-IPO holders wait 90 to 180 days or more before they can sell freely. When the timer expires, supply can jump.",
    label: "Lockup"
  },
  {
    title: "Price discovery",
    copy: "Public investors buy and sell shares. The stock explores upside, flat, and downside paths as supply and demand change.",
    label: "Market"
  }
];

export function phaseIndex(progress) {
  if (progress < 0.22) return 0;
  if (progress < 0.5) return 1;
  if (progress < 0.62) return 2;
  if (progress < 0.8) return 3;
  return 4;
}
