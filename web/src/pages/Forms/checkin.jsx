// src/pages/forms/CheckInForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkIn } from "@/store/slicers/carEntrySlicer";
import { getUsers } from "@/store/slicers/userSlicer";
import { getCars } from "@/store/slicers/carSlicer";
import {
  MapPinIcon,
  PhotoIcon,
  DocumentArrowUpIcon,
  TruckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

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

const CheckInForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.carEntry);
  const { users } = useSelector((state) => state.user);
  const { cars } = useSelector((state) => state.car);

  const [formData, setFormData] = useState({
    carID: "",
    userID: "",
    checkIn: {
      location: { latitude: 0, longitude: 0 },
      nextLocation: "",
      carState: "",
      actualKM: "",
      images: [],
    },
  });

  useEffect(() => {
    dispatch(getUsers("?active=true"));
    dispatch(getCars("?active=true"));
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      carID: primitive.ObjectID(formData.carID),
      userID: primitive.ObjectID(formData.userID),
      checkIn: {
        ...formData.checkIn,
        actualKM: parseFloat(formData.checkIn.actualKM),
      },
    };

    dispatch(checkIn(payload)).then((action) => {
      if (action.payload?.id) {
        navigate(`/car-entries/${action.payload.id}`);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TruckIcon className="w-8 h-8 text-indigo-600" />
        Check-In Veicular
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Usuário e Veículo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Usuário Responsável
            </label>
            <select
              required
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, userID: e.target.value })
              }
            >
              <option value="">Selecione o usuário</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  <UserCircleIcon className="w-4 h-4 inline mr-2" />
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Veículo</label>
            <select
              required
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, carID: e.target.value })
              }
            >
              <option value="">Selecione o veículo</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  <TruckIcon className="w-4 h-4 inline mr-2" />
                  {car.plate} - {car.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Localização */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Localização Atual
          </label>
          <LocationInput
            onLocationUpdate={(loc) =>
              setFormData({
                ...formData,
                checkIn: { ...formData.checkIn, location: loc },
              })
            }
          />
        </div>

        {/* Demais Campos */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Próximo Destino
            </label>
            <input
              required
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkIn: {
                    ...formData.checkIn,
                    nextLocation: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estado do Veículo
            </label>
            <textarea
              required
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkIn: { ...formData.checkIn, carState: e.target.value },
                })
              }
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">KM Atual</label>
            <input
              required
              type="number"
              step="0.1"
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkIn: { ...formData.checkIn, actualKM: e.target.value },
                })
              }
            />
          </div>
        </div>

        {/* Upload de Imagens (Implementar depois) */}
        <div className="border-t pt-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === "loading" ? "Registrando..." : "Finalizar Check-In"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckInForm;
