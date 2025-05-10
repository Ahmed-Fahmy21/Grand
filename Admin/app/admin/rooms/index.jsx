import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../../config/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'rooms'), async (snapshot) => {
      const roomsData = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let imageUrl = null;
        
        if (data.imageUrl) {
          try {
            imageUrl = await getDownloadURL(ref(storage, data.imageUrl));
          } catch (error) {
            console.error("Error getting image URL:", error);
          }
        }
        
        return {
          id: doc.id,
          ...data,
          imageUrl
        };
      }));
      
      setRooms(roomsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deleteRoom = async (id) => {
    try {
      await deleteDoc(doc(db, 'rooms', id));
      Alert.alert('Success', 'Room deleted successfully');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleEditRoom = (roomId) => {
    router.push(`/admin/update-room/${roomId}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.roomItem}>
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.roomImage} 
      />
      <View style={styles.roomDetails}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomCategory}>{item.category}</Text>
        <Text style={styles.roomPrice}>${item.price}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => handleEditRoom(item.id)}
          style={styles.editButton}
        >
          <Feather name="edit" size={20} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => deleteRoom(item.id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Room Management</Text>
      </View>
      
      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  roomImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  roomDetails: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roomCategory: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  roomPrice: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: 15,
    paddingBottom: 20,
  },
});