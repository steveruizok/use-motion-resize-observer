// For simplicity, this file is not in TS so that the node generation script can be simpler.
const React = require("react");
const baseuseMotionResizeObserver = require("../../");

// I couldn't be bothered to use es6 for the node script, so I ended up with this...
const useMotionResizeObserver =
  baseuseMotionResizeObserver.default || baseuseMotionResizeObserver;

module.exports = function Test() {
  const { ref, width, height } = useMotionResizeObserver({
    initial: { width: 1, height: 2 },
  });

  React.useLayoutEffect(() => {
    return width.onChange((v) => {
      const text = ref.current;
      text.textContent = `${width.get()}x${height.get()}`;
    });
  });

  React.useLayoutEffect(() => {
    return height.onChange((v) => {
      const text = ref.current;
      text.textContent = `${width.get()}x${height.get()}`;
    });
  });

  return React.createElement(
    "div",
    { ref, style: { width: 100, height: 200 } },
    `${width.get()}x${height.get()}`
  );
};
