
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function About() {
  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3' }}
        style={styles.hotelImage}
      />
      <Text style={styles.title}>Grand Continental Hotel</Text>
      <View style={styles.rating}>
        {[...Array(4)].map((_, i) => (
          <FontAwesome key={i} name="star" size={24} color="#FF9800" />
        ))}
        <FontAwesome name="star-half-o" size={24} color="#FF9800" />
      </View>
      <Text style={styles.description}>
        Welcome to Grand Continental, where luxury meets comfort. Enjoy our world-class services, 
        exquisite dining, and breathtaking views in the heart of the city.
      </Text>
      <View style={styles.features}>
        <View style={styles.featureItem}>
          <FontAwesome name="wifi" size={24} color="#FF9800" />
          <Text style={styles.featureText}>Free WiFi</Text>
        </View>
        <View style={styles.featureItem}>
          <FontAwesome name="coffee" size={24} color="#FF9800" />
          <Text style={styles.featureText}>Breakfast</Text>
        </View>
        <View style={styles.featureItem}>
          <FontAwesome name="tint" size={24} color="#FF9800" />
          <Text style={styles.featureText}>Pool</Text>
        </View>
        <View style={styles.featureItem}>
          <FontAwesome name="spoon" size={24} color="#FF9800" />
          <Text style={styles.featureText}>Restaurant</Text>
        </View>
      </View>
      
      <View style={styles.contact}>
        <Text style={styles.contactTitle}>Contact Us</Text>
        <View style={styles.contactItem}>
          <FontAwesome name="phone" size={18} color="blue" />
          <Text style={styles.contactText}>+20 123 456 7890</Text>
        </View>
        <View style={styles.contactItem}>
          <FontAwesome name="map-marker" size={18} color="red" />
          <Text style={styles.contactText}>23 EL Wehda Street, Giza</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF8F2',
    },
    hotelImage: {
      width: '100%',
      height: 270,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 20,
      color: '#E64A19',
    },
    rating: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 8,
    },
    description: {
      fontSize: 15,
      textAlign: 'center',
      marginHorizontal: 25,
      marginVertical: 15,
      color: '#5D4037',
      lineHeight: 22,
    },
    features: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginVertical: 10,
    },
    featureItem: {
      width: '45%',
      alignItems: 'center',
      marginBottom: 15,
      padding: 15,
      backgroundColor: '#FFE0B2', 
      borderRadius: 10, 
      borderWidth: 1, 
      borderColor: '#FFCC80', 
      margin: 5, 
    },
    featureText: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
      color: '#BF360C', 
    },
    contact: {
      margin: 20,
      marginTop: 10,
      padding: 15,
    },
    contactTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      color: '#E64A19',
      textAlign: 'center',
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 5,
    },
    contactText: {
      marginLeft: 8,
      fontSize: 14,
      color: '#5D4037',
    },
  });
  