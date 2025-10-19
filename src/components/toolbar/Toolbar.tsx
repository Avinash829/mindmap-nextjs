"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Layout,
  Play,
  Upload,
  Download,
  ChevronDown,
  X,
} from "lucide-react";
import { ToolbarProps } from "@/types/mindmap";

export default function Toolbar({
  onAddNode,
  onAddChild,
  onDeleteNode,
  onAutoLayout,
  onPresent,
  onExport,
  onImport,
  fileInputRef,
  selectedNodeId,
}: ToolbarProps) {
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveLink, setDriveLink] = useState("");

  const handleDownload = async (format: "json" | "txt" | "pdf") => {
    if (!onExport) return;
    const data = onExport();
    const content = JSON.stringify(data, null, 2);

    if (format === "pdf") {
      try {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.text(content, 10, 10);
        doc.save("mindmap.pdf");
      } catch {
        alert("PDF export not available.");
      }
    } else {
      const blob = new Blob([content], {
        type: format === "json" ? "application/json" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindmap.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowFormatDropdown(false);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onImport) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result) return;
      try {
        const parsed = JSON.parse(result as string);
        onImport(parsed);
      } catch {
        alert("Failed to read file. Ensure it's a valid JSON mindmap.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportURL = async () => {
    if (!driveLink.trim()) {
      alert("Please enter a valid Drive link");
      return;
    }
    try {
      const fileIdMatch = driveLink.match(/[-\w]{25,}/);
      if (!fileIdMatch) throw new Error("Invalid Drive link");
      const fileId = fileIdMatch[0];
      const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");
      const json = await response.json();
      onImport?.(json);
      setShowDriveModal(false);
      setDriveLink("");
    } catch {
      alert("Failed to import from URL. Ensure it's a valid public JSON file.");
    }
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          display: "flex",
          gap: "0.5rem",
          zIndex: 1000,
        }}
      >
        <button onClick={onAddNode} style={buttonStyle} title="Add root node">
          <Plus size={16} />
        </button>

        <button
          onClick={onAddChild}
          disabled={!selectedNodeId}
          style={{
            ...buttonStyle,
            opacity: selectedNodeId ? 1 : 0.5,
            cursor: selectedNodeId ? "pointer" : "not-allowed",
          }}
          title="Add child node"
        >
          <Plus size={14} />
        </button>

        <button
          onClick={onDeleteNode}
          disabled={!selectedNodeId || selectedNodeId === "1"}
          style={{
            ...buttonStyle,
            opacity: selectedNodeId && selectedNodeId !== "1" ? 1 : 0.5,
            cursor:
              selectedNodeId && selectedNodeId !== "1"
                ? "pointer"
                : "not-allowed",
          }}
          title="Delete node"
        >
          <Trash2 size={16} />
        </button>

        <button onClick={onAutoLayout} style={buttonStyle} title="Auto Layout">
          <Layout size={16} />
        </button>

        <button onClick={onPresent} style={buttonStyle} title="Presentation Mode">
          <Play size={16} />
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowFormatDropdown(!showFormatDropdown)}
            style={buttonStyle}
            title="Export Mindmap"
          >
            <Download size={16} />
            <ChevronDown size={14} style={{ marginLeft: "0.2rem" }} />
          </button>
          {showFormatDropdown && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                zIndex: 1000,
              }}
            >
              {(["json", "txt", "pdf"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleDownload(fmt)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "white",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={buttonStyle}
          title="Import Mindmap"
        >
          <Upload size={16} />
        </button>
        <button
          onClick={() => setShowDriveModal(true)}
          style={{ ...buttonStyle, padding: "0.3rem 0.5rem" }}
          title="Import from Drive"
        >
          Upload from Drive
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          style={{ display: "none" }}
        />
      </div>

      {showDriveModal && (
        <div
          style={modalOverlayStyle}
          onClick={() => setShowDriveModal(false)}
        >
          <div
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>Import from Google Drive</h3>
              <button
                onClick={() => setShowDriveModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder=" Paste your public Google Drive JSON file link here"
              style={inputStyle}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1rem",
              }}
            >
              <button
                onClick={handleImportURL}
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease-in-out",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#3b82f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#2563eb")
                }
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "6px",
  background: "white",
  border: "1px solid #d1d5db",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "8px",
  padding: "2rem",
  width: "30%",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  marginTop: "0.5rem",
};
