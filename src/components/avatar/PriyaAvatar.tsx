import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PriyaAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  emotion?: 'neutral' | 'happy' | 'thinking' | 'surprised';
  mouthOpenAmount?: number;
}

export const PriyaAvatar: React.FC<PriyaAvatarProps> = ({
  isSpeaking,
  isListening,
  isProcessing,
  emotion = 'neutral',
  mouthOpenAmount = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    mouthMesh: null as THREE.Mesh | null,
    leftEye: null as THREE.Mesh | null,
    rightEye: null as THREE.Mesh | null,
    headGroup: null as THREE.Group | null,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    yaw: 0,
    pitch: 0,
    mouthTarget: 0,
    currentMouth: 0,
    blinkVal: 0,
    nextBlink: Date.now() + 2500,
  });

  useEffect(() => {
    stateRef.current.mouthTarget = mouthOpenAmount || (isSpeaking ? 0.6 : 0);
  }, [mouthOpenAmount, isSpeaking]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 1.25, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x4338ca, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xa78bfa, 2.5);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xa855f7, 2.0, 10);
    rimLight.position.set(0, 2.5, -1.5);
    scene.add(rimLight);

    // Build Stylized 3D Avatar Character (Priya)
    const avatarGroup = new THREE.Group();
    avatarGroup.position.set(0, 0.4, 0);
    scene.add(avatarGroup);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.8, 0);
    avatarGroup.add(headGroup);
    stateRef.current.headGroup = headGroup;

    // Head Base
    const headGeo = new THREE.SphereGeometry(0.42, 32, 32);
    headGeo.scale(1.0, 1.15, 0.95);
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf5d0b5,
      roughness: 0.5,
      metalness: 0.05,
    });
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(headMesh);

    // Hair
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x241432,
      roughness: 0.7,
      metalness: 0.1,
    });
    const hairBaseGeo = new THREE.SphereGeometry(0.46, 32, 32);
    hairBaseGeo.scale(1.02, 1.1, 1.05);
    const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
    hairBase.position.set(0, 0.08, -0.05);
    headGroup.add(hairBase);

    // Hair bun / ponytail
    const bunGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const hairBun = new THREE.Mesh(bunGeo, hairMat);
    hairBun.position.set(0, 0.35, -0.42);
    headGroup.add(hairBun);

    // Hair strands front
    const strandGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.45, 12);
    const leftStrand = new THREE.Mesh(strandGeo, hairMat);
    leftStrand.position.set(-0.35, -0.1, 0.28);
    leftStrand.rotation.z = -0.2;
    headGroup.add(leftStrand);

    const rightStrand = new THREE.Mesh(strandGeo, hairMat);
    rightStrand.position.set(0.35, -0.1, 0.28);
    rightStrand.rotation.z = 0.2;
    headGroup.add(rightStrand);

    // Eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.075, 24, 24);
    eyeWhiteGeo.scale(1.0, 1.0, 0.4);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const pupilGeo = new THREE.SphereGeometry(0.048, 20, 20);
    pupilGeo.scale(1.0, 1.0, 0.3);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x3b1d54 });

    const leftEye = new THREE.Group();
    leftEye.position.set(-0.15, 0.05, 0.38);
    const leftWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.025);
    leftEye.add(leftWhite);
    leftEye.add(leftPupil);
    headGroup.add(leftEye);
    stateRef.current.leftEye = leftWhite;

    const rightEye = new THREE.Group();
    rightEye.position.set(0.15, 0.05, 0.38);
    const rightWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.025);
    rightEye.add(rightWhite);
    rightEye.add(rightPupil);
    headGroup.add(rightEye);
    stateRef.current.rightEye = rightWhite;

    // Eyebrows
    const browGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
    browGeo.rotateZ(Math.PI / 2);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x241432 });

    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.15, 0.16, 0.39);
    leftBrow.rotation.z = -0.05;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.15, 0.16, 0.39);
    rightBrow.rotation.z = 0.05;
    headGroup.add(rightBrow);

    // Blush
    const blushGeo = new THREE.CircleGeometry(0.065, 16);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.45 });
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.25, -0.08, 0.37);
    leftBlush.rotation.y = -0.4;
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.25, -0.08, 0.37);
    rightBlush.rotation.y = 0.4;
    headGroup.add(rightBlush);

    // Mouth (Viseme responsive)
    const mouthGeo = new THREE.TorusGeometry(0.045, 0.016, 12, 24, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.3 });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.rotation.z = Math.PI; // Smile shape
    mouthMesh.position.set(0, -0.19, 0.39);
    headGroup.add(mouthMesh);
    stateRef.current.mouthMesh = mouthMesh;

    // Neck & Torso with elegant attire
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 20);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.32, 0);
    avatarGroup.add(neck);

    // Torso / Dress
    const torsoGeo = new THREE.CylinderGeometry(0.22, 0.38, 0.75, 24);
    const dressMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.4,
      metalness: 0.15,
    });
    const torso = new THREE.Mesh(torsoGeo, dressMat);
    torso.position.set(0, -0.15, 0);
    avatarGroup.add(torso);

    // Collar / Gold Trim
    const collarGeo = new THREE.TorusGeometry(0.2, 0.025, 12, 32);
    collarGeo.rotateX(Math.PI / 2);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const collar = new THREE.Mesh(collarGeo, goldMat);
    collar.position.set(0, 0.2, 0);
    avatarGroup.add(collar);

    // Floating Aura Ring behind avatar
    const ringGeo = new THREE.TorusGeometry(0.72, 0.015, 16, 64);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4,
    });
    const auraRing = new THREE.Mesh(ringGeo, auraMat);
    auraRing.position.set(0, 0.75, -0.3);
    avatarGroup.add(auraRing);

    // Pointer Drag Interaction
    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;
      renderer.domElement.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.lastX;
      const dy = e.clientY - stateRef.current.lastY;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;

      stateRef.current.yaw += dx * 0.008;
      stateRef.current.pitch = Math.max(-0.4, Math.min(0.4, stateRef.current.pitch + dy * 0.006));
    };

    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Subtle breathing float
      avatarGroup.position.y = 0.4 + Math.sin(elapsedTime * 1.8) * 0.035;

      // Aura gentle spin
      auraRing.rotation.z = elapsedTime * 0.35;

      // Smooth Head Rotation towards Drag Yaw/Pitch (or gentle natural sway when idle)
      const targetYaw = stateRef.current.yaw + (stateRef.current.isDragging ? 0 : Math.sin(elapsedTime * 0.9) * 0.05);
      const targetPitch = stateRef.current.pitch + (stateRef.current.isDragging ? 0 : Math.cos(elapsedTime * 1.2) * 0.03);

      headGroup.rotation.y += (targetYaw - headGroup.rotation.y) * 0.1;
      headGroup.rotation.x += (targetPitch - headGroup.rotation.x) * 0.1;

      // Eye blinking
      const now = Date.now();
      if (now > stateRef.current.nextBlink) {
        stateRef.current.blinkVal = 1;
        stateRef.current.nextBlink = now + 2800 + Math.random() * 3000;
      }
      if (stateRef.current.blinkVal > 0) {
        stateRef.current.blinkVal -= 0.15;
        if (stateRef.current.blinkVal < 0) stateRef.current.blinkVal = 0;
      }

      const eyeScaleY = 1 - stateRef.current.blinkVal * 0.95;
      if (stateRef.current.leftEye) stateRef.current.leftEye.scale.y = eyeScaleY;
      if (stateRef.current.rightEye) stateRef.current.rightEye.scale.y = eyeScaleY;

      // Viseme / Mouth Movement
      const targetMouth = stateRef.current.mouthTarget;
      stateRef.current.currentMouth += (targetMouth - stateRef.current.currentMouth) * 0.25;

      if (stateRef.current.mouthMesh) {
        // Scale and morph mouth
        const openVal = stateRef.current.currentMouth;
        stateRef.current.mouthMesh.scale.set(1.0 + openVal * 0.4, 1.0 + openVal * 2.2, 1.0);
        stateRef.current.mouthMesh.position.y = -0.19 - openVal * 0.03;
      }

      // Emotion Expression Adjustments
      if (emotion === 'happy') {
        leftBrow.rotation.z = -0.15;
        rightBrow.rotation.z = 0.15;
      } else if (emotion === 'thinking') {
        leftBrow.rotation.z = 0.2;
        rightBrow.rotation.z = -0.05;
      } else {
        leftBrow.rotation.z = -0.05;
        rightBrow.rotation.z = 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[250px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="w-full h-full" />

      {/* Touch instruction / emotional hint badge */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[11px] text-white/50 backdrop-blur-md px-2 py-0.5 rounded-full bg-black/20">
        Drag to rotate
      </div>
    </div>
  );
};
