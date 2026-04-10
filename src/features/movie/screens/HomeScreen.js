// src/features/movie/screens/HomeScreen.js
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import { useApp } from '../../../context/AppContext';
import { MOCK_MOVIES, MOCK_SHOWTIMES } from '../../../core/mockData';
import MovieController from '../controllers/MovieController';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { state } = useApp();
  const { isLoggedIn, user } = state;

  // Khởi tạo ngay với mock data → màn hình đẹp tức thì
  const [movies, setMovies] = useState(MOCK_MOVIES);
  const [showtimes, setShowtimes] = useState(MOCK_SHOWTIMES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load từ Firebase ở background — nếu thành công thì cập nhật
    setLoading(true);
    Promise.all([MovieController.getMovies(), MovieController.getShowtimes()])
      .then(([m, s]) => {
        if (m?.length) setMovies(m);
        if (s?.length) setShowtimes(s);
      })
      .catch(() => { /* Giữ mock data nếu Firebase lỗi */ })
      .finally(() => setLoading(false));
  }, []);

  const upcomingShowtimes = showtimes.slice(0, 3);

  return (
    <View style={styles.container}>
      <Header
        title={isLoggedIn ? `Xin chào ${user?.fullName?.split(' ').pop()} 🌸` : 'MovieApp 🎬'}
        subtitle="Đặt vé xem phim dễ dàng"
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>



        {/* Phim nổi bật */}
        <Text style={styles.sectionTitle}>🎬 Phim đang chiếu</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {movies.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.movieCard}
              onPress={() => navigation.navigate('MovieDetail', { movieId: m.id })}
            >
              <Image source={{ uri: m.posterUrl }} style={styles.poster} resizeMode="cover" />
              <View style={styles.movieOverlay}>
                <Text style={styles.movieRating}>⭐ {m.rating}</Text>
              </View>
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={1}>{m.title}</Text>
                <View style={[styles.genreBadge, { backgroundColor: MovieController.genreColor(m.genre) }]}>
                  <Text style={styles.genreText}>{m.genre}</Text>
                </View>
                <Text style={styles.duration}>{m.duration} phút</Text>
                <Text style={styles.price}>{MovieController.formatPrice(m.basePrice)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Suất chiếu sắp tới */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>🕒 Suất chiếu sắp tới</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Showtimes' })}>
            <Text style={styles.seeAll}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>

        {upcomingShowtimes.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.showtimeCard}
            onPress={() => navigation.navigate('SeatBooking', { showtimeId: s.id })}
          >
            <Image source={{ uri: s.posterUrl }} style={styles.showtimeThumb} resizeMode="cover" />
            <View style={styles.showtimeBody}>
              <Text style={styles.showtimeMovie} numberOfLines={1}>{s.movieTitle}</Text>
              <Text style={styles.showtimeMeta}>{s.theaterName}</Text>
              <Text style={styles.showtimeTime}>{MovieController.formatTime(s.startTime)}</Text>
              <View style={styles.showtimeTags}>
                <View style={[styles.formatTag, s.format === 'IMAX' && styles.tagIMAX, s.format === '4DX' && styles.tag4DX]}>
                  <Text style={styles.formatTagText}>{s.format}</Text>
                </View>
                <Text style={styles.showtimeSeats}>🪑 {s.availableSeats} ghế trống</Text>
              </View>
            </View>
            <View style={styles.showtimeRight}>
              <Text style={styles.showtimePrice}>{MovieController.formatPrice(s.basePrice)}</Text>
              <View style={styles.bookBtn}>
                <Text style={styles.bookText}>Đặt vé</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>⚡ Khám phá</Text>
        <View style={styles.quickRow}>
          {[
            { label: 'Tất cả phim', screen: 'Movies' },
            { label: 'Rạp chiếu', screen: 'Theaters' },
            { label: 'Lịch chiếu', screen: 'Showtimes' },
            { label: 'Vé của tôi', screen: 'Tickets' },
          ].map((q) => (
            <TouchableOpacity
              key={q.screen}
              style={styles.quickCard}
              onPress={() => navigation.navigate('Main', { screen: q.screen })}
            >
              <Text style={styles.quickIcon}>{q.icon}</Text>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 120 },

  firebaseBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E26', borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: '#2D3748', marginBottom: 20,
  },
  firebaseIcon: { fontSize: 16, marginRight: 8 },
  firebaseText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.xs, flex: 1 },

  sectionTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text.primary, marginBottom: 15, marginTop: 10 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  seeAll: { color: COLORS.primary, fontWeight: '800', fontSize: FONTS.sizes.sm },

  hList: { paddingBottom: 10 },
  movieCard: {
    width: 160, marginRight: 15, backgroundColor: COLORS.card,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2D3748',
  },
  poster: { width: '100%', height: 240 },
  movieOverlay: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  movieRating: { color: COLORS.primary, fontWeight: '900', fontSize: 12 },
  movieInfo: { padding: 12 },
  movieTitle: { fontWeight: '800', color: COLORS.text.primary, fontSize: 15, marginBottom: 6 },
  genreBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 6 },
  genreText: { color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  duration: { color: COLORS.text.secondary, fontSize: 12, fontWeight: '600' },
  price: { color: COLORS.primary, fontWeight: '900', marginTop: 6, fontSize: 16 },

  showtimeCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    marginBottom: 12, flexDirection: 'row', overflow: 'hidden',
    borderWidth: 1, borderColor: '#2D3748',
  },
  showtimeThumb: { width: 90, height: 120 },
  showtimeBody: { flex: 1, padding: 12, justifyContent: 'center' },
  showtimeRight: { padding: 12, alignItems: 'flex-end', justifyContent: 'space-between' },
  showtimeMovie: { fontWeight: '900', color: COLORS.text.primary, fontSize: 16 },
  showtimeMeta: { color: COLORS.text.secondary, fontWeight: '600', marginTop: 4, fontSize: 12 },
  showtimeTime: { color: COLORS.primary, fontWeight: '800', marginTop: 6, fontSize: 14 },
  showtimeTags: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  formatTag: { backgroundColor: '#2D3748', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagIMAX: { backgroundColor: '#1E40AF' },
  tag4DX: { backgroundColor: '#701A75' },
  formatTagText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  showtimeSeats: { color: COLORS.success, fontSize: 11, fontWeight: '700' },
  showtimePrice: { color: COLORS.text.primary, fontWeight: '900', fontSize: 16 },
  bookBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 4,
  },
  bookText: { color: '#000', fontWeight: '900', fontSize: 12 },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  quickCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: 20,
    padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: '#2D3748',
  },
  quickIcon: { fontSize: 32, marginBottom: 10 },
  quickLabel: { fontWeight: '800', color: COLORS.text.primary, fontSize: 14, textAlign: 'center' },
});
