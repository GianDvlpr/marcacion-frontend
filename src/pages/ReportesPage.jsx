import { useEffect, useState } from "react";
import { Typography, DatePicker, Select, Button, Table, Space, message } from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { listMarcaciones } from "../api/marcaciones";
import { listEmpleados } from "../api/empleados";

const { RangePicker } = DatePicker;

export default function ReportesPage() {
    const [range, setRange] = useState([dayjs().startOf("week"), dayjs().endOf("week")]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [empleados, setEmpleados] = useState([]);
    const [idEmpleado, setIdEmpleado] = useState(null);

    const fetchFilters = async () => {
        try {
            const e = await listEmpleados();
            setEmpleados(e.data || []);
        } catch {
            message.error("No se pudieron cargar empleados");
        }
    };

    // ...
    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                desde: range?.[0]?.format("YYYY-MM-DD"),
                hasta: range?.[1]?.format("YYYY-MM-DD"),
                id_empleado: idEmpleado || undefined,
            };
            const res = await listMarcaciones(params);
            setRows(res.data || []);
        } catch {
            message.error("No se pudo cargar el reporte");
        } finally {
            setLoading(false);
        }
    };
    // ...


    useEffect(() => {
        fetchFilters();
        fetchData(); // carga inicial
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        { title: "Empleado", dataIndex: "empleado", render: (_, r) => r.empleado_nombre || r.empleado || "—" },
        { title: "Fecha", dataIndex: "fecha_marcacion" },
        { title: "Entrada", dataIndex: "hora_entrada" },
        { title: "Salida", dataIndex: "hora_salida" },
        { title: "Observación", dataIndex: "observacion" },
    ];

    /** Exportar a Excel */
    const handleExport = () => {
        if (rows.length === 0) {
            message.warning("No hay datos para exportar");
            return;
        }

        // Preparamos los datos limpios
        const data = rows.map((r) => ({
            Empleado: r.empleado_nombre || r.empleado || "",
            Fecha: r.fecha_marcacion || "",
            "Hora Entrada": r.hora_entrada || "",
            "Hora Salida": r.hora_salida || "",
            Observación: r.observacion || "",
        }));

        // Creamos hoja de Excel
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");

        // Creamos archivo y descargamos
        const fecha = dayjs().format("YYYY-MM-DD_HHmm");
        const fileName = `Reporte_Marcaciones_${fecha}.xlsx`;

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, fileName);
    };

    return (
        <div className="page">
            <div className="page-header">
                <Typography.Title level={2}>Reportes</Typography.Title>
                <Typography.Paragraph className="page-subtitle">
                    Consulta marcaciones por rango de fechas y (opcional) por empleado.
                </Typography.Paragraph>
            </div>

            <div className="page-toolbar">
                <RangePicker
                    value={range}
                    onChange={(v) => setRange(v)}
                    format="DD/MM/YYYY"
                    allowClear={false}
                />
                <Select
                    allowClear
                    placeholder="Filtrar por empleado"
                    style={{ minWidth: 260 }}
                    value={idEmpleado ?? undefined}
                    onChange={setIdEmpleado}
                    options={(empleados || []).map(e => ({
                        value: e.id_empleado,
                        label: `${e.nombres} ${e.apellidos}`,
                    }))}
                />
                <Space>
                    <Button type="primary" onClick={fetchData}>Consultar</Button>
                    <Button onClick={handleExport}>Exportar a Excel</Button>
                </Space>
            </div>

            <div className="page-card">
                <Table
                    loading={loading}
                    dataSource={rows}
                    columns={columns}
                    rowKey={(r, i) => r.id_marcacion ?? i}
                />
            </div>
        </div>
    );
}
