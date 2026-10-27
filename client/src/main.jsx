import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider><Toaster position="top-right" /></BrowserRouter></React.StrictMode>
);
