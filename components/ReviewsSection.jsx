import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Alert, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(3);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'reviews'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(data);
    } catch (e) {
      console.error('Error loading reviews:', e);
    }
  };

  const addReview = async () => {
    if (!name || !comment) {
      Alert.alert('Please enter both name and comment');
      return;
    }

    try {
      const newReview = {
        name,
        rating,
        comment,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews([{ id: docRef.id, ...newReview }, ...reviews]);

      setName('');
      setComment('');
      setRating(3);
    } catch (e) {
      console.error('Error adding review:', e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.comment}>
      <View style={styles.userInfo}>
        <FontAwesome name="user-circle" size={30} color="#555" />
        <Text style={styles.userName}>{item.name}</Text>
      </View>
      <View style={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <FontAwesome key={i} name={i < item.rating ? 'star' : 'star-o'} size={16} color="#f57c00" />
        ))}
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Customer Reviews</Text>

      <TextInput style={styles.input} placeholder="Your Name" value={name} onChangeText={setName} />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Your Comment" multiline value={comment} onChangeText={setComment} />

      <Text style={styles.label}>Rating: {rating} stars</Text>
      <View style={{ alignItems: 'center' }}>
        <Slider
          style={{ width: '20%', height: 30 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={rating}
          onValueChange={setRating}
          minimumTrackTintColor="#E64A19"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#E64A19"
        />
      </View>

      <View style={{ alignItems: 'center' }}>
        <TouchableOpacity style={styles.submitBtn} onPress={addReview}>
          <Text style={styles.submitText}>Submit Review</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, marginTop: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#E64A19' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  label: { textAlign: 'center', marginBottom: 10, color: '#555' },
  comment: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, elevation: 2 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userName: { marginLeft: 10, fontSize: 16, fontWeight: 'bold', color: '#333' },
  rating: { flexDirection: 'row', marginBottom: 10 },
  commentText: { fontSize: 14, color: '#555', lineHeight: 20 },
  submitBtn: {
    backgroundColor: '#E64A19',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    width: '40%',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
