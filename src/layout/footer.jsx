const T = "#0d9488";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="ftr-inner">
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            backgroundColor: T,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.5px",
          }}
        >
          S
        </div>
        <span className="ftr-name">
          MCP Shield
        </span>
      </div>

      <span className="ftr-copy">
        © {year} MCP Shield. All rights reserved.
      </span>
    </footer>
  );
}
