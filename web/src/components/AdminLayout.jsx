import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slicers/authSlicer";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  TruckIcon,
  DocumentChartBarIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-64"></div>
      <aside className="w-64 h-screen bg-white shadow-md flex fixed flex-col border-r border-gray-200">
        <div className="p-6 text-center mb-4">
          {/* <h1 className="text-xl font-semibold text-indigo-600">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Painel de Controle</p> */}
          <img
            src="/assets/innova-energy.png"
            alt="Logo"
            className="w-32 mx-auto"
          />
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            to="/"
            className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
          >
            <HomeIcon className="w-5 h-5 mr-3 group-hover:text-indigo-600" />
            Home
          </Link>

          <Link
            to="/forms"
            className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
          >
            <DocumentTextIcon className="w-5 h-5 mr-3 group-hover:text-indigo-600" />
            Formulários
          </Link>

          <Link
            to="/car-entries"
            className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
          >
            <DocumentChartBarIcon className="w-5 h-5 mr-3 group-hover:text-indigo-600" />
            Entradas
          </Link>

          <Link
            to="/cars"
            className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
          >
            <TruckIcon className="w-5 h-5 mr-3 group-hover:text-indigo-600" />
            Carros
          </Link>

          <Link
            to="/Users"
            className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
          >
            <UsersIcon className="w-5 h-5 mr-3 group-hover:text-indigo-600" />
            Usuários
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <ArrowLeftEndOnRectangleIcon className="w-5 h-5 mr-2" />
            Sair da Conta
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
