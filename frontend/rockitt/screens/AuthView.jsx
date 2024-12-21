import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AuthView = ({ jwtToken, setJwtToken, handleSubmit }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter JWT Token</Text>
      <TextInput
        style={styles.input}
        placeholder="JWT Token"
        value={jwtToken}
        onChangeText={setJwtToken}
      />
      <Button title="Submit" onPress={handleSubmit} />
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

export default AuthView;
