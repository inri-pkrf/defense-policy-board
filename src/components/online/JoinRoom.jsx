import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Delete, Check, List, Hash } from "lucide-react";
import { base44 } from "@/api/base44Client";
import RoomLobby from "@/components/online/RoomLobby";
import { getDeviceId } from "@/lib/deviceId";

export default function JoinRoom({ onStart, onBack }) {
  const [phase, setPhase] = useState("method");
  const [rooms, setRooms] = useState([]);
  const [code, setCode] = useState("");
  const [joiningRoomId, setJoiningRoomId] = useState(null);
  const [error, setError] = useState("");
  const deviceId = getDeviceId();

  const loadRooms = async () => {
    try {
      const data = await base44.entities.GameRoom.filter({ status: "waiting" });
      setRooms(data.filter((r) => r.teams.length < r.num_teams));
    } catch (e) {
      console.error("Failed to load rooms", e);
    }
  };

  useEffect(() => {
    if (phase === "list") loadRooms();
  }, [phase]);

  useEffect(() => {
    if (phase !== "waiting" || !joiningRoomId) return;

    const checkInitial = async () => {
      try {
        const r = await base44.entities.GameRoom.get(joiningRoomId);
        const myTeam = r.teams.find((t) => t.device_id === deviceId);
        if (myTeam) {
          setPhase("lobby");
          return;
        }
        if (r.status !== "waiting") {
          setError("החדר כבר לא זמין");
          setPhase("method");
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkInitial();

    const unsubscribe = base44.entities.GameRoom.subscribe((event) => {
      if (event.data.id === joiningRoomId) {
        const myTeam = event.data.teams.find((t) => t.device_id === deviceId);
        if (myTeam) {
          setPhase("lobby");
        }
      }
    });
    return unsubscribe;
  }, [phase, joiningRoomId]);

  const handleJoin = async (roomId) => {
    try {
      setError("");
      const room = await base44.entities.GameRoom.get(roomId);
      if (room.status !== "waiting") {
        setError("החדר כבר לא זמין");
        return;
      }
      if (room.teams.length >= room.num_teams) {
        setError("החדר מלא");
        return;
      }
      const alreadyInTeam = room.teams.some((t) => t.device_id === deviceId);
      const alreadyPending = (room.pending_requests || []).some((r) => r.device_id === deviceId);
      if (alreadyInTeam) {
        setJoiningRoomId(roomId);
        setPhase("lobby");
        return;
      }
      if (!alreadyPending) {
        const updatedPending = [...(room.pending_requests || []), { device_id: deviceId }];
        await base44.entities.GameRoom.update(roomId, { pending_requests: updatedPending });
      }
      setJoiningRoomId(roomId);
      setPhase("waiting");
    } catch (e) {
      console.error("Failed to join room", e);
      setError("שגיאה בהצטרפות לחדר");
    }
  };

  const handleDigit = (d) => {
    if (code.length < 4) setCode(code + d);
  };

  const handleDeleteDigit = () => setCode(code.slice(0, -1));

  const handleCodeSubmit = async () => {
    if (code.length !== 4) return;
    try {
      setError("");
      const matching = await base44.entities.GameRoom.filter({ code: parseInt(code), status: "waiting" });
      if (matching.length === 0) {
        setError("לא נמצא חדר עם קוד זה");
        return;
      }
      handleJoin(matching[0].id);
    } catch (e) {
      setError("שגיאה בחיפוש חדר");
    }
  };

  if (phase === "lobby" && joiningRoomId) {
    return <RoomLobby roomId={joiningRoomId} onStart={onStart} onBack={onBack} />;
  }

  if (phase === "waiting") {
    return (
      <div className="w-full max-w-md text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block w-16 h-16 border-4 border-[#00B4EF] border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-3xl font-heading mb-4">ממתין לאישור המארח</h2>
        <p className="text-slate-400 font-body">המארח יאשר את ההצטרפות שלכם בקרוב...</p>
        <button
          onClick={onBack}
          className="mt-8 text-slate-400 hover:text-white transition-colors font-body"
        >
          ביטול
        </button>
      </div>
    );
  }

  if (phase === "list") {
    return (
      <div className="w-full max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-heading text-center mb-8">חדרים פתוחים</h2>
        {rooms.length === 0 ? (
          <div className="text-center text-slate-400 py-12 font-body">
            <p className="text-xl mb-2">אין חדרים פתוחים כרגע</p>
            <p className="text-sm">בקשו מהמארח ליצור חדר חדש</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between bg-slate-800/60 border border-slate-600 rounded-2xl p-4"
              >
                <div>
                  <div className="text-3xl font-heading text-[#FFC745]">{room.code}</div>
                  <div className="text-sm text-slate-400 font-body">
                    {room.teams.length}/{room.num_teams} קבוצות · {room.card_count} קלפים
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(room.id)}
                  className="px-6 py-3 bg-[#00B4EF] hover:bg-[#0090C0] rounded-xl text-lg font-bold transition-all hover:scale-105 active:scale-95 font-body"
                >
                  הצטרפות
                  </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setPhase("method")}
            className="text-slate-400 hover:text-white transition-colors font-body"
          >
            חזרה
          </button>
          <button
            onClick={loadRooms}
            className="text-slate-400 hover:text-white transition-colors font-body"
          >
            רענן
          </button>
        </div>
      </div>
    );
  }

  if (phase === "code") {
    return (
      <div className="w-full max-w-sm">
        <h2 className="text-4xl md:text-5xl font-heading text-center mb-6">הזינו קוד חדר</h2>
        <div className="text-center mb-6">
          <div className="text-5xl font-heading text-[#FFC745] tracking-widest min-h-[60px] flex items-center justify-center">
            {code || <span className="text-slate-600">_ _ _ _</span>}
          </div>
        </div>
        {error && <p className="text-center text-[#EF626C] mb-4 font-body">{error}</p>}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="aspect-square rounded-2xl bg-slate-700/60 hover:bg-slate-600/70 text-3xl font-bold transition-all hover:scale-105 active:scale-95 font-body"
            >
              {d}
            </button>
          ))}
          <button
            onClick={handleDeleteDigit}
            className="aspect-square rounded-2xl bg-slate-700/60 hover:bg-slate-600/70 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <Delete className="w-8 h-8 text-slate-300" />
          </button>
          <button
            onClick={() => handleDigit("0")}
            className="aspect-square rounded-2xl bg-slate-700/60 hover:bg-slate-600/70 text-3xl font-bold transition-all hover:scale-105 active:scale-95 font-body"
          >
            0
          </button>
          <button
            onClick={handleCodeSubmit}
            disabled={code.length !== 4}
            className="aspect-square rounded-2xl bg-[#1CB87E] hover:bg-[#15a06e] disabled:opacity-40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <Check className="w-8 h-8 text-white" />
          </button>
        </div>
        <div className="text-center">
          <button
            onClick={() => setPhase("method")}
            className="text-slate-400 hover:text-white transition-colors font-body"
          >
            חזרה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-4xl md:text-5xl font-heading text-center mb-8">הצטרפות למשחק</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setPhase("list")}
          className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-slate-800/60 border-2 border-slate-600 hover:border-[#00B4EF] hover:bg-[#00B4EF]/10 transition-all hover:scale-105 font-body"
        >
          <List className="w-12 h-12 text-[#00B4EF]" />
          <div className="text-2xl font-bold">רשימת חדרים</div>
          <div className="text-slate-400 text-center">בחרו חדר פתוח מהרשימה</div>
        </button>
        <button
          onClick={() => setPhase("code")}
          className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-slate-800/60 border-2 border-slate-600 hover:border-[#FFC745] hover:bg-[#FFC745]/10 transition-all hover:scale-105 font-body"
        >
          <Hash className="w-12 h-12 text-[#FFC745]" />
          <div className="text-2xl font-bold">הזנת קוד</div>
          <div className="text-slate-400 text-center">הזינו קוד מספרי בן 4 ספרות</div>
        </button>
      </div>
      <div className="text-center">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors text-lg font-body"
        >
          חזרה
        </button>
      </div>
    </div>
  );
}