import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import TicketController from '../controllers/TicketController';
import MovieController from '../../movie/controllers/MovieController';

function formatPaymentLabel(p) {
  if (!p) return 'Ví điện tử';
  if (p === 'E-Wallet') return 'Ví điện tử';
  return p;
}

export default function TicketDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { ticketId, justBooked } = route.params || {};
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (ticketId) TicketController.getTicketDetail(ticketId).then(setTicket);
  }, [ticketId]);

  if (!ticket) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Header title={`Vé #${String(ticket.id).slice(0, 8)}`} showBack={true} />
      <ScrollView contentContainerStyle={styles.content}>
        {justBooked ? <Text style={styles.success}>Đặt vé thành công — hẹn bạn ở rạp nha! 🎉</Text> : null}
        <View style={styles.card}>
          <Image source={{ uri: ticket.posterUrl }} style={styles.poster} />
          <Text style={styles.title}>{ticket.movieTitle}</Text>
          <Text style={styles.meta}>{ticket.theaterName}</Text>
          <Text style={styles.meta}>{ticket.address}</Text>
          <Text style={styles.meta}>
            {MovieController.formatTime(ticket.startTime)} • Phòng {ticket.room}
          </Text>
          <Text style={styles.meta}>Người đặt: {ticket.fullName}</Text>
          <Text style={styles.seats}>Ghế: {ticket.seatCodes}</Text>
          <Text style={styles.meta}>Thanh toán: {formatPaymentLabel(ticket.paymentMethod)}</Text>
          {Number(ticket.discountAmount || 0) > 0 ? (
            <>
              <Text style={styles.meta}>Tạm tính: {MovieController.formatPrice(ticket.originalPrice || ticket.totalPrice)}</Text>
              <Text style={styles.discount}>
                Khuyến mãi ({ticket.promoCode}): −{MovieController.formatPrice(ticket.discountAmount)}
              </Text>
            </>
          ) : null}
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.total}>{MovieController.formatPrice(ticket.totalPrice)}</Text>
          <Text style={styles.status}>Trạng thái: {ticket.status === 'booked' ? 'Đã đặt ✓' : ticket.status}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Main', { screen: 'Showtimes' })}>
          <Text style={styles.btnText}>Đặt thêm vé nữa nè 💖</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 60 },
  success: { textAlign: 'center', color: COLORS.primary, fontWeight: '900', marginBottom: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 14,
  },
  poster: { width: '100%', height: 220, borderRadius: 16, backgroundColor: COLORS.background, marginBottom: 12 },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.text.primary },
  meta: { marginTop: 6, color: COLORS.text.secondary, fontWeight: '600' },
  seats: { marginTop: 8, color: COLORS.text.primary, fontWeight: '900' },
  discount: { marginTop: 6, color: '#2E7D32', fontWeight: '900' },
  totalLabel: { marginTop: 10, color: COLORS.text.secondary, fontWeight: '800' },
  total: { fontSize: FONTS.sizes.xl, color: COLORS.primary, fontWeight: '900' },
  status: { marginTop: 8, color: COLORS.text.primary, fontWeight: '800' },
  btn: { marginTop: 15, backgroundColor: COLORS.primary, borderRadius: 14, alignItems: 'center', paddingVertical: 12 },
  btnText: { color: COLORS.surface, fontWeight: '900' },
});
