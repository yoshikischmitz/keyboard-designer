import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "rebass";
import { Input } from "@rebass/forms";
import Document from "./Document";

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

const menuChars = ["w", "s", "f", "i", "e", "a"];
const menuIcons = { a: "aA" };
const menuLabels = {
  w: "wrap",
  s: "style",
  f: "find",
  i: "insert",
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

const getInChildren = (obj, keys) => {
  let value = obj;
  for (const key of keys) {
    value = value.children[key];
  }
  return value;
};

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
      node(
        "Box",
        {
          p: 3,
          bg: "grey"
        },
        ...[0, 1, 2, 3].map(() =>
          node(
            "Box",
            { p: 4, bg: "white", mt: 2 },
            node("Text", null, "hi thar")
          )
        )
      )
    )
  );
  const [selector, setSelector] = useState([0]);
  const [settings, setSettings] = useState({});
  const [commands, setCommands] = useState([]);

  useEffect(() => {
    document.addEventListener("keydown", e => {
      const { key } = e;
      if (commandRef.current && key === "Escape") {
        setArgs("");
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
      if (["h", "j", "k", "l", "Enter"].includes(key)) {
        setCommands([...commands, { type: "move", key, shift: e.shiftKey }]);
      }
      if (key === "t") {
        setCommands([...commands, { type: "toggleOutline" }]);
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
    } else if (key === "Enter") {
      if (shift) {
        setSelector(selector.slice(0, selector.length - 1));
      } else {
        const children = getInChildren(tree, selector).children;
        if (children.length > 0 && children[0].component) {
          setSelector([...selector, 0]);
        }
      }
    }
  }, [commands]);

  return (
    <>
      <Document node={tree} selector={selector} settings={settings} />
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
            {console.log("input got rendered")}
            <Input
              ref={inputRef}
              value={args}
              onChange={e => setArgs(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  setCommand(null);
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
    </>
  );
};

export default App;
