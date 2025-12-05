// Next.js API route for Hugging Face inference
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // This API route is no longer used for inference
        // The app now uses browser-based inference with Transformers.js
        // 
        // This endpoint is kept for backward compatibility

        return res.status(200).json({
            message: 'Inference now runs in the browser using Transformers.js',
            info: 'The crop disease detection model is loaded and executed directly in your browser for faster predictions and better privacy. No server-side API calls are needed.',
            implementation: 'Browser-based inference with @xenova/transformers',
            model: 'wambugu71/crop_leaf_diseases_vit',
            benefits: [
                'Faster predictions after initial model load',
                'Better privacy - images never leave your device',
                'No API rate limits',
                'Works offline after model is cached'
            ]
        });

    } catch (error) {
        console.error('API route error:', error);
        return res.status(500).json({ error: error.message });
    }
}

// Increase body size limit for images
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};
