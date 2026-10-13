import React from "react";
import { motion } from "framer-motion";

export default function TrueFalseTask({ question, answered, selectedAnswer, correctAnswer, onSelect }) {
  const isCorrect = answered && selectedAnswer === correctAnswer;

  const getButtonClass = (option) => {
    if (!answered) {
      return option === "אמת"
        ? "bg-green-100 border-green-400 text-green-700 hover:bg-green-200"
        : "bg-red-100 border-red-400 text-red-700 hover:bg-red-200";
    }
    if (selectedAnswer === option) {
      return isCorrect
        ? "bg-green-500 border-green-400 text-white shadow-2xl shadow-green-500/30"
        : "bg-red-500 border-red-400 text-white shadow-2xl shadow-red-500/30";
    }
    if (option === correctAnswer) {
      return "bg-green-400 border-green-300 text-white";
    }
    return "bg-slate-100 border-slate-300 text-slate-400";
  };

  return (
    <div className="space-y-6">
      <p className="text-2xl md:text-3xl font-semibold text-slate-800 text-center leading-relaxed font-body">
        {question.question}
      </p>
      <div className="flex gap-4 md:gap-6 justify-center max-w-2xl mx-auto">
        <motion.button
          whileHover={!answered ? { scale: 1.05 } : {}}
          whileTap={!answered ? { scale: 0.95 } : {}}
          onClick={() => !answered && onSelect("אמת")}
          disabled={answered}
          className={`flex-1 py-8 md:py-10 rounded-2xl text-3xl md:text-4xl font-black transition-all border-4 ${getButtonClass("אמת")}`}
        >
          ✓ אמת
        </motion.button>
        <motion.button
          whileHover={!answered ? { scale: 1.05 } : {}}
          whileTap={!answered ? { scale: 0.95 } : {}}
          onClick={() => !answered && onSelect("שקר")}
          disabled={answered}
          className={`flex-1 py-8 md:py-10 rounded-2xl text-3xl md:text-4xl font-black transition-all border-4 ${getButtonClass("שקר")}`}
        >
          ✗ שקר
        </motion.button>
      </div>
    </div>
  );
}