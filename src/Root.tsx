// XV ecosystem router. The manager landing is the site's home page (bare
// root and #/manager); the original draft game lives at #/draft. Challenge /
// match share links are bare-root URLs carrying ?c / ?m / ?mr / ?x params, so
// a bare root WITH one of those params still opens the draft game — existing
// share links keep working unchanged. ManagerApp stays code-split.

import { Suspense, lazy, useEffect, useState } from "react";
import App from "./App.tsx";

const ManagerApp = lazy(() => import("./manager/ui/ManagerApp.tsx"));

type Product = "manager" | "draft";

const DRAFT_LINK_PARAMS = ["c", "m", "mr", "x"];

function currentProduct(): Product {
  if (location.hash.startsWith("#/manager")) return "manager";
  if (location.hash.startsWith("#/draft")) return "draft";
  // Bare root: share links belong to the draft game; everything else is home.
  const p = new URLSearchParams(location.search);
  if (DRAFT_LINK_PARAMS.some((k) => p.has(k))) return "draft";
  return "manager";
}

const TITLES: Record<Product, string> = {
  manager: "XV Manager — run a real rugby club",
  draft: "XV Daily Draft — build your all-time World Cup XV",
};

export default function Root() {
  const [product, setProduct] = useState(currentProduct());
  useEffect(() => {
    const on = () => setProduct(currentProduct());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => {
    document.title = TITLES[product];
  }, [product]);
  if (product === "manager") {
    return (
      <Suspense fallback={null}>
        <ManagerApp />
      </Suspense>
    );
  }
  return <App />;
}
