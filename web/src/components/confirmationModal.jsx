// src/components/ConfirmationModal.jsx
import React from "react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ConfirmationModal = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <div
      className={`fixed inset-0 bg-gray-100 bg-opacity-50 z-50 ${
        open ? "block" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
