import { useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

export const LocationInput = ({ onLocationUpdate }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        onLocationUpdate(newLocation);
        setError(null);
      },
      (err) => {
        setError("Permissão de localização negada");
        console.error(err);
      }
    );
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={getLocation}
        className="flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg"
      >
        <MapPinIcon className="w-5 h-5 mr-2" />
        {location ? "Atualizar Localização" : "Obter Localização Atual"}
      </button>

      {location && (
        <div className="text-sm text-gray-600">
          Latitude: {location.latitude.toFixed(6)}, Longitude:{" "}
          {location.longitude.toFixed(6)}
        </div>
      )}

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default LocationInput;
