// The XV ecosystem menu: one quiet "XV" mark in the corner of each product's
// landing screen. It opens an overlay sheet listing every XV game, so the
// products cross-link through a single deliberate affordance instead of
// scattered inline links. Styles live in index.css (shared by both bundles);
// transitions are CSS-only.

import { useEffect, useState } from "react";
import { track } from "../analytics";

export type XvProduct = "manager" | "draft";

const PRODUCTS: { id: XvProduct; href: string; name: string; note: string }[] = [
  {
    id: "manager",
    href: "#/manager",
    name: "Manager",
    note: "Take charge of a real Premiership or URC club and manage full seasons.",
  },
  {
    id: "draft",
    href: "#/draft",
    name: "Daily Draft",
    note: "The original XV — draft an all-time World Cup side. New challenge every day.",
  },
];

export function EcosystemMenu({ current }: { current: XvProduct }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const toggle = () => {
    if (!open) track("ecosystem_menu_opened", { from: current });
    setOpen(!open);
  };

  return (
    <>
      <button
        className="xv-mark"
        aria-label="XV games menu"
        aria-expanded={open}
        onClick={toggle}
      >
        XV
      </button>
      <div
        className={`xv-overlay${open ? " open" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      >
        <div
          className="xv-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="XV games"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="xv-sheet-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            ✕
          </button>
          <div className="xv-sheet-brand">
            <span className="xv-sheet-logo">XV</span>
            <span className="xv-sheet-sub">Rugby games</span>
          </div>
          <nav className="xv-products">
            {PRODUCTS.map((p) => (
              <a
                key={p.id}
                className={`xv-product${p.id === current ? " here" : ""}`}
                href={p.href}
                onClick={(e) => {
                  if (p.id === current) e.preventDefault();
                  else track("ecosystem_nav", { from: current, to: p.id });
                  setOpen(false);
                }}
              >
                <span className="xv-product-name">
                  {p.name}
                  {p.id === current && <em>You’re here</em>}
                </span>
                <span className="xv-product-note">{p.note}</span>
              </a>
            ))}
          </nav>
          <p className="xv-sheet-foot">Free, unofficial, fan-made. More games to come.</p>
        </div>
      </div>
    </>
  );
}
