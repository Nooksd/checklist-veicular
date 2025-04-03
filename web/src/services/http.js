import axios from "axios";
import { refreshAccessToken } from "@/store/slicers/authSlicer";
import store from "@/store";

export const formsApi = axios.create({
  baseURL: "http://localhost:9900/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "http://localhost:9900",
  },
});

formsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await store.dispatch(refreshAccessToken()).unwrap();

        return formsApi(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
