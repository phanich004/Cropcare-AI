import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in, redirect to login
                router.push('/login');
            } else if (!user.emailVerified && user.providerData[0]?.providerId !== 'google.com') {
                // Email not verified (skip check for Google sign-in users)
                router.push('/verify-email');
            }
        }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-dark)',
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!user) {
        return null;
    }

    // Don't render children if email not verified (except for Google users)
    if (!user.emailVerified && user.providerData[0]?.providerId !== 'google.com') {
        return null;
    }

    return <>{children}</>;
}
