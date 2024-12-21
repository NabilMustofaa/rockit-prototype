import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const LobbyView = ({
  gameToken,
  players,
  inputGameToken,
  setInputGameToken,
  handleSubmitGameToken,
  handleStartGame,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Lobby</Text>
      <Text>Game Token: {gameToken}</Text>
      <Text>Players: {players.join(', ') || 'Waiting for players...'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Game Token"
        value={inputGameToken}
        onChangeText={setInputGameToken}
      />
      <Button title="Join Game" onPress={handleSubmitGameToken} />
      <Button title="Start Game" onPress={handleStartGame} />
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
    fontSize: 20,
    marginBottom: 16,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
});

export default LobbyView;
