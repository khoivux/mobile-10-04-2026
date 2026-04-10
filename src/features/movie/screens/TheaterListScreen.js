// src/features/movie/screens/TheaterListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../controllers/MovieController';
import { MOCK_THEATERS } from '../../../core/mockData';

export default function TheaterListScreen() {
  const navigation = useNavigation();
  const [theaters, setTheaters] = useState(MOCK_THEATERS);

  useEffect(() => {
    MovieController.getTheaters()
      .then((t) => { if (t?.length) setTheaters(t); })
      .catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Hệ thống rạp 🏛️" subtitle={`${theaters.length} rạp chiếu phim`} />
      <FlatList
        data={theaters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có rạp nào 🥺</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
            <View style={styles.overlay}>
              <Text style={styles.cityBadge}>{item.city}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>📍 {item.address}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('Main', { screen: 'Showtimes' })}
                >
                  <Text style={styles.actionText}>🎬 Xem lịch chiếu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecond]}>
                  <Text style={[styles.actionText, { color: COLORS.text.primary }]}>📍 Chỉ đường</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  list:  { padding: 16, paddingBottom: 120 },
  empty: { textAlign: 'center', color: COLORS.text.secondary, fontWeight: '600', paddingVertical: 40 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 5,
  },
  image:   { width: '100%', height: 180 },
  overlay: {
    position: 'absolute', top: 12, left: 12,
  },
  cityBadge: {
    backgroundColor: COLORS.primary, color: COLORS.surface,
    fontWeight: '900', fontSize: 12,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, overflow: 'hidden',
  },
  info:    { padding: 14 },
  name:    { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.text.primary, marginBottom: 5 },
  address: { color: COLORS.text.secondary, fontWeight: '600', fontSize: FONTS.sizes.sm, marginBottom: 12 },

  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, backgroundColor: COLORS.primary,
    borderRadius: 12, paddingVertical: 9, alignItems: 'center',
  },
  actionBtnSecond: { backgroundColor: COLORS.secondary },
  actionText: { color: COLORS.surface, fontWeight: '800', fontSize: FONTS.sizes.sm },
});
