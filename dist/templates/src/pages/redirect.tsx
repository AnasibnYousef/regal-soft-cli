import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";

const refreshToken = async (refreshToken: string) => {
  localStorage.setItem("refreshToken", refreshToken);
  const response = await axios.post(
    `${import.meta.env.VITE_PUBLIC_API_URL}/auth/exchange`,
    { refresh_token: refreshToken }
  );
  const data = {
    access_token: response.data.access_token,
    refresh_token: refreshToken,
  };
  return data;
};

const RedirectPage = () => {
  const navigate = useNavigate();
  const { mutateAsync: refreshTokenMutate } = useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.access_token);
      navigate("/");
    },
    onError: () => {
      window.location.href = `${
        import.meta.env.VITE_PUBLIC_ACCOUNTS_DOMAIN
      }/logout?redirect_url=${window.location.origin}/redirect`;
    },
  });

  const handleRedirectLogic = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const refreshTokenFromUrl = queryParams.get("tkn");

    if (refreshTokenFromUrl) {
      await refreshTokenMutate(refreshTokenFromUrl);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = `${
        import.meta.env.VITE_PUBLIC_ACCOUNTS_DOMAIN
      }/logout?redirect_url=${window.location.origin}/redirect`;
    }
  };

  useEffect(() => {
    handleRedirectLogic();
  }, []);

  return (
    <div>
      <p>Processing your login...</p>
    </div>
  );
};

export default RedirectPage;
