import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    deleteUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { deleteAllUserPredictions } from '../lib/firestore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Register with email and password
    const register = async (email, password, displayName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name
            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }

            // Send email verification
            await sendEmailVerification(userCredential.user);

            return userCredential.user;
        } catch (error) {
            throw error;
        }
    };

    // Login with email and password
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    };

    // Login with Google
    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            throw error;
        }
    };

    // Send password reset email with custom action URL
    const resetPassword = async (email) => {
        try {
            // Get the current domain for the action URL
            const actionCodeSettings = {
                // URL to redirect to after password reset
                url: typeof window !== 'undefined' 
                    ? `${window.location.origin}/login`
                    : 'https://cropcare-ai.vercel.app/login',
                handleCodeInApp: false,
            };
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
        } catch (error) {
            throw error;
        }
    };

    // Resend email verification
    const resendVerificationEmail = async () => {
        try {
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
            }
        } catch (error) {
            throw error;
        }
    };

    // Delete account and all user data
    const deleteAccount = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('No user is currently signed in');
            }

            // Delete all user predictions from Firestore
            await deleteAllUserPredictions(currentUser.uid);

            // Delete the user account from Firebase Auth
            await deleteUser(currentUser);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        resendVerificationEmail,
        deleteAccount,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
