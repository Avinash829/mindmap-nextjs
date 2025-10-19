"use client";

export default function QuickGuide() {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        background: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        border: "1px solid #159affff",
        maxWidth: "280px",
        fontSize: "12px",
        lineHeight: "1.5",
        color: "#9ca3af",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "13px",
          fontWeight: "600",
          color: "#6b7280",
        }}
      >
        Quick Guide:
      </h3>
      <ul style={{ margin: 0, paddingLeft: "16px" }}>
        <li>- Double-click nodes to edit label or description</li>
        <li>- Click to select nodes</li>
        <li>- Drag to reposition</li>
        <li>- Connect via node handles</li>
        <li>-  Use Present mode for slideshows</li>
      </ul>
    </div>
  );
}
