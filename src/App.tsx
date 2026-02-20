import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { PropertyDetailOverlay } from "./components/PropertyDetailOverlay";
import { AdminDashboardOverlay } from "./components/AdminDashboardOverlay";
import { FavoritesOverlay } from "./components/FavoritesOverlay";
import { MessagesOverlay } from "./components/MessagesOverlay";
import { AnimatePresence } from "motion/react";
import { CinematicLoader } from "./components/CinematicLoader";

function PropertyDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return null;
  return <PropertyDetailOverlay id={parseInt(id)} onClose={() => navigate(-1)} />;
}

function AdminWrapper() {
  const navigate = useNavigate();
  return <AdminDashboardOverlay onClose={() => navigate('/')} />;
}

function FavoritesWrapper() {
  const navigate = useNavigate();
  const toggleFavorite = async (id: number) => {
    try {
      const response = await fetch('/api/favorites');
      const data = await response.json();
      const favoritesIds = data.map((p: any) => p.id);
      const isFav = favoritesIds.includes(id);
      const method = isFav ? 'DELETE' : 'POST';
      await fetch(`/api/favorites/${id}`, { method });
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <FavoritesOverlay
      favorites={[]}
      onToggleFavorite={toggleFavorite}
      onClose={() => navigate('/')}
      onSelectProperty={(id) => navigate(`/propiedad/${id}`)}
    />
  );
}

function MessagesWrapper() {
  const navigate = useNavigate();
  return <MessagesOverlay onClose={() => navigate('/')} />;
}

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isInitializing && <CinematicLoader key="loader" />}
      </AnimatePresence>

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="propiedad/:id" element={<PropertyDetailWrapper />} />
          <Route path="admin" element={<AdminWrapper />} />
          <Route path="favoritos" element={<FavoritesWrapper />} />
          <Route path="mensajes" element={<MessagesWrapper />} />
        </Route>
      </Routes>
    </>
  );
}
