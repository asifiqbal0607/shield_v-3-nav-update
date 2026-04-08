/**
 * SectionTitle — a bold section header with a bottom divider.
 */
export default function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: "#1a1a2e",
        paddingBottom: 10,
        marginBottom: 16,
        borderBottom: "2px solid #f1f5f9",
      }}
    >
      {children}
    </div>
  );
}
