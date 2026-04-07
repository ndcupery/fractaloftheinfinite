import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { LightboxViewer } from "./LightboxViewer";
import { GalleryGrid } from "./GalleryGrid";
import type { MediaItem } from "@/data/projects";

type LightboxMode = "viewer" | "gallery";

interface LightboxProps {
  media: MediaItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate?: (newIndex: number) => void;
}

export function Lightbox({
  media,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const [mode, setMode] = useState<LightboxMode>("viewer");
  const isOpen = currentIndex !== null;

  // Reset to viewer mode whenever lightbox opens
  useEffect(() => {
    if (isOpen) {
      setMode("viewer");
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Keyboard handling — mode-aware
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || currentIndex === null) return;

      if (e.key === "Escape") {
        if (mode === "gallery") {
          setMode("viewer");
        } else {
          onClose();
        }
        return;
      }

      // Arrow keys only in viewer mode
      if (mode === "viewer" && onNavigate) {
        if (e.key === "ArrowLeft") {
          onNavigate((currentIndex - 1 + media.length) % media.length);
        } else if (e.key === "ArrowRight") {
          onNavigate((currentIndex + 1) % media.length);
        }
      }
    },
    [isOpen, currentIndex, mode, onNavigate, onClose, media.length],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const handleNavigate = useCallback(
    (index: number) => {
      onNavigate?.(index);
    },
    [onNavigate],
  );

  const handleGallerySelect = useCallback(
    (index: number) => {
      onNavigate?.(index);
      setMode("viewer");
    },
    [onNavigate],
  );

  return (
    <AnimatePresence>
      {isOpen && currentIndex !== null && (
        <LayoutGroup>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <AnimatePresence mode="wait">
            {mode === "viewer" ? (
              <LightboxViewer
                key="viewer"
                media={media}
                currentIndex={currentIndex}
                onClose={onClose}
                onNavigate={handleNavigate}
                onOpenGallery={() => setMode("gallery")}
              />
            ) : (
              <GalleryGrid
                key="gallery"
                media={media}
                currentIndex={currentIndex}
                onSelect={handleGallerySelect}
                onClose={onClose}
                onBackToViewer={() => setMode("viewer")}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      )}
    </AnimatePresence>
  );
}
