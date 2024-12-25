// Frontend (React Native)
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';


import Pusher from 'pusher-js';

const App = () => {
  const [playerMove, setPlayerMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [result, setResult] = useState('');

  const [player,setPlayer] = useState({
    id: Math.random().toString(36).substr(2, 9),
  });

  useEffect(() => {
    const pusher = new Pusher('5ffd502396a114a03464', {
      cluster: 'ap1',
    });
  
    const channel = pusher.subscribe('game-channel');
    channel.bind('player-move', (data) => {
      console.log(data);
      if (data.player != player.id) {
        setOpponentMove(data.move);
      }
      
    });
  
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);
  

  const makeMove = (move) => {
    setPlayerMove(move);

    fetch('http://localhost:3000/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ player: player.id, move }),
    });
    console.log(player.id, move);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rock Paper Scissors</Text>
      <View style={styles.buttons}>
        <Button title="Rock" onPress={() => makeMove('Rock')} />
        <Button title="Paper" onPress={() => makeMove('Paper')} />
        <Button title="Scissors" onPress={() => makeMove('Scissors')} />
      </View>
      <Text style={styles.result}>{result}</Text>
      <Text>Your Move: {playerMove}</Text>
      <Text>Opponent Move: {opponentMove}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  result: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default App;
