// ============================================================
//  src/features/auth/controllers/AuthController.js
//  Firebase Authentication — Email / Password
// ============================================================
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../core/firebase';

const AuthController = {
  /**
   * Đăng nhập bằng email + password.
   * Trả về { success, user, message }
   */
  async login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await this._loadProfile(cred.user.uid);
      return { success: true, user: this._buildUser(cred.user, profile) };
    } catch (e) {
      return { success: false, message: this._mapError(e.code) };
    }
  },

  /**
   * Đăng ký tài khoản mới.
   * Trả về { success, user, message }
   */
  async register(email, password, fullName) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const profile = { fullName: fullName.trim(), email: email.trim(), createdAt: serverTimestamp() };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      return { success: true, user: this._buildUser(cred.user, profile) };
    } catch (e) {
      return { success: false, message: this._mapError(e.code) };
    }
  },

  /** Đăng xuất */
  async logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[AuthController] logout:', e);
    }
  },

  /** Load profile từ Firestore */
  async _loadProfile(uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data() : {};
    } catch {
      return {};
    }
  },

  /** Tạo object user chuẩn cho Context */
  _buildUser(firebaseUser, profile = {}) {
    return {
      uid:      firebaseUser.uid,
      id:       firebaseUser.uid,   // backward compat với SeatBookingScreen
      email:    firebaseUser.email,
      fullName: profile.fullName || firebaseUser.email.split('@')[0],
    };
  },

  /** Map Firebase error code → thông báo tiếng Việt */
  _mapError(code) {
    const map = {
      'auth/invalid-email':          'Email không đúng định dạng.',
      'auth/user-not-found':         'Tài khoản không tồn tại.',
      'auth/wrong-password':         'Mật khẩu không chính xác.',
      'auth/email-already-in-use':   'Email này đã được đăng ký rồi.',
      'auth/weak-password':          'Mật khẩu cần ít nhất 6 ký tự.',
      'auth/too-many-requests':      'Quá nhiều lần thử — vui lòng thử lại sau.',
      'auth/network-request-failed': 'Lỗi kết nối mạng. Kiểm tra internet nha!',
      'auth/invalid-credential':     'Email hoặc mật khẩu không đúng.',
    };
    return map[code] || `Lỗi đăng nhập (${code}). Thử lại nha!`;
  },
};

export default AuthController;
