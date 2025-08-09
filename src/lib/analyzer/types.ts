/**
 * Dependency matrix with request relationships
 */
export interface DependencyMatrix {
  /** NxN matrix where [i][j]=1 means request i depends on request j */
  adjacencyMatrix: number[][];
  
  /** Indices of requests forming the critical path */
  criticalPath: number[];
  
  /** Indices of redundant requests that can be removed */
  redundantIndices: number[];
  
  /** Dependency depth for each request */
  depths: number[];
  
  /** Topologically sorted request indices */
  topologicalOrder: number[];
}
