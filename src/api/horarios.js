import api from "./client";

// Obtener lista de horarios
export const listHorarios = () => api.get("/api/horarios");

// Crear nuevo horario
export const createHorario = (payload) => api.post("/api/horarios", payload);

// Actualizar horario existente
export const updateHorario = (id, payload) => api.put(`/api/horarios/${id}`, payload);

// Eliminar horario
export const deleteHorario = (id) => api.delete(`/api/horarios/${id}`);
