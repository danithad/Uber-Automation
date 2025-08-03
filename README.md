# 📍 Ride Launcher

A modern React + Vite web application that converts Google Maps and Apple Maps location links to Uber deep links instantly. Launch your ride with one click!

## ✨ Features

- **🔗 Universal Link Support**: Accepts Google Maps and Apple Maps location links
- **📍 Smart Coordinate Extraction**: Automatically extracts latitude and longitude from various link formats
- **🌍 Reverse Geocoding**: Uses OpenStreetMap Nominatim API to convert coordinates to human-readable addresses
- **✅ Confirmation Display**: Shows "You're about to book an Uber to: [Address]" with coordinates
- **🚖 One-Click Uber Launch**: Generates and opens Uber deep links with destination pre-filled
- **💾 Local Storage**: Saves destinations so you can return later and still use them
- **🔄 Auto-Load**: Automatically loads previously saved locations on page refresh
- **⚡ Loading States**: Beautiful loading spinner during API calls
- **❌ Error Handling**: Friendly error messages for failed extractions or API calls
- **📱 Mobile-First**: Responsive design optimized for mobile devices
- **🎨 Modern UI**: Clean, beautiful interface with smooth animations
- **🚀 Fast Performance**: Built with Vite for lightning-fast development and builds

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and TypeScript
- **Vite** - Next-generation frontend tooling
- **TypeScript** - Type-safe development
- **OpenStreetMap Nominatim API** - Reverse geocoding service
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **Vercel** - Deployment and hosting platform

## 📱 How It Works

1. **📋 Paste Link**: Copy and paste a Google Maps or Apple Maps location link
2. **🔍 Extract Location**: App automatically extracts coordinates and fetches the address
3. **✅ Confirm Destination**: Review the destination address and coordinates
4. **🚖 Launch Uber**: Click "Open in Uber" to launch the Uber app with your destination
5. **💾 Auto-Save**: Your destination is saved for future use

## 🔗 Supported Link Formats

### Google Maps
- `https://www.google.com/maps?q=12.935192,77.614177`
- `https://maps.google.com/@12.935192,77.614177,15z`
- `https://www.google.com/maps/place/Location/@12.935192,77.614177`
- `https://goo.gl/maps/xyz123` (after redirect)

### Apple Maps
- `https://maps.apple.com/?ll=12.935192,77.614177`
- `https://maps.apple.com/?q=12.935192,77.614177`

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Development Setup

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/ride-launcher.git
cd ride-launcher
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
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