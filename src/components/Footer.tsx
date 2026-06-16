import { COFFEE_URL, CREATOR, FEEDBACK_URL } from "../config";
import { track } from "../analytics";

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer-credit">
        <strong>XV</strong> — an unofficial, fan-made game created by {CREATOR}.
      </p>
      <p className="footer-disclaimer">
        Not affiliated with, endorsed by, or sponsored by World Rugby or any union,
        competition or club. Player names and ratings are an independent
        interpretation based on publicly available information, used descriptively.
      </p>
      <div className="footer-links">
        {COFFEE_URL && (
          <a
            href={COFFEE_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("coffee_clicked", {})}
          >
            ☕ Buy me a coffee
          </a>
        )}
        {FEEDBACK_URL && (
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("feedback_clicked", {})}
          >
            Give feedback
          </a>
        )}
      </div>
    </footer>
  );
}
