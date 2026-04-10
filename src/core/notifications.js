// ============================================================
//  src/core/notifications.js
//  MOCK version cho Expo Go (SDK 53+ loại bỏ push notification)
//  Dùng Alert để simulate notification — demo đầy đủ trong app
// ============================================================
import { Alert } from 'react-native';

/** Không cần đăng ký FCM trong Expo Go — trả về null */
export async function registerForPushNotifications(uid) {
  console.log('[Notifications] Mock mode — Expo Go không hỗ trợ FCM.');
  return null;
}

/**
 * Mock: hiện Alert thay cho push notification thật.
 * Khi deploy production build → thay bằng expo-notifications thật.
 */
export async function scheduleShowtimeReminder({ movieTitle, theaterName, startTime, seatCodes }) {
  try {
    const showDate = new Date(startTime);
    const timeStr  = showDate.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit',
      day: '2-digit',  month: '2-digit',
    });

    // Chờ 1 giây để UX tự nhiên hơn (sau khi navigate xong)
    setTimeout(() => {
      Alert.alert(
        'Đặt vé thành công!',
        `Phim: ${movieTitle}\nRạp: ${theaterName}\nGiờ chiếu: ${timeStr}\nGhế: ${seatCodes.join(', ')}\n\n🔔 Nhắc nhở: App sẽ gửi push notification nhắc bạn 1 tiếng trước giờ chiếu khi build production.`,
        [{ text: 'Tuyệt!', style: 'default' }]
      );
    }, 800);

    console.log('[Notifications] Mock notification scheduled for:', movieTitle);
    return 'mock-notification-id';
  } catch (e) {
    console.warn('[Notifications] Mock error:', e);
    return null;
  }
}

export async function cancelAllScheduledNotifications() {
  console.log('[Notifications] Mock: cancel all notifications.');
}
