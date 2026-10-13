import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Settings, Monitor, Wifi, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import ScreenHeader from "@/components/ScreenHeader";
import { TEAM_COLORS, CARD_COUNT_OPTIONS } from "@/lib/gameConfig";
import OnlineSetup from "@/components/online/OnlineSetup";
import { KeyboardInput } from "@/components/CustomKeyboard";

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export default function StartScreen({ onStart }) {
  const [step, setStep] = useState("intro");
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState(["", "", ""]);
  const [cardCount, setCardCount] = useState(9);
  const [showError, setShowError] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);

  const handleNameChange = (idx, value) => {
    const updated = [...teamNames];
    updated[idx] = value;
    setTeamNames(updated);
    if (showError && value.trim()) setShowError(false);
  };

  const handleSameScreenStart = () => {
    const names = teamNames.slice(0, numTeams).map((n) => n.trim());
    if (names.some((n) => !n)) { setShowError(true); return; }
    onStart({ gameMode: "same_screen", teamNames: names, cardCount, numTeams, timedMode, timeLimit });
  };

  const allNamesFilled = teamNames.slice(0, numTeams).every((n) => n.trim());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-orange-50 to-blue-50 text-slate-800 p-4 md:p-8 relative overflow-hidden" dir="rtl">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-[#00B4EF]/10 blur-3xl" animate={{ scale: [1, 1.3, 1], x: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-20 left-10 w-52 h-52 rounded-full bg-[#F49833]/10 blur-3xl" animate={{ scale: [1, 1.4, 1], x: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-[#1CB87E]/10 blur-3xl" animate={{ scale: [1, 1.5, 1], y: [0, -25, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-1/3 right-1/4 w-36 h-36 rounded-full bg-[#EF626C]/10 blur-3xl" animate={{ scale: [1, 1.3, 1], y: [0, 25, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-20 left-16 opacity-[0.05]" animate={{ rotate: [0, 10, 0], y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className="w-44 h-44 text-[#00668C]" strokeWidth={1} />
        </motion.div>
        <motion.div className="absolute bottom-32 right-16 opacity-[0.05]" animate={{ rotate: [0, -10, 0], y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className="w-36 h-36 text-[#F49833]" strokeWidth={1} />
        </motion.div>
        <motion.div className="absolute top-1/2 right-1/3 opacity-[0.04]" animate={{ rotate: [0, 15, 0], x: [0, 20, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className="w-28 h-28 text-[#1CB87E]" strokeWidth={1} />
        </motion.div>
        <motion.div className="absolute top-1/4 right-1/2 opacity-[0.03]" animate={{ rotate: [0, -8, 0], y: [0, 15, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className="w-24 h-24 text-[#00B4EF]" strokeWidth={1} />
        </motion.div>
        <motion.div className="absolute bottom-1/4 left-1/3 opacity-[0.03]" animate={{ rotate: [0, 12, 0], y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className="w-20 h-20 text-[#EF626C]" strokeWidth={1} />
        </motion.div>
        <motion.div className="absolute top-2/3 left-20 opacity-[0.03]" animate={{ rotate: [0, -15, 0], x: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className="w-32 h-32 text-[#FFC745]" strokeWidth={1} />
        </motion.div>
        <motion.div className="absolute top-12 right-1/4 opacity-[0.03]" animate={{ rotate: [0, 8, 0], y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className="w-16 h-16 text-[#00668C]" strokeWidth={1} />
        </motion.div>
        <motion.div className="absolute bottom-12 left-1/2 opacity-[0.03]" animate={{ rotate: [0, -12, 0], y: [0, 12, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}>
          <Shield className="w-36 h-36 text-[#1CB87E]" strokeWidth={1} />
        </motion.div>
      </div>
      <ScreenHeader />

      <AnimatePresence mode="wait">
        {/* === INTRO === */}
        {step === "intro" && (
          <motion.div key="intro" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center z-10 max-w-4xl">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
              <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-[#F49833] to-[#EF626C] mb-8 shadow-2xl shadow-orange-500/30">
                <Shield className="w-24 h-24 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-7xl md:text-9xl font-heading tracking-tight mb-6 bg-gradient-to-b from-slate-800 to-slate-600 bg-clip-text text-transparent">לוח המדיניות</h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-10 font-body font-light leading-relaxed max-w-2xl mx-auto">משחק טריוויה תחרותי המבוסס על מדיניות ההתגוננות של פיקוד העורף. בחרו קלף, ענו נכונה, צברו נקודות ונצחו! המשחק כולל שאלות אמת/שקר, בחירה מרובה, התאמת מושגים וסידור פעולות בסיטואציות חירום.</p>
              <button onClick={() => setStep("mode")} className="px-20 py-7 text-3xl md:text-4xl font-bold bg-gradient-to-b from-[#F49833] to-[#EF626C] hover:from-[#FFC745] hover:to-[#F49833] rounded-2xl shadow-xl shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 font-body">התחילו משחק</button>
            </motion.div>
          </motion.div>
        )}

        {/* === MODE SELECTION === */}
        {step === "mode" && (
          <motion.div key="mode" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-4xl z-10">
            <h2 className="text-5xl md:text-6xl font-heading text-center mb-10">בחרו מצב משחק</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button onClick={() => setStep("same_setup")} className="flex flex-col items-center gap-4 p-10 rounded-3xl bg-white/80 border-2 border-slate-300 hover:border-[#FFC745] hover:bg-[#FFC745]/10 shadow-sm transition-all hover:scale-105 font-body">
                <Monitor className="w-16 h-16 text-[#FFC745]" />
                <div className="text-3xl font-bold">משחק על אותו מסך</div>
                <div className="text-slate-500 text-center text-lg">כל הקבוצות משחקות יחד על אותו טוטם</div>
              </button>
              <button onClick={() => setStep("online")} className="flex flex-col items-center gap-4 p-10 rounded-3xl bg-white/80 border-2 border-slate-300 hover:border-[#00B4EF] hover:bg-[#00B4EF]/10 shadow-sm transition-all hover:scale-105 font-body">
                <Wifi className="w-16 h-16 text-[#00B4EF]" />
                <div className="text-3xl font-bold">משחק אונליין</div>
                <div className="text-slate-500 text-center text-lg">כל קבוצה משחקת מטוטם נפרד</div>
              </button>
            </div>
            <div className="text-center"><button onClick={() => setStep("intro")} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xl font-bold bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-xl font-body">→ חזרה</button></div>
          </motion.div>
        )}

        {/* === SAME SCREEN: UNIFIED SETUP === */}
        {step === "same_setup" && (
          <motion.div key="same_setup" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-2xl z-10">
            <h2 className="text-5xl md:text-6xl font-heading text-center mb-8">הגדרות משחק</h2>

            {/* Team count */}
            <div className="mb-6">
              <div className="text-xl font-bold font-body text-center mb-4">כמה קבוצות משחקות?</div>
              <div className="flex gap-4 justify-center">
                {[2, 3].map((n) => (
                  <button key={n} onClick={() => setNumTeams(n)} className={`px-14 py-5 rounded-2xl text-2xl font-bold transition-all font-body ${numTeams === n ? "bg-[#00B4EF] text-white shadow-lg shadow-[#00B4EF]/40 scale-105" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>{n} קבוצות</button>
                ))}
              </div>
            </div>

            {/* Team names + question count (appear together, stacked vertically) */}
            <AnimatePresence>
              {numTeams > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  {/* Team names - stacked vertically */}
                  <div className="mb-6 pt-2">
                    <div className="text-lg font-bold font-body text-center mb-3">שמות הקבוצות</div>
                    <div className="grid gap-3 grid-cols-1 max-w-md mx-auto">
                      {Array.from({ length: numTeams }).map((_, idx) => {
                        const color = TEAM_COLORS[idx];
                        return (
                          <div key={idx} className={`rounded-2xl p-3 border-2 ${color.bgSoft} ${color.borderDim}`}>
                            <label className="block text-sm mb-1 font-body" style={{ color: color.solid }}>קבוצה {["א'", "ב'", "ג'"][idx]}</label>
                            <KeyboardInput value={teamNames[idx]} onChange={(val) => handleNameChange(idx, val)} maxLength={20} placeholder="שם קבוצה" className="w-full text-center text-xl font-bold bg-white border-2 rounded-xl px-4 py-3 font-body" style={{ borderColor: showError && !teamNames[idx].trim() ? "#EF626C" : `${color.solid}40` }} />
                          </div>
                        );
                      })}
                    </div>
                    {showError && <p className="text-center text-[#EF626C] text-sm mt-2 font-body">יש למלא את כל שמות הקבוצות</p>}
                  </div>

                  {/* Question count */}
                  <div className="mb-6">
                    <div className="text-lg font-bold font-body text-center mb-3">מספר השאלות שיוצגו במסך</div>
                    <div className="grid grid-cols-4 gap-3">
                      {CARD_COUNT_OPTIONS.map((count) => (
                        <button key={count} onClick={() => setCardCount(count)} className={`py-5 rounded-2xl text-3xl font-heading transition-all ${cardCount === count ? "bg-[#1CB87E] text-white shadow-lg shadow-green-500/40 scale-105" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>{count}</button>
                      ))}
                    </div>
                  </div>

                  {/* Timed mode toggle */}
                  <div className="mb-6">
                    <button onClick={() => setTimedMode(!timedMode)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-body ${timedMode ? "bg-[#00B4EF]/10 border-[#00B4EF]" : "bg-white border-slate-300"}`}>
                      <div className="flex items-center gap-3">
                        <Clock className={`w-6 h-6 ${timedMode ? "text-[#00B4EF]" : "text-slate-400"}`} />
                        <span className="text-lg font-bold text-slate-800">משחק על זמן</span>
                      </div>
                      <div className={`w-12 h-7 rounded-full p-1 transition-all ${timedMode ? "bg-[#00B4EF]" : "bg-slate-300"}`}>
                        <div className={`w-5 h-5 rounded-full bg-white transition-all ${timedMode ? "ml-0 mr-auto" : "mr-auto ml-0"}`} />
                      </div>
                    </button>
                    {timedMode && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden pt-3">
                        <div className="text-center text-sm font-body text-slate-500 mb-2">זמן לכל שאלה</div>
                        <div className="flex gap-2 justify-center">
                          {[15, 30, 45, 60].map((t) => (
                            <button key={t} onClick={() => setTimeLimit(t)} className={`px-6 py-3 rounded-xl text-lg font-bold transition-all font-body ${timeLimit === t ? "bg-[#00B4EF] text-white shadow-lg scale-105" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>{t} שניות</button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button onClick={() => setStep("mode")} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xl font-bold bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-xl font-body">→ חזרה</button>
              <button onClick={handleSameScreenStart} disabled={!allNamesFilled} className="px-14 py-5 text-2xl font-bold bg-gradient-to-b from-[#F49833] to-[#EF626C] hover:from-[#FFC745] hover:to-[#F49833] rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 font-body disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">{allNamesFilled ? "התחילו משחק!" : "מלאו שמות קבוצות"}</button>
            </div>
          </motion.div>
        )}

        {/* === ONLINE: Single screen flow === */}
        {step === "online" && (
          <motion.div key="online" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full z-10">
            <OnlineSetup onStart={onStart} onBack={() => setStep("mode")} />
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/manage" className="fixed bottom-6 right-6 flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-body z-50">
        <Settings className="w-4 h-4" />ניהול שאלות
      </Link>
    </div>
  );
}