import { useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { login } from "../api/auth";
import { setToken, isAuthenticated } from "../utils/auth";
import { useNavigate, Navigate } from "react-router-dom";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const { usuario, clave } = values;
            const res = await login(usuario, clave);
            const token = res?.data?.token;
            if (!token) throw new Error("Token no recibido");
            setToken(token);
            message.success("Bienvenido");
            navigate("/", { replace: true });
        } catch (e) {
            message.error(e?.response?.data?.message || "Credenciales inválidas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <Card style={{ width: 360 }}>
                <Typography.Title level={3} style={{ textAlign: "center" }}>Iniciar sesión</Typography.Title>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="usuario" label="Usuario" rules={[{ required: true, message: "Ingresa tu usuario" }]}>
                        <Input placeholder="usuario" autoFocus />
                    </Form.Item>
                    <Form.Item name="clave" label="Contraseña" rules={[{ required: true, message: "Ingresa tu contraseña" }]}>
                        <Input.Password placeholder="•••••••" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Entrar
                    </Button>
                </Form>
            </Card>
        </div>
    );
}
