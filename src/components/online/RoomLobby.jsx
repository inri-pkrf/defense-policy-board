import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { TEAM_COLORS, CARD_DISTRIBUTION } from "@/lib/gameConfig";
import { getDeviceId } from "@/lib/deviceId";
import { shuffle } from "@/lib/shuffle";

export default function RoomLobby({ roomId, onStart, onBack }) {
  const [room, setRoom] = useState(null);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const deviceId = getDeviceId();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const r = await base44.entities.GameRoom.get(roomId);
        setRoom(r);
        if (r.status === "playing") triggerStart(r);
      } catch (e) {
        console.error("Failed to fetch room", e);
      }
    };
    fetchRoom();
    const unsubscribe = base44.entities.GameRoom.subscribe((event) => {
      if (event.data.id === roomId) {
        setRoom(event.data);
        if (event.data.status === "playing") triggerStart(event.data);
      }
    });
    return unsubscribe;
  }, [roomId]);

  useEffect(() => {
    if (room?.status === "countdown" && room.countdown_start) {
      const update = () => {
        const elapsed = (Date.now() - new Date(room.countdown_start).getTime()) / 1000;
        setCountdown(Math.max(0, Math.ceil(3 - elapsed)));
      };
      update();
      const interval = setInterval(update, 100);
      return () => clearInterval(interval);
    }
    setCountdown(null);
  }, [room?.status, room?.countdown_start]);

  const triggerStart = (r) => {
    const myTeamIndex = r.teams.findIndex((t) => t.device_id === deviceId);
    onStart({
      gameMode: "online", roomId: r.id, teamIndex: myTeamIndex,
      isHost: r.host_device_id === deviceId,
      teamNames: r.teams.map((t) => t.name), numTeams: r.teams.length, cardCount: r.card_count, timedMode: r.timed_mode, timeLimit: r.time_limit || 30,
    });
  };

  const isHost = room?.host_device_id === deviceId;
  const minTeamsJoined = room?.teams.length >= 2;
  const allNamed = room?.teams.every((t) => t.name && t.name.trim());
  const canStart = isHost && minTeamsJoined && allNamed;

  const handleStartGame = async () => {
    setStarting(true);
    try {
      const dist = CARD_DISTRIBUTION[room.card_count] || CARD_DISTRIBUTION[9];
      const allQuestions = await base44.entities.Question.filter({ active: true });
      const grouped = {};
      allQuestions.forEach((q) => {
        if (!grouped[q.level]) grouped[q.level] = [];
        grouped[q.level].push(q);
      });
      const selectedIds = [];
      dist.levels.forEach((level) => {
        shuffle(grouped[level] || []).slice(0, dist.perLevel).forEach((q) => selectedIds.push(q.id));
      });
      await base44.entities.GameRoom.update(roomId, {
        status: "countdown", countdown_start: new Date().toISOString(),
        question_ids: selectedIds, current_team: 0, opened_cards: [], active_card_id: null,
      });
      setTimeout(async () => {
        await base44.entities.GameRoom.update(roomId, { status: "playing" });
        setStarting(false);
      }, 3000);
    } catch (e) {
      console.error("Failed to start game", e);
      setStarting(false);
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#F49833] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (room.status === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl text-slate-600 mb-6 font-body">המשחק מתחיל בעוד...</div>
        <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="text-[12rem] md:text-[16rem] font-heading text-[#F49833] leading-none">{countdown > 0 ? countdown : "קדימה!"}</motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto" dir="rtl">
      {/* Room Name + Code */}
      <div className="text-center mb-8">
        <div className="text-slate-500 text-lg mb-1 font-body">שם החדר</div>
        <div className="text-5xl md:text-6xl font-heading text-slate-800 mb-3">{room.room_name || "חדר"}</div>
        <div className="text-slate-400 text-sm font-body">קוד: {room.code}</div>
      </div>

      {/* Team Slots — dynamic: show joined teams + one open slot */}
      <div className={`grid gap-3 mb-6 grid-cols-1 ${(room.teams || []).length <= 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {(room.teams || []).map((team, idx) => {
          const color = TEAM_COLORS[idx % TEAM_COLORS.length];
          return (
            <div key={idx} className={`rounded-2xl p-4 border-2 ${color.bgSoft} ${color.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.solid }} />
                <span className="text-sm font-body" style={{ color: color.solid }}>קבוצה {["א'", "ב'", "ג'", "ד'", "ה'", "ו'"][idx]}</span>
              </div>
              <div className="text-center text-lg font-bold py-2 text-slate-800 font-body">{team.name || <span className="text-slate-400 text-sm">ממתין לשם...</span>}</div>
            </div>
          );
        })}
        {/* Open slot — invites more teams to join */}
        {(room.teams || []).length < 6 && (
          <div className="rounded-2xl p-4 border-2 bg-white/50 border-slate-300 border-dashed flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-sm font-body text-slate-400">ממתין להצטרפות...</span>
            </div>
            <div className="text-center text-slate-400 py-2 font-body">שתפו את הקוד</div>
          </div>
        )}
      </div>

      {/* Start Button (host only) */}
      {isHost ? (
        <div className="text-center">
          <button onClick={handleStartGame} disabled={!canStart || starting} className="px-16 py-5 text-2xl font-bold bg-gradient-to-b from-[#F49833] to-[#EF626C] hover:from-[#FFC745] hover:to-[#F49833] rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 font-body text-white disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">{starting ? "מתחיל..." : canStart ? "התחילו משחק!" : "ממתין לקבוצה נוספת..."}</button>
          {!minTeamsJoined && <div className="text-slate-500 text-sm mt-2 font-body">{room.teams.length} קבוצות הצטרפו (מינימום 2)</div>}
        </div>
      ) : (
        <div className="text-center text-slate-500 text-lg font-body">{minTeamsJoined ? "המתינו להתחלת המשחק..." : "ממתין לקבוצה נוספת..."}</div>
      )}

      <div className="text-center mt-6">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 transition-colors text-lg font-body">יציאה מהחדר</button>
      </div>
    </div>
  );
}