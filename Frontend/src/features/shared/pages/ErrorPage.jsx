import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100vh', textAlign: 'center',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ fontSize: '3rem', color: '#ff4d4f', margin: '0' }}>Oops!</h1>
            <p style={{ fontSize: '1.2rem', color: '#555', maxWidth: '500px' }}>
                Sorry, something went wrong or the page you are looking for doesn't exist.
            </p>
            <p style={{ fontStyle: 'italic', color: '#888', marginBottom: '2rem' }}>
                <i>{error?.statusText || error?.message || "Page not found"}</i>
            </p>
            <Link to="/" style={{
                padding: '10px 24px', backgroundColor: '#667eea', color: '#fff',
                textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold'
            }}>
                Go Back Home
            </Link>
        </div>
    );
};

export default ErrorPage;
