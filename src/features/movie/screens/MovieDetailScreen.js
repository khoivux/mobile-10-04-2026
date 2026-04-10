// src/features/movie/screens/MovieDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../controllers/MovieController';
import { MOCK_MOVIES, MOCK_SHOWTIMES } from '../../../core/mockData';

export default function MovieDetailScreen() {
  const navigation = useNavigation();
  const route      = useRoute();
  const { movieId } = route.params;

  // Tìm mock data ngay lập tức
  const mockMovie     = MOCK_MOVIES.find((m) => m.id === movieId) || MOCK_MOVIES[0];
  const mockShowtimes = MOCK_SHOWTIMES.filter((s) => s.movieId === movieId);

  const [movie,     setMovie]     = useState(mockMovie);
  const [showtimes, setShowtimes] = useState(mockShowtimes);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      MovieController.getMovieById(movieId),
      MovieController.getShowtimesByMovie(movieId),
    ]).then(([m, s]) => {
      if (m)        setMovie(m);
      if (s?.length) setShowtimes(s);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, [movieId]);

  return (
    <View style={styles.container}>
      <Header title="Chi tiết phim" showBack={true} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero poster */}
        <View style={styles.posterWrap}>
          <Image source={{ uri: movie.posterUrl }} style={styles.poster} resizeMode="cover" />
          <View style={styles.posterOverlay}>
            <View style={[styles.genreBadge, { backgroundColor: MovieController.genreColor(movie.genre) }]}>
              <Text style={styles.genreText}>{movie.genre}</Text>
            </View>
            <Text style={styles.ratingBig}>⭐ {movie.rating}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{movie.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>⏱ {movie.duration} phút</Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>⭐ {movie.rating}/10</Text>
            </View>
            {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>

          <Text style={styles.desc}>{movie.description}</Text>

          <View style={styles.priceBox}>
            <View>
              <Text style={styles.priceLabel}>Giá vé từ</Text>
              <Text style={styles.priceValue}>{MovieController.formatPrice(movie.basePrice)}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookAllBtn}
              onPress={() => navigation.navigate('Main', { screen: 'Showtimes' })}
            >
              <Text style={styles.bookAllText}>Xem tất cả suất →</Text>
            </TouchableOpacity>
          </View>

          {/* Danh sách suất chiếu */}
          <Text style={styles.sectionTitle}>🕒 Suất chiếu</Text>
          {showtimes.length === 0 ? (
            <Text style={styles.noShowtime}>Chưa có suất chiếu cho phim này.</Text>
          ) : (
            showtimes.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.showtimeCard}
                onPress={() => navigation.navigate('SeatBooking', { showtimeId: s.id })}
              >
                <View style={styles.showtimeInfo}>
                  <Text style={styles.showtimeTheater}>{s.theaterName}</Text>
                  <Text style={styles.showtimeTime}>{MovieController.formatTime(s.startTime)}</Text>
                  <Text style={styles.showtimeMeta}>
                    {s.room} • <Text style={{ color: MovieController.genreColor('Sci-Fi') }}>{s.format}</Text> • {s.language}
                  </Text>
                  <Text style={[styles.showtimeSeats, s.availableSeats < 15 && { color: '#E53935' }]}>
                    {s.availableSeats}/{s.totalSeats} ghế trống
                  </Text>
                </View>
                <View style={styles.showtimeAction}>
                  <Text style={styles.showtimePrice}>{MovieController.formatPrice(s.basePrice)}</Text>
                  <View style={styles.bookBtn}>
                    <Text style={styles.bookText}>Đặt vé</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll:    { paddingBottom: 120 },

  posterWrap: { position: 'relative' },
  poster:    { width: '100%', height: 400 },
  posterOverlay: {
    position: 'absolute', bottom: 20, left: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  genreBadge: { borderRadius: 8, paddingHorizontal: 15, paddingVertical: 6 },
  genreText:  { color: '#fff', fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  ratingBig:  {
    backgroundColor: 'rgba(0,0,0,0.75)',
    color: COLORS.primary, fontWeight: '900', fontSize: 16,
    paddingHorizontal: 15, paddingVertical: 6, borderRadius: 8,
  },

  body:  { padding: 20 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.text.primary, marginBottom: 15 },

  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 20, alignItems: 'center' },
  metaChip: {
    backgroundColor: '#1E1E26', borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 8,
    borderWidth: 1, borderColor: '#2D3748',
  },
  metaChipText: { fontWeight: '800', color: COLORS.text.secondary, fontSize: 13 },

  desc: { color: COLORS.text.secondary, lineHeight: 24, fontWeight: '500', marginBottom: 25, fontSize: 15 },

  priceBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 24, padding: 20, marginBottom: 25,
    borderWidth: 1, borderColor: '#2D3748',
  },
  priceLabel: { fontWeight: '700', color: COLORS.text.secondary, fontSize: 14 },
  priceValue: { fontSize: 24, fontWeight: '900', color: COLORS.primary, marginTop: 4 },
  bookAllBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  bookAllText: { color: '#000', fontWeight: '900', fontSize: 14 },

  sectionTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text.primary, marginBottom: 15 },
  noShowtime:   { color: COLORS.text.secondary, fontWeight: '600', textAlign: 'center', paddingVertical: 20 },

  showtimeCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: 20,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#2D3748',
  },
  showtimeInfo:    { flex: 1 },
  showtimeTheater: { fontWeight: '900', color: COLORS.text.primary, fontSize: 16 },
  showtimeTime:    { color: COLORS.primary, fontWeight: '800', marginTop: 6, fontSize: 16 },
  showtimeMeta:    { color: COLORS.text.secondary, fontWeight: '600', marginTop: 5, fontSize: 12 },
  showtimeSeats:   { color: COLORS.success, fontWeight: '700', marginTop: 6, fontSize: 12 },
  showtimeAction:  { alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 10 },
  showtimePrice:   { color: COLORS.text.primary, fontWeight: '900', fontSize: 18 },
  bookBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 15, paddingVertical: 10, marginTop: 10,
  },
  bookText: { color: '#000', fontWeight: '900', fontSize: 13 },
});
