import React from "react";
import { motion } from "framer-motion";

export default function MultipleChoiceTask({ question, answered, selectedAnswer, correctAnswer, onSelect }) {
  const getOptionClass = (option) => {
    if (!answered) {
      return "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200";
    }
    if (option === correctAnswer) {
      return "bg-green-500 border-green-400 text-white shadow-2xl shadow-green-500/30";
    }
    if (option === selectedAnswer) {
      return "bg-red-500 border-red-400 text-white shadow-2xl shadow-red-500/30";
    }
    return "bg-slate-100 border-slate-300 text-slate-400";
  };

  return (
    <div className="space-y-6">
      <p className="text-2xl md:text-3xl font-semibold text-slate-800 text-center leading-relaxed font-body">
        {question.question}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
        {question.options.map((option, idx) => (
          <motion.button
            key={idx}
            whileHover={!answered ? { scale: 1.03 } : {}}
            whileTap={!answered ? { scale: 0.97 } : {}}
            onClick={() => !answered && onSelect(option)}
            disabled={answered}
            className={`p-5 md:p-6 rounded-2xl text-xl md:text-2xl font-bold transition-all border-2 text-right ${getOptionClass(option)}`}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}