import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, ArrowRight, Save, X } from "lucide-react";

const levelLabels = { 100: "100 - קל", 200: "200 - בסיסי", 300: "300 - בינוני", 400: "400 - מורכב", 500: "500 - מומחה" };
const typeLabels = { true_false: "אמת / שקר", multiple_choice: "בחירה מרובה", matching: "התאמה", ordering: "סידור פעולות" };

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await base44.entities.Question.list("level");
      setQuestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("האם למחוק שאלה זו?")) return;
    await base44.entities.Question.delete(id);
    loadQuestions();
  };

  const handleSave = async (questionData) => {
    if (editing === "new") {
      await base44.entities.Question.create(questionData);
    } else {
      await base44.entities.Question.update(editing, questionData);
    }
    setShowForm(false);
    setEditing(null);
    loadQuestions();
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">ניהול שאלות</h1>
            <p className="text-slate-500 mt-1">מאגר השאלות - לוח המדיניות, פיקוד העורף</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 font-medium transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              חזרה למשחק
            </Link>
            <button
              onClick={() => { setEditing("new"); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              שאלה חדשה
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : showForm ? (
          <QuestionForm
            initial={editing === "new" ? null : questions.find((q) => q.id === editing)}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold">{q.level}</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">{typeLabels[q.type]}</span>
                      {!q.active && <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-sm">לא פעיל</span>}
                    </div>
                    <p className="text-slate-800 font-medium">{q.question}</p>
                    <p className="text-green-600 text-sm mt-1">תשובה: {q.correct_answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(q.id); setShowForm(true); }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionForm({ initial, onSave, onCancel }) {
  const [level, setLevel] = useState(initial?.level || 100);
  const [type, setType] = useState(initial?.type || "true_false");
  const [question, setQuestion] = useState(initial?.question || "");
  const [options, setOptions] = useState(initial?.options?.join("\n") || "");
  const [correctAnswer, setCorrectAnswer] = useState(initial?.correct_answer || "");
  const [explanation, setExplanation] = useState(initial?.explanation || "");
  const [active, setActive] = useState(initial?.active !== false);
  const [orderingActions, setOrderingActions] = useState(initial?.ordering_actions?.join("\n") || "");
  const [matchingPairs, setMatchingPairs] = useState(
    initial?.matching_pairs?.map((p) => `${p.term}::${p.definition}`).join("\n") || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      level: Number(level),
      type,
      question,
      options: type === "multiple_choice" ? options.split("\n").filter((s) => s.trim()) : [],
      correct_answer: correctAnswer,
      explanation,
      active,
      ordering_actions: type === "ordering" ? orderingActions.split("\n").filter((s) => s.trim()) : [],
      matching_pairs: type === "matching"
        ? matchingPairs.split("\n").filter((s) => s.trim()).map((line) => {
            const [term, definition] = line.split("::");
            return { term: term.trim(), definition: definition.trim() };
          })
        : [],
    };
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{initial ? "עריכת שאלה" : "שאלה חדשה"}</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">רמת קושי</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
            {Object.entries(levelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">סוג משימה</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">שאלה / משימה</label>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} required rows={2} className="w-full p-2 border border-slate-300 rounded-lg" />
      </div>

      {type === "multiple_choice" && (
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">אפשרויות (כל אפשרות בשורה חדשה)</label>
          <textarea value={options} onChange={(e) => setOptions(e.target.value)} rows={4} placeholder="אפשרות 1&#10;אפשרות 2&#10;אפשרות 3&#10;אפשרות 4" className="w-full p-2 border border-slate-300 rounded-lg font-mono text-sm" />
        </div>
      )}

      {type === "matching" && (
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">זוגות התאמה (פורמט: מושג::הגדרה, כל זוג בשורה)</label>
          <textarea value={matchingPairs} onChange={(e) => setMatchingPairs(e.target.value)} rows={5} placeholder="ממ&quot;ד::מרחב מוגן דירתי&#10;ממ&quot;ק::מרחב מוגן קומתי" className="w-full p-2 border border-slate-300 rounded-lg font-mono text-sm" />
        </div>
      )}

      {type === "ordering" && (
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">פעולות בסדר הנכון (כל פעולה בשורה נפרדת)</label>
          <textarea value={orderingActions} onChange={(e) => setOrderingActions(e.target.value)} rows={5} placeholder="פעולה ראשונה&#10;פעולה שנייה&#10;פעולה שלישית&#10;פעולה רביעית" className="w-full p-2 border border-slate-300 rounded-lg font-mono text-sm" />
        </div>
      )}

      {(type === "true_false" || type === "multiple_choice") && (
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">תשובה נכונה</label>
          <input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required className="w-full p-2 border border-slate-300 rounded-lg" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">הסבר</label>
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded-lg" />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-5 h-5" />
        <span className="text-slate-600">פעיל (יופיע במשחק)</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-white font-medium transition-colors">
          <Save className="w-5 h-5" />
          שמור
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 font-medium transition-colors">
          ביטול
        </button>
      </div>
    </form>
  );
}