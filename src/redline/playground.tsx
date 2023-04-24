import { Component, onMount } from "solid-js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

import styles from './playground.module.css'

let canvas: HTMLCanvasElement;
let renderer: THREE.Renderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let controls: any;
let rotationPoint: THREE.Object3D;
let raycaster: THREE.Raycaster;
let pickPosition: THREE.Vector2;
let playObj: {
        [key: number]: THREE.Mesh
    };
let game: number[][];

function initThree(canvas: HTMLCanvasElement): void {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
    controls = new OrbitControls(camera, renderer.domElement);
    rotationPoint = new THREE.Object3D();
    raycaster = new THREE.Raycaster();
    pickPosition = new THREE.Vector2();
    playObj = {};
    game = [
        [0,0,0],
        [0,0,0],
        [0,0,0],
    ];

    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);
 
    rotationPoint.position.set(0, 0, 0);
    scene.add( rotationPoint );

    camera.position.set(0,50, 50);
    camera.lookAt(0,0,0);
    controls.update();

    controls.maxDistance = 200;
    controls.minDistance = 20;
    controls.target.copy(new THREE.Vector3(0, 0, 0));

    function pickField(event: MouseEvent) {
        //normalize pos to be between -1 and 1
        const pos = getCanvasRelativePosition(event);
        pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
        pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y

        raycaster.setFromCamera(pickPosition, camera);
        const intersectedObjects = raycaster.intersectObjects(scene.children);

        if (intersectedObjects.length)
        {
            if (intersectedObjects[0].object.type === 'Mesh')
            {
                const picked: THREE.Mesh = intersectedObjects[0].object as THREE.Mesh;
                console.log(picked.geometry.type);
                if (picked.geometry.type === 'PlaneGeometry')
                {
                    game[Math.floor(parseInt(picked.name) / 3)][parseInt(picked.name) % 3] = 1;
                    console.log(game);

                    // replace the hitbox with the model
                    const c = createCircle();

                    c.position.copy(picked.position)
                    c.rotation.copy(picked.rotation)
                    picked.parent?.add(c);
                    picked.removeFromParent();
                }
 
            }
       }
    }

    function animate() {
        requestAnimationFrame(animate);
        update();
        render();
    }

    function update(){
        controls.update();
        if (resizeRendererToDisplaySize(renderer)) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
    }

    function render(){
        renderer.render( scene, camera );
    }


    window.addEventListener('mouseout', clearPickPosition);
    window.addEventListener('mouseleave', clearPickPosition);
    window.addEventListener('mousedown', pickField);

    createBoard();
    animate();
}

function createCircle(){
    const radius = 1.5;  
    const tubeRadius = 0.5;  
    const radialSegments = 8;  
    const tubularSegments = 24;  
    const geometry = new THREE.TorusGeometry(
            radius, tubeRadius,
            radialSegments, tubularSegments );
    const mat = new THREE.MeshBasicMaterial({color: 0xff82af})
    return new THREE.Mesh(geometry, mat);
}

function createBoard(){
    const radiusTop =  0.5;  
    const radiusBottom = 0.5;  
    const height =  15;  
    const radialSegments = 8;  
    const geometry = new THREE.CylinderGeometry(
            radiusTop, radiusBottom, height, radialSegments );

    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const lines: THREE.Mesh[] = [
        new THREE.Mesh(geometry, lineMaterial),
        new THREE.Mesh(geometry, lineMaterial),
        new THREE.Mesh(geometry, lineMaterial),
        new THREE.Mesh(geometry, lineMaterial),
    ];


    const distance = 5;
    const lineGroup = new THREE.Group();
    const hitboxGeo = new THREE.PlaneGeometry(distance, distance);
    const hitboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000fff });
    const hitbox = [
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        new THREE.Mesh(hitboxGeo, hitboxMaterial),
        ]

    lines.forEach((l,i) => {
        l.rotateX(Math.PI / 2);

        if (i <= 1){
            l.position.set(i*distance - distance / 2,0,0)
        }
        else {
            l.rotateZ(-Math.PI/2)
            l.position.set(0,0,((i % 2)*distance - distance / 2));
        }

        lineGroup.add(l)
    })

    const hitboxLocal = new THREE.Object3D();

    lineGroup.add(hitboxLocal);

    hitbox.forEach((h,i) => {
            hitboxLocal.add(h);

            h.position.set((i % 3) * distance, 0, (Math.floor(i / 3) * distance));
            h.rotateX(-Math.PI / 2);

            h.name = i.toString();

            playObj[i] = h;
        }
    )

    hitboxLocal.translateX(-distance)
    hitboxLocal.translateZ(-distance)

    rotationPoint.add(lineGroup);
}

function resizeRendererToDisplaySize(renderer: THREE.Renderer) {
    const pixelRatio = window.devicePixelRatio;
    const width  = canvas.clientWidth  * pixelRatio | 0;
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
        x: (event.clientX - rect.left) * canvas.width  / rect.width,
        y: (event.clientY - rect.top ) * canvas.height / rect.height,
    };
}

function clearPickPosition() {
    // unlike the mouse which always has a position
    // if the user stops touching the screen we want
    // to stop picking. For now we just pick a value
    // unlikely to pick something
    pickPosition.x = -1000000000;
    pickPosition.y = -10000000000;
}


const Playground: Component = () => {

   onMount(() => {
        initThree(canvas);
    })

    return (<>
        <div class={styles.container}>
            <canvas ref={canvas} class={styles.game}></canvas>
        </div>
    </>)
}

export default Playground;
