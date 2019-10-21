export const getInChildren = (obj, keys) => {
  let value = obj;
  for (const key of keys) {
    value = value.children[key];
  }
  return value;
};

export const updateIn = (tree, selector, newValue) => {
  if (selector.length === 0) {
    return newValue;
  } else {
    const [head, ...rest] = selector;
    return {
      ...tree,
      children: tree.children.map((child, index) => {
        if (head === index) {
          return updateIn(child, selector.slice(1), newValue);
        } else {
          return child;
        }
      })
    };
  }
};

export const exit = selector => selector.slice(0, selector.length - 1);

export const enter = (tree, selector) => {
  const children = getInChildren(tree, selector).children;
  if (children.length > 0 && children[0].component) {
    return [...selector, 0];
  }
  return selector;
};
