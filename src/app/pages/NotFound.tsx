import { Link } from 'react-router';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-md"
        >
          <Home className="w-5 h-5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
