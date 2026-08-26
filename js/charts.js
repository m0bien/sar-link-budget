/**
 * Chart Manager for SAR Link Budget Dashboard
 * Handles NESZ Curves, SNR Curves, Antenna Patterns, and PRF Diamond Diagrams.
 */

class SARChartManager {
    constructor() {
        this.neszChart = null;
        this.snrChart = null;
        this.antennaChart = null;
        this.prfChart = null;
        this.initTheme();
    }

    initTheme() {
        if (typeof Chart === 'undefined') return;
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.12)';
        Chart.defaults.font.family = 'Inter, system-ui, -apple-system, sans-serif';
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(56, 189, 248, 0.4)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
    }

    /**
     * Update NESZ Curve Chart
     */
    updateNESZChart(canvasId, curveData, referenceSigma0_dB = -15) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const points = curveData.points;
        const labels = points.map(p => p.incidenceAngleDeg.toFixed(1) + '°');
        const neszPattern = points.map(p => p.NESZ_pattern_dB);
        const neszIdeal = points.map(p => p.NESZ_ideal_dB);
        const refLine = points.map(() => referenceSigma0_dB);

        if (this.neszChart) {
            this.neszChart.data.labels = labels;
            this.neszChart.data.datasets[0].data = neszPattern;
            this.neszChart.data.datasets[1].data = neszIdeal;
            this.neszChart.data.datasets[2].data = refLine;
            this.neszChart.data.datasets[2].label = `Ref Target σ₀ (${referenceSigma0_dB} dB)`;
            this.neszChart.update('none');
            return;
        }

        this.neszChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'NESZ with Antenna Roll-off (dB)',
                        data: neszPattern,
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 1,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'NESZ Ideal / Center Beam (dB)',
                        data: neszIdeal,
                        borderColor: 'rgba(148, 163, 184, 0.6)',
                        borderWidth: 1.5,
                        borderDash: [4, 4],
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: `Ref Target σ₀ (${referenceSigma0_dB} dB)`,
                        data: refLine,
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                        borderDash: [6, 3],
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: {
                        title: { display: true, text: 'Incidence Angle (deg)', color: '#94a3b8', font: { weight: 'bold' } },
                        grid: { color: 'rgba(148, 163, 184, 0.08)' }
                    },
                    y: {
                        title: { display: true, text: 'NESZ (dB)', color: '#94a3b8', font: { weight: 'bold' } },
                        grid: { color: 'rgba(148, 163, 184, 0.08)' }
                    }
                },
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 14, color: '#e2e8f0' } }
                }
            }
        });
    }

    /**
     * Update SNR Chart (Point Target SNR & Distributed Target SNR across swath)
     */
    updateSNRChart(canvasId, curveData) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const points = curveData.points;
        const labels = points.map(p => p.incidenceAngleDeg.toFixed(1) + '°');
        const pointSNR = points.map(p => p.pointSNR_dB);
        const distSNR = points.map(p => p.distSNR_dB);

        if (this.snrChart) {
            this.snrChart.data.labels = labels;
            this.snrChart.data.datasets[0].data = pointSNR;
            this.snrChart.data.datasets[1].data = distSNR;
            this.snrChart.update('none');
            return;
        }

        this.snrChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Integrated Point Target SNR (dB)',
                        data: pointSNR,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 1
                    },
                    {
                        label: 'Distributed Clutter SNR (σ₀ / NESZ) (dB)',
                        data: distSNR,
                        borderColor: '#818cf8',
                        backgroundColor: 'rgba(129, 140, 248, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: {
                        title: { display: true, text: 'Incidence Angle (deg)', color: '#94a3b8', font: { weight: 'bold' } },
                        grid: { color: 'rgba(148, 163, 184, 0.08)' }
                    },
                    y: {
                        title: { display: true, text: 'SNR (dB)', color: '#94a3b8', font: { weight: 'bold' } },
                        grid: { color: 'rgba(148, 163, 184, 0.08)' }
                    }
                },
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 14, color: '#e2e8f0' } }
                }
            }
        });
    }

    /**
     * Update Antenna Elevation Pattern Cut Chart
     */
    updateAntennaChart(canvasId, params) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const ant = SARPhysics.calculateAntennaParameters(params.freqHz, params.antLengthAz_m, params.antWidthEl_m, params.apertureEfficiency);
        const bwDeg = ant.elevationBeamwidthDeg;
        
        const angles = [];
        const gains_dBi = [];
        const normalized_dB = [];
        const spanDeg = bwDeg * 2.5;
        const numPoints = 80;

        for (let i = 0; i < numPoints; i++) {
            const offsetDeg = -spanDeg + (2 * spanDeg * i) / (numPoints - 1);
            const offsetRad = (offsetDeg * Math.PI) / 180;
            const linGain = SARPhysics.antennaGainPattern(offsetRad, ant.elevationBeamwidthRad, ant.peakGainLinear);
            const gain_dBi = 10 * Math.log10(Math.max(1e-4, linGain));
            const norm_dB = gain_dBi - ant.peakGain_dBi;
            
            angles.push(offsetDeg.toFixed(2) + '°');
            gains_dBi.push(gain_dBi);
            normalized_dB.push(norm_dB);
        }

        if (this.antennaChart) {
            this.antennaChart.data.labels = angles;
            this.antennaChart.data.datasets[0].data = normalized_dB;
            this.antennaChart.update('none');
            return;
        }

        this.antennaChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: angles,
                datasets: [
                    {
                        label: 'Elevation Gain Pattern (Normalized dB)',
                        data: normalized_dB,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.2,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Elevation Angle Offset (deg)', color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.08)' }
                    },
                    y: {
                        min: -35,
                        max: 2,
                        title: { display: true, text: 'Normalized Gain (dB)', color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.08)' }
                    }
                },
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 14, color: '#e2e8f0' } }
                }
            }
        });
    }

    /**
     * Update PRF Timing & Diamond Diagram Chart
     */
    updatePRFChart(canvasId, params) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const prfData = SARPhysics.calculatePRFTiming(params);
        const prfs = prfData.data.map(d => Math.round(d.prf));
        const nearEcho = prfData.data.map(d => d.echoNearMod_us);
        const farEcho = prfData.data.map(d => d.echoFarMod_us);
        const priUs = prfData.data.map(d => d.pri_us);

        if (this.prfChart) {
            this.prfChart.data.labels = prfs;
            this.prfChart.data.datasets[0].data = priUs;
            this.prfChart.data.datasets[1].data = nearEcho;
            this.prfChart.data.datasets[2].data = farEcho;
            this.prfChart.update('none');
            return;
        }

        this.prfChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: prfs,
                datasets: [
                    {
                        label: 'PRI Window (μs)',
                        data: priUs,
                        borderColor: '#64748b',
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Swath Near Echo Arrival (μs mod PRI)',
                        data: nearEcho,
                        borderColor: '#38bdf8',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 1
                    },
                    {
                        label: 'Swath Far Echo Arrival (μs mod PRI)',
                        data: farEcho,
                        borderColor: '#ec4899',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Pulse Repetition Frequency - PRF (Hz)', color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.08)' }
                    },
                    y: {
                        title: { display: true, text: 'Time in Inter-Pulse Period (μs)', color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.08)' }
                    }
                },
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 14, color: '#e2e8f0' } }
                }
            }
        });
    }
}

if (typeof window !== 'undefined') {
    window.SARChartManager = SARChartManager;
}
