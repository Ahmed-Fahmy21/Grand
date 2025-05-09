import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useCart } from '../../context/CartContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const { cart, totalPrice, clearCart } = useCart();

  const handlePayment = async () => {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Payment Successful',
        `Your order of $${totalPrice.toFixed(2)} has been processed!`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.push('/(tabs)/cart'); // Return to cart after success
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Payment Failed', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart.map(item => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>
              {item.quantity} × ${item.price} = ${(item.quantity * item.price).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity style={styles.paymentMethod}>
          <FontAwesome name="credit-card" size={20} color="#4CAF50" />
          <Text style={styles.paymentText}>Credit/Debit Card</Text>
          <FontAwesome name="chevron-right" size={16} color="#999" style={styles.chevron} />
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
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
        style={styles.payButton}
        onPress={handlePayment}
      >
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9'
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  itemName: {
    fontSize: 16,
    color: '#555'
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600'
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10
  },
  chevron: {
    marginLeft: 'auto'
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
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});