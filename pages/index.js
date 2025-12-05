import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { savePrediction } from '../lib/firestore';
import ImageUploader from '../components/ImageUploader';
import PredictionResult from '../components/PredictionResult';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
import styles from '../styles/Home.module.css';

// Disease information database
const DISEASE_INFO = {
    'Corn___Common_Rust': {
        name: 'Corn Common Rust',
        description: 'A fungal disease causing small, circular to elongated brown pustules on corn leaves. Common in humid conditions.',
        treatment: 'Apply fungicides containing azoxystrobin or propiconazole. Plant resistant varieties and ensure proper crop rotation.'
    },
    'Corn___Gray_Leaf_Spot': {
        name: 'Corn Gray Leaf Spot',
        description: 'Fungal disease causing rectangular gray or tan lesions on corn leaves, leading to reduced photosynthesis.',
        treatment: 'Use resistant hybrids, apply fungicides early, and practice crop rotation with non-host crops.'
    },
    'Corn___Healthy': {
        name: 'Healthy Corn',
        description: 'The corn plant appears healthy with no visible signs of disease.',
        treatment: 'Continue regular maintenance, proper irrigation, and monitoring for early disease detection.'
    },
    'Potato___Early_Blight': {
        name: 'Potato Early Blight',
        description: 'Fungal disease causing dark brown spots with concentric rings on potato leaves, reducing yield.',
        treatment: 'Apply copper-based fungicides, remove infected plant debris, and ensure adequate plant spacing for air circulation.'
    },
    'Potato___Healthy': {
        name: 'Healthy Potato',
        description: 'The potato plant appears healthy with no visible signs of disease.',
        treatment: 'Maintain proper watering, fertilization, and regular monitoring for pest and disease prevention.'
    },
    'Potato___Late_Blight': {
        name: 'Potato Late Blight',
        description: 'Severe fungal disease causing water-soaked lesions on leaves and stems, can destroy entire crops quickly.',
        treatment: 'Apply systemic fungicides immediately, remove and destroy infected plants, and avoid overhead irrigation.'
    },
    'Rice___Brown_Spot': {
        name: 'Rice Brown Spot',
        description: 'Fungal disease causing oval brown spots on rice leaves and grains, reducing grain quality and yield.',
        treatment: 'Use disease-free seeds, apply balanced fertilizers, and treat with fungicides like mancozeb or copper oxychloride.'
    },
    'Rice___Healthy': {
        name: 'Healthy Rice',
        description: 'The rice plant appears healthy with no visible signs of disease.',
        treatment: 'Maintain proper water management, balanced nutrition, and regular field monitoring.'
    },
    'Rice___Leaf_Blast': {
        name: 'Rice Leaf Blast',
        description: 'Fungal disease causing diamond-shaped lesions with gray centers on rice leaves, can cause severe yield loss.',
        treatment: 'Apply tricyclazole or azoxystrobin fungicides, use resistant varieties, and avoid excessive nitrogen fertilization.'
    },
    'Wheat___Brown_Rust': {
        name: 'Wheat Brown Rust',
        description: 'Fungal disease causing orange-brown pustules on wheat leaves, reducing photosynthesis and grain quality.',
        treatment: 'Apply fungicides containing propiconazole or tebuconazole, plant resistant varieties, and remove volunteer wheat plants.'
    },
    'Wheat___Healthy': {
        name: 'Healthy Wheat',
        description: 'The wheat plant appears healthy with no visible signs of disease.',
        treatment: 'Continue proper crop management, balanced fertilization, and regular scouting for early disease detection.'
    },
    'Wheat___Yellow_Rust': {
        name: 'Wheat Yellow Rust',
        description: 'Fungal disease causing yellow-orange pustules in stripes on wheat leaves, can cause significant yield losses.',
        treatment: 'Apply fungicides early, use resistant cultivars, and monitor weather conditions for disease-favorable periods.'
    },
    'Invalid': {
        name: 'Invalid Image',
        description: 'The image does not appear to be a valid crop leaf image or is unclear.',
        treatment: 'Please upload a clear image of a crop leaf (corn, potato, rice, or wheat) for accurate disease detection.'
    }
};

export default function Home() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageName, setImageName] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [error, setError] = useState(null);
    const [modelLoading, setModelLoading] = useState(true);
    const [modelReady, setModelReady] = useState(false);

    const { user } = useAuth();

    // Import model utilities dynamically (client-side only)
    useEffect(() => {
        let mounted = true;

        const initModel = async () => {
            try {
                // Dynamic import to avoid SSR issues
                const { loadModel, isModelReady } = await import('../lib/modelUtils');

                if (!mounted) return;

                console.log('Initializing model...');
                setModelLoading(true);

                // Preload the model
                await loadModel();

                if (!mounted) return;

                setModelReady(true);
                setModelLoading(false);
                console.log('Model ready for predictions!');

            } catch (error) {
                console.error('Failed to initialize model:', error);
                if (mounted) {
                    // Only set error if model truly failed to load
                    // Don't set error for transient issues during loading
                    setModelLoading(false);
                    // Give it a moment, then check if model actually loaded
                    setTimeout(async () => {
                        const { isModelReady } = await import('../lib/modelUtils');
                        if (!isModelReady()) {
                            setError('Failed to load AI model. Please refresh the page.');
                        } else {
                            setModelReady(true);
                            setError(null);
                        }
                    }, 1000);
                }
            }
        };

        initModel();

        return () => {
            mounted = false;
        };
    }, []);

    const handleImageSelect = async (imageSrc) => {
        setSelectedImage(imageSrc);
        setPrediction(null);
        setError(null);

        if (!imageSrc) {
            setImageName('');
            return;
        }

        // Check if model is ready
        if (!modelReady) {
            setError('AI model is still loading. Please wait...');
            return;
        }

        try {
            setPredicting(true);
            setError(null);

            // Dynamic import to use model utilities
            const { predictDisease } = await import('../lib/modelUtils');

            // Run prediction
            const results = await predictDisease(imageSrc);

            // Get the top prediction
            const topPrediction = results[0];
            const diseaseKey = topPrediction.label;
            const confidence = Math.round(topPrediction.score * 100);

            // Get disease information
            const diseaseInfo = DISEASE_INFO[diseaseKey] || DISEASE_INFO['Invalid'];

            const predictionData = {
                name: imageName.trim() || `Scan ${new Date().toLocaleDateString()}`,
                disease: diseaseInfo.name,
                confidence: confidence,
                description: diseaseInfo.description,
                treatment: diseaseInfo.treatment,
                imageUrl: imageSrc
            };

            setPrediction(predictionData);

            // Save prediction to Firestore if user is logged in
            if (user) {
                try {
                    await savePrediction(user.uid, predictionData);
                    console.log('Prediction saved to history');
                } catch (error) {
                    console.error('Error saving prediction:', error);
                    // Don't show error to user, just log it
                }
            }

        } catch (error) {
            console.error('Prediction error:', error);
            setError(error.message || 'Failed to analyze image. Please try again.');
        } finally {
            setPredicting(false);
        }
    };

    return (
        <ProtectedRoute>
            <Head>
                <title>SmartCrop - AI-Powered Crop Disease Detection</title>
                <meta name="description" content="Detect crop diseases instantly using advanced AI. Upload a photo of your crop for immediate analysis and treatment recommendations." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className={styles.page}>
                <Header />

                {/* Main Content */}
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.hero}>
                            <h1>Crop Disease Detection</h1>
                            <p className={styles.subtitle}>
                                Upload an image of your crop to detect diseases instantly using AI-powered analysis
                            </p>
                            <p className={styles.supportedCrops}>
                                Supports: Corn, Potato, Rice, and Wheat
                            </p>
                        </div>

                        {error && (
                            <div className={styles.errorBanner}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {modelLoading && !error && (
                            <div className={styles.infoBanner}>
                                <div className="spinner"></div>
                                <span>Loading AI model... This may take a minute on first load.</span>
                            </div>
                        )}

                        {/* Name Input */}
                        <div className={styles.nameInputContainer}>
                            <label htmlFor="imageName" className={styles.nameLabel}>
                                Name your scan (optional)
                            </label>
                            <input
                                type="text"
                                id="imageName"
                                value={imageName}
                                onChange={(e) => setImageName(e.target.value)}
                                placeholder="e.g., Field A - Row 3, My corn plant..."
                                className={styles.nameInput}
                                maxLength={100}
                            />
                        </div>

                        <ImageUploader onImageSelect={handleImageSelect} />

                        <PredictionResult prediction={prediction} loading={predicting} />
                    </div>
                </main>

            </div>
        </ProtectedRoute>
    );
}
