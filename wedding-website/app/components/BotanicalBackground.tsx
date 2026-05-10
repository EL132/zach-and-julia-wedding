"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export default function BotanicalBackground() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const topLeftY = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const topRightY = useTransform(scrollYProgress, [0, 1], [0, -16]);
  const bottomLeftY = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const bottomRightY = useTransform(scrollYProgress, [0, 1], [0, -12]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={shouldReduceMotion ? {} : { y: topLeftY }}
        className="absolute left-0 top-8 w-[340px] opacity-10 sm:w-[420px]"
      >
        <svg viewBox="0 0 320 360" className="h-full w-full">
          <path
            d="M24 312c8-106 68-152 134-164 54-10 78-72 124-78"
            fill="none"
            stroke="#6F7A4B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M58 264c18-24 12-48 34-62m20 45c18-28 44-40 68-30"
            fill="none"
            stroke="#35452C"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <g stroke="#6F7A4B" strokeWidth="1.4" fill="none">
            <path d="M60 200c-4-12 2-24 12-26s16 4 16 16-6 20-16 22-12-0-12-12z" />
            <path d="M90 170c-3-10 3-20 11-21s14 3 14 13-5 17-13 18-12-0-12-10z" transform="rotate(-22 90 170)" />
            <path d="M120 128c-4-12 2-24 12-26s16 4 16 16-6 20-16 22-12-0-12-12z" transform="rotate(18 120 128)" />
            <path d="M180 90c-3-10 3-20 11-21s14 3 14 13-5 17-13 18-12-0-12-10z" />
          </g>
          <g stroke="#A8B58A" strokeWidth="1.2" fill="none">
            <path d="M70 190c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M100 160c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M130 118c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M190 80c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
          </g>
        </svg>
      </motion.div>

      <motion.div
        style={shouldReduceMotion ? {} : { y: topRightY }}
        className="absolute right-0 top-10 hidden w-[260px] opacity-10 sm:block"
      >
        <svg viewBox="0 0 260 320" className="h-full w-full">
          <path
            d="M48 312c22-72 56-116 92-138 26-16 36-58 56-74"
            fill="none"
            stroke="#6F7A4B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M74 226c18-18 34-14 48-8m10-20c10-14 22-22 36-18"
            fill="none"
            stroke="#35452C"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <g stroke="#6F7A4B" strokeWidth="1.3" fill="none">
            <path d="M168 98c-4-12 2-24 12-26s16 4 16 16-6 20-16 22-12-0-12-12z" />
            <path d="M196 142c-3-10 3-20 11-21s14 3 14 13-5 17-13 18-12-0-12-10z" transform="rotate(18 196 142)" />
            <path d="M142 166c-3-10 3-20 11-21s14 3 14 13-5 17-13 18-12-0-12-10z" transform="rotate(-14 142 166)" />
          </g>
          <g stroke="#A8B58A" strokeWidth="1.1" fill="none">
            <path d="M178 88c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M206 132c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M152 156c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
          </g>
        </svg>
      </motion.div>

      <motion.div
        style={shouldReduceMotion ? {} : { y: bottomLeftY }}
        className="absolute left-0 bottom-8 hidden w-[300px] opacity-10 sm:block"
      >
        <svg viewBox="0 0 300 240" className="h-full w-full">
          <path
            d="M18 38c20 56 76 84 134 96 26 6 40 22 52 36"
            fill="none"
            stroke="#6F7A4B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M42 66c10 22 28 28 42 24m-8 18c12 18 32 18 46 10"
            fill="none"
            stroke="#35452C"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <g stroke="#6F7A4B" strokeWidth="1.2" fill="none">
            <path d="M74 136c-4-12 2-24 12-26s16 4 16 16-6 20-16 22-12-0-12-12z" transform="rotate(-12 74 136)" />
            <path d="M110 170c-3-10 3-20 11-21s14 3 14 13-5 17-13 18-12-0-12-10z" />
            <path d="M140 118c-3-10 3-20 11-21s14 3 14 13-5 17-13 18-12-0-12-10z" transform="rotate(24 140 118)" />
          </g>
          <g stroke="#A8B58A" strokeWidth="1.1" fill="none">
            <path d="M84 126c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M120 160c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M150 108c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
          </g>
        </svg>
      </motion.div>

      <motion.div
        style={shouldReduceMotion ? {} : { y: bottomRightY }}
        className="absolute right-0 bottom-12 hidden w-[320px] opacity-10 sm:block"
      >
        <svg viewBox="0 0 320 260" className="h-full w-full">
          <path
            d="M98 10c26 40 50 72 88 104 20 18 30 42 30 72"
            fill="none"
            stroke="#6F7A4B"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M118 66c12 18 24 24 34 28m-6 22c8 16 20 24 30 26"
            fill="none"
            stroke="#35452C"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <g stroke="#6F7A4B" strokeWidth="1.3" fill="none">
            <path d="M212 136c-4-12 2-24 12-26s16 4 16 16-6 20-16 22-12-0-12-12z" transform="rotate(-18 212 136)" />
            <path d="M250 172c-3-10 3-20 11-21s14 3 14 13-5 17-13 18-12-0-12-10z" />
            <path d="M180 198c-3-10 3-20 11-21s14 3 14 13-5 17-13 18-12-0-12-10z" transform="rotate(22 180 198)" />
          </g>
          <g stroke="#A8B58A" strokeWidth="1.2" fill="none">
            <path d="M222 126c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M260 162c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
            <path d="M190 188c-2-6 1-12 6-13s9 2 9 8-3 10-8 11-7-0-7-6z" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
