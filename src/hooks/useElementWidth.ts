import { useEffect, useState, useRef } from "react";

// Hook that measures an element's width and keeps it updated when the element resizes.
// Useful for responsive layout logic that depends on actual rendered size.
export function useElementWidth<T extends HTMLElement>() {
  // Ref that will be attached to the element we want to measure.
  const ref = useRef<T | null>(null);

  // Stores the current width of the element in pixels.
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Measure the element's width and store it in state.
    const updateWidth = () => setWidth(node.clientWidth);

    // Measure immediately on mount.
    updateWidth();

    // Observe size changes so width stays in sync with layout.
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    // Clean up observer when the component unmounts.
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}
