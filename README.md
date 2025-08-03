# 📍 WhatsApp to Uber - Location Link Converter

A modern, sleek web application that instantly converts location links from WhatsApp, Google Maps, and Apple Maps into Uber ride requests with a single click.

![Uber Automation Demo](https://img.shields.io/badge/Status-Live-success)
![Version](https://img.shields.io/badge/Version-2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🎯 Smart Link Detection**: Automatically detects and extracts coordinates from 15+ map link formats
- **🚗 One-Click Uber Integration**: Single button to open location directly in Uber (app + web fallback)
- **🎨 Modern UI**: Clean, responsive design with authentic Uber color palette (#000000, #00D4AA)
- **📱 Cross-Platform**: Seamless experience on desktop and mobile devices
- **🗺️ Multiple Sources**: Google Maps, Apple Maps, WhatsApp location shares, and direct coordinates
- **⚡ Lightning Fast**: Instant coordinate extraction and validation

## 🔗 Supported Link Formats

### Google Maps
- `https://maps.google.com/maps?q=12.935192,77.614177`
- `https://maps.google.com/maps?ll=12.935192,77.614177`
- `https://www.google.com/maps/@12.935192,77.614177,15z`
- `https://maps.google.com/maps?daddr=12.935192,77.614177`
- `https://maps.google.com/maps?cid=123456789@12.935192,77.614177`

### Apple Maps
- `https://maps.apple.com/?ll=12.935192,77.614177`
- `https://maps.apple.com/?daddr=12.935192,77.614177`
- `https://maps.apple.com/place?coordinate=12.916645,77.583374`

## 📱 Uber Integration

The app creates two types of Uber links:

1. **Deep Link** (for mobile apps):
   ```
   uber://?action=setPickup&pickup=my_location&dropoff[latitude]=LAT&dropoff[longitude]=LNG
   ```

2. **Web Link** (fallback):
   ```
   https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=LAT&dropoff[longitude]=LNG
   ```

## 🛠️ Technical Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better development experience
- **CSS3** - Modern styling with glassmorphism and animations
- **Create React App** - Zero-configuration build tool
- **Responsive Design** - Works on all devices

## 📦 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Project Structure
```
src/
├── components/
│   └── LocationConverter.tsx    # Main component
├── App.tsx                      # App wrapper
├── App.css                      # App styles
├── index.tsx                    # Entry point
└── index.css                    # Global styles
```

## 🧪 Testing

The app includes test buttons with example links:
- Google Maps example: `https://www.google.com/maps?q=12.935192,77.614177`
- Apple Maps example: `https://maps.apple.com/?ll=12.935192,77.614177`
- Apple Place example: `https://maps.apple.com/place?coordinate=12.916645,77.583374`

## 📦 Deployment

### Option 1: Netlify
1. Push to GitHub
2. Connect repository to Netlify
3. Deploy automatically

### Option 2: Vercel
1. Import repository to Vercel
2. Deploy with one click

### Option 3: GitHub Pages
```bash
npm run build
# Deploy build folder to GitHub Pages
```

### Option 4: Local Build
```bash
npm run build
# Serve build folder with any static server
```

## 🔒 Privacy & Security

- **No data collection** - everything happens client-side
- **No external API calls** - all processing is local
- **No tracking** - completely private
- **Open source** - you can inspect all the code

## 🎨 UI Features

- **Glassmorphism effects** with backdrop blur
- **Smooth animations** and micro-interactions
- **Loading states** with visual feedback
- **Error handling** with animated notifications
- **Responsive design** for all screen sizes
- **Accessibility** with proper focus states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this code for any purpose.

---

**Built with React 18 + TypeScript for modern web development** 