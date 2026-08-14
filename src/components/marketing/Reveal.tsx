"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Shared scroll-entrance animation primitives for marketing/campaign pages.
 * `viewport={{ once: true }}` so nothing re-triggers on scroll-back (avoids
 * distracting flicker on long pages) and respects prefers-reduced-motion via
 * framer-motion's built-in check.
 */

const upVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section";
}) {
  const MotionTag = as === "section" ? motion.section : motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={upVariants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={upVariants}>
      {children}
    </motion.div>
  );
}

/**
 * Technical grid backdrop for hero/CTA sections on marketing pages. Used to
 * be soft blurred gradient blobs — replaced under the High-Contrast Technical
 * system, which bans diffuse glows outright. Kept the same name/API so every
 * existing call site (`<GradientBlobs />`) picks up the new look for free.
 */
export function GradientBlobs({ variant = "default" }: { variant?: "default" | "compact" }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: `radial-gradient(ellipse ${variant === "compact" ? "65% 65%" : "75% 55%"} at 50% 0%, #000 55%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(ellipse ${variant === "compact" ? "65% 65%" : "75% 55%"} at 50% 0%, #000 55%, transparent 100%)`,
      }}
    />
  );
}
