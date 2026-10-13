import React, { useState } from "react";
import { Users, Layers } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RoomLobby from "@/components/online/RoomLobby";
import { CARD_COUNT_OPTIONS } from "@/lib/gameConfig";
import { getDeviceId } from "@/lib/deviceId";

export default function OnlineCreate({ onStart, onBack }) {
  const [numTeams, setNumTeams] = useState(2);
  const [cardCount, setCardCount] = useState(9);
  const [phase, setPhase] = useState("setup");
  const [roomId, setRoomId] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const deviceId = getDeviceId();
      let code;
      let attempts = 0;
      do {
        code = Math.floor(1000 + Math.random() * 9000);
        const existing = await base44.entities.GameRoom.filter({ code, status: "waiting" });
        if (existing.length === 0) break;
        attempts++;
      } while (attempts < 10);

      const room = await base44.entities.GameRoom.create({
        code,
        status: "waiting",
        host_device_id: deviceId,
        num_teams: numTeams,
        card_count: cardCount,
        teams: [
          { name: "", device_id: deviceId, score: 0, strikes: 0, best_strike: 0, correct: 0, wrong: 0 },
        ],
        pending_requests: [],
        current_team: 0,
        opened_cards: [],
        question_ids: [],
      });
      setRoomId(room.id);
      setPhase("lobby");
    } catch (e) {
      console.error("Failed to create room", e);
    } finally {
      setCreating(false);
    }
  };

  if (phase === "lobby" && roomId) {
    return <RoomLobby roomId={roomId} onStart={onStart} onBack={onBack} />;
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-4xl md:text-5xl font-heading text-center mb-8">יצירת משחק חדש</h2>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-[#00B4EF]" />
          <span className="text-xl font-bold font-body">מספר קבוצות</span>
        </div>
        <div className="flex gap-4 justify-center">
          {[2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setNumTeams(n)}
              className={`px-12 py-4 rounded-2xl text-2xl font-bold transition-all font-body ${numTeams === n
                  ? "bg-[#00B4EF] text-white shadow-lg shadow-[#00B4EF]/40 scale-105"
                  : "bg-slate-700/60 text-slate-300 hover:bg-slate-600/70"
                }`}
            >
              {n} קבוצות
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-6 h-6 text-[#1CB87E]" />
          <span className="text-xl font-bold font-body">מספר קלפים</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CARD_COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => setCardCount(count)}
              className={`py-4 rounded-2xl text-2xl font-heading transition-all ${cardCount === count
                  ? "bg-[#1CB87E] text-white shadow-lg shadow-green-500/40 scale-105"
                  : "bg-slate-700/60 text-slate-300 hover:bg-slate-600/70"
                }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors text-lg font-body"
        >
          חזרה
        </button>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-12 py-5 text-xl font-bold bg-gradient-to-b from-[#1CB87E] to-[#15a06e] hover:from-[#25d08e] hover:to-[#1CB87E] rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 font-body disabled:opacity-50"
        >
          {creating ? "יוצר חדר..." : "צרו חדר"}
        </button>
      </div>
    </div>
  );
}