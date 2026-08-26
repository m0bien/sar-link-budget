/**
 * Main Application Coordinator
 */

document.addEventListener('DOMContentLoaded', () => {
    const chartManager = new SARChartManager();
    const renderer = new GeometryRenderer('geometryCanvas');

    // UI Input Elements Map
    const inputs = {
        platformType: document.getElementById('platformType'),
        radarType: document.getElementById('radarType'),
        presetSelect: document.getElementById('presetSelect'),
        
        altitude: document.getElementById('altitude'),
        altitudeVal: document.getElementById('altitudeVal'),
        altitudeUnit: document.getElementById('altitudeUnit'),
        
        velocity: document.getElementById('velocity'),
        velocityVal: document.getElementById('velocityVal'),
        velocityAuto: document.getElementById('velocityAuto'),
        
        freqGHz: document.getElementById('freqGHz'),
        freqGHzVal: document.getElementById('freqGHzVal'),
        
        lookAngleDeg: document.getElementById('lookAngleDeg'),
        lookAngleDegVal: document.getElementById('lookAngleDegVal'),
        
        peakPowerW: document.getElementById('peakPowerW'),
        peakPowerWVal: document.getElementById('peakPowerWVal'),
        
        pulseDurationUs: document.getElementById('pulseDurationUs'),
        pulseDurationUsVal: document.getElementById('pulseDurationUsVal'),
        pulseDurationContainer: document.getElementById('pulseDurationContainer'),
        
        prfHz: document.getElementById('prfHz'),
        prfHzVal: document.getElementById('prfHzVal'),
        
        chirpBwMHz: document.getElementById('chirpBwMHz'),
        chirpBwMHzVal: document.getElementById('chirpBwMHzVal'),
        
        antLengthAz: document.getElementById('antLengthAz'),
        antLengthAzVal: document.getElementById('antLengthAzVal'),
        
        antWidthEl: document.getElementById('antWidthEl'),
        antWidthElVal: document.getElementById('antWidthElVal'),
        
        apertureEff: document.getElementById('apertureEff'),
        apertureEffVal: document.getElementById('apertureEffVal'),
        
        noiseFigure: document.getElementById('noiseFigure'),
        noiseFigureVal: document.getElementById('noiseFigureVal'),
        
        systemLosses: document.getElementById('systemLosses'),
        systemLossesVal: document.getElementById('systemLossesVal'),
        
        atmLoss: document.getElementById('atmLoss'),
        atmLossVal: document.getElementById('atmLossVal'),
        
        pointRCS: document.getElementById('pointRCS'),
        pointRCSVal: document.getElementById('pointRCSVal'),
        
        refSigma0: document.getElementById('refSigma0'),
        refSigma0Val: document.getElementById('refSigma0Val')
    };

    // Metric Badges
    const metrics = {
        neszBadge: document.getElementById('neszBadge'),
        pointSnrBadge: document.getElementById('pointSnrBadge'),
        swathWidthBadge: document.getElementById('swathWidthBadge'),
        groundResBadge: document.getElementById('groundResBadge'),
        azimuthResBadge: document.getElementById('azimuthResBadge'),
        incAngleBadge: document.getElementById('incAngleBadge'),
        slantRangeBadge: document.getElementById('slantRangeBadge'),
        intTimeBadge: document.getElementById('intTimeBadge'),
        antGainBadge: document.getElementById('antGainBadge'),
        beamwidthBadge: document.getElementById('beamwidthBadge')
    };

    // Link Budget Table Container
    const linkBudgetTableBody = document.getElementById('linkBudgetTableBody');

    // Populate Presets in Dropdown
    const populatePresets = () => {
        inputs.presetSelect.innerHTML = '<option value="">-- Select Mission Preset --</option>';
        
        const spaceOptGroup = document.createElement('optgroup');
        spaceOptGroup.label = 'Spaceborne SAR Missions';
        const uavOptGroup = document.createElement('optgroup');
        uavOptGroup.label = 'Airborne & UAV SAR Systems';

        for (const [key, preset] of Object.entries(SAR_PRESETS)) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = preset.name;
            if (preset.isSpaceborne) {
                spaceOptGroup.appendChild(opt);
            } else {
                uavOptGroup.appendChild(opt);
            }
        }
        inputs.presetSelect.appendChild(spaceOptGroup);
        inputs.presetSelect.appendChild(uavOptGroup);
    };

    // Gather Current Parameters from UI
    const getParams = () => {
        const isSpaceborne = inputs.platformType.value === 'spaceborne';
        const isFMCW = inputs.radarType.value === 'fmcw';
        
        let altitude_m = parseFloat(inputs.altitude.value);
        if (isSpaceborne) {
            altitude_m = altitude_m * 1000; // km to m
        }

        const freqHz = parseFloat(inputs.freqGHz.value) * 1e9;
        const lookAngleDeg = parseFloat(inputs.lookAngleDeg.value);
        const peakPower_W = parseFloat(inputs.peakPowerW.value);
        const pulseDuration_s = parseFloat(inputs.pulseDurationUs.value) * 1e-6;
        const prf_Hz = parseFloat(inputs.prfHz.value);
        const chirpBandwidth_Hz = parseFloat(inputs.chirpBwMHz.value) * 1e6;
        const antLengthAz_m = parseFloat(inputs.antLengthAz.value);
        const antWidthEl_m = parseFloat(inputs.antWidthEl.value);
        const apertureEfficiency = parseFloat(inputs.apertureEff.value);
        const noiseFigure_dB = parseFloat(inputs.noiseFigure.value);
        const systemLosses_dB = parseFloat(inputs.systemLosses.value);
        const atmosphericLoss_dB = parseFloat(inputs.atmLoss.value);
        const pointTargetRCS_m2 = parseFloat(inputs.pointRCS.value);
        const referenceSigma0_dB = parseFloat(inputs.refSigma0.value);

        let platformVelocity_mps = null;
        if (inputs.velocityAuto && inputs.velocityAuto.checked && isSpaceborne) {
            platformVelocity_mps = null; // Auto Keplerian
        } else {
            platformVelocity_mps = parseFloat(inputs.velocity.value);
        }

        return {
            isSpaceborne,
            isFMCW,
            altitude_m,
            freqHz,
            lookAngleDeg,
            peakPower_W,
            pulseDuration_s,
            fmcwSweepTime_s: pulseDuration_s,
            prf_Hz,
            chirpBandwidth_Hz,
            antLengthAz_m,
            antWidthEl_m,
            apertureEfficiency,
            noiseFigure_dB,
            systemLosses_dB,
            atmosphericLoss_dB,
            systemTemp_K: 290.0,
            pointTargetRCS_m2,
            referenceSigma0_dB,
            platformVelocity_mps
        };
    };

    // Update Platform Controls based on Spaceborne vs UAV
    const updatePlatformModeUI = () => {
        const isSpaceborne = inputs.platformType.value === 'spaceborne';
        if (isSpaceborne) {
            inputs.altitudeUnit.textContent = 'km';
            inputs.altitude.min = 200;
            inputs.altitude.max = 1500;
            inputs.altitude.step = 5;
            if (parseFloat(inputs.altitude.value) < 150) inputs.altitude.value = 693;
            inputs.altitudeVal.textContent = inputs.altitude.value + ' km';
            
            if (inputs.velocityAuto.checked) {
                const vk = SARPhysics.computePlatformVelocity(parseFloat(inputs.altitude.value) * 1000, true);
                inputs.velocity.value = vk.toFixed(0);
                inputs.velocityVal.textContent = vk.toFixed(0) + ' m/s (Auto Keplerian)';
                inputs.velocity.disabled = true;
            }
        } else {
            inputs.altitudeUnit.textContent = 'm';
            inputs.altitude.min = 20;
            inputs.altitude.max = 12000;
            inputs.altitude.step = 10;
            if (parseFloat(inputs.altitude.value) > 20000 || parseFloat(inputs.altitude.value) === 693) inputs.altitude.value = 300;
            inputs.altitudeVal.textContent = inputs.altitude.value + ' m';
            
            inputs.velocity.disabled = false;
            inputs.velocityAuto.checked = false;
            if (parseFloat(inputs.velocity.value) > 1000) inputs.velocity.value = 30;
            inputs.velocityVal.textContent = inputs.velocity.value + ' m/s';
        }
    };

    // Apply Preset
    const applyPreset = (presetKey) => {
        const p = SAR_PRESETS[presetKey];
        if (!p) return;

        inputs.platformType.value = p.isSpaceborne ? 'spaceborne' : 'uav';
        inputs.radarType.value = p.isFMCW ? 'fmcw' : 'pulsed';
        
        updatePlatformModeUI();

        if (p.isSpaceborne) {
            inputs.altitude.value = (p.altitude_m / 1000).toFixed(0);
            inputs.altitudeVal.textContent = inputs.altitude.value + ' km';
            inputs.velocityAuto.checked = true;
            inputs.velocity.disabled = true;
            const vk = SARPhysics.computePlatformVelocity(p.altitude_m, true);
            inputs.velocity.value = vk.toFixed(0);
            inputs.velocityVal.textContent = vk.toFixed(0) + ' m/s (Keplerian)';
        } else {
            inputs.altitude.value = p.altitude_m;
            inputs.altitudeVal.textContent = inputs.altitude.value + ' m';
            inputs.velocityAuto.checked = false;
            inputs.velocity.disabled = false;
            inputs.velocity.value = p.platformVelocity_mps || 30;
            inputs.velocityVal.textContent = inputs.velocity.value + ' m/s';
        }

        inputs.freqGHz.value = (p.freqHz / 1e9).toFixed(3);
        inputs.freqGHzVal.textContent = inputs.freqGHz.value + ' GHz';

        inputs.lookAngleDeg.value = p.lookAngleDeg;
        inputs.lookAngleDegVal.textContent = p.lookAngleDeg + '°';

        inputs.peakPowerW.value = p.peakPower_W;
        inputs.peakPowerWVal.textContent = p.peakPower_W + ' W';

        inputs.pulseDurationUs.value = (p.pulseDuration_s * 1e6).toFixed(1);
        inputs.pulseDurationUsVal.textContent = inputs.pulseDurationUs.value + ' μs';

        inputs.prfHz.value = p.prf_Hz;
        inputs.prfHzVal.textContent = p.prf_Hz + ' Hz';

        inputs.chirpBwMHz.value = (p.chirpBandwidth_Hz / 1e6).toFixed(1);
        inputs.chirpBwMHzVal.textContent = inputs.chirpBwMHz.value + ' MHz';

        inputs.antLengthAz.value = p.antLengthAz_m;
        inputs.antLengthAzVal.textContent = p.antLengthAz_m + ' m';

        inputs.antWidthEl.value = p.antWidthEl_m;
        inputs.antWidthElVal.textContent = p.antWidthEl_m + ' m';

        inputs.apertureEff.value = p.apertureEfficiency;
        inputs.apertureEffVal.textContent = (p.apertureEfficiency * 100).toFixed(0) + ' %';

        inputs.noiseFigure.value = p.noiseFigure_dB;
        inputs.noiseFigureVal.textContent = p.noiseFigure_dB + ' dB';

        inputs.systemLosses.value = p.systemLosses_dB;
        inputs.systemLossesVal.textContent = p.systemLosses_dB + ' dB';

        inputs.atmLoss.value = p.atmosphericLoss_dB;
        inputs.atmLossVal.textContent = p.atmosphericLoss_dB + ' dB';

        inputs.pointRCS.value = p.pointTargetRCS_m2;
        inputs.pointRCSVal.textContent = p.pointTargetRCS_m2 + ' m²';

        inputs.refSigma0.value = p.referenceSigma0_dB;
        inputs.refSigma0Val.textContent = p.referenceSigma0_dB + ' dB';

        calculateAndRender();
    };

    // Render Link Budget Breakdown Table
    const renderLinkBudgetTable = (params, point) => {
        const lambda = point.wavelength_m;
        const R = point.slantRange_m;
        const pt = params.peakPower_W;
        const pt_dBW = 10 * Math.log10(pt);
        const gain_dBi = point.antenna.peakGain_dBi;
        const lambda_sq_dB = 10 * Math.log10(lambda * lambda);
        const fourPiCubed_dB = 10 * Math.log10(Math.pow(4 * Math.PI, 3));
        const pathLossR4_dB = 10 * Math.log10(Math.pow(R, 4));
        const rcs_dBsm = 10 * Math.log10(params.pointTargetRCS_m2);
        const rxNoise_dBW = 10 * Math.log10(point.noisePowerDensity_WHz * params.chirpBandwidth_Hz);

        const rows = [
            { category: 'Transmitter', param: 'Transmit Peak Power (Pt)', val: `${pt.toFixed(1)} W`, dbVal: `${pt_dBW.toFixed(2)} dBW`, desc: 'Raw RF peak output power' },
            { category: 'Transmitter', param: 'Duty Cycle', val: `${(point.dutyCycle * 100).toFixed(2)} %`, dbVal: `${(10 * Math.log10(point.dutyCycle)).toFixed(2)} dB`, desc: 'Pulse duration × PRF' },
            { category: 'Transmitter', param: 'Average Power (Pavg)', val: `${point.avgPower_W.toFixed(2)} W`, dbVal: `${(10 * Math.log10(point.avgPower_W)).toFixed(2)} dBW`, desc: 'Average radiated power' },
            
            { category: 'Antenna', param: 'Transmit Antenna Gain (Gtx)', val: `${point.antenna.peakGainLinear.toFixed(0)}`, dbVal: `+${gain_dBi.toFixed(2)} dBi`, desc: 'Peak directive aperture gain' },
            { category: 'Antenna', param: 'Receive Antenna Gain (Grx)', val: `${point.antenna.peakGainLinear.toFixed(0)}`, dbVal: `+${gain_dBi.toFixed(2)} dBi`, desc: 'Colocated monostatic receive aperture' },
            { category: 'Antenna', param: 'Wavelength Factor (λ²)', val: `${(lambda * lambda).toExponential(3)} m²`, dbVal: `${lambda_sq_dB.toFixed(2)} dBm²`, desc: 'Free-space isotropic area factor' },
            
            { category: 'Path & Target', param: 'Geometric Spreading (4π)³', val: `1984.4`, dbVal: `-${fourPiCubed_dB.toFixed(2)} dB`, desc: 'Spherical wave propagation constant' },
            { category: 'Path & Target', param: 'Two-Way Range Spreading (R⁴)', val: `${(Math.pow(R, 4)).toExponential(3)} m⁴`, dbVal: `-${pathLossR4_dB.toFixed(2)} dB`, desc: `Slant range R = ${(R/1000).toFixed(2)} km` },
            { category: 'Path & Target', param: 'Target Radar Cross Section (σ)', val: `${params.pointTargetRCS_m2.toFixed(2)} m²`, dbVal: `${rcs_dBsm >= 0 ? '+' : ''}${rcs_dBsm.toFixed(2)} dBsm`, desc: 'Point target reflective cross-section' },
            { category: 'Path & Target', param: 'Atmospheric & Medium Loss', val: `-`, dbVal: `-${params.atmosphericLoss_dB.toFixed(2)} dB`, desc: 'Tropospheric & ionospheric one-way/two-way loss' },
            { category: 'Path & Target', param: 'Hardware & System Losses', val: `-`, dbVal: `-${params.systemLosses_dB.toFixed(2)} dB`, desc: 'Feed, radome, and processing losses' },
            
            { category: 'Receiver & Noise', param: 'Noise Spectral Density (N₀)', val: `${point.noisePowerDensity_WHz.toExponential(3)} W/Hz`, dbVal: `${(10 * Math.log10(point.noisePowerDensity_WHz)).toFixed(2)} dBW/Hz`, desc: 'kB × Tsys × F' },
            { category: 'Receiver & Noise', param: 'Chirp Bandwidth Noise Power', val: `-`, dbVal: `${rxNoise_dBW.toFixed(2)} dBW`, desc: `Bandwidth B = ${(params.chirpBandwidth_Hz/1e6).toFixed(1)} MHz` },
            
            { category: 'Processing Gain', param: 'Pulse Compression Gain', val: `-`, dbVal: `+${point.pulseCompressionGain_dB.toFixed(2)} dB`, desc: 'Time-Bandwidth product (τ × B)' },
            { category: 'Processing Gain', param: 'Azimuth Synthetic Aperture Gain', val: `${point.pulsesIntegrated} pulses`, dbVal: `+${point.azimuthIntegrationGain_dB.toFixed(2)} dB`, desc: `Integration time Ta = ${point.integrationTime_s.toFixed(3)} s` },
            
            { category: 'Performance', param: 'Single Pulse Point Target SNR', val: `-`, dbVal: `${point.pointTargetSNR_single_dB.toFixed(2)} dB`, desc: 'Uncompressed raw pulse SNR' },
            { category: 'Performance', param: 'Integrated SAR Point Target SNR', val: `-`, dbVal: `+${point.pointTargetSNR_integrated_dB.toFixed(2)} dB`, desc: 'Fully compressed SAR point target SNR', highlight: true },
            { category: 'Performance', param: 'Noise Equivalent Sigma Zero (NESZ)', val: `-`, dbVal: `${point.NESZ_dB.toFixed(2)} dB`, desc: 'Sensitivity limit / noise floor per m²', highlight: true, alert: point.NESZ_dB > -10 },
            { category: 'Performance', param: 'Distributed Clutter SNR (at σ₀)', val: `σ₀ = ${point.referenceSigma0_dB} dB`, dbVal: `+${point.distributedTargetSNR_dB.toFixed(2)} dB`, desc: 'Clutter-to-noise ratio over background', highlight: true }
        ];

        linkBudgetTableBody.innerHTML = rows.map(r => `
            <tr class="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors ${r.highlight ? 'bg-sky-950/30 font-semibold' : ''}">
                <td class="px-4 py-2.5 text-xs text-sky-400 font-mono">${r.category}</td>
                <td class="px-4 py-2.5 text-sm text-slate-200">${r.param}</td>
                <td class="px-4 py-2.5 text-xs text-slate-400 font-mono">${r.val}</td>
                <td class="px-4 py-2.5 text-sm font-mono ${r.alert ? 'text-amber-400 font-bold' : (r.highlight ? 'text-emerald-400 font-bold' : 'text-slate-100')}">${r.dbVal}</td>
                <td class="px-4 py-2.5 text-xs text-slate-400">${r.desc}</td>
            </tr>
        `).join('');
    };

    // Master Recalculate & Render Function
    const calculateAndRender = () => {
        const params = getParams();
        
        // Single point at boresight center
        const point = SARPhysics.calculateLinkBudgetPoint(params);
        
        // Swath and curve data
        const curves = SARPhysics.generateSwathCurves(params);
        const swath = curves.swath;

        // Update HUD metric badges
        metrics.neszBadge.textContent = `${point.NESZ_dB.toFixed(1)} dB`;
        metrics.pointSnrBadge.textContent = `${point.pointTargetSNR_integrated_dB.toFixed(1)} dB`;
        
        const swathKm = swath.groundSwathWidth_km;
        metrics.swathWidthBadge.textContent = swathKm < 1.0 ? `${swath.groundSwathWidth_m.toFixed(0)} m` : `${swathKm.toFixed(1)} km`;
        
        metrics.groundResBadge.textContent = `${point.groundRangeRes_m.toFixed(2)} m`;
        metrics.azimuthResBadge.textContent = `${point.azimuthRes_m.toFixed(2)} m`;
        metrics.incAngleBadge.textContent = `${point.incidenceAngleDeg.toFixed(1)}°`;
        
        const slantKm = point.slantRange_km;
        metrics.slantRangeBadge.textContent = slantKm >= 10.0 ? `${slantKm.toFixed(1)} km` : `${point.slantRange_m.toFixed(0)} m`;
        
        metrics.intTimeBadge.textContent = point.integrationTime_s < 0.1 ? `${(point.integrationTime_s * 1000).toFixed(1)} ms` : `${point.integrationTime_s.toFixed(2)} s`;
        metrics.antGainBadge.textContent = `${point.antenna.peakGain_dBi.toFixed(1)} dBi`;
        metrics.beamwidthBadge.textContent = `Az: ${point.antenna.azimuthBeamwidthDeg.toFixed(2)}° | El: ${point.antenna.elevationBeamwidthDeg.toFixed(2)}°`;

        // Update Canvas Geometry Renderer
        renderer.render({
            altitude_m: params.altitude_m,
            lookAngleDeg: params.lookAngleDeg,
            antElevationBwDeg: point.antenna.elevationBeamwidthDeg,
            isSpaceborne: params.isSpaceborne,
            earthRadius_m: 6378137.0
        });

        // Update Charts
        chartManager.updateNESZChart('neszChartCanvas', curves, params.referenceSigma0_dB);
        chartManager.updateSNRChart('snrChartCanvas', curves);
        chartManager.updateAntennaChart('antennaChartCanvas', params);
        chartManager.updatePRFChart('prfChartCanvas', params);

        // Update Detailed Table
        renderLinkBudgetTable(params, point);
    };

    // Attach Event Listeners
    const bindInput = (slider, valSpan, formatFn, callback = calculateAndRender) => {
        if (!slider) return;
        const update = () => {
            if (valSpan && formatFn) valSpan.textContent = formatFn(slider.value);
            callback();
        };
        slider.addEventListener('input', update);
        slider.addEventListener('change', update);
    };

    bindInput(inputs.altitude, inputs.altitudeVal, v => inputs.platformType.value === 'spaceborne' ? `${v} km` : `${v} m`);
    bindInput(inputs.velocity, inputs.velocityVal, v => `${v} m/s`);
    bindInput(inputs.freqGHz, inputs.freqGHzVal, v => `${parseFloat(v).toFixed(2)} GHz`);
    bindInput(inputs.lookAngleDeg, inputs.lookAngleDegVal, v => `${parseFloat(v).toFixed(1)}°`);
    bindInput(inputs.peakPowerW, inputs.peakPowerWVal, v => `${parseFloat(v).toFixed(1)} W`);
    bindInput(inputs.pulseDurationUs, inputs.pulseDurationUsVal, v => `${parseFloat(v).toFixed(1)} μs`);
    bindInput(inputs.prfHz, inputs.prfHzVal, v => `${v} Hz`);
    bindInput(inputs.chirpBwMHz, inputs.chirpBwMHzVal, v => `${v} MHz`);
    bindInput(inputs.antLengthAz, inputs.antLengthAzVal, v => `${v} m`);
    bindInput(inputs.antWidthEl, inputs.antWidthElVal, v => `${v} m`);
    bindInput(inputs.apertureEff, inputs.apertureEffVal, v => `${(parseFloat(v)*100).toFixed(0)} %`);
    bindInput(inputs.noiseFigure, inputs.noiseFigureVal, v => `${v} dB`);
    bindInput(inputs.systemLosses, inputs.systemLossesVal, v => `${v} dB`);
    bindInput(inputs.atmLoss, inputs.atmLossVal, v => `${v} dB`);
    bindInput(inputs.pointRCS, inputs.pointRCSVal, v => `${v} m²`);
    bindInput(inputs.refSigma0, inputs.refSigma0Val, v => `${v} dB`);

    inputs.platformType.addEventListener('change', () => {
        updatePlatformModeUI();
        calculateAndRender();
    });

    inputs.radarType.addEventListener('change', () => {
        const isFMCW = inputs.radarType.value === 'fmcw';
        if (isFMCW) {
            inputs.pulseDurationContainer.querySelector('label span').textContent = 'FMCW Sweep Duration (μs)';
        } else {
            inputs.pulseDurationContainer.querySelector('label span').textContent = 'Pulse Duration (μs)';
        }
        calculateAndRender();
    });

    if (inputs.velocityAuto) {
        inputs.velocityAuto.addEventListener('change', () => {
            updatePlatformModeUI();
            calculateAndRender();
        });
    }

    inputs.presetSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            applyPreset(e.target.value);
        }
    });

    // Canvas Ray-dragging listener
    renderer.onLookAngleChange = (angleDeg) => {
        inputs.lookAngleDeg.value = angleDeg.toFixed(1);
        inputs.lookAngleDegVal.textContent = angleDeg.toFixed(1) + '°';
        calculateAndRender();
    };

    // Export to CSV
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
        const params = getParams();
        const curves = SARPhysics.generateSwathCurves(params, 80);
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'LookAngle_deg,IncidenceAngle_deg,GroundRange_km,SlantRange_km,NESZ_withPattern_dB,NESZ_ideal_dB,PointTargetSNR_dB,DistributedSNR_dB,GroundRangeRes_m\n';
        
        curves.points.forEach(p => {
            csvContent += `${p.lookAngleDeg.toFixed(3)},${p.incidenceAngleDeg.toFixed(3)},${p.groundRange_km.toFixed(3)},${p.slantRange_km.toFixed(3)},${p.NESZ_pattern_dB.toFixed(2)},${p.NESZ_ideal_dB.toFixed(2)},${p.pointSNR_dB.toFixed(2)},${p.distSNR_dB.toFixed(2)},${p.groundRangeRes_m.toFixed(2)}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `sar_link_budget_${params.isSpaceborne ? 'spaceborne' : 'uav'}_${inputs.presetSelect.value || 'custom'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Export JSON Config
    document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
        const params = getParams();
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(params, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', dataStr);
        link.setAttribute('download', 'sar_system_config.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Print / PDF Report
    document.getElementById('printReportBtn')?.addEventListener('click', () => {
        window.print();
    });

    // Initialize App with Default Preset (Sentinel-1)
    populatePresets();
    inputs.presetSelect.value = 'sentinel-1';
    applyPreset('sentinel-1');
});
