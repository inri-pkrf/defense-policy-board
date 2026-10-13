import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { TEAM_COLORS, CARD_DISTRIBUTION } from "@/lib/gameConfig";
import { shuffle } from "@/lib/shuffle";
import TeamPanel from "@/components/TeamPanel";
import GameCard from "@/components/GameCard";
import TaskModal from "@/components/TaskModal";
import EndScreen from "@/components/EndScreen";
import ScorePopup from "@/components/ScorePopup";
import EndGameDialog from "@/components/EndGameDialog";
import LogoHeader from "@/components/LogoHeader";
import HomeButton from "@/components/HomeButton";
import FullscreenButton from "@/components/FullscreenButton";

export default function GameBoard({ config, onNewGame }) {
  const isOnline = config.gameMode === "online";
  const { teamNames, cardCount, numTeams } = config;
  const dist = CARD_DISTRIBUTION[cardCount] || CARD_DISTRIBUTION[9];
  const activeLevels = dist.levels;
  const colsClass = activeLevels.length === 3 ? "grid-cols-3" : "grid-cols-4";

  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [cards, setCards] = useState([]);
  const [teams, setTeams] = useState(
    teamNames.map((name, index) => ({ name, index, score: 0, strikes: 0, bestStrike: 0, correct: 0, wrong: 0 }))
  );
  const [currentTeam, setCurrentTeam] = useState(0);
  const [activeCard, setActiveCard] = useState(null);
  const [scorePopup, setScorePopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [strikeAnim, setStrikeAnim] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [endGameRequest, setEndGameRequest] = useState(null);
  const isLastCardRef = useRef(false);
  const cardsRef = useRef([]);

  useEffect(() => { cardsRef.current = cards; }, [cards]);

  useEffect(() => {
    if (isOnline) loadOnlineGame();
    else loadQuestions();
  }, []);

  useEffect(() => {
    if (!isOnline || !config.roomId) return;
    const unsubscribe = base44.entities.GameRoom.subscribe((event) => {
      if (event.data.id !== config.roomId) return;
      const r = event.data;
      setRoom(r);
      syncFromRoom(r);
    });
    return unsubscribe;
  }, [isOnline, config.roomId]);

  const syncFromRoom = (r) => {
    setTeams(
      (r.teams || []).map((t, i) => ({
        name: t.name, index: i, score: t.score || 0, strikes: t.strikes || 0,
        bestStrike: t.best_strike || 0, correct: t.correct || 0, wrong: t.wrong || 0,
      }))
    );
    setCurrentTeam(r.current_team || 0);
    setCards((prev) => prev.map((c) => ({ ...c, opened: (r.opened_cards || []).includes(c.id) })));

    if (r.last_answer) setLastAnswer(r.last_answer);
    else setLastAnswer(null);

    if (r.end_game_request) setEndGameRequest(r.end_game_request);
    else setEndGameRequest(null);

    if (r.active_card_id) {
      const card = cardsRef.current.find((c) => c.id === r.active_card_id);
      if (card) setActiveCard({ ...card, opened: true });
    } else {
      setActiveCard(null);
    }

    if (r.status === "finished") setGameOver(true);

    const totalCards = cardsRef.current.length || (r.question_ids || []).length;
    if (r.status === "playing" && totalCards > 0 && (r.opened_cards || []).length >= totalCards) {
      base44.entities.GameRoom.update(config.roomId, { status: "finished" });
    }
  };

  const loadOnlineGame = async () => {
    try {
      const r = await base44.entities.GameRoom.get(config.roomId);
      setRoom(r);
      const allQuestions = await base44.entities.Question.filter({ active: true });
      const selectedQuestions = (r.question_ids || []).map((id) => allQuestions.find((q) => q.id === id)).filter(Boolean);
      const loadedCards = selectedQuestions.map((q) => ({ ...q, opened: (r.opened_cards || []).includes(q.id) }));
      setCards(loadedCards);
      cardsRef.current = loadedCards;
      setQuestions(allQuestions);
      setTeams(
        (r.teams || []).map((t, i) => ({
          name: t.name, index: i, score: t.score || 0, strikes: t.strikes || 0,
          bestStrike: t.best_strike || 0, correct: t.correct || 0, wrong: t.wrong || 0,
        }))
      );
      setCurrentTeam(r.current_team || 0);
      if (r.last_answer) setLastAnswer(r.last_answer);
      if (r.end_game_request) setEndGameRequest(r.end_game_request);
      if (r.active_card_id) {
        const card = loadedCards.find((c) => c.id === r.active_card_id);
        if (card) setActiveCard(card);
      }
      if (r.status === "finished") setGameOver(true);
    } catch (e) {
      console.error("Failed to load online game", e);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const data = await base44.entities.Question.filter({ active: true }, "order");
      const grouped = {};
      data.forEach((q) => {
        if (!grouped[q.level]) grouped[q.level] = [];
        grouped[q.level].push(q);
      });
      const board = [];
      activeLevels.forEach((level) => {
        const levelQuestions = shuffle(grouped[level] || []).slice(0, dist.perLevel);
        levelQuestions.forEach((q) => board.push({ ...q, opened: false }));
      });
      setQuestions(data);
      setCards(board);
    } catch (e) {
      console.error("Failed to load questions", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card) => {
    if (isOnline) {
      if (config.teamIndex !== currentTeam) return;
      base44.entities.GameRoom.update(config.roomId, { active_card_id: card.id });
    } else {
      setActiveCard(card);
    }
  };

  const handleAnswer = async (card, data) => {
    if (!isOnline || !room) return;
    await base44.entities.GameRoom.update(config.roomId, {
      last_answer: { card_id: card.id, team_index: currentTeam, ...data },
    });
  };

  const handleResult = async (card, isCorrect, points) => {
    const earnedPoints = points !== undefined ? points : isCorrect ? card.level : 0;
    if (isOnline) {
      if (!room) return;
      if (earnedPoints > 0) {
        const currentTeamStrikes = (room.teams || [])[currentTeam]?.strikes || 0;
        const newStrikes = isCorrect ? currentTeamStrikes + 1 : 0;
        setScorePopup({ points: earnedPoints, teamIndex: currentTeam, strikes: newStrikes });
        setStrikeAnim(true);
        setTimeout(() => { setScorePopup(null); setStrikeAnim(false); }, 1800);
      }
      const updatedRoomTeams = (room.teams || []).map((t, i) => {
        if (i !== currentTeam) return t;
        if (isCorrect) {
          const newStrikes = (t.strikes || 0) + 1;
          return { ...t, score: (t.score || 0) + earnedPoints, strikes: newStrikes, best_strike: Math.max(t.best_strike || 0, newStrikes), correct: (t.correct || 0) + 1 };
        }
        return { ...t, score: (t.score || 0) + earnedPoints, strikes: 0, wrong: (t.wrong || 0) + 1 };
      });
      const openedCards = [...new Set([...(room.opened_cards || []), card.id])];
      const allCardsOpened = cardsRef.current.length > 0 && openedCards.length >= cardsRef.current.length;
      await base44.entities.GameRoom.update(config.roomId, {
        teams: updatedRoomTeams, opened_cards: openedCards, active_card_id: null, last_answer: null,
        current_team: allCardsOpened ? currentTeam : (currentTeam + 1) % numTeams,
      });
    } else {
      setTeams((prev) =>
        prev.map((t, i) => {
          if (i !== currentTeam) return t;
          if (isCorrect) {
            const newStrikes = t.strikes + 1;
            return { ...t, score: t.score + earnedPoints, strikes: newStrikes, bestStrike: Math.max(t.bestStrike, newStrikes), correct: t.correct + 1 };
          }
          return { ...t, score: t.score + earnedPoints, strikes: 0, wrong: t.wrong + 1 };
        })
      );
      const willBeAllOpened = openedCount + 1 >= cards.length;
      isLastCardRef.current = willBeAllOpened;
      if (earnedPoints > 0) {
        const newStrikes = isCorrect ? teams[currentTeam].strikes + 1 : 0;
        setScorePopup({ points: earnedPoints, teamIndex: currentTeam, strikes: newStrikes });
        setStrikeAnim(true);
        setTimeout(() => { setScorePopup(null); setStrikeAnim(false); }, 1800);
      }
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, opened: true } : c)));
    }
  };

  const handleNext = () => {
    setActiveCard(null);
    if (!isOnline && !isLastCardRef.current) setCurrentTeam((t) => (t + 1) % numTeams);
  };

  const openedCount = cards.filter((c) => c.opened).length;
  const cardsLeft = cards.length - openedCount;

  useEffect(() => {
    if (isOnline) return;
    if (cards.length > 0 && openedCount === cards.length) setTimeout(() => setGameOver(true), 800);
  }, [openedCount, cards.length, isOnline]);

  const handlePlayAgain = () => {
    if (isOnline) { onNewGame(); return; }
    setTeams(teamNames.map((name, index) => ({ name, index, score: 0, strikes: 0, bestStrike: 0, correct: 0, wrong: 0 })));
    setCurrentTeam(0);
    setGameOver(false);
    setShowEndDialog(false);
    const grouped = {};
    questions.forEach((q) => { if (!grouped[q.level]) grouped[q.level] = []; grouped[q.level].push(q); });
    const board = [];
    activeLevels.forEach((level) => {
      const shuffled = shuffle(grouped[level] || []).slice(0, dist.perLevel);
      shuffled.forEach((q) => board.push({ ...q, opened: false }));
    });
    setCards(board);
  };

  const handleEndGame = () => setShowEndDialog(true);

  const confirmEndGame = () => {
    setShowEndDialog(false);
    if (isOnline) {
      base44.entities.GameRoom.update(config.roomId, {
        end_game_request: { requested_by: config.teamIndex, team_name: teams[config.teamIndex]?.name || "קבוצה" },
      });
    } else {
      setGameOver(true);
    }
  };

  const handleEndGameApprove = () => {
    base44.entities.GameRoom.update(config.roomId, { status: "finished", end_game_request: null });
  };

  const handleEndGameReject = () => {
    base44.entities.GameRoom.update(config.roomId, { end_game_request: null });
  };

  const cancelEndGameRequest = () => {
    base44.entities.GameRoom.update(config.roomId, { end_game_request: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-12 h-12 border-4 border-[#F49833] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (gameOver) {
    return <EndScreen teams={teams} onPlayAgain={handlePlayAgain} onNewGame={onNewGame} />;
  }

  const rowsByLevel = {};
  activeLevels.forEach((level) => { rowsByLevel[level] = cards.filter((c) => c.level === level); });
  const isMyTurn = !isOnline || config.teamIndex === currentTeam;
  const otherTeamNames = isOnline
    ? teams.filter((_, i) => i !== config.teamIndex).map((t) => t.name).join(", ")
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-100 via-blue-50 to-orange-50" dir="rtl">
      {/* Top zone */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-white to-slate-50 border-b-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-6 pt-3 pb-1">
          <div className="flex items-center gap-3">
            <span className="text-lg md:text-xl font-heading text-slate-700">לוח המדיניות</span>
            <span className="text-sm text-slate-500 font-body">{isOnline && !isMyTurn ? "תור קבוצה אחרת" : `נותרו ${cardsLeft} קלפים`}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <LogoHeader />
            <HomeButton />
            <FullscreenButton />
          </div>
        </div>
        <div className="px-3 md:px-6 pb-3 pt-2">
          <div className={`flex gap-3 md:gap-4 ${numTeams === 3 ? "" : "max-w-4xl mx-auto"}`}>
            {teams.map((team, idx) => (
              <TeamPanel key={idx} team={team} index={idx} isActive={currentTeam === idx} strikeAnimation={strikeAnim && currentTeam === idx} />
            ))}
          </div>
        </div>
        <div className="px-3 md:px-6 pb-2 text-center">
          <p className="text-sm md:text-base text-slate-500 font-body">{isOnline && !isMyTurn ? "ממתינים לתור הקבוצה שלכם..." : "בחרו קלף, ענו נכון וצברו נקודות!"}</p>
        </div>
      </div>

      {/* Center zone - cards */}
      <div className="flex-1 flex flex-col items-center max-w-[1500px] mx-auto w-full px-4 md:px-10 py-4 md:py-6">
        {isOnline && !isMyTurn && (
          <div className="text-center mb-4 text-slate-500 text-lg font-body"><span className="animate-pulse">ממתינים לתור הקבוצה שלכם...</span></div>
        )}
        <div className={`grid ${colsClass} gap-3 md:gap-6 mb-3 md:mb-4 w-full`}>
          {[...activeLevels].reverse().map((level) => (
            <div key={level} className="text-center py-2 md:py-3 rounded-xl bg-white/80 border border-slate-200">
              <span className="text-xl md:text-3xl font-heading text-slate-600">{level}</span>
            </div>
          ))}
        </div>
        <div className={`grid ${colsClass} gap-3 md:gap-6 w-full flex-1`}>
          {[...activeLevels].reverse().map((level) => (
            <div key={level} className="flex flex-col gap-3 md:gap-6 h-full">
              {rowsByLevel[level]?.map((card) => (
                <GameCard key={card.id} card={card} onClick={handleCardClick} disabled={!!activeCard || (isOnline && !isMyTurn)} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom zone */}
      <div className="sticky bottom-0 z-30 bg-gradient-to-t from-slate-50 to-transparent p-4 md:p-6">
        <div className="flex justify-center gap-3 md:gap-4">
          <button onClick={onNewGame} className="px-8 py-4 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 rounded-2xl text-lg font-bold text-slate-700 transition-all hover:scale-105 active:scale-95 font-body shadow-md">חזרה למסך הפתיחה</button>
          {openedCount > 0 && (
            <motion.button initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={handleEndGame} className="px-8 py-4 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 rounded-2xl text-lg font-bold text-slate-700 transition-all hover:scale-105 active:scale-95 font-body shadow-md">סיום משחק</motion.button>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {activeCard && (
        <TaskModal
          card={activeCard}
          teamName={teams[currentTeam]?.name}
          teamColor={TEAM_COLORS[currentTeam]}
          onResult={handleResult}
          onNext={handleNext}
          onAnswer={handleAnswer}
          readOnly={isOnline && config.teamIndex !== currentTeam}
          readOnlyTeamName={teams[currentTeam]?.name}
          lastAnswer={lastAnswer}
          timedMode={config.timedMode}
          timeLimit={config.timeLimit || 30}
        />
      )}

      <ScorePopup popup={scorePopup} teams={teams} numTeams={numTeams} />

      {/* End Game Dialog (initial request) */}
      <EndGameDialog open={showEndDialog} onConfirm={confirmEndGame} onCancel={() => setShowEndDialog(false)} />

      {/* Online: Waiting for approval (requesting team) */}
      {isOnline && endGameRequest && endGameRequest.requested_by === config.teamIndex && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-300 max-w-lg w-full p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-400 mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-3xl font-heading font-bold text-slate-800 mb-4">בהמתנה לאישור</h3>
            <p className="text-lg text-slate-600 mb-8 font-body">ממתינים לאישור סיום המשחק מקבוצה:<br /><span className="text-orange-600 font-bold text-xl">{otherTeamNames}</span></p>
            <button onClick={cancelEndGameRequest} className="px-8 py-4 bg-slate-200 hover:bg-slate-300 rounded-2xl text-xl font-bold text-slate-700 transition-all hover:scale-105 active:scale-95 font-body">ביטול הבקשה</button>
          </div>
        </div>
      )}

      {/* Online: Approve/Reject (other teams) */}
      {isOnline && endGameRequest && endGameRequest.requested_by !== config.teamIndex && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-300 max-w-lg w-full p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-400 mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-3xl font-heading font-bold text-slate-800 mb-4">בקשת סיום משחק</h3>
            <p className="text-lg text-slate-600 mb-8 font-body">קבוצה <span className="text-orange-600 font-bold">{endGameRequest.team_name}</span> מבקשת לסיים את המשחק.<br />האם לאשר?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleEndGameReject} className="px-8 py-4 bg-slate-200 hover:bg-slate-300 rounded-2xl text-xl font-bold text-slate-700 transition-all hover:scale-105 active:scale-95 font-body">דחייה</button>
              <button onClick={handleEndGameApprove} className="px-8 py-4 bg-gradient-to-b from-orange-400 to-red-500 hover:from-orange-300 hover:to-red-400 rounded-2xl text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 font-body">אישור סיום</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}