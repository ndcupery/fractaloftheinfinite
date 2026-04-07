import { useCallback } from "react";
import { useMotionValue, useTransform, type PanInfo } from "framer-motion";

const OFFSET_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 300;

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
}

export function useSwipeGesture(handlers: SwipeHandlers) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Opacity fades as user drags down (close hint)
  const opacity = useTransform(y, [-200, 0, 200], [0.8, 1, 0.4]);
  // Scale shrinks slightly on vertical drag
  const scale = useTransform(y, [-200, 0, 200], [0.95, 1, 0.9]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info;
      const absX = Math.abs(offset.x);
      const absY = Math.abs(offset.y);

      const isHorizontal = absX > absY;

      if (isHorizontal) {
        const triggered =
          absX > OFFSET_THRESHOLD || Math.abs(velocity.x) > VELOCITY_THRESHOLD;
        if (!triggered) return;
        if (offset.x < 0) handlers.onSwipeLeft?.();
        else handlers.onSwipeRight?.();
      } else {
        const triggered =
          absY > OFFSET_THRESHOLD || Math.abs(velocity.y) > VELOCITY_THRESHOLD;
        if (!triggered) return;
        if (offset.y > 0) handlers.onSwipeDown?.();
        else handlers.onSwipeUp?.();
      }
    },
    [handlers],
  );

  return {
    motionValues: { x, y, opacity, scale },
    dragProps: {
      drag: true as const,
      dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
      dragElastic: 0.6,
      onDragEnd: handleDragEnd,
      style: { x, y, opacity, scale },
    },
  };
}
