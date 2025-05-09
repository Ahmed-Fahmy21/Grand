import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, Modal, Pressable, StyleSheet, Button
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  signOut, updateProfile, updateEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification,
  onAuthStateChanged
} from '@firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref as dbRef, update, onValue, getDatabase } from 'firebase/database';
import { auth, db } from '../../config/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateState({
          user,
          formData: {
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            phone: user.phoneNumber || '',
            email: user.email || ''
          },
          image: user.photoURL
        });

        const userPhotoRef = dbRef(getDatabase(), 'users/' + user.uid + '/photoURL');
        onValue(userPhotoRef, (snapshot) => {
          const photoURL = snapshot.val();
          if (photoURL && photoURL !== state.image) {
            updateState({ image: photoURL });
          }
        });
      } else {
        router.replace('/login'); // لو اتسجل خروج
        updateState({ user: null });
      }
    });

    return unsubscribe;
  }, [state.image]);

  const handleImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        updateState({ loading: true });

        const response = await fetch(result.assets[0].uri);
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
      }
    } catch (error) {
      updateState({ error: 'Error uploading photo', loading: false });
    }
  };

  const handleUpdate = async () => {
    updateState({ loading: true, error: null });
    try {
      const displayName = `${state.formData.firstName} ${state.formData.lastName}`;
      const photoURL = state.image;
      const promises = [];

      if (displayName !== state.user.displayName || photoURL !== state.user.photoURL) {
        promises.push(updateProfile(auth.currentUser, { displayName, photoURL }));
        const userDbRef = dbRef(getDatabase(), 'users/' + auth.currentUser.uid);
        promises.push(update(userDbRef, { photoURL }));
      }

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      promises.push(setDoc(userDocRef, {
        firstName: state.formData.firstName,
        lastName: state.formData.lastName,
        phone: state.formData.phone,
        email: state.formData.email
      }, { merge: true }));

      if (state.formData.email !== state.user.email) {
        const credential = EmailAuthProvider.credential(state.user.email, state.currentPassword);
        await reauthenticateWithCredential(state.user, credential);
        promises.push(updateEmail(state.user, state.formData.email));
        promises.push(sendEmailVerification(state.user));
      }

      await Promise.all(promises);

      updateState({
        success: 'Profile updated successfully',
        editMode: false,
        loading: false,
        user: {
          ...auth.currentUser,
          displayName,
          photoURL,
          email: state.formData.email
        }
      });
    } catch (error) {
      updateState({ error: error.message, loading: false });
    }
  };

  const handlePasswordChange = async () => {
    if (!state.currentPassword || !state.newPassword)
      return updateState({ error: 'Enter both current and new password' });
    if (state.newPassword.length < 6)
      return updateState({ error: 'New password is too short' });

    updateState({ loading: true });
    try {
      const credential = EmailAuthProvider.credential(state.user.email, state.currentPassword);
      await reauthenticateWithCredential(state.user, credential);
      await updatePassword(state.user, state.newPassword);
      updateState({ success: 'Password changed successfully', currentPassword: '', newPassword: '', loading: false });
    } catch (error) {
      updateState({ error: error.message, loading: false });
    }
  };

  const handleLogout = async () => {
    updateState({ loading: true });
    try {
      await signOut(auth);
    } catch (error) {
      updateState({ error: 'Logout failed', loading: false });
    }
  };

  if (!state.user) return <ActivityIndicator size="large" color="#3498db" style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => updateState({ editMode: !state.editMode })}>
          <Text style={state.editMode ? styles.cancelButton : styles.editButton}>
            {state.editMode ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        {state.editMode && (
          <TouchableOpacity onPress={() => updateState({ modalVisible: true })}>
            <View style={styles.imageContainer}>
              {state.image ? (
                <Image source={{ uri: state.image }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.placeholderText}>Add Photo</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        <Modal visible={state.modalVisible} transparent animationType="slide">
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Button title="Choose Photo" onPress={handleImage} />
              <Button title="Cancel" onPress={() => updateState({ modalVisible: false })} />
            </View>
          </View>
        </Modal>

        {state.editMode ? (
          <>
            <TextInput
              style={styles.input}
              value={state.formData.firstName}
              onChangeText={(text) => updateState({ formData: { ...state.formData, firstName: text } })}
              placeholder="First Name"
            />
            <TextInput
              style={styles.input}
              value={state.formData.lastName}
              onChangeText={(text) => updateState({ formData: { ...state.formData, lastName: text } })}
              placeholder="Last Name"
            />
            <TextInput
              style={styles.input}
              value={state.formData.phone}
              onChangeText={(text) => updateState({ formData: { ...state.formData, phone: text } })}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              value={state.formData.email}
              onChangeText={(text) => updateState({ formData: { ...state.formData, email: text } })}
              placeholder="Email"
              keyboardType="email-address"
            />
            <Button title="Save Changes" onPress={handleUpdate} />
          </>
        ) : (
          <>
            <Text style={styles.title}>{state.user.displayName}</Text>
            <Text style={styles.subtitle}>{state.user.email}</Text>
          </>
        )}
      </View>

      <Button title="Logout" onPress={handleLogout} />
      {state.error && <Text style={{ color: 'red' }}>{state.error}</Text>}
      {state.success && <Text style={{ color: 'green' }}>{state.success}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: 'bold' },
  editButton: { color: 'blue' },
  cancelButton: { color: 'red' },
  profileSection: { marginVertical: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5 },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  profileImagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#666' },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  subtitle: { color: '#555', marginBottom: 10 }
});

export default ProfileScreen;
