import { useParams } from 'react-router';
import { useGames } from '../contexts/GamesContext';
import { CheckCircle2, Target, Trophy, HelpCircle, BookOpen } from 'lucide-react';

export function GameWiki() {
  const { gameId } = useParams();
  const { games, loading } = useGames();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-400">
        Loading wiki...
      </div>
    );
  }

  const game = games.find(g => g.id === gameId);

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-400">
        Game not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* How to Play Section */}
      {game.howToPlay && game.howToPlay.id && game.howToPlay.id.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Cara Bermain</h2>
          </div>
          <div className="space-y-3">
            {game.howToPlay.id.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <p className="text-gray-700 flex-1 pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Section */}
      {game.rules && game.rules.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Aturan</h2>
          </div>
          <div className="space-y-4">
            {game.rules.map((rule, index) => (
              <div key={index} className="border-l-4 border-purple-300 pl-4">
                <h3 className="font-semibold text-gray-800 mb-1">{rule.title?.id || rule.title?.en}</h3>
                <p className="text-gray-600 text-sm">{rule.content?.id || rule.content?.en}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {game.faq && game.faq.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
          </div>
          <div className="space-y-4">
            {game.faq.map((item, index) => (
              <div key={index}>
                <p className="font-semibold text-gray-800 mb-1">❓ {item.q?.id || item.q?.en}</p>
                <p className="text-gray-600 text-sm ml-5">{item.a?.id || item.a?.en}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <h3 className="font-semibold text-indigo-900 mb-2">💡 Tips</h3>
        <p className="text-indigo-800 text-sm">
          Gunakan tab "Alat Bantu" untuk mengakses penghitung digital yang memudahkan Anda melacak HP atau skor selama permainan.
        </p>
      </div>
    </div>
  );
}
