// src/pages/CarEntryDetails.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeftIcon,
  ClockIcon,
  MapPinIcon,
  IdentificationIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { getCarEntry, deleteCarEntry } from "@/store/slicers/carEntrySlicer";
import ConfirmationModal from "@/components/ConfirmationModal";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MiniMap = ({ latitude, longitude }) => (
  <MapContainer
    center={[latitude, longitude]}
    zoom={13}
    scrollWheelZoom={false}
    className="h-64 rounded-lg z-0"
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={[latitude, longitude]}>
      <Popup>Localização do Registro</Popup>
    </Marker>
  </MapContainer>
);

const CarEntryDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { carEntry } = useSelector((state) => state.carEntry);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  useEffect(() => {
    dispatch(getCarEntry(id));
  }, [dispatch, id]);

  const handleDelete = () => {
    dispatch(deleteCarEntry(id));
    navigate("/car-entries");
  };

  function formatCNH(cnh) {
    return cnh.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1 $2 $3 $4");
  }

  if (!carEntry.id) return null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-800"
      >
        <ChevronLeftIcon className="w-5 h-5 mr-1" />
        Voltar
      </button>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Registro #{carEntry.id.toString().slice(-6)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Veículo #{carEntry.carID.toString().slice(-6)}
            </p>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:text-red-800"
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Check-in Section */}
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-500" />
            Check-in
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Data/Hora</p>
              <p className="font-medium">
                {new Date(carEntry.startedAt).toLocaleString("pt-BR")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Localização</p>
              <p className="font-medium flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {carEntry.checkIn.location.latitude.toFixed(6)},{" "}
                {carEntry.checkIn.location.longitude.toFixed(6)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Estado do Veículo</p>
              <p className="font-medium">{carEntry.checkIn.carState}</p>
            </div>

            <div className="md:row-span-4">
              <MiniMap
                latitude={carEntry.checkIn.location.latitude}
                longitude={carEntry.checkIn.location.longitude}
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">Local de destino</p>
              <p className="font-medium">{carEntry.checkIn.nextLocation}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Quilometragem inicial</p>
              <p className="font-medium">{carEntry.checkIn.actualKM}</p>
            </div>

            {carEntry.checkIn.images?.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-2">Imagens</p>
                <div className="grid grid-cols-3 gap-2">
                  {carEntry.checkIn.images.map((img, index) => (
                    <Zoom key={index}>
                      <img
                        src={img}
                        alt={`Check-in ${index + 1}`}
                        className="rounded-lg object-cover h-32 w-full"
                      />
                    </Zoom>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Check-out Section */}
        {carEntry.checkOut && (
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-green-500" />
              Check-out
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Data/Hora</p>
                <p className="font-medium">
                  {new Date(carEntry.endedAt).toLocaleString("pt-BR")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {carEntry.checkOut.location.latitude.toFixed(6)},{" "}
                  {carEntry.checkOut.location.longitude.toFixed(6)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Estado do Veículo</p>
                <p className="font-medium">{carEntry.checkOut.carState}</p>
              </div>

              <div className="md:row-span-4">
                <MiniMap
                  latitude={carEntry.checkOut.location.latitude}
                  longitude={carEntry.checkOut.location.longitude}
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">Quilometragem final</p>
                <p className="font-medium">{carEntry.checkOut.actualKM}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Distância percorrida</p>
                <p className="font-medium">{carEntry.kmDriven}</p>
              </div>

              {carEntry.checkOut.images?.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Imagens</p>
                  <div className="grid grid-cols-3 gap-2">
                    {carEntry.checkOut.images.map((img, index) => (
                      <Zoom key={index}>
                        <img
                          src={img}
                          alt={`Check-out ${index + 1}`}
                          className="rounded-lg object-cover h-32 w-full"
                        />
                      </Zoom>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <IdentificationIcon className="w-5 h-5 text-indigo-500" />
            Motorista
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-medium">{carEntry.user.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{carEntry.user.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">CNH</p>
              <p className="font-medium">{formatCNH(carEntry.user.cnh)}</p>
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {carEntry.deviceInfo.deviceType === "Mobile" ? (
              <DevicePhoneMobileIcon className="w-5 h-5 text-purple-500" />
            ) : (
              <ComputerDesktopIcon className="w-5 h-5 text-purple-500" />
            )}
            Dispositivo
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Sistema Operacional</p>
              <p className="font-medium">{carEntry.deviceInfo.os}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Navegador</p>
              <p className="font-medium">{carEntry.deviceInfo.browser}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tipo de Dispositivo</p>
              <p className="font-medium">{carEntry.deviceInfo.deviceType}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Endereço IP</p>
              <p className="font-medium">{carEntry.deviceInfo.ipAddress}</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Registro"
        message="Tem certeza que deseja excluir este registro permanentemente?"
      />
    </div>
  );
};

export default CarEntryDetails;
