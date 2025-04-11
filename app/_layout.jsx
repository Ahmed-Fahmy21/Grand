import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index" 
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
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
