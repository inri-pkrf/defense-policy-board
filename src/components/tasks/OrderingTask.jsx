import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Check, X, GripVertical, AlertTriangle } from "lucide-react";
import { shuffle } from "@/lib/shuffle";

const cleanText = (text) =>
  text.replace(/^מדרג\s*\d+[\.\):\s\-]*/i, "").replace(/^\d+[\.\):\s\-]+/, "").trim();

export default function OrderingTask({ question, onCheck, onOrderUpdate }) {
  const correctActions = question.ordering_actions || [];
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const itemsWithIds = correctActions.map((action, i) => ({ id: `${question.id}-${i}`, text: action }));
    setItems(shuffle(itemsWithIds));
    setChecked(false);
  }, [question.id]);

  const handleDragEnd = (result) => {
    if (!result.destination || checked) return;
    const newItems = Array.from(items);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);
    setItems(newItems);
    if (onOrderUpdate) onOrderUpdate(newItems.map((item) => item.text));
  };

  const handleCheck = () => {
    setChecked(true);
    const correctCount = items.filter((item, i) => item.text === correctActions[i]).length;
    const total = correctActions.length;
    const isCorrect = correctCount === total;
    const points = Math.round((correctCount / total) * question.level);
    onCheck(isCorrect, points);
  };

  return (
    <div className="space-y-6">
      {/* Situation */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 md:p-5 flex gap-3">
        <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
        <p className="text-lg md:text-xl font-semibold text-orange-800 leading-relaxed font-body">{question.question}</p>
      </div>

      <div className="text-center text-sm font-bold text-slate-500 font-body">סדרו את הפעולות בסדר הנכון</div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="ordering-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 md:space-y-3 max-w-2xl mx-auto">
              {items.map((item, i) => (
                <Draggable key={item.id} draggableId={item.id} index={i} isDragDisabled={checked}>
                  {(prov) => (
                    <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 transition-colors font-body ${checked ? (item.text === correctActions[i] ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700") : "bg-white border-slate-300 text-slate-700 hover:border-indigo-400 hover:shadow-md cursor-grab active:cursor-grabbing"}`}>
                      <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-sm flex-shrink-0">{i + 1}</span>
                      <span className="flex-1 text-base md:text-lg font-medium">{cleanText(item.text)}</span>
                      {checked && item.text === correctActions[i] && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      {checked && item.text !== correctActions[i] && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AnimatePresence>
        {!checked && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center pt-2">
            <button onClick={handleCheck} className="px-8 py-4 bg-gradient-to-b from-[#F49833] to-[#EF626C] hover:from-[#FFC745] hover:to-[#F49833] rounded-2xl text-lg font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 font-body">בדיקת תשובות</button>
            <p className="text-slate-500 text-sm mt-3 font-body">גררו את הפעולות לסדר הנכון · ניתן לטעות</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}