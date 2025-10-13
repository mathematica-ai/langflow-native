/**
 * Graph validation logic
 */

import { Graph } from './Graph';
import { ValidationResult, ValidationError, ValidationWarning, NodeId } from '../types';

export class GraphValidator {
  /**
   * Validate a graph for structural integrity and execution readiness
   */
  static validate(graph: Graph): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for empty graph
    if (graph.nodes.length === 0) {
      errors.push({
        message: 'Graph must contain at least one node',
        code: 'EMPTY_GRAPH',
      });
      return { valid: false, errors, warnings };
    }

    // Check for cycles (would cause infinite execution)
    const cycleNodes = this.detectCycles(graph);
    if (cycleNodes.length > 0) {
      errors.push({
        message: `Graph contains cycles involving nodes: ${cycleNodes.join(', ')}`,
        code: 'CYCLE_DETECTED',
      });
    }

    // Check for disconnected nodes
    const disconnectedNodes = this.findDisconnectedNodes(graph);
    disconnectedNodes.forEach((nodeId) => {
      warnings.push({
        nodeId,
        message: `Node ${nodeId} is not connected to any other nodes`,
        code: 'DISCONNECTED_NODE',
      });
    });

    // Check for missing node types
    graph.nodes.forEach((node) => {
      if (!node.type || node.type.trim() === '') {
        errors.push({
          nodeId: node.id,
          message: `Node ${node.id} is missing a type`,
          code: 'MISSING_NODE_TYPE',
        });
      }
    });

    // Check for duplicate node IDs (should not happen but good to check)
    const nodeIds = new Set<string>();
    graph.nodes.forEach((node) => {
      if (nodeIds.has(node.id)) {
        errors.push({
          nodeId: node.id,
          message: `Duplicate node ID: ${node.id}`,
          code: 'DUPLICATE_NODE_ID',
        });
      }
      nodeIds.add(node.id);
    });

    // Check for invalid edges
    graph.edges.forEach((edge) => {
      const sourceNode = graph.getNode(edge.source);
      const targetNode = graph.getNode(edge.target);

      if (!sourceNode) {
        errors.push({
          edgeId: edge.id,
          message: `Edge ${edge.id} references non-existent source node: ${edge.source}`,
          code: 'INVALID_EDGE_SOURCE',
        });
      }

      if (!targetNode) {
        errors.push({
          edgeId: edge.id,
          message: `Edge ${edge.id} references non-existent target node: ${edge.target}`,
          code: 'INVALID_EDGE_TARGET',
        });
      }

      if (edge.source === edge.target) {
        errors.push({
          edgeId: edge.id,
          message: `Edge ${edge.id} connects a node to itself`,
          code: 'SELF_LOOP',
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Detect cycles in the graph using DFS
   */
  private static detectCycles(graph: Graph): NodeId[] {
    const visited = new Set<NodeId>();
    const recursionStack = new Set<NodeId>();
    const cycleNodes: NodeId[] = [];

    const dfs = (nodeId: NodeId): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = graph.getOutgoingEdges(nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (dfs(edge.target)) {
            cycleNodes.push(nodeId);
            return true;
          }
        } else if (recursionStack.has(edge.target)) {
          cycleNodes.push(nodeId, edge.target);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return Array.from(new Set(cycleNodes));
  }

  /**
   * Find nodes with no incoming or outgoing edges
   */
  private static findDisconnectedNodes(graph: Graph): NodeId[] {
    if (graph.nodes.length <= 1) {
      return [];
    }

    return graph.nodes
      .filter((node) => {
        const incoming = graph.getIncomingEdges(node.id);
        const outgoing = graph.getOutgoingEdges(node.id);
        return incoming.length === 0 && outgoing.length === 0;
      })
      .map((node) => node.id);
  }

  /**
   * Get the topological order of nodes for execution
   * Returns null if graph has cycles
   */
  static getTopologicalOrder(graph: Graph): NodeId[] | null {
    const inDegree = new Map<NodeId, number>();
    const adjList = new Map<NodeId, NodeId[]>();

    // Initialize
    graph.nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    // Build adjacency list and in-degree map
    graph.edges.forEach((edge) => {
      adjList.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Kahn's algorithm
    const queue: NodeId[] = [];
    const result: NodeId[] = [];

    // Add all nodes with no incoming edges
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = adjList.get(current) || [];
      neighbors.forEach((neighbor) => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    // If result doesn't contain all nodes, there's a cycle
    return result.length === graph.nodes.length ? result : null;
  }
}

