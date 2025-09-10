// config.ts
// export const API_URL = "http://192.168.47.32:11061";
// config.ts


import AsyncStorage from '@react-native-async-storage/async-storage';
export const API_URL = "http://softeng.pmf.kg.ac.rs:11061";
export const apiCall = async (url: string, options: RequestInit = {}) => {
  const lang = await AsyncStorage.getItem('lang') || 'sr'; // default sr
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Accept-Language': lang,
    },
  });
};
