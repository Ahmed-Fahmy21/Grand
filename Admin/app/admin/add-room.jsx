import { useState, useEffect } from 'react';
import { View, TextInput, Text, Alert, ActivityIndicator, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';

const AddRoom = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Standard'
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionInfo, setPermissionInfo] = useState(null);
  const router = useRouter();

  const categories = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Family'];

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissionInfo(status === 'granted');
    })();
  }, []);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImage = async () => {
    if (!permissionInfo) {
      Alert.alert('Permission required', 'We need access to your photos to upload images');
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAddRoom = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `rooms/${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, 'rooms'), { 
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        imageUrl,
        createdAt: new Date()
      });

      Alert.alert('Success', 'Room added successfully');
      router.back();
    } catch (err) {
      console.error('Error adding room:', err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/admin/dashboard')}>
          <Feather name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Room</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.roomImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <MaterialIcons name="add-a-photo" size={40} color="#E64A19" />
            <Text style={styles.uploadText}>Upload Room Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Room Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter room name"
        value={formData.name}
        onChangeText={(text) => handleChange('name', text)}
      />

      <Text style={styles.label}>Room Category</Text>
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              formData.category === category && styles.selectedCategory
            ]}
            onPress={() => handleChange('category', category)}
          >
            <Text style={[
              styles.categoryText,
              formData.category === category && styles.selectedCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Price per Night ($)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter price"
        value={formData.price}
        onChangeText={(text) => handleChange('price', text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Enter room description"
        value={formData.description}
        onChangeText={(text) => handleChange('description', text)}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleAddRoom}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add Room</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roomImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  uploadPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E64A19',
    borderStyle: 'dashed',
  },
  uploadText: {
    marginTop: 10,
    color: '#E64A19',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E64A19',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: '#E64A19',
  },
  categoryText: {
    color: '#E64A19',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#E64A19',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddRoom;