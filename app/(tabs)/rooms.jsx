import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Image, TouchableOpacity } from 'react-native';
import { db } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); 
  const router = useRouter();
  const { cart, addToCart, removeFromCart, totalItems } = useCart();

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

  const filteredRooms = rooms
    .filter(room =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );

  const isInCart = roomId => cart.some(item => item.id === roomId);

  const renderRoomItem = ({ item: room }) => (
    <Pressable
      style={styles.roomItem}
      onPress={() => router.push(`/${room.id}`)}
    >
      <Image source={{ uri: room.image }} style={styles.roomImage} />
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.roomPrice}>${room.price} / night</Text>
        <Text style={styles.roomDescription} numberOfLines={2}>
          {room.description}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.cartButton}
        onPress={e => {
          e.stopPropagation();
          isInCart(room.id) ? removeFromCart(room.id) : addToCart(room);
        }}
      >
        <FontAwesome
          name={isInCart(room.id) ? 'check-circle' : 'cart-plus'}
          size={24}
          color={isInCart(room.id) ? '#4CAF50' : '#FF9800'}
        />
      </TouchableOpacity>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Rooms</Text>
        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => router.push('/Cart')}
          disabled={totalItems === 0}
        >
          <FontAwesome
            name="shopping-cart"
            size={24}
            color={totalItems > 0 ? '#E64A19' : '#999'}
          />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sort by price button */}
      <TouchableOpacity
        onPress={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
      >
        <Text style={styles.sortText}>
          Sort by price: {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="Search room name..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredRooms}
        keyExtractor={item => item.id}
        renderItem={renderRoomItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No rooms found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF8F2'
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
    color: '#E64A19'
  },
  sortText: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 10
  },
  searchInput: {
    height: 48,
    borderColor: '#FFCCBC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333'
  },
  listContent: {
    paddingBottom: 20
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  roomImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  roomInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  roomPrice: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '500',
    marginBottom: 4
  },
  roomDescription: {
    fontSize: 14,
    color: '#666'
  },
  cartButton: {
    padding: 8
  },
  cartIcon: {
    padding: 8,
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16
  }
});
