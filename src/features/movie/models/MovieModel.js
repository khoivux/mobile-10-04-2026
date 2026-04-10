// src/features/movie/models/MovieModel.js — Firestore
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase';

const MovieModel = {
  async getAll() {
    const snap = await getDocs(collection(db, 'movies'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getById(id) {
    const snap = await getDoc(doc(db, 'movies', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
};

export default MovieModel;
