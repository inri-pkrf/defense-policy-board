import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, Plus, Check, X, Flame } from "lucide-react";
import { TEAM_COLORS } from "@/lib/gameConfig";
import FullscreenButton from "@/components/FullscreenButton";

export default function EndScreen({ teams, onPlayAgain, onNewGame }) {
  useEffect(() => {
    const colors = ["#00B4EF", "#F49833", "#FFC745", "#1CB87E", "#EF626C"];
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
    const interval = setInterval(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors });
    }, 1500);
    const timeout = setTimeout(() => clearInterval(interval), 6000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  const maxScore = Math.max(...teams.map((t) => t.score));
  const winners = teams.filter((t) => t.score === maxScore);
  const isTie = winners.length > 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-blue-50 to-orange-50 text-slate-800 p-4 md:p-8 relative">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="text-center max-w-4xl w-full"
      >
        {/* Trophy */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="inline-flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#FFC745] to-[#F49833] mb-8 shadow-2xl shadow-orange-500/40"
        >
          <Trophy className="w-20 h-20 md:w-24 md:h-24 text-white" strokeWidth={1.5} />
        </motion.div>

        {isTie ? (
          <h1 className="text-5xl md:text-7xl font-heading mb-4">תיקו!</h1>
        ) : (
          <h1 className="text-4xl md:text-6xl font-heading mb-2">הקבוצה המנצחת</h1>
        )}

        {!isTie && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-3xl md:text-5xl font-heading mb-8"
            style={{ color: TEAM_COLORS[winners[0].index]?.solid }}
          >
            {winners[0].name}
          </motion.div>
        )}

        {/* Team Stats */}
        <div className={`grid gap-4 md:gap-6 mb-10 ${teams.length === 2 ? "grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
          {teams.map((team, i) => {
            const color = TEAM_COLORS[team.index];
            const isWinner = !isTie && team.score === maxScore;
            return (
              <motion.div
                key={i}
                initial={{ x: i === 0 ? -50 : 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className={`rounded-3xl p-5 md:p-6 border-2 text-right ${
                  isWinner
                    ? `${color.bgSoft} ${color.border} shadow-lg`
                    : "bg-white/60 border-slate-300 opacity-70"
                }`}
              >
                <div className="flex items-center justify-start gap-2 mb-4">
                  <div className="text-lg md:text-xl font-bold truncate font-body">{team.name}</div>
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color.solid }}
                  />
                </div>
                <div className="text-4xl md:text-5xl font-heading mb-4 text-left" style={{ color: color.solid }}>
                  {team.score}
                </div>
                <div className="space-y-2 text-sm md:text-base font-body">
                  <div className="flex items-center justify-between text-green-600">
                    <span>תשובות נכונות</span>
                    <span className="flex items-center gap-1 font-bold">
                      <Check className="w-4 h-4" />
                      {team.correct}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-red-600">
                    <span>תשובות שגויות</span>
                    <span className="flex items-center gap-1 font-bold">
                      <X className="w-4 h-4" />
                      {team.wrong}
                    </span>
                  </div>
                  {team.bestStrike > 0 && (
                    <div className="flex items-center justify-between text-orange-600">
                      <span>רצף מירבי</span>
                      <span className="flex items-center gap-1 font-bold">
                        <Flame className="w-4 h-4" />
                        {team.bestStrike}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 px-8 py-5 bg-gradient-to-b from-[#F49833] to-[#EF626C] hover:from-[#FFC745] hover:to-[#F49833] rounded-2xl text-xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 font-body"
          >
            <RotateCcw className="w-6 h-6" />
            שחקו שוב
          </button>
          <button
            onClick={onNewGame}
            className="flex items-center justify-center gap-2 px-8 py-5 bg-slate-200 hover:bg-slate-300 rounded-2xl text-xl font-bold text-slate-700 transition-all hover:scale-105 active:scale-95 font-body"
          >
            <Plus className="w-6 h-6" />
            משחק חדש
          </button>
        </div>
      </motion.div>
      <div className="fixed top-4 left-4 z-50">
        <FullscreenButton />
      </div>
    </div>
  );
}