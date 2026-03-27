"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react"

import { useTheme } from "./context/themeContext"

import FrontPage from "./pages/FrontPage/FrontPage"
import SubscriptionPage from "./pages/FrontPage/SubscriptionPage"
import LoginPage from "./pages/FrontPage/loginPage"
import MultiStepRegisterPage from "./pages/FrontPage/registerPage"
import HomePage from "./pages/AppPages/homePage"
import PaymentSuccess from "./pages/FrontPage/paymentSuccess"

import ProtectedRoute from "./services/protectedRoutes"
import PublicRoute from "./services/publicRoutes"
import AdminRoute from "./services/adminRoutes"
import { PresentationPage } from "./features/presentation-card"

function App() {
  const { theme } = useTheme()

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 status-success" />
      case "error":
        return <XCircle className="w-5 h-5 status-error" />
      case "info":
        return <Info className="w-5 h-5 status-info" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 status-warning" />
      default:
        return null
    }
  }

  return (
    <div className="main-container">
      <Routes>
        <Route path="/" element={<PresentationPage />} />
        <Route path="/presentation" element={<Navigate to="/" replace />} />
        <Route path="/app" element={<FrontPage />} />
        <Route path="/subscriptions" element={<SubscriptionPage />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register-flow" element={<MultiStepRegisterPage />}>
              {/* Nested routes for each step if /register-flow is hit */}
              <Route path="/register-flow/details" element={<MultiStepRegisterPage />} />
              <Route path="/register-flow/password" element={<MultiStepRegisterPage />} />
              <Route path="/register-flow/interests" element={<MultiStepRegisterPage />} />
              <Route path="/register-flow/avatar" element={<MultiStepRegisterPage />} />
              <Route path="/register-flow/payment" element={<MultiStepRegisterPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Route>
        <Route element={<AdminRoute />}></Route>
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={true} // Set to true to remove the countdown bar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
        toastClassName="toast-container"
        bodyClassName="toast-body"
        icon={({ type }) => getIcon(type)}
        // closeButton={({ closeToast }) => (
        //   <button onClick={closeToast} className="toast-close-button">
        //     <XCircle className="w-4 h-4" />
        //   </button>
        // )}
      />
    </div>
  )
}

export default App