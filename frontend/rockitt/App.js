import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Pusher from 'pusher-js';
import GameView from './screens/GameView';
import AuthView from './screens/AuthView';
import LobbyView from './screens/LobbyView';

const App = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [gameToken, setGameToken] = useState(null);
  const [inputGameToken, setInputGameToken] = useState('');
  const [players, setPlayers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState('');
  const [playerMove, setPlayerMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [result, setResult] = useState('');
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(15);
  const [moveLocked, setMoveLocked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  // 1. Evaluasi hasil permainan
  useEffect(() => {
    if (playerMove && opponentMove) {
      evaluateGameResult(playerMove, opponentMove);
    }
  }, [playerMove, opponentMove]);

  // 2. Mengatur Pusher untuk menerima event
  useEffect(() => {
    if (!gameToken) return;
    const pusher = new Pusher('5ffd502396a114a03464', { cluster: 'ap1' });
    const channel = pusher.subscribe(`game-${gameToken}`);

    channel.bind('room-join', handleRoomJoin)
    channel.bind('room-start', handleRoomStart);
    channel.bind('round-move', handlePlayerMove);
    channel.bind('round-end', handlePlayerFinish);
    channel.bind('room-end', handleGameEnd);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameToken]);

  // 3. Mengatur timer untuk permainan
  useEffect(() => {
    if (status === "Started") {
      startTimer();
    }

    if (timer === 0) {
      stopTimer();
    }
    return () => {
      clearInterval(timerIntervalRef.current); // Cleanup interval on component unmount
    };
  }, [status, timer]);

  // 4. Mengatur hasil permainan
  const evaluateGameResult = (playerMove, opponentMove) => {
    if (!playerMove || !opponentMove) return;

    if (playerMove === opponentMove) {
      setResult("It's a tie!");
    } else if (
      (playerMove === 'Rock' && opponentMove === 'Scissors') ||
      (playerMove === 'Scissors' && opponentMove === 'Paper') ||
      (playerMove === 'Paper' && opponentMove === 'Rock')
    ) {
      setResult('You win!');
      setPlayerScore((prevScore) => prevScore + 1);
    } else {
      setResult('You lose!');
      setOpponentScore((prevScore) => prevScore + 1);
    }
  };

  // 5. Mengatur perubahan status permainan
  const handleRoomJoin = (data) => {
    setPlayers([data.data.player_1_id, data.data.player_2_id]);
  };

  const handleRoomStart = () => {
    setStatus('Started');
  };

  const handleGameEnd = () => {
    setStatus('Ended');
  };

  // 6. Mengatur timer
  const timerIntervalRef = useRef(null); // Use useRef for timer interval

  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current); // Clear existing interval to prevent duplicates
    }
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerIntervalRef.current); // Stop the interval when timer ends
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null; // Reset the ref
    }
    submitMove();
  };

  // 7. Mengirim hasil permainan
  const sendResult = (playerScore, opponentScore) => {
    const result = playerScore > opponentScore ? 'win' : 'lose';
    fetch(`http://13.239.139.158/games/${gameToken}/stop`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ result: result }),
    });
  };

  useEffect(() => {
    if (playerScore >2 || opponentScore > 2) {
      sendResult(playerScore, opponentScore);
    }
  },[playerScore, opponentScore]);

  // 8. Mengatur pergerakan pemain
  const handlePlayerMove = (data) => {
    console.log(data);
    const isPlayer1 = data.data.player_1_id === userId;
    console.log(isPlayer1,userId);
    const opponentMove = isPlayer1 ? data.data.player_2_move : data.data.player_1_move;
    setOpponentMove(opponentMove || null);
  };

  // 9. Mengatur pengiriman pergerakan
  const sendFinish = () =>{
    fetch(`http://13.239.139.158/matches/${gameToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    );
  }

  useEffect(() => {
    if (playerMove != null && opponentMove!= null) {
      evaluateGameResult();
      sendFinish();
    }
  },[playerMove, opponentMove])

  // 10. Mengatur pergerakan pemain lokal
  const makeMove = (move) => {
    if (!moveLocked) {
      setPlayerMove(move);
    }
  };

  // 11. Mengatur pengiriman pergerakan lokal
  const submitMove = async() => {
    const moves = ['Rock', 'Paper', 'Scissors'];
    const chosenMove = playerMove || moves[Math.floor(Math.random() * moves.length)];

    let response = await fetch(`http://13.239.139.158/matches/${gameToken}/${round}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ move: chosenMove }),
    }
    );
    setMoveLocked(true);
    setRound((prevRound) => prevRound + 1);
  }
    
  // 12. Mengatur pengiriman token JWT
  const handleSubmit = async () => {
    console.log(userId)
    if (!jwtToken) {
      Alert.alert('Error', 'Please enter a JWT token');
      return;
    }

    try {
      const response = await fetch('http://13.239.139.158/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch game token');

      const data = await response.json();
      setPlayers([data.data.player_1_id]);
      setGameToken(data.data.token);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // 13. Mengatur pengiriman token permainan
  const handleSubmitGameToken = async () => {
    if (!inputGameToken) {
      Alert.alert('Error', 'Please enter a game token');
      return;
    }

    try {
      const response = await fetch(`http://13.239.139.158/games/${inputGameToken}/join`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const data = await response.json();
      setPlayers([data.data.player_1_id, data.data.player_2_id]);
      setGameToken(inputGameToken);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // 14. Mengatur pengiriman perintah mulai permainan
  const handleStartGame = async () => {
    try {
      await fetch(`http://13.239.139.158/games/${gameToken}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePlayerFinish = () => {
    evaluateGameResult(playerMove, opponentMove);
setTimeout(() => {
      setOpponentMove(null);
    setPlayerMove(null);
    setResult(null);
    setTimer(10);
    setMoveLocked(false);
}, 3000);
  };

  return (
    <View style={styles.container}>
      {status === 'Started' ? (
        <GameView
          round={round}
          timer={timer}
          isAnimating={isAnimating}
          makeMove={makeMove}
          result={result}
          playerMove={playerMove}
          opponentMove={opponentMove}
          moveLocked={moveLocked}
          playerScore={playerScore}
          opponentScore={opponentScore}
        />
      ) : !gameToken ? (
        <AuthView jwtToken={jwtToken} setJwtToken={setJwtToken} handleSubmit={handleSubmit} userId={userId} setUserId={setUserId} />
      ) : (
        <LobbyView
          gameToken={gameToken}
          players={players}
          inputGameToken={inputGameToken}
          setInputGameToken={setInputGameToken}
          handleSubmitGameToken={handleSubmitGameToken}
          handleStartGame={handleStartGame}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default App;
