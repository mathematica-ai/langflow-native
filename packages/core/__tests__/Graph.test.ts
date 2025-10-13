/**
 * Graph tests
 */

import { Graph } from '../src/graph/Graph';
import { Node, Edge } from '../src/types';

describe('Graph', () => {
  describe('constructor', () => {
    it('should create an empty graph', () => {
      const graph = new Graph();
      
      expect(graph.nodes).toEqual([]);
      expect(graph.edges).toEqual([]);
      expect(graph.name).toBe('Untitled Flow');
    });

    it('should create a graph with nodes and edges', () => {
      const nodes: Node[] = [
        { id: 'node1', type: 'input', data: {} },
        { id: 'node2', type: 'output', data: {} },
      ];
      
      const edges: Edge[] = [
        { id: 'edge1', source: 'node1', target: 'node2' },
      ];

      const graph = new Graph({ name: 'Test Flow', nodes, edges });
      
      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(1);
      expect(graph.name).toBe('Test Flow');
    });
  });

  describe('node operations', () => {
    let graph: Graph;

    beforeEach(() => {
      graph = new Graph();
    });

    it('should add a node', () => {
      const node: Node = { id: 'node1', type: 'input', data: {} };
      
      graph.addNode(node);
      
      expect(graph.nodes).toHaveLength(1);
      expect(graph.getNode('node1')).toEqual(node);
    });

    it('should throw error when adding duplicate node', () => {
      const node: Node = { id: 'node1', type: 'input', data: {} };
      
      graph.addNode(node);
      
      expect(() => graph.addNode(node)).toThrow('already exists');
    });

    it('should remove a node', () => {
      const node: Node = { id: 'node1', type: 'input', data: {} };
      graph.addNode(node);
      
      graph.removeNode('node1');
      
      expect(graph.nodes).toHaveLength(0);
    });

    it('should update a node', () => {
      const node: Node = { id: 'node1', type: 'input', data: { value: 1 } };
      graph.addNode(node);
      
      graph.updateNode('node1', { data: { value: 2 } });
      
      const updated = graph.getNode('node1');
      expect(updated?.data.value).toBe(2);
    });
  });

  describe('edge operations', () => {
    let graph: Graph;

    beforeEach(() => {
      graph = new Graph();
      graph.addNode({ id: 'node1', type: 'input', data: {} });
      graph.addNode({ id: 'node2', type: 'output', data: {} });
    });

    it('should add an edge', () => {
      const edge: Edge = { id: 'edge1', source: 'node1', target: 'node2' };
      
      graph.addEdge(edge);
      
      expect(graph.edges).toHaveLength(1);
    });

    it('should throw error when adding edge with invalid nodes', () => {
      const edge: Edge = { id: 'edge1', source: 'invalid', target: 'node2' };
      
      expect(() => graph.addEdge(edge)).toThrow('not found');
    });

    it('should get incoming edges', () => {
      graph.addEdge({ id: 'edge1', source: 'node1', target: 'node2' });
      
      const incoming = graph.getIncomingEdges('node2');
      
      expect(incoming).toHaveLength(1);
      expect(incoming[0].source).toBe('node1');
    });

    it('should get outgoing edges', () => {
      graph.addEdge({ id: 'edge1', source: 'node1', target: 'node2' });
      
      const outgoing = graph.getOutgoingEdges('node1');
      
      expect(outgoing).toHaveLength(1);
      expect(outgoing[0].target).toBe('node2');
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      const graph = new Graph({
        name: 'Test',
        nodes: [{ id: 'node1', type: 'input', data: {} }],
      });

      const json = graph.toJSON();
      
      expect(json.name).toBe('Test');
      expect(json.nodes).toHaveLength(1);
    });

    it('should deserialize from JSON', () => {
      const json = {
        id: 'test-id',
        name: 'Test',
        nodes: [{ id: 'node1', type: 'input', data: {} }],
        edges: [],
      };

      const graph = Graph.fromJSON(json);
      
      expect(graph.name).toBe('Test');
      expect(graph.nodes).toHaveLength(1);
    });
  });

  describe('clone', () => {
    it('should create a deep copy', () => {
      const original = new Graph({
        name: 'Original',
        nodes: [{ id: 'node1', type: 'input', data: {} }],
      });

      const clone = original.clone();
      
      expect(clone.id).not.toBe(original.id);
      expect(clone.name).toBe(original.name);
      expect(clone.nodes).toHaveLength(1);
    });
  });
});

