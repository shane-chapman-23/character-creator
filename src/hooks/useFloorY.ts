import { useLayoutEffect, useState, type RefObject } from "react";

type Options = {
  containerRef: RefObject<HTMLElement | null>;
  targetRef: RefObject<HTMLElement | null>;
};

export default function useFloorY({ containerRef, targetRef }: Options) {
  const [floorY, setFloorY] = useState(0);

  useLayoutEffect(() => {
    const updateFloorY = () => {
      if (!containerRef.current || !targetRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const targetRect = targetRef.current.getBoundingClientRect();

      // Measure the target's bottom edge relative to the container's top edge.
      // This gives us a stable "floor" position inside the container.
      setFloorY(targetRect.bottom - containerRect.top);
    };

    // Run once on mount and again whenever observed layout changes.
    updateFloorY();
    window.addEventListener("resize", updateFloorY);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateFloorY);

      // Watch both elements so floorY updates if either one changes size.
      if (containerRef.current) observer.observe(containerRef.current);
      if (targetRef.current) observer.observe(targetRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateFloorY);
      observer?.disconnect();
    };
  }, [containerRef, targetRef]);

  return floorY;
}
