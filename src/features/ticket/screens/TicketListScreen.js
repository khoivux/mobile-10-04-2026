import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import TicketController from '../controllers/TicketController';
import { useApp } from '../../../context/AppContext';
import MovieController from '../../movie/controllers/MovieController';
import { MOCK_TICKETS } from '../../../core/mockData';

export default function TicketListScreen() {
  const navigation = useNavigation();
  const { state } = useApp();
  const { user, isLoggedIn } = state;
  const [tickets, setTickets] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn && user) {
        TicketController.getMyTickets(user.uid || user.id).then(setTickets);
      } else {
        setTickets([]);
      }
    }, [isLoggedIn, user])
  );

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Header title="Vé của tôi 🎟️" subtitle="Đăng nhập để xem vé đã đặt" />

        {/* Preview mock tickets khi chưa login */}
        <View style={styles.loginBanner}>
          <Text style={styles.bannerIcon}>🔐</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Đăng nhập để xem vé thật</Text>
            <Text style={styles.bannerSub}>Vé bên dưới là demo</Text>
          </View>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={MOCK_TICKETS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <TicketCard item={item} navigation={navigation} demo />}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Vé của tôi 🎟️" subtitle={`${tickets.length} vé đã đặt`} />
      <FlatList
        data={tickets}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🎭</Text>
            <Text style={styles.empty}>Chưa có vé nào — đi đặt phim thôi nào 🌸</Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('Main', { screen: 'Movies' })}
            >
              <Text style={styles.exploreBtnText}>Xem phim ngay →</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <TicketCard item={item} navigation={navigation} />}
      />
    </View>
  );
}

function TicketCard({ item, navigation, demo }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => !demo && navigation.navigate('TicketDetail', { ticketId: item.id })}
      activeOpacity={demo ? 1 : 0.8}
    >
      {item.posterUrl && (
        <Image source={{ uri: item.posterUrl }} style={styles.poster} resizeMode="cover" />
      )}
      <View style={styles.cardBody}>
        {demo && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoText}>DEMO</Text>
          </View>
        )}
        <Text style={styles.movie} numberOfLines={1}>{item.movieTitle}</Text>
        <Text style={styles.meta}>🏛️ {item.theaterName}</Text>
        <Text style={styles.meta}>🕒 {MovieController.formatTime(item.startTime)}</Text>
        <Text style={styles.meta}>🪑 Ghế: {item.seatCodes}</Text>
        <Text style={styles.meta}>💳 {item.paymentMethod}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{MovieController.formatPrice(item.totalPrice)}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓ Đã đặt</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, paddingBottom: 120 },

  loginBanner: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, backgroundColor: COLORS.secondary,
    borderRadius: 14, padding: 12, gap: 10,
  },
  bannerIcon:  { fontSize: 28 },
  bannerText:  { flex: 1 },
  bannerTitle: { fontWeight: '900', color: COLORS.text.primary, fontSize: FONTS.sizes.sm },
  bannerSub:   { color: COLORS.text.secondary, fontSize: FONTS.sizes.xs, marginTop: 2 },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  loginText: { color: COLORS.surface, fontWeight: '900', fontSize: 12 },

  card: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: 18, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  poster:   { width: 90, height: 130 },
  cardBody: { flex: 1, padding: 12 },
  demoBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.warning,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6,
  },
  demoText: { color: COLORS.text.primary, fontWeight: '900', fontSize: 10 },
  movie:    { fontWeight: '900', color: COLORS.text.primary, fontSize: FONTS.sizes.md, marginBottom: 5 },
  meta:     { color: COLORS.text.secondary, fontWeight: '600', fontSize: 11, marginBottom: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price:    { color: COLORS.primary, fontWeight: '900', fontSize: FONTS.sizes.md },
  statusBadge: {
    backgroundColor: '#E8F5E9', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: { color: '#2E7D32', fontWeight: '800', fontSize: 11 },

  emptyWrap:   { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:   { fontSize: 60, marginBottom: 12 },
  empty:       { textAlign: 'center', color: COLORS.text.secondary, fontWeight: '600', marginBottom: 16 },
  exploreBtn:  { backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 },
  exploreBtnText: { color: COLORS.surface, fontWeight: '900' },
});
