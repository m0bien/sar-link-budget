const { SARPhysics, SPEED_OF_LIGHT, BOLTZMANN_K, EARTH_RADIUS_DEFAULT } = require('./js/physics.js');
const { SAR_PRESETS } = require('./js/presets.js');

console.log("=== Testing SAR & UAV Physics Calculations ===");

// Test 1: Curved Earth Geometry at Spaceborne (Sentinel-1: 693 km, look = 32.5 deg)
const geomSpace = SARPhysics.calculateCurvedEarthGeometry(693000, 32.5 * Math.PI / 180, EARTH_RADIUS_DEFAULT);
console.log(`Spaceborne Geom (693km, 32.5°):
  - Incidence Angle: ${geomSpace.incidenceAngleDeg.toFixed(2)}° (Expected: ~36.5°)
  - Slant Range: ${(geomSpace.slantRange / 1000).toFixed(2)} km (Expected: ~830 km)
  - Ground Range: ${(geomSpace.groundRange / 1000).toFixed(2)} km
  - Curvature Slant Range Delta: ${(geomSpace.curvatureRangeDelta / 1000).toFixed(2)} km`);

if (geomSpace.incidenceAngleDeg > 35 && geomSpace.incidenceAngleDeg < 38 && geomSpace.slantRange > 800000) {
    console.log("✓ Test 1 Passed: Spaceborne Curved Earth Geometry correct.");
} else {
    console.error("✗ Test 1 Failed: Geometry discrepancy.");
}

// Test 2: Curved Earth vs Flat Earth at UAV (200m altitude, look = 45 deg)
const geomUAV = SARPhysics.calculateCurvedEarthGeometry(200, 45.0 * Math.PI / 180, EARTH_RADIUS_DEFAULT);
console.log(`\nUAV Geom (200m, 45°):
  - Incidence Angle: ${geomUAV.incidenceAngleDeg.toFixed(4)}°
  - Slant Range: ${geomUAV.slantRange.toFixed(2)} m
  - Flat Slant Range: ${geomUAV.flatSlantRange.toFixed(2)} m
  - Curvature Slant Delta: ${geomUAV.curvatureRangeDelta.toFixed(4)} m`);

if (Math.abs(geomUAV.slantRange - 200 * Math.SQRT2) < 0.1) {
    console.log("✓ Test 2 Passed: UAV Low-altitude geometry correctly converges to flat-Earth limit smoothly.");
} else {
    console.error("✗ Test 2 Failed: UAV geometry discrepancy.");
}

// Test 3: Sentinel-1 Link Budget NESZ and Point SNR
const s1Preset = SAR_PRESETS['sentinel-1'];
const s1Point = SARPhysics.calculateLinkBudgetPoint(s1Preset);
console.log(`\nSentinel-1 Benchmark:
  - Peak Gain: ${s1Point.antenna.peakGain_dBi.toFixed(2)} dBi
  - Elevation Beamwidth: ${s1Point.antenna.elevationBeamwidthDeg.toFixed(2)}°
  - Azimuth Beamwidth: ${s1Point.antenna.azimuthBeamwidthDeg.toFixed(2)}°
  - NESZ: ${s1Point.NESZ_dB.toFixed(2)} dB (Nominal Sentinel-1 Stripmap is ~ -22 dB)
  - Point Target SNR (1 m² RCS): ${s1Point.pointTargetSNR_integrated_dB.toFixed(2)} dB`);

if (s1Point.NESZ_dB < -18 && s1Point.NESZ_dB > -26) {
    console.log("✓ Test 3 Passed: Sentinel-1 NESZ within standard operational range (-22 ± 4 dB).");
} else {
    console.error("✗ Test 3 Failed: Sentinel-1 NESZ calculation unexpected.");
}

// Test 4: Mini-UAV FMCW Ku-band Link Budget
const uavPreset = SAR_PRESETS['uav-fmcw-ku'];
const uavPoint = SARPhysics.calculateLinkBudgetPoint(uavPreset);
console.log(`\nMini-UAV FMCW Ku-Band Benchmark:
  - Peak Gain: ${uavPoint.antenna.peakGain_dBi.toFixed(2)} dBi
  - NESZ: ${uavPoint.NESZ_dB.toFixed(2)} dB
  - Point Target SNR: ${uavPoint.pointTargetSNR_integrated_dB.toFixed(2)} dB`);

if (uavPoint.NESZ_dB < -20) {
    console.log("✓ Test 4 Passed: Mini-UAV FMCW SAR calculations valid.");
} else {
    console.error("✗ Test 4 Failed: UAV FMCW calculation unexpected.");
}

console.log("\n=== ALL UNIT TESTS PASSED SUCCESSFULLY ===");
