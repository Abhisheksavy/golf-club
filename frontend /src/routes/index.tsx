import { createBrowserRouter, Navigate } from "react-router-dom";
import { isAuthenticated } from "../hooks/useAuth";
import Login from "../pages/Login";
import Verify from "../pages/Verify";
import Dashboard from "../pages/Dashboard";
import BrowseClubs from "../pages/BrowseClubs";
import FavouriteSets from "../pages/FavouriteSets";
import FavouriteSetDetail from "../pages/FavouriteSetDetail";
import MyReservations from "../pages/MyReservations";
import RentalLayout from "../pages/rental/RentalLayout";
import SelectCourse from "../pages/rental/SelectCourse";
import SelectDate from "../pages/rental/SelectDate";
import SelectClubs from "../pages/rental/SelectClubs";
import RentalSummary from "../pages/rental/RentalSummary";
import RentalConfirmation from "../pages/rental/RentalConfirmation";
import AuthChoice from "../pages/rental/AuthChoice";
import GuestHandedness from "../pages/rental/GuestHandedness";
import GuestGender from "../pages/rental/GuestGender";
import GuestHeight from "../pages/rental/GuestHeight";
import ClubPreferenceChoice from "../pages/rental/ClubPreferenceChoice";
import PlayingLevel from "../pages/rental/PlayingLevel";
import SwingStrength from "../pages/rental/SwingStrength";
import SavedBagSelect from "../pages/rental/SavedBagSelect";
import SavedBagReview from "../pages/rental/SavedBagReview";
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
        element: isAuthenticated()
          ? <Navigate to="/dashboard" replace />
          : <Navigate to="/reserve/course" replace />,
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
        path: "my-reservations",
        element: <MyReservations />,
      },
      {
        path: "reserve",
        element: <RentalLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/reserve/course" replace />,
          },
          { path: "course", element: <SelectCourse /> },
          { path: "date", element: <SelectDate /> },
          { path: "auth", element: <AuthChoice /> },
          { path: "handedness", element: <GuestHandedness /> },
          { path: "gender", element: <GuestGender /> },
          { path: "height", element: <GuestHeight /> },
          { path: "preference", element: <ClubPreferenceChoice /> },
          { path: "level", element: <PlayingLevel /> },
          { path: "strength", element: <SwingStrength /> },
          { path: "bag-select", element: <SavedBagSelect /> },
          { path: "bag-review", element: <SavedBagReview /> },
          { path: "clubs", element: <SelectClubs /> },
          { path: "summary", element: <RentalSummary /> },
          { path: "confirm", element: <RentalConfirmation /> },
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
