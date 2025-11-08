import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useEffect } from "react";
import { useDiscoverStore } from "@/modules/discover/store/useDiscoverStore";
import { discover_texts } from "@/constants/constants";

export default function DiscoverHeader({navigation} : any) {
  const { user, loading, fetchProfile } = useDiscoverStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";
  };

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingViewStyle}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.titleColumn}>
            <Text style={styles.headerText}>
              {discover_texts.header.screenName}
            </Text>
            <Text style={styles.subTitleText}>
              {discover_texts.header.subTitle}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#9f9f9fff" />
          ) : user ? (
            user.profile_image ? (
              <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <Image
                source={{ uri: user.profile_image }}
                style={styles.avatar}
              />
              </TouchableOpacity>
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>
                  {getInitials(user.display_name || user.display_name || "U")}
                </Text>
              </View>
            )
          ) : null}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingViewStyle: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleColumn: {
    flexDirection: "column",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subTitleText: {
    fontSize: 12,
    color: "#878787",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  initialsAvatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#E16235",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
