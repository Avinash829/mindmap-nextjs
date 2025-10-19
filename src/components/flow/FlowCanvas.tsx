"use client";

import { useState, useRef, useCallback } from "react";
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomNode from "@/components/nodes/CustomNode";
import Toolbar from "@/components/toolbar/Toolbar";
import QuickGuide from "@/components/guide/QuickGuide";
import PresentationMode from "@/components/presentation/PresentationMode";

import {
    CustomNode as MindNode,
    CustomEdge,
    CustomConnection,
} from "@/types/mindmap";

const nodeTypes = {
    customNode: CustomNode,
};

export default function FlowCanvas() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<MindNode>([
        {
            id: "1",
            type: "customNode",
            position: { x: 400, y: 200 },
            data: { label: "Central Idea", level: 0, description: "", color: undefined },
        },
    ]);

    const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
    const [nodeIdCounter, setNodeIdCounter] = useState<number>(2);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [showColorModal, setShowColorModal] = useState(false);
    const [selectedParentForColor, setSelectedParentForColor] = useState<string | null>(null);
    const [colorChoice, setColorChoice] = useState("#4f46e5");

    // Add edge 
    const onConnect = useCallback(
        (params: CustomConnection) =>
            setEdges((eds) =>
                addEdge(
                    {
                        id: nodeIdCounter.toString(),
                        ...params,
                        source: params.source ?? "",
                        target: params.target ?? "",
                        type: "smoothstep",
                        animated: false,
                        style: { stroke: "#9ca3af", strokeWidth: 1.5 },
                    },
                    eds
                )
            ),
        [setEdges, nodeIdCounter]
    );

   // Add child node with parent node color
const addChildNode = useCallback(
    (parentId?: string, color?: string) => {
        const parent = parentId ? nodes.find((n) => n.id === parentId) : null;
        const parentLevel = parent?.data.level ?? -1;
        const newLevel = parentLevel + 1;

        // node position
        let newPosition = { x: 400, y: 400 };
        if (parent) {
            const childrenCount = edges.filter((e) => e.source === parentId).length;
            const angle = childrenCount * 60 - 30;
            const distance = 150 + newLevel * 50;
            newPosition = {
                x: parent.position.x + Math.cos((angle * Math.PI) / 180) * distance,
                y: parent.position.y + Math.sin((angle * Math.PI) / 180) * distance,
            };
        }

        //child color
        const childColor = color ?? parent?.data.color ?? "#4f46e5";

        const newNodeId = nodeIdCounter.toString();
        const newNode: MindNode = {
            id: newNodeId,
            type: "customNode",
            position: newPosition,
            data: {
                label: `Node ${newNodeId}`,
                level: Math.min(newLevel, 3),
                isEditing: true,
                description: "",
                color: childColor,
            },
        };

        setNodes((nds) => nds.concat(newNode));
        setNodeIdCounter((prev) => prev + 1);

        if (parentId) {
            const newEdge: CustomEdge = {
                id: `e${parentId}-${newNodeId}`,
                source: parentId,
                target: newNodeId,
                type: "smoothstep",
                style: { stroke: childColor, strokeWidth: 1.5 },
            };
            setEdges((eds) => eds.concat(newEdge));
        }
    },
    [nodes, edges, nodeIdCounter, setNodes, setEdges]
);

// Add Child click
const handleAddChild = useCallback(
    (parentId?: string) => {
        if (!parentId) return;

        const parent = nodes.find((n) => n.id === parentId);
        if (!parent) return;

        // parent color copy to child
        if (parent.data.color) {
            addChildNode(parentId, parent.data.color);
        } else {
            // modal for color selection
            setSelectedParentForColor(parentId);
            setColorChoice("#4f46e5");
            setShowColorModal(true);
        }
    },
    [nodes, addChildNode]
);

// Add root node and ask for color
const handleAddNode = useCallback(() => {
    const newId = nodeIdCounter.toString();
    const newNode: MindNode = {
        id: newId,
        type: "customNode",
        position: { x: 400, y: 200 },
        data: { label: `Node ${newId}`, level: 0, description: "", color: undefined },
    };

    setNodes((nds) => nds.concat(newNode));
    setNodeIdCounter((prev) => prev + 1);

    setSelectedParentForColor(newId);
    setColorChoice("#4f46e5");
    setShowColorModal(true);
}, [nodeIdCounter, setNodes]);

const confirmColor = () => {
  if (!selectedParentForColor) return;

  const parentId = selectedParentForColor;
  const color = colorChoice;

  setNodes((nds) =>
    nds.map((n) =>
      n.id === parentId ? { ...n, data: { ...n.data, color } } : n
    )
  );

  setShowColorModal(false);
  setSelectedParentForColor(null);
};



    // Delete node
    const deleteNode = useCallback(
        (nodeId: string) => {
            if (nodeId === "1") return;
            setNodes((nds) => nds.filter((n) => n.id !== nodeId));
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
            setSelectedNodeId(null);
        },
        [setNodes, setEdges]
    );

    // Select node
    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: MindNode) => setSelectedNodeId(node.id),
        []
    );

    if (isPresentationMode) {
        return (
            <PresentationMode
                nodes={nodes}
                edges={edges}
                onClose={() => setIsPresentationMode(false)}
            />
        );
    }

    // Main Canvas
    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
            <Toolbar
                onAddNode={handleAddNode}
                onAddChild={() => selectedNodeId && handleAddChild(selectedNodeId)}
                onDeleteNode={() => selectedNodeId && deleteNode(selectedNodeId)}
                onAutoLayout={() => {}}
                onPresent={() => setIsPresentationMode(true)}
                onExport={() => {}}
                onImport={() => {}}
                fileInputRef={fileInputRef}
                selectedNodeId={selectedNodeId}
            />

            <QuickGuide />

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                style={{ background: "#fafafa" }}
            >
                <Controls style={{ bottom: "20px", left: "40px" }} />
                <MiniMap />
                <Background />
            </ReactFlow>

            {/* Color Picker Modal */}
            {showColorModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ marginBottom: "1rem" }}>Pick a color for this branch</h3>
                        <input
                            type="color"
                            value={colorChoice}
                            onChange={(e) => setColorChoice(e.target.value)}
                            style={{
                                width: "100%",
                                height: "50px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                            <button
                                onClick={() => setShowColorModal(false)}
                                style={{
                                    background: "transparent",
                                    border: "1px solid #d1d5db",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    marginRight: "0.5rem",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmColor}
                                style={{
                                    background: "#2563eb",
                                    color: "white",
                                    padding: "0.4rem 0.8rem",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Modal Styles
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
    width: "28%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};
