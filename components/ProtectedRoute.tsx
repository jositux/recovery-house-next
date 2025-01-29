import { useEffect } from "react";
import { useRouter } from "next/router";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      // Redirige al login si no hay token
      router.push("/login");
    }
  }, [router]);

  return {children};
};

export default ProtectedRoute;
