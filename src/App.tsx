import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MainMenu from "./pages/MainMenu";
import CharacterSelect from "./pages/CharacterSelect";
import GameScreen from "./pages/GameScreen";
import GameOverScreen from "./pages/GameOverScreen";
import LeaderboardScreen from "./pages/LeaderboardScreen";
import { addScoreEntry } from "./game/leaderboard";
import type { CharacterType, GameScreenName } from "./game/types";

export default function App() {
  const [screen, setScreen] = useState<GameScreenName>("menu");
  const [character, setCharacter] = useState<CharacterType>("boy");
  const [playerName, setPlayerName] = useState("Player");
  const [lastScore, setLastScore] = useState(0);
  const [lastRound, setLastRound] = useState(1);

  const handleSelectCharacter = useCallback((char: CharacterType, name: string) => {
    setCharacter(char);
    setPlayerName(name);
    setScreen("game");
  }, []);

  const handleGameOver = useCallback(
    (score: number, round: number) => {
      setLastScore(score);
      setLastRound(round);
      addScoreEntry(playerName, score, round, character);
      setScreen("game-over");
    },
    [playerName, character]
  );

  const handlePlayAgain = useCallback(() => {
    setScreen("game");
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <AnimatePresence mode="wait">
        {screen === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <MainMenu
              onPlay={() => setScreen("character-select")}
              onLeaderboard={() => setScreen("leaderboard")}
            />
          </motion.div>
        )}

        {screen === "character-select" && (
          <motion.div
            key="character-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CharacterSelect
              onSelect={handleSelectCharacter}
              onBack={() => setScreen("menu")}
            />
          </motion.div>
        )}

        {screen === "game" && (
          <motion.div
            key={`game-${Date.now()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GameScreen character={character} onGameOver={handleGameOver} />
          </motion.div>
        )}

        {screen === "game-over" && (
          <motion.div
            key="game-over"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <GameOverScreen
              score={lastScore}
              round={lastRound}
              character={character}
              playerName={playerName}
              onPlayAgain={handlePlayAgain}
              onMainMenu={() => setScreen("menu")}
              onLeaderboard={() => setScreen("leaderboard")}
            />
          </motion.div>
        )}

        {screen === "leaderboard" && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LeaderboardScreen onBack={() => setScreen("menu")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
