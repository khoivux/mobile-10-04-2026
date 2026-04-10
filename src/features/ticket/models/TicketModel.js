// src/features/ticket/models/TicketModel.js — Firestore
import {
  collection, doc,
  addDoc, getDoc, getDocs,
  query, where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../core/firebase';

const TicketModel = {
  /**
   * Tạo vé mới trong Firestore.
   * Trả về document ID của vé vừa tạo.
   */
  async create({ userId, showtimeId, seatCodes, totalPrice, originalPrice, discountAmount, promoCode, paymentMethod, showtimeSnap }) {
    const ref = await addDoc(collection(db, 'tickets'), {
      userId,
      showtimeId,
      seatCodes:      Array.isArray(seatCodes) ? seatCodes.join(',') : seatCodes,
      totalPrice,
      originalPrice:  originalPrice  || 0,
      discountAmount: discountAmount || 0,
      promoCode:      promoCode      || null,
      paymentMethod:  paymentMethod  || 'Ví điện tử',
      status:         'booked',
      bookedAt:       serverTimestamp(),
      // Denormalized fields từ showtime snapshot — cho hiển thị nhanh
      movieTitle:     showtimeSnap?.movieTitle     || '',
      theaterName:    showtimeSnap?.theaterName    || '',
      address:        showtimeSnap?.theaterAddress || '',
      startTime:      showtimeSnap?.startTime      || '',
      room:           showtimeSnap?.room           || '',
      posterUrl:      showtimeSnap?.posterUrl      || '',
      // fullName sẽ được cập nhật bởi controller nếu cần
      fullName:       '',
    });
    return ref.id;
  },

  async getById(id) {
    const snap = await getDoc(doc(db, 'tickets', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async getByUserId(userId) {
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', userId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getByShowtimeId(showtimeId) {
    const q = query(
      collection(db, 'tickets'),
      where('showtimeId', '==', showtimeId),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};

export default TicketModel;
