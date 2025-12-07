const API_FALLBACK = "http://127.0.0.1:8000";

const backendBase = (process.env.NEXT_PUBLIC_API_URL || API_FALLBACK).replace(/\/$/, "");

export const backendBaseUrl = () => backendBase;

export const buildBackendUrl = (path: string) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${backendBase}${cleanPath}`;
};

export const getDisplayEmail = (user: any) => user?.email || user?.correo || "";

export const userIsEmpleado = (user: any) => {
  try {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;
    const email = getDisplayEmail(user).toString().toLowerCase();

    if (user.rol && typeof user.rol === "object") {
      const nombre = (user.rol.nombre_rol || user.rol.nombre || "").toString().toLowerCase();
      if (nombre.includes("empleado")) return true;
    }

    if (typeof user.rol === "string" && user.rol.toLowerCase().includes("empleado")) return true;
    if (user.role && typeof user.role === "string" && user.role.toLowerCase().includes("empleado")) return true;
    if (user.role_name && typeof user.role_name === "string" && user.role_name.toLowerCase().includes("empleado")) return true;
    if (user.is_empleado) return true;

    const raw = (process.env.NEXT_PUBLIC_EMPLEADO_EMAILS || "").toString();
    if (raw && email) {
      const items = raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      for (const it of items) {
        if (it.startsWith("@")) {
          if (email.endsWith(it)) return true;
        } else if (it.includes("@")) {
          if (email === it) return true;
        } else if (email.includes(it)) {
          return true;
        }
      }
    }

    const devFallback = ["admin@admin.cl"];
    if (email && devFallback.includes(email)) return true;

    return false;
  } catch {
    return false;
  }
};
