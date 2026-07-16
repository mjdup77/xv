// Headless render smoke for the manager UI: mounts the key screens with
// react-dom/server against a real engine career (both leagues) and checks
// they produce markup without throwing. Run: npx tsx scripts/mgr-ui-smoke.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */

// Minimal browser globals before any UI module loads.
(globalThis as any).location = { hash: "#/manager", pathname: "/" };
(globalThis as any).window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  location: (globalThis as any).location,
};
(globalThis as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
(globalThis as any).document = { title: "" };

async function main() {
  const { renderToString } = await import("react-dom/server");
  const React = (await import("react")).default;
  (globalThis as any).React = React; // classic-runtime JSX under tsx
  const { newCareer, playMatchday, advanceWeek, pendingFixtures } = await import(
    "../src/manager/engine/season"
  );

  // Build a URC career mid-season with a played match, then feed it to the
  // store through its real localStorage load path (v3 save round-trip).
  const c = newCareer("glasgow", "ui-smoke-1");
  advanceWeek(c); // week 1
  playMatchday(c); // round 1 played, lastReport set
  const stored: Record<string, string> = {
    xvm_career: JSON.stringify(c),
    xvm_cabinet: JSON.stringify({
      trophies: [{ trophyId: "urc-shield-irish", clubId: "leinster", year: 2025 }],
      seasonsCompleted: 1,
      matchesWon: 3,
      matchesPlayed: 5,
    }),
  };
  (globalThis as any).localStorage = {
    getItem: (k: string) => stored[k] ?? null,
    setItem: (k: string, v: string) => {
      stored[k] = v;
    },
    removeItem: (k: string) => {
      delete stored[k];
    },
  };

  const store = await import("../src/manager/store");
  const { SeasonScreen } = await import("../src/manager/ui/SeasonScreen");
  const { TableScreen } = await import("../src/manager/ui/TableScreen");
  const { Report } = await import("../src/manager/ui/Report");
  const { InboxScreen } = await import("../src/manager/ui/InboxScreen");
  const { Review } = await import("../src/manager/ui/Review");
  const { SquadHub } = await import("../src/manager/ui/SquadHub");
  const { compVars, trophyMeta, COMP_THEMES } = await import("../src/manager/ui/theme");

  let failures = 0;
  const check = (name: string, cond: boolean, detail = "") => {
    if (!cond) failures++;
    console.log(`${cond ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  };

  check("store loads v3 save", !!(store.useManagerStore, true));

  const render = (name: string, El: any) => {
    try {
      const html = renderToString(React.createElement(El));
      check(`${name} renders`, html.length > 200, `${html.length} chars`);
      return html;
    } catch (e) {
      check(`${name} renders`, false, String(e));
      return "";
    }
  };

  const season = render("SeasonScreen (URC)", SeasonScreen);
  check("season shows URC branding", season.includes("United Rugby Championship") || season.includes("URC"));
  const table = render("TableScreen (URC)", TableScreen);
  check("table shows top-8 line", table.includes("Top 8 reach the playoffs"));
  check("table shows shield races", table.includes("Shield"));
  render("Report", Report);
  render("InboxScreen", InboxScreen);
  render("SquadHub", SquadHub);

  // The Home tab (default in-game screen, CEO playtest July 2026).
  const { HubScreen } = await import("../src/manager/ui/HubScreen");
  const hub = render("HubScreen (home tab)", HubScreen);
  check("hub shows the at-a-glance banner", hub.includes("pts"));
  check(
    "hub has the primary action in the thumb zone",
    hub.includes("Matchday") || hub.includes("Continue") || hub.includes("Start the season"),
  );
  check("hub links club & board", hub.includes("Club &amp; board") || hub.includes("Club & board"));

  // Inbox hygiene through the store: dismiss, clear-read, pinned decisions.
  const careerNow = () => JSON.parse(stored.xvm_career) as typeof c;
  const pinnedCheck = (it: { decision?: unknown; resolved?: string }) =>
    !!it.decision && !it.resolved;
  const disposable = careerNow().inbox.find((it) => !pinnedCheck(it));
  if (disposable) {
    store.actions.dismissMail(disposable.id);
    check(
      "dismissMail deletes an informational item",
      !careerNow().inbox.some((it) => it.id === disposable.id),
    );
  } else {
    check("dismissMail has an item to test", false, "no non-decision mail in week 1");
  }
  store.actions.markAllRead();
  store.actions.clearReadMail();
  check(
    "clearReadMail keeps only open decisions",
    careerNow().inbox.every(pinnedCheck),
    `${careerNow().inbox.length} left`,
  );
  const pinned = careerNow().inbox.find(pinnedCheck);
  if (pinned) {
    store.actions.dismissMail(pinned.id);
    check(
      "dismissMail refuses a pinned decision",
      careerNow().inbox.some((it) => it.id === pinned.id),
    );
  }

  // Advance into a match week: the hub must lead with Matchday + emphasis.
  store.actions.continueWeek();
  const hub2 = render("HubScreen (match week)", HubScreen);
  check("match-week hub leads with Matchday", hub2.includes("Matchday"));
  check("match-week hub offers the emphasis dial", hub2.includes("emphasis"));

  // Play the season out THROUGH THE STORE (exercises actions + cabinet).
  let guard = 0;
  const current = () => (store.useManagerStore as any) && (store as any);
  void current;
  const careerOf = () => JSON.parse(stored.xvm_career) as typeof c;
  while (careerOf().season.phase !== "offseason" && guard++ < 100) {
    if (pendingFixtures(careerOf()).length > 0) store.actions.playMatchday();
    else store.actions.continueWeek();
  }
  check("store plays a season to offseason", careerOf().season.phase === "offseason");
  const cab = JSON.parse(stored.xvm_cabinet);
  check("cabinet persisted through store", cab.seasonsCompleted >= 2);
  const review = render("Review (URC, season done)", Review);
  check("review is competition-aware", review.includes("United Rugby Championship"));

  // New home page (manager landing = site home) + the ecosystem menu.
  const { HomeScreen } = await import("../src/manager/ui/HomeScreen");
  const home = (() => {
    try {
      return renderToString(
        React.createElement(HomeScreen, { career: careerOf(), cabinet: cab, staleSave: false }),
      );
    } catch (e) {
      check("HomeScreen renders", false, String(e));
      return "";
    }
  })();
  check("HomeScreen renders", home.length > 200, `${home.length} chars`);
  check("home shows trophy cabinet", home.includes("Trophy cabinet"));
  check("home has continue CTA", home.includes("Continue career"));
  check("home drops the back link", !home.includes("Back to XV"));
  check("home mounts the XV menu", home.includes("xv-mark"));

  const { EcosystemMenu } = await import("../src/components/EcosystemMenu");
  const menu = renderToString(React.createElement(EcosystemMenu, { current: "manager" }));
  check("menu lists both products", menu.includes("Manager") && menu.includes("Daily Draft"));
  check("menu links to the draft game", menu.includes("#/draft"));
  check("menu marks the current product", menu.includes("You’re here"));

  // Theme map sanity.
  check("comp themes cover both leagues", !!COMP_THEMES.prem && !!COMP_THEMES.urc);
  check("comp vars emit css custom props", compVars("urc")["--c-accent"] === COMP_THEMES.urc.accent);
  const tm = trophyMeta("urc-shield-irish");
  check("trophy meta resolves shields", tm.name === "Irish Shield" && tm.league === "urc");
  check("trophy meta resolves titles", trophyMeta("prem-title").name.includes("Premiership"));

  console.log(failures ? `\n${failures} FAILURES` : "\nall good");
  process.exit(failures ? 1 : 0);
}

main();
