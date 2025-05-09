import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Modal, Pressable, StyleSheet ,Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { signOut, updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, onAuthStateChanged } from '@firebase/auth';
import { ref, set, onValue, update } from 'firebase/database';
import { auth, database } from '../config/firebase';

const ProfileScreen = ({ navigation }) => {
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
                const userPhotoRef = ref(database, 'users/' + user.uid + '/photoURL');
                onValue(userPhotoRef, (snapshot) => {
                    const photoURL = snapshot.val();
                    if (photoURL && photoURL !== state.image) { // Prevent unnecessary updates
                        updateState({ image: photoURL });
                    }
                });
            } else {
                updateState({ user: null }); // Handle user logout
            }
        });
        return unsubscribe;
    }, [state.image]); // Re-run if image changes to update listener if needed

    const handleImage = async (type) => {
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
                    const userDatabaseRef = ref(database, 'users/' + auth.currentUser.uid);
                    await update(userDatabaseRef, { photoURL: base64data }); // Use update
                    await updateProfile(auth.currentUser, { photoURL: base64data });

                    updateState({
                        image: base64data,
                        modalVisible: false,
                        loading: false,
                        success: 'تم تحديث الصورة بنجاح'
                    });
                };
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            updateState({
                error: 'حدث خطأ أثناء رفع الصورة',
                loading: false
            });
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
                const userDatabaseRef = ref(database, 'users/' + auth.currentUser.uid);
                promises.push(update(userDatabaseRef, {
                    firstName: state.formData.firstName,
                    lastName: state.formData.lastName,
                    photoURL: state.image,
                    phone: state.formData.phone,
                    email: state.formData.email // Keep email in database for consistency
                }));
            }

            if (state.formData.email !== state.user.email) {
                const credential = EmailAuthProvider.credential(state.user.email, state.currentPassword);
                await reauthenticateWithCredential(state.user, credential);
                promises.push(updateEmail(state.user, state.formData.email));
                promises.push(sendEmailVerification(state.user));
            }

            await Promise.all(promises);

            updateState({
                success: 'Profile updated!',
                editMode: false,
                loading: false,
                user: { ...auth.currentUser, displayName, photoURL, email: state.formData.email } // Update user in state
            });
        } catch (error) {
            updateState({ error: error.message, loading: false });
        }
    };

    const handlePasswordChange = async () => {
        if (!state.currentPassword || !state.newPassword) return updateState({ error: 'Enter both passwords' });
        if (state.newPassword.length < 6) return updateState({ error: 'Password too short' });

        updateState({ loading: true, error: null });
        try {
            const credential = EmailAuthProvider.credential(state.user.email, state.currentPassword);
            await reauthenticateWithCredential(state.user, credential);
            await updatePassword(state.user, state.newPassword);
            updateState({
                success: 'Password changed!',
                currentPassword: '',
                newPassword: '',
                loading: false
            });
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

    return (
        <View style={styles.container}>
            {!state.user ? <ActivityIndicator size="large" color="#3498db" /> : (
                <View style={styles.profileContainer}>
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
                                            <Text style={styles.placeholderText}>Tap to add photo</Text>
                                        </View>
                                    )}
                                    <View style={styles.cameraIcon}><Text style={styles.cameraIconText}>✏️</Text></View>
                                </View>
                            </TouchableOpacity>
                        )}

                        <Modal visible={state.modalVisible} transparent animationType="slide">
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text style={styles.modalTitle}>Change Profile Photo</Text>
                                    {['Take Photo', 'Choose from Library', 'Cancel'].map((action, i) => (
                                        <Pressable
                                            key={action}
                                            style={[styles.modalButton, styles[`modalButton${i}`]]}
                                            onPress={() => i === 2 ?
                                                updateState({ modalVisible: false }) :
                                                handleImage(i === 0 ? 'camera' : 'library')
                                            }
                                        >
                                            <Text style={styles.modalButtonText}>{action}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </Modal>

                        {state.editMode ? (
                            <>
                                {['First Name', 'Last Name', 'Phone Number', 'Email'].map((field) => (
                                    <View key={field} style={styles.formGroup}>
                                        <Text style={styles.label}>{field}</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={state.formData[field.split(' ')[0].toLowerCase() + (field.includes('Name') ? field.split(' ')[1] : '')]}
                                            onChangeText={(text) => updateState({
                                                formData: {
                                                    ...state.formData,
                                                    [field.split(' ')[0].toLowerCase() + (field.includes('Name') ? field.split(' ')[1] : '')]: text
                                                }
                                            })}
                                            placeholder={field}
                                            keyboardType={field.includes('Phone') ? 'phone-pad' : field.includes('Email') ? 'email-address' : 'default'}
                                            autoCapitalize={field.includes('Name') ? 'words' : 'none'}
                                        />
                                    </View>
                                ))}

                                {state.formData.email !== state.user.email && (
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Current Password</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={state.currentPassword}
                                            onChangeText={(text) => updateState({ currentPassword: text })}
                                            placeholder="For email change"
                                            secureTextEntry
                                        />
                                    </View>
                                )}

                                <View style={styles.passwordChangeSection}>
                                    <Text style={styles.sectionTitle}>Change Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={state.currentPassword}
                                        onChangeText={(text) => updateState({ currentPassword: text })}
                                        placeholder="Current Password"
                                        secureTextEntry
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={state.newPassword}
                                        onChangeText={(text) => updateState({ newPassword: text })}
                                        placeholder="New Password (min 6)"
                                        secureTextEntry
                                    />
                                    <Button
                                        title="Change Password"
                                        onPress={handlePasswordChange}
                                        disabled={state.loading}
                                    />
                                </View>

                                <Button
                                    title="Save Changes"
                                    onPress={handleUpdate}
                                    disabled={state.loading}
                                />
                            </>
                        ) : (
                            <>
                                <Text style={styles.userName}>{state.user.displayName || 'No name'}</Text>
                                <Text style={styles.userEmail}>{state.user.email}</Text>
                                <Text style={styles.userPhone}>{state.formData.phone || 'No phone'}</Text>
                                <Text style={state.user.emailVerified ? styles.verifiedText : styles.notVerifiedText}>
                                    {state.user.emailVerified ? 'Verified' : 'Not Verified'}
                                </Text>
                            </>
                        )}
                    </View>

                    {!state.editMode && (
                        <Button
                            title="Logout"
                            onPress={handleLogout}
                            disabled={state.loading}
                        />
                    )}

                    {state.error && <Text style={styles.errorText}>{state.error}</Text>}
                    {state.success && <Text style={styles.successText}>{state.success}</Text>}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  profileContainer: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  editButton: { color: '#3498db', fontSize: 16, fontWeight: '600' },
  cancelButton: { color: '#e74c3c', fontSize: 16, fontWeight: '600' },
  profileSection: { backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 2 },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  profileImagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#888' },
  cameraIcon: { position: 'absolute', right: 10, bottom: 0, backgroundColor: '#3498db', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  cameraIconText: { fontSize: 16 },
  userName: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  userEmail: { textAlign: 'center', color: '#555', marginBottom: 5 },
  userPhone: { textAlign: 'center', color: '#555', marginBottom: 10 },
  verifiedText: { textAlign: 'center', color: '#2ecc71' },
  notVerifiedText: { textAlign: 'center', color: '#e74c3c' },
  formGroup: { marginBottom: 15 },
  label: { marginBottom: 5, color: '#555', fontSize: 14 },
  input: { height: 40, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, paddingHorizontal: 10, backgroundColor: '#f9f9f9' },
  passwordChangeSection: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalButton: { padding: 12, borderRadius: 5, marginBottom: 10, alignItems: 'center' },
  modalButton0: { backgroundColor: '#3498db' },
  modalButton1: { backgroundColor: '#9b59b6' },
  modalButton2: { backgroundColor: '#e74c3c' },
  modalButtonText: { color: 'white', fontWeight: 'bold' },
  errorText: { color: '#e74c3c', textAlign: 'center', marginTop: 10 },
  successText: { color: '#2ecc71', textAlign: 'center', marginTop: 10 }
});

export default ProfileScreen;