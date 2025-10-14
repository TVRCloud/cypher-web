import axios, { AxiosError, AxiosInstance } from "axios";

const withoutAuth = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: "",
    timeout: 60000, // 60 seconds
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("[API ERROR]", error);
      throw new AxiosError(
        error.response?.data?.message || "API request failed",
        error.code,
        error.config,
        error.request,
        error.response
      );
    }
  );

  return instance;
};

export const publicClient = withoutAuth();
