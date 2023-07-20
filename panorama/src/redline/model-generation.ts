import * as THREE from 'three';

export function createCircle(color: number): THREE.Mesh {
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
  const mat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.2,
    metalness: 1,
  });
  const mesh = new THREE.Mesh(geometry, mat);

  return mesh;
}

export function createCross(color: number): THREE.Group {
  const mat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.2,
    metalness: 1,
  });
  const line1 = createLine(4, mat);
  line1.rotateZ(Math.PI / -4);
  const line2 = createLine(4, mat);
  line2.rotateZ(Math.PI / 4);
  const crossGroup = new THREE.Group();
  crossGroup.add(line1);
  crossGroup.add(line2);

  return crossGroup;
}

function createLine(
  length: number = 15,
  material: THREE.Material | null = null
): THREE.Mesh {
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

  const lineMaterial =
    material ??
    new THREE.MeshStandardMaterial({ color: "white", emissive: "white" });

  const mesh = new THREE.Mesh(geometry, lineMaterial);

  return mesh;
}

function createBoardHitbox(size: number) {
  const hitboxGeo = new THREE.PlaneGeometry(size, size);
  // TODO: maybe remove double side if annoying
  const hitboxMaterial = new THREE.MeshBasicMaterial({
    color: 0x83eeff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });

  const mesh = new THREE.Mesh(hitboxGeo, hitboxMaterial);

  return mesh;
}

export function createBoard(rootObject: THREE.Object3D) {
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
  });

  // align the hitboxes to the board
  hitboxLocal.translateX(-distance);
  hitboxLocal.translateZ(-distance);

  lineGroup.add(hitboxLocal);
  rootObject.add(lineGroup);
}

/*
export function createGameOverScreen(winner: string): THREE.Sprite {
  const canvasForText = makeLabelCanvas(200, 25, `GAME OVER ${winner}`);

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
  labelMaterial.dispose();

  const labelBaseScale = 0.5;
  label.scale.x = canvasForText.width * labelBaseScale;
  label.scale.y = canvasForText.height * labelBaseScale;

  return label;
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
*/
