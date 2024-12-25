import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import Pusher from 'pusher-js';

const App = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [gameToken, setGameToken] = useState(null);
  const [inputGameToken, setInputGameToken] = useState('');
  const [players, setPlayers] = useState([]);
const[userId,setUserId] = useState(null);
  const [status, setStatus] = useState('');

  const [playerMove, setPlayerMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [result, setResult] = useState('');
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(15); // Timer state
  const [moveLocked, setMoveLocked] = useState(false); // Lock moves during countdown

  const [isAnimating, setIsAnimating] = useState(false);


  useEffect(() => {
    if (playerMove && opponentMove) {
      if (playerMove === opponentMove) {
        setResult('It\'s a tie!');
      } else if (
        (playerMove === 'Rock' && opponentMove === 'Scissors') ||
        (playerMove === 'Scissors' && opponentMove === 'Paper') ||
        (playerMove === 'Paper' && opponentMove === 'Rock')
      ) {
        setResult('You win!');
      } else {
        setResult('You lose!');
      }
    }
  }, [playerMove, opponentMove]);


  useEffect(() => {
    console.log(gameToken);
    const pusher = new Pusher('5ffd502396a114a03464', {
      cluster: 'ap1',
    });
  
    const channel = pusher.subscribe(`game-${gameToken}`);
    channel.bind('room-join', (data) => {
      console.log(data);
      setPlayers([data.data.player_1_id, data.data.player_2_id]);
    });
    channel.bind('room-start', (data) => {
      console.log(data);
      setStatus('Started');
    });

    const getLastMove = (data, playerId) => {
      const moves = data.filter(item => item.player_id != playerId);
      return moves.length > 0 ? moves[moves.length - 1] : null;
    };
    channel.bind('player-move', (data) => {
      console.log(data);
      const lastMoveOpponent = getLastMove(data.data, userId);
      setOpponentMove (lastMoveOpponent ? lastMoveOpponent.move : null);
      
    });

    
    console.log(gameToken);
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [gameToken]);
  useEffect(() => {
    let interval;
    if (status === 'Started') {
      // Start a countdown timer
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(interval);
            submitMove(); // Automatically submit move when timer reaches 0
            
            return 15; // Reset timer for the next round
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval); // Cleanup timer
  }, [status, playerMove]);

  const submitMove = () => {
    // If no move is made, randomly choose a move
    const moves = ['Rock', 'Paper', 'Scissors'];
    const chosenMove = playerMove || moves[Math.floor(Math.random() * moves.length)];
  

  
    // Submit the move
    fetch(`https://backend-rockit.nabilmustofa.my.id/matches/${gameToken}/${round}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ move: chosenMove }),
    }).then(() => {
      setIsAnimating(true); // Start the animation
      setPlayerMove(null); // Reset player's move
      setMoveLocked(true); // Lock moves during animation
  
      // Wait 5 seconds for the animation, then reset and prepare for the next round
      setTimeout(() => {
        setIsAnimating(false); // End the animation
        setMoveLocked(false); // Unlock moves
        setRound((prevRound) => prevRound + 1);
         // Increment round
      }, 5000); // 5-second delay for the animation
    });
  };

  const makeMove = (move) => {
    if (!moveLocked) {
      setPlayerMove(move);
      setMoveLocked(true); // Lock move until timer resets
    }
  };

  useEffect(() => {
    if (playerMove && opponentMove) {
      if (playerMove === opponentMove) {
        setResult('It\'s a tie!');
      } else if (
        (playerMove === 'Rock' && opponentMove === 'Scissors') ||
        (playerMove === 'Scissors' && opponentMove === 'Paper') ||
        (playerMove === 'Paper' && opponentMove === 'Rock')
      ) {
        setResult('You win!');
      } else {
        setResult('You lose!');
      }
    }
  }, [playerMove, opponentMove]);
  const handleSubmit = async () => {
    if (!jwtToken) {
      Alert.alert('Error', 'Please enter a JWT token');
      return;
    }

    try {
      // Simulate API call to get game token
      const response = await fetch('https://backend-rockit.nabilmustofa.my.id/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch game token');
      }

      const data = await response.json();
      setUserId(data.data.player_1_id);
      setPlayers([data.data.player_1_id]);
      console.log(data,response);

      setGameToken(data.data.token);
      console.log(gameToken);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSubmitGameToken = async () => {
    if (!gameToken) {
      Alert.alert('Error', 'Please enter a game token');
      return;
    }

    const response = await fetch('https://backend-rockit.nabilmustofa.my.id/games/' + inputGameToken + '/join', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const data = await response.json();
    console.log(data);
    setPlayers([data.data.player_1_id, data.data.player_2_id]);

    setGameToken(inputGameToken);


  }
  const handleStartGame = async () => {
    const response = await fetch('https://backend-rockit.nabilmustofa.my.id/games/' + gameToken + '/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    console.log(response);  
  }

  return (
    <View style={styles.container}>
      {status === 'Started' ? (
            <View style={styles.container}>
                      <Text>Game Started</Text>
                      <Text>Round: {round}</Text>
            <Text style={styles.title}>Rock Paper Scissors</Text>
             <Text>Timer: {timer} seconds</Text>
             {isAnimating ? (
  <Text style={styles.animationText}>Processing results...</Text>
) : (
  <View style={styles.buttons}>
    <Button title="Rock" onPress={() => makeMove('Rock')} disabled={moveLocked} />
    <Button title="Paper" onPress={() => makeMove('Paper')} disabled={moveLocked} />
    <Button title="Scissors" onPress={() => makeMove('Scissors')} disabled={moveLocked} />
  </View>
)}
            <Text style={styles.result}>{result}</Text>
            <Text>Your Move: {playerMove}</Text>
            <Text>Opponent Move: {opponentMove}</Text>
          </View>

      ) : !gameToken ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter JWT Token:</Text>
          <TextInput
            style={styles.input}
            value={jwtToken}
            onChangeText={setJwtToken}
            placeholder="JWT Token"
            autoCapitalize="none"
          />
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      ) : (
        <View style={styles.tokenContainer}>
          <Text style={styles.label}>Token Permainan:</Text>
          <Text style={styles.token}>{gameToken}</Text>
          <Text>Player Count: {players.length}</Text>
          <View>
            <TextInput
              style={styles.input}
              value={inputGameToken}
              onChangeText={setInputGameToken}
              placeholder="Game Token"
              autoCapitalize="none"
            />
            <Button title="Submit Token" onPress={handleSubmitGameToken} />
          </View>
  
          {players.length === 2 && (
            <View>
              <Text>Player 1: {players[0]}</Text>
              <Text>Player 2: {players[1]}</Text>
              <Button title="Mulai Permainan" onPress={handleStartGame} />
            </View>
          )}
        </View>
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
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  tokenContainer: {
    alignItems: 'center',
  },
  token: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  }
});

export default App;
