// src/pages/Home.jsx
import React, { useEffect, useState } from "react";

const Home = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("Geolocalização não suportada pelo navegador.");
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Bem-vindo à Home</h1>
      {error && <p className="text-red-500">Erro: {error}</p>}
      {location.latitude && location.longitude ? (
        <p>
          Sua localização: {location.latitude}, {location.longitude}
        </p>
      ) : (
        <p>Obtendo localização...</p>
      )}
    </div>
  );
};

export default Home;
