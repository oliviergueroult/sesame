import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://sesame-backend-production.up.railway.app';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('sesame_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('sesame_token', data.token);
  return data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('sesame_token');
  await AsyncStorage.removeItem('sesame_doors');
};

export const openDoor = (door) =>
  api.post('/open', { door }).then(r => r.data);

export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem('sesame_token');
  return !!token;
};
