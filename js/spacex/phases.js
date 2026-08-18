import { PRIVATE_END, IPO_END } from "./data.js";

export function createPhases() {
  return [
    {
      when: (p) => p < 0.12,
      title: "Founding capital",
      copy: "SpaceX starts with founder capital and early believers. The company stays private while rockets and Starlink are built."
    },
    {
      when: (p) => p < 0.28,
      title: "Private funding eras",
      copy: "Early VCs, then growth and mega-rounds, send cash into SpaceX. Valuation climbs for decades before any public listing."
    },
    {
      when: (p) => p < PRIVATE_END,
      title: "Pre-IPO exit rounds",
      copy: "Even before an IPO, tender offers and secondaries let some early holders and employees take liquidity — SpaceX already has exit rounds."
    },
    {
      when: (p) => p < IPO_END,
      title: "IPO day",
      copy: "Primary shares send cash to SpaceX. Secondary shares pay existing holders. Only a small float trades on day one; most insiders stay locked."
    },
    {
      when: (p) => p < 0.68,
      title: "Early VC unlock (~90 days)",
      copy: "Initial VCs hit their shorter lockup. An exit wave hits the market as early private investors finally sell into public demand."
    },
    {
      when: (p) => p < 0.82,
      title: "Employee & growth unlock (~180 days)",
      copy: "Growth investors and employees unlock together. More supply arrives — the market’s ability to absorb it depends on public demand."
    },
    {
      when: (p) => p < 0.95,
      title: "Musk still locked",
      copy: "Through most of year one, Musk’s control block stays locked. The calendar heads toward day 365 — his distinct exit window."
    },
    {
      when: () => true,
      title: "Musk year-one unlock (day 365)",
      copy: "After a full year, Musk can exit. How much he sells (sell intensity) and how strong demand is shape the final supply-pressure climax."
    }
  ];
}
