/**
 * Graph class - represents a workflow structure
 */

import { Graph as GraphType, Node, Edge, FlowId, NodeId, EdgeId } from '../types';

export class Graph {
  private _id: FlowId;
  private _name: string;
  private _description?: string;
  private _nodes: Map<NodeId, Node>;
  private _edges: Map<EdgeId, Edge>;
  private _variables: Map<string, any>;
  private _metadata: Record<string, any>;
  private _version: string;
  private _createdAt: number;
  private _updatedAt: number;

  constructor(config: Partial<GraphType> = {}) {
    this._id = config.id || this.generateId();
    this._name = config.name || 'Untitled Flow';
    this._description = config.description;
    this._nodes = new Map((config.nodes || []).map((n) => [n.id, n]));
    this._edges = new Map((config.edges || []).map((e) => [e.id, e]));
    this._variables = new Map(Object.entries(config.variables || {}));
    this._metadata = config.metadata || {};
    this._version = config.version || '1.0.0';
    this._createdAt = config.createdAt || Date.now();
    this._updatedAt = config.updatedAt || Date.now();
  }

  private generateId(): string {
    return `flow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Getters
  get id(): FlowId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get nodes(): Node[] {
    return Array.from(this._nodes.values());
  }

  get edges(): Edge[] {
    return Array.from(this._edges.values());
  }

  get variables(): Record<string, any> {
    return Object.fromEntries(this._variables);
  }

  get metadata(): Record<string, any> {
    return this._metadata;
  }

  get version(): string {
    return this._version;
  }

  // Node operations
  addNode(node: Node): void {
    if (this._nodes.has(node.id)) {
      throw new Error(`Node with id ${node.id} already exists`);
    }
    this._nodes.set(node.id, node);
    this._updatedAt = Date.now();
  }

  removeNode(nodeId: NodeId): void {
    if (!this._nodes.has(nodeId)) {
      throw new Error(`Node with id ${nodeId} not found`);
    }
    
    // Remove associated edges
    const edgesToRemove = this.edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    );
    edgesToRemove.forEach((e) => this._edges.delete(e.id));
    
    this._nodes.delete(nodeId);
    this._updatedAt = Date.now();
  }

  getNode(nodeId: NodeId): Node | undefined {
    return this._nodes.get(nodeId);
  }

  updateNode(nodeId: NodeId, updates: Partial<Node>): void {
    const node = this._nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }
    
    const updatedNode = { ...node, ...updates, id: nodeId };
    this._nodes.set(nodeId, updatedNode);
    this._updatedAt = Date.now();
  }

  // Edge operations
  addEdge(edge: Edge): void {
    if (this._edges.has(edge.id)) {
      throw new Error(`Edge with id ${edge.id} already exists`);
    }
    
    // Validate source and target nodes exist
    if (!this._nodes.has(edge.source)) {
      throw new Error(`Source node ${edge.source} not found`);
    }
    if (!this._nodes.has(edge.target)) {
      throw new Error(`Target node ${edge.target} not found`);
    }
    
    this._edges.set(edge.id, edge);
    this._updatedAt = Date.now();
  }

  removeEdge(edgeId: EdgeId): void {
    if (!this._edges.has(edgeId)) {
      throw new Error(`Edge with id ${edgeId} not found`);
    }
    this._edges.delete(edgeId);
    this._updatedAt = Date.now();
  }

  getEdge(edgeId: EdgeId): Edge | undefined {
    return this._edges.get(edgeId);
  }

  // Variable operations
  setVariable(key: string, value: any): void {
    this._variables.set(key, value);
    this._updatedAt = Date.now();
  }

  getVariable(key: string): any {
    return this._variables.get(key);
  }

  // Graph queries
  getIncomingEdges(nodeId: NodeId): Edge[] {
    return this.edges.filter((e) => e.target === nodeId);
  }

  getOutgoingEdges(nodeId: NodeId): Edge[] {
    return this.edges.filter((e) => e.source === nodeId);
  }

  getConnectedNodes(nodeId: NodeId): { sources: Node[]; targets: Node[] } {
    const incomingEdges = this.getIncomingEdges(nodeId);
    const outgoingEdges = this.getOutgoingEdges(nodeId);
    
    return {
      sources: incomingEdges
        .map((e) => this._nodes.get(e.source))
        .filter((n): n is Node => n !== undefined),
      targets: outgoingEdges
        .map((e) => this._nodes.get(e.target))
        .filter((n): n is Node => n !== undefined),
    };
  }

  // Serialization
  toJSON(): GraphType {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      nodes: this.nodes,
      edges: this.edges,
      variables: this.variables,
      metadata: this._metadata,
      version: this._version,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static fromJSON(json: GraphType): Graph {
    return new Graph(json);
  }

  clone(): Graph {
    return Graph.fromJSON(this.toJSON());
  }
}

