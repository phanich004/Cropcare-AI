import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Auth.module.css';

export default function VerifyEmail() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { user, resendVerificationEmail } = useAuth();
    const router = useRouter();

    const handleResend = async () => {
        try {
            setError('');
            setMessage('');
            setLoading(true);
            await resendVerificationEmail();
            setMessage('Verification email sent! Please check your inbox.');
        } catch (error) {
            console.error('Resend verification error:', error);
            setError('Failed to send verification email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        // Reload user to check verification status
        if (user) {
            user.reload().then(() => {
                if (user.emailVerified) {
                    router.push('/dashboard');
                } else {
                    setError('Email not verified yet. Please check your inbox and click the verification link.');
                }
            });
        }
    };

    return (
        <>
            <Head>
                <title>Verify Email - Crop Disease Detection</title>
                <meta name="description" content="Verify your email address" />
            </Head>

            <div className={styles.authPage}>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.authHeader}>
                            <div className={styles.authLogo}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <h1 className={styles.authTitle}>Verify Your Email</h1>
                            <p className={styles.authSubtitle}>
                                We've sent a verification email to <strong>{user?.email}</strong>
                            </p>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className={styles.successMessage}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                {message}
                            </div>
                        )}

                        <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                                Click the link in the email to verify your account. After verifying, click the button below to continue.
                            </p>

                            <button
                                onClick={handleContinue}
                                className={styles.submitButton}
                                style={{ marginBottom: 'var(--spacing-md)' }}
                            >
                                I've Verified My Email
                            </button>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
                                Didn't receive the email?
                            </p>

                            <button
                                onClick={handleResend}
                                className={styles.googleButton}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                        </div>

                        <div className={styles.authLinks} style={{ marginTop: 'var(--spacing-lg)' }}>
                            <Link href="/login" className={styles.authLink}>
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
