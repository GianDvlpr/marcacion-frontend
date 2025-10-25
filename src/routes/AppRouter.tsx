import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import EmpleadosPage from "../pages/EmpleadosPage";
import MarcacionesPage from "../pages/MarcacionesPage";
import HorariosPage from "../pages/HorariosPage";
import ReportesPage from "../pages/ReportesPage";
import LoginPage from "../pages/LoginPage";
import RequireAuth from "./RequireAuth";
import { isAuthenticated, clearToken } from "../utils/auth";

const { Header, Content, Footer } = Layout;

function Nav() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const authed = isAuthenticated();

    const items = [
        { key: "/", label: <Link to="/">Marcaciones</Link> },
        { key: "/empleados", label: <Link to="/empleados">Empleados</Link> },
        { key: "/horarios", label: <Link to="/horarios">Horarios</Link> },
        { key: "/reportes", label: <Link to="/reportes">Reportes</Link> },
    ];

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
            {authed && (
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[pathname]}
                    items={items}
                    style={{ background: "transparent", borderBottom: "none", flex: 1 }}
                />
            )}
            {authed ? (
                <Button onClick={() => { clearToken(); navigate("/login"); }}>
                    Cerrar sesión
                </Button>
            ) : (
                <Button type="primary" onClick={() => navigate("/login")}>
                    Ingresar
                </Button>
            )}
        </div>
    );
}

export default function AppRouter() {
    return (
        <Router>
            <Layout>
                <Header className="site-header">
                    <div className="site-brand">Sistema de Marcación</div>
                    <Nav />
                </Header>

                <Content className="site-content">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />

                        <Route
                            path="/"
                            element={
                                <RequireAuth>
                                    <MarcacionesPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/empleados"
                            element={
                                <RequireAuth>
                                    <EmpleadosPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/horarios"
                            element={
                                <RequireAuth>
                                    <HorariosPage />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/reportes"
                            element={
                                <RequireAuth>
                                    <ReportesPage />
                                </RequireAuth>
                            }
                        />
                    </Routes>
                </Content>

                <Footer className="site-footer">© 2025 Soluciones Tecnológicas S.A.C.</Footer>
            </Layout>
        </Router>
    );
}
