import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useRef } from "react";
import useFloorY from "./useFloorY";

type MutableRect = {
  top: number;
  bottom: number;
};

function withRect(element: HTMLElement, rect: MutableRect) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () =>
      ({
        x: 0,
        y: rect.top,
        width: 100,
        height: rect.bottom - rect.top,
        top: rect.top,
        right: 100,
        bottom: rect.bottom,
        left: 0,
        toJSON: () => ({}),
      }) as DOMRect,
  });
}

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe() {}
  unobserve() {}
  disconnect() {}

  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

function FloorYHarness() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const floorY = useFloorY({ containerRef, targetRef });

  return (
    <div>
      <div ref={containerRef}>
        <div ref={targetRef} data-testid="target" />
      </div>
      <output data-testid="floor-y">{floorY}</output>
    </div>
  );
}

describe("useFloorY", () => {
  beforeEach(() => {
    MockResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("updates floorY when observed layout changes without a window resize", () => {
    const containerRect = { top: 100, bottom: 600 };
    const targetRect = { top: 200, bottom: 450 };

    render(<FloorYHarness />);

    const container = screen.getByTestId("target").parentElement as HTMLElement;
    const target = screen.getByTestId("target");
    withRect(container, containerRect);
    withRect(target, targetRect);

    act(() => {
      MockResizeObserver.instances[0].trigger();
    });

    expect(screen.getByTestId("floor-y").textContent).toBe("350");

    targetRect.bottom = 510;
    act(() => {
      MockResizeObserver.instances[0].trigger();
    });

    expect(screen.getByTestId("floor-y").textContent).toBe("410");
  });
});
