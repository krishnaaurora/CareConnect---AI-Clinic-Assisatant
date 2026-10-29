"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const DEFAULT_FLIP_WORDS = [
  "gets an answer.",
  "books an appointment.",
  "speaks their language.",
  "never waits on hold."
];

export const FlipWords = ({
  words = DEFAULT_FLIP_WORDS,
  duration = 2600,
  className = "",
  style = {},
}) => {
  const [index, setIndex] = useState(0);
  const wordsList = words && words.length > 0 ? words : DEFAULT_FLIP_WORDS;
  const currentWord = wordsList[index % wordsList.length];

  // Stable timer that ticks every duration ms without being cancelled by parent re-renders
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % wordsList.length);
    }, duration);
    return () => clearInterval(timer);
  }, [wordsList.length, duration]);

  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        verticalAlign: "baseline",
        ...style,
      }}
      className="flip-words-wrapper"
    >
      <AnimatePresence>
        <motion.span
          key={currentWord}
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 0.8,
          }}
          exit={{
            opacity: 0,
            y: -38,
            x: 20,
            filter: "blur(6px)",
            scale: 1.15,
            position: "absolute",
            top: 0,
            left: 0,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.35,
            },
          }}
          className={cn(
            "z-10 inline-block relative text-left whitespace-nowrap",
            className
          )}
          style={{
            fontSize: "inherit",
            fontWeight: "inherit",
            lineHeight: "inherit",
            fontFamily: "inherit",
            letterSpacing: "inherit",
            background: "linear-gradient(135deg, #0091FF 0%, #00C9A7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "#00C9A7",
          }}
        >
          {currentWord.split(" ").map((word, wordIndex) => (
            <motion.span
              key={word + wordIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: wordIndex * 0.16,
                duration: 0.3,
                type: "spring",
                stiffness: 120,
                damping: 12,
              }}
              className="inline-block whitespace-nowrap"
              style={{
                fontSize: "inherit",
                fontWeight: "inherit",
                lineHeight: "inherit",
                fontFamily: "inherit",
                letterSpacing: "inherit",
              }}
            >
              {word.split("").map((letter, letterIndex) => (
                <motion.span
                  key={word + letterIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: wordIndex * 0.16 + letterIndex * 0.035,
                    duration: 0.22,
                    type: "spring",
                    stiffness: 140,
                    damping: 14,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="inline-block"
                  style={{
                    fontSize: "inherit",
                    fontWeight: "inherit",
                    lineHeight: "inherit",
                    fontFamily: "inherit",
                    letterSpacing: "inherit",
                  }}
                >
                  {letter}
                </motion.span>
              ))}
              <span className="inline-block">&nbsp;</span>
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default FlipWords;
