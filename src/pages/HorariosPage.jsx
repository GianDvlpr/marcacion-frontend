import { useEffect, useState } from "react";
import { Typography, Button, Table, Modal, Form, Input, TimePicker, Space, message } from "antd";
import dayjs from "dayjs";
import { listHorarios, createHorario, updateHorario, deleteHorario } from "../api/horarios";

export default function HorariosPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await listHorarios();
            setRows(res.data || []);
        } catch {
            message.error("No se pudo cargar horarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const columns = [
        { title: "Descripción", dataIndex: "descripcion" },
        { title: "Entrada", dataIndex: "hora_entrada" },
        { title: "Salida", dataIndex: "hora_salida" },
        { title: "Tolerancia (min)", dataIndex: "tolerancia_min" },
        {
            title: "Acciones",
            render: (_, r) => (
                <Space>
                    <Button onClick={() => onEdit(r)}>Editar</Button>
                    <Button danger onClick={() => onDelete(r.id_horario)}>Eliminar</Button>
                </Space>
            ),
            width: 180,
        },
    ];

    const onNew = () => {
        setEditing(null);
        form.resetFields();
        setOpen(true);
    };

    const onEdit = (row) => {
        setEditing(row);
        setOpen(true);
        form.setFieldsValue({
            ...row,
            hora_entrada: row.hora_entrada ? dayjs(row.hora_entrada, "HH:mm") : null,
            hora_salida: row.hora_salida ? dayjs(row.hora_salida, "HH:mm") : null,
        });
    };

    const onDelete = async (id) => {
        try {
            await deleteHorario(id);
            message.success("Horario eliminado");
            fetchData();
        } catch {
            message.error("No se pudo eliminar");
        }
    };

    const onSubmit = async () => {
        try {
            const vals = await form.validateFields();
            const payload = {
                descripcion: vals.descripcion,
                hora_entrada: vals.hora_entrada?.format("HH:mm"),
                hora_salida: vals.hora_salida?.format("HH:mm"),
                tolerancia_min: Number(vals.tolerancia_min ?? 0),
            };
            if (editing) {
                await updateHorario(editing.id_horario, payload);
                message.success("Horario actualizado");
            } else {
                await createHorario(payload);
                message.success("Horario creado");
            }
            setOpen(false);
            fetchData();
        } catch (e) {
            if (!e?.errorFields) message.error("Operación fallida");
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <Typography.Title level={2}>Horarios</Typography.Title>
            </div>

            <div className="page-toolbar">
                <Button type="primary" onClick={onNew}>Nuevo horario</Button>
                <Button onClick={fetchData}>Actualizar</Button>
            </div>

            <div className="page-card">
                <Table rowKey="id_horario" loading={loading} dataSource={rows} columns={columns} />
            </div>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={onSubmit}
                title={editing ? "Editar horario" : "Nuevo horario"}
                destroyOnClose
            >
                <Form layout="vertical" form={form}>
                    <Form.Item name="descripcion" label="Descripción" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="hora_entrada" label="Hora de entrada" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="hora_salida" label="Hora de salida" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="tolerancia_min" label="Tolerancia (min)">
                        <Input type="number" min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
