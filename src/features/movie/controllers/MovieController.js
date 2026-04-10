// src/features/movie/controllers/MovieController.js
import MovieModel    from '../models/MovieModel';
import TheaterModel  from '../models/TheaterModel';
import ShowtimeModel from '../models/ShowtimeModel';

const MovieController = {
  async getMovies()              { return MovieModel.getAll(); },
  async getMovieById(id)         { return MovieModel.getById(id); },
  async getTheaters()            { return TheaterModel.getAll(); },
  async getTheaterById(id)       { return TheaterModel.getById(id); },
  async getShowtimes()           { return ShowtimeModel.getAll(); },
  async getShowtimesByMovie(mid) { return ShowtimeModel.getByMovieId(mid); },
  async getShowtimeDetail(id)    { return ShowtimeModel.getById(id); },

  /** Định dạng giá tiền VND */
  formatPrice(amount) {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  },

  /** Định dạng ngày giờ chiếu */
  formatTime(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        weekday: 'short', day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  },

  /** Trả về label màu tag thể loại */
  genreColor(genre) {
    const map = {
      'Sci-Fi':    '#A855F7', // Purple neon
      'Animation': '#EC4899', // Pink neon
      'Action':    '#EF4444', // Red vibrant
      'Drama':     '#3B82F6', // Blue neon
      'Comedy':    '#EAB308', // Gold/Yellow
      'Horror':    '#000000', // Black
    };
    return map[genre] || '#64748B';
  },
};

export default MovieController;
