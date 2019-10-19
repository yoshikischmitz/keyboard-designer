import qs from "./quick-styler";

const parseProps = propFrags => {
  return propFrags.reduce((style, frag) => {
    const [prop, value] = frag.split("=");
    return { ...style, [prop]: value.replace(/'/g, "") };
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
  const { node } = prevState;
  return {
    ...prevState,
    node: { ...node, styles: { ...node.styles, ...parseProps(propFrags) } }
  };
};

const quickstyle = (prevState, propProgram) => {
  const { node } = prevState;
  const styles = qs(node.styles, propProgram).styleProps;
  return { ...prevState, node: { ...node, styles } };
};

const commandMap = [
  [["qs", "q", "quickstyle"], quickstyle],
  [["wrap", "w"], wrap],
  [["style", "s"], style]
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
    return steps.reduce((input, [commandName, ...args]) => {
      const fn = findCommand(commandName);
      if (!fn) {
        throw { tree: input, error: "command unknown" };
      }
      try {
        const next = fn(input, ...args);
        return next;
      } catch (error) {
        throw {
          tree: input,
          error
        };
      }
    }, state);
  } catch (error) {
    console.log("error", error.error);
    return { ...error.tree, error: error.error };
  }
};

export const tokenize = command =>
  command.split("|").map(cmd => cmd.split(" ").filter(word => word !== ""));
