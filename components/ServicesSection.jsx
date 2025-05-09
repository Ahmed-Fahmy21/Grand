import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const services = [
  { id: '1', icon: 'concierge-bell', title: '24/7 Concierge', desc: 'Our dedicated team is here for you round the clock.' },
  { id: '2', icon: 'utensils', title: 'Fine Dining', desc: 'Enjoy exquisite culinary experiences.' },
  { id: '3', icon: 'spa', title: 'Spa & Wellness', desc: 'Relax and rejuvenate with our spa services.' },
  { id: '4', icon: 'swimmer', title: 'Swimming Pool', desc: 'Take a dip in our luxurious pool.' },
  { id: '5', icon: 'hotel', title: 'Rooms & Department', desc: 'Comfortable rooms tailored for you.' },
  { id: '6', icon: 'dumbbell', title: 'Gym & Yoga', desc: 'Stay fit with our state-of-the-art facilities.' },
];
export default function ServicesSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Explore Our Services</Text>
      <View style={styles.servicesRow}>
        {services.map(s => (
          <TouchableOpacity key={s.id} style={styles.card} activeOpacity={0.8}>
            <FontAwesome5 name={s.icon} size={36} color="#fff" />
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardDesc}>{s.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { marginVertical: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, color: '#E64A19' },
  servicesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  card: { width: 140, height: 180, backgroundColor: '#f57c00', borderRadius: 15, alignItems: 'center', padding: 12, margin: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 8, color: '#fff' },
  cardDesc: { fontSize: 12, textAlign: 'center', marginTop: 4, color: '#ffe0b2' },
});
