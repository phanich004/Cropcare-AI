import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Compress image to reduce size for Firestore storage
const compressImage = (base64String, maxWidth = 400, quality = 0.7) => {
    return new Promise((resolve) => {
        // If not a base64 image, return as is
        if (!base64String || !base64String.startsWith('data:image')) {
            resolve(base64String);
            return;
        }

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Scale down if larger than maxWidth
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to compressed JPEG
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };

        img.onerror = () => {
            // If compression fails, return original (or null to skip)
            resolve(null);
        };

        img.src = base64String;
    });
};

// Save a prediction to user's history
export const savePrediction = async (userId, predictionData) => {
    try {
        // Compress image before saving to avoid Firestore size limits
        let compressedImageUrl = null;
        if (predictionData.imageUrl && typeof window !== 'undefined') {
            try {
                compressedImageUrl = await compressImage(predictionData.imageUrl);
            } catch (e) {
                console.warn('Image compression failed, saving without image:', e);
            }
        }

        const predictionsRef = collection(db, 'predictions');
        const docRef = await addDoc(predictionsRef, {
            userId,
            disease: predictionData.disease,
            confidence: predictionData.confidence,
            description: predictionData.description,
            treatment: predictionData.treatment,
            imageUrl: compressedImageUrl,
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString(),
        });
        console.log('Prediction saved with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving prediction:', error);
        throw error;
    }
};

// Get user's prediction history
export const getUserPredictions = async (userId, limitCount = 20) => {
    try {
        const predictionsRef = collection(db, 'predictions');

        // Try with ordering first
        let q;
        let querySnapshot;

        try {
            q = query(
                predictionsRef,
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );
            querySnapshot = await getDocs(q);
        } catch (indexError) {
            // If index doesn't exist, fall back to simple query without ordering
            console.warn('Firestore index not found, falling back to unordered query:', indexError.message);
            console.log('To fix: Create a composite index in Firebase Console for predictions collection with userId (Ascending) and timestamp (Descending)');

            q = query(
                predictionsRef,
                where('userId', '==', userId),
                limit(limitCount)
            );
            querySnapshot = await getDocs(q);
        }

        const predictions = [];

        querySnapshot.forEach((doc) => {
            predictions.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Sort by createdAt if we couldn't use timestamp ordering
        predictions.sort((a, b) => {
            const dateA = a.timestamp?.toDate?.() || new Date(a.createdAt);
            const dateB = b.timestamp?.toDate?.() || new Date(b.createdAt);
            return dateB - dateA;
        });

        return predictions;
    } catch (error) {
        console.error('Error getting predictions:', error);
        // Return empty array instead of throwing to prevent UI breaking
        return [];
    }
};

// Delete a prediction
export const deletePrediction = async (predictionId) => {
    try {
        await deleteDoc(doc(db, 'predictions', predictionId));
    } catch (error) {
        console.error('Error deleting prediction:', error);
        throw error;
    }
};

// Delete all predictions for a user (used when deleting account)
export const deleteAllUserPredictions = async (userId) => {
    try {
        const predictionsRef = collection(db, 'predictions');
        const q = query(predictionsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        // Delete all predictions in batch
        const deletePromises = [];
        querySnapshot.forEach((document) => {
            deletePromises.push(deleteDoc(doc(db, 'predictions', document.id)));
        });

        await Promise.all(deletePromises);
        console.log(`Deleted ${deletePromises.length} predictions for user ${userId}`);
    } catch (error) {
        console.error('Error deleting all user predictions:', error);
        throw error;
    }
};
