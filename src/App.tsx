import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import MainMenu from "./pages/MainMenu";
import CharacterSelect from "./pages/CharacterSelect";
import GameScreen from "./pages/GameScreen";
import GameOverScreen from "./pages/GameOverScreen";
import LeaderboardScreen from "./pages/LeaderboardScreen";
import { addScoreEntry } from "./game/leaderboard";
import type { CharacterType, GameScreenName } from "./game/types";

const PENDING_SCORE_KEY = "shawarma-pending-guest-score";

interface PendingScore {
  playerName: string;
  score: number;
  round: number;
  character: CharacterType;
  timestamp: number;
}

export default function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [screen, setScreen] = useState<GameScreenName>("menu");
  const [character, setCharacter] = useState<CharacterType>("boy");
  const [playerName, setPlayerName] = useState("Player");
  const [lastScore, setLastScore] = useState(0);
  const [lastRound, setLastRound] = useState(1);

  // When user signs in, retroactively save any pending guest scores
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const raw = localStorage.getItem(PENDING_SCORE_KEY);
        if (raw) {
          const pending: PendingScore = JSON.parse(raw);
          addScoreEntry(pending.playerName, pending.score, pending.round, pending.character);
          localStorage.removeItem(PENDING_SCORE_KEY);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [isAuthenticated]);

  const handleSelectCharacter = useCallback((char: CharacterType, name: string) => {
    setCharacter(char);
    setPlayerName(name);
    setScreen("game");
  }, []);

  const handleGameOver = useCallback(
    (score: number, round: number) => {
      setLastScore(score);
      setLastRound(round);
      if (isAuthenticated) {
        // Signed in — save directly
        addScoreEntry(playerName, score, round, character);
      } else {
        // Guest — save as pending so it can be retroactively added on sign-in
        const pending: PendingScore = {
          playerName,
          score,
          round,
          character,
          timestamp: Date.now(),
        };
        localStorage.setItem(PENDING_SCORE_KEY, JSON.stringify(pending));
      }
      setScreen("game-over");
    },
    [playerName, character, isAuthenticated]
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
            <GameScreen
              character={character}
              onGameOver={handleGameOver}
              onMainMenu={() => {
                if (!isAuthenticated) localStorage.setItem("force-guest-ts", Date.now().toString());
                navigate("/dashboard");
              }}
              onLeaderboard={() => setScreen("leaderboard")}
            />
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
              onMainMenu={() => {
                if (!isAuthenticated) localStorage.setItem("force-guest-ts", Date.now().toString());
                navigate("/dashboard");
              }}
              onLeaderboard={() => setScreen("leaderboard")}
              isAuthenticated={isAuthenticated}
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
