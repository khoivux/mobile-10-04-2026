import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../../components/Header';
import { COLORS } from '../../../constants/colors';
import { FONTS } from '../../../constants/fonts';
import MovieController from '../../movie/controllers/MovieController';
import TicketController from '../controllers/TicketController';
import { useApp } from '../../../context/AppContext';

const ROWS = 'ABCDEFGH'.split('');
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Phương thức thanh toán — nhãn tiếng Việt, lưu đúng vào vé */
const PAYMENT_METHODS = [
  { label: 'Ví điện tử', hint: 'VNPAY / QR siêu nhanh', emoji: '💳' },
  { label: 'Thẻ ngân hàng', hint: 'Visa, Mastercard', emoji: '🏦' },
  { label: 'Momo', hint: 'Ví MoMo', emoji: '💜' },
  { label: 'ZaloPay', hint: 'Thanh toán ZaloPay', emoji: '💙' },
];

export default function SeatBookingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { state } = useApp();
  const { user, isLoggedIn } = state;
  const { showtimeId } = route.params;

  const [showtime, setShowtime] = useState(null);
  const [takenSeats, setTakenSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].label);

  useEffect(() => {
    MovieController.getShowtimeDetail(showtimeId).then(setShowtime);
    TicketController.getTakenSeats(showtimeId).then(setTakenSeats);
  }, [showtimeId]);

  const subtotal = useMemo(() => (showtime ? selected.length * showtime.basePrice : 0), [selected, showtime]);
  const promoPreview = useMemo(
    () => TicketController.calcDiscount({ subtotal, promoCode: appliedPromo || '' }),
    [subtotal, appliedPromo]
  );
  const total = Math.max(0, subtotal - (promoPreview.valid ? promoPreview.discount : 0));

  const toggleSeat = (seatCode) => {
    if (takenSeats.includes(seatCode)) return;
    setSelected((prev) => (prev.includes(seatCode) ? prev.filter((s) => s !== seatCode) : [...prev, seatCode]));
  };

  const runBooking = async () => {
    setSubmitting(true);
    const res = await TicketController.bookTicket({
      userId:       user.id,
      userFullName: user.fullName || '',
      showtimeId,
      seatCodes:    selected,
      seatPrice:    showtime.basePrice,
      promoCode:    appliedPromo || '',
      paymentMethod,
    });
    setSubmitting(false);
    if (!res.success) {
      Alert.alert('Ôi chà…', res.message);
      TicketController.getTakenSeats(showtimeId).then(setTakenSeats);
      return;
    }
    navigation.replace('TicketDetail', { ticketId: res.ticket.id, justBooked: true });
  };

  const handleBook = () => {
    if (!isLoggedIn) {
      Alert.alert('Chưa đăng nhập nè 🌸', 'Đăng nhập để giữ ghế và thanh toán nha!', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (selected.length === 0) {
      Alert.alert('Chọn ghế trước nha', 'Bấm vào ghế trống để chọn ít nhất một chỗ xinh xắn 💺');
      return;
    }
    Alert.alert(
      'Xác nhận thanh toán 💕',
      `Bạn sẽ thanh toán ${MovieController.formatPrice(total)} bằng ${paymentMethod}.\nGhế: ${selected.join(', ')}\nBấm "Đồng ý" để hoàn tất đặt vé!`,
      [
        { text: 'Suy lại chút', style: 'cancel' },
        { text: 'Đồng ý', onPress: () => runBooking() },
      ]
    );
  };

  if (!showtime) return <View style={styles.container} />;

  const promotionEntries = Object.entries(TicketController.getPromotions());

  const handleApplyPromo = () => {
    const preview = TicketController.calcDiscount({ subtotal, promoCode });
    if (!promoCode.trim()) {
      setAppliedPromo(null);
      return;
    }
    if (!preview.valid) {
      Alert.alert('Mã khuyến mãi', 'Mã không đúng hoặc chưa đủ điều kiện áp dụng nha 🥺');
      return;
    }
    setAppliedPromo(preview.code);
  };

  return (
    <View style={styles.container}>
      <Header title="Chọn ghế & thanh toán" showBack={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{showtime.movieTitle}</Text>
        <Text style={styles.meta}>
          {showtime.theaterName} • {showtime.room}
        </Text>
        <Text style={styles.meta}>{MovieController.formatTime(showtime.startTime)}</Text>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.background, borderColor: COLORS.border }]} />
            <Text style={styles.legendText}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.legendText}>Đã bán</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Bạn chọn</Text>
          </View>
        </View>

        <View style={styles.screen}>
          <Text style={styles.screenText}>MÀN HÌNH</Text>
        </View>

        <View style={styles.grid}>
          {ROWS.map((r) => (
            <View key={r} style={styles.row}>
              {COLS.map((c) => {
                const code = `${r}${c}`;
                const isTaken = takenSeats.includes(code);
                const isSelected = selected.includes(code);
                return (
                  <TouchableOpacity
                    key={code}
                    style={[styles.seat, isTaken && styles.takenSeat, isSelected && styles.selectedSeat]}
                    onPress={() => toggleSeat(code)}
                  >
                    <Text style={[styles.seatText, isSelected && { color: COLORS.surface }]}>{code}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>💺 Ghế đã chọn</Text>
          <Text style={styles.summaryText}>{selected.join(', ') || 'Chưa chọn ghế nào — bấm vào ô trống nha!'}</Text>
          <Text style={styles.priceLine}>Tạm tính: {MovieController.formatPrice(subtotal)}</Text>

          <Text style={styles.blockTitle}>🎁 Mã khuyến mãi</Text>
          <View style={styles.promoWrap}>
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Nhập mã (vd: CINE10)"
              placeholderTextColor={COLORS.text.light}
              style={styles.promoInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
              <Text style={styles.applyText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoChips}>
            {promotionEntries.map(([code, cfg]) => (
              <TouchableOpacity
                key={code}
                style={[styles.promoChip, appliedPromo === code && styles.promoChipActive]}
                onPress={() => {
                  setPromoCode(code);
                  setAppliedPromo(code);
                }}
              >
                <Text style={[styles.promoChipText, appliedPromo === code && styles.promoChipTextActive]}>{code}</Text>
                <Text style={[styles.promoHint, appliedPromo === code && styles.promoChipTextActive]}>{cfg.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.discountLine}>
            Giảm giá: −{MovieController.formatPrice(promoPreview.valid ? promoPreview.discount : 0)}
          </Text>
          <Text style={styles.total}>Tổng thanh toán: {MovieController.formatPrice(total)}</Text>

          <Text style={styles.blockTitle}>💳 Thanh toán — chọn cách bạn thích</Text>
          <Text style={styles.paymentHint}>Chọn một phương thức (demo trong app — không trừ tiền thật nha 🌸)</Text>
          <View style={styles.methodWrap}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.label}
                style={[styles.methodCard, paymentMethod === m.label && styles.methodCardActive]}
                onPress={() => setPaymentMethod(m.label)}
              >
                <Text style={styles.methodEmoji}>{m.emoji}</Text>
                <Text style={[styles.methodLabel, paymentMethod === m.label && styles.methodLabelActive]}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.hint}</Text>
                {paymentMethod === m.label ? <Text style={styles.check}>✓ Đang chọn</Text> : null}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.bookBtn, (submitting || selected.length === 0) && { opacity: 0.6 }]}
            disabled={submitting || selected.length === 0}
            onPress={handleBook}
          >
            <Text style={styles.bookText}>{submitting ? 'Đang xử lý...' : 'Xác nhận đặt vé & thanh toán 💕'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.text.primary },
  meta: { color: COLORS.text.secondary, marginTop: 4, fontWeight: '600', fontSize: 13 },
  legend: { flexDirection: 'row', marginTop: 15, marginBottom: 5, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 18, marginBottom: 6 },
  dot: { width: 16, height: 16, borderRadius: 4, marginRight: 8, borderWidth: 1 },
  legendText: { fontSize: 12, fontWeight: '700', color: COLORS.text.secondary },
  screen: {
    height: 40,
    borderRadius: 50,
    backgroundColor: '#1E1E26',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#2D3748',
    transform: [{ perspective: 100 }, { rotateX: '15deg' }],
  },
  screenText: { fontWeight: '900', color: COLORS.primary, letterSpacing: 5, fontSize: 13, opacity: 0.8 },
  grid: { backgroundColor: '#0F1014', borderRadius: 20, padding: 15, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10, gap: 8 },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1C23',
  },
  takenSeat: { backgroundColor: '#2D3748', opacity: 0.4 },
  selectedSeat: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  seatText: { fontSize: 10, fontWeight: '900', color: COLORS.text.secondary },
  summary: {
    marginTop: 10,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 20,
  },
  summaryTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text.primary, marginBottom: 10 },
  summaryText: { color: COLORS.text.secondary, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  priceLine: { marginTop: 10, color: COLORS.text.secondary, fontWeight: '700', fontSize: 15 },
  blockTitle: { marginTop: 18, fontWeight: '900', color: COLORS.text.primary, fontSize: 16 },
  paymentHint: { marginTop: 6, fontSize: 13, color: COLORS.text.secondary, fontWeight: '500' },
  promoWrap: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  promoInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2D3748',
    backgroundColor: '#0F1014',
    paddingHorizontal: 15,
    color: '#fff',
    fontWeight: '700',
  },
  applyBtn: { marginLeft: 10, backgroundColor: COLORS.primary, paddingHorizontal: 15, height: 50, justifyContent: 'center', borderRadius: 12 },
  applyText: { color: '#000', fontWeight: '900', fontSize: 13 },
  promoChips: { paddingTop: 12, paddingBottom: 4 },
  promoChip: {
    backgroundColor: '#1E1E26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 140,
  },
  promoChipActive: { borderColor: COLORS.primary, backgroundColor: '#2D2D1B' },
  promoChipText: { color: COLORS.text.primary, fontWeight: '900', fontSize: 13 },
  promoChipTextActive: { color: COLORS.primary },
  promoHint: { marginTop: 4, color: COLORS.text.secondary, fontSize: 11, fontWeight: '600' },
  discountLine: { marginTop: 12, color: COLORS.success, fontWeight: '900', fontSize: 15 },
  total: { marginTop: 10, color: COLORS.primary, fontSize: 24, fontWeight: '900' },
  methodWrap: { marginTop: 15 },
  methodCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2D3748',
    backgroundColor: '#1E1E26',
    padding: 15,
    marginBottom: 8,
  },
  methodCardActive: { borderColor: COLORS.primary, backgroundColor: '#242730' },
  methodEmoji: { fontSize: 24, marginBottom: 6 },
  methodLabel: { fontWeight: '900', color: COLORS.text.primary, fontSize: 16 },
  methodLabelActive: { color: COLORS.primary },
  methodSub: { fontSize: 12, color: COLORS.text.secondary, marginTop: 4, fontWeight: '600' },
  check: { marginTop: 8, color: COLORS.primary, fontWeight: '900', fontSize: 13 },
  bookBtn: { marginTop: 25, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  bookText: { color: '#000', fontWeight: '900', fontSize: 16 },
});
