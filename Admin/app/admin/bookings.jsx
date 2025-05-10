import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'bookings'),
        orderBy('checkInDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookingsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookingsData.push({
          id: doc.id,
          roomId: data.roomId,
          roomName: data.roomName || 'Unknown Room',
          guestName: data.guestName || 'Unknown Guest',
          guestEmail: data.guestEmail,
          checkInDate: data.checkInDate?.toDate() || new Date(),
          checkOutDate: data.checkOutDate?.toDate() || new Date(),
          totalPrice: data.totalPrice || 0,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate() || new Date(),
          adults: data.adults || 1,
          children: data.children || 0,
          specialRequests: data.specialRequests || ''
        });
      });

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#2ecc71';
      case 'cancelled':
        return '#e74c3c';
      case 'pending':
        return '#f39c12';
      case 'completed':
        return '#3498db';
      default:
        return '#7f8c8d';
    }
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingItem}
      onPress={() => router.push(`/admin/bookings/${item.id}`)}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>Booking #{item.id.substring(0, 6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.bookingRow}>
        <MaterialIcons name="hotel" size={18} color="#3498db" />
        <Text style={styles.bookingText}>{item.roomName}</Text>
      </View>

      <View style={styles.bookingRow}>
        <MaterialIcons name="person" size={18} color="#3498db" />
        <Text style={styles.bookingText}>{item.guestName}</Text>
      </View>

      <View style={styles.bookingRow}>
        <MaterialIcons name="email" size={18} color="#3498db" />
        <Text style={styles.bookingText}>{item.guestEmail}</Text>
      </View>

      <View style={styles.datesContainer}>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>Check-in</Text>
          <Text style={styles.dateValue}>
            {item.checkInDate.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>Check-out</Text>
          <Text style={styles.dateValue}>
            {item.checkOutDate.toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.priceText}>Total: ${item.totalPrice.toFixed(2)}</Text>
        <Text style={styles.guestsText}>
          {item.adults} adult{item.adults !== 1 ? 's' : ''} • {item.children} child{item.children !== 1 ? 'ren' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Management</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Feather name="refresh-cw" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="event-busy" size={50} color="#bdc3c7" />
          <Text style={styles.emptyText}>No bookings found</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/admin/bookings/new')}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  listContent: {
    paddingBottom: 20,
  },
  bookingItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 10,
  },
  bookingId: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  bookingText: {
    fontSize: 15,
    marginLeft: 8,
    color: '#34495e',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dateBox: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  guestsText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});