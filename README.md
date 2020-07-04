# use-motion-resize-observer

A fork of [use-resize-observer](https://github.com/ZeeCoder/use-resize-observer) that uses Motion Values from Framer Motion.

## What's different?

Unlike `useMotionResizeObserver`, the hook will **not** trigger a re-render on all changes to the target element's width and / or height. Instead, it will update the `height` and `width` motion values. You can use these values to drive other changes to `motion` components.

## In Action

[CodeSandbox Demo](https://codesandbox.io/s/use-motion-resize-observer-basic-usage-cmfdi)

## Install

```sh
yarn add use-motion-resize-observer --dev
# or
npm install use-motion-resize-observer --save-dev
```

## Basic Usage

Note that the default builds are not polyfilled! For instructions and alternatives, see the [Transpilation / Polyfilling](#transpilation--polyfilling) section.

```js
import React from "react";
import useMotionResizeObserver from "use-motion-resize-observer";
import { motion, useTransform } from "framer-motion";

const App = () => {
  const { ref, width, height } = useMotionResizeObserver({
    initial: { width: 100, height: 100 },
  });

  const background = useTransform(width, [100, 300], ["#52cb9a", "#2d8a9a"]);

  return <motion.div ref={ref} style={{ background }} />;
};
```

## Passing in Your Own `ref`

You can pass in your own ref instead of using the one provided.
This can be useful if you already have a ref you want to measure.

```js
const ref = useRef(null);
const { width, height } = useMotionResizeObserver({ ref });
```

You can even reuse the same hook instance to measure different elements:

[CodeSandbox Demo](https://codesandbox.io/s/use-resize-observer-changing-measured-ref-or4uj)

## The "onResize" callback

You can provide an `onResize` callback function, which will receive the width and height of the element as numbers (not motion values) when it changes, so
that you can decide what to do with it:

```js
import React from "react";
import useMotionResizeObserver from "use-motion-resize-observer";

const App = () => {
  const { ref } = useMotionResizeObserver({
    onResize: ({ width, height }) => {
      // do something here.
    },
  });

  return <div ref={ref} />;
};
```

## Defaults (SSR)

On initial mount the ResizeObserver will take a little time to report on the
actual size.

Until the hook receives the first measurement, it returns `0` for width
and height by default.

You can override this behaviour, which could be useful for SSR as well.

```js
const { ref, width, height } = useMotionResizeObserver({
  initial: { width: 100, height: 50 },
});
```

Here "width" and "height" motion values will be 100 and 50 respectively, until the ResizeObserver kicks in and reports the actual size.

## Without Defaults

If you only want real measurements (only values from the ResizeObserver without
any default values), then you can just leave defaults off:

```js
const { ref, width, height } = useMotionResizeObserver();
```

Here the "width" and "height" motion values will have `0` values until the ResizeObserver takes its first measurement.

```js
const { ref, width, height } = useMotionResizeObserver();
```

## Container/Element Query with CSS-in-JS

It's possible to apply styles conditionally based on the width / height of an
element using a CSS-in-JS solution, which is the basic idea behind
container/element queries:

[CodeSandbox Demo](https://codesandbox.io/s/use-resize-observer-container-query-with-css-in-js-b8slq)

...but this is much easier with `motion` elements from Framer Motion.

```jsx
const { ref, width, height } = useMotionResizeObserver();
const background = useTransform(width, [100, 300], ["#52cb9a", "#2d8a9a"]);

return <motion.div ref={ref} style={{ background }} />;
```

## Changing State

The goal of Framer Motion is to allow for visual data to flow without triggering component re-renders by avoiding React's state/props. That said, if you _do_ want to change state, you can use the `onResize` callback.

```js
const { ref, width, height } = useMotionResizeObserver({
  onResize: (size) => setSize(size),
});
```

[CodeSandbox Demo](https://codesandbox.io/s/use-motion-resize-observer-changing-state-sg8qb)

## Transpilation / Polyfilling

By default the library provides transpiled ES5 modules in CJS / ESM module formats.

Polyfilling is recommended to be done in the host app, and not within imported
libraries, as that way consumers have control over the exact polyfills being used.

That said, there's a [polyfilled](https://github.com/que-etc/resize-observer-polyfill)
CJS module that can be used for convenience (Not affecting globals):

```js
import useMotionResizeObserver from "use-motion-resize-observer/polyfilled";
```

## Related

- [@zeecoder/use-resize-observer](https://github.com/ZeeCoder/container-query)
- [@zeecoder/container-query](https://github.com/ZeeCoder/container-query)
- [@zeecoder/react-resize-observer](https://github.com/ZeeCoder/react-resize-observer)

## License

MIT
