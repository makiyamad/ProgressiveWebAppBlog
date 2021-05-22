define(['/lib/three/three.js'],function (THREE){

    var camera, scene, renderer;
    var geometry, material, mesh;
    var rotationX = 0.01;
    var rotationY = 0.02;
        
    function init() {
    
        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
        camera.position.z = 1;
    
        scene = new THREE.Scene();
    
        geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
        material = new THREE.MeshNormalMaterial();
    
        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
    
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( 200, 200 );
    
        document.querySelector('#canvas').appendChild( renderer.domElement );
    }
    
    var elapsed, interval = 500, past = Date.now();
    function animate() {
        var now = Date.now();
        elapsed = now - past;
    
        requestAnimationFrame( animate );
    
        if(elapsed > interval) {
            mesh.rotation.x = rotationX * rotationY;
            renderer.render( scene, camera );
            elapsed = 0;
        }
    }
        
    if ('LinearAccelerationSensor' in window && 'Gyroscope' in window) {
    
        let gyroscope = new Gyroscope();
        gyroscope.addEventListener('reading', e => rotationHandler({
            alpha: gyroscope.x,
            beta: gyroscope.y,
            gamma: gyroscope.z
        }));
        gyroscope.start();
    }
    
    function rotationHandler(rotation) {
        var info = "[X, Y]";
    
        if (rotation.alpha && rotation.beta && rotation.gamma) {
            rotationX = rotation.alpha.toFixed(1) * 10;
            rotationY = rotation.beta.toFixed(1) * 10;
        }
    
        info = info.replace("X", rotationX);
        info = info.replace("Y", rotationY);    
        $('#rotation-info').html(info);
    }

    return {
        init,
        animate
    }
});