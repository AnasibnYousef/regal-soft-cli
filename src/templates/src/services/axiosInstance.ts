import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_PUBLIC_API_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = async (): Promise<string | null> => {
  const token = localStorage.getItem("accessToken");
  return token;
};

const getRefreshToken = async (): Promise<string | null> => {
  const token = localStorage.getItem("refreshToken");
  return token;
};

const saveTokens = async (
  access_token: string,
  refresh_token: string
): Promise<void> => {
  localStorage.setItem("accessToken", access_token);
  localStorage.setItem("refreshToken", refresh_token);
};

export const removeTokens = async (): Promise<void> => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (!token) {
      const refresh_token = await getRefreshToken();
      if (refresh_token) {
        try {
          const response = await axios.post<TokenResponse>(
            `${import.meta.env.VITE_PUBLIC_API_URL}/auth/exchange`,
            { refresh_token }
          );
          const { access_token } = response.data;
          await saveTokens(access_token, refresh_token);
          config.headers.Authorization = `Bearer ${access_token}`;
        } catch (err) {
          await removeTokens();
          console.error("Token refresh failed, redirecting:", err);
          window.location.href = `${window.location.origin}/redirect`;
          return Promise.reject(err);
        }
      } else {
        await removeTokens();
        console.error("No refresh token available, redirecting");
        window.location.href = `${window.location.origin}/redirect`;
        return Promise.reject(new Error("No refresh token available"));
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh_token = await getRefreshToken();
        if (!refresh_token) {
          console.error("No refresh token available, redirecting");
          window.location.href = `${window.location.origin}/redirect`;
          return Promise.reject(error);
        }
        const response = await axios.post<TokenResponse>(
          `${import.meta.env.VITE_PUBLIC_API_URL}/auth/exchange`,
          { refresh_token }
        );
        const { access_token } = response.data;
        await saveTokens(access_token, refresh_token);
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (err) {
        console.error("Token refresh failed, redirecting:", err);
        window.location.href = `${window.location.origin}/redirect`;
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
