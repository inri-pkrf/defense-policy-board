import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info, AlertTriangle, Shield, Clock } from "lucide-react";
import TrueFalseTask from "./tasks/TrueFalseTask";
import MultipleChoiceTask from "./tasks/MultipleChoiceTask";
import MatchingTask from "./tasks/MatchingTask";
import OrderingTask from "./tasks/OrderingTask";
import { playCorrect, playWrong, playTimeout, playTick } from "@/lib/sounds";

const cleanText = (text) => text.replace(/^מדרג\s*\d+[\.\):\s\-]*/i, "").replace(/^\d+[\.\):\s\-]+/, "").trim();

export default function TaskModal({ card, teamName, teamColor, onResult, onNext, readOnly, readOnlyTeamName, onAnswer, lastAnswer, timedMode, timeLimit = 30 }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [points, setPoints] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  // Reset timer when card changes
  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [card.id, timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (!timedMode || answered) return;
    if (timeLeft <= 0) {
      if (!readOnly) {
        setAnswered(true);
        setIsCorrect(false);
        setPoints(0);
        playTimeout();
        if (onAnswer) onAnswer(card, { is_correct: false, timeout: true });
        setTimeout(() => setShowExplanation(true), 900);
      }
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 5 && next > 0 && !readOnly) playTick();
        return next;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timedMode, answered, readOnly, timeLeft, card.id]);

  const handleSelect = (answer) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    const correct = answer === card.correct_answer;
    setIsCorrect(correct);
    setPoints(correct ? card.level : 0);
    if (correct) playCorrect(); else playWrong();
    if (onAnswer) onAnswer(card, { selected_answer: answer, is_correct: correct });
    setTimeout(() => setShowExplanation(true), 900);
  };

  const handleCheck = (correct, earnedPoints) => {
    setAnswered(true);
    setIsCorrect(correct);
    setPoints(earnedPoints);
    if (correct) playCorrect(); else playWrong();
    if (onAnswer) onAnswer(card, { is_correct: correct });
    setTimeout(() => setShowExplanation(true), 900);
  };

  const handleMatchUpdate = (matches) => {
    if (onAnswer) onAnswer(card, { matches });
  };

  const handleOrderUpdate = (order) => {
    if (onAnswer) onAnswer(card, { order });
  };

  const handleNext = () => {
    onResult(card, isCorrect, points);
    onNext();
  };

  // === READ-ONLY VIEWS (other teams in online mode) ===
  const renderReadOnly = () => {
    const hasResult = lastAnswer && lastAnswer.card_id === card.id && lastAnswer.is_correct !== undefined && lastAnswer.is_correct !== null;

    if (card.type === "matching") {
      const pairs = card.matching_pairs || [];
      const currentMatches = lastAnswer?.matches || [];
      return (
        <div className="space-y-5">
          <p className="text-xl md:text-2xl font-semibold text-slate-800 text-center leading-relaxed font-body">{card.question}</p>
          <div className="space-y-2 max-w-2xl mx-auto">
            {pairs.map((pair, i) => {
              const match = currentMatches.find((m) => m.term === pair.term);
              const matchedDef = match?.definition;
              const isPairCorrect = hasResult && match ? pair.definition === matchedDef : null;
              return (
                <div key={i} className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 font-body ${hasResult ? (isPairCorrect ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700") : match ? "bg-indigo-100 border-indigo-400 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                  <span className="font-bold flex-1 truncate">{pair.term}</span>
                  <span className="text-slate-400">←</span>
                  <span className="flex-1 truncate">{matchedDef || (hasResult ? "חסר" : "ממתין...")}</span>
                  {hasResult && isPairCorrect === true && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  {hasResult && isPairCorrect === false && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
          {renderResultAndExplanation(hasResult)}
        </div>
      );
    }

    if (card.type === "ordering") {
      const correctActions = card.ordering_actions || [];
      const currentOrder = lastAnswer?.order || [];
      return (
        <div className="space-y-5">
          <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <p className="text-lg md:text-xl font-semibold text-orange-800 leading-relaxed font-body">{card.question}</p>
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            {(currentOrder.length > 0 ? currentOrder : correctActions).map((action, i) => {
              const isPosCorrect = hasResult ? action === correctActions[i] : null;
              return (
                <div key={i} className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 font-body ${hasResult ? (isPosCorrect ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700") : "bg-white border-slate-300 text-slate-700"}`}>
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-sm flex-shrink-0">{i + 1}</span>
                  <span className="flex-1 font-medium">{cleanText(action)}</span>
                  {hasResult && isPosCorrect === true && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  {hasResult && isPosCorrect === false && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
          {renderResultAndExplanation(hasResult)}
        </div>
      );
    }

    // true_false & multiple_choice (existing)
    const options = card.type === "true_false" ? ["אמת", "שקר"] : card.options || [];
    return (
      <div className="space-y-6">
        <p className="text-2xl md:text-3xl font-semibold text-slate-800 text-center leading-relaxed font-body">{card.question}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
          {options.map((option, i) => {
            const isSelected = hasResult && lastAnswer.selected_answer === option;
            const isCorrectOpt = option === card.correct_answer;
            let cls = "bg-white border-slate-300 text-slate-600";
            if (hasResult) {
              if (isCorrectOpt) cls = "bg-green-100 border-green-500 text-green-700";
              else if (isSelected) cls = "bg-red-100 border-red-500 text-red-700";
            }
            return (
              <div key={i} className={`p-4 rounded-xl text-lg md:text-xl font-bold text-center border-2 ${cls} font-body flex items-center justify-center gap-2`}>
                {option}
                {hasResult && isCorrectOpt && <Check className="w-5 h-5 text-green-600" />}
                {hasResult && isSelected && !isCorrectOpt && <X className="w-5 h-5 text-red-600" />}
              </div>
            );
          })}
        </div>
        {renderResultAndExplanation(hasResult)}
      </div>
    );
  };

  const renderResultAndExplanation = (hasResult) => {
    if (!hasResult) {
      return (
        <div className="text-center text-slate-500 text-lg font-body animate-pulse">
          {card.type === "matching" ? "קבוצה " + readOnlyTeamName + " מתאימה זוגות..." : card.type === "ordering" ? "קבוצה " + readOnlyTeamName + " מסדרת פעולות..." : "קבוצה " + readOnlyTeamName + " עונה כעת..."}
        </div>
      );
    }
    return (
      <>
        <div className="text-center">
          <div className={`inline-block px-6 py-3 rounded-2xl ${lastAnswer.is_correct ? "bg-green-100 border-2 border-green-400" : "bg-red-100 border-2 border-red-400"}`}>
            <span className={`text-2xl font-heading font-bold ${lastAnswer.is_correct ? "text-green-600" : "text-red-600"}`}>
              {lastAnswer.is_correct ? `תשובה נכונה! +${card.level}` : "תשובה שגויה"}
            </span>
          </div>
        </div>
        {card.explanation && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 md:p-5 flex gap-3">
            <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <p className="text-blue-800 text-lg md:text-xl leading-relaxed font-body">{card.explanation}</p>
          </div>
        )}
      </>
    );
  };

  const renderTask = () => {
    if (readOnly) return renderReadOnly();
    if (card.type === "true_false") return <TrueFalseTask question={card} answered={answered} selectedAnswer={selectedAnswer} correctAnswer={card.correct_answer} onSelect={handleSelect} />;
    if (card.type === "multiple_choice") return <MultipleChoiceTask question={card} answered={answered} selectedAnswer={selectedAnswer} correctAnswer={card.correct_answer} onSelect={handleSelect} />;
    if (card.type === "matching") return <MatchingTask question={card} onCheck={handleCheck} onMatchUpdate={handleMatchUpdate} />;
    if (card.type === "ordering") return <OrderingTask question={card} onCheck={handleCheck} onOrderUpdate={handleOrderUpdate} />;
    return null;
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-white rounded-3xl shadow-2xl border-4 border-[#00668C] max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
          {/* Shield pattern background */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%2300668C'%3E%3Cpath d='M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z'/%3E%3C/svg%3E")`, backgroundSize: "80px 80px" }} />

          {/* Timer bar */}
          {timedMode && (
            <div className="px-4 md:px-8 pt-4 relative z-10">
              <div className={`relative h-8 bg-slate-200 rounded-full overflow-hidden border-2 ${timeLeft <= 5 && !answered ? "border-red-500 animate-pulse" : "border-[#00668C]/30"}`}>
                <motion.div className={`h-full rounded-full ${timeLeft <= 5 && !answered ? "bg-red-500" : "bg-gradient-to-l from-[#1CB87E] to-[#00B4EF]"}`} animate={{ width: `${Math.max(0, (timeLeft / timeLimit) * 100)}%` }} transition={{ duration: 0.3, ease: "linear" }} />
                <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold font-body ${timeLeft <= 5 && !answered ? "text-red-600" : "text-slate-700"}`}>
                  <Clock className="w-4 h-4 ml-1" />
                  {Math.max(0, Math.ceil(timeLeft))} שניות
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-[#00668C]/20 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative rounded-xl px-4 py-2" style={{ background: `linear-gradient(to bottom, ${teamColor?.solid}, ${teamColor?.solidDark})` }}>
                <Shield className="absolute inset-0 m-auto w-8 h-8 text-white/20" strokeWidth={1} />
                <span className="text-2xl font-heading font-bold text-white z-10 relative">{card.level}</span>
              </div>
              <div>
                <div className="text-slate-400 text-sm font-body">{readOnly ? "עונה כעת" : "תור"}</div>
                <div className="text-slate-800 text-xl font-bold font-body">{readOnly ? readOnlyTeamName : teamName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm md:text-base font-body">
              <Shield className="w-4 h-4 text-[#00668C]" />
              {card.type === "true_false" && "אמת / שקר"}
              {card.type === "multiple_choice" && "בחירה מרובה"}
              {card.type === "matching" && "התאמת מושגים"}
              {card.type === "ordering" && "סידור פעולות"}
            </div>
          </div>

          {/* Task */}
          <div className="p-6 md:p-8 relative z-10">{renderTask()}</div>

          {/* Result + Explanation (interactive only) */}
          <AnimatePresence>
            {answered && !readOnly && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-6 md:px-8 relative z-10">
                <div className={`rounded-2xl p-4 flex items-center gap-3 mb-2 ${isCorrect ? "bg-green-100 border-2 border-green-400" : "bg-red-100 border-2 border-red-400"}`}>
                  {isCorrect ? <Check className="w-8 h-8 text-green-600 flex-shrink-0" /> : <X className="w-8 h-8 text-red-600 flex-shrink-0" />}
                  <span className={`text-2xl font-heading font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>{isCorrect ? `תשובה נכונה! +${points}` : points > 0 ? `תשובה חלקית +${points}` : "תשובה שגויה"}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showExplanation && !readOnly && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-6 md:px-8 pb-2 relative z-10">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 md:p-5 flex gap-3">
                <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <p className="text-blue-800 text-lg md:text-xl leading-relaxed font-body">{card.explanation}</p>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <div className="p-4 md:p-6 border-t-2 border-[#00668C]/20 relative z-10">
            {readOnly ? (
              <div className="text-center text-slate-500 text-lg font-body">
                {lastAnswer && lastAnswer.card_id === card.id && lastAnswer.is_correct !== undefined && lastAnswer.is_correct !== null ? "תוצאות התשובה מוצגות לעיל" : <span className="animate-pulse">ממתינים לתשובת קבוצה {readOnlyTeamName}...</span>}
              </div>
            ) : (
              <>
                {!answered && <div className="text-center text-slate-500 text-lg font-body">{card.type === "matching" ? "התאימו ולחצו 'בדיקת תשובות'" : card.type === "ordering" ? "סדרו ולחצו 'בדיקת תשובות'" : "בחרו תשובה..."}</div>}
                {answered && !showExplanation && <div className="text-center text-slate-600 text-lg font-body">טוענים הסבר...</div>}
                {showExplanation && (
                  <div className="text-center">
                    <button onClick={handleNext} className="px-12 py-4 bg-gradient-to-b from-[#F49833] to-[#EF626C] hover:from-[#FFC745] hover:to-[#F49833] rounded-2xl text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 font-body">המשיכו ←</button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}