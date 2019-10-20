import React, { useState, useEffect, useRef } from "react";
import { Box, Text } from "rebass";

const Icon = ({ char, focused }) => (
  <Box
    width={24}
    height={24}
    display="flex"
    alignItems="center"
    justifyContent="center"
    sx={{
      border: "1px solid black"
    }}
  >
    <Text fontWeight={focused && "bold"}>{char}</Text>
  </Box>
);

const menuChars = ["w", "s", "f", "r"];
const App = () => {
  const [menuFocus, setMenuFocus] = useState();
  useEffect(() => {
    document.addEventListener("keydown", e => {
      const { key } = e;
      if (menuChars.includes(key)) {
        setMenuFocus(key);
      }
      if (key === "Escape") {
        setMenuFocus(null);
      }
    });
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="center"
      sx={{
        bottom: 3,
        left: 0,
        right: 0,
        position: "absolute"
      }}
    >
      {menuChars.map(char => (
        <Icon char={char} focused={menuFocus === char} />
      ))}
    </Box>
  );
};

export default App;
