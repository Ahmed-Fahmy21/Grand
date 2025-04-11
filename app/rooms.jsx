import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const rooms = [
  { name: "Deluxe Room", price: "$200" },
  { name: "Family Suite", price: "$300" },
  { name: "Executive Room", price: "$250" },
  { name: "Presidential Suite", price: "$500" }
];

export default function Rooms() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Rooms</Text>
      
      {rooms.map((room, index) => (
        <View key={index} style={styles.roomItem}>
          <FontAwesome name="bed" size={24} color="#FF9800" />
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.roomPrice}>{room.price}/night</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF8F2'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E64A19',
    marginBottom: 20,
    textAlign: 'center'
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2'
  },
  roomInfo: {
    marginLeft: 15
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  roomPrice: {
    fontSize: 16,
    color: '#FF9800'
  }
});
