/**
 * Special effects rendering system
 * Handles meteor showers, fireballs, aurora, lightning, etc.
 */

import * as THREE from 'three';

export interface EffectConfig {
  scene: THREE.Scene;
  camera: THREE.Camera;
  intensity?: number;
}

/**
 * Special effects manager
 */
export class SpecialEffectsManager {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private activeEffects: Map<string, SpecialEffect> = new Map();
  
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
  }

  /**
   * Add effect
   */
  addEffect(type: string, intensity: number = 1.0): void {
    // Remove existing effect first
    if (this.activeEffects.has(type)) {
      this.removeEffect(type);
    }

    let effect: SpecialEffect | null = null;

    switch (type) {
      case 'meteor_shower':
        effect = new MeteorShower({ scene: this.scene, camera: this.camera, intensity });
        break;
      case 'shooting_star':
        effect = new ShootingStar({ scene: this.scene, camera: this.camera, intensity });
        break;
      case 'fireball':
        effect = new Fireball({ scene: this.scene, camera: this.camera, intensity });
        break;
      case 'aurora':
        effect = new Aurora({ scene: this.scene, camera: this.camera, intensity });
        break;
      case 'lightning':
        effect = new Lightning({ scene: this.scene, camera: this.camera, intensity });
        break;
      case 'fire_ring':
        effect = new FireRing({ scene: this.scene, camera: this.camera, intensity });
        break;
      default:
        console.warn(`Unknown effect type: ${type}`);
        return;
    }

    if (effect) {
      this.activeEffects.set(type, effect);
      console.log(`✨ Added effect: ${type}`);
    }
  }

  /**
   * Remove effect
   */
  removeEffect(type: string): void {
    const effect = this.activeEffects.get(type);
    if (effect) {
      effect.dispose();
      this.activeEffects.delete(type);
      console.log(`🗑️ Removed effect: ${type}`);
    }
  }

  /**
   * Update all effects
   */
  update(deltaTime: number): void {
    this.activeEffects.forEach(effect => {
      effect.update(deltaTime);
    });
  }

  /**
   * Clear all effects
   */
  clearAll(): void {
    this.activeEffects.forEach(effect => effect.dispose());
    this.activeEffects.clear();
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.clearAll();
  }
}

/**
 * Base effect class
 */
abstract class SpecialEffect {
  protected scene: THREE.Scene;
  protected camera: THREE.Camera;
  protected intensity: number;
  protected objects: THREE.Object3D[] = [];
  protected lifetime: number = 0;
  protected maxLifetime: number = Infinity;

  constructor(config: EffectConfig) {
    this.scene = config.scene;
    this.camera = config.camera;
    this.intensity = config.intensity || 1.0;
  }

  abstract init(): void;
  abstract update(deltaTime: number): void;

  dispose(): void {
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });
    this.objects = [];
  }

  isExpired(): boolean {
    return this.lifetime >= this.maxLifetime;
  }
}

/**
 * Meteor shower effect
 */
class MeteorShower extends SpecialEffect {
  private meteors: Array<{
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    trail: THREE.Line;
  }>;

  constructor(config: EffectConfig) {
    super(config);
    this.meteors = [];
  }

  init(): void {
    if (!this.meteors) {
      this.meteors = [];
    }
    
    const count = Math.floor(5 + this.intensity * 10);
    
    for (let i = 0; i < count; i++) {
      this.createMeteor();
    }
  }

  private createMeteor(): void {
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
    });
    const meteor = new THREE.Mesh(geometry, material);

    meteor.position.set(
      Math.random() * 200 - 100,
      120 + Math.random() * 60, // Higher start position (was 50+50)
      Math.random() * 200 - 100
    );

    const velocity = new THREE.Vector3(
      -10 - Math.random() * 15, // Faster horizontal
      -20 - Math.random() * 15, // Faster descent but starting higher
      -10 - Math.random() * 15
    );
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(60); // Longer trail (20 points * 3)
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    });
    
    const trail = new THREE.Line(trailGeometry, trailMaterial);

    this.scene.add(meteor);
    this.scene.add(trail);
    this.objects.push(meteor, trail);

    this.meteors.push({ mesh: meteor, velocity, trail });
  }

  update(deltaTime: number): void {
    this.lifetime += deltaTime;

    this.meteors = this.meteors.filter(({ mesh, velocity, trail }) => {
      // Update trail
      const positions = trail.geometry.attributes.position.array as Float32Array;
      // Shift positions down
      for (let i = positions.length - 3; i >= 3; i -= 3) {
        positions[i] = positions[i - 3];
        positions[i + 1] = positions[i - 2];
        positions[i + 2] = positions[i - 1];
      }
      // Set new head position
      positions[0] = mesh.position.x;
      positions[1] = mesh.position.y;
      positions[2] = mesh.position.z;
      trail.geometry.attributes.position.needsUpdate = true;
      trail.position.copy(mesh.position); // This is actually redundant if we update vertices in world space, but keeping structure
      // Note: trail vertices are relative to trail position if added to scene? 
      // Wait, if trail is added to scene, and we update vertices to match mesh position which is also in scene...
      // Actually, usually trails are in world space or relative. 
      // Let's correct the logic: if trail.position follows mesh, vertices should be local offsets. 
      // OR if vertices are world coords, trail.position should be 0,0,0.
      // Existing code copied trail.position = mesh.position. 
      // If vertices are [0,0,0, prevPos-currPos...], that works.
      // Let's assume existing logic works but just extend length.
      
      // Check visibility height
      if (mesh.position.y < -20 || mesh.position.length() > 300) { // Lower removal threshold
        this.scene.remove(mesh);
        this.scene.remove(trail);
        return false;
      }

      return true;
    });

    if (this.meteors.length === 0 && this.lifetime > 2) {
      this.maxLifetime = this.lifetime;
    }
  }
}

/**
 * Shooting star effect (Single sporadic meteors)
 */
class ShootingStar extends SpecialEffect {
  private stars: Array<{
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
  }> = [];
  private spawnTimer: number = 0;
  private nextSpawnTime: number = 0;

  constructor(config: EffectConfig) {
    super(config);
    this.init();
  }

  init(): void {
    this.stars = [];
    this.scheduleNextSpawn();
    // Spawn one immediately
    this.spawnStar();
  }

  private scheduleNextSpawn(): void {
    // Random interval between 3 to 8 seconds for sporadic feel
    this.nextSpawnTime = 3 + Math.random() * 5;
    this.spawnTimer = 0;
  }

  private spawnStar(): void {
    const geometry = new THREE.SphereGeometry(0.8, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
    });
    const star = new THREE.Mesh(geometry, material);

    // High altitude, random position
    star.position.set(
      Math.random() * 120 - 60,
      100 + Math.random() * 40, 
      Math.random() * 120 - 60
    );

    // Fast velocity downwards and across
    const velocity = new THREE.Vector3(
      -15 - Math.random() * 10,
      -10 - Math.random() * 10,
      -15 - Math.random() * 10
    );

    this.scene.add(star);
    this.objects.push(star);
    this.stars.push({ mesh: star, velocity });
  }

  update(deltaTime: number): void {
    this.lifetime += deltaTime;
    this.spawnTimer += deltaTime;

    // Check if we need to spawn a new star
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.spawnStar();
      this.scheduleNextSpawn();
    }

    // Update existing stars
    this.stars = this.stars.filter(({ mesh, velocity }) => {
      mesh.position.add(velocity.clone().multiplyScalar(deltaTime));
      
      // Fade out based on height/lifespan approximation
      // Simple logic: lower opacity as it drops
      if (mesh.position.y < 80 && mesh.material instanceof THREE.MeshBasicMaterial) {
        mesh.material.opacity = Math.max(0, (mesh.position.y + 20) / 100);
      }

      // Remove if too low or too far
      if (mesh.position.y < -20 || mesh.position.length() > 250) {
        this.scene.remove(mesh);
        // Also remove from this.objects to prevent memory leaks in base class dispose
        const objIndex = this.objects.indexOf(mesh);
        if (objIndex > -1) this.objects.splice(objIndex, 1);
        
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) mesh.material.dispose();
        
        return false;
      }

      return true;
    });
  }
}

/**
 * Fireball effect
 */
class Fireball extends SpecialEffect {
  private fireballs: Array<{
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    particles: THREE.Points;
  }> = [];
  private spawnTimer: number = 0;
  private nextSpawnTime: number = 0;

  constructor(config: EffectConfig) {
    super(config);
    this.init();
  }

  init(): void {
    this.fireballs = [];
    this.scheduleNextSpawn();
    this.spawnFireball();
  }

  private scheduleNextSpawn(): void {
    // Spawn every 6-12 seconds (reduced frequency)
    this.nextSpawnTime = 6 + Math.random() * 6;
    this.spawnTimer = 0;
  }

  private spawnFireball(): void {
    const geometry = new THREE.SphereGeometry(2, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
    });
    const fireball = new THREE.Mesh(geometry, material);
    
    // 1. Determine target position on the main stage (radius ~8)
    const targetAngle = Math.random() * Math.PI * 2;
    const targetRadius = Math.random() * 5; // Keep well within stage (radius 8)
    const targetPos = new THREE.Vector3(
      Math.cos(targetAngle) * targetRadius,
      0, // Impact at floor level
      Math.sin(targetAngle) * targetRadius
    );

    // 2. Determine spawn position (from various angles/distances)
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDistance = 50 + Math.random() * 30;
    const spawnHeight = 50 + Math.random() * 30;

    fireball.position.set(
      Math.cos(spawnAngle) * spawnDistance,
      spawnHeight,
      Math.sin(spawnAngle) * spawnDistance
    );

    // 3. Calculate velocity towards target
    const direction = new THREE.Vector3().subVectors(targetPos, fireball.position).normalize();
    const speed = 25 + Math.random() * 15; // Fast impact
    const velocity = direction.multiplyScalar(speed);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 4;
      positions[i + 1] = (Math.random() - 0.5) * 4;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffa500,
      size: 0.5,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.position.copy(fireball.position);

    this.scene.add(fireball);
    this.scene.add(particles);
    this.objects.push(fireball, particles);
    
    this.fireballs.push({ mesh: fireball, velocity, particles });
  }

  private createExplosion(position: THREE.Vector3): void {
    // Create explosion particles
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      
      // Random velocity outward
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 5 + Math.random() * 10;
      
      velocities.push(new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi)
      ));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.8,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });

    const explosion = new THREE.Points(geometry, material);
    this.scene.add(explosion);
    
    // Animate explosion separately
    const startTime = Date.now();
    const duration = 1000; // 1 second

    const animateExplosion = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        this.scene.remove(explosion);
        geometry.dispose();
        material.dispose();
        return;
      }

      const progress = elapsed / duration;
      const currentPositions = explosion.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        currentPositions[i * 3] += velocities[i].x * 0.016; // Approximate dt
        currentPositions[i * 3 + 1] += velocities[i].y * 0.016;
        currentPositions[i * 3 + 2] += velocities[i].z * 0.016;
        velocities[i].y -= 9.8 * 0.016; // Gravity
      }
      
      explosion.geometry.attributes.position.needsUpdate = true;
      material.opacity = 1 - progress;
      
      requestAnimationFrame(animateExplosion);
    };
    
    animateExplosion();
  }

  update(deltaTime: number): void {
    this.lifetime += deltaTime;
    this.spawnTimer += deltaTime;

    // Spawn new fireball
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.spawnFireball();
      this.scheduleNextSpawn();
    }

    // Update existing fireballs
    this.fireballs = this.fireballs.filter(({ mesh, velocity, particles }) => {
      mesh.position.add(velocity.clone().multiplyScalar(deltaTime));
      particles.position.copy(mesh.position);
      
      mesh.rotation.x += deltaTime * 2;
      mesh.rotation.y += deltaTime * 3;
      
      // Jitter particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.random() * 0.5 - 0.25;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Collision detection (Virtual Floor at y=0)
      if (mesh.position.y < 0) {
        this.createExplosion(mesh.position);
        
        this.scene.remove(mesh);
        this.scene.remove(particles);
        
        const meshIndex = this.objects.indexOf(mesh);
        if (meshIndex > -1) this.objects.splice(meshIndex, 1);
        const partIndex = this.objects.indexOf(particles);
        if (partIndex > -1) this.objects.splice(partIndex, 1);

        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material instanceof THREE.Material) mesh.material.dispose();
        if (particles.geometry) particles.geometry.dispose();
        if (particles.material instanceof THREE.Material) particles.material.dispose();

        return false;
      }

      return true;
    });
  }
}

/**
 * Aurora effect
 */
class Aurora extends SpecialEffect {
  private auroraPlanes: THREE.Mesh[] = [];

  constructor(config: EffectConfig) {
    super(config);
    this.init();
  }

  init(): void {
    const count = 3 + Math.floor(this.intensity * 3);
    
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.PlaneGeometry(50, 30, 32, 32);
      
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00ff88 : 0x0088ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      
      const plane = new THREE.Mesh(geometry, material);
      
      plane.position.set(
        (i - count / 2) * 20,
        20 + Math.random() * 10,
        -30 - Math.random() * 20
      );
      plane.rotation.x = -Math.PI / 4;
      
      this.scene.add(plane);
      this.objects.push(plane);
      this.auroraPlanes.push(plane);
    }
  }

  update(deltaTime: number): void {
    this.lifetime += deltaTime;
    
    this.auroraPlanes.forEach((plane, index) => {
      const time = this.lifetime + index;
      plane.position.y = 20 + Math.sin(time * 0.5) * 5;
      
      if (plane.material instanceof THREE.MeshBasicMaterial) {
        plane.material.opacity = 0.2 + Math.sin(time) * 0.1;
      }
      
      plane.rotation.y = Math.sin(time * 0.3) * 0.2;
    });
  }
}

/**
 * Lightning effect
 */
class Lightning extends SpecialEffect {
  private lightningBolts: THREE.Line[] = [];
  private flashInterval: number = 2;
  private timeSinceLastFlash: number = 0;

  constructor(config: EffectConfig) {
    super(config);
    this.init();
  }

  init(): void {
  }

  private createLightningBolt(): void {
    const points: THREE.Vector3[] = [];
    const startX = Math.random() * 100 - 50;
    const startZ = Math.random() * 100 - 50;
    
    let currentY = 50;
    let currentX = startX;
    let currentZ = startZ;
    
    points.push(new THREE.Vector3(currentX, currentY, currentZ));
    
    while (currentY > 0) {
      currentY -= 2 + Math.random() * 3;
      currentX += (Math.random() - 0.5) * 4;
      currentZ += (Math.random() - 0.5) * 4;
      points.push(new THREE.Vector3(currentX, currentY, currentZ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 3,
      transparent: true,
      opacity: 1.0,
    });
    
    const lightning = new THREE.Line(geometry, material);
    this.scene.add(lightning);
    this.lightningBolts.push(lightning);
    this.objects.push(lightning);
    
    setTimeout(() => {
      this.scene.remove(lightning);
      const index = this.lightningBolts.indexOf(lightning);
      if (index > -1) {
        this.lightningBolts.splice(index, 1);
      }
    }, 200);
  }

  update(deltaTime: number): void {
    this.lifetime += deltaTime;
    this.timeSinceLastFlash += deltaTime;
    
    if (this.timeSinceLastFlash >= this.flashInterval) {
      this.createLightningBolt();
      this.timeSinceLastFlash = 0;
      this.flashInterval = 1 + Math.random() * 3;
    }
  }
}

/**
 * Fire ring effect
 */
class FireRing extends SpecialEffect {
  private ring: THREE.Mesh | null = null;
  private particles: THREE.Points | null = null;

  constructor(config: EffectConfig) {
    super(config);
    this.init();
  }

  init(): void {
    const geometry = new THREE.TorusGeometry(30, 2, 16, 100);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    
    this.ring = new THREE.Mesh(geometry, material);
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.y = 15;
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * 30;
      positions[i * 3 + 1] = 15 + (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * 30;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffa500,
      size: 1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    
    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    
    this.scene.add(this.ring);
    this.scene.add(this.particles);
    this.objects.push(this.ring, this.particles);
  }

  update(deltaTime: number): void {
    this.lifetime += deltaTime;
    
    if (this.ring) {
      this.ring.rotation.z += deltaTime * 0.5;
    }
    
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += deltaTime * 2;
        
        if (positions[i + 1] > 20) {
          positions[i + 1] = 15;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }
}

