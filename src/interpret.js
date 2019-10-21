import qs from "./quick-styler";
import { updateIn } from "./utils";

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
    return prevState;
  }
  return {
    ...prevState,
    node: {
      component: wrapperNode,
      styles: {},
      children: [prevState.node]
    }
  };
};

const style = (prevState, ...propFrags) => {
  const { tree, selector } = prevState;
  const newProps = parseProps(propFrags);
  const newTree = updateIn(tree, [...selector, "props"], newProps);

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
  [["find"], find]
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
      if (!fn) {
        throw { ...prevState, error: "command unknown" };
      }
      try {
        const next = fn(prevState, ...args);
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
