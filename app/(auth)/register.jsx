import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullname: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    setError('');
    if (!formData.fullname.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Invalid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be 6+ characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      setSuccess('Account created successfully!');
      setTimeout(() => router.replace('/profile'), 1500);

    } catch (error) {
      switch(error.code) {
        case 'auth/email-already-in-use':
          setError('Email already registered');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={formData.fullname}
        onChangeText={(text) => setFormData({...formData, fullname: text})}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        editable={!loading}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={formData.password}
          onChangeText={(text) => setFormData({...formData, password: text})}
          editable={!loading}
        />
        <Pressable 
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
          disabled={loading}
        >
          <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👀'}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>{success}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" style={styles.loadingIndicator} />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>

      <Link href="/login" style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#FFF8F2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#E64A19',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#FFCCBC',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#FFCCBC',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  eyeIcon: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: '#FFCC80',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: '#E64A19',
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 15,
  },
  successText: {
    color: '#388E3C',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 15,
  },
  loadingIndicator: {
    marginVertical: 2,
  }
});