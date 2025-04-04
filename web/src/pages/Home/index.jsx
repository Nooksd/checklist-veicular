import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ClipboardDocumentIcon,
  UsersIcon,
  TruckIcon,
  ArrowRightIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { getStatistics } from "@/store/slicers/formsSlicer";

const StatCard = ({ icon: Icon, title, path, value, colorClass }) => (
  <Link
    to={path}
    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </Link>
);

const Home = () => {
  const dispatch = useDispatch();
  const { statistics, status, error } = useSelector((state) => state.forms);

  useEffect(() => {
    dispatch(getStatistics());
  }, [dispatch]);

  if (status === "loading") {
    return (
      <div className="text-center py-8 text-gray-500">
        Carregando estatísticas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Erro ao carregar dados: {error}
      </div>
    );
  }

  const stats = [
    {
      icon: ClipboardDocumentIcon,
      title: "Tipos de Formulários",
      path: "/forms",
      value: 3,
      colorClass: "bg-blue-500",
    },
    {
      icon: UsersIcon,
      title: "Usuários Ativos",
      path: "/users",
      value: statistics.userCount || 0,
      colorClass: "bg-green-500",
    },
    {
      icon: TruckIcon,
      title: "Carros Registrados",
      path: "/cars",
      value: statistics.carCount || 0,
      colorClass: "bg-indigo-500",
    },
    {
      icon: DocumentChartBarIcon,
      title: "Formulários Preenchidos",
      path: "/car-entries",
      value: statistics.carEntryCount || 0,
      colorClass: "bg-purple-500",
    },
  ];

  const CarCard = ({ car }) => {
    const fuelPercentage = Math.min(
      Math.max((car.currentFuel / car.capacity) * 100, 0),
      100
    ).toFixed(0);

    const status = car.checkout === null ? "Em Uso" : "Parado";
    const statusColor =
      car.checkout === null
        ? "bg-yellow-100 text-yellow-800"
        : "bg-green-100 text-green-800";

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 ${statusColor} rounded-lg`}>
              <TruckIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {car.model}
              </h3>
              <p className="text-sm text-gray-500">{car.plate}</p>
            </div>
          </div>
          <span
            className={`px-2 py-1 text-sm font-medium rounded-full ${statusColor}`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-5">
          <div>
            <p className="text-gray-500">Marca</p>
            <p className="font-medium">{car.brand}</p>
          </div>
          <div>
            <p className="text-gray-500">Ano</p>
            <p className="font-medium">{car.year}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Combustível</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  fuelPercentage > 20
                    ? "bg-green-500"
                    : fuelPercentage > 10
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${fuelPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {car.currentFuel?.toFixed(1) || 0}L / {car.capacity}L (
              {fuelPercentage}%)
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Seção anterior de estatísticas permanece igual */}

      <div className="space-y-6 mb-15">
        <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              path={stat.path}
              value={stat.value}
              colorClass={stat.colorClass}
            />
          ))}
        </div>
      </div>

      {/* Nova seção de Frota de Veículos */}

      <h2 className="text-2xl font-bold text-gray-800">Frota de Veículos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statistics.cars?.map((car, index) => (
          <CarCard key={index} car={car} />
        ))}
      </div>

      {statistics.cars?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum veículo registrado
        </div>
      )}
    </div>
  );
};

export default Home;
