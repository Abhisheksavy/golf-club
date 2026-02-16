import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { router } from "./routes";
import { ToastContainer } from "react-toastify";

function App() {
  return (
   
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
         <ToastContainer position="top-right" autoClose={3000} />
      </QueryClientProvider>
   
  );
}

export default App;
