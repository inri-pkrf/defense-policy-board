import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function EndGameDialog({ open, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-2 border-orange-500/40 max-w-lg w-full p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500/40 mb-6">
              <AlertTriangle className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              סיום המשחק?
            </h3>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              האם בטוחים שברצונכם לסיים את המשחק? <br />
              תוצאות המשחק יחושבו לפי מה ששוחק עד כה.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={onCancel}
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl text-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
              >
                חזרה למשחק
              </button>
              <button
                onClick={onConfirm}
                className="px-8 py-4 bg-gradient-to-b from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-2xl text-xl font-bold text-white shadow-lg shadow-orange-500/40 transition-all hover:scale-105 active:scale-95"
              >
                סיום המשחק
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}