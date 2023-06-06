import { Socket } from "socket.io-client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { PlayerMove } from "./request-interface";

let canvas: HTMLCanvasElement;
let renderer: THREE.Renderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let rootObject: THREE.Object3D;
let raycaster: THREE.Raycaster;
let pickPosition: THREE.Vector2;
let controls: any;
let socket: Socket;

let boardMeshHitboxes: {
  [key: number]: THREE.Mesh;
};
let gameId: string;
let userId: string;
let player: number;
let isGameRunning: boolean;
let turn = 0;

function initGear3(c: HTMLCanvasElement, s: Socket, gId: string) {
  canvas = c;
  socket = s;
  gameId = gId;
  isGameRunning = false;

  setupSocket();
  initThree();
  initGame();
}

function setupSocket() {
  // this should come when everyone joined and then send every information to everyone
  socket.on("init-game", (r: string) => {
    let res: InitGame = JSON.parse(r);
    console.log(r, res);
    console.log(userId);

    isGameRunning = true;
    player = res[userId] as number;
    turn = res["turn"];
    console.log(isGameRunning, player, turn);
  });

  socket.on("load-game", (r: string) => {
    let res: LoadGame = JSON.parse(r);

    isGameRunning = true;
    player = res[userId] as number;
    turn = res["turn"];

    if (res["board"]) fillBoard(res["board"]);
  });

  socket.on("send-id", (r: string) => {
    userId = r;
  });

  socket.on("confirm-player-move", (r: string) => {
    let res: ConfirmPlayerMove = JSON.parse(r);

    spawnPlayerField(`${res["field"]}`);
  });

  socket.on("game-over", (r: string) => {
    let res = JSON.parse(r);

    createGameOverScreen(res["winner"]);
    isGameRunning = false;
    console.log(res);
  });
}

function initGame() {
  boardMeshHitboxes = {};

  let req = { gameId: gameId };
  socket.emit("player-join", req);

  createBoard();
  gameLoop();

  window.addEventListener("mousedown", pickField);
}

function initThree(): void {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });

  camera = new THREE.PerspectiveCamera(
    45,
    canvas.offsetWidth / canvas.offsetHeight,
    0.1,
    1000
  );
  camera.position.set(0, 50, 50);
  camera.lookAt(0, 0, 0);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 100;
  controls.minDistance = 20;
  controls.target.copy(new THREE.Vector3(0, 0, 0));
  controls.update();

  rootObject = new THREE.Object3D();
  rootObject.position.set(0, 0, 0);
  scene.add(rootObject);

  raycaster = new THREE.Raycaster();
  pickPosition = new THREE.Vector2();

  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);
}

function fillBoard(board: number[][]) {
  console.log(board);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] != 9) {
        let c =
          board[row][col] == 0
            ? createCircle(0xf782faf)
            : createCircle(0xff82af);
        let objName = row * 3 + col;
        let object = rootObject.getObjectByName(objName.toString())!;
        console.log(object);

        c.position.copy(object.position);
        c.rotation.copy(object.rotation);

        object?.parent?.add(c);
        object?.removeFromParent();
      }
    }
  }
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  update();
  render();
}

function update() {
  controls.update();

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

function render() {
  renderer.render(scene, camera);
}

function updateBoard(hit: number) {
  let req: PlayerMove = { gameId: gameId, playerId: userId, field: hit };
  socket.emit("player-move", req);
}

function spawnPlayerField(pMeshName: string) {
  let c = turn == 0 ? createCircle(0xf782faf) : createCircle(0xff82af);
  turn = turn === 1 ? 0 : 1;

  let hit = rootObject.getObjectByName(pMeshName);
  if (hit) {
    // replace the hitbox with the model
    c.position.copy(hit.position);
    c.rotation.copy(hit.rotation);
    hit.parent?.add(c);
    hit.removeFromParent();
  }
}

const pickField = (event: MouseEvent): void => {
  if (!isGameRunning) {
    return;
  }
  if (turn != player) {
    return;
  }

  //normalize pos to be between -1 and 1
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width) * 2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y

  raycaster.setFromCamera(pickPosition, camera);

  const intersectedObjects = raycaster.intersectObjects(scene.children);

  if (intersectedObjects.length) {
    if (intersectedObjects[0].object.type === "Mesh") {
      const picked: THREE.Mesh = intersectedObjects[0].object as THREE.Mesh;
      if (picked.geometry.type === "PlaneGeometry") {
        updateBoard(parseInt(picked.name));
      }
    }
  }
};

function createCircle(color: number): THREE.Mesh {
  const radius = 1.5;
  const tubeRadius = 0.5;
  const radialSegments = 8;
  const tubularSegments = 24;
  const geometry = new THREE.TorusGeometry(
    radius,
    tubeRadius,
    radialSegments,
    tubularSegments
  );
  const mat = new THREE.MeshBasicMaterial({ color: color });
  return new THREE.Mesh(geometry, mat);
}

function createLine(length: number = 15): THREE.Mesh {
  const radiusTop = 0.5;
  const radiusBottom = 0.5;
  const height = length;
  const radialSegments = 8;
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments
  );

  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  return new THREE.Mesh(geometry, lineMaterial);
}

function createBoardHitbox(size: number) {
  const hitboxGeo = new THREE.PlaneGeometry(size, size);
  // TODO: maybe remove double side if annoying
  const hitboxMaterial = new THREE.MeshBasicMaterial({
    color: 0x000fff,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(hitboxGeo, hitboxMaterial);
}

function createBoard() {
  const lineGroup = new THREE.Group();
  const lines: THREE.Mesh[] = [
    createLine(),
    createLine(),
    createLine(),
    createLine(),
  ];

  const distance = 5;
  const hitbox = [
    createBoardHitbox(distance),
    createBoardHitbox(distance),
    createBoardHitbox(distance),
    createBoardHitbox(distance),
    createBoardHitbox(distance),
    createBoardHitbox(distance),
    createBoardHitbox(distance),
    createBoardHitbox(distance),
    createBoardHitbox(distance),
  ];
  const hitboxLocal = new THREE.Object3D();

  lines.forEach((l, i) => {
    l.rotateX(Math.PI / 2);

    // first 2 lines vertical, last 2 horizontal
    // - distance / 2 shifts board to center of world or rather the center of the board to the center
    if (i <= 1) {
      l.position.set(i * distance - distance / 2, 0, 0);
    } else {
      l.rotateZ(-Math.PI / 2);
      l.position.set(0, 0, (i % 2) * distance - distance / 2);
    }

    lineGroup.add(l);
  });

  hitbox.forEach((h, i) => {
    hitboxLocal.add(h);

    // make hitboxes to a plane kinda just the layout
    h.position.set((i % 3) * distance, 0, Math.floor(i / 3) * distance);
    h.rotateX(-Math.PI / 2);

    // name board to later identify it when raycasting
    // TODO: rename this to also include which board it is later
    h.name = i.toString();

    boardMeshHitboxes[i] = h;
  });

  // align the hitboxes to the board
  hitboxLocal.translateX(-distance);
  hitboxLocal.translateZ(-distance);

  lineGroup.add(hitboxLocal);
  rootObject.add(lineGroup);
}

function createGameOverScreen(winner: string) {
  const canvasForText = makeLabelCanvas(200, 25, `GAME OVER ${winner} won`);

  const texture = new THREE.CanvasTexture(canvasForText);
  // because our canvas is likely not a power of 2
  // in both dimensions set the filtering appropriately.
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const labelMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });

  const label = new THREE.Sprite(labelMaterial);
  rootObject.add(label);
  const labelBaseScale = 0.5;
  label.scale.x = canvasForText.width * labelBaseScale;
  label.scale.y = canvasForText.height * labelBaseScale;
}

function makeLabelCanvas(
  baseWidth: number,
  size: number,
  message: string
): HTMLCanvasElement {
  const borderSize = 2;
  const ctx = document.createElement("canvas").getContext("2d")!;
  const font = `${size}px bold sans-serif`;

  ctx.font = font;
  // measure how long the name will be
  const textWidth = ctx.measureText(message).width;

  const doubleBorderSize = borderSize * 2;
  const width = baseWidth + doubleBorderSize;
  const height = size + doubleBorderSize;
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  // need to set font again after resizing canvas
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, width, height);

  const scaleFactor = Math.min(1, baseWidth / textWidth);
  ctx.translate(width / 2, height / 2);
  ctx.scale(scaleFactor, 1);
  ctx.fillStyle = "white";
  ctx.fillText(message, 0, 0);

  return ctx.canvas;
}

function resizeRendererToDisplaySize(renderer: THREE.Renderer) {
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function getCanvasRelativePosition(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  // so basically - left makes it if the canvas is moved somewhere else
  // canvas width is how many pixels it draws, rect.width is the actual css width of the canvas
  // and the mouse event does it on the viewport so we need to scale it according to aspect ratio
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
}

export default initGear3;
