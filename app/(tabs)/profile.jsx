import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, Modal, Pressable, StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  signOut, updateProfile, updateEmail,
  EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification,
  onAuthStateChanged
} from '@firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; 
import { ref as dbRef, update, onValue, getDatabase, off } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import { router } from 'expo-router';

const ProfileScreen = () => {
  const [state, setState] = useState({
    user: null,
    loading: false,
    error: null,
    success: null,
    image: null,
    modalVisible: false,
    editMode: false,
    currentPassword: '',
    newPassword: '',
    formData: { firstName: '', lastName: '', phone: '', email: '' }
  });

  const updateState = (newState) => setState(prev => ({ ...prev, ...newState }));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const fullName = user.displayName || '';
          const nameParts = fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          updateState({
            user,
            formData: {
              firstName,
              lastName,
              phone: user.phoneNumber || '',
              email: user.email || ''
            },
            image: user.photoURL
          });

          const userPhotoRef = dbRef(getDatabase(), `users/${user.uid}/photoURL`);
          const listener = onValue(userPhotoRef, (snapshot) => {
            const photoURL = snapshot.val();
            if (photoURL && photoURL !== state.image) {
              updateState({ image: photoURL });
            }
          });

          return () => off(userPhotoRef);
        } catch (error) {
          console.error('Profile load error:', error);
          updateState({ error: 'Failed to load profile data' });
        }
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const uploadImage = async (uri) => {
    try {
      updateState({ loading: true });
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64data = reader.result;
        const userDbRef = dbRef(getDatabase(), 'users/' + auth.currentUser.uid);
        await update(userDbRef, { photoURL: base64data });
        await updateProfile(auth.currentUser, { photoURL: base64data });

        updateState({
          image: base64data,
          modalVisible: false,
          loading: false,
          success: 'Photo updated successfully'
        });
      };
    } catch (error) {
      updateState({ error: 'Error uploading photo', loading: false });
    }
  };

  const handleImagePicker = async (useCamera = false) => {
    try {
      const result = await (useCamera 
        ? ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.2,
          }));

      if (!result.canceled && result.assets?.[0]?.uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      updateState({ 
        error: useCamera 
          ? 'Camera error: ' + error.message 
          : 'Gallery error: ' + error.message,
        loading: false 
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      updateState({ loading: true, error: null });
      
      const { firstName, lastName, email } = state.formData;
      const displayName = `${firstName} ${lastName}`.trim();
      const updates = {};

      // تحديث الاسم أو الصورة إذا كانت قد تغيرت
      if (displayName !== state.user.displayName || state.image !== state.user.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL: state.image
        });
        updates.displayName = displayName;
        updates.photoURL = state.image;
      }

      // تحديث البريد الإلكتروني إذا كان قد تغير
      if (email !== state.user.email) {
        const credential = EmailAuthProvider.credential(
          state.user.email,
          state.currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updateEmail(auth.currentUser, email);
        await sendEmailVerification(auth.currentUser);
        updates.email = email;
      }

      // تحديث البيانات في Firebase Realtime Database
      await update(dbRef(getDatabase(), `users/${auth.currentUser.uid}`), {
        ...updates,
        firstName,
        lastName,
        phone: state.formData.phone,
        lastUpdated: Date.now()
      });

      // تحديث البيانات في Firestore
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        firstName,
        lastName,
        phone: state.formData.phone,
        email,
        lastUpdated: Date.now()
      }, { merge: true });

      updateState({
        success: 'Profile updated successfully',
        editMode: false,
        loading: false,
        user: {
          ...auth.currentUser,
          displayName,
          photoURL: state.image,
          email
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      updateState({ 
        error: 'Update failed: ' + error.message,
        loading: false 
      });
    }
  };

  const handleLogout = async () => {
    try {
      updateState({ loading: true });
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      updateState({ 
        error: 'Logout failed',
        loading: false 
      });
    }
  };

  // دالة لحذف الصورة
  const handleRemoveImage = async () => {
    try {
      updateState({ loading: true });

      // حذف الصورة في Firebase Realtime Database
      const userDbRef = dbRef(getDatabase(), 'users/' + auth.currentUser.uid);
      await update(userDbRef, { photoURL: null });

      // حذف الصورة في Firebase Authentication
      await updateProfile(auth.currentUser, { photoURL: null });

      updateState({
        image: null,
        modalVisible: false,
        loading: false,
        success: 'Photo removed successfully'
      });

    } catch (error) {
      updateState({ 
        error: 'Error removing photo',
        loading: false 
      });
    }
  };

  if (!state.user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity 
          onPress={() => updateState({ editMode: !state.editMode })}
          disabled={state.loading}
        >
          <Text style={state.editMode ? styles.cancelButton : styles.editButton}>
            {state.editMode ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity 
          onPress={() => updateState({ modalVisible: true })}
          disabled={state.loading || !state.editMode}
        >
          <View style={styles.imageContainer}>
            {state.image ? (
              <Image 
                source={{ uri: state.image }} 
                style={styles.profileImage}
                onLoadStart={() => updateState({ loading: true })}
                onLoadEnd={() => updateState({ loading: false })}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.placeholderText}>Add Photo</Text>
              </View>
            )}
            {state.loading && (
              <ActivityIndicator 
                style={styles.loadingOverlay} 
                color="#3498db" 
                size="small" 
              />
            )}
          </View>
        </TouchableOpacity>

        {/* إضافة زر لحذف الصورة */}
        {state.image && (
          <TouchableOpacity 
            onPress={handleRemoveImage}
            style={styles.removePhotoButton}
            disabled={state.loading}
          >
            <Text style={styles.buttonText}>Remove Photo</Text>
          </TouchableOpacity>
        )}

        <Modal 
          visible={state.modalVisible} 
          transparent 
          animationType="slide"
          onRequestClose={() => updateState({ modalVisible: false })}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Change Profile Photo</Text>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => handleImagePicker(true)}
                disabled={state.loading}
              >
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => handleImagePicker(false)}
                disabled={state.loading}
              >
                <Text style={styles.buttonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => updateState({ modalVisible: false })}
                disabled={state.loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={state.formData.firstName}
        onChangeText={text => updateState({ formData: { ...state.formData, firstName: text } })}
        editable={state.editMode}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={state.formData.lastName}
        onChangeText={text => updateState({ formData: { ...state.formData, lastName: text } })}
        editable={state.editMode}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={state.formData.phone}
        onChangeText={text => updateState({ formData: { ...state.formData, phone: text } })}
        editable={state.editMode}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={state.formData.email}
        onChangeText={text => updateState({ formData: { ...state.formData, email: text } })}
        editable={state.editMode}
      />

      {state.editMode && (
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
            state.loading && styles.buttonDisabled
          ]}
          onPress={handleUpdateProfile}
          disabled={state.loading}
        >
          {state.loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.buttonPressed
        ]}
        onPress={handleLogout}
        disabled={state.loading}
      >
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#3498db',
    fontSize: 18,
  },
  cancelButton: {
    color: '#e74c3c',
    fontSize: 18,
  },
  profileSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dcdcdc',
  },
  placeholderText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  removePhotoButton: {
    width: '100%',
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginTop: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
});

export default ProfileScreen;
