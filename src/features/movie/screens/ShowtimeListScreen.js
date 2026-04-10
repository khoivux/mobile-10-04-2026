// src/features/movie/screens/ShowtimeListScreen.js
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
import { MOCK_SHOWTIMES } from '../../../core/mockData';

export default function ShowtimeListScreen() {
  const navigation = useNavigation();
  const [showtimes, setShowtimes] = useState(MOCK_SHOWTIMES);

  useEffect(() => {
    MovieController.getShowtimes()
      .then((s) => { if (s?.length) setShowtimes(s); })
      .catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Lịch chiếu 📅" subtitle={`${showtimes.length} suất chiếu`} />
      <FlatList
        data={showtimes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có suất chiếu nào 🥺</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SeatBooking', { showtimeId: item.id })}
            activeOpacity={0.88}
          >
            <Image source={{ uri: item.posterUrl }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.body}>
              <View style={styles.topRow}>
                <Text style={styles.movieTitle} numberOfLines={1}>{item.movieTitle}</Text>
                <View style={[
                  styles.formatBadge,
                  item.format === 'IMAX' && styles.badgeIMAX,
                  item.format === '4DX'  && styles.badge4DX,
                ]}>
                  <Text style={styles.formatText}>{item.format}</Text>
                </View>
              </View>
              <Text style={styles.theater}>🏛️ {item.theaterName}</Text>
              <Text style={styles.time}>🕒 {MovieController.formatTime(item.startTime)}</Text>
              <Text style={styles.room}>🪑 {item.room} • {item.language}</Text>

              <View style={styles.bottomRow}>
                <Text style={[
                  styles.seats,
                  item.availableSeats < 15 && { color: '#E53935' },
                ]}>
                  {item.availableSeats > 0
                    ? `${item.availableSeats}/${item.totalSeats} ghế trống`
                    : '❌ Hết vé'}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{MovieController.formatPrice(item.basePrice)}</Text>
                  <TouchableOpacity
                    style={[styles.bookBtn, item.availableSeats === 0 && styles.bookBtnDis]}
                    disabled={item.availableSeats === 0}
                    onPress={() => navigation.navigate('SeatBooking', { showtimeId: item.id })}
                  >
                    <Text style={styles.bookText}>
                      {item.availableSeats === 0 ? 'Hết vé' : 'Đặt vé 💕'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 120 },
  empty: { textAlign: 'center', color: COLORS.text.secondary, fontWeight: '600', paddingVertical: 40 },

  card: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: 18, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  thumb: { width: 90, height: 130 },
  body:  { flex: 1, padding: 12 },

  topRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  movieTitle: { fontWeight: '900', color: COLORS.text.primary, fontSize: FONTS.sizes.sm, flex: 1, marginRight: 8 },
  formatBadge:{ backgroundColor: COLORS.secondary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeIMAX:  { backgroundColor: '#1565C0' },
  badge4DX:   { backgroundColor: '#6A1B9A' },
  formatText: { color: '#fff', fontSize: 9, fontWeight: '900' },

  theater: { color: COLORS.text.secondary, fontWeight: '600', fontSize: 11, marginBottom: 2 },
  time:    { color: COLORS.text.primary,   fontWeight: '800', fontSize: 11, marginBottom: 2 },
  room:    { color: COLORS.text.secondary, fontWeight: '600', fontSize: 11, marginBottom: 8 },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  seats:     { color: '#2E7D32', fontWeight: '700', fontSize: 11 },
  priceRow:  { alignItems: 'flex-end', gap: 5 },
  price:     { color: COLORS.primary, fontWeight: '900', fontSize: FONTS.sizes.md },
  bookBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  bookBtnDis: { backgroundColor: COLORS.text.light },
  bookText:   { color: COLORS.surface, fontWeight: '900', fontSize: 11 },
});
