import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/slicers/authSlicer";
import { Navigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const { user, status } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepConnection: false,
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow rounded">
        <h2 className="text-center text-2xl font-bold text-gray-900">Login</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-600 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-600 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
            </div>
          </div>

          {/* Checkbox "Manter login" */}
          <div className="flex items-center">
            <input
              id="keepConnection"
              name="keepConnection"
              type="checkbox"
              checked={formData.keepConnection}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
            />
            <label
              htmlFor="keepConnection"
              className="ml-2 block text-sm text-gray-900"
            >
              Manter login
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            >
              {status === "loading" ? "Carregando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
