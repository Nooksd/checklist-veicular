import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "@/store/slicers/authSlicer";
import { useSelector, useDispatch } from "react-redux";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Users from "../pages/Users";
import Forms from "../pages/Forms";
import Cars from "../pages/Cars";
import AdminLayout from "@/components/AdminLayout";
import NotFound from "../pages/error";
import CarEntries from "../pages/Entries";
import CarEntryDetails from "../pages/Entries/entryDetails";
import CheckInForm from "../pages/Forms/checkin";
import CheckOutForm from "../pages/Forms/checkout";
import FuelForm from "../pages/Forms/fuelin";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
        console.error("Erro ao renovar token:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [dispatch, user]);

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const AdminRoute = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [dispatch, user]);

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.userType !== "ADMIN") return <Navigate to="/" replace />;

  return children;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <AdminRoute>
              <AdminLayout>
                <Home />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/Users"
          element={
            <AdminRoute>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/forms"
          element={
            <AdminRoute>
              <AdminLayout>
                <Forms />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/car-entries"
          element={
            <AdminRoute>
              <AdminLayout>
                <CarEntries />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/car-entries/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <CarEntryDetails />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/cars"
          element={
            <AdminRoute>
              <AdminLayout>
                <Cars />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/forms/check-in"
          element={
            <ProtectedRoute>
              <CheckInForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms/check-out"
          element={<ProtectedRoute>{/* <CheckOutForm /> */}</ProtectedRoute>}
        />
        <Route
          path="/forms/fuel-in"
          element={
            <ProtectedRoute>
              <FuelForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
