import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Link2, Unlink } from "lucide-react";
import { shuffle } from "@/lib/shuffle";

export default function MatchingTask({ question, onCheck, onMatchUpdate }) {
  const pairs = question.matching_pairs || [];
  const [shuffledTerms, setShuffledTerms] = useState([]);
  const [shuffledDefs, setShuffledDefs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null); // { type: "term"|"def", value: string }
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setShuffledTerms(shuffle(pairs.map((p) => p.term)));
    setShuffledDefs(shuffle(pairs.map((p) => p.definition)));
    setMatches([]);
    setSelected(null);
    setChecked(false);
  }, [question.id]);

  const updateMatches = (newMatches) => {
    setMatches(newMatches);
    if (onMatchUpdate) onMatchUpdate(newMatches);
  };

  const handleTermClick = (term) => {
    if (checked) return;
    const existing = matches.find((m) => m.term === term);
    if (existing) {
      updateMatches(matches.filter((m) => m.term !== term));
      return;
    }
    if (selected?.type === "def") {
      const filtered = matches.filter((m) => m.definition !== selected.value);
      updateMatches([...filtered, { term, definition: selected.value }]);
      setSelected(null);
    } else {
      setSelected({ type: "term", value: term });
    }
  };

  const handleDefClick = (def) => {
    if (checked) return;
    const existing = matches.find((m) => m.definition === def);
    if (existing) {
      updateMatches(matches.filter((m) => m.definition !== def));
      return;
    }
    if (selected?.type === "term") {
      const filtered = matches.filter((m) => m.term !== selected.value);
      updateMatches([...filtered, { term: selected.value, definition: def }]);
      setSelected(null);
    } else {
      setSelected({ type: "def", value: def });
    }
  };

  const handleCheck = () => {
    setChecked(true);
    const correctCount = matches.filter((m) => {
      const pair = pairs.find((p) => p.term === m.term);
      return pair && pair.definition === m.definition;
    }).length;
    const total = pairs.length;
    const isCorrect = correctCount === total;
    const points = Math.round((correctCount / total) * question.level);
    onCheck(isCorrect, points);
  };

  const getMatchedDef = (term) => matches.find((m) => m.term === term)?.definition;
  const getMatchedTerm = (def) => matches.find((m) => m.definition === def)?.term;
  const isTermCorrect = (term) => {
    const match = matches.find((m) => m.term === term);
    if (!match) return null;
    const pair = pairs.find((p) => p.term === term);
    return pair && pair.definition === match.definition;
  };
  const isDefCorrect = (def) => {
    const match = matches.find((m) => m.definition === def);
    if (!match) return null;
    const pair = pairs.find((p) => p.definition === def);
    return pair && pair.term === match.term;
  };

  const matchColors = ["bg-blue-100 border-blue-400 text-blue-700", "bg-purple-100 border-purple-400 text-purple-700", "bg-teal-100 border-teal-400 text-teal-700", "bg-amber-100 border-amber-400 text-amber-700", "bg-pink-100 border-pink-400 text-pink-700", "bg-indigo-100 border-indigo-400 text-indigo-700"];
  const getMatchColor = (idx) => matchColors[idx % matchColors.length];
  const getMatchIndex = (term) => matches.findIndex((m) => m.term === term);

  return (
    <div className="space-y-6">
      <p className="text-xl md:text-2xl font-semibold text-slate-800 text-center leading-relaxed font-body">{question.question}</p>

      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {/* Terms (right side in RTL) */}
        <div className="space-y-2 md:space-y-3">
          <div className="text-center text-sm font-bold text-slate-500 mb-2 font-body">מושגים</div>
          {shuffledTerms.map((term) => {
            const matched = getMatchedDef(term);
            const isSelected = selected?.type === "term" && selected.value === term;
            const correct = checked ? isTermCorrect(term) : null;
            const matchIdx = getMatchIndex(term);
            return (
              <button key={term} onClick={() => handleTermClick(term)} disabled={checked} className={`w-full p-3 md:p-4 rounded-xl text-right text-base md:text-lg font-bold border-2 transition-all font-body ${checked ? (correct === true ? "bg-green-100 border-green-500 text-green-700" : correct === false ? "bg-red-100 border-red-500 text-red-700" : "bg-slate-100 border-slate-300 text-slate-500") : isSelected ? "bg-indigo-200 border-indigo-500 text-indigo-800 scale-105" : matched ? getMatchColor(matchIdx) : "bg-white border-slate-300 text-slate-700 hover:border-indigo-400"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{term}</span>
                  {checked && correct === true && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  {checked && correct === false && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                  {checked && correct === null && <span className="text-xs flex-shrink-0">חסר</span>}
                  {!checked && matched && <Link2 className="w-4 h-4 flex-shrink-0 opacity-60" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Definitions (left side in RTL) */}
        <div className="space-y-2 md:space-y-3">
          <div className="text-center text-sm font-bold text-slate-500 mb-2 font-body">הגדרות</div>
          {shuffledDefs.map((def) => {
            const matched = getMatchedTerm(def);
            const isSelected = selected?.type === "def" && selected.value === def;
            const correct = checked ? isDefCorrect(def) : null;
            const matchIdx = matched ? matches.findIndex((m) => m.definition === def) : -1;
            return (
              <button key={def} onClick={() => handleDefClick(def)} disabled={checked} className={`w-full p-3 md:p-4 rounded-xl text-right text-base md:text-lg border-2 transition-all font-body ${checked ? (correct === true ? "bg-green-100 border-green-500 text-green-700" : correct === false ? "bg-red-100 border-red-500 text-red-700" : "bg-slate-100 border-slate-300 text-slate-500") : isSelected ? "bg-indigo-200 border-indigo-500 text-indigo-800 scale-105" : matched ? getMatchColor(matchIdx) : "bg-white border-slate-300 text-slate-700 hover:border-indigo-400"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{def}</span>
                  {checked && correct === true && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  {checked && correct === false && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                  {checked && correct === null && <span className="text-xs flex-shrink-0">חסר</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Check button */}
      <AnimatePresence>
        {!checked && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center pt-2">
            <button onClick={handleCheck} className="px-8 py-4 bg-gradient-to-b from-[#F49833] to-[#EF626C] hover:from-[#FFC745] hover:to-[#F49833] rounded-2xl text-lg font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 font-body">בדיקת תשובות</button>
            <p className="text-slate-500 text-sm mt-3 font-body">{selected ? "בחרו פריט מהטור השני להתאמה" : "לחצו על מושג ואז על הגדרה להתאמה · ניתן לטעות ולבטל"}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}