import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { Card, Box, Text } from "rebass";
import { Input } from "@rebass/forms";
import quickStyle from "./quick-styler";
import { ThemeProvider } from "theme-ui";

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

function App() {
  const [currentStyle, setCurrentStyle] = useState("");
  const [source, setSource] = useState("mt3++fs6-p4mx4");
  const [boxProps, setBoxProps] = useState(quickStyle({}, source).styleProps);
  const [mode, setMode] = useState("nav");
  const inputRef = useRef();

  useEffect(() => {
    document.addEventListener("keydown", ({ key }) => {
      switch (key) {
        case "Escape": {
          setMode("nav");
        }
        case "q": {
          setMode("qst");
          inputRef.current.focus();
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
        <Card {...boxProps} bg="rgba(0, 0, 0, 0.3)">
          <Text>I am a div</Text>
        </Card>
        <Box
          style={{
            bottom: 8,
            right: 8,
            position: "absolute",
            alignSelf: "center",
            width: 500
          }}
        >
          {Object.keys(boxProps).length > 0 && (
            <Box
              bg="rgba(0, 0, 0, 0.85)"
              color="white"
              p={2}
              border={1}
              sx={{ borderRadius: 3 }}
            >
              {Object.keys(boxProps).map(prop => (
                <Box width={0.5} key={prop + boxProps[prop]} my={1}>
                  <Text color={prop === currentStyle ? "#96CCFF" : "white"}>
                    {translation[prop]}:{" "}
                    <Text
                      color={prop === currentStyle && "white"}
                      bg={
                        prop === currentStyle
                          ? "#00449e"
                          : "rgba(255, 255, 255, 0.3)"
                      }
                      px="2px"
                      sx={{
                        borderRadius: 4
                      }}
                      as="span"
                    >
                      {boxProps[prop]}
                    </Text>
                  </Text>
                </Box>
              ))}
            </Box>
          )}
          <Input
            bg="rgba(0, 0, 0, 0.85)"
            color="white"
            onChange={e => {
              if (e.target.value === "q" && e.target.length === 1) {
                return;
              }
              const { styleProps, currentStyle } = quickStyle(
                boxProps,
                e.target.value
              );
              setBoxProps(styleProps);
              setCurrentStyle(currentStyle);
              setSource(e.target.value);
            }}
            value={source}
            onKeyDown={event => {
              if (event.key === "Escape") {
                console.log("bluring");
                event.target.blur();
              }
              if (event.key === "Enter") {
                if (event.target.value === "clear") {
                  setBoxProps({});
                }
                setSource("");
              }
            }}
            width="100%"
            ref={input => {
              inputRef.current = input;
            }}
            p={3}
            style={{
              borderRadius: 4
            }}
          />
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
