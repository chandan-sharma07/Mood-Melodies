import React, { useState } from "react";
import "../style/register.scss";
import FormGroup from "../components/FormGroup";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
const navigate = useNavigate();

const { loading, submitting, register, error } = useAuth();

const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

async function handleSubmit(e) {
    e.preventDefault();

    const success = await register(username, email, password);

    if (success) {
    navigate("/");
    }
}

return (
    <main className="register-page">
    <div className="form-container">
        <h1>Register</h1>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
        <FormGroup
            label="Name"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />

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
            {submitting ? "Registering..." : "Register"}
        </button>
        </form>

        <p>
        Already have an account? <Link to="/login">Login</Link>
        </p>
    </div>
    </main>
);
};

export default Register;