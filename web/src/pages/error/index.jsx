import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate("/");
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow rounded text-center">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <p className="text-2xl font-semibold text-gray-800">
            Página não encontrada
          </p>
          <p className="text-gray-500">
            A página que você está procurando não existe ou foi movida.
          </p>

          <div className="pt-4">
            <p className="text-gray-600">
              Redirecionando para a página inicial em{" "}
              <span className="font-bold text-indigo-600">{countdown}</span>{" "}
              segundos...
            </p>
          </div>

          <div className="pt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Voltar agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
