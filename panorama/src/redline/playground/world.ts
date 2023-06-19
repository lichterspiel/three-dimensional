import { Socket } from 'socket.io-client';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { createBoard, createCircle, createCross, createGameOverScreen } from '../model-generation';
import { PlayerMove } from '../request-interface';

let canvas: HTMLCanvasElement;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let rootObject: THREE.Object3D;
let raycaster: THREE.Raycaster;
let pickPosition: THREE.Vector2;
let controls: any;
let socket: Socket;

let gameID: string;
let playerID: string;
let playerNumber: number;
let isGameRunning: boolean;
let turn: string;
let setGameStats: Function;
let gameStats: any;

function initGear3(
  c: HTMLCanvasElement,
  s: Socket,
  gId: string,
  gmStats: any,
  setStats: Function
) {
  canvas = c;
  socket = s;
  gameID = gId;
  isGameRunning = false;
  setGameStats = setStats;
  gameStats = gmStats;

  setupSocket();
  initThree();
  initGame();
}

function setupSocket() {
  // this should come when everyone joined and then send every information to everyone
  socket.on("load-game", (r: string) => {
    console.log("load");

    let res: LoadGame = JSON.parse(r);
    console.log(res, playerID);

    isGameRunning = true;
    turn = res["turn"];
    playerNumber = res["p1"] == playerID ? 0 : 1;
    console.log(playerNumber);
    

    setGameStats({
      ...gameStats,
      turn: res["turn"] == playerID ? "You" : "Enemy",
    });

    if (res["board"]) fillBoard(res["board"]);
  });

  socket.on("send-id", (r: string) => {
    console.log("session_id: " + r);

    playerID = r;
  });

  socket.on("confirm-player-move", (r: string) => {
    let res: ConfirmPlayerMove = JSON.parse(r);

    setGameStats({
          ...gameStats,
          turn: res["turn"] == playerID ? "You" : "Enemy",
        });
    spawnPlayerField(`${res["field"]}`);
    turn = res["turn"];
  });

  socket.on("game-over", (r: string) => {
    let res = JSON.parse(r);

    const gameOverText = res["winner"] == playerID ? "You won" : "You lost";
    const label = createGameOverScreen(gameOverText);

    rootObject.add(label);
    isGameRunning = false;
  });

  socket.on("tie", () => {
    const label = createGameOverScreen("It's a tie");

    rootObject.add(label);
    isGameRunning = false;
  });


  socket.on("confirm-surrender", (r: string) => {
    let res = JSON.parse(r);

    const gameOverText = res["winner"] == playerID ? "You won the enemy surrendered" : "You surrendered";
    const label = createGameOverScreen(gameOverText);

    rootObject.add(label);
    isGameRunning = false;
  });
}

function initGame() {
  let req = { gameID: gameID };
  socket.emit("player-join", req);

  createBoard(rootObject);
  gameLoop();

  window.addEventListener("mousedown", pickField);
}

function initThree(): void {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
    alpha: true,
  });

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

  const sun = new THREE.DirectionalLight(0xffffff, 5);
  sun.position.set(0, 10, 0);
  sun.target.position.set(-5, 0, 0);

  rootObject.add(sun);
  rootObject.add(sun.target);

  /*
    const loader = new THREE.TextureLoader();
  const texture = loader.load(
      skybox_img,
    () => {
        console.log("123123");
        
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt.texture;
      scene.environment = rt.texture;
    });
    */

  raycaster = new THREE.Raycaster();
  pickPosition = new THREE.Vector2();

  const axesHelper = new THREE.AxesHelper(50);
  scene.add(axesHelper);
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
  let req: PlayerMove = { gameID: gameID, playerID: playerID, field: hit };

  socket.emit("player-move", req);
}

function fillBoard(board: string[][]) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] != "") {
        let skinNumber =
          board[row][col] == playerID ? playerNumber : (playerNumber + 1) % 2;
        console.log("skinNumber fill: "+ skinNumber);
        
        let playerObject = skinNumber == 0 ? createCircle(0xf782faf) : createCross(0xff82af);

        let objName = row * 3 + col;
        let object = rootObject.getObjectByName(objName.toString())!;

        if (object) {
          playerObject.position.copy(object.position);
          playerObject.rotation.copy(object.rotation);

          object?.parent?.add(playerObject);
          object?.removeFromParent();
        }
      }
    }
  }
}

function spawnPlayerField(pMeshName: string) {
  let skinNumber = turn == playerID ? playerNumber : (playerNumber + 1) % 2;
  let c = skinNumber == 0 ? createCircle(0xf782faf) : createCross(0xff82af);
  console.log("skinNumber spawn: "+ skinNumber);
  

  let hit: THREE.Object3D | undefined = rootObject.getObjectByName(pMeshName);
  if (hit) {
    // replace the hitbox with the model
    c.position.copy(hit.position);
    c.rotation.copy(hit.rotation);
    hit.parent?.add(c);
    hit.removeFromParent();
    let parent = hit.parent;
    parent?.remove();
  }
}

const pickField = (event: MouseEvent): void => {
  if (!isGameRunning) {
    return;
  }
  if (turn != playerID) {
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

export function cleanupScene(): void {
    if (renderer)
        renderer.dispose();
}

export default initGear3;
