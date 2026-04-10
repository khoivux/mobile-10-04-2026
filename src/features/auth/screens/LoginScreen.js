// ============================================================
//  src/features/auth/screens/LoginScreen.js
//  Firebase Auth — Đăng nhập / Đăng ký bằng Email + Password
// ============================================================
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import AuthController from '../controllers/AuthController';
import { loginAction, useApp } from '../../../context/AppContext';
import { registerForPushNotifications } from '../../../core/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@movie/session_user';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { dispatch } = useApp();

  const [mode, setMode]           = useState('login'); // 'login' | 'register'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [fullName, setFullName]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Nhập đầy đủ email và mật khẩu nha 💕');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      Alert.alert('Thiếu tên', 'Nhập họ tên của bạn nha!');
      return;
    }

    setLoading(true);
    const res = mode === 'login'
      ? await AuthController.login(email, password)
      : await AuthController.register(email, password, fullName);
    setLoading(false);

    if (!res.success) {
      Alert.alert('Ôi không!', res.message);
      return;
    }

    // Lưu session + dispatch vào Context
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
    dispatch(loginAction(res.user));

    // Đăng ký push notification
    await registerForPushNotifications(res.user.uid);

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>🌸</Text>
            <Text style={styles.backText}>Trở lại</Text>
          </TouchableOpacity>
        </View>

        {/* Logo / Title */}
        <View style={styles.hero}>
          <Text style={styles.emoji}>🎬</Text>
          <Text style={styles.appName}>MovieApp</Text>
          <Text style={styles.tagline}>Đặt vé xem phim — nhanh, gọn, xinh!</Text>
        </View>

        {/* Tab toggle */}
        <View style={styles.tabRow}>
          {['login', 'register'].map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.tab, mode === m && styles.tabActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.card}>
          {mode === 'register' && (
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Nguyễn Thị A"
                placeholderTextColor={COLORS.text.light}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.text.light}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={mode === 'register' ? 'Ít nhất 6 ký tự' : 'Nhập mật khẩu'}
                placeholderTextColor={COLORS.text.light}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPass((v) => !v)}
              >
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.surface} />
              : <Text style={styles.submitText}>
                  {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                </Text>}
          </TouchableOpacity>

         
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  scroll:  { padding: 25, paddingBottom: 60 },
  topBar:  { marginBottom: 10, marginTop: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backIcon:{ fontSize: 18, color: COLORS.primary, marginRight: 8 },
  backText:{ fontSize: 16, fontWeight: '700', color: COLORS.text.primary },

  hero: { alignItems: 'center', marginVertical: 40 },
  emoji:   { fontSize: 64, marginBottom: 10 },
  appName: { fontSize: 36, fontWeight: '900', color: COLORS.primary, marginTop: 10 },
  tagline: { fontSize: 14, color: COLORS.text.secondary, marginTop: 8, fontWeight: '500' },

  tabRow: { flexDirection: 'row', backgroundColor: '#1E1E26', borderRadius: 16, padding: 5, marginBottom: 25, borderWidth: 1, borderColor: '#2D3748' },
  tab:    { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText:   { fontWeight: '800', color: COLORS.text.secondary, fontSize: 14 },
  tabTextActive: { color: '#000' },

  card: { backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: '#2D3748', padding: 20 },

  fieldWrap: { marginBottom: 18 },
  label: { fontWeight: '800', color: COLORS.text.primary, marginBottom: 8, fontSize: 14 },
  input: {
    height: 54, borderRadius: 14, borderWidth: 1.5, borderColor: '#2D3748',
    backgroundColor: '#0F1014', paddingHorizontal: 16,
    color: '#fff', fontWeight: '600', fontSize: 16,
  },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn:  { paddingHorizontal: 15, height: 54, justifyContent: 'center', position: 'absolute', right: 0 },
  eyeIcon: { fontSize: 20 },

  submitBtn: {
    marginTop: 10, backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  submitText: { color: '#000', fontWeight: '900', fontSize: 16 },

  infoBox: {
    marginTop: 25, backgroundColor: '#1E1E26', borderRadius: 14,
    borderWidth: 1, borderColor: '#2D3748', padding: 15,
  },
  infoTitle: { fontWeight: '900', color: COLORS.primary, marginBottom: 6, fontSize: 14 },
  infoText:  { color: COLORS.text.secondary, fontSize: 12, lineHeight: 20, fontWeight: '500' },
});
