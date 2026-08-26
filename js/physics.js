/**
 * SAR & Radar Physics Engine
 * Handles high-precision Curved Earth geometry (from UAV 20m to Spaceborne 2000km),
 * Radar Link Budget, NESZ, Point/Distributed SNR, Antenna Patterns, and PRF Timing.
 */

const SPEED_OF_LIGHT = 299792458; // m/s
const BOLTZMANN_K = 1.380649e-23; // J/K
const EARTH_RADIUS_DEFAULT = 6378137.0; // m (WGS-84 equatorial)
const EARTH_MU = 3.986004418e14; // m^3/s^2 (Standard gravitational parameter)

class SARPhysics {
    /**
     * Compute Keplerian orbital velocity for spaceborne or accept UAV airspeed
     */
    static computePlatformVelocity(altitude_m, isSpaceborne = true, customSpeed_mps = null) {
        if (!isSpaceborne && customSpeed_mps !== null && customSpeed_mps > 0) {
            return customSpeed_mps;
        }
        const r = EARTH_RADIUS_DEFAULT + altitude_m;
        return Math.sqrt(EARTH_MU / r);
    }

    /**
     * Curved Earth Geometry Calculation
     * Uses numerically stable formulations that do not suffer from floating-point
     * cancellation at UAV altitudes (e.g. 50m) or satellite altitudes (e.g. 700km).
     *
     * @param {number} altitude - Platform altitude above Earth surface (m)
     * @param {number} lookAngleRad - Off-nadir / look angle (rad)
     * @param {number} earthRadius - Earth radius (m)
     */
    static calculateCurvedEarthGeometry(altitude, lookAngleRad, earthRadius = EARTH_RADIUS_DEFAULT) {
        const h = altitude;
        const R_E = earthRadius;
        const R_s = R_E + h;
        const theta_look = lookAngleRad;

        // Maximum look angle to Earth limb / horizon
        const sinHorizon = R_E / R_s;
        const horizonLookAngle = Math.asin(Math.min(1.0, sinHorizon));

        // Clamp look angle to just inside horizon to avoid imaginary roots
        const effectiveLookAngle = Math.min(theta_look, horizonLookAngle - 1e-6);

        // Sin of incidence angle from law of sines: sin(theta_inc) = (R_s / R_E) * sin(theta_look)
        const sinInc = (R_s / R_E) * Math.sin(effectiveLookAngle);
        const clampedSinInc = Math.min(1.0, Math.max(0.0, sinInc));
        const theta_inc = Math.asin(clampedSinInc);

        // Earth central angle: beta = theta_inc - theta_look
        const beta = theta_inc - effectiveLookAngle;

        // Slant Range (R) using stable law of cosines:
        // R = R_s * cos(theta_look) - sqrt(R_E^2 - (R_s * sin(theta_look))^2)
        // Or R = sqrt(R_E^2 * cos^2(theta_inc) + 2*R_E*h + h^2) - R_E * cos(theta_inc)
        const cosInc = Math.cos(theta_inc);
        const slantRange = Math.sqrt(R_E * R_E * cosInc * cosInc + 2 * R_E * h + h * h) - R_E * cosInc;

        // Ground range along spherical Earth surface: s = R_E * beta
        const groundRange = R_E * beta;

        // Flat Earth approximation for comparison:
        const flatSlantRange = h / Math.cos(effectiveLookAngle);
        const flatGroundRange = h * Math.tan(effectiveLookAngle);
        const flatIncidenceAngle = effectiveLookAngle;

        return {
            altitude: h,
            earthRadius: R_E,
            lookAngle: effectiveLookAngle,
            lookAngleDeg: (effectiveLookAngle * 180) / Math.PI,
            incidenceAngle: theta_inc,
            incidenceAngleDeg: (theta_inc * 180) / Math.PI,
            earthCentralAngle: beta,
            earthCentralAngleDeg: (beta * 180) / Math.PI,
            slantRange: slantRange,
            groundRange: groundRange,
            flatSlantRange: flatSlantRange,
            flatGroundRange: flatGroundRange,
            flatIncidenceAngleDeg: (flatIncidenceAngle * 180) / Math.PI,
            curvatureRangeDelta: slantRange - flatSlantRange,
            curvatureIncDeltaDeg: (theta_inc * 180 / Math.PI) - (flatIncidenceAngle * 180 / Math.PI),
            horizonLookAngleDeg: (horizonLookAngle * 180) / Math.PI
        };
    }

    /**
     * Compute Antenna Beamwidths and Gains
     */
    static calculateAntennaParameters(freqHz, antLengthAz_m, antWidthEl_m, apertureEfficiency = 0.65) {
        const lambda = SPEED_OF_LIGHT / freqHz;
        
        // 3-dB beamwidths (rad) for uniform aperture ~ 0.886 * lambda / L
        const azimuthBeamwidthRad = 0.886 * (lambda / antLengthAz_m);
        const elevationBeamwidthRad = 0.886 * (lambda / antWidthEl_m);

        // Physical and effective area
        const physicalArea = antLengthAz_m * antWidthEl_m;
        const effectiveArea = physicalArea * apertureEfficiency;

        // Peak Directive Gain (linear & dBi)
        const peakGainLinear = (4 * Math.PI / (lambda * lambda)) * effectiveArea;
        const peakGain_dBi = 10 * Math.log10(Math.max(1.0, peakGainLinear));

        return {
            wavelength: lambda,
            azimuthBeamwidthRad,
            azimuthBeamwidthDeg: (azimuthBeamwidthRad * 180) / Math.PI,
            elevationBeamwidthRad,
            elevationBeamwidthDeg: (elevationBeamwidthRad * 180) / Math.PI,
            physicalArea,
            effectiveArea,
            peakGainLinear,
            peakGain_dBi
        };
    }

    /**
     * Antenna Pattern Gain at an offset angle from boresight (sinc^2 power pattern)
     */
    static antennaGainPattern(offsetAngleRad, beamwidthRad, peakGainLinear) {
        if (Math.abs(offsetAngleRad) < 1e-7) return peakGainLinear;
        const u = Math.PI * (0.886 / beamwidthRad) * Math.sin(offsetAngleRad);
        if (Math.abs(u) < 1e-6) return peakGainLinear;
        const sinc = Math.sin(u) / u;
        return peakGainLinear * sinc * sinc;
    }

    /**
     * Full Swath Geometry (Near, Center, Far)
     */
    static calculateSwathGeometry(altitude, centerLookAngleDeg, elevationBeamwidthDeg, earthRadius = EARTH_RADIUS_DEFAULT) {
        const centerLookRad = (centerLookAngleDeg * Math.PI) / 180;
        const halfElRad = (elevationBeamwidthDeg * Math.PI) / 360;

        const nearLookRad = Math.max(0.01, centerLookRad - halfElRad);
        const farLookRad = centerLookRad + halfElRad;

        const geomCenter = this.calculateCurvedEarthGeometry(altitude, centerLookRad, earthRadius);
        const geomNear = this.calculateCurvedEarthGeometry(altitude, nearLookRad, earthRadius);
        const geomFar = this.calculateCurvedEarthGeometry(altitude, farLookRad, earthRadius);

        const groundSwathWidth = Math.max(0, geomFar.groundRange - geomNear.groundRange);
        const slantRangeSwathWidth = Math.max(0, geomFar.slantRange - geomNear.slantRange);

        return {
            center: geomCenter,
            near: geomNear,
            far: geomFar,
            groundSwathWidth_m: groundSwathWidth,
            groundSwathWidth_km: groundSwathWidth / 1000,
            slantRangeSwathWidth_m: slantRangeSwathWidth,
            slantRangeSwathWidth_km: slantRangeSwathWidth / 1000
        };
    }

    /**
     * Complete SAR Link Budget Calculation at a given geometry point
     */
    static calculateLinkBudgetPoint(params) {
        const {
            freqHz,
            altitude_m,
            lookAngleDeg,
            peakPower_W,
            pulseDuration_s,
            prf_Hz,
            chirpBandwidth_Hz,
            antLengthAz_m,
            antWidthEl_m,
            apertureEfficiency = 0.65,
            noiseFigure_dB = 3.5,
            systemLosses_dB = 3.0,
            atmosphericLoss_dB = 0.5,
            systemTemp_K = 290.0,
            platformVelocity_mps = null,
            isSpaceborne = true,
            isFMCW = false,
            fmcwSweepTime_s = 0.001,
            pointTargetRCS_m2 = 1.0,
            referenceSigma0_dB = -15.0,
            processedAzimuthRes_m = null
        } = params;

        const lambda = SPEED_OF_LIGHT / freqHz;
        const R_E = params.earthRadius_m || EARTH_RADIUS_DEFAULT;
        const lookAngleRad = (lookAngleDeg * Math.PI) / 180;

        // Geometry
        const geom = this.calculateCurvedEarthGeometry(altitude_m, lookAngleRad, R_E);
        const R = geom.slantRange;
        const theta_inc = geom.incidenceAngle;

        // Velocity
        const v_platform = platformVelocity_mps || this.computePlatformVelocity(altitude_m, isSpaceborne, 50.0);
        // Ground velocity
        const v_ground = v_platform * (R_E / (R_E + altitude_m));

        // Antenna
        const ant = this.calculateAntennaParameters(freqHz, antLengthAz_m, antWidthEl_m, apertureEfficiency);
        const G = ant.peakGainLinear;

        // Resolutions
        const rho_sr = SPEED_OF_LIGHT / (2 * chirpBandwidth_Hz);
        const sinInc = Math.max(0.02, Math.sin(theta_inc));
        const rho_gr = rho_sr / sinInc;

        // Azimuth resolution (Stripmap limit is La / 2)
        const rho_az = processedAzimuthRes_m ? Math.max(antLengthAz_m / 2, processedAzimuthRes_m) : antLengthAz_m / 2;

        // Synthetic Aperture Integration Time
        const integrationTime_s = (lambda * R) / (2 * rho_az * v_platform);

        // Power & Duty Cycle
        let dutyCycle = pulseDuration_s * prf_Hz;
        let avgPower_W = peakPower_W * dutyCycle;

        if (isFMCW) {
            dutyCycle = 1.0;
            avgPower_W = peakPower_W;
        }

        // Noise Calculations
        const F_linear = Math.pow(10, noiseFigure_dB / 10);
        const L_sys_linear = Math.pow(10, systemLosses_dB / 10);
        const L_atm_linear = Math.pow(10, atmosphericLoss_dB / 10);
        const L_total_linear = L_sys_linear * L_atm_linear;
        const L_total_dB = systemLosses_dB + atmosphericLoss_dB;

        // Noise Power Spectral Density N0 = k_B * T_sys * F
        const N0 = BOLTZMANN_K * systemTemp_K * F_linear;

        // Number of pulses integrated in synthetic aperture:
        const nPulses = isFMCW ? Math.max(1, Math.round((1.0 / fmcwSweepTime_s) * integrationTime_s)) 
                               : Math.max(1, Math.round(prf_Hz * integrationTime_s));

        // ==========================================
        // NESZ (Noise Equivalent Sigma Zero) Calculation
        // Standard NASA / ESA / IEEE Spaceborne & Airborne SAR formulation
        // ==========================================
        const numeratorNESZ = 256 * Math.pow(Math.PI, 3) * Math.pow(R, 3) * v_platform * sinInc * N0 * L_total_linear;
        const denominatorNESZ = avgPower_W * G * G * Math.pow(lambda, 3) * rho_az * rho_sr;

        const NESZ_linear = numeratorNESZ / Math.max(1e-25, denominatorNESZ);
        const NESZ_dB = 10 * Math.log10(Math.max(1e-15, NESZ_linear));

        // ==========================================
        // Point Target SNR Calculation
        // ==========================================
        const singlePulseNoise = N0 * chirpBandwidth_Hz * L_total_linear;
        const receivedPowerSingle_W = (peakPower_W * G * G * lambda * lambda * pointTargetRCS_m2) /
                                      (Math.pow(4 * Math.PI, 3) * Math.pow(R, 4));
        const SNR_singlePulse_linear = receivedPowerSingle_W / singlePulseNoise;
        const SNR_singlePulse_dB = 10 * Math.log10(Math.max(1e-10, SNR_singlePulse_linear));

        // Pulse compression gain
        const pulseCompressionGain = isFMCW ? (chirpBandwidth_Hz * fmcwSweepTime_s) : (pulseDuration_s * chirpBandwidth_Hz);
        const azimuthGain = nPulses;
        const totalProcessingGainLinear = pulseCompressionGain * azimuthGain;
        const totalProcessingGain_dB = 10 * Math.log10(Math.max(1, totalProcessingGainLinear));

        const SNR_integrated_linear = SNR_singlePulse_linear * totalProcessingGainLinear;
        const SNR_integrated_dB = 10 * Math.log10(Math.max(1e-10, SNR_integrated_linear));

        // Distributed Target Clutter SNR
        const sigma0_linear = Math.pow(10, referenceSigma0_dB / 10);
        const SNR_dist_linear = sigma0_linear / NESZ_linear;
        const SNR_dist_dB = 10 * Math.log10(Math.max(1e-10, SNR_dist_linear));

        // Doppler Bandwidth
        const dopplerBandwidth_Hz = (2 * v_platform) / antLengthAz_m;

        return {
            geometry: geom,
            antenna: ant,
            wavelength_m: lambda,
            slantRange_m: R,
            slantRange_km: R / 1000,
            groundRange_m: geom.groundRange,
            groundRange_km: geom.groundRange / 1000,
            incidenceAngleDeg: geom.incidenceAngleDeg,
            platformVelocity_mps: v_platform,
            groundVelocity_mps: v_ground,
            
            slantRangeRes_m: rho_sr,
            groundRangeRes_m: rho_gr,
            azimuthRes_m: rho_az,
            
            dutyCycle,
            avgPower_W,
            integrationTime_s,
            pulsesIntegrated: nPulses,
            dopplerBandwidth_Hz,
            
            noisePowerDensity_WHz: N0,
            totalLosses_dB: L_total_dB,
            
            NESZ_linear,
            NESZ_dB,
            
            pointTargetSNR_single_dB: SNR_singlePulse_dB,
            pointTargetSNR_integrated_dB: SNR_integrated_dB,
            processingGain_dB: totalProcessingGain_dB,
            pulseCompressionGain_dB: 10 * Math.log10(Math.max(1, pulseCompressionGain)),
            azimuthIntegrationGain_dB: 10 * Math.log10(Math.max(1, azimuthGain)),
            
            distributedTargetSNR_dB: SNR_dist_dB,
            referenceSigma0_dB
        };
    }

    /**
     * Compute Full Curve profiles across the entire swath
     */
    static generateSwathCurves(params, numPoints = 60) {
        const ant = this.calculateAntennaParameters(params.freqHz, params.antLengthAz_m, params.antWidthEl_m, params.apertureEfficiency);
        const centerLookDeg = params.lookAngleDeg;
        const beamwidthElDeg = ant.elevationBeamwidthDeg;
        
        // Swath bounds
        const minLookDeg = Math.max(1.0, centerLookDeg - 0.75 * beamwidthElDeg);
        const maxLookDeg = centerLookDeg + 0.75 * beamwidthElDeg;

        const results = [];
        const step = (maxLookDeg - minLookDeg) / (numPoints - 1);

        for (let i = 0; i < numPoints; i++) {
            const lookDeg = minLookDeg + i * step;
            const offsetRad = ((lookDeg - centerLookDeg) * Math.PI) / 180;
            
            const point = this.calculateLinkBudgetPoint({ ...params, lookAngleDeg: lookDeg });
            
            const rollOffLinear = Math.pow(this.antennaGainPattern(offsetRad, ant.elevationBeamwidthRad, 1.0), 2);
            const rollOff_dB = 10 * Math.log10(Math.max(1e-4, rollOffLinear));
            
            const neszWithPattern_dB = point.NESZ_dB - rollOff_dB;
            const snrWithPattern_dB = point.pointTargetSNR_integrated_dB + rollOff_dB;
            const distSnrWithPattern_dB = point.referenceSigma0_dB - neszWithPattern_dB;

            results.push({
                lookAngleDeg: lookDeg,
                incidenceAngleDeg: point.incidenceAngleDeg,
                groundRange_km: point.groundRange_km,
                groundRange_m: point.groundRange_m,
                slantRange_km: point.slantRange_km,
                NESZ_ideal_dB: point.NESZ_dB,
                NESZ_pattern_dB: neszWithPattern_dB,
                pointSNR_dB: snrWithPattern_dB,
                distSNR_dB: distSnrWithPattern_dB,
                patternGain_dB: rollOff_dB / 2, // one-way
                groundRangeRes_m: point.groundRangeRes_m
            });
        }

        return {
            points: results,
            swath: this.calculateSwathGeometry(params.altitude_m, centerLookDeg, beamwidthElDeg, params.earthRadius_m)
        };
    }

    /**
     * Compute PRF Diamond Diagram (Timing Constraints: Blind ranges, Nadir return, Doppler limit)
     */
    static calculatePRFTiming(params, prfMin = 500, prfMax = 6000, numPRFs = 60) {
        const ant = this.calculateAntennaParameters(params.freqHz, params.antLengthAz_m, params.antWidthEl_m, params.apertureEfficiency);
        const swath = this.calculateSwathGeometry(params.altitude_m, params.lookAngleDeg, ant.elevationBeamwidthDeg, params.earthRadius_m);
        
        const R_near = swath.near.slantRange;
        const R_far = swath.far.slantRange;
        const h = params.altitude_m;
        const tau_p = params.pulseDuration_s || 20e-6;
        const c = SPEED_OF_LIGHT;

        const t_nadir = (2 * h) / c;
        const t_near = (2 * R_near) / c;
        const t_far = (2 * R_far) / c;

        const prfStep = (prfMax - prfMin) / (numPRFs - 1);
        const data = [];

        const v = params.platformVelocity_mps || this.computePlatformVelocity(h, params.isSpaceborne, 50.0);
        const minDopplerPRF = (2 * v) / params.antLengthAz_m;
        const maxUnambiguousPRF = c / (2 * Math.max(10, R_far - R_near));

        for (let i = 0; i < numPRFs; i++) {
            const prf = prfMin + i * prfStep;
            const pri = 1.0 / prf;

            const echoNearMod = t_near % pri;
            const echoFarMod = t_far % pri;
            const nadirMod = t_nadir % pri;

            const isTxEclipsed = (echoNearMod < tau_p * 1.5) || (echoFarMod < tau_p * 1.5) || 
                                 (echoNearMod > pri - tau_p * 1.5) || (echoFarMod > pri - tau_p * 1.5);

            const isNadirInterfering = (nadirMod >= Math.min(echoNearMod, echoFarMod) - tau_p) &&
                                       (nadirMod <= Math.max(echoNearMod, echoFarMod) + tau_p);

            const isDopplerValid = prf >= minDopplerPRF;
            const isValid = !isTxEclipsed && !isNadirInterfering && isDopplerValid;

            data.push({
                prf,
                pri_us: pri * 1e6,
                echoNearMod_us: echoNearMod * 1e6,
                echoFarMod_us: echoFarMod * 1e6,
                nadirMod_us: nadirMod * 1e6,
                isTxEclipsed,
                isNadirInterfering,
                isDopplerValid,
                isValid
            });
        }

        return {
            minDopplerPRF,
            maxUnambiguousPRF,
            t_nadir_us: t_nadir * 1e6,
            t_near_us: t_near * 1e6,
            t_far_us: t_far * 1e6,
            data
        };
    }
}

if (typeof window !== 'undefined') {
    window.SARPhysics = SARPhysics;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SARPhysics, SPEED_OF_LIGHT, BOLTZMANN_K, EARTH_RADIUS_DEFAULT };
}
