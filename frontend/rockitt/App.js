import React, { useEffect, useState } from 'react';
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

  const [roundEnded, setRoundEnded] = useState(false);

  useEffect(() => {
    evaluateGameResult(playerMove, opponentMove);
  }, [playerMove, opponentMove]);

  useEffect(() => {
    if (!gameToken) return;

    const pusher = new Pusher('5ffd502396a114a03464', { cluster: 'ap1' });
    const channel = pusher.subscribe(`game-${gameToken}`);

    channel.bind('room-join', handleRoomJoin);
    channel.bind('room-start', handleRoomStart);
    channel.bind('player-move', handlePlayerMove);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameToken]);


  useEffect(() => {
    if (status === 'Started') startCountdownTimer();
  }, [status]);

  useEffect(() => {
    if(isAnimating) startCountdownTimer();
    else stopCountdownTimer();
  }, [isAnimating]);

  const evaluateGameResult = (playerMove, opponentMove) => {
    if (!playerMove || !opponentMove) return;

    if (playerMove === opponentMove) {
      setResult("It's a tie!");
    } else if (
      (playerMove === 'rock' && opponentMove === 'scissors') ||
      (playerMove === 'scissors' && opponentMove === 'paper') ||
      (playerMove === 'paper' && opponentMove === 'rock')
    ) {
      setResult('You win!');
    } else {
      setResult('You lose!');
    }
  };

  const handleRoomJoin = (data) => {
    setPlayers([data.data.player_1_id, data.data.player_2_id]);
  };

  const handleRoomStart = () => {
    setStatus('Started');
  };

  const handlePlayerMove = (data) => {
    console.log(data);
    const lastMove = data.data.find((item) => item.player_id !== userId && item.round === round);
    setOpponentMove(lastMove ? lastMove.move : null);
    setMoveLocked(true);
  };

  const startCountdownTimer = () => {
    let interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(interval);
          submitMove();
          return 15;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const stopCountdownTimer = () => {
    setTimer(15);
  };

  const submitMove = () => {
    const moves = ['rock', 'paper', 'scissors'];
    const chosenMove = playerMove || moves[Math.floor(Math.random() * moves.length)];

    fetch(`https://backend-rockit.nabilmustofa.my.id/matches/${gameToken}/${round}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ move: chosenMove }),
    }).then(() => {
      setIsAnimating(true);
      setMoveLocked(true);
      setTimeout(() => {
        setIsAnimating(false);
        setMoveLocked(false);
        setPlayerMove(null);
        setOpponentMove(null);
        setRound((prevRound) => prevRound + 1);
      }, 5000);
    });
  };

  const makeMove = (move) => {
    if (!moveLocked) {
      setPlayerMove(move);
    }
  };

  const handleSubmit = async () => {
    if (!jwtToken) {
      Alert.alert('Error', 'Please enter a JWT token');
      return;
    }

    try {
      const response = await fetch('https://backend-rockit.nabilmustofa.my.id/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch game token');

      const data = await response.json();
      setUserId(data.data.player_1_id);
      setPlayers([data.data.player_1_id]);
      setGameToken(data.data.token);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSubmitGameToken = async () => {
    if (!inputGameToken) {
      Alert.alert('Error', 'Please enter a game token');
      return;
    }

    try {
      const response = await fetch(`https://backend-rockit.nabilmustofa.my.id/games/${inputGameToken}/join`, {
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

  const handleStartGame = async () => {
    try {
      await fetch(`https://backend-rockit.nabilmustofa.my.id/games/${gameToken}/start`, {
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
        />
      ) : !gameToken ? (
        <AuthView jwtToken={jwtToken} setJwtToken={setJwtToken} handleSubmit={handleSubmit} />
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
