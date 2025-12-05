import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { getUserPredictions, deletePrediction } from '../lib/firestore';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadPredictions();
        }
    }, [user]);

    const loadPredictions = async () => {
        try {
            setLoading(true);
            const data = await getUserPredictions(user.uid);
            setPredictions(data);
        } catch (error) {
            console.error('Error loading predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (predictionId) => {
        if (!confirm('Are you sure you want to delete this prediction?')) {
            return;
        }

        try {
            await deletePrediction(predictionId);
            setPredictions(predictions.filter(p => p.id !== predictionId));
        } catch (error) {
            console.error('Error deleting prediction:', error);
            alert('Failed to delete prediction');
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown date';

        let date;
        if (timestamp.toDate) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp);
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter and sort predictions
    const filteredPredictions = predictions
        .filter(prediction => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                (prediction.name && prediction.name.toLowerCase().includes(query)) ||
                (prediction.disease && prediction.disease.toLowerCase().includes(query))
            );
        })
        .sort((a, b) => {
            const dateA = a.timestamp?.toDate?.() || new Date(a.createdAt);
            const dateB = b.timestamp?.toDate?.() || new Date(b.createdAt);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    return (
        <ProtectedRoute>
            <Head>
                <title>Dashboard - Crop Disease Detection</title>
                <meta name="description" content="View your crop disease detection history" />
            </Head>

            <div className={styles.dashboardPage}>
                <Header />

                <main className={styles.dashboardMain}>
                    <div className="container">
                        {/* Welcome Section */}
                        <div className={styles.welcomeSection}>
                            <div className={styles.welcomeCard}>
                                <h1 className={styles.welcomeTitle}>
                                    Welcome back, {user?.displayName || 'there'}!
                                </h1>
                                <p className={styles.welcomeText}>
                                    View your prediction history or detect new crop diseases
                                </p>
                                <Link href="/">
                                    <a className={styles.actionButton}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        Detect New Disease
                                    </a>
                                </Link>
                            </div>
                        </div>

                        {/* Prediction History */}
                        <div className={styles.historySection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Prediction History</h2>
                                <div className={styles.headerActions}>
                                    {/* Search Bar */}
                                    <div className={styles.searchContainer}>
                                        <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="M21 21l-4.35-4.35" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search by name or disease..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={styles.searchInput}
                                        />
                                        {searchQuery && (
                                            <button 
                                                onClick={() => setSearchQuery('')}
                                                className={styles.clearSearch}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Sort Toggle */}
                                    <button onClick={toggleSortOrder} className={styles.sortButton}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 5h10M11 9h7M11 13h4" />
                                            <path d="M3 17l3 3 3-3M6 18V4" />
                                        </svg>
                                        {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className={styles.loadingState}>
                                    <div className="spinner"></div>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-md)' }}>
                                        Loading your predictions...
                                    </p>
                                </div>
                            ) : filteredPredictions.length === 0 && predictions.length > 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="M21 21l-4.35-4.35" />
                                        </svg>
                                    </div>
                                    <h3 className={styles.emptyTitle}>No Results Found</h3>
                                    <p className={styles.emptyText}>
                                        No predictions match "{searchQuery}"
                                    </p>
                                    <button onClick={() => setSearchQuery('')} className={styles.actionButton}>
                                        Clear Search
                                    </button>
                                </div>
                            ) : filteredPredictions.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                    </div>
                                    <h3 className={styles.emptyTitle}>No Predictions Yet</h3>
                                    <p className={styles.emptyText}>
                                        Start by uploading a crop image to detect diseases
                                    </p>
                                    <Link href="/">
                                        <a className={styles.actionButton}>Get Started</a>
                                    </Link>
                                </div>
                            ) : (
                                <div className={styles.historyGrid}>
                                    {filteredPredictions.map((prediction) => (
                                        <div key={prediction.id} className={styles.historyCard}>
                                            {prediction.imageUrl && (
                                                <div className={styles.historyImageContainer}>
                                                    <img 
                                                        src={prediction.imageUrl} 
                                                        alt={prediction.disease}
                                                        className={styles.historyImage}
                                                    />
                                                </div>
                                            )}
                                            <div className={styles.historyContent}>
                                                <div className={styles.historyHeader}>
                                                    <div>
                                                        {prediction.name && (
                                                            <div className={styles.predictionName}>{prediction.name}</div>
                                                        )}
                                                        <h3 className={styles.diseaseName}>{prediction.disease}</h3>
                                                        <div className={styles.historyDate}>
                                                            {formatDate(prediction.timestamp || prediction.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className={styles.confidenceBadge}>
                                                        {prediction.confidence}%
                                                    </div>
                                                </div>

                                                {prediction.description && (
                                                    <p className={styles.historyDescription}>
                                                        {prediction.description}
                                                    </p>
                                                )}

                                                {prediction.treatment && (
                                                    <div className={styles.treatmentSection}>
                                                        <h4 className={styles.treatmentTitle}>Treatment</h4>
                                                        <p className={styles.treatmentText}>{prediction.treatment}</p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(prediction.id)}
                                                    className={styles.deleteButton}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
