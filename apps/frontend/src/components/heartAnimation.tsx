import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function HeartAnimation() {
    const mountRef = useRef(null);

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);  // Adjust aspect ratio
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });  // Enable transparency
        renderer.setSize(300, 300);  // Smaller canvas size
        mountRef.current.appendChild(renderer.domElement);

        // Heart shape
        const x = 0, y = 0;
        const heartShape = new THREE.Shape();
        heartShape.moveTo(x + 25, y + 25);
        heartShape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
        heartShape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
        heartShape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
        heartShape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
        heartShape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
        heartShape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

        const geometry = new THREE.ExtrudeGeometry(heartShape, { depth: 2, bevelEnabled: true, bevelSize: 1, bevelThickness: 1 });
        geometry.rotateX(Math.PI);  // Rotate the heart to be right-side up
        const material = new THREE.MeshBasicMaterial({ color: 0x0A2472, transparent: true, opacity: 0.6 });  // Make the heart blue and more transparent
        const heart = new THREE.Mesh(geometry, material);
        heart.scale.set(0.02, 0.02, 0.02);  // Further scale down the heart
        scene.add(heart);

        camera.position.z = 150;

        // Pulsating effect
        let scale = 1;
        const animate = function () {
            requestAnimationFrame(animate);
            scale = scale > 1.1 ? 1 : scale + 0.001;
            heart.scale.set(scale, scale, scale);
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup function to remove renderer
        return () => {
            if (mountRef.current && renderer.domElement.parentNode) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div ref={mountRef} style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '35vh', 
            width: '55vw'   
        }} />
    );
}

export default HeartAnimation;
