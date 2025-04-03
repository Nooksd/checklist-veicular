// src/pages/CarEntries.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { getCarEntries } from "@/store/slicers/carEntrySlicer";

const CarEntries = () => {
  const dispatch = useDispatch();
  const { carEntries, status, error } = useSelector((state) => state.carEntry);

  useEffect(() => {
    dispatch(getCarEntries("?sort=-startedAt"));
  }, [dispatch]);

  const getEntryStatus = (entry) => {
    if (!entry.checkOut) return "open";
    return "closed";
  };

  const hasDuplicateOpenEntries = (carId) => {
    const openEntries = carEntries.filter(
      (entry) => entry.carID === carId && !entry.checkOut
    );
    return openEntries.length > 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Registros de Veículos
        </h1>
      </div>

      <div className="space-y-4">
        {carEntries.map((entry) => {
          const status = getEntryStatus(entry);
          const isDuplicate = hasDuplicateOpenEntries(entry.carID);
          const duration = entry.endedAt
            ? Math.round(
                (new Date(entry.endedAt) - new Date(entry.startedAt)) / 1000
              )
            : null;

          const time =
            duration / (60 * 60) >= 1
              ? `${Math.ceil(duration / (60 * 60))}h`
              : duration / 60 >= 1
              ? `${Math.ceil(duration / 60)}m`
              : `${Math.ceil(duration)}s`;

          return (
            <div
              key={entry.id}
              className={`p-6 rounded-xl shadow-sm "bg-white"`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <TruckIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Veículo #{entry.carID.toString().slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Iniciado em:{" "}
                      {new Date(entry.startedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      status === "closed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {status === "closed" ? "Finalizado" : "Em andamento"}
                  </span>
                  {isDuplicate && (
                    <span className="px-2 py-1 text-sm bg-red-100 text-red-800 rounded-full flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Uso irregular
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span>{duration ? time : "Duração em andamento"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                    <span>
                      {entry.checkOut
                        ? `Finalizado em: ${new Date(
                            entry.endedAt
                          ).toLocaleDateString("pt-BR")}`
                        : "Aguardando check-out"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/car-entries/${entry.id}`}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    Ver detalhes
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {status === "loading" && (
          <div className="text-center py-8 text-gray-500">
            Carregando registros...
          </div>
        )}

        {carEntries.length === 0 && status === "succeeded" && (
          <div className="text-center py-8 text-gray-500">
            Nenhum registro encontrado
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            Erro ao carregar registros: {error.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarEntries;
