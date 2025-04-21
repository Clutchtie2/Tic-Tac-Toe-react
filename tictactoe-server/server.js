const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const games = {}; // In-memory game store

// Helper function to check for a winner
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// Create a new game
app.post('/game', (req, res) => {
  const gameId = uuidv4();
  games[gameId] = {
    id: gameId,
    squares: Array(9).fill(null),
    players: { X: req.body.player || 'Player1', O: null },
    xIsNext: true,
    winner: null,
  };
  res.status(201).json(games[gameId]);
});

// Join a game
app.post('/game/:id/join', (req, res) => {
  const game = games[req.params.id];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.players.O) return res.status(400).json({ error: 'Game is full' });

  game.players.O = req.body.player || 'Player2';
  res.json(game);
});

// Get game state
app.get('/game/:id', (req, res) => {
  const game = games[req.params.id];
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game);
});

// Make a move
app.post('/game/:id/move', (req, res) => {
  const game = games[req.params.id];
  const { index, player } = req.body;

  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.winner) return res.status(400).json({ error: 'Game already won' });
  if (game.squares[index]) return res.status(400).json({ error: 'Square already taken' });

  const expected = game.xIsNext ? 'X' : 'O';
  if (game.players[expected] !== player) {
    return res.status(400).json({ error: `It's not ${player}'s turn` });
  }

  game.squares[index] = expected;
  game.winner = calculateWinner(game.squares);
  game.xIsNext = !game.xIsNext;

  res.json(game);
});

app.listen(port, () => {
  console.log(`Tic-Tac-Toe multiplayer API running on http://localhost:${port}`);
});
