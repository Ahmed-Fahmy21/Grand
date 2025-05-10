import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeFromBookings = null;

    const unsubscribeFromAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setIsLoggedIn(!!user);
      setBookings([]);

      if (unsubscribeFromBookings) {
        unsubscribeFromBookings(); // stop previous Firestore listener
        unsubscribeFromBookings = null;
      }

      if (user) {
        const q = query(
          collection(db, 'booking'),
          where('userId', '==', user.uid)
        );

        unsubscribeFromBookings = onSnapshot(q, (snapshot) => {
          const bookingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setBookings(bookingsData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeFromAuth();
      if (unsubscribeFromBookings) unsubscribeFromBookings();
    };
  }, []);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.roomName}>Room #{item.roomName}</Text>
      <Text>
        Dates: {formatDate(item.checkInDate)} - {formatDate(item.checkOutDate)}
      </Text>
      <Text>Status: {item.status}</Text>
      <Text>Total: ${item.totalPrice}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : !isLoggedIn ? (
        <Text style={styles.message}>Please log in to view your bookings.</Text>
      ) : bookings.length === 0 ? (
        <Text style={styles.message}>You have no bookings.</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#FFF8F2',  // Consistent with other screens
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#E64A19',  // Consistent with title color in other screens
  },
  message: { 
    fontSize: 16, 
    color: 'gray',
    marginTop: 20 
  },
  bookingCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,  // Consistent elevation style
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  roomName: { 
    fontWeight: 'bold', 
    fontSize: 18, 
    color: '#333'
  },
});
