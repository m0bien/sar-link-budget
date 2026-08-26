/**
 * SAR System Presets (Spaceborne and UAV / Airborne)
 */

const SAR_PRESETS = {
    // ==========================================
    // SPACEBORNE SAR PRESETS
    // ==========================================
    "sentinel-1": {
        name: "Sentinel-1 (ESA C-band)",
        category: "Spaceborne",
        description: "Copernicus C-band operational SAR satellite at 693 km LEO orbit.",
        isSpaceborne: true,
        isFMCW: false,
        altitude_m: 693000,
        platformVelocity_mps: null, // automatic Keplerian ~7500 m/s
        freqHz: 5.405e9, // 5.405 GHz (C-band)
        lookAngleDeg: 32.5,
        peakPower_W: 4000,
        pulseDuration_s: 37e-6, // 37 us
        prf_Hz: 1650,
        chirpBandwidth_Hz: 42.87e6, // 42.87 MHz (Stripmap)
        antLengthAz_m: 12.3,
        antWidthEl_m: 0.82,
        apertureEfficiency: 0.70,
        noiseFigure_dB: 3.2,
        systemLosses_dB: 3.5,
        atmosphericLoss_dB: 0.5,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -15.0,
        processedAzimuthRes_m: 5.0
    },

    "terrasar-x": {
        name: "TerraSAR-X (DLR/Airbus X-band)",
        category: "Spaceborne",
        description: "High-resolution commercial X-band SAR at 514 km orbit.",
        isSpaceborne: true,
        isFMCW: false,
        altitude_m: 514000,
        platformVelocity_mps: null,
        freqHz: 9.65e9, // 9.65 GHz (X-band)
        lookAngleDeg: 34.0,
        peakPower_W: 2260,
        pulseDuration_s: 30e-6,
        prf_Hz: 3500,
        chirpBandwidth_Hz: 150e6, // 150 MHz
        antLengthAz_m: 4.8,
        antWidthEl_m: 0.70,
        apertureEfficiency: 0.65,
        noiseFigure_dB: 3.8,
        systemLosses_dB: 3.0,
        atmosphericLoss_dB: 0.6,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -15.0,
        processedAzimuthRes_m: 3.0
    },

    "alos2-palsar": {
        name: "ALOS-2 PALSAR-2 (JAXA L-band)",
        category: "Spaceborne",
        description: "L-band deep foliage / soil moisture SAR at 628 km orbit.",
        isSpaceborne: true,
        isFMCW: false,
        altitude_m: 628000,
        platformVelocity_mps: null,
        freqHz: 1.27e9, // 1.27 GHz (L-band)
        lookAngleDeg: 34.3,
        peakPower_W: 3300,
        pulseDuration_s: 42e-6,
        prf_Hz: 2100,
        chirpBandwidth_Hz: 42e6,
        antLengthAz_m: 9.9,
        antWidthEl_m: 2.9,
        apertureEfficiency: 0.60,
        noiseFigure_dB: 4.0,
        systemLosses_dB: 3.8,
        atmosphericLoss_dB: 0.3,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -15.0,
        processedAzimuthRes_m: 6.0
    },

    "nisar": {
        name: "NISAR (NASA-ISRO L-band)",
        category: "Spaceborne",
        description: "Dual-frequency L/S-band 12m deployable reflector SAR at 747 km.",
        isSpaceborne: true,
        isFMCW: false,
        altitude_m: 747000,
        platformVelocity_mps: null,
        freqHz: 1.25e9, // 1.25 GHz
        lookAngleDeg: 37.0,
        peakPower_W: 3100,
        pulseDuration_s: 25e-6,
        prf_Hz: 1700,
        chirpBandwidth_Hz: 77e6,
        antLengthAz_m: 12.0, // 12m deployable reflector
        antWidthEl_m: 12.0,
        apertureEfficiency: 0.60,
        noiseFigure_dB: 3.5,
        systemLosses_dB: 3.5,
        atmosphericLoss_dB: 0.4,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -18.0,
        processedAzimuthRes_m: 7.0
    },

    "capella-x": {
        name: "Capella Space (Commercial X-band)",
        category: "Spaceborne",
        description: "SmallSat 3.5m deployable reflector X-band constellation at 500 km.",
        isSpaceborne: true,
        isFMCW: false,
        altitude_m: 500000,
        platformVelocity_mps: null,
        freqHz: 9.65e9,
        lookAngleDeg: 30.0,
        peakPower_W: 600,
        pulseDuration_s: 15e-6,
        prf_Hz: 4500,
        chirpBandwidth_Hz: 500e6, // 500 MHz ultra high-res
        antLengthAz_m: 3.5,
        antWidthEl_m: 3.5,
        apertureEfficiency: 0.55,
        noiseFigure_dB: 4.2,
        systemLosses_dB: 3.2,
        atmosphericLoss_dB: 0.6,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -15.0,
        processedAzimuthRes_m: 0.5
    },

    "iceye-x": {
        name: "ICEYE (Commercial X-band SmallSat)",
        category: "Spaceborne",
        description: "Active phased array micro-satellite SAR constellation at 570 km.",
        isSpaceborne: true,
        isFMCW: false,
        altitude_m: 570000,
        platformVelocity_mps: null,
        freqHz: 9.65e9,
        lookAngleDeg: 30.0,
        peakPower_W: 1000,
        pulseDuration_s: 18e-6,
        prf_Hz: 4000,
        chirpBandwidth_Hz: 300e6,
        antLengthAz_m: 3.2,
        antWidthEl_m: 0.40,
        apertureEfficiency: 0.65,
        noiseFigure_dB: 4.0,
        systemLosses_dB: 3.0,
        atmosphericLoss_dB: 0.5,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -15.0,
        processedAzimuthRes_m: 1.0
    },

    // ==========================================
    // UAV / AIRBORNE SAR PRESETS
    // ==========================================
    "uav-fmcw-ku": {
        name: "Mini-Drone FMCW SAR (Ku-band)",
        category: "UAV / Airborne",
        description: "Lightweight FMCW SAR payload on rotary/fixed-wing drone at 200m altitude.",
        isSpaceborne: false,
        isFMCW: true,
        altitude_m: 200,
        platformVelocity_mps: 20.0, // 20 m/s ~ 72 km/h
        freqHz: 15.0e9, // 15 GHz (Ku-band)
        lookAngleDeg: 45.0,
        peakPower_W: 5.0, // 5W Continuous Wave
        pulseDuration_s: 0.001, // 1 ms sweep
        fmcwSweepTime_s: 0.001,
        prf_Hz: 1000, // Sweep rate
        chirpBandwidth_Hz: 600e6, // 600 MHz ultra-wideband
        antLengthAz_m: 0.20, // 20 cm horn / patch array
        antWidthEl_m: 0.12, // 12 cm
        apertureEfficiency: 0.60,
        noiseFigure_dB: 4.5,
        systemLosses_dB: 2.5,
        atmosphericLoss_dB: 0.1,
        systemTemp_K: 290,
        pointTargetRCS_m2: 0.5,
        referenceSigma0_dB: -15.0,
        processedAzimuthRes_m: 0.15
    },

    "tactical-uav-x": {
        name: "Tactical UAV Pulsed SAR (X-band)",
        category: "UAV / Airborne",
        description: "Medium-altitude tactical UAV (e.g. Bayraktar / Shadow class) at 2000m.",
        isSpaceborne: false,
        isFMCW: false,
        altitude_m: 2000,
        platformVelocity_mps: 55.0, // 55 m/s ~ 200 km/h
        freqHz: 9.6e9, // 9.6 GHz
        lookAngleDeg: 40.0,
        peakPower_W: 80.0,
        pulseDuration_s: 4.0e-6,
        prf_Hz: 1800,
        chirpBandwidth_Hz: 300e6,
        antLengthAz_m: 0.50,
        antWidthEl_m: 0.20,
        apertureEfficiency: 0.65,
        noiseFigure_dB: 3.8,
        systemLosses_dB: 2.8,
        atmosphericLoss_dB: 0.2,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -15.0,
        processedAzimuthRes_m: 0.3
    },

    "airborne-c-band": {
        name: "High-Altitude Airborne SAR (C-band)",
        category: "UAV / Airborne",
        description: "Manned / MALE Airborne research platform (e.g. NASA AirSAR/ER-2) at 10,000m.",
        isSpaceborne: false,
        isFMCW: false,
        altitude_m: 10000,
        platformVelocity_mps: 180.0, // 180 m/s ~ 650 km/h
        freqHz: 5.3e9,
        lookAngleDeg: 45.0,
        peakPower_W: 1500,
        pulseDuration_s: 12.0e-6,
        prf_Hz: 2200,
        chirpBandwidth_Hz: 100e6,
        antLengthAz_m: 1.5,
        antWidthEl_m: 0.40,
        apertureEfficiency: 0.68,
        noiseFigure_dB: 3.2,
        systemLosses_dB: 3.0,
        atmosphericLoss_dB: 0.4,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -15.0,
        processedAzimuthRes_m: 1.0
    },

    "uav-fopen-p": {
        name: "UAV Foliage Penetration FOPEN (P/L-band)",
        category: "UAV / Airborne",
        description: "Low-frequency foliage penetration drone at 400m altitude.",
        isSpaceborne: false,
        isFMCW: true,
        altitude_m: 400,
        platformVelocity_mps: 30.0,
        freqHz: 450e6, // 450 MHz (P-band / UHF)
        lookAngleDeg: 50.0,
        peakPower_W: 10.0,
        pulseDuration_s: 0.002,
        fmcwSweepTime_s: 0.002,
        prf_Hz: 500,
        chirpBandwidth_Hz: 150e6,
        antLengthAz_m: 0.8,
        antWidthEl_m: 0.8,
        apertureEfficiency: 0.50,
        noiseFigure_dB: 4.0,
        systemLosses_dB: 2.0,
        atmosphericLoss_dB: 0.1,
        systemTemp_K: 290,
        pointTargetRCS_m2: 1.0,
        referenceSigma0_dB: -12.0,
        processedAzimuthRes_m: 0.5
    }
};

if (typeof window !== 'undefined') {
    window.SAR_PRESETS = SAR_PRESETS;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SAR_PRESETS };
}
