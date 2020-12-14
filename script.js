
const randomizeConePoints = (scene) => {
    var points = [];
    const h = 30;
    const R = 30;
    var pointCount = 1000;

    for (var i = 0; i < pointCount; i++) {

        var ranX = Math.random()*R*2-R;
        var ranY = Math.random()*h;
        var ranZ = Math.random()*R*2-R; // map to -r ;r
        
        const r = R * ((h-ranY)/h);
        if (Math.pow(ranX, 2) + Math.pow(ranZ, 2) >= Math.pow(r, 2)) continue;

        const x = ranX;
        const y = ranY;
        const z = ranZ;
        points.push(new THREE.Vector3(x, y, z));
    }

    // show outer points
    spGroup = new THREE.Object3D();
    const material = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: false});
    points.forEach(function (point) {

        const spGeom = new THREE.SphereGeometry(0.2);
        const spMesh = new THREE.Mesh(spGeom, material);
        spMesh.position = point;
        spGroup.add(spMesh);
    });
    scene.add(spGroup);

    const hullGeometry = new THREE.ConvexGeometry(points);
    const vertexUvs = hullGeometry.faceVertexUvs[0];
    const faces = hullGeometry.faces;
    const vertices = hullGeometry.vertices;

    let upperLayerFace;
    let geometryFace;

    for (var i = 0; i < vertexUvs.length; i++) {
        geometryFace = faces[i];
        const vertex1 = vertices[geometryFace.a];
        const vertex2 = vertices[geometryFace.b];
        const vertex3 = vertices[geometryFace.c];

        upperLayerFace = vertexUvs[i];

        upperLayerFace[0].x = calcU(vertex1);
        upperLayerFace[0].y = calcV(vertex1);
        upperLayerFace[1].x = calcU(vertex2);
        upperLayerFace[1].y = calcV(vertex2);
        upperLayerFace[2].x = calcU(vertex3);
        upperLayerFace[2].y = calcV(vertex3);

        adjust(upperLayerFace[0], upperLayerFace[1]);
        adjust(upperLayerFace[1], upperLayerFace[2]);
        adjust(upperLayerFace[2], upperLayerFace[0]);
    }

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    loader.load(
        //'https://images.cdn2.stockunlimited.net/preview1300/checkered-texture_1429648.jpg',
        'https://thumbs.dreamstime.com/z/black-white-checker-pattern-llustration-texture-82326757.jpg',
        (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            const textureMaterial = new THREE.MeshPhongMaterial({ map: texture, transparent: true});

            const mesh = THREE.SceneUtils.createMultiMaterialObject(hullGeometry, [textureMaterial]);
            scene.add(mesh);
        });
}

const getRenderer = () => {
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    return renderer;
}

const adjust = (f1, f2) => {
    const dif = 0.9;
    if (Math.abs(f1.x - f2.x) > dif) {
        const faceToAdjust = f1.x > f2.x
                                        ? f1
                                        : f2;
        faceToAdjust.x = 0;
    }
}

const calcU = (vertex) => {
    const fi = Math.atan2(vertex.x, vertex.z);
    return fi / (2 * Math.PI) +0.5;
}

const calcV = (vertex) => {
    return vertex.y/30;
}

// entrypoint
$(function () {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = getRenderer();

    // add lights
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);

    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    randomizeConePoints(scene);

    // setup camera
    camera.position.x = -10;
    camera.position.y = 20;
    camera.position.z = 35;
    camera.lookAt(scene.position);

    // add the output of the renderer to the html element
    $("#WebGL-output").append(renderer.domElement);
    var controls = new THREE.TrackballControls(camera, renderer.domElement);
    render();

    function render() {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
        controls.update();
    }
});