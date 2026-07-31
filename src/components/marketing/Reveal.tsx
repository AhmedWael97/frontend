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
 * Ambient gradient blobs + faint grid, same visual language as the homepage
 * hero. Pass `id`-free — purely decorative, aria-hidden. Blobs drift slowly
 * (CSS keyframes, not framer-motion) so they animate even before JS hydrates.
 */
export function GradientBlobs({ variant = "default" }: { variant?: "default" | "compact" }) {
  const big = variant === "default";
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: "@keyframes eyeDrift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(2%,-3%) scale(1.05)}}",
        }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className={`absolute top-[-14%] ltr:left-[8%] rtl:right-[8%] ${big ? "w-[620px] h-[620px]" : "w-[380px] h-[380px]"} max-w-[110vw] rounded-full bg-indigo-500/12 dark:bg-indigo-600/10 blur-[120px]`}
          style={{ animation: "eyeDrift 14s ease-in-out infinite" }}
        />
        <div
          className={`absolute top-[10%] ltr:right-[2%] rtl:left-[2%] ${big ? "w-[440px] h-[440px]" : "w-[280px] h-[280px]"} max-w-[100vw] rounded-full bg-violet-500/12 dark:bg-violet-600/10 blur-[110px]`}
          style={{ animation: "eyeDrift 18s ease-in-out infinite 1.2s" }}
        />
        <div
          className="absolute bottom-[-4%] ltr:left-[4%] rtl:right-[4%] w-[300px] h-[300px] rounded-full bg-pink-500/8 dark:bg-pink-600/6 blur-[100px]"
          style={{ animation: "eyeDrift 16s ease-in-out infinite 0.6s" }}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(130,130,170,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(130,130,170,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 75% 55% at 50% 0%, #000 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 55% at 50% 0%, #000 55%, transparent 100%)",
        }}
      />
    </>
  );
}
