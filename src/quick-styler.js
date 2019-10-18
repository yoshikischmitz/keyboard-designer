const commandPatterns = [
  {
    name: "box",
    prefixes: [
      "m", // margin
      "p", // padding
      "b" // border
    ],
    suffixes: [
      "t", // top
      "r", // right
      "b", // bottom
      "l", // left
      "x", // horizontal
      "y" // vertical
    ]
  },
  {
    name: "font",
    prefixes: ["f"],
    suffixes: ["w", "s"]
  }
];

const abbreviations = {
  fs: "fontSize",
  fw: "fontWeight"
};

const patternsIncludes = (key, char) => {
  for (const x of commandPatterns) {
    if (x[key].includes(char)) {
      return true;
    }
  }
};

const quickStyle = (styleProps, source) => {
  const characters = source.split("").reverse();
  let state = "idle";
  let currentStyle = "";

  while (characters.length > 0) {
    const char = characters.pop();
    const isNumber = !isNaN(char);
    if (
      patternsIncludes("prefixes", char) &&
      (state === "idle" || state === "styled")
    ) {
      state = "prefixed";
      currentStyle = char;
    }

    if (state === "prefixed" && isNumber) {
      state = "styled";
      if (abbreviations[currentStyle]) {
        currentStyle = abbreviations[currentStyle];
      }
      styleProps[currentStyle] = Number(char);
    }

    if (styleProps[currentStyle]) {
      if (char === "+") {
        styleProps[currentStyle] += 1;
      } else if (char === "-") {
        styleProps[currentStyle] -= 1;
      }
    }

    if (state === "prefixed" && patternsIncludes("suffixes", char)) {
      currentStyle += char;
    }
    if (abbreviations[currentStyle]) {
      currentStyle = abbreviations[currentStyle];
    }
  }
  return { styleProps, currentStyle };
};

export default quickStyle;
