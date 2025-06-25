// src/pages/forms/CheckOutForm.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkOut, postCheckOutImages } from "@/store/slicers/carEntrySlicer";
import { getCars } from "@/store/slicers/carSlicer";
// import { LocationInput } from "@/components/LocationInput";
import ImageUploader from "../../components/ImageUploader";
import imageCompression from "browser-image-compression";

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
};

const CheckOutForm = () => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.carEntry);
  const { user } = useSelector((state) => state.auth);
  const { cars } = useSelector((state) => state.car);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [locationError, setLocationError] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    carID: "",
    checkOut: {
      location: { latitude: 0, longitude: 0 },
      carState: "",
      actualKM: "",
    },
  });
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    dispatch(getCars("?active=true"));
  }, [dispatch]);

  useEffect(() => tryToGetLocation(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (locationError) {
      return;
    }

    const payload = {
      carID: formData.carID,
      userID: user.id,
      checkOut: {
        ...formData.checkOut,
        location: location,
        actualKM: parseFloat(formData.checkOut.actualKM),
      },
    };

    dispatch(checkOut(payload))
      .unwrap()
      .then(async (action) => {
        if (action?.id) {
          if (selectedFiles.length > 0) {
            const formDataImages = new FormData();
            const compressedFiles = await Promise.all(
              selectedFiles.map((file) => compressImage(file))
            );

            compressedFiles.forEach((file) => {
              formDataImages.append("images", file, file.name);
            });

            dispatch(
              postCheckOutImages({ entryId: action.id, data: formDataImages })
            ).then((response) => {
              if (response.error) {
                setUploadError("Erro ao enviar as imagens.");
                return;
              }
            });
          }

          setSuccessMessage("Check-Out registrado com sucesso!");
          setFormData({
            carID: "",
            userID: "",
            checkOut: {
              location: { latitude: 0, longitude: 0 },
              carState: "",
              actualKM: "",
            },
          });
        }
      })
      .catch((err) => {
        setErrorMessage(err.error || "Erro ao registrar o Check-Out");
      });
  };

  function tryToGetLocation() {
    if (!navigator.geolocation) {
      console.error("Geolocation API não suportada pelo navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (error) => {
        setLocationError(true);
        console.error("Erro ao obter localização:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Check-Out Veicular</h1>

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
              value={formData.userID}
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
              value={formData.carID}
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

        {/* <div>
          <label className="block text-sm font-medium mb-2">
            Localização Atual
          </label>
          <LocationInput
            onLocationUpdate={(loc) =>
              setFormData({
                ...formData,
                checkOut: { ...formData.checkOut, location: loc },
              })
            }
          />
        </div> */}

        <div className="space-y-4">
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
                  checkOut: { ...formData.checkOut, carState: e.target.value },
                })
              }
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">KM Final</label>
            <input
              required
              type="number"
              step="0.1"
              value={formData.checkOut.actualKM}
              className="w-full p-2 border rounded-lg"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  checkOut: { ...formData.checkOut, actualKM: e.target.value },
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
            disabled={status === "loading" || locationError}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === "loading" ? "Registrando..." : "Finalizar Check-Out"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckOutForm;
