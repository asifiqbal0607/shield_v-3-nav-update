const T = "#0d9488";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="ftr-inner">
        <div
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
