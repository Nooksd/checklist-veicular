// src/pages/forms/FuelForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fuelIn } from "@/store/slicers/carEntrySlicer";
import { getCars } from "@/store/slicers/carSlicer";

const FuelForm = () => {
  const dispatch = useDispatch();
  const { cars } = useSelector((state) => state.car);
  const { status } = useSelector((state) => state.carEntry);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    carID: "",
    fuelAdded: "",
  });

  useEffect(() => {
    dispatch(getCars("?active=true"));
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      fuelAdded: parseFloat(formData.fuelAdded),
    };

    dispatch(fuelIn(payload))
      .unwrap()
      .then((response) => {
        setSuccessMessage("Abastecimento registrado com sucesso!");
        setFormData({
          carID: "",
          fuelAdded: "",
        });
      })
      .catch((err) => {
        setErrorMessage(err.error || "Erro ao registrar o abastecimento.");
      });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Registro de Abastecimento</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
                {car.plate} - {car.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Litros Abastecidos
          </label>
          <input
            required
            type="number"
            step="0.1"
            className="w-full p-2 border rounded-lg"
            onChange={(e) =>
              setFormData({ ...formData, fuelAdded: e.target.value })
            }
          />
        </div>

        <div className="border-t pt-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === "loading" ? "Registrando..." : "Salvar Abastecimento"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FuelForm;
