import { isAuthenticated } from "../utils/auth";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
    const loc = useLocation();
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: loc }} />;
    }
    return children;
}
