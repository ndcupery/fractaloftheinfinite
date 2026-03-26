import { createFileRoute } from "@tanstack/react-router";
import { Gallery } from "@/components/pages/Gallery";

export const Route = createFileRoute("/gallery/")({
  component: Gallery,
});
