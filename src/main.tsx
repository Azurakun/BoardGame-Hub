import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./app/App.tsx";
import { LanguageProvider } from './app/contexts/LanguageContext.tsx';
import { GamesProvider } from './app/contexts/GamesContext.tsx';
import { CardsProvider } from './app/contexts/CardsContext.tsx';
import { AuthProvider } from './app/contexts/AuthContext.tsx';
import { CategoriesProvider } from './app/contexts/CategoriesContext.tsx';
import { StrictMode } from 'react';
import "./styles/index.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <LanguageProvider>
          <GamesProvider>
            <CategoriesProvider>
              <CardsProvider>
                <App />
              </CardsProvider>
            </CategoriesProvider>
          </GamesProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);