import api from "./client";

// Obtener todos los empleados
export const listEmpleados = () => api.get("/api/empleados");

// Obtener un empleado por ID
export const getEmpleado = (id) => api.get(`/api/empleados/${id}`);

// Crear un nuevo empleado
export const createEmpleado = (payload) => api.post("/api/empleados", payload);

// Actualizar un empleado existente
export const updateEmpleado = (id, payload) => api.put(`/api/empleados/${id}`, payload);

// Eliminar un empleado
export const deleteEmpleado = (id) => api.delete(`/api/empleados/${id}`);
