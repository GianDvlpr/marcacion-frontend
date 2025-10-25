import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import EmpleadosPage from "../pages/EmpleadosPage";
import MarcacionesPage from "../pages/MarcacionesPage";
import ReportesPage from "../pages/ReportesPage";

const { Header, Content, Footer } = Layout;

function AppRouter() {
    return (
        <Router>
            <Layout style={{ minHeight: "100vh" }}>
                <Header style={{ color: "white", fontSize: 20 }}>
                    Sistema de Marcación
                </Header>
                <Content style={{ padding: 24 }}>
                    <Routes>
                        <Route path="/" element={<MarcacionesPage />} />
                        <Route path="/empleados" element={<EmpleadosPage />} />
                        <Route path="/reportes" element={<ReportesPage />} />
                    </Routes>
                </Content>
                <Footer style={{ textAlign: "center" }}>
                    © 2025 Soluciones Tecnológicas S.A.C.
                </Footer>
            </Layout>
        </Router>
    );
}

export default AppRouter;
