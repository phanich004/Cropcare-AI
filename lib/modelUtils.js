// Model state
let ortSession = null;
let ortModule = null;
let isLoading = false;
let loadError = null;

// Disease class mapping (based on model output labels)
export const DISEASE_CLASSES = {
    'Corn___Common_Rust': 'Corn Common Rust',
    'Corn___Gray_Leaf_Spot': 'Corn Gray Leaf Spot',
    'Corn___Healthy': 'Healthy Corn',
    'Potato___Early_Blight': 'Potato Early Blight',
    'Potato___Healthy': 'Healthy Potato',
    'Potato___Late_Blight': 'Potato Late Blight',
    'Rice___Brown_Spot': 'Rice Brown Spot',
    'Rice___Healthy': 'Healthy Rice',
    'Rice___Leaf_Blast': 'Rice Leaf Blast',
    'Wheat___Brown_Rust': 'Wheat Brown Rust',
    'Wheat___Healthy': 'Healthy Wheat',
    'Wheat___Yellow_Rust': 'Wheat Yellow Rust'
};

// ID to label mapping (from config.json)
const ID2LABEL = {
    0: 'Corn___Common_Rust',
    1: 'Corn___Gray_Leaf_Spot',
    2: 'Corn___Healthy',
    3: 'Invalid',
    4: 'Potato___Early_Blight',
    5: 'Potato___Healthy',
    6: 'Potato___Late_Blight',
    7: 'Rice___Brown_Spot',
    8: 'Rice___Healthy',
    9: 'Rice___Leaf_Blast',
    10: 'Wheat___Brown_Rust',
    11: 'Wheat___Healthy',
    12: 'Wheat___Yellow_Rust'
};

/**
 * Load the crop disease detection model
 */
export async function loadModel() {
    if (ortSession) {
        return ortSession;
    }

    if (isLoading) {
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return ortSession;
    }

    try {
        isLoading = true;
        loadError = null;

        console.log('Loading ONNX Runtime...');
        
        // Dynamic import to avoid SSR issues
        ortModule = await import('onnxruntime-web');
        
        // Use CDN for WASM files - use version 1.17.0 which has stable WASM files
        ortModule.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/';
        ortModule.env.wasm.numThreads = 1;
        ortModule.env.wasm.simd = false; // Disable SIMD to avoid jsep issues
        
        console.log('Fetching model...');
        
        // Fetch the model as ArrayBuffer
        const response = await fetch('/models/model.onnx');
        if (!response.ok) {
            throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
        }
        
        const modelBuffer = await response.arrayBuffer();
        console.log('Model fetched, size:', modelBuffer.byteLength, 'bytes');
        
        console.log('Creating inference session...');
        
        // Create session from the buffer
        ortSession = await ortModule.InferenceSession.create(modelBuffer, {
            executionProviders: ['wasm'],
        });

        console.log('Model loaded successfully!');
        console.log('Input names:', ortSession.inputNames);
        console.log('Output names:', ortSession.outputNames);
        
        return ortSession;

    } catch (error) {
        console.error('Error loading model:', error);
        loadError = error.message;
        throw error;
    } finally {
        isLoading = false;
    }
}

/**
 * Check if model is currently loading
 */
export function isModelLoading() {
    return isLoading;
}

/**
 * Get model loading error if any
 */
export function getLoadError() {
    return loadError;
}

/**
 * Check if model is loaded and ready
 */
export function isModelReady() {
    return ortSession !== null && !isLoading;
}

/**
 * Preprocess image for ViT model
 */
async function preprocessImage(imageData) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = 224;
                canvas.height = 224;
                
                ctx.drawImage(img, 0, 0, 224, 224);
                
                const imageDataObj = ctx.getImageData(0, 0, 224, 224);
                const pixels = imageDataObj.data;
                
                // Create tensor in NCHW format
                // Normalize with mean=0.5, std=0.5 as per preprocessor_config.json
                const tensorData = new Float32Array(1 * 3 * 224 * 224);
                
                for (let y = 0; y < 224; y++) {
                    for (let x = 0; x < 224; x++) {
                        const pixelIndex = (y * 224 + x) * 4;
                        
                        // Normalize: (pixel/255 - 0.5) / 0.5
                        const r = (pixels[pixelIndex] / 255.0 - 0.5) / 0.5;
                        const g = (pixels[pixelIndex + 1] / 255.0 - 0.5) / 0.5;
                        const b = (pixels[pixelIndex + 2] / 255.0 - 0.5) / 0.5;
                        
                        // NCHW format
                        tensorData[0 * 224 * 224 + y * 224 + x] = r;
                        tensorData[1 * 224 * 224 + y * 224 + x] = g;
                        tensorData[2 * 224 * 224 + y * 224 + x] = b;
                    }
                }
                
                resolve(tensorData);
            } catch (err) {
                reject(err);
            }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageData;
    });
}

/**
 * Apply softmax to convert logits to probabilities
 */
function softmax(logits) {
    const maxLogit = Math.max(...logits);
    const scores = logits.map(l => Math.exp(l - maxLogit));
    const sum = scores.reduce((a, b) => a + b, 0);
    return scores.map(s => s / sum);
}

/**
 * Predict crop disease from an image
 */
export async function predictDisease(imageData) {
    try {
        if (!ortSession) {
            await loadModel();
        }

        console.log('Preprocessing image...');
        const tensorData = await preprocessImage(imageData);
        
        console.log('Creating input tensor...');
        const inputTensor = new ortModule.Tensor('float32', tensorData, [1, 3, 224, 224]);
        
        console.log('Running inference...');
        const inputName = ortSession.inputNames[0];
        const feeds = { [inputName]: inputTensor };
        const results = await ortSession.run(feeds);
        
        const outputName = ortSession.outputNames[0];
        const logits = Array.from(results[outputName].data);
        
        console.log('Raw logits:', logits);
        
        const probabilities = softmax(logits);
        
        const predictions = probabilities.map((score, index) => ({
            label: ID2LABEL[index],
            score: score
        }));
        
        predictions.sort((a, b) => b.score - a.score);
        const topPredictions = predictions.slice(0, 3);
        
        console.log('Prediction results:', topPredictions);

        return topPredictions;

    } catch (error) {
        console.error('Prediction error:', error);
        throw new Error(`Failed to predict disease: ${error.message}`);
    }
}

/**
 * Preload the model in the background
 */
export function preloadModel() {
    if (!ortSession && !isLoading) {
        loadModel().catch(error => {
            console.warn('Background model preload failed:', error);
        });
    }
}

/**
 * Get human-readable disease name from model label
 */
export function getDiseaseName(label) {
    return DISEASE_CLASSES[label] || label;
}
