import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "rebass";
import { Input } from "@rebass/forms";

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

const App = () => {
  const commandRef = useRef();
  const [command, setCommand] = useState();
  const [args, setArgs] = useState("");
  commandRef.current = command;
  const inputRef = useRef(null);

  const [tree, setTree] = useState(
    node("Box", { p: 3, bg: "red" }, node("Text", null, "I am a div"))
  );

  useEffect(() => {
    document.addEventListener("keydown", e => {
      const { key } = e;
      if (!commandRef.current && menuChars.includes(key)) {
        e.preventDefault();
        setCommand(key);
      }
      if (commandRef.current && key === "Escape") {
        setArgs("");
        setCommand(null);
      }
    });
  }, []);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, [command]);

  return (
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
  );
};

export default App;
