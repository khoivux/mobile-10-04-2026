import * as SQLite from "expo-sqlite";

let _db = null;

export function getDatabase() {
  if (!_db) _db = SQLite.openDatabaseSync("movie_ticket_app.db");
  return _db;
}

let _initPromise = null;
export async function initDatabase() {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const db = getDatabase();
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        fullName TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS Movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        genre TEXT,
        duration INTEGER NOT NULL,
        rating REAL DEFAULT 0,
        posterUrl TEXT,
        description TEXT,
        basePrice REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS Theaters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT,
        imageUrl TEXT
      );
      CREATE TABLE IF NOT EXISTS Showtimes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movieId INTEGER NOT NULL,
        theaterId INTEGER NOT NULL,
        startTime TEXT NOT NULL,
        room TEXT NOT NULL,
        totalSeats INTEGER DEFAULT 64,
        availableSeats INTEGER DEFAULT 64,
        format TEXT DEFAULT '2D',
        language TEXT DEFAULT 'Phụ đề',
        FOREIGN KEY (movieId) REFERENCES Movies(id),
        FOREIGN KEY (theaterId) REFERENCES Theaters(id)
      );
      CREATE TABLE IF NOT EXISTS Tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        showtimeId INTEGER NOT NULL,
        seatCodes TEXT NOT NULL,
        totalPrice REAL NOT NULL,
        originalPrice REAL DEFAULT 0,
        discountAmount REAL DEFAULT 0,
        promoCode TEXT,
        paymentMethod TEXT DEFAULT 'Ví điện tử',
        status TEXT DEFAULT 'booked',
        bookedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (showtimeId) REFERENCES Showtimes(id)
      );
    `);
    // Best-effort schema upgrade for existing installations.
    const alterStatements = [
      "ALTER TABLE Tickets ADD COLUMN originalPrice REAL DEFAULT 0",
      "ALTER TABLE Tickets ADD COLUMN discountAmount REAL DEFAULT 0",
      "ALTER TABLE Tickets ADD COLUMN promoCode TEXT",
      "ALTER TABLE Tickets ADD COLUMN paymentMethod TEXT DEFAULT 'Ví điện tử'",
    ];
    for (const sql of alterStatements) {
      try {
        await db.runAsync(sql);
      } catch (_e) {
        // Column may already exist; safe to ignore.
      }
    }
  })();
  return _initPromise;
}

let _seedPromise = null;
export async function seedData() {
  if (_seedPromise) return _seedPromise;

  _seedPromise = (async () => {
    const db = getDatabase();
    const countRow = await db.getFirstAsync("SELECT COUNT(*) as c FROM Movies");
    if (countRow && countRow.c > 0) return;

    const movies = [
      {
        title: "Dune: Part Two",
        genre: "Sci-Fi",
        duration: 166,
        rating: 8.9,
        basePrice: 110000,
        posterUrl:
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800",
        description:
          "Cuộc chiến quyền lực và lời tiên tri trên hành tinh cát — trở lại hoành tráng.",
      },
      {
        title: "Inside Out 2",
        genre: "Animation",
        duration: 100,
        rating: 8.2,
        basePrice: 90000,
        posterUrl:
          "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=800",
        description:
          "Hành trình cảm xúc mới với màu sắc rực rỡ và thông điệp ấm áp.",
      },
      {
        title: "Godzilla x Kong",
        genre: "Action",
        duration: 115,
        rating: 7.6,
        basePrice: 100000,
        posterUrl:
          "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800",
        description:
          "Trận chiến quái vật đầy kỳ vĩ với hiệu ứng màn hình lớn bùng nổ.",
      },
      {
        title: "Mai",
        genre: "Drama",
        duration: 131,
        rating: 7.8,
        basePrice: 85000,
        posterUrl:
          "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800",
        description:
          "Câu chuyện tình cảm đầy cảm xúc và gần gũi với khán giả Việt.",
      },
    ];

    const theaters = [
      {
        name: "Galaxy Nguyen Du",
        address: "116 Nguyen Du, Quan 1",
        city: "TP.HCM",
        imageUrl:
          "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "CGV Vincom Ba Trieu",
        address: "191 Ba Trieu, Hai Ba Trung",
        city: "Ha Noi",
        imageUrl:
          "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Lotte Cinema Da Nang",
        address: "6 Nha Hat Trung Vuong, Hai Chau",
        city: "Da Nang",
        imageUrl:
          "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=800",
      },
    ];

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        "INSERT INTO Users (username, password, fullName) VALUES ('admin', '123456', 'Quản trị rạp')",
      );
      for (const movie of movies) {
        await db.runAsync(
          "INSERT INTO Movies (title, genre, duration, rating, posterUrl, description, basePrice) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            movie.title,
            movie.genre,
            movie.duration,
            movie.rating,
            movie.posterUrl,
            movie.description,
            movie.basePrice,
          ],
        );
      }
      for (const theater of theaters) {
        await db.runAsync(
          "INSERT INTO Theaters (name, address, city, imageUrl) VALUES (?, ?, ?, ?)",
          [theater.name, theater.address, theater.city, theater.imageUrl],
        );
      }

      const showtimes = [
        [1, 1, "2026-03-27 10:00:00", "Phòng 1", 64, 64, "IMAX", "Phụ đề"],
        [1, 2, "2026-03-27 19:30:00", "Phòng 3", 64, 64, "2D", "Lồng tiếng"],
        [2, 1, "2026-03-27 14:00:00", "Phòng 2", 64, 64, "2D", "Lồng tiếng"],
        [2, 3, "2026-03-28 16:30:00", "Phòng 1", 64, 64, "2D", "Phụ đề"],
        [3, 2, "2026-03-28 20:00:00", "Phòng 5", 64, 64, "4DX", "Phụ đề"],
        [4, 1, "2026-03-29 18:00:00", "Phòng 4", 64, 64, "2D", "Tiếng Việt"],
      ];

      for (const st of showtimes) {
        await db.runAsync(
          `INSERT INTO Showtimes (movieId, theaterId, startTime, room, totalSeats, availableSeats, format, language)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          st,
        );
      }
    });
  })();

  return _seedPromise;
}
