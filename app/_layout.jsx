import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Image, View, Text } from 'react-native';
import { CartProvider } from '../context/CartContext';
import { useCart } from '../context/CartContext';

function CartTabIcon({ color }) {
  const { totalItems } = useCart();
  
  return (
    
    <View style={{ position: 'relative' }}>
      
      <FontAwesome name="shopping-cart" size={24} color={color} />
      {totalItems > 0 && (
        <View style={{
          position: 'absolute',
          right: -6,
          top: -3,
          backgroundColor: 'red',
          borderRadius: 10,
          width: 20,
          height: 20,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {totalItems}
          </Text>
          
        </View>
        
      )}
    </View>
  );
}

export default function Layout() {
  return (
    <CartProvider>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Image
                source={require('../assets/logo.jpeg')}
                style={{ width: 26, height: 26 }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: "About",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="info" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="auth"
          options={{
            title: "Auth",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rooms"
          options={{
            title: "Rooms",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="bed" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            headerShown: false,
            tabBarIcon: ({ color }) => <CartTabIcon color={color} />
          }}
        />
      </Tabs>
    </CartProvider>
  );
}