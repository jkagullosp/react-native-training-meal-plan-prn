import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreenHeader from '../components/ProfileScreenHeader';
import ProfileTabs from '@/navigation/tabs/ProfileTabs';

export default function ProfileMainScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeAreaView} edges={['top']}>
      <ProfileScreenHeader navigation={navigation} />
      <View style={{ flex: 1 }}>
        <ProfileTabs />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#F7F7F7',
    flex: 1,
  },
  container: {
    padding: 16,
    flexDirection: 'column',
    gap: 16,
  },
});
