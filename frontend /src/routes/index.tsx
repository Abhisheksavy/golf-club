import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Verify from "../pages/Verify";
import Dashboard from "../pages/Dashboard";
import FavouriteSets from "../pages/FavouriteSets";
import FavouriteSetDetail from "../pages/FavouriteSetDetail";
import NotFound from "../pages/NotFound";
// import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      // <ProtectedRoute>
        <AppLayout />
      // </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "my-sets",
        element: <FavouriteSets />,
      },
      {
        path: "my-sets/:setId",
        element: <FavouriteSetDetail />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/verify",
    element: <Verify />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
