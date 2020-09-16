import { updateIn, getInChildren, exit } from "./utils";
import style from "./commands/style";

const node = (component, props = {}, ...children) => ({
  component,
  props: { ...props, p: 2 },
  children: children || []
});

const validNodes = ["Box", "Text"];

const wrap = (prevState, wrapperNode) => {
  if (!validNodes.includes(wrapperNode)) {
    return { ...prevState, error: `Unkonwn element type ${wrapperNode}` };
  }

  const { tree, selector } = prevState;
  const wrapped = node(wrapperNode, {}, getInChildren(tree, selector));

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

const xpend = (prevState, wrapperNode, offset) => {
  if (!validNodes.includes(wrapperNode)) {
    return { ...prevState, error: `Unkonwn element type ${wrapperNode}` };
  }
  const { tree, selector } = prevState;
  const parentSelector = selector.slice(0, selector.length - 1);

  const newNode = node(wrapperNode);

  const oldParent = getInChildren(tree, parentSelector);
  const index = selector[selector.length - 1] + offset;
  const newParent = {
    ...oldParent,
    children: [
      ...oldParent.children.slice(0, index),
      newNode,
      ...oldParent.children.slice(index)
    ]
  };

  const newTree = updateIn(tree, parentSelector, newParent);
  return {
    ...prevState,
    tree: newTree,
    selector: [...parentSelector, index]
  };
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
  [["wrap", "w"], wrap],
  [["style", "s"], style],
  [["find"], find],
  [["i", "insert"], insert],
  [["o", "append"], (...params) => xpend(...params, 1)],
  [["O", "prepend"], (...params) => xpend(...params, 0)]
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
