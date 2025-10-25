import api from "./client";

export const login = (usuario, clave) =>
  api.post("/api/auth/login", { usuario, clave });
