import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Grand Continental</Text>
      
      <Link href="/about" style={styles.button}>
        <Text style={styles.buttonText}>About Us</Text>
      </Link>
      
      <Link href="/rooms" style={styles.button}>
        <Text style={styles.buttonText}>Our Rooms</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF8F2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#E64A19',
  },
  button: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
