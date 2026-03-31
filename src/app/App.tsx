import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CardsProvider } from './contexts/CardsContext';
import { GamesProvider } from './contexts/GamesContext';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Standard Pages
import { Home } from './pages/Home';
import { Wiki } from './pages/Wiki';
import { GameDetail } from './pages/GameDetail';
import { GameTools } from './pages/GameTools';
import { CardViewer } from './pages/CardViewer';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';


function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AuthProvider>
          <GamesProvider>
            <CardsProvider>
              <Router>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/wiki" element={<Wiki />} />
                    <Route path="/wiki/game/:gameId" element={<GameDetail />} />
                    <Route path="/tools" element={<GameTools />} />
                    <Route path="/tools/:toolId" element={<GameTools />} />
                    <Route path="/cards" element={<CardViewer />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </Router>
            </CardsProvider>
          </GamesProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;