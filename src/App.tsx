import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Accounting from "./pages/Accounting";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<Layout />}>
              <Route 
                path="/" 
                element={
                  <ProtectedRoute requiredPermission="inventory:read">
                    <Inventory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales" 
                element={
                  <ProtectedRoute requiredPermission="sales:read">
                    <Sales />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/purchases" 
                element={
                  <ProtectedRoute requiredPermission="purchases:read">
                    <Purchases />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/expenses" 
                element={
                  <ProtectedRoute requiredPermission="expenses:read">
                    <Expenses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute requiredPermission="reports:read">
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accounting" 
                element={
                  <ProtectedRoute requiredPermission="accounting:read">
                    <Accounting />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customers" 
                element={
                  <ProtectedRoute requiredPermission="customers:read">
                    <Customers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/suppliers" 
                element={
                  <ProtectedRoute requiredPermission="suppliers:read">
                    <Suppliers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requiredPermission="settings:read">
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
