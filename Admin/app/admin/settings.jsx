import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function AdminSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [language, setLanguage] = useState('English');
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/admin/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const changeLanguage = () => {
    Alert.alert(
      'Change Language',
      'Select your preferred language',
      [
        { text: 'English', onPress: () => setLanguage('English') },
        { text: 'العربية', onPress: () => setLanguage('العربية') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Feather name="moon" size={20} color="#7f8c8d" />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#767577', true: '#3498db' }}
            thumbColor={darkModeEnabled ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Feather name="bell" size={20} color="#7f8c8d" />
            <Text style={styles.settingLabel}>Enable Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#3498db' }}
            thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={changeLanguage}
        >
          <View style={styles.settingInfo}>
            <Feather name="globe" size={20} color="#7f8c8d" />
            <Text style={styles.settingLabel}>App Language</Text>
          </View>
          <View style={styles.languageValue}>
            <Text style={styles.languageText}>{language}</Text>
            <Feather name="chevron-right" size={20} color="#7f8c8d" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/admin/settings/profile')}
        >
          <View style={styles.settingInfo}>
            <Feather name="user" size={20} color="#7f8c8d" />
            <Text style={styles.settingLabel}>Profile Settings</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#7f8c8d" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/admin/settings/password')}
        >
          <View style={styles.settingInfo}>
            <Feather name="lock" size={20} color="#7f8c8d" />
            <Text style={styles.settingLabel}>Change Password</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#7f8c8d" />
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>Hotel Management System v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 10,
  },
  languageValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginRight: 5,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#bdc3c7',
    fontSize: 12,
    marginHorizontal: 20,
  },
});