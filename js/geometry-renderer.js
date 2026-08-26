/**
 * Interactive Curved Earth & Flight Geometry 2D Canvas Renderer
 */

class GeometryRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDragging = false;
        this.currentData = null;
        this.zoomMode = 'auto'; // 'auto', 'orbital', 'uav'
        this.onLookAngleChange = null;

        this.setupEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setupEvents() {
        const getAngleFromEvent = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            if (!this.platformPos) return null;
            const dx = x - this.platformPos.x;
            const dy = y - this.platformPos.y;
            // Angle measured from Nadir (which is straight down +Y)
            let angleRad = Math.atan2(dx, dy); // 0 is straight down, positive is right
            let angleDeg = (angleRad * 180) / Math.PI;
            if (angleDeg < 5) angleDeg = 5;
            if (angleDeg > 75) angleDeg = 75;
            return angleDeg;
        };

        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            const angle = getAngleFromEvent(e);
            if (angle && this.onLookAngleChange) {
                this.onLookAngleChange(angle);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const angle = getAngleFromEvent(e);
            if (angle && this.onLookAngleChange) {
                this.onLookAngleChange(angle);
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                const angle = getAngleFromEvent(e.touches[0]);
                if (angle && this.onLookAngleChange) this.onLookAngleChange(angle);
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                const angle = getAngleFromEvent(e.touches[0]);
                if (angle && this.onLookAngleChange) this.onLookAngleChange(angle);
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = (rect.height || 380) * dpr;
        this.ctx.scale(dpr, dpr);
        this.displayW = rect.width;
        this.displayH = rect.height || 380;
        if (this.currentData) {
            this.render(this.currentData);
        }
    }

    render(data) {
        this.currentData = data;
        const ctx = this.ctx;
        const w = this.displayW;
        const h = this.displayH;

        ctx.clearRect(0, 0, w, h);

        const { altitude_m, lookAngleDeg, antElevationBwDeg, isSpaceborne } = data;
        const R_E = data.earthRadius_m || 6378137.0;
        const lookRad = (lookAngleDeg * Math.PI) / 180;
        const halfBwRad = (antElevationBwDeg * Math.PI) / 360;

        const geomCenter = SARPhysics.calculateCurvedEarthGeometry(altitude_m, lookRad, R_E);
        const geomNear = SARPhysics.calculateCurvedEarthGeometry(altitude_m, Math.max(0.01, lookRad - halfBwRad), R_E);
        const geomFar = SARPhysics.calculateCurvedEarthGeometry(altitude_m, lookRad + halfBwRad, R_E);

        // Background space/sky gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        if (isSpaceborne) {
            bgGrad.addColorStop(0, '#060913');
            bgGrad.addColorStop(0.6, '#0b1329');
            bgGrad.addColorStop(1, '#0f1c3f');
        } else {
            bgGrad.addColorStop(0, '#0a192f');
            bgGrad.addColorStop(0.6, '#132e57');
            bgGrad.addColorStop(1, '#1b3a4b');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Grid lines (Radar aesthetic)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Coordinate scaling
        // If Spaceborne: center of Earth is deep below
        // If UAV: visual scaling emphasizes the ground & curvature
        let platX = w * 0.22;
        let platY = h * 0.20;
        this.platformPos = { x: platX, y: platY };

        let earthCenterX, earthCenterY, earthVisualRadius, altitudeVisualPixels;

        if (isSpaceborne) {
            // Spaceborne visual geometry
            altitudeVisualPixels = h * 0.22;
            const visualScale = altitudeVisualPixels / altitude_m;
            earthVisualRadius = Math.min(w * 2.2, R_E * visualScale);
            // Cap Earth visual radius so curvature is visible
            earthVisualRadius = Math.max(h * 1.5, Math.min(h * 3.5, earthVisualRadius));
            earthCenterX = platX;
            earthCenterY = platY + altitudeVisualPixels + earthVisualRadius;
        } else {
            // UAV visual geometry: emphasize flight height and ground curvature
            altitudeVisualPixels = h * 0.35;
            earthVisualRadius = h * 4.0; // Exaggerated curvature for clear visual intuition
            earthCenterX = platX;
            earthCenterY = platY + altitudeVisualPixels + earthVisualRadius;
        }

        // Draw Earth / Terrain Surface
        ctx.save();
        ctx.beginPath();
        ctx.arc(earthCenterX, earthCenterY, earthVisualRadius, 0, 2 * Math.PI);
        const earthGrad = ctx.createRadialGradient(
            earthCenterX, earthCenterY - earthVisualRadius + 20, 10,
            earthCenterX, earthCenterY, earthVisualRadius
        );
        if (isSpaceborne) {
            earthGrad.addColorStop(0, '#10b981'); // Land / Earth top
            earthGrad.addColorStop(0.04, '#0369a1'); // Ocean
            earthGrad.addColorStop(0.3, '#082f49');
            earthGrad.addColorStop(1, '#020617');
        } else {
            earthGrad.addColorStop(0, '#15803d'); // Forest / terrain
            earthGrad.addColorStop(0.03, '#166534');
            earthGrad.addColorStop(0.2, '#14532d');
            earthGrad.addColorStop(1, '#052e16');
        }
        ctx.fillStyle = earthGrad;
        ctx.fill();

        // Atmosphere glow ring
        ctx.strokeStyle = isSpaceborne ? 'rgba(56, 189, 248, 0.4)' : 'rgba(74, 222, 128, 0.3)';
        ctx.lineWidth = isSpaceborne ? 6 : 4;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Sub-satellite / Nadir point on Earth surface
        const nadirSurfaceX = platX;
        const nadirSurfaceY = platY + (earthCenterY - earthVisualRadius - platY);

        // Draw Nadir Line
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(platX, platY);
        ctx.lineTo(nadirSurfaceX, nadirSurfaceY);
        ctx.stroke();
        ctx.restore();

        // Compute Ray Intersection Points on the Visual Earth Arc
        // Function to find intersection of ray from platPos at angle theta with circle (earthCenterX, earthCenterY, earthVisualRadius)
        const getRayTarget = (angleRad) => {
            // Ray equation: P(t) = plat + t * [sin(angle), cos(angle)]
            const dx = Math.sin(angleRad);
            const dy = Math.cos(angleRad);
            const ex = platX - earthCenterX;
            const ey = platY - earthCenterY;
            
            // Quadratic equation for t: |P(t) - Center|^2 = R^2
            const a = dx * dx + dy * dy; // 1
            const b = 2 * (ex * dx + ey * dy);
            const c = ex * ex + ey * ey - earthVisualRadius * earthVisualRadius;
            const disc = b * b - 4 * a * c;
            
            if (disc < 0) {
                // Ray misses Earth (looking at horizon or space)
                return { x: platX + dx * (w * 0.8), y: platY + dy * (w * 0.8), hit: false, angleRad };
            }
            const t = (-b - Math.sqrt(disc)) / (2 * a);
            const hitX = platX + t * dx;
            const hitY = platY + t * dy;
            
            // Earth central angle beta relative to center
            const beta = Math.atan2(hitX - earthCenterX, earthCenterY - hitY);
            return { x: hitX, y: hitY, hit: true, t, beta, angleRad };
        };

        const targetNear = getRayTarget(geomNear.lookAngle);
        const targetCenter = getRayTarget(geomCenter.lookAngle);
        const targetFar = getRayTarget(geomFar.lookAngle);

        // Draw Radar Beam Footprint / Swath Area (Conical wedge)
        if (targetNear.hit && targetFar.hit) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(platX, platY);
            ctx.lineTo(targetNear.x, targetNear.y);
            // Draw along the curved surface
            const angleStart = Math.atan2(targetNear.y - earthCenterY, targetNear.x - earthCenterX);
            const angleEnd = Math.atan2(targetFar.y - earthCenterY, targetFar.x - earthCenterX);
            ctx.arc(earthCenterX, earthCenterY, earthVisualRadius, angleStart, angleEnd, false);
            ctx.closePath();

            const beamGrad = ctx.createRadialGradient(platX, platY, 10, platX, platY, targetFar.t || 300);
            beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
            beamGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.18)');
            beamGrad.addColorStop(1, 'rgba(245, 158, 11, 0.25)');
            ctx.fillStyle = beamGrad;
            ctx.fill();

            // Beam edge rays
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // Swath ground highlight arc (Bright Amber / Gold)
            ctx.save();
            ctx.beginPath();
            ctx.arc(earthCenterX, earthCenterY, earthVisualRadius + 1.5, angleStart, angleEnd, false);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 4.5;
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.restore();
        }

        // Draw Boresight Center Ray
        if (targetCenter.hit) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(platX, platY);
            ctx.lineTo(targetCenter.x, targetCenter.y);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.stroke();

            // Slant Range target marker
            ctx.beginPath();
            ctx.arc(targetCenter.x, targetCenter.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // Draw Local Normal Vector at Target Point
            const normalDx = (targetCenter.x - earthCenterX) / earthVisualRadius;
            const normalDy = (targetCenter.y - earthCenterY) / earthVisualRadius;
            const normalLen = 45;
            const normalEndX = targetCenter.x + normalDx * normalLen;
            const normalEndY = targetCenter.y + normalDy * normalLen;

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([3, 3]);
            ctx.moveTo(targetCenter.x, targetCenter.y);
            ctx.lineTo(normalEndX, normalEndY);
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // Label Local Incidence Angle (theta_inc)
            ctx.fillStyle = '#f43f5e';
            ctx.font = '11px Inter, system-ui, sans-serif';
            ctx.fillText(`θ_inc: ${geomCenter.incidenceAngleDeg.toFixed(1)}°`, normalEndX + 4, normalEndY);
        }

        // Draw Platform Icon / Symbol
        ctx.save();
        ctx.translate(platX, platY);
        if (isSpaceborne) {
            // Satellite Graphic
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 12;
            // Body
            ctx.fillRect(-8, -8, 16, 16);
            // Solar Panels
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-26, -4, 15, 8);
            ctx.fillRect(11, -4, 15, 8);
            ctx.strokeStyle = '#93c5fd';
            ctx.lineWidth = 1;
            ctx.strokeRect(-26, -4, 15, 8);
            ctx.strokeRect(11, -4, 15, 8);
            // Antenna dish/array
            ctx.beginPath();
            ctx.arc(0, 8, 7, 0, Math.PI);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
        } else {
            // UAV Quadcopter / Aircraft Graphic
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 12;
            // Fuselage
            ctx.fillRect(-12, -4, 24, 8);
            // Wings
            ctx.fillRect(-4, -14, 8, 28);
            // SAR Pod below
            ctx.beginPath();
            ctx.arc(0, 5, 5, 0, Math.PI);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
        }
        ctx.restore();

        // HUD Text Overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.fillText(isSpaceborne ? `🛰️ Spaceborne SAR (${(altitude_m / 1000).toFixed(0)} km)` : `🛩️ UAV Platform (${altitude_m >= 1000 ? (altitude_m/1000).toFixed(2)+' km' : altitude_m.toFixed(0)+' m'})`, platX - 50, platY - 20);

        // Look Angle Arc indicator
        ctx.save();
        ctx.beginPath();
        const arcRadius = 38;
        ctx.arc(platX, platY, arcRadius, Math.PI / 2, Math.PI / 2 - lookRad, true);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#38bdf8';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText(`θ_look: ${geomCenter.lookAngleDeg.toFixed(1)}°`, platX + 15, platY + 45);

        // Swath Width Tag
        if (targetCenter.hit) {
            const swathKm = (geomFar.groundRange - geomNear.groundRange) / 1000;
            const swathStr = swathKm < 1.0 ? `${((geomFar.groundRange - geomNear.groundRange)).toFixed(0)} m` : `${swathKm.toFixed(1)} km`;
            
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 12px Inter, system-ui, sans-serif';
            ctx.fillText(`Swath Width: ${swathStr}`, Math.min(w - 170, targetCenter.x - 30), Math.min(h - 20, targetCenter.y + 35));

            // Slant Range Tag
            const slantRangeStr = geomCenter.slantRange >= 10000 ? `${(geomCenter.slantRange / 1000).toFixed(1)} km` : `${geomCenter.slantRange.toFixed(0)} m`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '11px Inter, system-ui, sans-serif';
            const midRayX = (platX + targetCenter.x) / 2;
            const midRayY = (platY + targetCenter.y) / 2;
            ctx.fillText(`Slant Range R: ${slantRangeStr}`, midRayX + 10, midRayY);
        }

        // Curved Earth vs Flat Earth comparison badge
        const deltaM = Math.abs(geomCenter.curvatureRangeDelta);
        const deltaStr = deltaM < 10 ? `${deltaM.toFixed(2)} m` : (deltaM < 1000 ? `${deltaM.toFixed(1)} m` : `${(deltaM / 1000).toFixed(2)} km`);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillText(`Curvature Slant Delta: ΔR = ${deltaStr} | Δθ = ${Math.abs(geomCenter.curvatureIncDeltaDeg).toFixed(2)}°`, 12, h - 12);
    }
}

if (typeof window !== 'undefined') {
    window.GeometryRenderer = GeometryRenderer;
}
