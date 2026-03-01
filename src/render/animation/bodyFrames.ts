// Controls which animation frame should be shown at a given time.
// Uses time-based logic so animations run consistently
// regardless of frame rate.

export type Anim = "idle" | "run";

// Returns the frame index to use for the body animation.
// `t` is time in seconds.
export function getBodyFrameIndex(anim: Anim, t: number, frameCount: number) {
  // If there's only one frame, no animation is needed.
  if (frameCount <= 1) return 0;

  // Run plays faster than idle.
  const fps = anim === "run" ? 8 : 2;
  // Convert time into a frame step.
  const step = Math.floor(t * fps);

  // Special case: smooth 3-frame run loop (0-1-2-1)
  // instead of jumping 2 -> 0.
  if (anim === "run" && frameCount === 3) {
    const pattern = [0, 1, 2, 1];
    return pattern[step % pattern.length];
  }

  // Simple 2-frame idle loop.
  if (anim === "idle" && frameCount === 2) {
    return step % 2;
  }

  // Default behaviour for 2+ frames:
  // play forward then backward (0..n-1..1)
  const period = frameCount * 2 - 2;
  const i = step % period;
  return i < frameCount ? i : period - i;
}
