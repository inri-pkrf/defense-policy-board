import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { TEAM_COLORS } from "@/lib/gameConfig";

export default function TeamPanel({ team, index, isActive, strikeAnimation }) {
  const color = TEAM_COLORS[index];

  return (
    <motion.div
      animate={
        isActive
          ? { scale: 1.02 }
          : { scale: 1 }
      }
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className={`flex-1 rounded-2xl p-3 md:p-4 transition-all duration-300 border-2 ${
        isActive
          ? `${color.bgSoft} ${color.border} ${color.glow}`
          : `bg-white/50 ${color.borderDim} opacity-70`
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Team Name + Score */}
        <div className="text-right min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: color.solid }}
            />
            <div className={`text-sm md:text-lg font-bold truncate font-body ${isActive ? "text-slate-800" : "text-slate-500"}`}>
              {team.name}
            </div>
          </div>
          <div className="text-2xl md:text-4xl font-heading font-bold text-slate-800">
            {team.score}
          </div>
        </div>

        {/* Active indicator + Strike */}
        <div className="flex flex-col items-center gap-2">
          {isActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: color.solid }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-slate-900 text-xs md:text-sm font-bold font-body">משחקים עכשיו</span>
            </motion.div>
          )}

          {/* Strike badge */}
          {team.strikes > 0 && (
            <motion.div
              initial={strikeAnimation ? { y: -40, opacity: 0, scale: 0.5 } : { scale: 1, opacity: 1 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-400/50"
            >
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
              <span className="text-orange-300 text-sm md:text-base font-bold font-body">
                {team.strikes}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}