import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@firebase/auth';
import { auth } from '../config/firebase';
import AuthScreen from './AuthScreen';
import AuthenticatedScreen from './AuthenticatedScreen';

const AuthApp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthentication = async () => {
    try {
      if (user) {
        await signOut(auth);
        Alert('User logged out successfully!');
      } else {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
          Alert('User signed in successfully!');
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
          Alert('User created successfully!');
        }
      }
    } catch (error) {
      Alert('Authentication error:', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? (
        <AuthenticatedScreen user={user} handleAuthentication={handleAuthentication} />
      ) : (
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          handleAuthentication={handleAuthentication}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
});

export default AuthApp;