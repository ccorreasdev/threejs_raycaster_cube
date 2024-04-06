import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let camera, scene, renderer, controls, stats;

let mesh;

const amount = parseInt(window.location.search.slice(1)) || 10;
const count = Math.pow(amount, 3);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(1, 1);

const color = new THREE.Color();
const white = new THREE.Color().setHex(0xffffff);


const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

const onMouseMove = (e) => {
    e.preventDefault();
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
}

const init = () => {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(amount, amount, amount);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();

    const light = new THREE.HemisphereLight(0xffffff, 0x888888, 3);
    light.position.set(0, 1, 0);
    scene.add(light);

    const geometry = new THREE.IcosahedronGeometry(0.5, 3);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });

    mesh = new THREE.InstancedMesh(geometry, material, count);

    let i = 0;
    let offset = (amount - 1) / 2;

    const matrix = new THREE.Matrix4();

    for (let x = 0; x < amount; x++) {
        for (let y = 0; y < amount; y++) {
            for (let z = 0; z < amount; z++) {
                matrix.setPosition(offset - x, offset - y, offset - z);
                mesh.setMatrixAt(i, matrix);
                mesh.setColorAt(i, color);
                i++;
            }
        }
    }


    scene.add(mesh);

    const gui = new GUI();
    gui.add(mesh, "count", 0, count);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = true;

    stats = new Stats();
    document.body.appendChild(stats.dom);

    window.addEventListener("resize", onWindowResize);
    document.addEventListener("mousemove", onMouseMove);
};

const render = () => {
    renderer.render(scene, camera);
};

const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    raycaster.setFromCamera(mouse, camera);
    const intersection = raycaster.intersectObject(mesh);

    if (intersection.length > 0) {
        const instaceId = intersection[0].instanceId;
        mesh.getColorAt(instaceId, color);

        if (color.equals(white)) {
            mesh.setColorAt(instaceId, color.setHex(Math.random() * 0xffffff));
            mesh.instanceColor.needsUpdate = true;
        }
    }
    render();
    stats.update();
};



init();
animate();

