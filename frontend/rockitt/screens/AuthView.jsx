import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AuthView = ({ jwtToken, setJwtToken, handleSubmit }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  useEffect(() => {
    handleSubmit();
  }, [jwtToken]);
  const onSubmit = async () => {
    try {
      const response = await fetch('http://13.239.139.158/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ username, pin }),
      });
  
      const data = await response.json();
      console.log(data);
  
      setJwtToken(data.access_token); // Set the new JWT token/ Log the new token directly
 // Call handleSubmit after setting the token
    } catch (error) {
      alert(error.message);
    }finally {

    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
      />
      <Button title="Submit" onPress={onSubmit} />
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
