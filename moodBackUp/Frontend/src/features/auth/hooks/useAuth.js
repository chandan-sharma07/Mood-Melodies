import { login, register, logout } from "../services/auth.api";
import { useContext, useState } from "react";
import { AuthContext } from "../auth.context";

export const useAuth = () => {
    const { user, setUser, loading } = useContext(AuthContext);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (email, password) => {
        try {
            setSubmitting(true);
            const userData = await login(email, password);
            setUser(userData.user);
            setError(null);
            return true;
        } catch (err) {
            console.error("Error logging in:", err);
            setError(err.response?.data?.message || "Login failed");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async (username, email, password) => {
        try {
            setSubmitting(true);
            const userData = await register({ username, email, password });
            setUser(userData.user);
            setError(null);
            return true;
        } catch (err) {
            console.error("Error registering:", err);
            setError(err.response?.data?.message || "Registration failed");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            setError(null);
        } catch (err) {
            console.error("Error logging out:", err);
            setError(err.response?.data?.message || "Logout failed");
        }
    };

    return {
        user,
        loading,
        submitting,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
    };
};
