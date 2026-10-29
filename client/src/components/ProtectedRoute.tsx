import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute() {
    const { token, loading } = useApp();

    if (loading) {           // if loading then show loading animate-spin
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;       // Outlet: Displays the child route when access is allowed.
}















{/*
    If there is no token, React Router redirects the user to /login.
    The replace prop replaces the current browser history entry rather than adding a new one.
    Imp: This check only verifies whether a token exists in frontend state. It does not verify whether the token is valid or expired. Your backend's authentication middleware must perform that verification when protected API requests are made.
*/}