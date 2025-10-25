import api from "./client";

export const listMarcaciones = ({ desde, hasta, id_empleado } = {}) =>
  api.get("/api/marcaciones", { params: { desde, hasta, id_empleado } });

export const createMarcacion = (payload) =>
  api.post("/api/marcaciones", payload);

export const actualizarSalida = (id_marcacion, { hora_salida, observacion }) =>
  api.patch(`/api/marcaciones/${id_marcacion}/salida`, {
    hora_salida,
    observacion,
  });

export const findMarcacionAbierta = (rows, id_empleado, fechaISO) =>
  (rows || []).find(
    (r) =>
      String(r.id_empleado) === String(id_empleado) &&
      r.fecha_marcacion === fechaISO &&
      (r.hora_salida === null || r.hora_salida === undefined)
  );
