import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/stores/auth.store';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { profile_settings_texts } from '../constants/constants';
import { MoveLeft } from 'lucide-react-native';
import { pickImageFromDevice, uploadImageToSupabase } from '@/utils/imageHelper';
import { useUserProfile } from '@/hooks/useProfileQuery';
import { profileService } from '@/services/profileService';

export default function ProfileSettingsScreen({ navigation }: any) {
  const signOut = useAuthStore(state => state.signOut);
  const authUser = useAuthStore(state => state.user);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useUserProfile(authUser?.id ?? '');

  const [profileImage, setProfileImage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    if (user) {
      setProfileImage(user.profile_image || '');
      setDisplayName(user.display_name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setPreviewImage(user.profile_image || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!authUser?.id) return;
    setSaving(true);

    try {
      if (profileImage !== user?.profile_image) {
        await profileService.updateProfileImage(authUser.id, profileImage);
      }
      if (displayName !== user?.display_name) {
        await profileService.updateDisplayName(authUser.id, displayName);
      }
      if (username !== user?.username) {
        await profileService.updateUsername(authUser.id, username);
      }
      if (bio !== user?.bio) {
        await profileService.updateBio(authUser.id, bio);
      }
      await refetch();
      Toast.show({
        type: 'success',
        text1: 'Profile updated!',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
      });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!authUser?.email || !newPassword) return;
    setSaving(true);
    try {
      await profileService.changePassword(authUser.email, newPassword);
      Toast.show({
        type: 'success',
        text1: 'Password changed!',
      });
      setNewPassword('');
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Password change failed',
      });
    }
    setSaving(false);
  };

  // Modal handlers
  const openImageModal = () => setModalVisible(true);
  const closeImageModal = () => setModalVisible(false);

  const handlePreviewUrl = () => {
    setPreviewImage(imageUrlInput);
  };

  const handleUseImageUrl = () => {
    setProfileImage(imageUrlInput);
    setPreviewImage(imageUrlInput);
    setImageUrlInput('');
    closeImageModal();
  };

  const handleAddImageFromDevice = async (fromCamera: boolean) => {
    const asset = await pickImageFromDevice(fromCamera);
    closeImageModal();

    if (asset && asset.base64 && asset.uri && authUser?.id) {
      const url = await uploadImageToSupabase(authUser.id, {
        base64: asset.base64,
      });
      if (url) {
        setProfileImage(url);
        setPreviewImage(url);
      } else {
        Alert.alert('Upload failed', 'Could not upload image to Supabase.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView} edges={['top']}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingViewStyle}>
        <ScrollView style={styles.container}>
          <View>
            <View style={styles.backRow}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                onPress={() => navigation.goBack()}
              >
                {Platform.OS === 'ios' ? (
                  <Icon name="keyboard-backspace" size={16} color="#E16235" />
                ) : (
                  <MoveLeft size={16} color="#E16235" />
                )}
                <Text>Go back</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.titleColumn}>
              <Text style={styles.title}>
                {profile_settings_texts.header.screenName}
              </Text>
              <Text style={styles.subTitle}>
                {profile_settings_texts.header.subTitle}
              </Text>
            </View>
          </View>

          {isLoading || saving ? (
            <ActivityIndicator size="large" color="#9f9f9fff" />
          ) : (
            <>
              {/* Profile Image Preview & Modal Trigger */}
              <Text style={styles.label}>Profile Image</Text>
              <TouchableOpacity onPress={openImageModal}>
                {previewImage ? (
                  <Image
                    source={{ uri: previewImage }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      marginBottom: 8,
                      alignSelf: 'center',
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      backgroundColor: '#eee',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 8,
                      alignSelf: 'center',
                    }}
                  >
                    <Text>No Image</Text>
                  </View>
                )}
                <TextInput
                  style={styles.input}
                  value={profileImage}
                  editable={false}
                  placeholder="Tap to change profile image"
                />
              </TouchableOpacity>

              {/* Display Name */}
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
              />

              {/* Username */}
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                autoCapitalize="none"
              />

              {/* Bio */}
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Bio"
                multiline
              />

              {/* Change Password */}
              <Text style={styles.label}>Change Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                secureTextEntry
              />
              <Button
                title="Change Password"
                onPress={handleChangePassword}
                style={{ marginBottom: 16 }}
              />

              <Button title="Save Changes" onPress={handleSave} />
              <Button
                title="Sign Out"
                onPress={signOut}
                style={{ marginTop: 24 }}
              />
              {error ? (
                <Text style={styles.error}>
                  {typeof error === 'string'
                    ? error
                    : error?.message || 'An error occurred.'}
                </Text>
              ) : null}
            </>
          )}
        </ScrollView>
        {/* Modal for profile image selection */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeImageModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
                Change Profile Image
              </Text>
              <TextInput
                placeholder="Paste image URL"
                value={imageUrlInput}
                onChangeText={setImageUrlInput}
                style={styles.input}
              />
              <Button title="Preview URL" onPress={handlePreviewUrl} />
              <Button title="Use Image URL" onPress={handleUseImageUrl} />
              <View style={{ height: 8 }} />
              <Button
                title="Choose from Library"
                onPress={() => handleAddImageFromDevice(false)}
              />
              <View style={{ height: 8 }} />
              <Button
                title="Take Photo"
                onPress={() => handleAddImageFromDevice(true)}
              />
              <View style={{ height: 8 }} />
              <Button title="Cancel" onPress={closeImageModal} />
              {previewImage ? (
                <Image
                  source={{ uri: previewImage }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    marginTop: 12,
                    alignSelf: 'center',
                  }}
                  resizeMode="cover"
                />
              ) : null}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  keyboardAvoidingViewStyle: {
    backgroundColor: '#F7F7F7',
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
  titleColumn: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 12,
    color: '#878787',
  },
  backRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'stretch',
  },
});
