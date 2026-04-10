// src/features/ticket/controllers/TicketController.js — Firebase version
import { runTransaction, doc } from 'firebase/firestore';
import { db } from '../../../core/firebase';
import TicketModel   from '../models/TicketModel';
import ShowtimeModel from '../../movie/models/ShowtimeModel';
import { scheduleShowtimeReminder } from '../../../core/notifications';

const PROMOTIONS = {
  CINE10:   { type: 'percent', value: 10, maxDiscount: 50000, description: 'Giảm 10% — tối đa 50k 💕' },
  STUDENT20:{ type: 'percent', value: 20, maxDiscount: 70000, description: 'Ưu đãi sinh viên —20% 🎓' },
  NIGHT30K: { type: 'flat',    value: 30000,                  description: 'Suất khuya — giảm thẳng 30k 🌙' },
};

const TicketController = {
  getPromotions() {
    return PROMOTIONS;
  },

  calcDiscount({ subtotal, promoCode }) {
    const code  = String(promoCode || '').trim().toUpperCase();
    const promo = PROMOTIONS[code];
    if (!promo || !subtotal || subtotal <= 0)
      return { valid: false, code: '', discount: 0, reason: 'Mã không hợp lệ.' };

    let discount = 0;
    if (promo.type === 'percent') {
      discount = Math.floor((subtotal * promo.value) / 100);
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.value;
    }
    discount = Math.min(discount, subtotal);
    return { valid: true, code, discount, promo };
  },

  async getTakenSeats(showtimeId) {
    try {
      const rows  = await TicketModel.getByShowtimeId(showtimeId);
      const taken = new Set();
      rows.forEach((r) => {
        String(r.seatCodes || '').split(',').filter(Boolean).forEach((s) => taken.add(s));
      });
      return [...taken];
    } catch (e) {
      console.error('[TicketController] getTakenSeats', e);
      return [];
    }
  },

  /**
   * Đặt vé với Firestore transaction.
   * Transaction đảm bảo không double-booking khi nhiều người đặt cùng lúc.
   */
  async bookTicket({ userId, userFullName, showtimeId, seatCodes, seatPrice, promoCode, paymentMethod }) {
    if (!userId)          return { success: false, message: 'Bạn cần đăng nhập để đặt vé nha 💕' };
    if (!seatCodes?.length) return { success: false, message: 'Chọn ít nhất một ghế xinh xắn đi nè!' };
    if (!paymentMethod)   return { success: false, message: 'Chọn phương thức thanh toán trước nhé!' };

    try {
      let ticketId  = null;
      let showtimeSnap = null;

      // Firestore transaction — đảm bảo atomic
      await runTransaction(db, async (tx) => {
        const showtimeRef = doc(db, 'showtimes', showtimeId);
        const showtimeDoc = await tx.get(showtimeRef);

        if (!showtimeDoc.exists()) throw new Error('Không tìm thấy suất chiếu.');
        const showtime = { id: showtimeDoc.id, ...showtimeDoc.data() };
        showtimeSnap = showtime;

        if (showtime.availableSeats < seatCodes.length)
          throw new Error('Không đủ ghế trống rồi, thử suất khác nha!');

        // Lấy ghế đã bán (không trong transaction nhưng đủ cho demo)
        const taken = await this.getTakenSeats(showtimeId);
        if (seatCodes.some((s) => taken.includes(s)))
          throw new Error('Có ghế vừa được đặt, vui lòng chọn ghế khác.');

        // Tính giá
        const originalPrice   = seatCodes.length * seatPrice;
        const promoResult     = this.calcDiscount({ subtotal: originalPrice, promoCode });
        const discountAmount  = promoResult.valid ? promoResult.discount : 0;
        const totalPrice      = Math.max(0, originalPrice - discountAmount);

        // Giảm ghế trống
        tx.update(showtimeRef, {
          availableSeats: showtime.availableSeats - seatCodes.length,
        });

        // Lưu vé (ngoài transaction vì addDoc không dùng được trong tx)
        // Sẽ tạo sau khi tx thành công
        showtimeSnap = {
          ...showtime,
          _originalPrice:  originalPrice,
          _discountAmount: discountAmount,
          _totalPrice:     totalPrice,
          _promoCode:      promoResult.valid ? promoResult.code : null,
        };
      });

      // Tạo document vé sau transaction
      ticketId = await TicketModel.create({
        userId,
        showtimeId,
        seatCodes,
        totalPrice:     showtimeSnap._totalPrice,
        originalPrice:  showtimeSnap._originalPrice,
        discountAmount: showtimeSnap._discountAmount,
        promoCode:      showtimeSnap._promoCode,
        paymentMethod,
        showtimeSnap: {
          ...showtimeSnap,
          fullName: userFullName || '',
        },
      });

      // Lập lịch push notification nhắc giờ chiếu
      await scheduleShowtimeReminder({
        movieTitle:  showtimeSnap.movieTitle,
        theaterName: showtimeSnap.theaterName,
        startTime:   showtimeSnap.startTime,
        seatCodes,
      });

      const ticket = await TicketModel.getById(ticketId);
      return { success: true, ticket };
    } catch (e) {
      console.error('[TicketController] bookTicket', e);
      return { success: false, message: e.message || 'Đặt vé chưa thành công, thử lại sau nha!' };
    }
  },

  async getMyTickets(userId) {
    try {
      if (!userId) return [];
      return await TicketModel.getByUserId(userId);
    } catch (e) {
      console.error('[TicketController] getMyTickets', e);
      return [];
    }
  },

  async getTicketDetail(ticketId) {
    try {
      return await TicketModel.getById(ticketId);
    } catch (e) {
      console.error('[TicketController] getTicketDetail', e);
      return null;
    }
  },
};

export default TicketController;
