import React, { useState } from "react";
import StartScreen from "@/pages/StartScreen";
import GameBoard from "@/pages/GameBoard";

export default function Home() {
  const [phase, setPhase] = useState("start");
  const [gameConfig, setGameConfig] = useState(null);

  const handleStart = (config) => {
    setGameConfig(config);
    setPhase("playing");
  };

  const handleNewGame = () => {
    setPhase("start");
    setGameConfig(null);
  };

  if (phase === "start") {
    return <StartScreen onStart={handleStart} />;
  }

  return <GameBoard config={gameConfig} onNewGame={handleNewGame} />;
}