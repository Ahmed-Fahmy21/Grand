import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
export default function InfoSection() {
  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={require('../assets/carousel-2.jpg')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <FontAwesome name="hotel" size={28} color="#f57c00" />
            <Text style={styles.statNumber}>1200</Text>
            <Text style={styles.statLabel}>Rooms</Text>
          </View>
          <View style={styles.stat}>
            <FontAwesome5 name="users" size={28} color="#f57c00" />
            <Text style={styles.statNumber}>300</Text>
            <Text style={styles.statLabel}>Staffs</Text>
          </View>
          <View style={styles.stat}>
            <FontAwesome5 name="user-plus" size={28} color="#f57c00" />
            <Text style={styles.statNumber}>2500</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: { marginTop: 20 },
  container: { width: screenWidth, height: 160, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,25,31,0.5)' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 20 },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 26, color: '#fff', fontWeight: 'bold', marginTop: 4 },
  statLabel: { fontSize: 16, color: '#fff', marginTop: 2 },
});
