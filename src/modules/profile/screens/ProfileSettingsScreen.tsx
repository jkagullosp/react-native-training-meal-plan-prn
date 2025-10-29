import React, { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useProfileStore } from "../store/useProfileStore";
import Button from "../../../shared/components/Button";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { profile_settings_texts } from "../../../constants/constants";
import { MoveLeft } from "lucide-react-native";

export default function ProfileSettingsScreen({ navigation }: any) {
  const signOut = useAuthStore((state) => state.signOut);
  const authUser = useAuthStore((state) => state.user);

  const {
    user,
    loading,
    error,
    fetchProfile,
    updateProfileImage,
    updateDisplayName,
    updateUsername,
    updateBio,
    changePassword,
  } = useProfileStore();

  const [profileImage, setProfileImage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      fetchProfile(authUser.id);
    }
  }, [authUser, fetchProfile]);

  useEffect(() => {
    if (user) {
      setProfileImage(user.profile_image || "");
      setDisplayName(user.display_name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!authUser?.id) return;
    setSaving(true);

    let success = true;
    if (profileImage !== user?.profile_image) {
      success =
        (await updateProfileImage(authUser.id, profileImage)) && success;
    }
    if (displayName !== user?.display_name) {
      success = (await updateDisplayName(authUser.id, displayName)) && success;
    }
    if (username !== user?.username) {
      success = (await updateUsername(authUser.id, username)) && success;
    }
    if (bio !== user?.bio) {
      success = (await updateBio(authUser.id, bio)) && success;
    }
    setSaving(false);

    Toast.show({
      type: success ? "success" : "error",
      text1: success ? "Profile updated!" : "Update failed",
    });
  };

  const handleChangePassword = async () => {
    if (!authUser?.email || !newPassword) return;
    setSaving(true);
    const success = await changePassword(authUser.email, newPassword);
    setSaving(false);
    Toast.show({
      type: success ? "success" : "error",
      text1: success ? "Password changed!" : "Password change failed",
    });
    if (success) setNewPassword("");
  };

  return (
    <SafeAreaView style={styles.safeAreaView} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboardAvoidingViewStyle}>
        <ScrollView style={styles.container}>
          <View>
            <View style={styles.backRow}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                onPress={() => navigation.goBack()}
              >
                {Platform.OS === "ios" ? (
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

          {loading || saving ? (
            <ActivityIndicator size="large" color="#9f9f9fff" />
          ) : (
            <>
              {/* Profile Image */}
              <Text style={styles.label}>Profile Image URL</Text>
              <TextInput
                style={styles.input}
                value={profileImage}
                onChangeText={setProfileImage}
                placeholder="Paste image URL or use camera/photo library"
              />

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
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  keyboardAvoidingViewStyle: {
    backgroundColor: "#F7F7F7",
  },
  container: {
    flexDirection: "column",
    gap: 12,
    backgroundColor: "#F7F7F7",
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },
  error: {
    color: "red",
    marginTop: 8,
    textAlign: "center",
  },
  titleColumn: {
    flexDirection: "column",
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 12,
    color: "#878787",
  },
  backRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
});
