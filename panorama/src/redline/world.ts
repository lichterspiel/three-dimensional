import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { Socket } from 'socket.io-client';
import { PlayerMove, PlsInit } from './request-interface';

let canvas: HTMLCanvasElement;
let renderer: THREE.Renderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let rotationPoint: THREE.Object3D;
let raycaster: THREE.Raycaster;
let pickPosition: THREE.Vector2;
let controls: any;
let socket: Socket;

let boardMeshHitboxes: {
    [key: number]: THREE.Mesh
};
let gameId: string;
let player: number;
let turn = 0;


function initGear3(c: HTMLCanvasElement, s: Socket, gId: string){
    canvas = c;
    socket = s;
    gameId = gId;

    setupSocket();
    initThree();
    initGame();
}

function setupSocket(){
    // TODO: define response globally
    socket.on("init-game", (r: string) => {
        let res: InitGame = JSON.parse(r)
        player = res['playerNum'];
    })

    socket.on("confirm-player-move", (r: string)=> {
        let res: ConfirmPlayerMove = JSON.parse(r);
        spawnPlayerField(`${res['field']}`);
    })
}

function initGame(){
    // add checks if player is already in a game
    let req: PlsInit = {playerId: socket.id, gameId: gameId};
    socket.emit("pls-init", req);

    boardMeshHitboxes = {};

    createBoard();
    gameLoop();

    window.addEventListener("mousedown", pickField);
}

function initThree(): void {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });

    camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.set(0, 50, 50);
    camera.lookAt(0, 0, 0);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 100;
    controls.minDistance = 20;
    controls.target.copy(new THREE.Vector3(0, 0, 0));
    controls.update();

    rotationPoint = new THREE.Object3D();
    rotationPoint.position.set(0, 0, 0);
    scene.add(rotationPoint);

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

function updateBoard(hit: number){
    let req: PlayerMove = {gameId: gameId, playerNum: player, field: hit};
    
    socket.emit("player-move", req)
}

function spawnPlayerField(pMeshName: string){
    let c = player == 1 ? createCircle(0xf782faf) :  createCircle(0xff82af);
    turn = turn === 1 ? 0 : 1;

    let hit = rotationPoint.getObjectByName(pMeshName);
    if (hit){
        // replace the hitbox with the model
        c.position.copy(hit.position)
        c.rotation.copy(hit.rotation)
        hit.parent?.add(c);
        hit.removeFromParent();
    }
}

function pickField(event: MouseEvent) {
    //normalize pos to be between -1 and 1
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.width) * 2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y

    raycaster.setFromCamera(pickPosition, camera);

    const intersectedObjects = raycaster.intersectObjects(scene.children);

    if (intersectedObjects.length) {
        if (intersectedObjects[0].object.type === 'Mesh') {
            const picked: THREE.Mesh = intersectedObjects[0].object as THREE.Mesh;
            if (picked.geometry.type === 'PlaneGeometry') {
                updateBoard(parseInt(picked.name))
            }
        }
    }
}

function createCircle(color: number): THREE.Mesh {
    const radius = 1.5;
    const tubeRadius = 0.5;
    const radialSegments = 8;
    const tubularSegments = 24;
    const geometry = new THREE.TorusGeometry(
        radius, tubeRadius,
        radialSegments, tubularSegments);
    const mat = new THREE.MeshBasicMaterial({ color: color })
    return new THREE.Mesh(geometry, mat);
}

function createLine(length: number = 15): THREE.Mesh {
    const radiusTop = 0.5;
    const radiusBottom = 0.5;
    const height = length;
    const radialSegments = 8;
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);

    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff});

    return  new THREE.Mesh(geometry, lineMaterial);
}

function createBoardHitbox(size: number){
    const hitboxGeo = new THREE.PlaneGeometry(size, size);
    // TODO: maybe remove double side if annoying
    const hitboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000fff, side: THREE.DoubleSide });
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
    ]
    const hitboxLocal = new THREE.Object3D();

    lines.forEach((l, i) => {
        l.rotateX(Math.PI / 2);
        
        // first 2 lines vertical, last 2 horizontal
        // - distance / 2 shifts board to center of world or rather the center of the board to the center
        if (i <= 1) {
            l.position.set(i * distance - distance / 2, 0, 0)
        }
        else {
            l.rotateZ(-Math.PI / 2)
            l.position.set(0, 0, ((i % 2) * distance - distance / 2));
        }

        lineGroup.add(l)
    })

    hitbox.forEach((h, i) => {
        hitboxLocal.add(h);

        // make hitboxes to a plane kinda just the layout
        h.position.set((i % 3) * distance, 0, (Math.floor(i / 3) * distance));
        h.rotateX(-Math.PI / 2);

        // name board to later identify it when raycasting
        // TODO: rename this to also include which board it is later
        h.name = i.toString();

        boardMeshHitboxes[i] = h;
    })

    // align the hitboxes to the board
    hitboxLocal.translateX(-distance)
    hitboxLocal.translateZ(-distance)

    lineGroup.add(hitboxLocal);
    rotationPoint.add(lineGroup);
}

function resizeRendererToDisplaySize(renderer: THREE.Renderer) {
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
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
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height,
    };
}

export default initGear3;
