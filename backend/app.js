// Backend (Express.js)
const express = require('express');
const Pusher = require('pusher');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configure Pusher


const pusher = new Pusher({
  appId: "1488927",
  key: "5ffd502396a114a03464",
  secret: "8a39f9a1fc77e2abf8a6",
  cluster: "ap1",
  useTLS: true
});


app.use(cors());
app.use(bodyParser.json());

// Endpoint to broadcast moves
app.post('/move', (req, res) => {
  const { player, move } = req.body;

  pusher.trigger('game-channel', 'player-move', {
    player,
    move
  });

  res.status(200).send('Move broadcasted');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});