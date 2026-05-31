"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type RevealDirection = "up" | "down" | "left" | "right" | "top" | "bottom" | "center";

type RevealImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  reveal?: RevealDirection;
  delay?: number;
  priority?: boolean;
};

const maskExitByDirection: Record<RevealDirection, { x?: string; y?: string; scaleX?: number }> = {
  up: { y: "-102%" },
  down: { y: "102%" },
  left: { x: "-102%" },
  right: { x: "102%" },
  top: { y: "-102%" },
  bottom: { y: "102%" },
  center: { scaleX: 0 },
};

const revealEase = [0.22, 1, 0.36, 1] as const;

const viewport = {
  once: true,
  amount: 0.34,
  margin: "0px 0px -4% 0px",
};

export default function RevealImage({
  src,
  alt,
  width,
  height,
  className = "",
  reveal = "left",
  delay = 0,
  priority = false,
}: RevealImageProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="block h-full w-full object-cover"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={`relative overflow-hidden bg-[#EDE5D8] ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <motion.div
        className="h-full w-full"
        variants={{
          hidden: { scale: 1.035, opacity: 0.96 },
          visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 1.25, delay, ease: revealEase },
          },
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="block h-full w-full object-cover"
          priority={priority}
        />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[#F8F4EA]"
        variants={{
          hidden: { x: "0%", y: "0%", scaleX: 1 },
          visible: {
            ...maskExitByDirection[reveal],
            transition: { duration: 1.1, delay, ease: revealEase },
          },
        }}
        style={{ transformOrigin: reveal === "center" ? "center center" : undefined }}
      />
    </motion.div>
  );
}
