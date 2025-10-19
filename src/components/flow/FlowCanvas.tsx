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
    Connection
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomNode from "@/components/nodes/CustomNode";
import Toolbar from "@/components/toolbar/Toolbar";
import QuickGuide from "@/components/guide/QuickGuide";
import PresentationMode from "@/components/presentation/PresentationMode";

import {
    CustomNode as MindNode,
    CustomEdge,
} from "@/types/mindmap";

const nodeTypes = { customNode: CustomNode };

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
    const [nodeIdCounter, setNodeIdCounter] = useState(2);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [showColorModal, setShowColorModal] = useState(false);
    const [selectedParentForColor, setSelectedParentForColor] = useState<string | null>(null);
    const [colorChoice, setColorChoice] = useState("#4f46e5");

   const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return;

            const alreadyExists = edges.some(
                e => e.source === connection.source && e.target === connection.target
            );
            if (alreadyExists) return;

            const parentNode = nodes.find(n => n.id === connection.source);
            const parentColor = parentNode?.data.color ?? "#9ca3af";

            const edgeId = `e${connection.source}-${connection.target}`;
            const newEdge: CustomEdge = {
                ...connection,
                id: edgeId,
                type: "smoothstep",
                animated: true,
                style: { stroke: parentColor, strokeWidth: 2 },
            };

            setEdges(eds => addEdge(newEdge, eds));

           setNodes(nds =>
                nds.map(n =>
                    n.id === connection.target && !n.data.color
                        ? { ...n, data: { ...n.data, color: parentColor } }
                        : n
                )
            );
        },
        [edges, nodes, setEdges, setNodes]
    );

    
    const addChildNode = useCallback(
        (parentId: string, color?: string) => {
            const parent = nodes.find(n => n.id === parentId);
            if (!parent) return;

            const newNodeId = nodeIdCounter.toString();
            const newLevel = (parent.data.level ?? 0) + 1;
            const childColor = color ?? parent.data.color ?? "#4f46e5";

            const siblings = edges.filter(e => e.source === parentId);
            const angleStep = 360 / Math.max(siblings.length + 1, 6);
            const angle = siblings.length * angleStep;
            const radius = 150 + newLevel * 50;

            const newNode: MindNode = {
                id: newNodeId,
                type: "customNode",
                position: {
                    x: parent.position.x + Math.cos((angle * Math.PI) / 180) * radius,
                    y: parent.position.y + Math.sin((angle * Math.PI) / 180) * radius,
                },
                data: {
                    label: `Node ${newNodeId}`,
                    level: Math.min(newLevel, 3),
                    isEditing: true,
                    description: "",
                    color: childColor,
                },
            };

            setNodes(nds => [...nds, newNode]);
            setNodeIdCounter(prev => prev + 1);

        
            const newEdge: CustomEdge = {
                id: `e${parentId}-${newNodeId}`,
                source: parentId,
                target: newNodeId,
                type: "smoothstep",
                animated: true,
                style: { stroke: childColor, strokeWidth: 2 },
            };
            setEdges(eds => [...eds, newEdge]);

            
            setSelectedNodeId(newNodeId);
        },
        [nodes, edges, nodeIdCounter, setNodes, setEdges]
    );



    const handleAddChild = useCallback(
        (parentId?: string) => {
            if (!parentId) return;

            const parent = nodes.find(n => n.id === parentId);
            if (!parent) return;

            if (parent.data.color) {
                addChildNode(parentId);
            } else {
                setSelectedParentForColor(parentId);
                setColorChoice("#4f46e5");
                setShowColorModal(true);
            }
        },
        [nodes, addChildNode]
    );



    const handleAddNode = useCallback(() => {
        const newId = nodeIdCounter.toString();
        const rootNodes = nodes.filter(n => n.data.level === 0);
        const spacing = 250;
        const xPos = 400 + rootNodes.length * spacing;
        const yPos = 200;

        const newNode: MindNode = {
            id: newId,
            type: "customNode",
            position: { x: xPos, y: yPos },
            data: { label: `Node ${newId}`, level: 0, description: "", color: undefined },
        };

        setNodes(nds => [...nds, newNode]);
        setNodeIdCounter(prev => prev + 1);

        setSelectedParentForColor(newId);
        setColorChoice("#4f46e5");
        setShowColorModal(true);
    }, [nodeIdCounter, nodes, setNodes]);


    const confirmColor = () => {
        if (!selectedParentForColor) return;
        const parentId = selectedParentForColor;

        setNodes(nds =>
            nds.map(n =>
                n.id === parentId ? { ...n, data: { ...n.data, color: colorChoice } } : n
            )
        );

        setShowColorModal(false);
        setSelectedParentForColor(null);
    };

  
    const deleteNode = useCallback(
        (nodeId: string) => {
            if (nodeId === "1") return;
            setNodes(nds => nds.filter(n => n.id !== nodeId));
            setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
            setSelectedNodeId(null);
        },
        [setNodes, setEdges]
    );

    
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

    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
            <Toolbar
                onAddNode={handleAddNode}
                onAddChild={() => selectedNodeId && handleAddChild(selectedNodeId)}
                onDeleteNode={() => selectedNodeId && deleteNode(selectedNodeId)}
                onAutoLayout={() => {}}
                onPresent={() => setIsPresentationMode(true)}
                onExport={() => ({ nodes, edges })}
                onImport={(data) => {
                    setNodes(data.nodes);
                    setEdges(data.edges);
                }}
                fileInputRef={fileInputRef}
                selectedNodeId={selectedNodeId}
            />

            <QuickGuide />

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onConnect={onConnect}   // ✅ now fully working
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
                                cursor: "pointer"
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
                                    cursor: "pointer"
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
                                    cursor: "pointer"
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
