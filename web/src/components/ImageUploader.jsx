// src/components/ImageUploader.jsx
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";

const ImageUploader = ({ onFilesChange }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.slice(0, 5 - files.length);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    },
    [files, onFilesChange]
  );

  const removeFile = (fileToRemove) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-indigo-600 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <DocumentArrowUpIcon className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Solte as imagens aqui"
              : "Arraste imagens ou clique para selecionar"}
          </p>
          <p className="text-xs text-gray-500">Máximo 5 imagens (JPEG, PNG)</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {files.map((file, index) => {
            const preview = URL.createObjectURL(file);
            return (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`preview-${index}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full p-1 items-center flex justify-center"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
