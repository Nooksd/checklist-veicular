// src/pages/Users.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  getUsers,
  deleteUser,
  enableUser,
  disableUser,
} from "@/store/slicers/userSlicer";
import UserForm from "@/pages/Users/UserForm";
import ConfirmationModal from "@/components/ConfirmationModal";

const Users = () => {
  const dispatch = useDispatch();
  const { users, status, error } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActive, setShowActive] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const query = `?search=${searchTerm}&active=${showActive}`;
    dispatch(getUsers(query));
  }, [dispatch, searchTerm, showActive]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleStatus = async (userId, enable) => {
    if (enable) {
      await dispatch(enableUser(userId));
    } else {
      await dispatch(disableUser(userId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h1>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar usuários..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CNH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {user.cnh}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      {user.userType === "ADMIN" ? (
                        <ShieldCheckIcon className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <UserCircleIcon className="w-4 h-4 text-gray-600" />
                      )}
                      {user.userType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowForm(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => toggleStatus(user.id, false)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleStatus(user.id, true)}
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

        {users.length === 0 && status === "succeeded" && (
          <div className="p-4 text-center text-gray-500">
            Nenhum usuário encontrado
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-500">
            Erro: {error.message || "Falha ao carregar dados"}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <UserForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedUser(null);
        }}
        userData={selectedUser}
      />

      {/* Modal de Confirmação */}
      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          dispatch(deleteUser(selectedUser?.id));
          setShowDeleteModal(false);
        }}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o usuário ${selectedUser?.name}?`}
      />
    </div>
  );
};

export default Users;
