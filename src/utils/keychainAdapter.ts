import * as Keychain from 'react-native-keychain';

export const keychainAdapter = {
  getItem: async (key: string) => {
    const credentials = await Keychain.getGenericPassword({ service: key });
    return credentials ? credentials.password : null;
  },
  setItem: async (key: string, value: string) => {
    await Keychain.setGenericPassword(key, value, { service: key });
  },
  removeItem: async (key: string) => {
    await Keychain.resetGenericPassword({ service: key });
  },
};