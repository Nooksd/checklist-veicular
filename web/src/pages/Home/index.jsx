import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ClipboardDocumentIcon,
  UsersIcon,
  TruckIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { getStatistics } from "@/store/slicers/formsSlicer";

const StatCard = ({ icon: Icon, title, value, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
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
      value: 3,
      colorClass: "bg-blue-500",
    },
    {
      icon: UsersIcon,
      title: "Usuários Ativos",
      value: statistics.userCount || 0,
      colorClass: "bg-green-500",
    },
    {
      icon: TruckIcon,
      title: "Carros Registrados",
      value: statistics.carCount || 0,
      colorClass: "bg-indigo-500",
    },
    {
      icon: DocumentChartBarIcon,
      title: "Formulários Preenchidos",
      value: statistics.carEntryCount || 0,
      colorClass: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            colorClass={stat.colorClass}
          />
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Resumo de Atividades
        </h2>
        <p className="text-gray-500">
          Dados atualizados em tempo real - Última atualização: Agora
        </p>
      </div>
    </div>
  );
};

export default Home;
