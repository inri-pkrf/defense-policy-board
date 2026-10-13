import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Check } from "lucide-react";
import { LEVEL_COLORS } from "@/lib/gameConfig";
import { playClick } from "@/lib/sounds";

export default function GameCard({ card, onClick, disabled }) {
  const [flipping, setFlipping] = useState(false);
  const colors = LEVEL_COLORS[card.level];

  if (card.opened) {
    return (
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-slate-400 flex items-center justify-center opacity-50 shadow-inner min-h-[100px] md:min-h-[140px] flex-1 overflow-hidden">
        <Shield className="absolute inset-0 m-auto w-12 h-12 text-slate-300/60" strokeWidth={1} />
        <span className="text-slate-400 text-2xl md:text-4xl font-heading z-10">{card.level}</span>
        <div className="absolute top-1 right-2 text-green-500 text-xs font-bold">✓</div>
      </div>
    );
  }

  const handleClick = () => {
    if (disabled || flipping) return;
    playClick();
    setFlipping(true);
    setTimeout(() => onClick(card), 450);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={flipping ? { rotateY: 90, transition: { duration: 0.45 } } : {}}
      className={`relative rounded-2xl bg-gradient-to-b ${colors.gradient} border-4 ${colors.border} flex items-center justify-center shadow-lg hover:shadow-2xl transition-all min-h-[100px] md:min-h-[140px] flex-1 overflow-hidden ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <Shield className="absolute inset-0 m-auto w-16 h-16 text-white/15" strokeWidth={1} />
      <span className="text-white text-3xl md:text-5xl font-heading drop-shadow-lg z-10">{card.level}</span>
    </motion.button>
  );
}