import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-golf-dark flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
     
    </div>
  );
};

export default AppLayout;
