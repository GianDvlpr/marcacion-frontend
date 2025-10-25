import { Typography, Button, Table, Modal, Form, Input, message, Space, Tag } from "antd";
import { useEffect, useState } from "react";
import { listEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from "../api/empleados";

export default function EmpleadosPage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    const res = await listEmpleados();
    setRows(res.data || []);
  };
  useEffect(() => { fetchData(); }, []);

  const columns = [
    { title: "Nombres", dataIndex: "nombres" },
    { title: "Apellidos", dataIndex: "apellidos" },
    { title: "DNI", dataIndex: "dni" },
    { title: "Cargo", dataIndex: "cargo" },
    { title: "Área", dataIndex: "area" },
    { title: "Estado", dataIndex: "estado", render: v => v ? <Tag color="green">Activo</Tag> : <Tag color="red">Inactivo</Tag> },
    {
      title: "Acciones",
      render: (_, r) => (
        <Space>
          <Button onClick={() => { setEditing(r); setOpen(true); form.setFieldsValue(r); }}>Editar</Button>
          <Button danger onClick={async ()=>{ await deleteEmpleado(r.id_empleado); message.success("Eliminado"); fetchData(); }}>
            Eliminar
          </Button>
        </Space>
      )
    }
  ];

  const onNew = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (editing) await updateEmpleado(editing.id_empleado, vals);
    else await createEmpleado(vals);
    setOpen(false); fetchData();
  };

  return (
    <div className="page">
      <div className="page-header">
        <Typography.Title level={2}>Empleados</Typography.Title>
      </div>

      <div className="page-toolbar">
        <Button type="primary" onClick={onNew}>Nuevo empleado</Button>
        <Button onClick={fetchData}>Actualizar</Button>
      </div>

      <div className="page-card">
        <Table rowKey="id_empleado" dataSource={rows} columns={columns} />
      </div>

      <Modal open={open} onCancel={()=>setOpen(false)} onOk={onSubmit} title={editing ? "Editar empleado" : "Nuevo empleado"}>
        <Form layout="vertical" form={form}>
          <Form.Item name="nombres" label="Nombres" rules={[{ required: true }]}><Input/></Form.Item>
          <Form.Item name="apellidos" label="Apellidos" rules={[{ required: true }]}><Input/></Form.Item>
          <Form.Item name="dni" label="DNI" rules={[{ required: true, len: 8 }]}><Input maxLength={8}/></Form.Item>
          <Form.Item name="cargo" label="Cargo"><Input/></Form.Item>
          <Form.Item name="area" label="Área"><Input/></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
