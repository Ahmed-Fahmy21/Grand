import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';

export default function AddReviewSection() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!name || !rating || !comment) {
      Alert.alert('Please fill all fields');
      return;
    }
    Alert.alert('Review submitted', `Thank you, ${name}!`);
    setName(''); setRating(''); setComment('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Add Your Review</Text>
      <TextInput style={styles.input} placeholder="Your Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Rating (1-5)" value={rating} onChangeText={setRating} keyboardType="numeric" />
      <TextInput style={[styles.input, { height: 100 }]} placeholder="Write your review..." value={comment} onChangeText={setComment} multiline />
      <Button title="Submit Review" onPress={handleSubmit} color="#FF9800" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 20, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 10, marginHorizontal: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#E64A19', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10, backgroundColor: '#fff' },
});