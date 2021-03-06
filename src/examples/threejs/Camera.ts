import * as THREE from 'three';

// Camera class
export default class Camera extends THREE.PerspectiveCamera {
  constructor() {
    const fov = 75; // field of view (75 degrees in vertical direction)
    const aspect = 2; // the canvas default
    // const near = 2; // anything before this not rendered
    const near = 0.1;
    const far = 5000; // anything after this not rendered
    super(fov, aspect, near, far);
  }

  setAspect(aspect: number) {
    this.aspect = aspect;
    this.updateProjectionMatrix();
  }
}
