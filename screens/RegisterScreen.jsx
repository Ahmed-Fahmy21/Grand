import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Modal,
  Pressable
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  onAuthStateChanged
} from '@firebase/auth';
import { auth } from '../config/firebase';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setFormData({
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          phone: user.phoneNumber || '',
          email: user.email || '',
        });
        setImage(user.photoURL);
      }
    });
    return () => unsubscribe();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera permission to take photos');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
      setModalVisible(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // تحديث الصورة والاسم في Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: `${formData.firstName} ${formData.lastName}`,
        photoURL: image || null,
      });

      // تحديث البريد الإلكتروني إذا تغير
      if (formData.email !== user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, formData.email);
        await sendEmailVerification(user);
      }

      // هنا يمكنك إضافة كود لتحديث رقم الهاتف في Firestore إذا كنت تستخدمه

      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.log('Update error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setError('Please enter both current and new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.log('Password change error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Logout error:', error);
      setError('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.profileContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            {!editMode ? (
              <TouchableOpacity onPress={() => setEditMode(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setEditMode(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileSection}>
            <TouchableOpacity 
              onPress={() => editMode && setModalVisible(true)}
              disabled={!editMode}
            >
              <View style={styles.imageContainer}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.placeholderText}>Add Photo</Text>
                  </View>
                )}
                {editMode && (
                  <View style={styles.cameraIcon}>
                    <Text style={styles.cameraIconText}>✏️</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalTitle}>Change Profile Photo</Text>
                  <Pressable
                    style={[styles.modalButton, styles.takePhotoButton]}
                    onPress={takePhoto}
                  >
                    <Text style={styles.modalButtonText}>Take Photo</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.choosePhotoButton]}
                    onPress={pickImage}
                  >
                    <Text style={styles.modalButtonText}>Choose from Library</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {editMode ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({...formData, firstName: text})}
                    placeholder="First Name"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({...formData, lastName: text})}
                    placeholder="Last Name"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({...formData, phone: text})}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData({...formData, email: text})}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {formData.email !== user.email && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Current Password (to verify email change)</Text>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Current Password"
                      secureTextEntry
                    />
                  </View>
                )}

                <View style={styles.passwordChangeSection}>
                  <Text style={styles.sectionTitle}>Change Password</Text>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Current Password</Text>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Current Password"
                      secureTextEntry
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="New Password (min 6 characters)"
                      secureTextEntry
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.changePasswordButton}
                    onPress={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.changePasswordButtonText}>Change Password</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.userName}>{user.displayName || 'No name set'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userPhone}>{formData.phone || 'No phone number'}</Text>
                <Text style={user.emailVerified ? styles.verifiedText : styles.notVerifiedText}>
                  {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                </Text>
              </>
            )}
          </View>

          {!editMode && (
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.logoutButtonText}>Logout</Text>
              )}
            </TouchableOpacity>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}
        </View>
      ) : (
        <ActivityIndicator size="large" color="#3498db" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileContainer: {
    flex: 1,
    padding: 20,
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
    color: '#333',
  },
  editButton: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
  },
  cameraIcon: {
    position: 'absolute',
    right: 10,
    bottom: 0,
    backgroundColor: '#3498db',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconText: {
    fontSize: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 10,
  },
  verifiedText: {
    textAlign: 'center',
    color: '#2ecc71',
    marginBottom: 20,
  },
  notVerifiedText: {
    textAlign: 'center',
    color: '#e74c3c',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    color: '#555',
    fontSize: 14,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  passwordChangeSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  changePasswordButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fdecea',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  successText: {
    color: '#2ecc71',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  takePhotoButton: {
    backgroundColor: '#3498db',
  },
  choosePhotoButton: {
    backgroundColor: '#9b59b6',
  },
  cancelModalButton: {
    backgroundColor: '#e74c3c',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;