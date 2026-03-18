import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function createDeck() {
  let deck = [];
  suits.forEach(s => {
    values.forEach(v => {
      deck.push({ suit: s, value: v });
    });
  });
  return shuffle(deck);
}

function shuffle(deck) {
  return [...deck].sort(() => Math.random() - 0.5);
}

function getValue(card) {
  if (["J","Q","K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
}

function calculateScore(hand) {
  let total = 0;
  let aces = 0;

  hand.forEach(card => {
    total += getValue(card);
    if (card.value === "A") aces++;
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

const Card = ({ card }) => (
  <motion.div
    initial={{ y: -80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.25 }}
    className="w-20 h-28 bg-white text-black rounded-2xl shadow-xl flex flex-col justify-between p-2"
  >
    <div>{card.value}</div>
    <div className="text-center text-2xl">{card.suit}</div>
    <div className="text-right">{card.value}</div>
  </motion.div>
);

export default function App() {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [bet, setBet] = useState(100);

  useEffect(() => {
    startGame();
  }, []);

  function startGame() {
    const newDeck = createDeck();

    const newPlayers = [
      { name: "Người 1", hand: [], money: 1000 },
      { name: "Người 2", hand: [], money: 1000 },
      { name: "Người 3", hand: [], money: 1000 },
      { name: "Người 4", hand: [], money: 1000 }
    ];

    newPlayers.forEach(p => {
      p.hand.push(newDeck.pop(), newDeck.pop());
    });

    setDeck(newDeck);
    setPlayers(newPlayers);
    setDealer([newDeck.pop(), newDeck.pop()]);
    setCurrentPlayer(0);
    setGameOver(false);
    setMessage("");
  }

  function hit() {
    if (gameOver) return;

    let newDeck = [...deck];
    let newPlayers = [...players];

    newPlayers[currentPlayer].hand.push(newDeck.pop());

    setDeck(newDeck);
    setPlayers(newPlayers);

    if (calculateScore(newPlayers[currentPlayer].hand) > 21) {
      nextTurn();
    }
  }

  function stand() {
    nextTurn();
  }

  function nextTurn() {
    if (currentPlayer < players.length - 1) {
      setCurrentPlayer(currentPlayer + 1);
    } else {
      dealerTurn();
    }
  }

  function dealerTurn() {
    let newDeck = [...deck];
    let newDealer = [...dealer];

    while (calculateScore(newDealer) < 17) {
      newDealer.push(newDeck.pop());
    }

    let newPlayers = [...players];

    newPlayers.forEach(p => {
      const pScore = calculateScore(p.hand);
      const dScore = calculateScore(newDealer);

      if (pScore > 21) {
        p.money -= bet;
      } else if (dScore > 21 || pScore > dScore) {
        p.money += bet;
      } else if (pScore < dScore) {
        p.money -= bet;
      }
    });

    setPlayers(newPlayers);
    setDealer(newDealer);
    setGameOver(true);
    setMessage("🎉 Kết thúc ván!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-600 text-white flex flex-col items-center p-6 gap-4">
      <h1 className="text-4xl font-bold">🎰 Casino Xì Dách (4 Người)</h1>

      <div className="flex gap-2 items-center">
        <span>Cược chung:</span>
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(Number(e.target.value))}
          className="text-black px-2 py-1 rounded"
        />
      </div>

      <div>
        <h2>Nhà cái ({calculateScore(dealer)})</h2>
        <div className="flex gap-2">
          {dealer.map((c, i) => <Card key={i} card={c} />)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        {players.map((p, index) => (
          <div key={index} className={`p-3 rounded-xl ${currentPlayer === index && !gameOver ? "bg-yellow-400 text-black" : "bg-black/30"}`}>
            <h3 className="font-bold">{p.name} ({calculateScore(p.hand)})</h3>
            <div className="flex gap-2 flex-wrap">
              {p.hand.map((c, i) => <Card key={i} card={c} />)}
            </div>
            <div>💰 {p.money}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={hit} className="bg-yellow-400 text-black px-4 py-2 rounded-xl">Rút</button>
        <button onClick={stand} className="bg-blue-400 text-black px-4 py-2 rounded-xl">Dừng</button>
        <button onClick={startGame} className="bg-red-400 text-black px-4 py-2 rounded-xl">Chơi lại</button>
      </div>

      {message && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-2xl mt-4"
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}
