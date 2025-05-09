import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from '@firebase/auth';
import { auth } from '../../config/firebase';
import { Link, router } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/'); // Redirect to app after successful login
    } catch (error) {
      console.log('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later or reset your password.';
          break;
        default:
          errorMessage = error.message || 'An unknown error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset Sent',
        `A password reset link has been sent to ${email}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setError('Failed to send reset email. Please check your email address.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Login</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <TextInput
          style={[styles.input, error?.includes('email') && styles.inputError]}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, error?.includes('password') && styles.inputError]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
        
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#3498db" />
          ) : (
            <Button 
              title="Login" 
              onPress={handleLogin} 
              color="#3498db" 
            />
          )}
        </View>
        
        <TouchableOpacity onPress={handleResetPassword}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomContainer}>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.toggleText}>Don't have an account? Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  linkText: {
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 20,
  },
  authContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  buttonContainer: {
    marginBottom: 16,
    minHeight: 40,
    justifyContent: 'center',
  },
  toggleText: {
    color: '#3498db',
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: '#fdecea',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
});

export default LoginScreen;