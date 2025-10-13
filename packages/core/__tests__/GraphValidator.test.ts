/**
 * GraphValidator tests
 */

import { Graph } from '../src/graph/Graph';
import { GraphValidator } from '../src/graph/GraphValidator';

describe('GraphValidator', () => {
  describe('validate', () => {
    it('should reject empty graph', () => {
      const graph = new Graph();
      
      const result = GraphValidator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('EMPTY_GRAPH');
    });

    it('should accept valid graph', () => {
      const graph = new Graph({
        nodes: [
          { id: 'node1', type: 'input', data: {} },
          { id: 'node2', type: 'output', data: {} },
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
        ],
      });
      
      const result = GraphValidator.validate(graph);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect cycles', () => {
      const graph = new Graph({
        nodes: [
          { id: 'node1', type: 'input', data: {} },
          { id: 'node2', type: 'output', data: {} },
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
          { id: 'edge2', source: 'node2', target: 'node1' }, // Cycle
        ],
      });
      
      const result = GraphValidator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'CYCLE_DETECTED')).toBe(true);
    });

    it('should detect invalid edges', () => {
      const graph = new Graph({
        nodes: [{ id: 'node1', type: 'input', data: {} }],
        edges: [{ id: 'edge1', source: 'node1', target: 'invalid' }],
      });
      
      const result = GraphValidator.validate(graph);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_EDGE_TARGET')).toBe(true);
    });

    it('should warn about disconnected nodes', () => {
      const graph = new Graph({
        nodes: [
          { id: 'node1', type: 'input', data: {} },
          { id: 'node2', type: 'output', data: {} },
          { id: 'node3', type: 'isolated', data: {} },
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
        ],
      });
      
      const result = GraphValidator.validate(graph);
      
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'DISCONNECTED_NODE')).toBe(true);
    });
  });

  describe('getTopologicalOrder', () => {
    it('should return correct order for linear graph', () => {
      const graph = new Graph({
        nodes: [
          { id: 'node1', type: 'input', data: {} },
          { id: 'node2', type: 'transform', data: {} },
          { id: 'node3', type: 'output', data: {} },
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
          { id: 'edge2', source: 'node2', target: 'node3' },
        ],
      });
      
      const order = GraphValidator.getTopologicalOrder(graph);
      
      expect(order).toEqual(['node1', 'node2', 'node3']);
    });

    it('should return null for graph with cycles', () => {
      const graph = new Graph({
        nodes: [
          { id: 'node1', type: 'input', data: {} },
          { id: 'node2', type: 'output', data: {} },
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
          { id: 'edge2', source: 'node2', target: 'node1' },
        ],
      });
      
      const order = GraphValidator.getTopologicalOrder(graph);
      
      expect(order).toBeNull();
    });

    it('should handle parallel branches', () => {
      const graph = new Graph({
        nodes: [
          { id: 'node1', type: 'input', data: {} },
          { id: 'node2', type: 'branch1', data: {} },
          { id: 'node3', type: 'branch2', data: {} },
          { id: 'node4', type: 'output', data: {} },
        ],
        edges: [
          { id: 'edge1', source: 'node1', target: 'node2' },
          { id: 'edge2', source: 'node1', target: 'node3' },
          { id: 'edge3', source: 'node2', target: 'node4' },
          { id: 'edge4', source: 'node3', target: 'node4' },
        ],
      });
      
      const order = GraphValidator.getTopologicalOrder(graph);
      
      expect(order).not.toBeNull();
      expect(order).toHaveLength(4);
      expect(order![0]).toBe('node1'); // First
      expect(order![3]).toBe('node4'); // Last
    });
  });
});

