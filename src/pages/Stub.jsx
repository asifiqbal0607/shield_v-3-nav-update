import { Card } from "../components/ui";
import { SLATE } from "../components/constants/colors";

/**
 * PageStub — placeholder for pages that are not yet implemented.
 * Used for Partners, Audit Log, GEO Stats, Device Stats, Docs, Sandbox.
 *
 * @param {string} title  Page title
 * @param {string} icon   Emoji / symbol
 */
export default function PageStub({ title, icon }) {
  return (
    <Card
      className="stub-root"
    >
      <div className="stub-icon">{icon}</div>
      <div className="stub-title">
        {title}
      </div>
      <div className="stub-desc">
        This page is under construction.
      </div>
    </Card>
  );
}
