import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Canvas3DOrb({ isSpeaking = false, language = 'English' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 320;
    const height = currentMount.clientHeight || 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Geometry & Particle Material
    const geometry = new THREE.IcosahedronGeometry(1.6, 4);
    
    // Choose dynamic color palette based on language / medical tone
    const colorPrimary = new THREE.Color(0x0284c7); // Clinical Blue
    const colorAccent = new THREE.Color(0x10b981);  // Medical Emerald Green

    // Wireframe inner sphere
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMat);
    scene.add(wireframeMesh);

    // Glowing particle points
    const pointsMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const pointsMesh = new THREE.Points(geometry, pointsMat);
    scene.add(pointsMesh);

    // Outer subtle glow ring
    const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      const speed = isSpeaking ? 1.8 : 0.6;
      const pulse = isSpeaking ? Math.sin(elapsedTime * 6) * 0.12 : Math.sin(elapsedTime * 2) * 0.04;

      wireframeMesh.rotation.y = elapsedTime * 0.25 * speed;
      wireframeMesh.rotation.x = elapsedTime * 0.15 * speed;
      wireframeMesh.scale.set(1 + pulse, 1 + pulse, 1 + pulse);

      pointsMesh.rotation.y = elapsedTime * 0.25 * speed;
      pointsMesh.rotation.x = elapsedTime * 0.15 * speed;
      pointsMesh.scale.set(1 + pulse, 1 + pulse, 1 + pulse);

      ring.rotation.z = elapsedTime * 0.3;
      ring.rotation.y = Math.sin(elapsedTime * 0.5) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      wireframeMat.dispose();
      pointsMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [isSpeaking, language]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        ref={mountRef} 
        style={{ width: '100%', height: '100%', minHeight: '320px', maxHeight: '420px' }}
        className="relative z-10 cursor-grab active:cursor-grabbing"
      />
      
      {/* Background ambient light halo */}
      <div 
        className="absolute w-48 h-48 rounded-full pointer-events-none filter blur-3xl transition-opacity duration-500"
        style={{
          background: isSpeaking 
            ? 'radial-gradient(circle, rgba(16,185,129,0.45) 0%, rgba(2,132,199,0.3) 100%)' 
            : 'radial-gradient(circle, rgba(2,132,199,0.35) 0%, rgba(16,185,129,0.2) 100%)',
          transform: isSpeaking ? 'scale(1.3)' : 'scale(1)'
        }}
      />
    </div>
  );
}
