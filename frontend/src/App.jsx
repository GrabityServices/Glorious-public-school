import MotionProvider from "@/components/motion/MotionProvider";
import AppRoutes from "@/routes/AppRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MotionProvider>
          <AppRoutes />
        </MotionProvider>
      </DataProvider>
    </AuthProvider>
  );
}
