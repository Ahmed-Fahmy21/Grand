import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
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

  const handlePayment = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    if (!cardData?.valid || !billingDetails.name || !billingDetails.email) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      const bookingPromises = cart.map(async (item) => {
        const bookingData = {
          roomId: item.id,
          roomName: item.name,
          userId: user.uid,
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
          nights: item.nights,
          totalPrice: item.totalPrice,
          guestName: billingDetails.name,
          guestEmail: billingDetails.email,
        };

        return await createBooking(bookingData);
      });

      const bookingResults = await Promise.all(bookingPromises);

      Alert.alert(
        'Booking Confirmed',
        `Successfully created ${bookingResults.length} bookings!`,
        [{
          text: 'OK',
          onPress: () => {
            clearCart();
            router.replace('/(tabs)/bookings');
          }
        }]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', `Failed to complete checkout: ${error.message}`);
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
              style={[styles.input, styles.inputBilling]}
              placeholder="Full Name"
              value={billingDetails.name}
              onChangeText={(text) => handleBillingChange('name', text)}
            />
            <TextInput
              style={[styles.input, styles.inputBilling]}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={billingDetails.email}
              onChangeText={(text) => handleBillingChange('email', text)}
            />
            <TextInput
              style={[styles.input, styles.inputBilling]}
              placeholder="Address"
              value={billingDetails.address}
              onChangeText={(text) => handleBillingChange('address', text)}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput, styles.inputBilling]}
                placeholder="City"
                value={billingDetails.city}
                onChangeText={(text) => handleBillingChange('city', text)}
              />
              <TextInput
                style={[styles.input, styles.halfInput, styles.inputBilling]}
                placeholder="Postal Code"
                keyboardType="numeric"
                value={billingDetails.postalCode}
                onChangeText={(text) => handleBillingChange('postalCode', text)}
              />
            </View>
            <TextInput
              style={[styles.input, styles.inputBilling]}
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
    backgroundColor: '#FFF8F2',  // Consistent with login screen background
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
    fontWeight: 'bold',
    color: '#E64A19',  // Consistent with login screen title color
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
    backgroundColor: '#FF9800',  // Matching login screen button color
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#FFCCBC',  // Matching login screen input color
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#333',
  },
  cardInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderColor: '#FFCCBC',
    borderWidth: 1,
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfInput: {
    flex: 0.48,
    marginRight: 10
  },
  summary: {
    marginTop: 20
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  totalRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFCCBC',
    paddingTop: 10
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E64A19'
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E64A19'
  },
  payButton: {
    backgroundColor: '#FF9800',  // Matching login screen button color
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  payButtonDisabled: {
    opacity: 0.8
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  },
});

