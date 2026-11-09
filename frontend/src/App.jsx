import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import MotionProvider from "@/components/motion/MotionProvider";
import AppRoutes from "@/routes/AppRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { logger } from "@/utils/logger";

function VisitorRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    logger.trackView(location.pathname, document.title);
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MotionProvider>
          <ConfirmProvider>
            <VisitorRouteTracker />
            <AppRoutes />
          </ConfirmProvider>
        </MotionProvider>
      </DataProvider>
    </AuthProvider>
  );
}
