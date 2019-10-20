import React from "react";
import { Box, Text } from "rebass";

const cTable = {
  Box: Box,
  Text: Text
};

const focusedStyle = {
  outlineOffset: -1
};

const Document = ({ node, path = [], selector, settings }) => {
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((child, index) => (
          <Document
            key={index}
            node={child}
            path={[...path, index]}
            selector={selector}
          />
        ))}
      </>
    );
  } else {
    const { component, children, props } = node;
    const Elem = cTable[component];

    const focused = JSON.stringify(path) === JSON.stringify(selector);
    const showOutlines = settings.showOutlines || focused;
    let style = { ...(showOutlines ? focusedStyle : {}) };
    const color = focused ? "rgba(0, 144, 240, 0.9)" : "rgba(43, 43, 43, 0.4)";
    if (showOutlines) {
      style.outline = `1px solid ${color}`;
    }

    return (
      <>
        <Elem {...props} style={{ ...style, position: "relative" }}>
          {showOutlines && (
            <span
              style={{
                backgroundColor: color,
                color: "white",
                position: "absolute",
                left: 0,
                top: -14,
                fontSize: 12,
                paddingLeft: 4,
                paddingRight: 4
              }}
            >
              {component}
            </span>
          )}
          {children.map((child, index) => {
            if (typeof child === "string") {
              return child;
            } else {
              return (
                <Document
                  key={index}
                  node={child}
                  path={[...path, index]}
                  selector={selector}
                  settings={settings}
                />
              );
            }
          })}
        </Elem>
      </>
    );
  }
};

export default Document;
