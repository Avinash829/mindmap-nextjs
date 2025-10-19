export interface CustomNodeData {
  label: string;
  level: number;
  description?: string;
  isEditing?: boolean;
  isEditingDescription?: boolean;
  [key: string]: unknown;
}

export interface CustomNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
        label: string;
        level: number;
        description?: string;
        color?: string; 
        isEditing?: boolean;
        isEditingDescription?: boolean;
    };
}

export interface CustomEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  style?: { stroke: string; strokeWidth: number };
  animated?: boolean;
}

export interface CustomConnection {
  source: string | null;
  target: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
}

export interface CustomNodeProps {
  data: CustomNodeData;
  id: string;
}

export interface SlideData {
  type: string;
  title: string;
  description?: string;
  children?: string[];
}

export interface PresentationModeProps {
  nodes: CustomNode[];
  edges: CustomEdge[];
  onClose: () => void;
}

export interface ToolbarProps {
  onAddNode: () => void;
  onAddChild: () => void;
  onDeleteNode: () => void;
  onAutoLayout: () => void;
  onPresent: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedNodeId: string | null;
}

