import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Calendar, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { projects, getAllTags } from "@/data/projects";
import type { ProjectStatus } from "@/data/projects";

const allTags = getAllTags(projects);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusColors: Record<ProjectStatus, string> = {
  active: "text-accent",
  completed: "text-primary",
  archived: "text-text-muted",
};

export function Gallery() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = activeTag
    ? projects.filter((p) => p.tags.includes(activeTag))
    : projects;

  return (
    <div className="pt-32 pb-20">
      {/* Hero */}
      <section className="px-6 mb-16">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
              <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              Projects, experiments, and ongoing work from the lab.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tag Filter */}
      <section className="px-6 mb-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTag === null
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border text-text-muted hover:text-text hover:border-primary/20"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  tag === activeTag
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border text-text-muted hover:text-text hover:border-primary/20"
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Project Grid */}
      <section className="px-6">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTag ?? "all"}
              variants={container}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((project) => (
                <motion.div key={project.slug} variants={item} layout>
                  <Link
                    to="/gallery/$projectSlug"
                    params={{ projectSlug: project.slug }}
                    className="block h-full"
                  >
                    <Card className="h-full group cursor-pointer hover:border-primary/20 hover:shadow-[0_0_30px_rgba(0,229,255,0.08)] overflow-hidden">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Circle
                            size={8}
                            fill="currentColor"
                            className={statusColors[project.status]}
                          />
                          <span className="text-xs text-text-muted capitalize">
                            {project.status}
                          </span>
                          <span className="text-xs text-text-muted flex items-center gap-1 ml-auto">
                            <Calendar size={12} />
                            {project.startDate}
                          </span>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                      </CardHeader>
                      <CardDescription className="leading-relaxed line-clamp-2">
                        {project.abstract}
                      </CardDescription>
                      <div className="px-6 pb-6 pt-3 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md border border-border text-xs text-text-muted font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
