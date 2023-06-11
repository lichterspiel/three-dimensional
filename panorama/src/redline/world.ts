import { Socket } from "socket.io-client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { PlayerMove } from "./request-interface";
import skybox_img from '../assets/skybox.jpeg'
import { createBoard, createCircle, createGameOverScreen } from "./model-generation";

let canvas: HTMLCanvasElement;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let rootObject: THREE.Object3D;
let raycaster: THREE.Raycaster;
let pickPosition: THREE.Vector2;
let loader: THREE.TextureLoader;
let controls: any;
let socket: Socket;

let gameId: string;
let playerId: string;
let playerNumber: number;
let isGameRunning: boolean;
let turn: string;
let setTurn: Function;

function initGear3(c: HTMLCanvasElement, s: Socket, gId: string, sTurn: Function) {
  canvas = c;
  socket = s;
  gameId = gId;
  isGameRunning = false;
  setTurn = sTurn;

  setupSocket();
  initThree();
  initGame();
}

function setupSocket() {
  // this should come when everyone joined and then send every information to everyone
  socket.on("load-game", (r: string) => {
    let res: LoadGame = JSON.parse(r);
    console.log(res, playerId);
    

    isGameRunning = true;
    turn = res["turn"];
    playerNumber = res["p1"] == playerId ? 0 : 1;
    setTurn(res["turn"]);

    if (res["board"]) fillBoard(res["board"]);
  });

  socket.on("send-id", (r: string) => {
    playerId = r;
  });

  socket.on("confirm-player-move", (r: string) => {
    let res: ConfirmPlayerMove = JSON.parse(r);

    turn = res["turn"];
    setTurn(res["turn"]);
    spawnPlayerField(`${res["field"]}`);
  });

  socket.on("game-over", (r: string) => {
    let res = JSON.parse(r);

    const gameOverText= res["winner"] == playerId ? "You won" : "You lost"
    const label = createGameOverScreen(gameOverText);
    
    rootObject.add(label);
    isGameRunning = false;
  });
}

function initGame() {
  let req = { gameId: gameId };
  socket.emit("player-join", req);

  createBoard(rootObject);
  gameLoop();

  window.addEventListener("mousedown", pickField);
}

function initThree(): void {
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  loader = new THREE.TextureLoader();
  scene.background = new THREE.Color("white")
  /*
  const skybox = loader.load(
      skybox_img,
      () => {
          const rt = new THREE.WebGLCubeRenderTarget(skybox.image.height);
          rt.fromEquirectangularTexture(renderer, skybox);
          rt.texture.encoding = THREE.sRGBEncoding;
          scene.background = rt.texture;
          scene.environment= rt.texture;
      });
      */
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
  let req: PlayerMove = { gameId: gameId, playerId: playerId, field: hit };
  
  socket.emit("player-move", req);
}

function fillBoard(board: string[][]) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] != "") {
        let c =
          board[row][col] == playerId
            ? createCircle(0xf782faf)
            : createCircle(0xff82af);
        let objName = row * 3 + col;
        let object = rootObject.getObjectByName(objName.toString())!;
        console.log(object);
        
        if (object) {

            c.position.copy(object.position);
            c.rotation.copy(object.rotation);

            object?.parent?.add(c);
            object?.removeFromParent();
        }
      }
    }
  }
}

function spawnPlayerField(pMeshName: string) {
    let skinNumber = turn == playerId ? 0 : 1
  let c = skinNumber == playerNumber ? createCircle(0xf782faf) : createCircle(0xff82af);

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

  console.log(turn, playerId);
  
  if (turn != playerId) {
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

export default initGear3;
