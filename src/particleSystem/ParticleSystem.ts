// Very heavily influenced by an existing particle engine
// https://github.com/stemkoski/stemkoski.github.com/blob/f5c7120af8488d04255b3e4492f4fb214d80b6ff/Three.js/js/ParticleEngine.js

import Particle from './Particle';
import { ParticleProps, ParticleSystemProps, Type } from './types';
import { Vector, getRandomInt } from '../math';
import Tween from './Tween';

export default class ParticleSystem {
  props: ParticleSystemProps; // Internal particle system properties
  particles: Array<Particle>;

  constructor() {
    this.particles = [];
  }

  /**
   * Update existing particles and generate new particles
   *
   * @param {number} dt
   * @memberof ParticleSystem
   */
  update(dt: number): void {
    if (!this.isDead()) {
      const liveParticles: Array<Particle> = [];
      console.log('about to loop through existing particles', this.particles);
      for (let p of this.particles) {
        if (!p.isDead()) {
          // particle still alive
          p.update(dt);
          liveParticles.push(p);
        } else {
          // kill particle
        }
      }
      this.particles = liveParticles;
      console.log('about to gen particles');
      this.genParticles(dt);
      console.log('just generated particles', this.particles);
      this.props.lifespan -= dt;
    }
  }

  /**
   * Generate new particles according to genRate and timestep
   *
   * @param {number} dt
   * @memberof ParticleSystem
   */
  genParticles(dt: number): void {
    const numParticles = Math.round(this.props.genRate * dt);
    console.log(numParticles);
    for (let i = 0; i < numParticles; i++) {
      this.particles.push(this.genParticle());
    }
  }

  /**
   * Generate a particle according to particle system properties
   *
   * @returns {Particle}
   * @memberof ParticleSystem
   */
  genParticle(): Particle {
    const {
      posStyle,
      posBase,
      posSpread,
      posRadius,

      velStyle,
      velBase,
      velSpread,
      speedBase,
      speedSpread,

      accBase,
      accSpread,

      angleBase,
      angleSpread,
      angleVelBase,
      angleVelSpread,
      angleAccBase,
      angleAccSpread,

      radiusBase,
      radiusSpread,
      radiusTween,

      colorBase,
      colorSpread,
      colorTween,

      opacityBase,
      opacitySpread,
      opacityTween,

      particleTexture,

      particleLifespan,
    } = this.props;

    let pos: Vector,
      vel: Vector,
      acc: Vector,
      lifespan: number,
      angle: number,
      angleVel: number,
      angleAcc: number,
      radius: number,
      color: Vector,
      opacity: number,
      texture: any;

    if (posStyle === Type.CUBE) {
      pos = this.randomVec(posBase, posSpread);
    } else if (posStyle === Type.SPHERE) {
      const z = 2 * Math.random() - 1;
      const t = 6.2832 * Math.random();
      const r = Math.sqrt(1 - z * z);
      const vec3 = new Vector(r * Math.cos(t), r * Math.sin(t), z);
      pos = Vector.add(posBase, Vector.mul(vec3, posRadius));
    }

    if (velStyle === Type.CUBE) {
      vel = this.randomVec(velBase, velSpread);
    } else if (velStyle === Type.SPHERE) {
      const direction = Vector.sub(pos, posBase);
      const speed = this.randomNum(speedBase, speedSpread);
      vel = Vector.mul(Vector.normalize(direction), speed);
    }

    acc = this.randomVec(accBase, accSpread);

    angle = this.randomNum(angleBase, angleSpread);
    angleVel = this.randomNum(angleVelBase, angleVelSpread);
    angleAcc = this.randomNum(angleAccBase, angleAccSpread);

    radius = this.randomNum(radiusBase, radiusSpread);

    color = this.randomVec(colorBase, colorSpread);
    opacity = this.randomNum(opacityBase, opacitySpread);
    texture = particleTexture;
    lifespan = particleLifespan;

    const particleProps: ParticleProps = {
      pos,
      vel,
      acc,
      angle,
      angleVel,
      angleAcc,
      radius,
      radiusTween,
      color,
      colorTween,
      opacity,
      opacityTween,
      texture,
      lifespan,
    };

    const particle = new Particle();
    particle.setProps(particleProps);

    return particle;
  }

  /**
   * Apply force to all particles.
   *
   * @param {Vector} force
   * @memberof ParticleSystem
   */
  applyForce(force: Vector): void {
    for (let particle of this.particles) {
      particle.applyForce(force);
    }
  }

  /**
   * Set particle system properties
   *
   * @param {ParticleSystemProps} props
   * @memberof ParticleSystem
   */
  setProps(props: ParticleSystemProps) {
    this.props = props;

    // Default Values
    this.props.posSpread = props.posSpread || new Vector();
    this.props.posRadius = props.posRadius || 10;

    this.props.velSpread = props.velSpread || new Vector();
    this.props.speedBase = props.speedBase || 20;
    this.props.speedSpread = props.speedSpread || 10;

    this.props.accBase = props.accBase || new Vector();
    this.props.accSpread = props.accSpread || new Vector();

    // this.props.particleTexture =
    //   props.particleTexture || THREE.ImageUtils.loadTexture('images/star.png');
    // this.props.blendStyle = props.blendStyle || THREE.NormalBlending

    this.props.angleBase = props.angleBase || 0;
    this.props.angleSpread = props.angleSpread || 0;
    this.props.angleVelBase = props.angleVelBase || 0;
    this.props.angleVelSpread = props.angleVelSpread || 0;
    this.props.angleAccBase = props.angleAccBase || 0;
    this.props.angleAccSpread = props.angleAccSpread || 0;

    this.props.radiusBase = props.radiusBase || 20;
    this.props.radiusSpread = props.radiusSpread || 5;
    this.props.radiusTween = props.radiusTween || new Tween([0, 1], [1, 20]);

    // by default colors in HSL
    this.props.colorBase = props.colorBase || new Vector(0.0, 1.0, 0.5);
    this.props.colorSpread = props.colorSpread || new Vector();
    this.props.colorTween =
      props.colorTween ||
      new Tween([0.5, 2], [new Vector(0, 1, 0.5), new Vector(1, 1, 0.5)]);

    this.props.opacityBase = props.opacityBase || 1;
    this.props.opacitySpread = props.opacitySpread || 0;
    this.props.opacityTween = props.opacityTween || new Tween([2, 3], [1, 0]);

    console.log('just set props...', this.props);
  }

  /**
   * Generate a random number between a base and spread number
   *
   * @param {number} base
   * @param {number} spread
   * @returns {number}
   * @memberof ParticleSystem
   */
  randomNum(base: number, spread: number): number {
    return base + spread * (Math.random() - 0.5);
  }

  /**
   * Generate a random vector between a base and spread vector
   *
   * @param {Vector} base
   * @param {Vector} spread
   * @returns {Vector}
   * @memberof ParticleSystem
   */
  randomVec(base: Vector, spread: Vector): Vector {
    const rand3 = new Vector(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    );
    return Vector.add(base, Vector.mulVecs(spread, rand3));
  }

  /**
   * Is the particle system still alive?
   *
   * @returns {boolean}
   * @memberof ParticleSystem
   */
  isDead(): boolean {
    if (this.props.lifespan < 0.0) {
      return true;
    } else {
      return false;
    }
  }
}