// src/features/movie/models/ShowtimeModel.js — Firestore
import {
  collection, doc,
  getDocs, getDoc,
  query, where,
  updateDoc, increment,
} from 'firebase/firestore';
import { db } from '../../../core/firebase';

const ShowtimeModel = {
  async getAll() {
    const snap = await getDocs(collection(db, 'showtimes'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getById(id) {
    const snap = await getDoc(doc(db, 'showtimes', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async getByMovieId(movieId) {
    const q = query(collection(db, 'showtimes'), where('movieId', '==', movieId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getByTheaterId(theaterId) {
    const q = query(collection(db, 'showtimes'), where('theaterId', '==', theaterId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async reduceAvailableSeats(showtimeId, count) {
    await updateDoc(doc(db, 'showtimes', showtimeId), {
      availableSeats: increment(-count),
    });
  },
};

export default ShowtimeModel;
