// Sphere animation
// //////////////////////////////////////////////////////////////////

const SCREEN_WIDTH = window.innerWidth,
  SCREEN_HEIGHT = window.innerHeight,
  r = 450;

let mouseY = 0,
  windowHalfY = window.innerHeight / 2,
  camera,
  scene,
  renderer;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    80,
    SCREEN_WIDTH / SCREEN_HEIGHT,
    1,
    3000
  );
  camera.position.z = 1000;

  scene = new THREE.Scene();

  const parameters = [
    [0.25, 0x0066ff, 1],
    [0.5, 0x0066ff, 1],
    [0.75, 0x0066ff, 0.75],
    // [1, 0x0066ff, 0.5],
    [1.25, 0x0066ff, 0.8],
    [3.0, 0x0066ff, 0.75],
    [3.5, 0x0066ff, 0.5],
    // [4.5, 0x0066ff, 0.25],
    // [5.5, 0x0066ff, 0.125],
  ];

  const geometry = createGeometry();

  for (let i = 0; i < parameters.length; ++i) {
    const p = parameters[i];

    const material = new THREE.LineBasicMaterial({
      color: p[1],
      opacity: p[2],
    });

    const line = new THREE.LineSegments(geometry, material);
    line.scale.x = line.scale.y = line.scale.z = p[0];
    line.userData.originalScale = p[2];
    line.rotation.y = Math.random() * Math.PI;
    line.updateMatrix();
    scene.add(line);
  }

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

  container = document.getElementById('canvas');

  container.appendChild(renderer.domElement);

  document.body.style.touchAction = 'none';
  //

  window.addEventListener('resize', onWindowResize);
}

function createGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  const vertex = new THREE.Vector3();

  for (let i = 0; i < 1500; i++) {
    vertex.x = Math.random() * 2 - 1;
    vertex.y = Math.random() * 2 - 1;
    vertex.z = Math.random() * 2 - 1;
    vertex.normalize();
    vertex.multiplyScalar(r);

    vertices.push(vertex.x, vertex.y, vertex.z);

    vertex.multiplyScalar(Math.random() * 0.09 + 1);

    vertices.push(vertex.x, vertex.y, vertex.z);
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  return geometry;
}

function onWindowResize() {
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
//

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  camera.position.y += (-mouseY + 200 - camera.position.y) * '.05';
  camera.lookAt(scene.position);

  renderer.render(scene, camera);

  const time = Date.now() * 0.0001;

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object.isLine) {
      object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));

      if (i < 5) {
        const scale =
          object.userData.originalScale *
          (i / 5 + 1) *
          (1 + 0.5 * Math.sin(7 * time));

        object.scale.x = object.scale.y = object.scale.z = scale;
      }
    }
  }
}
