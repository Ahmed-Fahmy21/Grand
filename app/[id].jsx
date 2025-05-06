// app/singleRoom/[id].js
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function RoomDetails() {
  const { id } = useLocalSearchParams(); // يجب أن يكون نفس المتغير "id" هنا
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'rooms', id));
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() });
      } else {
        console.warn('No such room:', id);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (!room)    return <Text style={{ padding: 20 }}>Room not found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: room.image }} style={styles.image} />
      <Text style={styles.name}>{room.name}</Text>
      <Text style={styles.price}>${room.price} / night</Text>
      {room.description && <Text style={styles.desc}>{room.description}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  image:     { width: '100%', height: 200, borderRadius: 10, marginBottom: 20 },
  name:      { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  price:     { fontSize: 18, color: '#E64A19', marginBottom: 10 },
  desc:      { fontSize: 16, color: '#333', marginTop: 10 },
});
