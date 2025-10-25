import { useState } from "react";
import { Table, Button, Space, Select, Typography, message } from "antd";
import dayjs from "dayjs";
// import axios from "axios"; // <- descomenta cuando conectes backend

const { Title, Text } = Typography;

const empleadosMock = [
    { id_empleado: 1, nombre: "Gian Franco Medina" },
    { id_empleado: 2, nombre: "Sebastián Cáceres" },
    { id_empleado: 3, nombre: "María López" },
];

export default function MarcacionesPage() {
    const [empleadoId, setEmpleadoId] = useState(1);
    const [marcaciones, setMarcaciones] = useState([
        {
            id_marcacion: 1,
            id_empleado: 1,
            empleado: "Gian Franco Medina",
            fecha_marcacion: dayjs().format("YYYY-MM-DD"),
            hora_entrada: "08:05",
            hora_salida: "17:00",
            observacion: "Normal",
        },
    ]);

    const empleadoSel = empleadosMock.find(e => e.id_empleado === empleadoId);

    const columns = [
        { title: "Empleado", dataIndex: "empleado" },
        {
            title: "Fecha", dataIndex: "fecha_marcacion",
            render: (f) => dayjs(f).format("DD/MM/YYYY")
        },
        { title: "Hora Entrada", dataIndex: "hora_entrada" },
        { title: "Hora Salida", dataIndex: "hora_salida" },
        { title: "Observación", dataIndex: "observacion" },
    ];

    const marcarEntrada = async () => {
        const hoy = dayjs().format("YYYY-MM-DD");
        const hora = dayjs().format("HH:mm");

        // Si ya tiene entrada hoy, no repetir
        const yaHay = marcaciones.find(
            m => m.id_empleado === empleadoId && m.fecha_marcacion === hoy && m.hora_entrada
        );
        if (yaHay) {
            message.warning("Ya registraste la entrada hoy.");
            return;
        }

        const nuevo = {
            id_marcacion: Date.now(),
            id_empleado: empleadoId,
            empleado: empleadoSel?.nombre || "",
            fecha_marcacion: hoy,
            hora_entrada: hora,
            hora_salida: null,
            observacion: "Entrada registrada",
        };

        // Ejemplo con backend:
        // const { data } = await axios.post("/api/marcaciones/entrada", { id_empleado: empleadoId });

        setMarcaciones(prev => [nuevo, ...prev]);
        message.success("Entrada registrada");
    };

    const marcarSalida = async () => {
        const hoy = dayjs().format("YYYY-MM-DD");
        const hora = dayjs().format("HH:mm");

        const idx = marcaciones.findIndex(
            m => m.id_empleado === empleadoId && m.fecha_marcacion === hoy
        );
        if (idx === -1) {
            message.warning("No existe entrada hoy para este empleado.");
            return;
        }

        const copia = [...marcaciones];
        copia[idx] = { ...copia[idx], hora_salida: hora, observacion: "Salida registrada" };

        // Ejemplo con backend:
        // await axios.post("/api/marcaciones/salida", { id_empleado: empleadoId });

        setMarcaciones(copia);
        message.success("Salida registrada");
    };

    return (
        <div>
            <Title level={3} style={{ marginBottom: 8 }}>Marcaciones</Title>
            <Text type="secondary">
                Selecciona un empleado y registra su entrada/salida (modo demo en memoria).
            </Text>

            <Space style={{ margin: "16px 0" }} wrap>
                <Select
                    style={{ minWidth: 260 }}
                    value={empleadoId}
                    onChange={setEmpleadoId}
                    options={empleadosMock.map(e => ({ value: e.id_empleado, label: e.nombre }))}
                />
                <Button type="primary" onClick={marcarEntrada}>Marcar entrada</Button>
                <Button onClick={marcarSalida}>Marcar salida</Button>
                <Button onClick={() => window.location.reload()}>Refrescar</Button>
            </Space>

            <Table
                dataSource={marcaciones}
                columns={columns}
                rowKey="id_marcacion"
                pagination={{ pageSize: 8 }}
            />
        </div>
    );
}
