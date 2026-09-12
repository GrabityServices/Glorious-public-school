import MotionProvider from "@/components/motion/MotionProvider";
import AppRoutes from "@/routes/AppRoutes";

export default function App() {
  return (
    <MotionProvider>
      <AppRoutes />
    </MotionProvider>
  );
}
