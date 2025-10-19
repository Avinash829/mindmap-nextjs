"use client";
import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { CustomNode, CustomNodeProps } from "@/types/mindmap";

export default function CustomNodeComponent({ data, id }: CustomNodeProps) {
  const { setNodes } = useReactFlow<CustomNode>();
  const [isHovered, setIsHovered] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [editDescription, setEditDescription] = useState(data.description || "");

  const handleSave = useCallback(() => {
    setNodes(nodes =>
      nodes.map(node =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                label: editValue.trim() || "Untitled",
                description: editDescription.trim(),
                isEditing: false,
                isEditingDescription: false,
              },
            }
          : node
      )
    );
  }, [id, editValue, editDescription, setNodes]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) handleSave();
    if (e.key === "Escape") {
      setEditValue(data.label);
      setEditDescription(data.description || "");
      setNodes(nodes =>
        nodes.map(node =>
          node.id === id
            ? { ...node, data: { ...node.data, isEditing: false, isEditingDescription: false } }
            : node
        )
      );
    }
  };

const baseStyle: React.CSSProperties = {
    padding: data.level <= 1 ? "16px 24px" : "12px 18px",
    borderRadius: "6px",
    border: `2px solid ${data.color || "rgba(50, 132, 239, 0.7)"}`,
    background: data.color ? `${data.color}10` : "white", // light tint
    minWidth: data.level <= 1 ? "180px" : "120px",
    textAlign: "center",
    fontSize: data.level <= 1 ? "16px" : "14px",
    fontWeight: "500",
    boxShadow: isHovered
        ? `0 4px 16px ${data.color ? data.color + "80" : "rgba(107,113,106,0.74)"}`
        : "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
    transform: isHovered ? "translateY(-1px)" : "translateY(0)",
};


  return (
    <div
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {["Top", "Bottom", "Left", "Right"].map((pos) => (
        <Handle
          key={pos}
          type="source"
          position={Position[pos as keyof typeof Position]}
          style={{ background: "#9ca3af" }}
        />
      ))}

      {data.isEditing ? (
        <input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          autoFocus
          style={{ background: "transparent", border: "none", outline: "none", width: "100%" }}
        />
      ) : (
        <div
          onDoubleClick={() =>
            setNodes(nodes =>
              nodes.map(node =>
                node.id === id ? { ...node, data: { ...node.data, isEditing: true } } : node
              )
            )
          }
          style={{ cursor: "pointer" }}
        >
          {data.label}
        </div>
      )}

      {data.isEditingDescription ? (
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyPress}
          autoFocus
          style={{
            background: "transparent",
            border: "1px solid #d1d5db",
            outline: "none",
            color: "#69a6ebff",
            fontSize: "12px",
            width: "100%",
            marginTop: "8px",
            padding: "4px",
            borderRadius: "4px",
            resize: "none",
            height: "60px",
          }}
          placeholder="Enter description..."
        />
      ) : (
        <div
          onDoubleClick={() =>
            setNodes(nodes =>
              nodes.map(node =>
                node.id === id
                  ? { ...node, data: { ...node.data, isEditingDescription: true } }
                  : node
              )
            )
          }
          style={{ cursor: "pointer", fontSize: "12px", color: "#f68a8aff", marginTop: "8px" }}
        >
          {data.description || "Double-click to add description"}
        </div>
      )}
    </div>
  );
}
