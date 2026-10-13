import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogIn, RefreshCw, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CARD_COUNT_OPTIONS } from "@/lib/gameConfig";
import { getDeviceId } from "@/lib/deviceId";
import RoomLobby from "@/components/online/RoomLobby";
import { KeyboardInput } from "@/components/CustomKeyboard";

const MAX_TEAMS = 6;

export default function OnlineSetup({ onStart, onBack }) {
  const [action, setAction] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [cardCount, setCardCount] = useState(9);
  const [joinCode, setJoinCode] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  const [joinMethod, setJoinMethod] = useState("list");
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const deviceId = getDeviceId();

  const fetchRooms = useCallback(async () => {
    try {
      const allRooms = await base44.entities.GameRoom.filter({ status: "waiting" }, "-created_date", 50);
      const now = Date.now();
      const recent = allRooms.filter((r) => {
        const created = new Date(r.created_date).getTime();
        return now - created < 30 * 60 * 1000;
      });
      setRooms(recent);
    } catch (e) {
      console.error("Failed to fetch rooms", e);
    }
  }, []);

  useEffect(() => {
    if (action === "join" && !joinedRoomId) {
      fetchRooms();
      const unsubscribe = base44.entities.GameRoom.subscribe(() => {
        fetchRooms();
      });
      // Polling backup every 8 seconds
      const interval = setInterval(fetchRooms, 8000);
      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, [action, joinedRoomId, fetchRooms]);

  const handleCreate = async () => {
    if (!teamName.trim()) { setError("יש להזין שם קבוצה"); return; }
    if (!roomName.trim()) { setError("יש להזין שם חדר"); return; }
    setLoading(true);
    setError("");
    try {
      const code = Math.floor(1000 + Math.random() * 9000);
      const newRoom = await base44.entities.GameRoom.create({
        code, room_name: roomName.trim(), status: "waiting", host_device_id: deviceId,
        card_count: cardCount, timed_mode: timedMode, time_limit: timeLimit,
        teams: [{ name: teamName.trim(), device_id: deviceId, score: 0, strikes: 0, best_strike: 0, correct: 0, wrong: 0 }],
        opened_cards: [], question_ids: [], current_team: 0,
      });
      setJoinedRoomId(newRoom.id);
    } catch (e) {
      console.error("Failed to create room", e);
      setError("שגיאה ביצירת החדר");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (roomId) => {
    if (!teamName.trim()) { setError("יש להזין שם קבוצה"); return; }
    setLoading(true);
    setError("");
    try {
      const r = await base44.entities.GameRoom.get(roomId);
      if (r.status !== "waiting") { setError("המשחק כבר התחיל או הסתיים"); setLoading(false); return; }
      // Already in this room → re-join silently
      if ((r.teams || []).find((t) => t.device_id === deviceId)) {
        setJoinedRoomId(roomId);
        setLoading(false);
        return;
      }
      if ((r.teams || []).length >= MAX_TEAMS) { setError(`החדר מלא (מקסימום ${MAX_TEAMS} קבוצות)`); setLoading(false); return; }
      const updatedTeams = [...r.teams, { name: teamName.trim(), device_id: deviceId, score: 0, strikes: 0, best_strike: 0, correct: 0, wrong: 0 }];
      await base44.entities.GameRoom.update(roomId, { teams: updatedTeams });
      setJoinedRoomId(roomId);
      setLoading(false);
    } catch (e) {
      console.error("Failed to join room", e);
      setError("שגיאה בהצטרפות לחדר");
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode || joinCode.length < 4) { setError("יש להזין קוד בן 4 ספרות"); return; }
    setLoading(true);
    setError("");
    try {
      const allWaiting = await base44.entities.GameRoom.filter({ status: "waiting" }, "-created_date", 100);
      const matched = allWaiting.find((r) => r.code === parseInt(joinCode));
      if (!matched) { setError("חדר לא נמצא או שכבר התחיל"); setLoading(false); return; }
      await handleJoin(matched.id);
    } catch (e) {
      setError("שגיאה בחיפוש החדר");
      setLoading(false);
    }
  };

  const handleExitRoom = () => {
    setJoinedRoomId(null);
    setAction(null);
    setTeamName("");
    setRoomName("");
    setJoinCode("");
    setError("");
  };

  if (joinedRoomId) {
    return <RoomLobby roomId={joinedRoomId} onStart={onStart} onBack={handleExitRoom} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto" dir="rtl">
      <h2 className="text-4xl md:text-5xl font-heading text-center mb-8 text-slate-800">משחק אונליין</h2>

      {/* Step 1: Choose action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button onClick={() => { setAction("create"); setError(""); }} className={`flex flex-col items-center gap-3 p-6 md:p-8 rounded-3xl border-2 transition-all font-body shadow-sm ${action === "create" ? "bg-[#1CB87E]/15 border-[#1CB87E] scale-105" : "bg-white/80 border-slate-300 hover:border-[#1CB87E] hover:bg-[#1CB87E]/10"}`}>
          <Plus className="w-10 h-10 text-[#1CB87E]" />
          <div className="text-2xl font-bold text-slate-800">יצירת חדר</div>
          <div className="text-slate-500 text-center">צרו חדר חדש ושתפו את הקוד</div>
        </button>
        <button onClick={() => { setAction("join"); setError(""); }} className={`flex flex-col items-center gap-3 p-6 md:p-8 rounded-3xl border-2 transition-all font-body shadow-sm ${action === "join" ? "bg-[#00B4EF]/15 border-[#00B4EF] scale-105" : "bg-white/80 border-slate-300 hover:border-[#00B4EF] hover:bg-[#00B4EF]/10"}`}>
          <LogIn className="w-10 h-10 text-[#00B4EF]" />
          <div className="text-2xl font-bold text-slate-800">הצטרפות לחדר</div>
          <div className="text-slate-500 text-center">בחרו חדר מהרשימה או הזינו קוד</div>
        </button>
      </div>

      {/* Step 2: Expand based on action */}
      <AnimatePresence>
        {action && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white/60 border-2 border-slate-300 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
              {/* Team name (always required) */}
              <div>
                <label className="block text-lg font-bold text-slate-700 mb-2 font-body">שם הקבוצה שלכם</label>
                <KeyboardInput value={teamName} onChange={setTeamName} maxLength={20} placeholder="הזינו שם קבוצה" className="w-full text-center text-xl font-bold bg-white border-2 border-slate-300 rounded-xl px-4 py-3 font-body" />
              </div>

              {/* Create room fields */}
              {action === "create" && (
                <>
                  <div>
                    <label className="block text-lg font-bold text-slate-700 mb-2 font-body">שם החדר</label>
                    <KeyboardInput value={roomName} onChange={setRoomName} maxLength={20} placeholder="הזינו שם חדר" className="w-full text-center text-xl font-bold bg-white border-2 border-slate-300 rounded-xl px-4 py-3 font-body" />
                  </div>
                  <div>
                    <label className="block text-lg font-bold text-slate-700 mb-2 font-body">מספר השאלות שיוצגו במסך</label>
                    <div className="grid grid-cols-4 gap-2">
                      {CARD_COUNT_OPTIONS.map((count) => (
                        <button key={count} onClick={() => setCardCount(count)} className={`py-3 rounded-xl text-xl font-heading transition-all ${cardCount === count ? "bg-[#1CB87E] text-white shadow-lg scale-105" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>{count}</button>
                      ))}
                    </div>
                  </div>
                  {/* Timed mode toggle */}
                  <div>
                    <button onClick={() => setTimedMode(!timedMode)} type="button" className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all font-body ${timedMode ? "bg-[#00B4EF]/10 border-[#00B4EF]" : "bg-white border-slate-300"}`}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${timedMode ? "text-[#00B4EF]" : "text-slate-400"}`} />
                        <span className="font-bold text-slate-800">משחק על זמן</span>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-1 transition-all ${timedMode ? "bg-[#00B4EF]" : "bg-slate-300"}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-all ${timedMode ? "ml-0 mr-auto" : "mr-auto ml-0"}`} />
                      </div>
                    </button>
                    {timedMode && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden pt-2">
                        <div className="flex gap-2 justify-center">
                          {[15, 30, 45, 60].map((t) => (
                            <button key={t} onClick={() => setTimeLimit(t)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all font-body ${timeLimit === t ? "bg-[#00B4EF] text-white scale-105" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>{t} שניות</button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {error && <p className="text-center text-[#EF626C] font-body">{error}</p>}
                  <button onClick={handleCreate} disabled={loading} className="w-full py-4 text-xl font-bold bg-gradient-to-b from-[#F49833] to-[#EF626C] hover:from-[#FFC745] hover:to-[#F49833] rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 font-body text-white disabled:opacity-50">{loading ? "יוצר חדר..." : "צרו חדר"}</button>
                </>
              )}

              {/* Join room fields */}
              {action === "join" && (
                <>
                  {error && <p className="text-center text-[#EF626C] font-body">{error}</p>}
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setJoinMethod("list")} className={`px-6 py-2 rounded-xl text-lg font-bold transition-all font-body ${joinMethod === "list" ? "bg-[#00B4EF] text-white" : "bg-slate-200 text-slate-600"}`}>רשימת חדרים</button>
                    <button onClick={() => setJoinMethod("code")} className={`px-6 py-2 rounded-xl text-lg font-bold transition-all font-body ${joinMethod === "code" ? "bg-[#00B4EF] text-white" : "bg-slate-200 text-slate-600"}`}>הזנת קוד</button>
                  </div>

                  {joinMethod === "list" && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {rooms.length === 0 ? (
                        <div className="text-center text-slate-500 py-6 font-body">
                          <p className="mb-3">אין חדרים פתוחים כרגע</p>
                          <button onClick={fetchRooms} className="inline-flex items-center gap-2 text-[#00B4EF] hover:text-[#0090C0] font-body"><RefreshCw className="w-4 h-4" /> רענן</button>
                        </div>
                      ) : (
                        rooms.map((r) => (
                          <div key={r.id} className="flex items-center justify-between bg-white border border-slate-300 rounded-xl p-4">
                            <div>
                              <div className="text-lg font-bold text-slate-800 font-body">{r.room_name || "חדר ללא שם"}</div>
                              <div className="text-sm text-slate-500 font-body">{(r.teams || []).length} קבוצות · {r.card_count} שאלות</div>
                            </div>
                            <button onClick={() => handleJoin(r.id)} disabled={loading || !teamName.trim()} className="px-6 py-3 bg-[#00B4EF] hover:bg-[#0090C0] disabled:opacity-40 rounded-xl text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 font-body">הצטרפות</button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {joinMethod === "code" && (
                    <div className="space-y-3">
                      <div className="text-center text-slate-500 font-body">הזינו את קוד החדר שקיבלתם</div>
                      <div className="flex gap-3 justify-center">
                        <KeyboardInput value={joinCode} onChange={(val) => setJoinCode(val.replace(/\D/g, "").slice(0, 4))} numeric maxLength={4} placeholder="קוד" className="w-40 text-center text-3xl font-heading tracking-widest bg-white border-2 border-slate-300 rounded-xl px-4 py-3 font-body" />
                        <button onClick={handleJoinByCode} disabled={loading || !teamName.trim() || joinCode.length < 4} className="px-8 py-3 bg-[#00B4EF] hover:bg-[#0090C0] disabled:opacity-40 rounded-xl text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 font-body">הצטרפות</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button - enlarged */}
      <div className="text-center mt-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xl font-bold bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-xl font-body shadow-sm">→ חזרה</button>
      </div>
    </div>
  );
}