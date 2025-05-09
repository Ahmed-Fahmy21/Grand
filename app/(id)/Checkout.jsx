import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,TextInput } from 'react-native';
import { useCart } from '../../context/CartContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useState } from 'react';
import { CreditCardInput } from 'react-native-credit-card-input';

import { createBooking } from '../../components/booking';
import { getAuth } from 'firebase/auth';

export default function CheckoutScreen() {
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  // Inside your CheckoutScreen component:
const handlePayment = async () => {
  if (cart.length === 0) {
    Alert.alert('Empty Cart', 'Your cart is empty');
    return;
  }

  if (!cardData?.valid || !cardData?.values.number) {
    Alert.alert('Invalid Card', 'Please enter valid Visa card details');
    return;
  }

  if (!billingDetails.name || !billingDetails.email) {
    Alert.alert('Missing Information', 'Please fill in all required billing details');
    return;
  }

  setLoading(true);
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    // Create booking for each cart item
    const bookings = await Promise.all(
      cart.map(async (item) => {
        return await createBooking({
          roomId: item.id,
          roomName: item.name, // Add room name from cart item
          userId: user.uid,
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
          nights: item.nights,
          totalPrice: item.totalPrice,
          guestName: billingDetails.name,
          guestEmail: billingDetails.email,
        });
      })
    );

    // Process payment (simulated)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    Alert.alert(
      'Booking Confirmed',
      `Your booking has been created!`,
      [{
        text: 'OK',
        onPress: () => {
          clearCart();
          router.replace('/(tabs)/bookings');
        }
      }]
    );
    
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};

  const handleBillingChange = (field, value) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="shopping-cart" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/shop')}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary ({cart.length} items)</Text>
            {cart.map(item => (
              <View key={item.id} style={styles.item}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.checkInDate && item.checkOutDate && (
                    <Text style={styles.itemDates}>
                      {format(new Date(item.checkInDate), 'MMM d')} - {format(new Date(item.checkOutDate), 'MMM d, yyyy')}
                    </Text>
                  )}
                </View>
                <Text style={styles.itemPrice}>
                  ${item.totalPrice?.toFixed(2) || item.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <CreditCardInput
              onChange={setCardData}
              requiresName
              labels={{
                name: "CARDHOLDER'S NAME",
                number: 'CARD NUMBER',
                expiry: 'EXPIRY',
                cvc: 'CVC'
              }}
              placeholders={{
                name: 'Full Name',
                expiry: 'MM/YY',
                cvc: 'CVC'
              }}
              cardScale={1}
              cardFontFamily="System"
              inputContainerStyle={styles.cardInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={billingDetails.name}
              onChangeText={(text) => handleBillingChange('name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={billingDetails.email}
              onChangeText={(text) => handleBillingChange('email', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={billingDetails.address}
              onChangeText={(text) => handleBillingChange('address', text)}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City"
                value={billingDetails.city}
                onChangeText={(text) => handleBillingChange('city', text)}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Postal Code"
                keyboardType="numeric"
                value={billingDetails.postalCode}
                onChangeText={(text) => handleBillingChange('postalCode', text)}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Country"
              value={billingDetails.country}
              onChangeText={(text) => handleBillingChange('country', text)}
            />
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>${(totalPrice * 0.1).toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                ${(totalPrice * 1.1).toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payButtonText}>Pay Now</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
    minHeight: '100%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 20
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333'
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  itemName: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500'
  },
  itemDates: {
    fontSize: 14,
    color: '#888',
    marginTop: 4
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600'
  },
  cardInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'white'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfInput: {
    width: '48%'
  },
  summary: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666'
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  totalLabel: {
    fontWeight: '600',
    color: '#333'
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#4CAF50'
  },
  payButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center'
  },
  payButtonDisabled: {
    opacity: 0.7
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});