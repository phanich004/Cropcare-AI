# Crop Disease Detection 🌱

A modern, AI-powered web application for detecting crop diseases using TensorFlow.js and Next.js. Upload an image of your crop and get instant disease detection with treatment recommendations.

## ✨ Features

- 🎨 **Premium UI Design** - Modern glassmorphism effects, vibrant gradients, and smooth animations
- 📤 **Drag & Drop Upload** - Easy image upload with drag-and-drop or click-to-browse
- 🤖 **AI-Powered Detection** - Real-time disease detection using TensorFlow.js
- 📊 **Confidence Scores** - Visual confidence indicators for predictions
- 💊 **Treatment Recommendations** - Get actionable treatment advice for detected diseases
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Fast & Efficient** - Client-side inference with no server required

## 🚀 Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd crop-disease-detection
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your trained TensorFlow.js model (see [Model Setup](#-model-setup) below)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧠 Model Setup

This application requires a trained TensorFlow.js model for crop disease detection.

### Adding Your Model

1. Place your model files in the `public/models/` directory:
   - `model.json` - Model architecture and metadata
   - `*.bin` files - Model weights

2. Update the disease classes in `pages/index.js`:
   ```javascript
   const diseaseClasses = [
     {
       name: 'Your Disease Name',
       description: 'Disease description',
       treatment: 'Treatment recommendations'
     },
     // Add more classes...
   ];
   ```

### Converting Your Model

If you have a Keras/TensorFlow model, convert it to TensorFlow.js format:

```bash
pip install tensorflowjs
tensorflowjs_converter --input_format keras \
  path/to/your/model.h5 \
  public/models/
```

### Model Requirements

- **Input Size**: 224x224 pixels (configurable in `preprocessImage` function)
- **Color Channels**: RGB (3 channels)
- **Normalization**: Values scaled to [0, 1]

## 📁 Project Structure

```
crop-disease-detection/
├── public/
│   └── models/              # TensorFlow.js model files
├── pages/
│   ├── _app.js             # Global app configuration
│   └── index.js            # Main application page
├── components/
│   ├── ImageUploader.js    # Image upload component
│   └── PredictionResult.js # Results display component
├── styles/
│   ├── globals.css         # Global styles and design system
│   ├── Home.module.css     # Home page styles
│   └── *.module.css        # Component-specific styles
├── package.json
├── next.config.js
└── README.md
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run export` - Export static site

## 🎨 Design System

The application features a premium design system with:

- **Color Palette**: HSL-based colors with customizable hue and saturation
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Gradients**: Dynamic gradient backgrounds and accents
- **Animations**: Smooth transitions and micro-interactions
- **Typography**: Inter font family from Google Fonts
- **Responsive**: Mobile-first responsive design

## 🔧 Customization

### Changing Colors

Edit CSS custom properties in `styles/globals.css`:

```css
:root {
  --primary-hue: 142;        /* Green hue */
  --primary-sat: 76%;
  --primary-light: 45%;
  
  --accent-hue: 280;         /* Purple hue */
  --accent-sat: 85%;
  --accent-light: 60%;
}
```

### Adjusting Model Input Size

Modify the `preprocessImage` function in `pages/index.js`:

```javascript
const targetSize = 224; // Change to your model's input size
```

## 📝 License

MIT

## ⚠️ Disclaimer

This application is for educational and research purposes. Always consult with agricultural experts and professionals for accurate disease diagnosis and treatment recommendations.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📧 Support

For questions and support, please open an issue in the repository.

---

**Built with ❤️ using Next.js and TensorFlow.js**
