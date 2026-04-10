// ============================================================
//  src/core/firebase.js  —  Firebase App + Service Instances
//  Config từ google-services.json (project: mobile-9fbce)
//  Firebase JS SDK v12 + Expo React Native
// ============================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:            'AIzaSyAUrv29MQwk0mWqh_bFled42hUN8LOAcAU',
  authDomain:        'movie-app-f26bd.firebaseapp.com',
  databaseURL:       'https://movie-app-f26bd-default-rtdb.firebaseio.com',
  projectId:         'movie-app-f26bd',
  storageBucket:     'movie-app-f26bd.firebasestorage.app',
  messagingSenderId: '870538172605',
  appId:             '1:870538172605:android:45d09c3ae6f3b566a5ffd4',
};

// Khởi tạo app một lần duy nhất (an toàn với hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth với AsyncStorage persistence (giữ đăng nhập sau khi tắt app)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (_e) {
  // Đã initialize rồi (hot reload) → dùng lại
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;
