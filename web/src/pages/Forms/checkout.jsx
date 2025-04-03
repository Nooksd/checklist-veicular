// src/pages/forms/CheckOutForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { checkOut } from "@/store/slicers/carEntrySlicer";
import { LocationInput } from "./checkin";

const CheckOutForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { carEntry, status } = useSelector((state) => state.carEntry);

  const [formData, setFormData] = useState({
    checkOut: {
      location: { latitude: 0, longitude: 0 },
      carState: "",
      actualKM: "",
    },
  });

  useEffect(() => {
    if (carEntry?.checkIn?.actualKM) {
      setFormData({
        checkOut: {
          ...formData.checkOut,
          actualKM: carEntry.checkIn.actualKM,
        },
      });
    }
  }, [carEntry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      carID: carEntry.carID,
      userID: carEntry.userID,
      checkOut: {
        ...formData.checkOut,
        actualKM: parseFloat(formData.checkOut.actualKM),
      },
    };

    dispatch(checkOut(payload)).then(() => {
      navigate(`/car-entries/${id}`);
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Check-Out Veicular</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Localização Atual
          </label>
          <LocationInput
            onLocationUpdate={(loc) =>
              setFormData({
                ...formData,
                checkOut: { ...formData.checkOut, location: loc },
              })
            }
          />
        </div>

        <div className="space-y-4">
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
                  checkOut: { ...formData.checkOut, carState: e.target.value },
                })
              }
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">KM Final</label>
            <input
              required
              type="number"
              step="0.1"
              value={formData.checkOut.actualKM}
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkOut: { ...formData.checkOut, actualKM: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === "loading" ? "Registrando..." : "Finalizar Check-Out"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckOutForm;
