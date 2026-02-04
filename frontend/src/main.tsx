import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import axios from "axios";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import theme from "./theme";

// Configure axios base URL for API calls
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
