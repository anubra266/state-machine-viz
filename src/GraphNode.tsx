import { StateNodeViz } from './components/StateNodeViz';
import { StateElkNode } from './components/graphUtils';

export const GraphNode: React.FC<{ elkNode: StateElkNode }> = ({ elkNode }) => {
  return <StateNodeViz stateNode={elkNode.node.data} node={elkNode.node} />;
};
