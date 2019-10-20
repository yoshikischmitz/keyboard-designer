import React from "react";
import { Box, Text } from "rebass";

const cTable = {
  Box: Box,
  Text: Text
};

const Document = ({ node }) => {
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((child, index) => (
          <Document key={index} node={child} />
        ))}
      </>
    );
  } else {
    const { component, children, props } = node;
    const Elem = cTable[component];
    return (
      <Elem {...props}>
        {children.map((child, index) => {
          if (typeof child === "string") {
            return child;
          } else {
            return <Document key={index} node={child} />;
          }
        })}
      </Elem>
    );
  }
};

export default Document;
