import * as THREE from "three";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071426);
scene.fog = new THREE.Fog(0x071426, 35, 180);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 7, 13);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xb9e8ff, 0x17202a, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2.5);
sunlight.position.set(-8, 16, 8);
sunlight.castShadow = true;
scene.add(sunlight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 500),
  new THREE.MeshStandardMaterial({ color: 0x103326, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.12, -120);
ground.receiveShadow = true;
scene.add(ground);

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 360),
  new THREE.MeshStandardMaterial({ color: 0x252c39, roughness: 0.92 })
);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0, -140);
road.receiveShadow = true;
scene.add(road);

const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x00cfff, emissive: 0x003c66 });
for (const x of [-6.15, 6.15]) {
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 360), edgeMaterial);
  edge.position.set(x, 0.06, -140);
  scene.add(edge);
}

const laneMaterial = new THREE.MeshStandardMaterial({ color: 0xe6f6ff });
for (let z = 35; z > -315; z -= 10) {
  for (const x of [-2, 2]) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 4), laneMaterial);
    dash.position.set(x, 0.025, z);
    scene.add(dash);
  }
}

function makeCar() {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x087cff, metalness: 0.45, roughness: 0.28 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x061827, metalness: 0.25, roughness: 0.12 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x101116, roughness: 0.9 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.48, 3.1), bodyMat);
  body.position.y = 0.62;
  body.castShadow = true;
  car.add(body);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.18, 0.9), bodyMat);
  hood.position.set(0, 0.91, -0.85);
  car.add(hood);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.55, 1.25), glassMat);
  cabin.position.set(0, 1.05, 0.2);
  cabin.castShadow = true;
  car.add(cabin);

  for (const x of [-0.95, 0.95]) {
    for (const z of [-0.95, 0.95]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16), tireMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.38, z);
      wheel.castShadow = true;
      car.add(wheel);
    }
  }

  const lightMat = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0x99001d });
  for (const x of [-0.55, 0.55]) {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.06), lightMat);
    light.position.set(x, 0.72, 1.57);
    car.add(light);
  }

  car.position.set(0, 0, 5);
  scene.add(car);
  return car;
}

const car = makeCar();

function makeBarrier(x, z) {
  const group = new THREE.Group();
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 1.1, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xff5722, roughness: 0.6 })
  );
  block.position.y = 0.55;
  block.castShadow = true;
  group.add(block);

  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.18, 0.84),
    new THREE.MeshStandardMaterial({ color: 0xffe9a8 })
  );
  stripe.position.y = 0.7;
  group.add(stripe);
  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function makeCoin(x, z) {
  const coin = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.12, 10, 20),
    new THREE.MeshStandardMaterial({ color: 0xffc928, emissive: 0x704100, metalness: 0.65, roughness: 0.25 })
  );
  coin.position.set(x, 1.15, z);
  coin.castShadow = true;
  scene.add(coin);
  return coin;
}

function makeFinishLine(z) {
  const group = new THREE.Group();
  const postMaterial = new THREE.MeshStandardMaterial({ color: 0x00cfff, emissive: 0x003b55 });
  for (const x of [-5.4, 5.4]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.2, 0.25), postMaterial);
    post.position.set(x, 2.1, 0);
    group.add(post);
  }
  const top = new THREE.Mesh(new THREE.BoxGeometry(11, 0.35, 0.35), postMaterial);
  top.position.y = 4.15;
  group.add(top);

  const squares = new THREE.Group();
  const size = 0.7;
  for (let i = 0; i < 15; i++) {
    const square = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, 0.08),
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xffffff : 0x101827 })
    );
    square.position.set(-5.25 + i * 0.75, 0.08, 0);
    squares.add(square);
  }
  group.add(squares);
  group.position.z = z;
  scene.add(group);
  return group;
}

// The road and finish line form one long course.
const finishZ = -245;
const finishLine = makeFinishLine(finishZ);
const obstacles = [];
const coins = [];

for (let i = 0; i < 18; i++) {
  const z = -12 - i * 12;
  const lane = [-4, 0, 4][Math.floor(Math.random() * 3)];
  obstacles.push(makeBarrier(lane, z));
}

for (let i = 0; i < 28; i++) {
  const z = -8 - i * 8;
  const lane = [-4, 0, 4][Math.floor(Math.random() * 3)];
  coins.push(makeCoin(lane, z));
}

const keys = {};
let running = false;
let finished = false;
let speed = 0;
let score = 0;
let coinCount = 0;
let distance = 0;
const maxDistance = 250;

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const distanceEl = document.getElementById("distance");
const startPanel = document.getElementById("message");
const finishPanel = document.getElementById("finishMessage");
const finalScore = document.getElementById("finalScore");

function startGame() {
  running = true;
  finished = false;
  speed = 0.55;
  startPanel.classList.add("hidden");
  finishPanel.classList.add("hidden");
}

function endGame() {
  running = false;
  finished = true;
  finalScore.textContent = `Pontuação: ${score} | Moedas: ${coinCount}`;
  finishPanel.classList.remove("hidden");
}

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("restartButton").addEventListener("click", () => window.location.reload());

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
  keys[event.key] = true;
});
window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

function hitTest(a, b, radius = 1.25) {
  return Math.abs(a.x - b.x) < radius && Math.abs(a.z - b.z) < radius;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (running && !finished) {
    if (keys.ArrowUp) speed = Math.min(speed + delta * 0.75, 1.25);
    else speed = Math.max(speed - delta * 0.12, 0.55);
    if (keys.ArrowDown) speed = Math.max(speed - delta * 1.2, 0.25);

    if (keys.ArrowLeft) car.position.x -= delta * 7;
    if (keys.ArrowRight) car.position.x += delta * 7;
    car.position.x = THREE.MathUtils.clamp(car.position.x, -4.8, 4.8);

    const movement = speed * 18 * delta;
    distance += movement;
    scoreEl.textContent = score;
    coinsEl.textContent = coinCount;
    distanceEl.textContent = Math.floor(distance);

    for (const obstacle of obstacles) {
      obstacle.position.z += movement;
      if (obstacle.position.z > 12) {
        obstacle.position.z = -220 - Math.random() * 25;
        obstacle.position.x = [-4, 0, 4][Math.floor(Math.random() * 3)];
      }
      if (hitTest(car.position, obstacle.position, 1.3)) {
        speed = Math.max(0.25, speed - delta * 1.8);
      }
    }

    for (const coin of coins) {
      coin.position.z += movement;
      coin.rotation.y += delta * 3;
      if (coin.position.z > 12) {
        coin.position.z = -220 - Math.random() * 25;
        coin.position.x = [-4, 0, 4][Math.floor(Math.random() * 3)];
      }
      if (coin.visible && hitTest(car.position, coin.position, 1.15)) {
        coin.visible = false;
        coinCount++;
        score += 10;
        window.setTimeout(() => { coin.visible = true; }, 1500);
      }
    }

    finishLine.position.z += movement;
    if (finishLine.position.z >= car.position.z - 1) {
      endGame();
    }
  }

  camera.position.x += (car.position.x * 0.35 - camera.position.x) * 0.06;
  camera.lookAt(car.position.x * 0.25, 0.8, -8);
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
