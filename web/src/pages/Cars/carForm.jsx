// src/components/CarForm.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { createCar, updateCar } from "@/store/slicers/carSlicer";
import { useForm } from "react-hook-form";

const CarForm = ({ open, onClose, carData }) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.car);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (carData) {
      reset(carData);
    } else {
      reset({
        number: "",
        plate: "",
        model: "",
        brand: "",
        year: new Date().getFullYear(),
        consumption: 0,
        isActive: true,
      });
    }
  }, [carData, reset]);

  const onSubmit = (data) => {
    if (carData) {
      dispatch(updateCar({ id: carData.id, data: data }));
    } else {
      dispatch(createCar(data));
    }
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-100 bg-opacity-50 z-50 ${
        open ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {carData ? "Editar Veículo" : "Novo Veículo"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número *
              </label>
              <input
                {...register("number", { required: true })}
                className={`mt-1 block w-full rounded-md border ${
                  errors.number ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Placa *
              </label>
              <input
                {...register("plate", {
                  required: true,
                  pattern: /^[A-Za-z]{3}\d[A-Za-z]\d{2}$/,
                })}
                className={`mt-1 block w-full rounded-md border ${
                  errors.plate ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 uppercase`}
                placeholder="ABC1D23"
              />
              {errors.plate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-1" />
                  Formato inválido (ex: ABC1D23)
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Modelo *
                </label>
                <input
                  {...register("model", { required: true })}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.model ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marca *
                </label>
                <input
                  {...register("brand", { required: true })}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.brand ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ano *
                </label>
                <input
                  type="number"
                  {...register("year", {
                    required: true,
                    min: 1900,
                    max: new Date().getFullYear() + 1,
                  })}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.year ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Consumo (km/l) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("consumption", {
                    required: true,
                    max: 100,
                    valueAsNumber: true,
                    min: 0.1,
                  })}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.consumption ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 text-indigo-600 rounded border-gray-300"
              />
              <label className="text-sm text-gray-700">Ativo</label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {status === "loading" ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CarForm;
