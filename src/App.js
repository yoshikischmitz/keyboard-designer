import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { Card, Box, Text } from "rebass";
import { Input } from "@rebass/forms";
import { ThemeProvider } from "theme-ui";
import { run, tokenize } from "./interpret";

// quick hack to show CSS style names for twitter:
const boxPrefixes = { m: "margin", p: "padding" };
const boxSuffixes = {
  t: "top",
  l: "left",
  r: "right",
  b: "bottom",
  x: "horizontal",
  y: "vertical"
};

let translation = { fontSize: "font-size", fontWeight: "font-weight" };

Object.keys(boxPrefixes).forEach(prefixAbbrev => {
  const prefixFull = boxPrefixes[prefixAbbrev];
  translation[prefixAbbrev] = prefixFull;

  Object.keys(boxSuffixes).forEach(suffixAbbrev => {
    const suffixFull = boxSuffixes[suffixAbbrev];
    translation[prefixAbbrev + suffixAbbrev] = prefixFull + "-" + suffixFull;
  });
});

const cTable = {
  Box: Box
};

const Interface = ({ node }) => {
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((child, index) => (
          <Interface key={index} node={child} />
        ))}
      </>
    );
  } else {
    const { component, children, styles } = node;
    const Elem = cTable[component];
    return (
      <Elem {...styles}>
        {children.map((child, index) => {
          if (typeof child === "string") {
            return child;
          } else {
            return <Interface key={index} node={child} />;
          }
        })}
      </Elem>
    );
  }
};
const get = (obj, keys) => {
  let value = obj;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

function App() {
  const [source, setSource] = useState("");
  const [tree, setTree] = useState({
    component: "Box",
    styles: { bg: "red", color: "white", p: 3 },
    children: ["I am a div"]
  });
  const [newTree, setNewTree] = useState(null);
  const [selector, setSelector] = useState([]);
  const [mode, setMode] = useState("nav");
  const inputRef = useRef();

  const execute = (tree, source) => {
    return run(tree, tokenize(source));
  };

  useEffect(() => {
    document.addEventListener("keydown", event => {
      const { key } = event;
      switch (key) {
        case "/": {
          console.log("slash pressed");
          inputRef.current.focus();
          event.preventDefault();
        }
        case "Escape": {
          setMode("nav");
        }
      }
    });
  }, []);

  return (
    <ThemeProvider theme={{ fontWeights: ["100", "300", "500", "bold"] }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Interface node={newTree || tree} />
      </div>
      <Input
        bg="rgba(0, 0, 0, 0.85)"
        color="white"
        onChange={e => {
          setSource(e.target.value);
          const newTree = execute({ node: tree }, e.target.value).node;
          setNewTree(newTree);
        }}
        value={source}
        onKeyDown={event => {
          if (event.key === "Escape") {
            console.log("bluring");
            event.target.blur();
          }
          if (event.key === "Enter") {
            setTree(newTree);
            setNewTree(null);
            setSource("");
          }
        }}
        ref={input => {
          inputRef.current = input;
        }}
        mx={2}
        style={{
          borderRadius: 4,
          position: "absolute",
          bottom: 16
        }}
      />
    </ThemeProvider>
  );
}
//
//        <Box
//          style={{
//            bottom: 8,
//            right: 8,
//            position: "absolute",
//            alignSelf: "center",
//            width: 500
//          }}
//        >
//          {Object.keys(boxProps).length > 0 && (
//            <Box
//              bg="rgba(0, 0, 0, 0.85)"
//              color="white"
//              p={2}
//              border={1}
//              sx={{ borderRadius: 3 }}
//            >
//              {Object.keys(boxProps).map(prop => (
//                <Box width={0.5} key={prop + boxProps[prop]} my={1}>
//                  <Text color={prop === currentStyle ? "#96CCFF" : "white"}>
//                    {translation[prop]}:{" "}
//                    <Text
//                      color={prop === currentStyle && "white"}
//                      bg={
//                        prop === currentStyle
//                          ? "#00449e"
//                          : "rgba(255, 255, 255, 0.3)"
//                      }
//                      px="2px"
//                      sx={{
//                        borderRadius: 4
//                      }}
//                      as="span"
//                    >
//                      {boxProps[prop]}
//                    </Text>
//                  </Text>
//                </Box>
//              ))}
//            </Box>
//          )}
//          <Input
//            bg="rgba(0, 0, 0, 0.85)"
//            color="white"
//            onChange={e => {
//              if (e.target.value === "q" && e.target.length === 1) {
//                return;
//              }
//              const { styleProps, currentStyle } = quickStyle(
//                boxProps,
//                tokenize(e.target.value)
//              );
//              setBoxProps(styleProps);
//              setCurrentStyle(currentStyle);
//              setSource(e.target.value);
//            }}
//            value={source}
//            onKeyDown={event => {
//              if (event.key === "Escape") {
//                console.log("bluring");
//                event.target.blur();
//              }
//              if (event.key === "Enter") {
//                if (event.target.value === "clear") {
//                  setBoxProps({});
//                }
//                setSource("");
//              }
//            }}
//            width="100%"
//            ref={input => {
//              inputRef.current = input;
//            }}
//            p={3}
//            style={{
//              borderRadius: 4
//            }}
//          />
//        </Box>

export default App;
