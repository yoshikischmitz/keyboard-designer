import qs from "./quick-styler";
import { updateIn, getInChildren, exit } from "./utils";

const node = (component, props = {}, ...children) => ({
  component,
  props,
  children: children || []
});

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

const validNodes = ["Box", "Text"];

const wrap = (prevState, wrapperNode) => {
  if (!validNodes.includes(wrapperNode)) {
    return { ...prevState, error: `Unkonwn element type ${wrapperNode}` };
  }

  const { tree, selector } = prevState;
  const wrapped = {
    component: wrapperNode,
    children: [getInChildren(tree, selector)]
  };

  const newTree = updateIn(tree, selector, wrapped);

  return {
    ...prevState,
    tree: newTree
  };
};

const insert = (prevState, wrapperNode) => {
  console.log(wrapperNode);
  if (!validNodes.includes(wrapperNode)) {
    return { ...prevState, error: `Unkonwn element type ${wrapperNode}` };
  }

  const insertNode = node(wrapperNode);
  const { tree, selector } = prevState;

  const parent = getInChildren(tree, selector);
  const updated = { ...parent, children: [insertNode, ...parent.children] };

  const newTree = updateIn(tree, selector, updated);
  console.log(JSON.stringify(newTree, null, 2));

  return {
    ...prevState,
    tree: newTree,
    selector: [...selector, 0]
  };
};

const style = (prevState, ...propFrags) => {
  const { tree, selector } = prevState;
  const newProps = parseProps(propFrags);
  const node = getInChildren(tree, selector);
  const update = { ...node, props: { ...node.props, ...newProps } };
  const newTree = updateIn(tree, selector, update);

  return {
    ...prevState,
    tree: newTree
  };
};

const quickstyle = (prevState, propProgram) => {
  const { node } = prevState;
  const styles = qs(node.styles, propProgram).styleProps;
  return { ...prevState, node: { ...node, styles } };
};

const findInTree = (tree, properties) => {
  let results = [];
  if (tree.styles) {
    const found = Object.keys(properties).find(
      prop => tree.styles[prop] === properties[prop]
    );
    found && results.push(tree);
  }
  if (tree.children) {
    tree.children.map(child => {
      results = [...results, ...findInTree(child, properties)];
    });
  }
  return results;
};

const find = (prevState, ...properties) => {
  const { node } = prevState;
  return prevState;
};

const commandMap = [
  [["qs", "q", "quickstyle"], quickstyle],
  [["wrap", "w"], wrap],
  [["style", "s"], style],
  [["find"], find],
  [["i", "insert"], insert]
];

const findCommand = commandName => {
  for (const pairs of commandMap) {
    const [abbreviations, command] = pairs;
    if (abbreviations.includes(commandName)) {
      return command;
    }
  }
};

export const run = (state, steps) => {
  try {
    return steps.reduce((prevState, [commandName, ...args]) => {
      const fn = findCommand(commandName);
      console.log(commandName, fn);
      if (!fn) {
        throw { ...prevState, error: "command unknown" };
      }
      try {
        const next = fn(prevState, ...args);
        console.log(JSON.stringify(next, null, 2));
        return next;
      } catch (error) {
        throw {
          ...prevState,
          error
        };
      }
    }, state);
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

export const tokenize = command =>
  command.split("|").map(cmd => cmd.split(" ").filter(word => word !== ""));
