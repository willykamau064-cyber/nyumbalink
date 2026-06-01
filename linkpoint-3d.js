/**
 * LinkPoint 3D Interactive UI Engine - Spline Edition
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const splineViewer = document.getElementById('hero-3d-canvas');
        if (splineViewer) {
            const targetUrl = splineViewer.getAttribute('url');
            
            // Check if URL is accessible
            fetch(targetUrl, { method: 'GET' })
                .then(res => {
                    if (res.status === 403 || res.status === 404) {
                        console.warn("Target Spline scene is private/unexported. Falling back to public Liquid Glass scene.");
                        splineViewer.setAttribute('url', 'https://prod.spline.design/iEAs8HJFu91daMOq/scene.splinecode');
                    }
                })
                .catch(err => {
                    console.warn("Network error checking Spline scene. Falling back to public Liquid Glass scene.");
                    splineViewer.setAttribute('url', 'https://prod.spline.design/iEAs8HJFu91daMOq/scene.splinecode');
                });
        }

        // Hide explode button as Spline handles its own states internally
        const explodeBtn = document.getElementById('explode-btn');
        if (explodeBtn) {
            explodeBtn.style.display = 'none';
        }
        
        // Hide local hotspot container and fireflies since Spline has its own interactions
        const hotspotCtn = document.getElementById('hotspot-container');
        if (hotspotCtn) hotspotCtn.style.display = 'none';
        
        const firefliesCtn = document.getElementById('fireflies-container');
        if (firefliesCtn) firefliesCtn.style.display = 'none';
    });
})();
