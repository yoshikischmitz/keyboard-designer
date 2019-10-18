// we maintain one piece of state: the last valid style property that we received
// we receive a list of characters
// a sequence of characters may form a valid style property. Style properties are abbreviations of
// common css attributes, broadly, they are either plural or singular. Plural are ones like margin or padding
// that may be affixed with a positional modifier like marginLeft marginRight etc.
// singular ones are like fs = font-size or fw = font-weight.
//
// let's start with the box model
//
// valid prefixes for  box-model things:
const prefixes = [
  "m", // margin
  "p", // padding
  "b", // border
  "f" // font
];
// valid postfixes for box-model things:
const postfixes = [
  "t", // top
  "r", // right
  "b", // bottom
  "l", // left
  "x", // horizontal
  "y", // vertical
  "w",
  "s"
];
// now that we have the prefixes and post fixes, we can construct a regex:
const matcher = arr => "[" + arr.join(" ") + "]";
const boxModelRegex = new RegExp(matcher(prefixes) + matcher(postfixes));

const abbreviations = {
  fs: "fontSize",
  fw: "fontWeight"
};

const quickStyle = (styleProps, source) => {
  const characters = source.split("").reverse();
  let state = "idle";
  let currentStyle = "";

  while (characters.length > 0) {
    const char = characters.pop();
    const isNumber = !isNaN(char);
    if (prefixes.includes(char) && (state === "idle" || state === "styled")) {
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

    if (state === "prefixed" && postfixes.includes(char)) {
      currentStyle += char;
    }
    if (abbreviations[currentStyle]) {
      currentStyle = abbreviations[currentStyle];
    }
  }
  return { styleProps, currentStyle };
};

export default quickStyle;
