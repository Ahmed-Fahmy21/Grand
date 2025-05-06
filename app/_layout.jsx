import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'react-native';

export default function Layout() {
  return (
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
        
      </Tabs>
  );
}