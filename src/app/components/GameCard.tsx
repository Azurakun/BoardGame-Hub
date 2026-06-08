import { Link } from 'react-router';
import { Users, Clock, Brain, ChevronRight } from 'lucide-react';
import { Game } from '../data/games';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { getImageUrl } from '../config';

interface GameCardProps {
  game: Game;
  variant?: 'grid' | 'list';
}

export function GameCard({ game, variant = 'grid' }: GameCardProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (variant === 'list') {
    return (
      <div
        onClick={() => navigate(`/wiki/game/${game.id}`)}
        className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg dark:shadow-none hover:-translate-y-0.5 transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-row h-full group"
      >
        {/* Image */}
        <div className="w-28 sm:w-40 md:w-48 shrink-0 relative overflow-hidden bg-gray-100 dark:bg-slate-900">
          <img
            src={getImageUrl(game.imageUrl)}
            alt={game.name[language]}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {game.category.map(cat => (
                <span key={cat} className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                  {cat}
                </span>
              ))}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {game.name[language]}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {game.shortDescription[language]}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1" title="Players">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-medium">{game.minPlayers}-{game.maxPlayers}</span>
            </div>
            <div className="flex items-center gap-1" title="Playtime">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-medium">{game.playTime}m</span>
            </div>
            <div className="flex items-center gap-1" title="Complexity">
              <Brain className="w-3.5 h-3.5 text-emerald-500" />
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-3 rounded-full ${i < game.complexity ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
      </div>
    );
  }

  // Default: grid variant
  return (
    <div
      onClick={() => navigate(`/wiki/game/${game.id}`)}
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-lg shadow-indigo-500/5 hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-col h-full group"
    >
      <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-slate-900 leading-none flex items-center justify-center">
        <img
          src={getImageUrl(game.imageUrl)}
          alt={game.name[language]}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-3">
          {game.category.map(cat => (
            <span key={cat} className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              {cat}
            </span>
          ))}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {game.name[language]}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1 line-clamp-2">
          {game.shortDescription[language]}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto text-sm text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-slate-800/50 -mx-6 -mb-6 px-6 py-4">
          <div className="flex items-center gap-1.5" title="Players">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{game.minPlayers}-{game.maxPlayers}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Playtime">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="font-medium">{game.playTime}m</span>
          </div>
          <div className="flex items-center gap-1.5" title="Complexity">
            <Brain className="w-4 h-4 text-emerald-500" />
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-3 rounded-full ${i < game.complexity ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
