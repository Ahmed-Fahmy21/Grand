import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function RoomDetails() {
  const { id } = useLocalSearchParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { cart, addToCart, removeFromCart, totalItems } = useCart();
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000)); // Default to tomorrow
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [nights, setNights] = useState(1);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomRef = doc(db, 'rooms', id);
        const snap = await getDoc(roomRef);

        if (!snap.exists()) {
          setError('Room not found');
        } else {
          setRoom({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  useEffect(() => {
    // Calculate nights when dates change
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNights(diffDays);
  }, [checkInDate, checkOutDate]);

  const handleCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      // Ensure checkout is after checkin
      if (selectedDate >= checkOutDate) {
        const newCheckOut = new Date(selectedDate);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOutDate(newCheckOut);
      }
    }
  };

  const handleCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate && selectedDate > checkInDate) {
      setCheckOutDate(selectedDate);
    } else {
      Alert.alert('Invalid Date', 'Check-out date must be after check-in date');
    }
  };

  const handleCartAction = () => {
    if (!room) return;

    const roomWithDates = {
      ...room,
      checkInDate,
      checkOutDate,
      nights,
      totalPrice: room.price * nights
    };

    if (isInCart) {
      removeFromCart(room.id);
      Alert.alert('Removed from Cart', `${room.name} has been removed from your cart`);
    } else {
      addToCart(roomWithDates);
      Alert.alert(
        'Added to Cart',
        `${room.name} for ${nights} night(s) has been added to your cart`,
        [
          { text: 'Continue Browsing', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/Cart') }
        ]
      );
    }
  };

  const isInCart = cart.some(item => item.id === id);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Loading room details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={50} color="#E64A19" />
        <Text style={styles.errorTitle}>Room Not Found</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/rooms')}
        >
          <Text style={styles.backButtonText}>Browse Rooms</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/rooms')} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#E64A19" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push('/Cart')}
          disabled={totalItems === 0}
          style={styles.cartIcon}
        >
          <FontAwesome name="shopping-cart" size={24} color={totalItems > 0 ? "#E64A19" : "#999"} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Rest of your component remains the same */}
      <Image 
        source={{ uri: room.image }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{room.name}</Text>
        <Text style={styles.price}>${room.price} / night</Text>

        {/* Date Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowCheckInPicker(true)}
              >
                <FontAwesome name="calendar" size={16} color="#555" />
                <Text style={styles.dateText}>{format(checkInDate, 'MMM dd, yyyy')}</Text>
              </TouchableOpacity>
              {showCheckInPicker && (
                <DateTimePicker
                  value={checkInDate}
                  mode="date"
                  display="default"
                  onChange={handleCheckInChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => setShowCheckOutPicker(true)}
              >
                <FontAwesome name="calendar" size={16} color="#555" />
                <Text style={styles.dateText}>{format(checkOutDate, 'MMM dd, yyyy')}</Text>
              </TouchableOpacity>
              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOutDate}
                  mode="date"
                  display="default"
                  onChange={handleCheckOutChange}
                  minimumDate={new Date(checkInDate.getTime() + 86400000)}
                />
              )}
            </View>
          </View>

          <View style={styles.nightsContainer}>
            <Text style={styles.nightsText}>{nights} {nights === 1 ? 'night' : 'nights'}</Text>
            <Text style={styles.totalPriceText}>Total: ${(room.price * nights).toFixed(2)}</Text>
          </View>
        </View>

        {room.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{room.description}</Text>
          </View>
        )}

        {room.amenities && room.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            {room.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <FontAwesome name="check" size={16} color="#4CAF50" />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.cartButton, isInCart && styles.inCartButton]}
        onPress={handleCartAction}
      >
        <FontAwesome 
          name={isInCart ? "check-circle" : "cart-plus"} 
          size={20} 
          color="white" 
        />
        <Text style={styles.cartButtonText}>
          {isInCart ? 'Added to Cart' : `Book for $${(room.price * nights).toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... (keep all your existing styles the same)
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF8F2',
    paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10
  },
  backButton: {
    padding: 10
  },
  cartIcon: {
    padding: 10,
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#E64A19',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#FF9800',
    fontSize: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E64A19',
    marginBottom: 10
  },
  errorText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20
  },
  backButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginTop: 20
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 20
  },
  detailsContainer: {
    paddingHorizontal: 20
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: '#E64A19',
    marginBottom: 20
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  dateInputContainer: {
    width: '48%'
  },
  dateLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333'
  },
  nightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  nightsText: {
    fontSize: 16,
    color: '#555'
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E64A19'
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555'
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  amenityText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 20
  },
  inCartButton: {
    backgroundColor: '#4CAF50'
  },
  cartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10
  }
});