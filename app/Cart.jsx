import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useCart } from '../context/CartContext';
import { FontAwesome } from '@expo/vector-icons';

export default function CartScreen() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    totalItems,
    totalPrice 
  } = useCart();

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price} / night</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            style={styles.quantityButton}
          >
            <FontAwesome name="minus" size={16} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            style={styles.quantityButton}
          >
            <FontAwesome name="plus" size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => removeFromCart(item.id)}
        style={styles.removeButton}
      >
        <FontAwesome name="trash" size={20} color="#E64A19" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <View style={styles.emptyCart}>
          <FontAwesome name="shopping-cart" size={50} color="#FF9800" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Total Items: {totalItems}</Text>
            <Text style={styles.summaryText}>Total Price: ${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={clearCart}
              style={[styles.button, styles.clearButton]}
            >
              <Text style={styles.buttonText}>Clear Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.checkoutButton]}
            >
              <Text style={styles.buttonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF8F2'
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15
  },
  emptyText: {
    fontSize: 18,
    color: '#555'
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2'
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  itemPrice: {
    fontSize: 14,
    color: '#FF9800',
    marginVertical: 5
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE0B2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  removeButton: {
    padding: 8
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2'
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 5
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearButton: {
    backgroundColor: '#F44336'
  },
  checkoutButton: {
    backgroundColor: '#4CAF50'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  listContent: {
    paddingBottom: 10
  }
});