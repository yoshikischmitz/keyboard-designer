import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "rebass";
import { Input } from "@rebass/forms";
import Document from "./Document";
import { run, tokenize } from "./interpret";
import theme from "./theme";
import { ThemeProvider } from "theme-ui";
import { getInChildren, enter, exit } from "./utils";

const Icon = ({ char, focused, label }) => (
  <Box
    width={36}
    height={36}
    display="flex"
    alignItems="center"
    justifyContent="center"
    flexDirection="column"
    sx={{
      border: "1px solid black",
      marginLeft: "-1px"
    }}
    bg={focused && "black"}
    color={focused && "white"}
  >
    <Text fontWeight="500" mt="1px">
      {char}
    </Text>
    <Text fontSize="8px" mt={-1}>
      {label}
    </Text>
  </Box>
);

const menuChars = ["w", "s", "q", "f", "i", "o", "O", "e", "a"];
const menuIcons = { a: "aA" };
const menuLabels = {
  w: "wrap",
  s: "style",
  q: "qs",
  f: "find",
  i: "insert",
  o: "after",
  O: "before",
  e: "edit",
  a: "add",
  "/": "cmd"
};

const Menu = ({ children }) => (
  <Box mb="-1px" width={36 * menuChars.length}>
    {children}
  </Box>
);

const node = (component, props, ...children) => ({
  component,
  props,
  children: children || []
});

const App = () => {
  const commandRef = useRef();
  const [command, setCommand] = useState();
  const [args, setArgs] = useState("");
  commandRef.current = command;
  const inputRef = useRef(null);

  const [tree, setTree] = useState(
    node(
      "Box",
      { p: 3, pt: 5, bg: "orange" },
      node("Box", { p: 3, bg: "pink" }),
      node("Box", { p: 2, bg: "red" })
    )
  );
  const [draftTree, setDraftTree] = useState();

  const [selector, setSelector] = useState([0]);
  const [settings, setSettings] = useState({});
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    document.addEventListener("keydown", e => {
      const { key } = e;

      if (commandRef.current && key === "Escape") {
        setArgs("");
        setDraftTree(null);
        setCommand(null);
      }

      if (commandRef.current) {
        return;
      }

      if (!commandRef.current && menuChars.includes(key)) {
        e.preventDefault();
        setCommand(key);
      }

      // Are we moving?
      if (["h", "j", "k", "l", "[", "]"].includes(key)) {
        setCommands([...commands, { type: "move", key, shift: e.shiftKey }]);
      }
      if (key === "l") {
        setCommands([...commands, { type: "toggleOutline" }]);
      }
      if (key === "n") {
        setCommands([...commands, { type: "toggleView" }]);
      }
    });
  }, []);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, [command]);

  useEffect(() => {
    const newCommand = commands[commands.length - 1];
    if (!newCommand) {
      return;
    }
    const { type } = newCommand;
    if (type === "toggleOutline") {
      setSettings({ ...settings, showOutlines: !settings.showOutlines });
    }
    if (type === "toggleView") {
      setSettings({ ...settings, toggleView: !settings.toggleView });
    }
    const { key, shift } = newCommand;

    const parentChildrenSelector = selector.slice(0, selector.length - 1);
    const selectorTailValue = selector[selector.length - 1];

    if (key === "j") {
      const siblings = getInChildren(tree, parentChildrenSelector).children;
      if (selectorTailValue < siblings.length - 1) {
        setSelector([...parentChildrenSelector, selectorTailValue + 1]);
      }
    } else if (key === "k") {
      if (selectorTailValue > 0) {
        setSelector([...parentChildrenSelector, selectorTailValue - 1]);
      }
    } else if (key === "d") {
      setTree();
    } else if (key === "[") {
      setSelector(exit(selector));
    } else if (key === "]") {
      setSelector(enter(tree, selector));
    }
  }, [commands]);

  return (
    <ThemeProvider theme={theme}>
      <Document
        node={draftTree ? draftTree : tree}
        selector={selector}
        settings={settings}
      />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          bottom: 3,
          left: 0,
          right: 0,
          position: "absolute"
        }}
      >
        {command && (
          <Menu>
            <Input
              ref={inputRef}
              value={args}
              onChange={e => {
                const { tree: newTree } = run(
                  { tree, selector },
                  tokenize(command + " " + e.target.value)
                );
                setArgs(e.target.value);
                setDraftTree(newTree);
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  setCommand(null);
                  if (draftTree) {
                    setTree(draftTree);
                    setDraftTree(null);
                  }
                  setArgs("");
                }
              }}
            />
          </Menu>
        )}
        <Box display="flex" flexDirection="row" justifyContent="center">
          {menuChars.map(char => (
            <Icon
              char={menuIcons[char] || char}
              focused={command === char}
              label={menuLabels[char]}
            />
          ))}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
