// src/components/UserForm.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  XMarkIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { createUser, updateUser } from "@/store/slicers/userSlicer";
import { useForm } from "react-hook-form";

const UserForm = ({ open, onClose, userData }) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.user);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (userData) {
      reset({ ...userData, password: "" });
    } else {
      reset({
        name: "",
        email: "",
        cnh: "",
        password: "",
        userType: "USER",
        isActive: true,
      });
    }
  }, [userData, reset]);

  const onSubmit = (data) => {
    const payload = userData ? { id: userData.id, ...data } : data;

    if (userData) {
      dispatch(updateUser(payload));
    } else {
      dispatch(createUser(payload));
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
              {userData ? "Editar Usuário" : "Novo Usuário"}
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
                Nome *
              </label>
              <input
                {...register("name", { required: true })}
                className={`mt-1 block w-full rounded-md border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                {...register("email", { required: true })}
                className={`mt-1 block w-full rounded-md border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                CNH *
              </label>
              <input
                {...register("cnh", {
                  required: true,
                  pattern: /^\d{11}$/,
                })}
                className={`mt-1 block w-full rounded-md border ${
                  errors.cnh ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                placeholder="11 dígitos numéricos"
              />
              {errors.cnh && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-1" />
                  CNH deve conter exatamente 11 dígitos
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo *
                </label>
                <select
                  {...register("userType")}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="USER">
                    {/* <UserCircleIcon className="w-4 h-4 mr-2 inline" /> */}
                    Usuário
                  </option>
                  <option value="ADMIN">
                    {/* <ShieldCheckIcon className="w-4 h-4 mr-2 inline" /> */}
                    Administrador
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {userData ? "Nova Senha" : "Senha *"}
                </label>
                <input
                  type="password"
                  {...register("password", {
                    required: !userData,
                    minLength: 5,
                    maxLength: 60,
                  })}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    Senha deve ter entre 5 e 60 caracteres
                  </p>
                )}
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

export default UserForm;
