import { useEffect, useMemo, useState } from "react";
import { Typography, Select, Button, Table, DatePicker, TimePicker, Space, message, Modal, Form, Input } from "antd";
import dayjs from "dayjs";
import { listMarcaciones, createMarcacion, actualizarSalida, findMarcacionAbierta } from "../api/marcaciones";
import { listEmpleados } from "../api/empleados";
import { listHorarios } from "../api/horarios";

export default function MarcacionesPage() {
    const [rows, setRows] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [idEmpleado, setIdEmpleado] = useState(null);

    const [desde, setDesde] = useState(dayjs().startOf("day"));
    const [hasta, setHasta] = useState(dayjs().endOf("day"));

    // Modal para registrar entrada/salida manualmente
    const [open, setOpen] = useState(false);
    const [tipo, setTipo] = useState("entrada");
    const [form] = Form.useForm();

    const fechaISO = useMemo(() => (form.getFieldValue("fecha") || dayjs()).format("YYYY-MM-DD"), [form]);

    const fetchAll = async () => {
        try {
            const [e, h] = await Promise.all([listEmpleados(), listHorarios()]);
            setEmpleados(e.data || []);
            setHorarios(h.data || []);
        } catch {
            message.error("No se pudieron cargar catálogos");
        }
        await fetchMarcaciones();
    };

    const fetchMarcaciones = async () => {
        if (!desde || !hasta) return;
        try {
            const res = await listMarcaciones({
                desde: desde.format("YYYY-MM-DD"),
                hasta: hasta.format("YYYY-MM-DD"),
                id_empleado: idEmpleado || undefined,
            });
            setRows(res.data || []);
        } catch {
            message.error("No se pudieron cargar marcaciones");
        }
    };

    useEffect(() => { fetchAll(); }, []);
    useEffect(() => { fetchMarcaciones(); /* cada vez que cambien filtros */ }, [desde, hasta, idEmpleado]);

    const columns = [
        { title: "Empleado", dataIndex: "empleado", render: (_, r) => r.empleado_nombre || `${r.nombres ?? ""} ${r.apellidos ?? ""}` },
        { title: "Fecha", dataIndex: "fecha_marcacion", render: v => v ? dayjs(v).format("DD/MM/YYYY") : "—" },
        { title: "Hora Entrada", dataIndex: "hora_entrada" },
        { title: "Hora Salida", dataIndex: "hora_salida" },
        { title: "Observación", dataIndex: "observacion" },
    ];

    const openModal = (t) => {
        if (!idEmpleado) {
            message.warning("Selecciona un empleado");
            return;
        }
        setTipo(t);
        setOpen(true);
        form.resetFields();
        form.setFieldsValue({
            id_empleado: idEmpleado,
            id_horario: undefined,
            fecha: dayjs(),
            hora: dayjs(),
            observacion: undefined,
        });
    };

    const onSubmit = async () => {
        try {
            const vals = await form.validateFields();
            const fecha = vals.fecha.format("YYYY-MM-DD");
            const hora = vals.hora.format("HH:mm:ss");

            if (tipo === "entrada") {
                // Crear marcación con hora_entrada
                await createMarcacion({
                    id_empleado: vals.id_empleado,
                    id_horario: vals.id_horario || null,
                    fecha_marcacion: fecha,
                    hora_entrada: hora,
                    observacion: vals.observacion || null,
                });
                message.success("Entrada registrada");
            } else {
                // Cerrar la marcación abierta (misma fecha, salida null)
                const abierta = findMarcacionAbierta(rows, vals.id_empleado, fecha);
                if (!abierta) {
                    message.error("No hay marcación de entrada abierta para esta fecha");
                    return;
                }
                await actualizarSalida(abierta.id_marcacion, {
                    hora_salida: hora,
                    observacion: vals.observacion || null,
                });
                message.success("Salida registrada");
            }

            setOpen(false);
            fetchMarcaciones();
        } catch (e) {
            if (!e?.errorFields) message.error("No se pudo guardar la marcación");
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <Typography.Title level={2}>Marcaciones</Typography.Title>
                <Typography.Paragraph className="page-subtitle">
                    Filtra por rango de fechas (requerido por la API) y usa las acciones para registrar entradas/salidas.
                </Typography.Paragraph>
            </div>

            <div className="page-toolbar">
                <Select
                    style={{ minWidth: 260 }}
                    placeholder="Selecciona empleado (opcional)"
                    allowClear
                    value={idEmpleado ?? undefined}
                    onChange={setIdEmpleado}
                    options={(empleados || []).map(e => ({
                        value: e.id_empleado,
                        label: `${e.nombres} ${e.apellidos}`,
                    }))}
                />
                <DatePicker value={desde} onChange={setDesde} allowClear={false} />
                <DatePicker value={hasta} onChange={setHasta} allowClear={false} />
                <Space>
                    <Button onClick={fetchMarcaciones}>Consultar</Button>
                    <Button type="primary" onClick={() => openModal("entrada")}>Marcar entrada</Button>
                    <Button onClick={() => openModal("salida")}>Marcar salida</Button>
                </Space>
            </div>

            <div className="page-card">
                <Table
                    dataSource={rows}
                    columns={columns}
                    rowKey={(r, i) => r.id_marcacion ?? i}
                />
            </div>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={onSubmit}
                okText="Guardar"
                title={tipo === "entrada" ? "Registrar entrada" : "Registrar salida"}
                destroyOnClose
            >
                <Form layout="vertical" form={form}>
                    <Form.Item name="id_empleado" label="Empleado" rules={[{ required: true }]}>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={(empleados || []).map(e => ({
                                value: e.id_empleado,
                                label: `${e.nombres} ${e.apellidos}`,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item name="id_horario" label="Horario (opcional)">
                        <Select
                            allowClear
                            placeholder="Selecciona horario"
                            options={(horarios || []).map(h => ({
                                value: h.id_horario,
                                label: `${h.descripcion} (${h.hora_entrada} - ${h.hora_salida})`,
                            }))}
                            disabled={tipo === "salida"}
                        />
                    </Form.Item>

                    <Form.Item name="fecha" label="Fecha" rules={[{ required: true }]}>
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="hora" label="Hora" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="observacion" label="Observación">
                        <Input.TextArea rows={2} maxLength={200} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
