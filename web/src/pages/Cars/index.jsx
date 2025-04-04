// src/pages/Cars.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  getCars,
  deleteCar,
  enableCar,
  disableCar,
} from "@/store/slicers/carSlicer";
import CarForm from "@/pages/Cars/CarForm";
import ConfirmationModal from "@/components/ConfirmationModal";

const Cars = () => {
  const dispatch = useDispatch();
  const { cars, status, error } = useSelector((state) => state.car);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const query = `?search=${searchTerm}&active=${showActive}`;
    dispatch(getCars(query));
  }, [dispatch, searchTerm, showActive]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleStatus = async (carId, enable) => {
    if (enable) {
      await dispatch(enableCar(carId));
    } else {
      await dispatch(disableCar(carId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Veículos</h1>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Adicionar Carro
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar veículo..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showActive}
              onChange={(e) => setShowActive(e.target.checked)}
              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Mostrar ativos</span>
          </label>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Placa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Modelo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Consumo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Capacidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {cars.map((car) => (
                <tr key={car.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {car.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {car.plate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {car.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {car.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {car.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {car.consumption} km/l
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {car.capacity} L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        car.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {car.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        setShowForm(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    {car.isActive ? (
                      <button
                        onClick={() => toggleStatus(car.id, false)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleStatus(car.id, true)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {status === "loading" && (
          <div className="p-4 text-center text-gray-500">Carregando...</div>
        )}

        {cars.length === 0 && status === "succeeded" && (
          <div className="p-4 text-center text-gray-500">
            Nenhum veículo encontrado
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-500">
            Erro: {error.message || "Falha ao carregar dados"}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <CarForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedCar(null);
        }}
        carData={selectedCar}
      />

      {/* Modal de Confirmação */}
      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          dispatch(deleteCar(selectedCar?.id));
          setShowDeleteModal(false);
        }}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o veículo ${selectedCar?.plate}?`}
      />
    </div>
  );
};

export default Cars;
