// ============================================================
//  src/core/firebaseSeeder.js  —  Seed dữ liệu vào Firestore
//  Chỉ chạy một lần khi collection Movies chưa có document
// ============================================================
import {
  collection,
  getDocs,
  addDoc,
  query,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

const MOVIES = [
  {
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    duration: 166,
    rating: 8.9,
    basePrice: 110000,
    posterUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
    description:
      'Cuộc chiến quyền lực và lời tiên tri trên hành tinh cát — trở lại hoành tráng.',
  },
  {
    title: 'Inside Out 2',
    genre: 'Animation',
    duration: 100,
    rating: 8.2,
    basePrice: 90000,
    posterUrl:
      'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=800',
    description: 'Hành trình cảm xúc mới với màu sắc rực rỡ và thông điệp ấm áp.',
  },
  {
    title: 'Godzilla x Kong',
    genre: 'Action',
    duration: 115,
    rating: 7.6,
    basePrice: 100000,
    posterUrl:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800',
    description: 'Trận chiến quái vật đầy kỳ vĩ với hiệu ứng màn hình lớn bùng nổ.',
  },
  {
    title: 'Mai',
    genre: 'Drama',
    duration: 131,
    rating: 7.8,
    basePrice: 85000,
    posterUrl:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
    description: 'Câu chuyện tình cảm đầy cảm xúc và gần gũi với khán giả Việt.',
  },
];

const THEATERS = [
  {
    name: 'Galaxy Nguyen Du',
    address: '116 Nguyen Du, Quan 1',
    city: 'TP.HCM',
    imageUrl:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'CGV Vincom Ba Trieu',
    address: '191 Ba Trieu, Hai Ba Trung',
    city: 'Ha Noi',
    imageUrl:
      'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=800',
  },
  {
    name: 'Lotte Cinema Da Nang',
    address: '6 Nha Hat Trung Vuong, Hai Chau',
    city: 'Da Nang',
    imageUrl:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=800',
  },
];

export async function seedFirestore() {
  try {
    // Kiểm tra đã seed chưa
    const snap = await getDocs(query(collection(db, 'movies'), limit(1)));
    if (!snap.empty) {
      console.log('[Seeder] Firestore đã có dữ liệu, bỏ qua seed.');
      return;
    }

    console.log('[Seeder] Bắt đầu seed dữ liệu vào Firestore...');

    // Seed Movies
    const movieIds = [];
    for (const movie of MOVIES) {
      const ref = await addDoc(collection(db, 'movies'), movie);
      movieIds.push(ref.id);
      console.log(`[Seeder] Movie "${movie.title}" → ${ref.id}`);
    }

    // Seed Theaters
    const theaterIds = [];
    for (const theater of THEATERS) {
      const ref = await addDoc(collection(db, 'theaters'), theater);
      theaterIds.push(ref.id);
      console.log(`[Seeder] Theater "${theater.name}" → ${ref.id}`);
    }

    // Seed Showtimes (denormalized: kèm tên phim và rạp)
    const showtimeTemplates = [
      { movieIdx: 0, theaterIdx: 0, startTime: '2026-04-15T10:00:00', room: 'Phòng 1', format: 'IMAX', language: 'Phụ đề' },
      { movieIdx: 0, theaterIdx: 1, startTime: '2026-04-15T19:30:00', room: 'Phòng 3', format: '2D',   language: 'Lồng tiếng' },
      { movieIdx: 1, theaterIdx: 0, startTime: '2026-04-15T14:00:00', room: 'Phòng 2', format: '2D',   language: 'Lồng tiếng' },
      { movieIdx: 1, theaterIdx: 2, startTime: '2026-04-16T16:30:00', room: 'Phòng 1', format: '2D',   language: 'Phụ đề' },
      { movieIdx: 2, theaterIdx: 1, startTime: '2026-04-16T20:00:00', room: 'Phòng 5', format: '4DX',  language: 'Phụ đề' },
      { movieIdx: 3, theaterIdx: 0, startTime: '2026-04-17T18:00:00', room: 'Phòng 4', format: '2D',   language: 'Tiếng Việt' },
    ];

    for (const tmpl of showtimeTemplates) {
      const movie   = MOVIES[tmpl.movieIdx];
      const theater = THEATERS[tmpl.theaterIdx];
      await addDoc(collection(db, 'showtimes'), {
        movieId:        movieIds[tmpl.movieIdx],
        theaterId:      theaterIds[tmpl.theaterIdx],
        movieTitle:     movie.title,
        theaterName:    theater.name,
        theaterAddress: theater.address,
        posterUrl:      movie.posterUrl,
        basePrice:      movie.basePrice,
        startTime:      tmpl.startTime,
        room:           tmpl.room,
        format:         tmpl.format,
        language:       tmpl.language,
        totalSeats:     64,
        availableSeats: 64,
      });
    }

    console.log('[Seeder] Seed Firestore hoàn tất!');
  } catch (e) {
    console.error('[Seeder] Lỗi:', e);
  }
}
