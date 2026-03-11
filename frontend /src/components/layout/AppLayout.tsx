import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { RentalProvider } from "../../context/RentalContext";

const AppLayout = () => {
  return (
    <RentalProvider>
      <div className="min-h-screen bg-golf-dark flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </RentalProvider>
  );
};

export default AppLayout;
