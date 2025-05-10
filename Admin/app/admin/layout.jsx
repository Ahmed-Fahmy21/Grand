// app/admin/_layout.jsx
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import styles from '../../constants/styles';

export default function AdminLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <View style={styles.container}>
      <Header />
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <Sidebar />
        <View style={{ flex: 1, padding: 20 }}>
          {children}
        </View>
      </View>
    </View>
  );
}