// The Inbox: everything that happens between fixtures lands here, FIFA
// manager-mode style. Unread dots, expandable mails, and inline decisions
// (offers, contracts, unhappy players, job approaches).
//
// Hygiene (CEO playtest, July 2026): every non-decision item can be swiped
// away or dismissed with the × control, "Clear read" empties the backlog in
// one tap, and the weekly tick auto-archives informational mail after a few
// weeks (engine/inbox.ts). Open decisions are pinned — they can't be deleted
// until resolved, so nothing important is ever swiped into oblivion.

import { useEffect, useRef, useState } from "react";
import { CLUB_BY_ID } from "../../data/manager";
import type { InboxItem } from "../types";
import { actions, useManagerStore } from "../store";
import { fmtMoney } from "../engine/finance";
import { isPinned } from "../engine/inbox";
import { ScreenHead } from "./bits";
import { nav } from "./util";

const KIND_META: Record<InboxItem["kind"], { icon: string; label: string }> = {
  preview: { icon: "🔍", label: "Preview" },
  injury: { icon: "✚", label: "Physio" },
  offer: { icon: "💷", label: "Offer" },
  contract: { icon: "✍️", label: "Contract" },
  unhappy: { icon: "⚠️", label: "Squad" },
  board: { icon: "🏛", label: "Board" },
  news: { icon: "📰", label: "News" },
  scout: { icon: "🧭", label: "Scout" },
  window: { icon: "🕰", label: "Window" },
  progression: { icon: "📈", label: "Development" },
  job: { icon: "💼", label: "Job" },
};

function weekLabel(it: InboxItem): string {
  if (it.week === 0) return "Pre-season";
  if (it.week >= 22) return "Off-season";
  return `Wk ${it.week}`;
}

/** `#/manager/inbox?open=<id>` deep-opens one item (Home hub decision cards). */
function openParam(): string | null {
  const q = location.hash.split("?")[1];
  return q ? new URLSearchParams(q).get("open") : null;
}

export function InboxScreen() {
  const { career } = useManagerStore();
  const [openId, setOpenId] = useState<string | null>(openParam());
  // A deep-opened item counts as read.
  useEffect(() => {
    const id = openParam();
    if (id) actions.markRead(id);
  }, []);
  if (!career) return null;

  const items = career.inbox;
  const unread = items.filter((it) => !it.read).length;
  const clearable = items.filter((it) => it.read && !isPinned(it)).length;

  const toggle = (it: InboxItem) => {
    const opening = openId !== it.id;
    setOpenId(opening ? it.id : null);
    if (opening && !it.read) actions.markRead(it.id);
  };

  return (
    <div className="mgr">
      <ScreenHead
        title="Inbox"
        sub={unread > 0 ? `${unread} unread` : "All read"}
        right={
          <span className="mgr-inbox-tools">
            {unread > 0 && (
              <button className="mbtn tiny" onClick={() => actions.markAllRead()}>
                Mark read
              </button>
            )}
            {clearable > 0 && (
              <button className="mbtn tiny" onClick={() => actions.clearReadMail()}>
                Clear read
              </button>
            )}
          </span>
        }
      />

      {items.length === 0 && (
        <div className="mcard">
          <p className="mcard-muted">Nothing yet. Advance the week and the world will write to you.</p>
        </div>
      )}

      <div className="mgr-inbox">
        {items.map((it) => (
          <MailRow key={it.id} item={it} open={openId === it.id} onToggle={() => toggle(it)} />
        ))}
      </div>

      {items.length > 0 && (
        <p className="mgr-inbox-hint">
          Swipe a message away or tap ×. Older news self-archives; open decisions stay
          until you deal with them.
        </p>
      )}
    </div>
  );
}

/** One mail: swipe-to-dismiss on touch, × control everywhere. Pinned
 *  (undecided) items can't be dismissed. */
function MailRow({ item, open, onToggle }: { item: InboxItem; open: boolean; onToggle: () => void }) {
  const pinned = isPinned(item);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const touch = useRef<{ x: number; y: number; swiping: boolean } | null>(null);

  const dismiss = () => {
    setLeaving(true);
    window.setTimeout(() => actions.dismissMail(item.id), 160);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (pinned) return;
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, swiping: false };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = touch.current;
    if (!t) return;
    const ddx = e.touches[0].clientX - t.x;
    const ddy = e.touches[0].clientY - t.y;
    if (!t.swiping && Math.abs(ddx) > 12 && Math.abs(ddx) > Math.abs(ddy) * 1.4) t.swiping = true;
    if (t.swiping) setDx(ddx);
  };
  const onTouchEnd = () => {
    const t = touch.current;
    touch.current = null;
    if (t?.swiping && Math.abs(dx) > 72) dismiss();
    else setDx(0);
  };

  return (
    <div
      className={`mgr-mail${item.read ? "" : " unread"}${open ? " open" : ""}${leaving ? " leaving" : ""}`}
      style={dx !== 0 ? { transform: `translateX(${dx}px)`, opacity: Math.max(0.25, 1 - Math.abs(dx) / 220) } : undefined}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="mgr-mail-top">
        <button className="mgr-mail-head" onClick={onToggle}>
          <span className="mgr-mail-icon">{KIND_META[item.kind].icon}</span>
          <span className="mgr-mail-titles">
            <span className="mgr-mail-subject">{item.subject}</span>
            <span className="mgr-mail-meta">
              {item.from} · {weekLabel(item)}
              {pinned && <em className="mgr-mail-flag"> · needs a decision</em>}
              {item.resolved && <em className="mgr-mail-done"> · {item.resolved}</em>}
            </span>
          </span>
          {!item.read && <span className="mgr-mail-dot" />}
        </button>
        {!pinned && (
          <button className="mgr-mail-x" aria-label="Dismiss" onClick={dismiss}>
            ×
          </button>
        )}
      </div>
      {open && (
        <div className="mgr-mail-body">
          {item.body.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <MailActions item={item} />
        </div>
      )}
    </div>
  );
}

function MailActions({ item }: { item: InboxItem }) {
  const { career } = useManagerStore();
  if (!career) return null;

  if (item.resolved)
    return <p className="mgr-mail-resolved">Resolved: {item.resolved}</p>;

  const d = item.decision;
  if (!d) {
    // Convenience links for informational mail.
    if (item.kind === "preview")
      return (
        <div className="mgr-mail-actions">
          <button className="mbtn tiny" onClick={() => nav("team")}>Team sheet</button>
          <button className="mbtn tiny" onClick={() => nav("plan")}>Game plan</button>
        </div>
      );
    if (item.kind === "scout" || item.kind === "window")
      return (
        <div className="mgr-mail-actions">
          <button className="mbtn tiny" onClick={() => nav("market")}>Open the market</button>
        </div>
      );
    if (item.kind === "injury")
      return (
        <div className="mgr-mail-actions">
          <button className="mbtn tiny" onClick={() => nav("squad")}>Squad hub</button>
        </div>
      );
    return null;
  }

  if (d.kind === "offer") {
    const p = career.players[d.offer.playerId];
    if (!p) return null;
    return (
      <div className="mgr-mail-actions">
        <button className="mbtn tiny primary" onClick={() => actions.resolveOffer(item.id, "accept")}>
          Accept {d.offer.loan ? "loan" : fmtMoney(d.offer.fee)}
        </button>
        {!d.offer.loan && !d.offer.countered && (
          <button className="mbtn tiny" onClick={() => actions.resolveOffer(item.id, "counter")}>
            Demand more
          </button>
        )}
        <button className="mbtn tiny danger" onClick={() => actions.resolveOffer(item.id, "reject")}>
          Reject
        </button>
      </div>
    );
  }

  if (d.kind === "contract") {
    return (
      <div className="mgr-mail-actions">
        <button className="mbtn tiny primary" onClick={() => actions.resolveContract(item.id, "renew")}>
          Renew: {fmtMoney(d.contract.demandWage)}/yr × {d.contract.years}
        </button>
        <button className="mbtn tiny danger" onClick={() => actions.resolveContract(item.id, "decline")}>
          Let it run down
        </button>
      </div>
    );
  }

  if (d.kind === "unhappy") {
    if (d.unhappy.reason === "listed")
      return (
        <div className="mgr-mail-actions">
          <button className="mbtn tiny primary" onClick={() => actions.resolveUnhappy(item.id, "unlist")}>
            Take him off the list
          </button>
          <button className="mbtn tiny danger" onClick={() => actions.resolveUnhappy(item.id, "keep")}>
            He stays listed
          </button>
        </div>
      );
    return (
      <div className="mgr-mail-actions">
        <button className="mbtn tiny primary" onClick={() => actions.resolveUnhappy(item.id, "promise")}>
          Promise him starts
        </button>
        <button className="mbtn tiny danger" onClick={() => actions.resolveUnhappy(item.id, "straight")}>
          Tell him straight
        </button>
      </div>
    );
  }

  if (d.kind === "job") {
    const club = CLUB_BY_ID[d.job.clubId];
    return (
      <div className="mgr-mail-actions">
        <button
          className="mbtn tiny primary"
          onClick={() => {
            actions.resolveJob(item.id, "accept");
            nav("home");
          }}
        >
          Take the {club.shortName} job
        </button>
        <button className="mbtn tiny danger" onClick={() => actions.resolveJob(item.id, "decline")}>
          Decline
        </button>
      </div>
    );
  }

  return null;
}
