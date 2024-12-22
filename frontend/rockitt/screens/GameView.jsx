import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const GameView = ({
  round,
  timer,
  isAnimating,
  makeMove,
  result,
  playerMove,
  opponentMove,
  moveLocked,
  playerScore,
  opponentScore
}) => {
  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Round {round}</Text>
      <Text>Score: {playerScore} - {opponentScore}</Text>
      <Text>Time Left: {timer}s</Text>
      <Text>Result: {result}</Text>
      <Text>Your Move: {playerMove || 'None'}</Text>
      <Text>Opponent Move: {opponentMove || 'None'}</Text>
      <View style={styles.buttons}>
        <Button
          title="Rock"
          onPress={() => makeMove('rock')}
          disabled={moveLocked || isAnimating}
        />
        <Button
          title="Paper"
          onPress={() => makeMove('paper')}
          disabled={moveLocked || isAnimating}
        />
        <Button
          title="Scissors"
          onPress={() => makeMove('scissors')}
          disabled={moveLocked || isAnimating}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

export default GameView;
