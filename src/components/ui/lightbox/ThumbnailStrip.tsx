import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { VideoThumbnail } from "@/components/ui/VideoThumbnail";
import type { MediaItem } from "@/data/projects";

interface ThumbnailStripProps {
  media: MediaItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  layoutIdPrefix?: string;
}

export function ThumbnailStrip({
  media,
  currentIndex,
  onSelect,
  layoutIdPrefix = "lb-thumb",
}: ThumbnailStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Auto-scroll to center the active thumbnail
  useEffect(() => {
    const el = itemRefs.current.get(currentIndex);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute bottom-0 left-0 right-0 z-10"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Gradient fade above the strip */}
      <div className="h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <div className="bg-black/60 backdrop-blur-md px-3 pb-[env(safe-area-inset-bottom,8px)] pt-2">
        {/* Counter */}
        <div className="text-center text-xs text-white/50 font-mono mb-2 select-none">
          {currentIndex + 1} / {media.length}
        </div>

        <div
          ref={containerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {media.map((item, index) => {
            const isActive = index === currentIndex;
            return (
              <motion.div
                key={index}
                ref={(el) => {
                  if (el) itemRefs.current.set(index, el);
                  else itemRefs.current.delete(index);
                }}
                role="button"
                tabIndex={0}
                layoutId={`${layoutIdPrefix}-${index}`}
                onClick={() => onSelect(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(index);
                  }
                }}
                className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "ring-2 ring-primary scale-110 z-10"
                    : "opacity-50 hover:opacity-80"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <VideoThumbnail
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
