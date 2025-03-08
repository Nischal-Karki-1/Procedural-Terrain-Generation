
# 🚀Procedural Terrain Generation

<p align="center">
  <img src="https://github.com/user-attachments/assets/0744cf99-e4f8-468d-b392-6ae13b7bd503" width="500" alt="ProjectDemoVideo">
</p>

## 🌄 Overview

This project demonstrates the power of procedural terrain generation using ray-marching techniques and advanced GLSL shading. Unlike traditional methods that rely on predefined terrains, this approach creates landscapes dynamically using mathematical functions and algorithms, resulting in diverse and intricate environments suitable for video games, simulations, and virtual reality applications.

## ✨ Features

- **Ray-Marching Algorithm**: Iteratively traces view rays from the camera to efficiently render complex terrains
- **Fractal Brownian Motion (FBM)**: Creates natural-looking variations in terrain height using multi-octave noise
- **Dynamic Water Simulation**: Realistic water surfaces with ripples and reflections
- **Advanced Lighting Models**:
  - Lambertian reflectance for diffuse lighting
  - Phong reflection model for specular highlights
  - Ambient occlusion for realistic shading
- **Soft Shadows**: Simulates realistic shadow effects with penumbra
- **Atmospheric Effects**: Sky rendering with fog and sun positioning
- **Terrain Texturing**: Distinct visual styling for volcanic areas and coastal regions

## 💻 Tech Stack

- **GLSL** (OpenGL Shading Language)
- **Python 3.7+**
- **ModernGL 5.8.2+**: For OpenGL context creation and management
- **NumPy**: For mathematical operations
- **Pillow**: For image processing
- **GLFW/pygame**: For window management

## 🔍 Implementation Highlights

- **Vertex Shader**: Processes input vertices and prepares geometry for rasterization
- **Fragment Shader**: Determines the final appearance of each pixel on screen
- **Noise Functions**: Create random terrain details at various scales
- **Soft Shadow Mapping**: Traces rays toward light sources to calculate shadow softness
- **Water Rendering**: Uses sinusoidal functions to simulate dynamic ripples

## 🌊 Visual Effects

- Mountains and valleys using FBM and multi-octave noise
- Water surfaces with realistic ripples and reflections
- Volcanic landscapes with appropriate texturing
- Coastal areas with gradual color transitions

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/procedural-terrain-generation.git
cd procedural-terrain-generation
```

### 2. Create and Activate Virtual Environment

For Linux/MacOS:
```bash
python -m venv terrain_env
source terrain_env/bin/activate
```

For Windows:
```bash
python -m venv terrain_env
terrain_env\Scripts\activate
```

### 3. Install Python Dependencies

```bash
pip install numpy Pillow moderngl==5.8.2 PyOpenGL PyOpenGL-accelerate glfw
```

### 4. System-specific OpenGL Dependencies

For Ubuntu/Debian:
```bash
sudo apt-get install libgl1-mesa-dev xorg-dev
```

For Fedora/RHEL:
```bash
sudo dnf install mesa-libGL-devel xorg-x11-server-devel
```

For macOS:
```bash
brew install glfw3
```

For Windows:
Most dependencies are included with the Python packages above

### 5. Run the Application

```bash
python main.py
```

## 📌 Requirements

- **Minimum Hardware**:
  - Memory: 4GB RAM
  - Graphics: OpenGL 3.3+ compatible GPU
  - OS: Cross-platform (Windows/macOS/Linux)

## 🔮 Future Enhancements

- Procedural vegetation generation
- Enhanced terrain collision detection
- Cloud and weather simulation
- Day/night cycle
- Customizable terrain parameters via UI

## 📚 References

- [Coder Space YouTube Channel](https://www.youtube.com/channel/UCwe6kcllhainHICL1vnq41g) - Shader tutorials and techniques
- [GLSL Documentation](https://docs.gl/sl4/dot) - Official GLSL language reference
- [ModernGL Documentation](https://moderngl.readthedocs.io/en/5.8.2/) - Python wrapper for modern OpenGL
