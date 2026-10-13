import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Check } from "lucide-react";

const HEBREW_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ"],
  ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"],
  ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ"],
];

const EMOJIS = ["🏆", "😊", "⭐", "🎯"];

const NUMERIC_ROWS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
];

const keyBase =
  "bg-white text-[#2c3e80] rounded-xl font-bold font-body flex items-center justify-center transition-all hover:bg-blue-50 active:bg-blue-100 active:scale-95 shadow-sm select-none";

// === Hebrew Keyboard ===
export function HebrewKeyboard({ value, onChange, onClose, maxLength = 20 }) {
  const handleKey = (key) => {
    if (value.length >= maxLength) return;
    onChange(value + key);
  };
  const handleBackspace = () => onChange(value.slice(0, -1));
  const handleSpace = () => {
    if (value.length >= maxLength) return;
    onChange(value + " ");
  };

  return (
    <motion.div
      initial={{ y: 400, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-[85] p-3 md:p-6"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto bg-[#e0efff] rounded-3xl p-3 md:p-5 shadow-2xl border-2 border-[#2c3e80]/30">
        {/* Close bar */}
        <div className="flex justify-start mb-2">
          <button onClick={onClose} className="px-4 py-2 bg-[#1CB87E] text-white rounded-xl font-bold text-base font-body flex items-center gap-2 hover:bg-[#0d8a5c] transition-all active:scale-95 shadow-sm">
            <Check className="w-4 h-4" /> סיום
          </button>
        </div>

        {/* Number row */}
        <div className="flex gap-1.5 md:gap-2 justify-center mb-1.5 md:mb-2" dir="ltr">
          {HEBREW_ROWS[0].map((key) => (
            <button key={key} onClick={() => handleKey(key)} className={`${keyBase} text-lg md:text-2xl py-3 md:py-4 flex-1 max-w-[52px]`}>
              {key}
            </button>
          ))}
        </div>

        {/* Hebrew letter rows */}
        {HEBREW_ROWS.slice(1).map((row, i) => (
          <div key={i} className="flex gap-1.5 md:gap-2 justify-center mb-1.5 md:mb-2" dir="ltr">
            {row.map((key) => (
              <button key={key} onClick={() => handleKey(key)} className={`${keyBase} text-lg md:text-2xl py-3 md:py-4 flex-1 max-w-[52px]`}>
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Control row */}
        <div className="flex gap-1.5 md:gap-2 justify-center items-stretch" dir="ltr">
          <button onClick={handleBackspace} className={`${keyBase} text-lg md:text-2xl py-3 md:py-4 px-3 md:px-4`}>
            <Delete className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button onClick={handleSpace} className={`${keyBase} text-base md:text-xl py-3 md:py-4 flex-1 max-w-md`}>
            רווח
          </button>
          {EMOJIS.map((emoji) => (
            <button key={emoji} onClick={() => handleKey(emoji)} className={`${keyBase} text-xl md:text-2xl py-3 md:py-4 px-2 md:px-3`}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// === Numeric Keyboard ===
export function NumericKeyboard({ value, onChange, onClose, maxLength = 4 }) {
  const handleKey = (key) => {
    if (value.length >= maxLength) return;
    onChange(value + key);
  };
  const handleBackspace = () => onChange(value.slice(0, -1));

  return (
    <motion.div
      initial={{ y: 400, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-[85] p-3 md:p-6"
      dir="rtl"
    >
      <div className="max-w-md mx-auto bg-[#e0efff] rounded-3xl p-3 md:p-5 shadow-2xl border-2 border-[#2c3e80]/30">
        {/* Close bar */}
        <div className="flex justify-start mb-2">
          <button onClick={onClose} className="px-4 py-2 bg-[#1CB87E] text-white rounded-xl font-bold text-base font-body flex items-center gap-2 hover:bg-[#0d8a5c] transition-all active:scale-95 shadow-sm">
            <Check className="w-4 h-4" /> סיום
          </button>
        </div>

        {/* Number grid */}
        {NUMERIC_ROWS.map((row, i) => (
          <div key={i} className="flex gap-2 md:gap-3 justify-center mb-2 md:mb-3" dir="ltr">
            {row.map((key) => (
              <button key={key} onClick={() => handleKey(key)} className={`${keyBase} text-2xl md:text-4xl py-4 md:py-5 flex-1 max-w-[80px]`}>
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Bottom row */}
        <div className="flex gap-2 md:gap-3 justify-center" dir="ltr">
          <button onClick={handleBackspace} className={`${keyBase} text-2xl md:text-4xl py-4 md:py-5 px-4 md:px-6`}>
            <Delete className="w-6 h-6 md:w-7 md:h-7" />
          </button>
          <button onClick={() => handleKey("0")} className={`${keyBase} text-2xl md:text-4xl py-4 md:py-5 flex-1 max-w-[80px]`}>
            0
          </button>
          <div className="flex-1 max-w-[80px]" />
        </div>
      </div>
    </motion.div>
  );
}

// === Wrapper: Input field that opens custom keyboard ===
export function KeyboardInput({ value, onChange, placeholder, numeric = false, maxLength = 20, style, className = "" }) {
  const [showKeyboard, setShowKeyboard] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowKeyboard(true)}
        className={`${className} text-center cursor-text`}
        style={style}
      >
        {value ? (
          <span className="text-slate-800">{value}</span>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
      </button>
      <AnimatePresence>
        {showKeyboard && (
          <>
            {/* Transparent click-catcher (no dimming) */}
            <div
              className="fixed inset-0 z-[80]"
              onClick={() => setShowKeyboard(false)}
            />
            {numeric ? (
              <NumericKeyboard
                value={value}
                onChange={onChange}
                onClose={() => setShowKeyboard(false)}
                maxLength={maxLength}
              />
            ) : (
              <HebrewKeyboard
                value={value}
                onChange={onChange}
                onClose={() => setShowKeyboard(false)}
                maxLength={maxLength}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}