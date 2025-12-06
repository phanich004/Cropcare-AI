import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../lib/firebase';
import styles from '../styles/Auth.module.css';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validCode, setValidCode] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [email, setEmail] = useState('');

    const router = useRouter();
    const { oobCode } = router.query; // Firebase action code from URL

    useEffect(() => {
        if (oobCode && auth) {
            verifyCode();
        }
    }, [oobCode, auth]);

    const verifyCode = async () => {
        try {
            setVerifying(true);
            // Verify the password reset code is valid
            const userEmail = await verifyPasswordResetCode(auth, oobCode);
            setEmail(userEmail);
            setValidCode(true);
        } catch (error) {
            console.error('Invalid reset code:', error);
            setError('This password reset link is invalid or has expired. Please request a new one.');
            setValidCode(false);
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password) {
            setError('Please enter a new password');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setError('');
            setLoading(true);

            // Confirm the password reset
            await confirmPasswordReset(auth, oobCode, password);
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (error) {
            console.error('Password reset error:', error);

            if (error.code === 'auth/expired-action-code') {
                setError('This reset link has expired. Please request a new one.');
            } else if (error.code === 'auth/invalid-action-code') {
                setError('This reset link is invalid. Please request a new one.');
            } else if (error.code === 'auth/weak-password') {
                setError('Password is too weak. Please use a stronger password.');
            } else {
                setError('Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Show loading while verifying code
    if (verifying) {
        return (
            <>
                <Head>
                    <title>Reset Password - CropCare AI</title>
                </Head>
                <div className={styles.authPage}>
                    <div className={styles.authContainer}>
                        <div className={styles.authCard}>
                            <div className={styles.authHeader}>
                                <div className={styles.authLogo}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        <path d="M2 12h20" />
                                    </svg>
                                </div>
                                <h1 className={styles.authTitle}>Verifying...</h1>
                                <p className={styles.authSubtitle}>
                                    Please wait while we verify your reset link
                                </p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <div className="spinner"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show error if code is invalid
    if (!validCode && !verifying) {
        return (
            <>
                <Head>
                    <title>Reset Password - CropCare AI</title>
                </Head>
                <div className={styles.authPage}>
                    <div className={styles.authContainer}>
                        <div className={styles.authCard}>
                            <div className={styles.authHeader}>
                                <div className={styles.authLogo} style={{ color: 'hsl(0, 100%, 65%)' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                </div>
                                <h1 className={styles.authTitle}>Link Expired</h1>
                                <p className={styles.authSubtitle}>
                                    {error || 'This password reset link is invalid or has expired.'}
                                </p>
                            </div>

                            <div className={styles.authLinks}>
                                <Link href="/forgot-password">
                                    <a className={styles.submitButton} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                        Request New Link
                                    </a>
                                </Link>
                                <p className={styles.authText} style={{ marginTop: '1rem' }}>
                                    <Link href="/login" className={styles.authLink}>
                                        Back to login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Reset Password - CropCare AI</title>
                <meta name="description" content="Reset your password" />
            </Head>

            <div className={styles.authPage}>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.authHeader}>
                            <div className={styles.authLogo}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    <path d="M2 12h20" />
                                </svg>
                            </div>
                            <h1 className={styles.authTitle}>Reset Password</h1>
                            <p className={styles.authSubtitle}>
                                {email ? `Enter a new password for ${email}` : 'Enter your new password'}
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

                        {success ? (
                            <div className={styles.successMessage}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Password reset successful! Redirecting to login...
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.authForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="password" className={styles.formLabel}>New Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className={styles.formInput}
                                        disabled={loading}
                                        minLength={6}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className={styles.formInput}
                                        disabled={loading}
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}

                        <div className={styles.authLinks}>
                            <p className={styles.authText}>
                                Remember your password?{' '}
                                <Link href="/login" className={styles.authLink}>
                                    Back to login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

