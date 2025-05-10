// components/Sidebar.jsx
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const Sidebar = () => {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Users',
      icon: 'people',
      route: '/admin/guests'
    },
    {
      title: 'View Rooms',
      icon: 'hotel',
      route: '/admin/rooms'
    },
    {
      title: 'Add Room',
      icon: 'add-box',
      route: '/admin/add-room'
    },
    {
      title: 'View Bookings',
      icon: 'event-note',
      route: '/admin/bookings'
    },
    {
      title: 'Reports',
      icon: 'assessment',
      route: '/admin/reports'
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/admin/settings'
    },
    {
      title: 'Profile',
      icon: 'person',
      route: '/admin/settings/profile'
    }
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => router.push(item.route)}
        >
          <MaterialIcons 
            name={item.icon} 
            size={24} 
            color="#E64A19" 
          />
          <Text style={styles.menuText}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handleLogout}
      >
        <MaterialIcons 
          name="exit-to-app" 
          size={24} 
          color="#E64A19" 
        />
        <Text style={styles.menuText}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 5,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
});

export default Sidebar;