import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Grid2x2 } from "lucide-react";
import { useSwipeGesture } from "./useSwipeGesture";
import { ThumbnailStrip } from "./ThumbnailStrip";
import type { MediaItem } from "@/data/projects";

interface LightboxViewerProps {
  media: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onOpenGallery: () => void;
}

export function LightboxViewer({
  media,
  currentIndex,
  onClose,
  onNavigate,
  onOpenGallery,
}: LightboxViewerProps) {
  const current = media[currentIndex];
  const canNavigate = media.length > 1;

  const goPrev = () =>
    onNavigate((currentIndex - 1 + media.length) % media.length);
  const goNext = () => onNavigate((currentIndex + 1) % media.length);

  const { dragProps } = useSwipeGesture({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
    onSwipeDown: onClose,
    onSwipeUp: onOpenGallery,
  });

  return (
    <motion.div
      key="viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[101] flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="relative z-20 flex justify-between items-center p-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenGallery();
          }}
          className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white active:scale-90 transition-all"
          aria-label="View gallery"
        >
          <Grid2x2 size={20} />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white active:scale-90 transition-all"
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      {/* Main content area */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 px-4 pb-24">
        {/* Prev button — hidden on mobile (use swipe) */}
        {canNavigate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white active:scale-90 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Media content — draggable for swipe gestures */}
        <motion.div
          {...dragProps}
          className="relative max-w-full max-h-full flex items-center justify-center touch-none select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {current.type === "image" ? (
            <img
              src={current.src}
              alt={current.alt}
              className="max-w-full max-h-[calc(100vh-12rem)] rounded-xl object-contain pointer-events-none"
              draggable={false}
            />
          ) : (
            <video
              src={current.src}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-[calc(100vh-12rem)] rounded-xl"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
          )}
        </motion.div>

        {/* Next button — hidden on mobile (use swipe) */}
        {canNavigate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white active:scale-90 transition-all"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      <ThumbnailStrip
        media={media}
        currentIndex={currentIndex}
        onSelect={onNavigate}
      />
    </motion.div>
  );
}
