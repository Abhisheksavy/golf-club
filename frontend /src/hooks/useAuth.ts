import { useMutation } from "@tanstack/react-query";
import { requestMagicLink, verifyMagicLink, loginWithPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useRequestMagicLink = () => {
  return useMutation({
    mutationFn: (email: string) => requestMagicLink(email),
    onSuccess: (data) => {
     
      
      toast.success(data.message);
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
};

export const useVerifyMagicLink = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (token: string) => verifyMagicLink(token),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const returnTo = sessionStorage.getItem("returnTo");
      if (returnTo) {
        sessionStorage.removeItem("returnTo");
        navigate(returnTo);
      } else {
        navigate("/dashboard");
      }
    },
  });
};

export const usePasswordLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginWithPassword(email, password),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const returnTo = sessionStorage.getItem("returnTo");
      if (returnTo) {
        sessionStorage.removeItem("returnTo");
        navigate(returnTo);
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Login failed");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return logout;
};

export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  if (import.meta.env.VITE_SKIP_AUTH === "true") return true;
  return !!localStorage.getItem("token");
};
