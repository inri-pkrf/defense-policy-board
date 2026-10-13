import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { TEAM_COLORS } from "@/lib/gameConfig";

export default function ScorePopup({ popup, teams, numTeams = 2 }) {
  const getTargetX = () => {
    if (!popup) return 0;
    if (numTeams === 3) {
      if (popup.teamIndex === 0) return 280;
      if (popup.teamIndex === 2) return -280;
      return 0;
    }
    return popup.teamIndex === 0 ? 220 : -220;
  };

  return (
    <AnimatePresence>
      {popup && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0, x: 0, y: 0 }}
          animate={{ scale: 1.3, opacity: 1, x: getTargetX(), y: -220 }}
          exit={{ scale: 0.7, opacity: 0, x: getTargetX(), y: -280 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none flex flex-col items-center"
        >
          <div
            className="text-6xl md:text-8xl font-heading drop-shadow-2xl"
            style={{ color: TEAM_COLORS[popup.teamIndex]?.solid }}
          >
            +{popup.points}
          </div>
          {popup.strikes >= 2 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
              className="flex items-center gap-1 text-xl md:text-3xl font-bold mt-1 font-body"
              style={{ color: "#F49833" }}
            >
              <Flame className="w-5 h-5 md:w-7 md:h-7" />
              רצף {popup.strikes}!
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}