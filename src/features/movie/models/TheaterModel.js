// src/features/movie/models/TheaterModel.js — Firestore
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase';

const TheaterModel = {
  async getAll() {
    const snap = await getDocs(collection(db, 'theaters'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async getById(id) {
    const snap = await getDoc(doc(db, 'theaters', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
};

export default TheaterModel;
