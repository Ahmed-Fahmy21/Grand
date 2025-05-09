import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export default function HeaderSection() {
  return (
    <ImageBackground
      source={require('../assets/carousel-1.jpg')}
      style={styles.headerBackground}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <View style={styles.line} />
          <Text style={styles.luxText}>Luxury Living</Text>
          <View style={styles.line} />
        </View>
        <Text style={[styles.textLine, { marginTop: 20 }]}>Discover A Brand</Text>
        <Text style={styles.textLine}>Luxurious Hotel</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    headerBackground: { width, height: width * 0.8, justifyContent: 'center', alignItems: 'center' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,25,31,0.5)' },
    textContainer: { alignItems: 'center', zIndex: 2 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    line: { width: 40, height: 2, backgroundColor: '#f57c00' },
    luxText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginHorizontal: 10 },
    textLine: { color: '#fff', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  });