// src/pages/forms/CheckInForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkIn, postCheckInImages } from "@/store/slicers/carEntrySlicer";
import { getCars } from "@/store/slicers/carSlicer";
import { TruckIcon } from "@heroicons/react/24/outline";
import LocationInput from "../../components/LocationInput";
import ImageUploader from "../../components/ImageUploader";

const CheckInForm = () => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.carEntry);
  const { user } = useSelector((state) => state.auth);
  const { cars } = useSelector((state) => state.car);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    carID: "",
    checkIn: {
      location: { latitude: 0, longitude: 0 },
      nextLocation: "",
      carState: "",
      actualKM: "",
    },
  });

  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    dispatch(getCars("?active=true"));
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      ...formData,
      carID: formData.carID,
      userID: user.id,
      checkIn: {
        ...formData.checkIn,
        actualKM: parseFloat(formData.checkIn.actualKM),
      },
    };

    dispatch(checkIn(payload))
      .unwrap()
      .then((action) => {
        if (action?.id) {
          if (selectedFiles.length > 0) {
            const formDataImages = new FormData();
            selectedFiles.forEach((file) => {
              formDataImages.append("images", file);
            });

            dispatch(
              postCheckInImages({ entryId: action.id, data: formDataImages })
            ).then((response) => {
              if (response.error) {
                setUploadError("Erro ao enviar as imagens.");
                return;
              }
            });
          }

          setSuccessMessage("Check-In registrado com sucesso!");
          setFormData({
            carID: "",
            userID: "",
            checkIn: {
              location: { latitude: 0, longitude: 0 },
              nextLocation: "",
              carState: "",
              actualKM: "",
            },
          });
        }
      })
      .catch((err) => {
        setErrorMessage(err.error || "Erro ao registrar o Check-In");
      });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <TruckIcon className="w-8 h-8 text-indigo-600" />
        Check-In Veicular
      </h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {uploadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* <div>
            <label className="block text-sm font-medium mb-2">
              Usuário Responsável
            </label>
            <select
              required
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, userID: e.target.value })
              }
            >
              <option value="">Selecione o usuário</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div> */}

          <div>
            <label className="block text-sm font-medium mb-2">Veículo</label>
            <select
              required
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, carID: e.target.value })
              }
            >
              <option value="">Selecione o veículo</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.plate} - {car.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Localização Atual
          </label>
          <LocationInput
            onLocationUpdate={(loc) =>
              setFormData({
                ...formData,
                checkIn: { ...formData.checkIn, location: loc },
              })
            }
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Próximo Destino
            </label>
            <input
              required
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkIn: {
                    ...formData.checkIn,
                    nextLocation: e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estado do Veículo
            </label>
            <textarea
              required
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkIn: { ...formData.checkIn, carState: e.target.value },
                })
              }
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">KM Atual</label>
            <input
              required
              type="number"
              step="0.1"
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkIn: { ...formData.checkIn, actualKM: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Anexar Imagens (Máximo 5)
          </label>
          <ImageUploader onFilesChange={setSelectedFiles} />
        </div>

        <div className="border-t pt-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === "loading" ? "Registrando..." : "Finalizar Check-In"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckInForm;
