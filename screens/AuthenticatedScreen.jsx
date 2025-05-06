import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signOut, sendEmailVerification, onAuthStateChanged } from '@firebase/auth';
import { auth } from '../config/firebase';

const AuthenticatedScreen = ({ user }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [currentUser, setCurrentUser] = useState(user);

  // Track auth state changes to update verification status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Logout error:', error);
      setError('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (cooldown > 0) return;
    
    setError(null);
    setLoading(true);
    
    try {
      await sendEmailVerification(auth.currentUser, {
        handleCodeInApp: true,
        url: 'https://yourapp.com/verify-email', // Replace with your app's URL
      });
      
      setVerificationSent(true);
      setCooldown(60); // 60 seconds cooldown
      Alert.alert(
        'Verification Email Sent',
        'Please check your inbox and follow the instructions to verify your email address.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.log('Verification error:', error);
      
      let errorMessage = 'Failed to send verification email. Please try again.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait before trying again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.emailText}>{currentUser.email}</Text>
        
        {!currentUser.emailVerified && (
          <View style={styles.verificationContainer}>
            <Text style={styles.warningText}>Email not verified</Text>
            <Text style={styles.instructionsText}>
              Please verify your email to access all features.
            </Text>
            
            {verificationSent ? (
              <Text style={styles.successText}>
                Verification email sent! {cooldown > 0 && `(Wait ${cooldown}s to resend)`}
              </Text>
            ) : (
              <TouchableOpacity 
                onPress={handleResendVerification} 
                disabled={loading || cooldown > 0}
              >
                <View style={styles.resendButton}>
                  {loading ? (
                    <ActivityIndicator color="#3498db" />
                  ) : (
                    <Text style={styles.linkText}>
                      Resend verification email
                      {cooldown > 0 && ` (${cooldown}s)`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button 
            title={loading && !verificationSent ? "Logging Out..." : "Logout"} 
            onPress={handleLogout} 
            color="#e74c3c" 
            disabled={loading}
          />
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
  emailText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  verificationContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  warningText: {
    color: '#ff9800',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionsText: {
    color: '#5f5f5f',
    textAlign: 'center',
    marginBottom: 10,
  },
  successText: {
    color: '#4caf50',
    textAlign: 'center',
    marginTop: 5,
  },
  linkText: {
    color: '#3498db',
    textAlign: 'center',
    fontWeight: '500',
  },
  resendButton: {
    padding: 8,
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
  buttonContainer: {
    marginTop: 10,
  },
});

export default AuthenticatedScreen;