import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import room1 from '../assets/room-1.jpg';
import room2 from '../assets/room2.jpg';
import room3 from '../assets/room3.jpg';

const rooms = [
  {
    id: '1',
    name: 'Double Room',
    features: ['2 Beds', '1 Bath'],
    description: 'A comfortable room featuring a large double bed.',
    image: room1,
  },
  {
    id: '2',
    name: 'Comfort Suite',
    features: ['1 Bed', '1 Bath', 'Wifi'],
    description: 'Relax in style with our comfortable suites.',
    image: room2,
  },
  {
    id: '3',
    name: 'Luxury Room',
    features: ['3 Beds', '2 Baths', 'Wifi'],
    description: 'A lavish room with elegant decor and modern amenities.',
    image: room3,
  },
];

const { width: windowWidth } = Dimensions.get('window');

export default function RoomsSection() {
  const router = useRouter();

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.card, { width: windowWidth * 0.9 }]}>      
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.featuresRow}>
            {item.features.map(feature => {
              const iconName = feature.includes('Bed')
                ? 'bed'
                : feature.includes('Bath')
                ? 'bath'
                : 'wifi';
              return (
                <View style={styles.feature} key={feature}>
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
  };

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
