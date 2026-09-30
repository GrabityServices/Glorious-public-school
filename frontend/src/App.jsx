import MotionProvider from "@/components/motion/MotionProvider";
import AppRoutes from "@/routes/AppRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ConfirmProvider } from "@/context/ConfirmContext";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MotionProvider>
          <ConfirmProvider>
            <AppRoutes />
          </ConfirmProvider>
        </MotionProvider>
      </DataProvider>
    </AuthProvider>
  );
}
