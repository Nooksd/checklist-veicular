import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  DocumentPlusIcon,
  CheckCircleIcon,
  TruckIcon,
  FireIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Forms = () => {
  const forms = [
    {
      id: 1,
      title: "Check-in Veicular",
      icon: TruckIcon,
      status: "Ativo",
      route: "/forms/check-in",
      date: new Date().toLocaleDateString("pt-BR"),
    },
    {
      id: 2,
      title: "Check-out Veicular",
      icon: CheckCircleIcon,
      status: "Ativo",
      route: "/forms/check-out",
      date: new Date().toLocaleDateString("pt-BR"),
    },
    {
      id: 3,
      title: "Abastecimento",
      icon: FireIcon,
      status: "Ativo",
      route: "/forms/fuel-in",
      date: new Date().toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Formulários Disponíveis
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecione um formulário para iniciar o preenchimento
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/forms/create" // Futura rota de criação
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <DocumentPlusIcon className="w-5 h-5 mr-2" />
            Novo Formulário
          </Link>
        </div>
      </div>

      {/* Grid de Formulários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <form.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="px-2 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                {form.status}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {form.title}
            </h3>

            <div className="flex items-center text-sm text-gray-500 mb-6">
              <ClockIcon className="w-4 h-4 mr-2" />
              Criado em: {form.date}
            </div>

            <Link
              to={form.route}
              className="flex items-center justify-between px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <span>Acessar Formulário</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Futuro espaço para novos formulários */}
      <div className="mt-8 text-center text-gray-500">
        <p>Total de formulários cadastrados: {forms.length}</p>
      </div>
    </div>
  );
};

export default Forms;
