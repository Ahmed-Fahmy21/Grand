import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Image } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'rooms'));
        setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Error fetching rooms:', e);
      }
    })();
  }, []);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRoomItem = ({ item: room }) => (
    <Pressable
      style={styles.roomItem}
      onPress={() => router.push(`/${room.id}`)} 
    >
      <Image source={{ uri: room.image }} style={styles.roomImage} />
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.roomPrice}>${room.price} / night</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Rooms</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search room name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        renderItem={renderRoomItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF8F2' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E64A19', marginBottom: 20, textAlign: 'center' },
  searchInput: {
    height: 40, borderColor: '#FFE0B2', borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 10, marginBottom: 20, backgroundColor: '#FFF'
  },
  listContent: { paddingBottom: 20 },
  roomItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#FFE0B2'
  },
  roomImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  roomInfo: { marginLeft: 15 },
  roomName: { fontSize: 18, fontWeight: '600', color: '#333' },
  roomPrice: { fontSize: 16, color: '#FF9800' },
});
