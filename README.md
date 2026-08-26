# 🛰️ Comprehensive SAR & Radar Link Budget Guide

Welcome to the **SAR & Radar Link Budget Analyzer**, an interactive, open-source engineering suite designed for analyzing, visualizing, and optimizing Spaceborne (LEO/MEO) and Airborne/UAV Synthetic Aperture Radar (SAR) systems.

This document provides an exhaustive, mathematically rigorous tutorial and reference for all core concepts in **SAR Link Budget Engineering**, **Spherical Earth Geometry**, **Noise Equivalent Sigma Zero (NESZ)**, **Point & Distributed Target Signal-to-Noise Ratios (SNR)**, **Antenna Radiation Patterns**, and **PRF Timing & Ambiguities**.

---

## 📑 Table of Contents

1. [Fundamentals of Synthetic Aperture Radar (SAR)](#1-fundamentals-of-synthetic-aperture-radar-sar)
   - [Real Aperture vs. Synthetic Aperture](#real-aperture-vs-synthetic-aperture)
   - [Spaceborne vs. UAV / Airborne Dynamics](#spaceborne-vs-uav--airborne-dynamics)
   - [Pulsed vs. FMCW Radar Architectures](#pulsed-vs-fmcw-radar-architectures)
2. [Rigorous Spherical Earth Geometry](#2-rigorous-spherical-earth-geometry)
   - [Look Angle vs. Local Incidence Angle](#look-angle-vs-local-incidence-angle)
   - [Curved Earth Slant Range & Horizon Limits](#curved-earth-slant-range--horizon-limits)
   - [Earth Curvature vs. Flat-Earth Approximation Errors](#earth-curvature-vs-flat-earth-approximation-errors)
   - [Swath Width & Footprint Geometry](#swath-width--footprint-geometry)
3. [Radar Waveforms & Resolution Theory](#3-radar-waveforms--resolution-theory)
   - [Chirp Bandwidth and Slant Range Resolution](#chirp-bandwidth-and-slant-range-resolution)
   - [Ground Range Resolution](#ground-range-resolution)
   - [Azimuth Resolution & The Stripmap Limit (La/2)](#azimuth-resolution--the-stripmap-limit-la2)
4. [Antenna Theory & Radiation Patterns](#4-antenna-theory--radiation-patterns)
   - [Aperture Dimensions & Directive Gain](#aperture-dimensions--directive-gain)
   - [Beamwidths & 2-Way Elevation Pattern Roll-off](#beamwidths--2-way-elevation-pattern-roll-off)
5. [Synthetic Aperture Integration Dynamics](#5-synthetic-aperture-integration-dynamics)
   - [Keplerian Orbital Velocity & Ground Track Velocity](#keplerian-orbital-velocity--ground-track-velocity)
   - [Synthetic Aperture Length (L_sa) & Integration Time (Ta)](#synthetic-aperture-length-l_sa--integration-time-ta)
   - [Doppler Bandwidth (BD)](#doppler-bandwidth-bd)
6. [The Complete SAR Link Budget & Point Target SNR](#6-the-complete-sar-link-budget--point-target-snr)
   - [The Monostatic Radar Range Equation](#the-monostatic-radar-range-equation)
   - [Pulse Compression Gain](#pulse-compression-gain)
   - [Azimuth Coherent Integration Gain](#azimuth-coherent-integration-gain)
   - [Thermal Noise, Receiver Noise Figure & System Losses](#thermal-noise-receiver-noise-figure--system-losses)
   - [Integrated Point Target SNR Formula](#integrated-point-target-snr-formula)
7. [Noise Equivalent Sigma Zero (NESZ / σ0_NE)](#7-noise-equivalent-sigma-zero-nesz--σ0_ne)
   - [Physical Meaning of NESZ](#physical-meaning-of-nesz)
   - [Complete Mathematical Derivation](#complete-mathematical-derivation)
   - [Variation Across the Swath](#variation-across-the-swath)
   - [Distributed Clutter SNR (SNR_dist)](#distributed-clutter-snr-snr_dist)
8. [Timing Constraints & PRF Selection (The Diamond Diagram)](#8-timing-constraints--prf-selection-the-diamond-diagram)
   - [Doppler Aliasing Lower Bound (PRF_min)](#doppler-aliasing-lower-bound-prf_min)
   - [Range Ambiguity Upper Bound (PRF_max)](#range-ambiguity-upper-bound-prf_max)
   - [Transmit Blind Zones & Nadir Return Eclipse](#transmit-blind-zones--nadir-return-eclipse)
9. [The Interactive Web Application Guide](#9-the-interactive-web-application-guide)
   - [Interactive Canvas Ray-Tracing](#interactive-canvas-ray-tracing)
   - [Built-In Mission Presets](#built-in-mission-presets)
   - [Export & GitHub Pages Hosting](#export--github-pages-hosting)

---

## 1. Fundamentals of Synthetic Aperture Radar (SAR)

### Real Aperture vs. Synthetic Aperture
In conventional **Real Aperture Radar (RAR)**, the along-track (azimuth) angular resolution is determined purely by the physical antenna length $L_a$ and carrier wavelength $\lambda$:
$$\theta_{\text{az}} \approx \frac{\lambda}{L_a}$$
The resulting azimuth spatial resolution on the ground at slant range $R$ is:
$$\rho_{\text{az, RAR}} = R \cdot \theta_{\text{az}} \approx \frac{\lambda R}{L_a}$$
For a spaceborne satellite at $R = 800\text{ km}$ operating at C-band ($\lambda = 5.6\text{ cm}$) with a $10\text{ m}$ antenna, the RAR azimuth resolution would be an unusable **$4.48\text{ km}$**!

**Synthetic Aperture Radar (SAR)** overcomes this physical limitation by taking advantage of the forward motion of the radar platform. By coherently recording the amplitude and Doppler phase history of echoes as the radar illuminates a target over a synthetic aperture length $L_{\text{sa}}$, the system synthesizes an effective antenna of length $L_{\text{sa}} = \lambda R / L_a$. The resulting theoretical resolution limit becomes:
$$\rho_{\text{az, SAR}} = \frac{L_a}{2}$$
**Crucially, SAR azimuth resolution is completely independent of slant range and wavelength!** A smaller physical antenna yields a wider beam, longer illumination time, and finer resolution.

```
                  Real Aperture Radar vs. Synthetic Aperture Radar
       
   Satellite Flight Path ---> ---> ---> ---> ---> --->
      [===]             [===]             [===]
        \                 |                 /
         \                |                /    <--- Coherent Doppler Phase Integration
          \               |               /          over Synthetic Aperture L_sa
           \              |              /
            \             |             /
             ▼            ▼            ▼
                   Target on Ground
```

---

### Spaceborne vs. UAV / Airborne Dynamics

| Parameter | Spaceborne SAR (LEO) | UAV / Drone SAR |
| :--- | :--- | :--- |
| **Altitude ($h$)** | $300\text{ km} - 1000\text{ km}$ | $20\text{ m} - 5000\text{ m}$ |
| **Platform Velocity ($v$)** | $\sim 7000 - 7600\text{ m/s}$ (Orbital) | $15 - 100\text{ m/s}$ (Airspeed) |
| **Two-Way Range Spreading ($R^4$)** | Huge ($10^{23} - 10^{24}\text{ m}^4$) | Small ($10^9 - 10^{14}\text{ m}^4$) |
| **Transmit Power ($P_t$)** | Hundreds to Thousands of Watts ($1 - 5\text{ kW}$) | Fractions of a Watt to Tens of Watts ($1 - 50\text{ W}$) |
| **Earth Curvature Effect** | **Critical** ($\Delta R \sim 10 - 50\text{ km}$) | Minimal ($\Delta R < 0.1\text{ m}$), converges to flat Earth |
| **Typical Payloads** | High-power TWT / Active Phased Array Pulsed | Lightweight FMCW or compact pulsed Transceivers |

---

### Pulsed vs. FMCW Radar Architectures

1. **Pulsed SAR**:
   - Transmits short, high-energy frequency-modulated pulses (chirps) of duration $\tau_p$ (typically $10 - 50\ \mu\text{s}$) repeated at a rate $\text{PRF}$.
   - Duty cycle: $D_c = \tau_p \cdot \text{PRF}$ (typically $1\% - 10\%$).
   - Average power: $P_{\text{avg}} = P_t \cdot D_c$.
   - Switchable T/R duplexer isolates the sensitive receiver during pulse transmission.

2. **FMCW (Frequency-Modulated Continuous-Wave) SAR**:
   - Transmits a continuous linear frequency ramp over sweep duration $T_{\text{sweep}}$.
   - Duty cycle: $D_c \approx 100\%$, meaning $P_{\text{avg}} = P_t$.
   - Eliminates high peak-power transmitters (ideal for low-SWaP drone systems).
   - Receiver uses **dechirp-on-receive** (mixing the echo with the instantaneous transmit chirp to produce beat frequencies mapped to slant range).

---

## 2. Rigorous Spherical Earth Geometry

```
                    Platform / Satellite (S)
                             *
                            /|
                           / |
              Slant Range /  |
                     (R) /   | Altitude (h)
                        /    |
                       / θ_lk|
                      /      |
                     /       |
                    /        |
                   /         |
                  /          |
    Surface      *...........* Nadir Point (N)
    Target (T)  /  θ_inc     .
               /  .          .
              / .            .
             /.              .
            * Earth Center (C)
                 Radius R_E
```

### Look Angle vs. Local Incidence Angle
Let:
- $R_E$: Earth radius ($6378.137\text{ km}$ WGS-84 standard).
- $h$: Platform altitude above ground.
- $R_s = R_E + h$: Platform distance from Earth center.
- $\theta_{\text{look}}$ (or $\eta$): Off-nadir look angle.
- $\theta_{\text{inc}}$: Local incidence angle on the spherical Earth surface.
- $\beta$: Earth central angle subtended between Nadir and the target.

Applying the **Spherical Law of Sines** to triangle $\triangle CST$:
$$\frac{\sin(\theta_{\text{inc}})}{R_s} = \frac{\sin(\theta_{\text{look}})}{R_E}$$
$$\sin(\theta_{\text{inc}}) = \left(\frac{R_E + h}{R_E}\right) \sin(\theta_{\text{look}})$$

Since $\theta_{\text{inc}} = \theta_{\text{look}} + \beta$, the Earth central angle is:
$$\beta = \theta_{\text{inc}} - \theta_{\text{look}}$$

---

### Curved Earth Slant Range & Horizon Limits
By applying the **Law of Cosines** on $\triangle CST$:
$$R_E^2 = R_s^2 + R^2 - 2 R_s R \cos(\theta_{\text{look}})$$
Solving for the positive physical root of slant range $R$:
$$R = R_s \cos(\theta_{\text{look}}) - \sqrt{R_E^2 - R_s^2 \sin^2(\theta_{\text{look}})}$$

Equivalently, in terms of local incidence angle:
$$R = \sqrt{R_E^2 \cos^2(\theta_{\text{inc}}) + 2 R_E h + h^2} - R_E \cos(\theta_{\text{inc}})$$

**Horizon / Earth Limb Limit**:
The maximum look angle before the radar beam grazes the Earth limb and misses into deep space is:
$$\theta_{\text{look, max}} = \arcsin\left(\frac{R_E}{R_E + h}\right)$$

---

### Earth Curvature vs. Flat-Earth Approximation Errors
If flat Earth were assumed:
$$R_{\text{flat}} = \frac{h}{\cos(\theta_{\text{look}})}, \quad \theta_{\text{inc, flat}} = \theta_{\text{look}}$$
- **For Spaceborne LEO ($h = 700\text{ km}, \theta_{\text{look}} = 35^\circ$)**:
  - Exact Spherical $R = 907.8\text{ km}$, $\theta_{\text{inc}} = 39.7^\circ$.
  - Flat Earth $R_{\text{flat}} = 854.5\text{ km}$, $\theta_{\text{inc, flat}} = 35.0^\circ$.
  - **Error: $\Delta R = 53.3\text{ km}$ ($5.8\%$), $\Delta\theta = 4.7^\circ$!** (Causes massive link budget errors without curved geometry).
- **For UAV Drone ($h = 200\text{ m}, \theta_{\text{look}} = 45^\circ$)**:
  - Exact Spherical $R = 282.85\text{ m}$, $\theta_{\text{inc}} = 45.0018^\circ$.
  - Flat Earth $R_{\text{flat}} = 282.84\text{ m}$, $\theta_{\text{inc, flat}} = 45.0000^\circ$.
  - **Error: $\Delta R < 0.005\text{ m}$, $\Delta\theta < 0.002^\circ$ (Flat Earth is asymptotically exact).**

---

### Swath Width & Footprint Geometry
Given antenna elevation 3-dB beamwidth $\theta_{\text{el}}$, the near-range and far-range look angles are:
$$\theta_{\text{near}} = \theta_{\text{look}} - \frac{\theta_{\text{el}}}{2}, \quad \theta_{\text{far}} = \theta_{\text{look}} + \frac{\theta_{\text{el}}}{2}$$
The curved **Ground Swath Width ($W_g$)** along the arc of the Earth is:
$$W_g = R_E \cdot (\beta_{\text{far}} - \beta_{\text{near}})$$
The **Slant Range Swath Width ($W_r$)** is:
$$W_r = R_{\text{far}} - R_{\text{near}}$$

---

## 3. Radar Waveforms & Resolution Theory

```
   <----------- Chirp Duration (τp) ----------->
   |/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/|
   f_min                                   f_max
   <----------- Chirp Bandwidth (B_rf) -------->
```

### Chirp Bandwidth and Slant Range Resolution
A Linear Frequency Modulated (LFM) chirp sweeps across RF bandwidth $B_{\text{rf}} = |f_{\max} - f_{\min}|$ over duration $\tau_p$.
Upon matched filter compression in the receiver, the pulse width shrinks to $\tau_{\text{comp}} \approx 1 / B_{\text{rf}}$.
The **Slant Range Resolution** (distance separation along the radar line-of-sight) is:
$$\rho_{\text{sr}} = \frac{c \cdot \tau_{\text{comp}}}{2} = \frac{c}{2 B_{\text{rf}}}$$
where $c \approx 2.99792 \times 10^8\text{ m/s}$.

---

### Ground Range Resolution
Projecting the slant range resolution onto the local ground plane introduces a factor of $1 / \sin(\theta_{\text{inc}})$:
$$\rho_{\text{gr}} = \frac{\rho_{\text{sr}}}{\sin(\theta_{\text{inc}})} = \frac{c}{2 B_{\text{rf}} \sin(\theta_{\text{inc}})}$$
> **Observation**: At near nadir ($\theta_{\text{inc}} \to 0^\circ$), ground range resolution degrades drastically ($\rho_{\text{gr}} \to \infty$). Radar requires side-looking angles ($\theta_{\text{inc}} \ge 20^\circ$) to achieve fine ground resolution.

---

### Azimuth Resolution & The Stripmap Limit ($L_a/2$)
As the radar moves at velocity $v$, a point target remains in the antenna main beam over the synthetic aperture length $L_{\text{sa}} = \theta_{\text{az}} \cdot R \approx \frac{\lambda R}{L_a}$.
The synthesized Doppler bandwidth is:
$$B_D = \frac{2 v}{\lambda} \theta_{\text{az}} = \frac{2 v}{L_a}$$
The achievable Doppler time resolution yields the classic **Stripmap SAR Azimuth Resolution Limit**:
$$\rho_{\text{az}} = \frac{v}{B_D} = \frac{L_a}{2}$$

---

## 4. Antenna Theory & Radiation Patterns

```
   Azimuth Length (La)
   +---------------------------------------+
   |                                       | Elevation Width (Wa)
   +---------------------------------------+
```

### Aperture Dimensions & Directive Gain
For a planar planar array or reflector antenna of physical area $A_{\text{phys}} = L_a \cdot W_a$ and aperture efficiency $\eta_{\text{ap}}$ (typically $0.55 - 0.70$):
$$A_{\text{eff}} = \eta_{\text{ap}} \cdot L_a \cdot W_a$$
The peak directive boresight gain is:
$$G = \frac{4\pi}{\lambda^2} A_{\text{eff}} = \frac{4\pi}{\lambda^2} (\eta_{\text{ap}} L_a W_a)$$
In decibels:
$$G_{[\text{dBi}]} = 10 \log_{10}(G)$$

---

### Beamwidths & 2-Way Elevation Pattern Roll-off
The half-power (3-dB) beamwidths in azimuth and elevation are:
$$\theta_{\text{az, 3dB}} \approx 0.886 \frac{\lambda}{L_a}\text{ rad}, \quad \theta_{\text{el, 3dB}} \approx 0.886 \frac{\lambda}{W_a}\text{ rad}$$
For an angle offset $\Delta\theta = \theta - \theta_{\text{boresight}}$ from beam center, the normalized one-way power gain pattern follows a sinc² model:
$$g(\Delta\theta) = \left[ \frac{\sin\left(\pi \frac{0.886}{\theta_{\text{el, 3dB}}} \sin(\Delta\theta)\right)}{\pi \frac{0.886}{\theta_{\text{el, 3dB}}} \sin(\Delta\theta)} \right]^2$$
In monostatic SAR (same antenna for transmit and receive), the two-way antenna gain pattern roll-off is:
$$G_{\text{2-way}}(\Delta\theta) = G^2 \cdot [g(\Delta\theta)]^2$$
This two-way roll-off creates the characteristic **U-shaped smile** in NESZ sensitivity curves across the swath width.

---

## 5. Synthetic Aperture Integration Dynamics

### Keplerian Orbital Velocity & Ground Track Velocity
For circular spaceborne orbits around Earth ($\mu = 3.986004418 \times 10^{14}\text{ m}^3/\text{s}^2$):
$$v_s = \sqrt{\frac{\mu}{R_E + h}}$$
Due to spherical Earth geometry, the velocity of the sub-satellite nadir ground track ($v_g$) is slower than platform orbital velocity ($v_s$):
$$v_g = v_s \left(\frac{R_E}{R_E + h}\right)$$

---

### Synthetic Aperture Length ($L_{\text{sa}}$) & Integration Time ($T_a$)
The dwell time that a target remains illuminated by the radar beam is the **Synthetic Aperture Integration Time ($T_a$)**:
$$T_a = \frac{L_{\text{sa}}}{v_s} = \frac{\lambda R}{2 \rho_{\text{az}} v_s}$$
The total number of coherent pulses integrated across the synthetic aperture is:
$$N_{\text{pulses}} = \lfloor \text{PRF} \cdot T_a \rfloor$$

---

## 6. The Complete SAR Link Budget & Point Target SNR

### The Monostatic Radar Range Equation
The instantaneous received power from a point target of radar cross-section $\sigma_{\text{pt}}$ ($m^2$) for a single uncompressed pulse is:
$$P_r = \frac{P_t \cdot G_{\text{tx}} \cdot G_{\text{rx}} \cdot \lambda^2 \cdot \sigma_{\text{pt}}}{(4\pi)^3 \cdot R^4 \cdot L_{\text{tot}}}$$
where $L_{\text{tot}} = L_{\text{sys}} \cdot L_{\text{atm}}$ represents total hardware and two-way atmospheric attenuation losses.

---

### Processing Gains
SAR achieves massive sensitivity improvements through two independent coherent compression stages:

1. **Range Pulse Compression Gain ($G_{\text{pc}}$)**:
   $$G_{\text{pc}} = \tau_p \cdot B_{\text{rf}} \quad (\text{Time-Bandwidth Product})$$
2. **Azimuth Synthetic Aperture Integration Gain ($G_{\text{az}}$)**:
   $$G_{\text{az}} = N_{\text{pulses}} = \text{PRF} \cdot T_a = \frac{\text{PRF} \cdot \lambda R}{2 \rho_{\text{az}} v_s}$$
3. **Total Coherent Processing Gain**:
   $$G_{\text{proc}} = G_{\text{pc}} \cdot G_{\text{az}} = (\tau_p B_{\text{rf}}) \cdot (\text{PRF} \cdot T_a)$$

---

### Thermal Noise & Receiver Noise Figure
The thermal noise power spectral density at receiver input is:
$$N_0 = k_B \cdot T_{\text{sys}} \cdot F_n$$
where:
- $k_B = 1.380649 \times 10^{-23}\text{ J/K}$ (Boltzmann constant).
- $T_{\text{sys}} = 290\text{ K}$ (Reference standard noise temperature).
- $F_n = 10^{\text{NF}_{\text{dB}}/10}$ (Linear receiver noise figure).

The total noise power across the receiver matched filter bandwidth $B_{\text{rf}}$ is:
$$P_n = N_0 \cdot B_{\text{rf}} = k_B T_{\text{sys}} F_n B_{\text{rf}}$$

---

### Integrated Point Target SNR Formula
Combining the single-pulse radar equation with range and azimuth processing gains yields the fully compressed SAR point target SNR:

$$\text{SNR}_{\text{pt}} = \frac{P_t G^2 \lambda^2 \sigma_{\text{pt}}}{(4\pi)^3 R^4 k_B T_{\text{sys}} F_n B_{\text{rf}} L_{\text{tot}}} \cdot (\tau_p B_{\text{rf}}) \cdot N_{\text{pulses}}$$

$$\text{SNR}_{\text{pt}} = \frac{P_{\text{avg}} \cdot G^2 \cdot \lambda^3 \cdot \sigma_{\text{pt}}}{2 (4\pi)^3 \cdot R^3 \cdot v_s \cdot \rho_{\text{az}} \cdot k_B T_{\text{sys}} F_n L_{\text{tot}}}$$

where $P_{\text{avg}} = P_t \cdot \tau_p \cdot \text{PRF}$.

---

## 7. Noise Equivalent Sigma Zero (NESZ / $\sigma_0^{\text{NE}}$)

```
   NESZ (dB)
      ^
  -15 |        \                      /   <--- Degraded at swath edges (antenna roll-off)
      |         \                    /
  -22 |----------\------------------/---- <--- Ideal Center Swath Floor (-22 dB)
      |           \________________/
  -30 +----------------------------------> Incidence Angle (θ_inc)
                 Near    Center    Far
```

### Physical Meaning of NESZ
While point targets are quantified by their discrete Radar Cross Section $\sigma_{\text{pt}}$ in $\text{m}^2$ or $\text{dBsm}$, distributed targets (such as land, soil, sea, ice, and forests) are continuous clutter fields quantified by their **differential scattering coefficient per unit ground area ($\sigma_0$)**, expressed in $\text{m}^2/\text{m}^2$ or $\text{dB}$.

**Noise Equivalent Sigma Zero (NESZ)** is the value of distributed surface backscatter $\sigma_0$ that produces a Signal-to-Noise Ratio of unity ($0\text{ dB}$).
It defines the **absolute sensitivity limit and noise floor** of the SAR sensor. Any terrain with $\sigma_0 < \text{NESZ}$ will be submerged in sensor noise.

---

### Complete Mathematical Derivation
The radar cross section of a single SAR ground resolution cell ($\rho_{\text{gr}} \times \rho_{\text{az}}$) with backscatter $\sigma_0$ is:
$$\sigma_{\text{cell}} = \sigma_0 \cdot A_{\text{res}} = \sigma_0 \cdot (\rho_{\text{gr}} \cdot \rho_{\text{az}}) = \sigma_0 \cdot \left(\frac{\rho_{\text{sr}}}{\sin\theta_{\text{inc}}} \cdot \rho_{\text{az}}\right) = \sigma_0 \cdot \left(\frac{c}{2 B_{\text{rf}} \sin\theta_{\text{inc}}} \cdot \rho_{\text{az}}\right)$$
Substituting $\sigma_{\text{cell}}$ into the integrated SAR SNR equation and setting $\text{SNR} = 1$ ($0\text{ dB}$) to solve for $\sigma_0 = \text{NESZ}$:
$$\text{NESZ}(\theta) = \frac{256 \pi^3 \cdot R^3(\theta) \cdot v_s \cdot \sin(\theta_{\text{inc}}) \cdot k_B T_{\text{sys}} F_n L_{\text{tot}}}{P_{\text{avg}} \cdot G_{\text{tx}}(\theta) \cdot G_{\text{rx}}(\theta) \cdot \lambda^3 \cdot \rho_{\text{az}} \cdot \left(\frac{c}{2 B_{\text{rf}}}\right)}$$

---

### Key Parameter Dependencies in NESZ:
- **Range Dependence ($R^3$)**: NESZ grows with $R^3$ (unlike point target $R^4$ dependency, because cell area expands with range).
- **Incidence Angle ($\sin\theta_{\text{inc}}$)**: Near-nadir geometries yield lower NESZ, while grazing angles increase NESZ.
- **Power-Aperture Product ($P_{\text{avg}} \cdot A_{\text{eff}}^2$)**: Higher average power and larger antennas dramatically reduce (improve) NESZ.
- **Wavelength ($\lambda^3$)**: Shorter wavelengths (X-band) require less power/antenna size than long wavelengths (L-band) to reach identical NESZ.

---

### Distributed Clutter SNR ($\text{SNR}_{\text{dist}}$)
For any terrain with backscatter $\sigma_0$:
$$\text{SNR}_{\text{dist}} = \frac{\sigma_0}{\text{NESZ}} \implies \text{SNR}_{\text{dist, dB}} = \sigma_{0, \text{dB}} - \text{NESZ}_{\text{dB}}$$

**Typical Terrestrial Backscatter Levels ($\sigma_0$) at C/X-Band:**
- **Urban / Buildings**: $+5\text{ dB}$ to $+15\text{ dB}$ (Bright corner reflectors)
- **Forest Canopy / Dense Vegetation**: $-7\text{ dB}$ to $-12\text{ dB}$
- **Agricultural Fields / Bare Soil**: $-12\text{ dB}$ to $-18\text{ dB}$
- **Calm Water / Smooth Sea / Runways**: $-22\text{ dB}$ to $-32\text{ dB}$ (Specular reflection away from radar)

---

## 8. Timing Constraints & PRF Selection (The Diamond Diagram)

Selecting the Pulse Repetition Frequency ($\text{PRF}$) is one of the most critical optimization challenges in spaceborne SAR design. The valid PRF operating range is tightly constrained between Doppler aliasing and range ambiguities.

```
   PRF (Hz)
      ^
 4000 |   [XXXXXXXXX Range Ambiguity Limit XXXXXXXXX]  PRF_max = c / (2 * Wr)
      |   ===========================================
      |             VALID PRF OPERATING ZONE (Diamond)
      |   ===========================================
 1500 |   [XXXXXXXXX Doppler Aliasing Limit XXXXXXXX]  PRF_min = 2 * vs / La
      +----------------------------------------------> Swath Look Angle
```

### Doppler Aliasing Lower Bound ($PRF_{\min}$)
To satisfy the Nyquist sampling theorem for the azimuth Doppler bandwidth without aliasing:
$$\text{PRF} \ge B_D \approx \frac{2 v_s}{L_a}$$
If $\text{PRF} < \text{PRF}_{\min}$, Doppler azimuth spectrum folds over, causing severe azimuth ghost targets and ambiguities.

---

### Range Ambiguity Upper Bound ($PRF_{\max}$)
To prevent the echo from the far edge of the current pulse swath from colliding with the echo of the next pulse:
$$\text{PRI} = \frac{1}{\text{PRF}} \ge \frac{2 W_r}{c} + 2\tau_p \implies \text{PRF} \le \frac{c}{2 W_r + 2 c \tau_p}$$

---

### Transmit Blind Zones & Nadir Return Eclipse
1. **Transmit Eclipse (Blind Ranges)**: Since monostatic radars cannot receive while transmitting, the two-way travel time to the swath cannot coincide with the transmission window of any subsequent pulse:
   $$t_{\text{echo}} \pmod{\text{PRI}} \notin [0, \tau_p]$$
2. **Nadir Return Eclipse**: The direct specular return from the sub-satellite point (Nadir, at travel time $t_{\text{nadir}} = 2h/c$) produces an intense clutter spike that must not arrive simultaneously with the desired swath echo:
   $$t_{\text{nadir}} \pmod{\text{PRI}} \notin [t_{\text{near}} \pmod{\text{PRI}}, t_{\text{far}} \pmod{\text{PRI}}]$$

---

## 9. The Interactive Web Application Guide

This repository provides an interactive single-page application implementing all equations in this guide in real time.

```
sar-link-budget/
├── index.html               # Complete Responsive Dashboard UI
├── css/
│   └── styles.css           # Radar glassmorphic aesthetic & KaTeX styling
├── js/
│   ├── physics.js           # Exact Spherical Physics Engine (Curved Earth, NESZ, SNR, PRF)
│   ├── presets.js           # Verified presets (Sentinel-1, TerraSAR-X, UAV FMCW Ku, etc.)
│   ├── geometry-renderer.js # 2D Canvas ray-tracing renderer with interactive drag-to-steer
│   ├── charts.js            # Chart.js managers for NESZ, SNR, Antenna pattern, and PRF
│   └── app.js               # State coordinator, unit conversions & CSV/JSON export
└── test_physics.py          # Python physics validation suite
```

### Interactive Canvas Ray-Tracing
- Visualizes the curved Earth limb, altitude, radar beam cone, boresight ray, and ground swath.
- **Click & Drag**: Click and drag the radar beam on the canvas to steer the look angle dynamically.

### Built-In Mission Presets
- **Sentinel-1 (ESA)**: C-band ($5.405\text{ GHz}$), $693\text{ km}$ LEO, $12.3\text{ m} \times 0.82\text{ m}$ antenna.
- **TerraSAR-X (DLR/Airbus)**: X-band ($9.65\text{ GHz}$), $514\text{ km}$ LEO, high-resolution stripmap.
- **ALOS-2 PALSAR-2 (JAXA)**: L-band ($1.27\text{ GHz}$), deep foliage/soil penetration.
- **NISAR (NASA-ISRO)**: L-band ($1.25\text{ GHz}$), $12\text{ m}$ deployable reflector.
- **Capella Space / ICEYE**: Commercial X-band SmallSat constellations.
- **Mini-UAV FMCW (Ku-band)**: Lightweight $200\text{ m}$ drone payload with continuous-wave dechirp processing.
- **Tactical Drone SAR (X-band)**: Medium-altitude ($2000\text{ m}$) pulsed drone radar.
- **FOPEN Drone SAR (P/L-band)**: Low-frequency ($450\text{ MHz}$) foliage penetration payload.

---

## 🚀 Running & Deploying

1. **Local Run**: Open `index.html` in Chrome, Edge, Safari, or Firefox.
2. **GitHub Pages Deployment**:
   - Push to your GitHub repository.
   - Go to **Settings** $\rightarrow$ **Pages** $\rightarrow$ select `main` branch $\rightarrow$ click **Save**.
   - Your application will be live at [https://m0bien.github.io/sar-link-budget/].

---

## 📚 References & Standards
1. **Curlander, J. C., & McDonough, R. N. (1991)**. *Synthetic Aperture Radar: Systems and Signal Processing*. John Wiley & Sons.
2. **Cumming, I. G., & Wong, F. H. (2005)**. *Digital Processing of Synthetic Aperture Radar Data: Algorithms and Implementation*. Artech House.
3. **Skolnik, M. I. (2008)**. *Radar Handbook (3rd ed.)*. McGraw-Hill.
4. **ESA Sentinel-1 SAR Technical Guide**: *Level-1 Product and Performance Definitions*.

---

## 📄 License
MIT License. Free for academic, scientific, and commercial aerospace engineering.
