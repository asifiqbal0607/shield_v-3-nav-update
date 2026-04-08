export default function ChannelRows({ data, filterScale, onOpen }) {
  const maxClicks = Math.max(...data.map(d => d.clicks));

  return (
    <div className="ov2-channels">
      {data.map((c) => {
        const ctr    = ((c.clicks / c.visits) * 100).toFixed(1);
        const barPct = Math.round((c.clicks / maxClicks) * 100);
        return (
          <div key={c.name} className="ov2-ch-row" onClick={() => onOpen(`${c.name} — Transactions`)}>
            <div className="ov2-ch-name-wrap">
              <span className="ov2-ch-dot" style={{ "--c": c.color }} />
              <span className="ov2-ch-name">{c.name}</span>
            </div>
            <div className="ov2-ch-bar-wrap">
              <div className="ov2-ch-bar" style={{ "--w": `${barPct}%`, "--c": c.color }} />
            </div>
            <div className="ov2-ch-stats">
              <span className="ov2-ch-ctr">{ctr}% CTR</span>
              <span className="ov2-ch-visits">{Math.round(c.visits * filterScale).toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}