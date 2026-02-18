import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Verify from "../pages/Verify";
import Dashboard from "../pages/Dashboard";
import BrowseClubs from "../pages/BrowseClubs";
import FavouriteSets from "../pages/FavouriteSets";
import FavouriteSetDetail from "../pages/FavouriteSetDetail";
import RentalLayout from "../pages/rental/RentalLayout";
import SelectCourse from "../pages/rental/SelectCourse";
import SelectDate from "../pages/rental/SelectDate";
import SelectClubs from "../pages/rental/SelectClubs";
import RentalSummary from "../pages/rental/RentalSummary";
import RentalConfirmation from "../pages/rental/RentalConfirmation";
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
        path: "browse-clubs",
        element: <BrowseClubs />,
      },
      {
        path: "my-bags",
        element: <FavouriteSets />,
      },
      {
        path: "my-bags/:setId",
        element: <FavouriteSetDetail />,
      },
      {
        path: "reserve",
        element: <RentalLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/reserve/course" replace />,
          },
          {
            path: "course",
            element: <SelectCourse />,
          },
          {
            path: "date",
            element: <SelectDate />,
          },
          {
            path: "clubs",
            element: <SelectClubs />,
          },
          {
            path: "summary",
            element: <RentalSummary />,
          },
          {
            path: "confirm",
            element: <RentalConfirmation />,
          },
        ],
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
