"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const DEFAULT_SCALE_WORDS = [
  "gets an answer.",
  "books an appointment.",
  "speaks their language.",
  "never waits on hold."
];

export const ScaleInText = ({
  text = "gets an answer.",
  words = DEFAULT_SCALE_WORDS,
  duration = 3400,
  className = "",
  style = {},
}) => {
  const wordsList = words && words.length > 0 ? words : [text];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (wordsList.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % wordsList.length);
    }, duration);
    return () => clearInterval(interval);
  }, [wordsList.length, duration]);

  const currentText = wordsList[index % wordsList.length];

  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        verticalAlign: "baseline",
        fontSize: "inherit",
        fontWeight: "inherit",
        fontFamily: "inherit",
        letterSpacing: "inherit",
        lineHeight: "inherit",
        color: "#0091FF",
        ...style,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={currentText}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.85, 
            transition: { duration: 0.25, ease: "easeOut" } 
          }}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            fontSize: "inherit",
            fontWeight: "inherit",
            fontFamily: "inherit",
            letterSpacing: "inherit",
            lineHeight: "inherit",
            color: "#0091FF",
          }}
        >
          {currentText.split("").map((char, i) => (
            <motion.span
              key={currentText + "_" + i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.05,
                type: "spring",
                stiffness: 150,
                damping: 10,
              }}
              className="inline-block"
              style={{
                display: "inline-block",
                fontSize: "inherit",
                fontWeight: "inherit",
                fontFamily: "inherit",
                letterSpacing: "inherit",
                lineHeight: "inherit",
                color: "#0091FF",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default ScaleInText;

