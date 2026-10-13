import React from "react";
import { motion } from "framer-motion";

export default function ScoreBar({ teamA, teamB, scoreA, scoreB, currentTurn, cardsLeft }) {
  const isTurnA = currentTurn === "A";

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-b from-slate-900 to-slate-800 border-b-2 border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Team A */}
          <div className={`flex-1 rounded-2xl p-3 md:p-4 transition-all duration-300 ${
            isTurnA ? "bg-blue-600/30 border-2 border-blue-400 scale-105" : "bg-blue-900/20 border-2 border-blue-800/50 opacity-60"
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="text-right">
                <div className="text-xs md:text-sm text-blue-200 font-medium truncate">{teamA}</div>
                <div className="text-2xl md:text-4xl font-black text-white">{scoreA}</div>
              </div>
              {isTurnA && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-1 md:px-3 md:py-1.5 bg-blue-400 text-slate-900 text-xs md:text-sm font-bold rounded-full whitespace-nowrap"
                >
                  תורך!
                </motion.div>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center px-1 md:px-2">
            <div className="text-xs text-slate-400 mb-1">נותרו</div>
            <div className="text-xl md:text-3xl font-black text-orange-400">{cardsLeft}</div>
            <div className="text-xs text-slate-400 mt-1">קלפים</div>
          </div>

          {/* Team B */}
          <div className={`flex-1 rounded-2xl p-3 md:p-4 transition-all duration-300 ${
            !isTurnA ? "bg-orange-600/30 border-2 border-orange-400 scale-105" : "bg-orange-900/20 border-2 border-orange-800/50 opacity-60"
          }`}>
            <div className="flex items-center justify-between gap-2">
              {!isTurnA && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-1 md:px-3 md:py-1.5 bg-orange-400 text-slate-900 text-xs md:text-sm font-bold rounded-full whitespace-nowrap"
                >
                  תורך!
                </motion.div>
              )}
              <div className="text-left">
                <div className="text-xs md:text-sm text-orange-200 font-medium truncate">{teamB}</div>
                <div className="text-2xl md:text-4xl font-black text-white">{scoreB}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}