import { useEffect, useRef, useState } from "react";

type Options = {
  nextTintedSrcs: Record<string, string>;
  crossfadeDelayMs: number;
};

export default function useParallaxCrossfade({
  nextTintedSrcs,
  crossfadeDelayMs,
}: Options) {
  const [currentSrcs, setCurrentSrcs] = useState<Record<string, string>>({});
  const [previousSrcs, setPreviousSrcs] = useState<Record<
    string,
    string
  > | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);

  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (Object.keys(nextTintedSrcs).length === 0) return;

    // First load: just show the current set immediately.
    if (Object.keys(currentSrcs).length === 0) {
      setCurrentSrcs(nextTintedSrcs);
      setIsCrossfading(false);
      return;
    }

    // Cancel any queued frame from a previous transition.
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    // Keep the old set visible underneath.
    setPreviousSrcs(currentSrcs);

    // Put the new set in place, but hidden first.
    setCurrentSrcs(nextTintedSrcs);
    setIsCrossfading(false);

    // Start the crossfade slightly after the main theme change so the
    // environment feels like it reacts in layers.
    rafRef.current = requestAnimationFrame(() => {
      timeoutRef.current = window.setTimeout(() => {
        setIsCrossfading(true);
      }, crossfadeDelayMs);
    });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
    // currentSrcs is intentionally captured so the outgoing layer set
    // matches the visible theme at the moment the transition starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextTintedSrcs]);

  return {
    currentSrcs,
    previousSrcs,
    isCrossfading,
    clearPreviousSrcs: () => setPreviousSrcs(null),
  };
}
