import React, { useEffect, useRef, RefObject, FunctionComponent } from "react";
import ReactDOM from "react-dom";
import useMotionResizeObserver from "../..";
import delay from "delay";
import { MotionValue, motion } from "framer-motion";

export type Size = {
  width: number;
  height: number;
};

export type MotionSize = {
  width: MotionValue<number>;
  height: MotionValue<number>;
};

export type ObservedSize = {
  width: number | undefined;
  height: number | undefined;
};

type BaseComponentHandler = {
  assertSize: (size: ObservedSize) => void;
  assertDefaultSize: () => void;
};
type SizingComponentHandler = {
  setSize: (size: Size | ObservedSize) => void;
  setAndAssertSize: (size: Size | ObservedSize) => void;
};
type CountingComponentHandler = {
  assertRenderCount: (count: number) => void;
};

export type ComponentHandler = BaseComponentHandler &
  SizingComponentHandler &
  CountingComponentHandler;

export function createComponentHandler(opts: {
  motionSizeRef: RefObject<MotionSize>;
  currentSizeRef: RefObject<ObservedSize>;
}): BaseComponentHandler;
export function createComponentHandler(opts: {
  motionSizeRef: RefObject<MotionSize>;
  currentSizeRef: RefObject<ObservedSize>;
  measuredElementRef: RefObject<HTMLElement>;
}): BaseComponentHandler & SizingComponentHandler;
export function createComponentHandler(opts: {
  motionSizeRef: RefObject<MotionSize>;
  currentSizeRef: RefObject<ObservedSize>;
  renderCountRef: RefObject<number>;
}): BaseComponentHandler & CountingComponentHandler;
export function createComponentHandler(opts: {
  motionSizeRef: RefObject<MotionSize>;
  currentSizeRef: RefObject<ObservedSize>;
  measuredElementRef: RefObject<HTMLElement>;
  renderCountRef: RefObject<number>;
}): ComponentHandler;
export function createComponentHandler({
  currentSizeRef,
  motionSizeRef,
  measuredElementRef,
  renderCountRef,
}: {
  motionSizeRef: RefObject<MotionSize>;
  currentSizeRef: RefObject<ObservedSize>;
  measuredElementRef?: RefObject<HTMLElement>;
  renderCountRef?: RefObject<number>;
}): BaseComponentHandler {
  let handler = {
    assertSize: function ({ width, height }: ObservedSize) {
      if (currentSizeRef.current === null) {
        throw new Error(`currentSizeRef.current is not set.`);
      }

      if (motionSizeRef.current === null) {
        throw new Error(`motionSizeRef.current is not set.`);
      }

      expect(motionSizeRef.current.width.get()).toBe(width || 0);
      expect(motionSizeRef.current.height.get()).toBe(height || 0);
    },
    assertDefaultSize: function () {
      return this.assertSize({ width: 0, height: 0 });
    },
  } as ComponentHandler;

  if (measuredElementRef) {
    handler.setSize = ({ width, height }) => {
      if (measuredElementRef.current === null) {
        throw new Error(`measuredElementRef.current is not set.`);
      }

      measuredElementRef.current.style.width = `${width}px`;
      measuredElementRef.current.style.height = `${height}px`;
    };
    handler.setAndAssertSize = async (size) => {
      handler.setSize(size);
      await delay(50);
      handler.assertSize(size);
    };
  }

  if (renderCountRef) {
    handler.assertRenderCount = (count) => {
      expect(renderCountRef.current).toBe(count);
    };
  }

  return handler;
}

export type HandlerResolverComponentProps = {
  resolveHandler: HandlerReceiver;
};

export type MultiHandlerResolverComponentProps = {
  resolveHandler: MultiHandlerReceiver;
};

export const Observed: FunctionComponent<
  HandlerResolverComponentProps & {
    defaultWidth?: number;
    defaultHeight?: number;
    onResize?: (size: ObservedSize) => void;
  }
> = ({ resolveHandler, defaultWidth, defaultHeight, onResize, ...props }) => {
  const renderCountRef = useRef(0);
  const hasDefaults = defaultWidth || defaultHeight;
  const { ref: measuredElementRef, width, height } = useMotionResizeObserver<
    HTMLDivElement
  >({
    onResize,
    ...(hasDefaults
      ? {
          initial: {
            width: defaultWidth as number,
            height: defaultHeight as number,
          },
        }
      : {}),
  });
  const currentSizeRef = useRef<ObservedSize>({
    width: undefined,
    height: undefined,
  });

  const motionSizeRef = useRef<MotionSize>({ width, height });

  currentSizeRef.current.width = width.get();
  currentSizeRef.current.height = height.get();
  renderCountRef.current++;

  React.useLayoutEffect(() => {
    return width.onChange((v) => {
      const text = rTextContent.current;
      if (text) {
        text.innerText = `${v}x${height.get()}`;
      }
      currentSizeRef.current = {
        ...currentSizeRef.current,
        width: v,
      };
    });
  });

  React.useLayoutEffect(() => {
    return height.onChange((v) => {
      const text = rTextContent.current;
      if (text) {
        text.innerText = `${width.get()}x${v}`;
      }
      currentSizeRef.current = {
        ...currentSizeRef.current,
        height: v,
      };
    });
  });

  useEffect(() => {
    if (!resolveHandler) {
      return;
    }

    resolveHandler(
      createComponentHandler({
        motionSizeRef,
        currentSizeRef,
        measuredElementRef,
        renderCountRef,
      })
    );
  }, []);

  const rTextContent = React.useRef<HTMLSpanElement>(null);

  return (
    <motion.div
      {...props}
      ref={measuredElementRef}
      style={{
        position: "absolute",
        width: undefined,
        height: undefined,
        left: 0,
        top: 0,
        background: "grey",
        color: "white",
        fontWeight: "bold",
      }}
    >
      <span ref={rTextContent}>
        {width.get()}x{height.get()}
      </span>
      <div>
        Render Count: <span>{renderCountRef.current}</span>
      </div>
    </motion.div>
  );
};

export type HandlerReceiver = <T extends Partial<ComponentHandler>>(
  handler: T
) => void;
export type MultiHandlerReceiver = <T extends Partial<ComponentHandler>>(
  handler: T[]
) => void;

let appRoot: HTMLDivElement | null = null;

export function render<T extends ComponentHandler>(
  TestComponent: FunctionComponent<HandlerResolverComponentProps>,
  opts?: { waitForFirstMeasurement?: boolean },
  props?: {}
): Promise<T>;
export function render<T extends ComponentHandler>(
  TestComponent: FunctionComponent<MultiHandlerResolverComponentProps>,
  opts?: { waitForFirstMeasurement?: boolean },
  props?: {}
): Promise<T[]>;
export function render(
  TestComponent:
    | FunctionComponent<HandlerResolverComponentProps>
    | FunctionComponent<MultiHandlerResolverComponentProps>,
  {
    waitForFirstMeasurement = false,
  }: { waitForFirstMeasurement?: boolean } = {},
  props?: {}
) {
  return new Promise((resolve) => {
    async function resolveHandler<T extends Partial<ComponentHandler>>(
      handler: T | T[]
    ): Promise<void> {
      if (waitForFirstMeasurement) {
        await delay(50);
      }

      resolve(handler);
    }

    if (!appRoot) {
      appRoot = document.createElement("div");
      appRoot.id = "app";
      document.body.appendChild(appRoot);
    }

    // Clean out previous renders
    ReactDOM.render(<div></div>, appRoot);

    ReactDOM.render(
      <TestComponent {...props} resolveHandler={resolveHandler} />,
      appRoot
    );
  });
}
