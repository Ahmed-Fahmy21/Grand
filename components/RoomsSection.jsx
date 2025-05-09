import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // adjust path as needed

const { width: windowWidth } = Dimensions.get('window');

export default function RoomsSection() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'rooms'));
        const fetchedRooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.card, { width: windowWidth * 0.9 }]}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.featuresRow}>
          {item.features.map((feature, index) => {
            const iconName = feature.includes('Bed')
              ? 'bed'
              : feature.includes('Bath')
              ? 'bath'
              : 'wifi';
            return (
              <View style={styles.feature} key={index}>
                <FontAwesome5 name={iconName} size={16} color="#E64A19" style={styles.featureIcon} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#E64A19" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Explore Our Rooms</Text>
      <FlatList
        data={rooms}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity style={styles.button} onPress={() => router.push('/rooms')}>
        <Text style={styles.buttonText}>Go to Rooms</Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#E64A19',
  },
  button: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 4,
  },
  featureIcon: {
    marginRight: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  cardDesc: {
    marginTop: 6,
    color: '#555',
  },
});
