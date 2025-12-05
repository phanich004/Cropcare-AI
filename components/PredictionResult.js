import styles from './PredictionResult.module.css';

export default function PredictionResult({ prediction, loading }) {
    if (loading) {
        return (
            <div className={styles.resultContainer}>
                <div className={styles.loadingState}>
                    <div className="spinner"></div>
                    <h3 className={styles.loadingText}>Analyzing crop image...</h3>
                    <p className={styles.loadingSubtext}>Our AI is detecting diseases</p>
                </div>
            </div>
        );
    }

    if (!prediction) {
        return null;
    }

    const { disease, confidence, description, treatment } = prediction;

    return (
        <div className={`${styles.resultContainer} fade-in`}>
            <div className={styles.resultHeader}>
                <h2 className={styles.resultTitle}>Detection Results</h2>
            </div>

            <div className={styles.diseaseCard}>
                <div className={styles.diseaseHeader}>
                    <h3 className={styles.diseaseName}>{disease}</h3>
                    <div className={styles.confidenceBadge}>
                        <span className={styles.confidenceLabel}>Confidence</span>
                        <span className={styles.confidenceValue}>{confidence}%</span>
                    </div>
                </div>

                <div className={styles.confidenceBar}>
                    <div
                        className={styles.confidenceFill}
                        style={{ width: `${confidence}%` }}
                    ></div>
                </div>

                {description && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Description
                        </h4>
                        <p className={styles.sectionContent}>{description}</p>
                    </div>
                )}

                {treatment && (
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                            Recommended Treatment
                        </h4>
                        <p className={styles.sectionContent}>{treatment}</p>
                    </div>
                )}
            </div>

            <div className={styles.disclaimer}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                This is an AI-powered prediction. Please consult with agricultural experts for accurate diagnosis.
            </div>
        </div>
    );
}
