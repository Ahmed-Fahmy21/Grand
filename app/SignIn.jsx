import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import {auth,signInWithEmailAndPassword} from '../firebase.js';
import { router } from 'expo-router';



export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  //const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Successfully signed in
      //navigate('/dashboard'); // redirect to dashboard or home page
      router.push(`./about`)
    } catch (err) {
      setError(err.message);
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <SignInForm 
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        handleSubmit={handleSubmit}
      />
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF8F2',
  },
  signinContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#E64A19',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#D32F2F',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FDE7E7',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#5D4037',
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D7CCC8',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#BCAAA4',
  },
});