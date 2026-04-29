import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Sliply } from "./pages/Sliply";
import { PropertyPayments } from "./pages/PropertyPayments";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/sliply",
    Component: Sliply,
  },
  {
    path: "/sliply/property/:propertyId",
    Component: PropertyPayments,
  },
], {
  basename: "/BelongSliply", // <--- AÑADE ESTA LÍNEA AQUÍ
});