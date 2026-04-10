// src/features/movie/screens/MovieListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../controllers/MovieController';
import { MOCK_MOVIES } from '../../../core/mockData';

export default function MovieListScreen() {
  const navigation = useNavigation();
  const [movies,  setMovies]  = useState(MOCK_MOVIES);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    MovieController.getMovies()
      .then((m) => { if (m?.length) setMovies(m); })
      .catch(() => {});
  }, []);

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    (m.genre || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header title="Phim đang chiếu 🎞️" subtitle={`${movies.length} phim`} />

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên hoặc thể loại..."
          placeholderTextColor={COLORS.text.light}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>Không tìm thấy phim nào 🥺</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
            activeOpacity={0.88}
          >
            <Image source={{ uri: item.posterUrl }} style={styles.poster} resizeMode="cover" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ {item.rating}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <View style={[styles.genreBadge, { backgroundColor: MovieController.genreColor(item.genre) }]}>
                <Text style={styles.genreText}>{item.genre}</Text>
              </View>
              <Text style={styles.meta}>{item.duration} phút</Text>
              <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
              <View style={styles.footer}>
                <Text style={styles.price}>{MovieController.formatPrice(item.basePrice)}</Text>
                <View style={styles.detailBtn}>
                  <Text style={styles.detailText}>Chi tiết →</Text>
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

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, backgroundColor: COLORS.surface,
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1, height: 44, color: COLORS.text.primary,
    fontWeight: '600', fontSize: FONTS.sizes.sm,
  },

  list: { paddingHorizontal: 16, paddingBottom: 120 },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: 18, marginBottom: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  poster: { width: 105, height: 155 },
  badge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  badgeText: { color: '#FFD700', fontWeight: '900', fontSize: 11 },

  info:  { flex: 1, padding: 12, justifyContent: 'space-between' },
  title: { fontWeight: '900', color: COLORS.text.primary, fontSize: FONTS.sizes.md, marginBottom: 6 },
  genreBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  genreText:  { color: '#fff', fontSize: 10, fontWeight: '700' },
  meta:    { color: COLORS.text.secondary, fontWeight: '600', fontSize: FONTS.sizes.xs },
  desc:    { color: COLORS.text.secondary, fontSize: FONTS.sizes.xs, lineHeight: 17, fontWeight: '500', marginTop: 4 },
  footer:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price:   { color: COLORS.primary, fontWeight: '900', fontSize: FONTS.sizes.sm },
  detailBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  detailText: { color: COLORS.surface, fontWeight: '800', fontSize: 11 },
  empty: { textAlign: 'center', color: COLORS.text.secondary, fontWeight: '600', paddingVertical: 40 },
});
