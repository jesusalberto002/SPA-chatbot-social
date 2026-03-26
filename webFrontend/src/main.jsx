import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/authProvider.jsx"
import { ThemeProvider } from "./context/themeProvider.jsx"
import { ModalProvider } from "./context/modalContext.jsx"
import { CommunityProvider } from "./context/communityProvider";
import { TherapistProvider } from "./context/therapistProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./index.css"
import "react-toastify/dist/ReactToastify.css"
import "./themes/variables.css" 
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <TherapistProvider>
          <ThemeProvider>
            <ModalProvider>
              <CommunityProvider>
                <QueryClientProvider client={new QueryClient()}>
                  <App />
                </QueryClientProvider>
              </CommunityProvider>
            </ModalProvider>
          </ThemeProvider>
        </TherapistProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>,
)