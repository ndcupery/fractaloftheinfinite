import { motion } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { VideoThumbnail } from "@/components/ui/VideoThumbnail";
import type { MediaItem } from "@/data/projects";

interface GalleryGridProps {
  media: MediaItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  onBackToViewer: () => void;
}

const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.1 },
  },
};

const gridItem = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

export function GalleryGrid({
  media,
  currentIndex,
  onSelect,
  onClose,
  onBackToViewer,
}: GalleryGridProps) {
  return (
    <motion.div
      key="gallery"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[101] flex flex-col bg-background/95 backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={onBackToViewer}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 text-white/70 hover:text-white active:scale-95 transition-all text-sm"
        >
          <ChevronDown size={18} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <h2 className="text-sm font-semibold text-white/60 select-none">
          {media.length} items
        </h2>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 text-white/70 hover:text-white active:scale-95 transition-all"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Scrollable grid */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain p-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <motion.div
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2"
        >
          {media.map((item, index) => {
            const isActive = index === currentIndex;
            return (
              <motion.div
                key={index}
                role="button"
                tabIndex={0}
                variants={gridItem}
                layoutId={`lb-thumb-${index}`}
                onClick={() => onSelect(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(index);
                  }
                }}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:ring-1 hover:ring-white/20"
                }`}
                whileTap={{ scale: 0.93 }}
              >
                {item.type === "image" ? (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="lazy"
                  />
                ) : (
                  <VideoThumbnail
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full"
                  />
                )}

                {/* Filename label */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 pointer-events-none">
                  <span className="text-[10px] text-white/70 font-mono truncate block">
                    {item.filename}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
