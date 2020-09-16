import { updateIn, getInChildren, exit } from "../utils";
import qs from "../quick-styler";
import { partition, map } from "lodash";

const parseProps = propFrags => {
  return propFrags.reduce((style, frag) => {
    const [prop, value] = frag.split("=");
    if (value.length > 0) {
      return { ...style, [prop]: value.replace(/'/g, "") };
    } else {
      return style;
    }
  }, {});
};

const quickstyle = (prevState, propProgram) => {
  const { node } = prevState;
  const styles = qs(node.styles, propProgram).styleProps;
  return { ...prevState, node: { ...node, styles } };
};

const hasEquals = str => str.includes("=");
const style = (prevState, ...styleArguments) => {
  const { tree, selector } = prevState;

  const node = getInChildren(tree, selector);
  let newProps = node.props;
  styleArguments.forEach(arg => {
    let mergeProps;

    if (arg.includes("=")) {
      mergeProps = parseProps([arg]);
    } else {
      mergeProps = qs(newProps, arg);
    }

    newProps = { ...newProps, ...mergeProps };
  });

  const update = { ...node, props: newProps };
  const newTree = updateIn(tree, selector, update);

  return {
    ...prevState,
    tree: newTree
  };
};

export default style;
