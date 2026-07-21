import React, { useState } from "react";
import "../style/login.scss";
import FormGroup from "../components/FormGroup";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
const { loading, submitting, login, error } = useAuth();
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

async function handleSubmit(e) {
    e.preventDefault();

    const success = await login(email, password);

    if (success) {
    navigate("/");
    }
}

return (
    <main className="login-page">
    <div className="form-container">
        <h1>Login</h1>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
        <FormGroup
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        <FormGroup
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <button className="button" type="submit" disabled={loading || submitting}>
            {submitting ? "Logging in..." : "Login"}
        </button>
        </form>

        <p>
        Don't have an account? <Link to="/register">Register</Link>
        </p>
    </div>
    </main>
);
};

export default Login;