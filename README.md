# 🛰️ SAR & Radar Link Budget Analyzer (Spaceborne & UAV)

An interactive, client-side, web-based Synthetic Aperture Radar (SAR) and Radar Link Budget tool. It features rigorous **Spherical Earth Curvature Geometry**, **Noise Equivalent Sigma Zero (NESZ)** sensitivity curves across the swath, **Point Target and Distributed Clutter SNR**, **Antenna Beamwidth & Pattern Cuts**, **PRF Timing / Diamond Diagrams**, and unified support for both **Spaceborne (LEO/MEO)** and **Airborne / UAV (Pulsed & FMCW)** platforms.

---

## 🌟 Key Features

- **Multi-Platform Operation**:
  - **Spaceborne Mode (LEO)**: Altitudes from $200\text{ km}$ to $1500\text{ km}$, Keplerian orbit velocity calculation, Earth limb horizon limits, and orbital ground-track speeds.
  - **UAV / Airborne Mode**: Flight altitudes from $20\text{ m}$ to $12,000\text{ m}$, airspeeds ($10 - 250\text{ m/s}$), small form-factor antennas, and micro-range dynamics.
- **Radar Architectures**:
  - **Pulsed SAR**: Pulse duration, PRF, duty cycle, pulse compression, and synthetic aperture integration.
  - **FMCW SAR**: Continuous-wave illumination (100% duty cycle), sweep time, and dechirp processing gain.
- **Rigorous Spherical Earth Geometry**:
  - Numerically stable law of sines & cosines mapping look angle $\theta_{\text{look}}$, local incidence angle $\theta_{\text{inc}}$, Earth central angle $\beta$, and slant range $R$.
  - Real-time display of Spherical Earth vs. Flat Earth delta ($\Delta R$ and $\Delta\theta_{\text{inc}}$).
- **Interactive 2D Ray-Tracing Canvas**:
  - Live cross-section showing Earth curvature, orbit height, nadir line, antenna beam cone, boresight ray, local surface normal, and ground swath.
  - **Click & Drag** directly on the canvas to dynamically steer the radar look angle!
- **Dynamic Curves & Performance Metrics**:
  - **NESZ Sensitivity Profile (dB)** across ground swath with two-way antenna elevation roll-off and reference clutter targets ($\sigma_0$).
  - **Integrated Point Target SNR & Distributed Clutter SNR** across swath.
  - **Antenna Elevation Pattern Cut (dBi / normalized dB)** with sinc² aperture model.
  - **PRF Timing & Blind Zones (Diamond Diagram)** for transmit eclipse and nadir return avoidance.
- **Mission Presets Included**:
  - **Spaceborne**: Sentinel-1 (C-band), TerraSAR-X (X-band), ALOS-2 PALSAR (L-band), NISAR (L-band), Capella Space (X-band), ICEYE (X-band).
  - **UAV / Airborne**: Mini-Drone FMCW (Ku-band), Tactical Drone (X-band), High-Altitude Airborne (C-band), Foliage Penetration FOPEN (P/L-band).
- **Detailed Step-by-Step Link Budget Table**:
  - Complete tabular breakdown of power, antenna gains, path loss, noise spectral density, and processing gains.
- **Data Export & Reporting**:
  - Export swath curve datasets directly to CSV.
  - Export / Import full system configuration as JSON.
  - One-click print-ready PDF summary report.

---

## 🧮 Mathematical Formulation

### 1. Spherical Curved Earth Geometry
$$\sin(\theta_{\text{inc}}) = \frac{R_E + h}{R_E} \sin(\theta_{\text{look}})$$
$$R = \sqrt{R_E^2 \cos^2\theta_{\text{inc}} + 2 R_E h + h^2} - R_E \cos\theta_{\text{inc}}$$
$$\beta = \theta_{\text{inc}} - \theta_{\text{look}}, \quad W_g = R_E \cdot (\beta_{\text{far}} - \beta_{\text{near}})$$

### 2. Noise Equivalent Sigma Zero (NESZ)
$$\text{NESZ}(\theta) = \frac{256 \pi^3 R(\theta)^3 v_s \sin(\theta_{\text{inc}}) k_B T_{\text{sys}} F_n L_{\text{tot}}}{P_{\text{avg}} G_{\text{tx}}(\theta) G_{\text{rx}}(\theta) \lambda^3 \rho_{\text{az}} \cdot \frac{c}{2 B_{\text{rf}}}}$$

### 3. Integrated SAR Point Target SNR
$$\text{SNR}_{\text{pt}} = \frac{P_t G_{\text{tx}} G_{\text{rx}} \lambda^2 \sigma_{\text{pt}}}{(4\pi)^3 R^4 k_B T_{\text{sys}} F_n B_{\text{rf}} L_{\text{tot}}} \cdot (\tau_p B_{\text{rf}}) \cdot N_{\text{pulses}}$$

---

## 🚀 Getting Started & Deployment

This application is **100% client-side** (HTML5, JavaScript, TailwindCSS, Chart.js, KaTeX). No server installation or build step is required!

### Run Locally
Simply clone this repository and open `index.html` in any modern web browser:
```bash
git clone https://github.com/YOUR_USERNAME/sar-link-budget.git
cd sar-link-budget
# Open in browser (Windows)
start index.html
# Or on macOS
open index.html
# Or on Linux
xdg-open index.html
```

### Free Hosting via GitHub Pages
1. Push this repository to GitHub.
2. Go to your repository **Settings** $\rightarrow$ **Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your interactive link budget app will be live at `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/`!

---

## 📁 Repository Structure

```
├── index.html               # Main dashboard UI & layout
├── css/
│   └── styles.css           # Glassmorphic radar styling & KaTeX typography
├── js/
│   ├── physics.js           # Core physics calculations (Curved Earth, NESZ, SNR, PRF)
│   ├── presets.js           # Presets for Spaceborne missions & UAV systems
│   ├── geometry-renderer.js # 2D Canvas interactive ray-tracing renderer
│   ├── charts.js            # Chart.js plot managers
│   └── app.js               # Application state coordinator & CSV/JSON export
├── test_physics.py          # Standalone verification test script
└── README.md                # Documentation and theoretical guide
```

---

## 📄 License
MIT License. Free to use for research, academic, and commercial SAR engineering.
