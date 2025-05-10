import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';

export default function UpdateRoom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState({ 
    name: '', 
    price: '', 
    description: '',
    category: 'Standard'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const docRef = doc(db, 'rooms', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRoom({
            name: data.name || '',
            price: data.price ? data.price.toString() : '',
            description: data.description || '',
            category: data.category || 'Standard'
          });
        } else {
          Alert.alert('Error', 'Room not found');
          router.back();
        }
      } catch (err) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleUpdate = async () => {
    if (!room.name || !room.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      await updateDoc(doc(db, 'rooms', id), {
        name: room.name,
        price: Number(room.price),
        description: room.description,
        category: room.category
      });
      Alert.alert('Success', 'Room updated successfully');
      router.push('/admin/rooms');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Room</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Room Name</Text>
      <TextInput
        style={styles.input}
        value={room.name}
        onChangeText={(text) => setRoom({...room, name: text})}
        placeholder="Room name"
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        style={styles.input}
        value={room.price}
        onChangeText={(text) => setRoom({...room, price: text})}
        placeholder="Price per night"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={room.description}
        onChangeText={(text) => setRoom({...room, description: text})}
        placeholder="Description"
        multiline
      />

      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdate}
      >
        <Text style={styles.buttonText}>Update Room</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});