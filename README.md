# 🏎️ Advanced Car Dashboard Simulator

A fully-featured, interactive car dashboard simulator built with HTML5, CSS3, and vanilla JavaScript. Experience realistic driving mechanics with multiple gauges, engine sounds, drive modes, and advanced features like cruise control and automatic transmission.

![Dashboard Preview](https://img.shields.io/badge/version-2.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 📊 Comprehensive Gauges
- **Speedometer** - Real-time speed display (0-240 km/h) with animated needle
- **Tachometer** - RPM gauge (0-8000 RPM) synchronized with speed and gear
- **Temperature Gauge** - Engine temperature monitoring (heats up during high-speed driving)
- **Fuel Gauge** - Dynamic fuel consumption based on speed and drive mode
- **Gear Indicator** - 6-speed automatic transmission with visual gear display

### 🚗 Drive Modes
Three distinct driving modes with unique characteristics:

| Mode | Max Speed | Acceleration | Fuel Efficiency | Best For |
|------|-----------|--------------|-----------------|----------|
| **ECO** | 160 km/h | Low | High | City driving, fuel saving |
| **NORMAL** | 200 km/h | Medium | Medium | Everyday driving |
| **SPORT** | 240 km/h | High | Low | Performance, racing |

### 🔊 Multiple Engine Sounds
Realistic synthesized engine sounds using Web Audio API:
- **V6** - Classic sports car sound with sawtooth wave
- **V8** - Deep, powerful rumble with lower frequency
- **Electric** - Smooth, futuristic sine wave
- **Turbo** - Aggressive, high-pitched square wave

Each engine type features:
- Dynamic frequency changes based on RPM
- Volume adjustments with speed
- Realistic gear shift sounds
- Brake sound effects

### 🎯 Advanced Features
- **Cruise Control** - Automatically maintain set speed (activate above 30 km/h)
- **Automatic Transmission** - Intelligent 6-speed gearbox with smooth shifts
- **Trip Computer** - Track distance, trip time, and fuel consumption
- **Performance Timer** - 0-100 km/h acceleration measurement
- **Warning System** - Visual alerts for engine temperature and low fuel
- **Day/Night Theme** - Toggle between light and dark dashboard modes

### 🎨 Visual Effects
- **Speed Lines** - Motion blur effect above 150 km/h
- **Speed Warning Flash** - Visual alert when exceeding 200 km/h
- **Animated Needles** - Smooth gauge transitions
- **Glassmorphism Design** - Modern, blurred background effects
- **Responsive Layout** - Works seamlessly on desktop and mobile

## 🎮 Controls

### Keyboard Controls
| Key | Action |
|-----|--------|
| `↑` or `W` | Accelerate |
| `↓` or `S` | Brake |
| `C` | Toggle Cruise Control |

### Mouse/Touch Controls
- **Accelerate Button** - Hold to increase speed
- **Brake Button** - Hold to decrease speed
- **Cruise Button** - Toggle cruise control (only when speed > 30 km/h)
- **Reset Button** - Reset all stats and gauges
- **Theme Toggle** - Switch between day/night mode (☀️/🌙 button)

### Mode Selection
- Click **ECO**, **NORMAL**, or **SPORT** buttons to change drive mode
- Select engine type from dropdown (V6, V8, Electric, Turbo)

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hizbullah599/car-speed-meter.git
   cd car-speed-meter
   ```

2. **Open in browser**
   ```bash
   # Using a local server (recommended)
   python -m http.server 8000
   # Or use XAMPP, WAMP, or any other local server
   ```

3. **Navigate to**
   ```
   http://localhost:8000
   ```

### Direct Usage
Simply open `index.html` in any modern web browser. No build process or dependencies required!

## 📁 Project Structure

```
car-speed-meter/
│
├── index.html          # Main HTML structure
├── style.css           # All styling and animations
├── script.js           # Game logic and audio system
└── README.md           # This file
```

## 🔧 Technical Details

### Technologies Used
- **HTML5** - Semantic structure with SVG gauges
- **CSS3** - Advanced animations, gradients, and glassmorphism
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Web Audio API** - Real-time synthesized engine sounds

### Browser Compatibility
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ⚠️ Internet Explorer - Not supported

### Performance Features
- RequestAnimationFrame for smooth 60fps animations
- Efficient DOM updates with minimal reflows
- Optimized audio context management
- CSS hardware acceleration with transforms

## 🎯 Gameplay Metrics

### Statistics Tracked
- **Max Speed** - Highest speed achieved in session
- **Average Speed** - Real-time average calculation
- **Distance** - Total kilometers traveled
- **Trip Time** - Duration of current session
- **Fuel Consumed** - Liters used based on driving style
- **0-100 Time** - Acceleration performance metric

### Warning Thresholds
- 🔥 **Engine Warning** - Activates above 110°C
- ⛽ **Fuel Warning** - Activates below 15% fuel level
- ⚡ **Speed Warning** - Visual flash above 200 km/h

## 🎨 Customization

### Modifying Speed Limits
Edit `script.js` constants:
```javascript
const MAX_SPEED = 240;  // Maximum speed in km/h
const MAX_RPM = 8000;   // Maximum RPM
```

### Adjusting Drive Modes
Modify the `DRIVE_MODES` object in `script.js`:
```javascript
const DRIVE_MODES = {
    eco: { acceleration: 3, maxSpeed: 160, sound: 0.7, color: '#00ff88' },
    normal: { acceleration: 5, maxSpeed: 200, sound: 1.0, color: '#ffaa00' },
    sport: { acceleration: 8, maxSpeed: 240, sound: 1.3, color: '#ff4444' }
};
```

### Customizing Theme Colors
Edit CSS variables in `style.css`:
```css
:root {
    --bg-primary: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    --accent-color: #00ff88;
    --warning-color: #ff4444;
}
```

## 🐛 Known Issues

- Audio may require user interaction to start (browser autoplay policies)
- Mobile browsers may have reduced audio performance
- Very high speeds (>220 km/h) may cause temperature to max out quickly

## 🔮 Future Enhancements

- [ ] Achievement/Badge system
- [ ] Leaderboard with localStorage
- [ ] Manual transmission mode
- [ ] Weather effects (rain, snow)
- [ ] Multiple car models
- [ ] Gamepad support
- [ ] Save/load sessions
- [ ] Performance graphs and charts

## 📄 License

This project is licensed under the MIT License - feel free to use, modify, and distribute.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 🙏 Acknowledgments

- Inspired by real car dashboards and racing simulators
- Built with passion for automotive enthusiasts
- Sound synthesis using Web Audio API

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Project Link: [https://github.com/yourusername/car-speed-meter](https://github.com/yourusername/car-speed-meter)

---

⭐ **Star this repo if you enjoyed the project!** ⭐

Made with ❤️ and JavaScript
