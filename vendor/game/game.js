Physijs.scripts.worker = 'vendor/physijs/physijs_worker.js';
window.game = window.game || {};
window.game.core = function (component) {
    window = window || global;
    window.scene = new Physijs.Scene();
    window.camera = new THREE.PerspectiveCamera( 75, 1600 / 900, 0.1, 10000 );
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    var isPaused = false;
    var sceneSpeed = 1 ;
    var _game = {
        init:function () {
            _level.initWorld(1600,900);
            _level.initPersona();
            _level.initLVL(1600,900);
            _game._loop();
        },
        _loop:function () {
            requestAnimationFrame( _game._loop );


            obsticle1.__dirtyPosition = true;
            obsticle2.__dirtyPosition = true;
            obsticle1.position.x-=sceneSpeed;

            obsticle2.position.x-=sceneSpeed;

            _level._outOfBound(1600,900);
            if (!isPaused) {
                scene.simulate();
                renderer.render( scene, camera );
            } else {
                renderer.render();
                document.location.reload();
            }

        }
    };


    var _level = {
        initWorld: function (width,height) {
            scene.setGravity(new THREE.Vector3( 0,-250, 0 ));
            camera.position.z = 500;

            const controls = new THREE.OrbitControls(camera);
            const  galaxyTexture	= THREE.ImageUtils.loadTexture('resources/galaxy_starfield.png');
            let material	= new THREE.MeshBasicMaterial({
                map	: galaxyTexture,
                side	: THREE.BackSide,
                color	: 0x808080,
            });
            let geometry	= new THREE.SphereGeometry(9000, 32, 32);
            let skySphere	= new THREE.Mesh(geometry, material);
            scene.add(skySphere);
            const light = new THREE.PointLight(0xFFFF00);
            light.position.set(100, 0, 250);
            scene.add(light);
        },
        initPersona:function () {
            let geometry = new THREE.CubeGeometry(100,100,100);
            let material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                color: 'white',
            }),.8,.3);


            window.persona = new Physijs.BoxMesh(geometry,material);
            persona.addEventListener( 'collision', function functionName() {
                _level._gameOver();
            });
            persona.position.z=60;
            persona.position.x=-400;
            scene.add(persona);

            window.addEventListener('keydown',function () {
                persona.setAngularVelocity({x: 0, y: 0, z: 0});
                var effect = new THREE.Vector3(0,350,0);
                persona.setLinearVelocity(effect);
            });
        },
        initLVL:function (width,height) {
           spawnObsticles(120);



            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );


            //#TODO:niowa
            function spawnObsticles(gap) {
                geometry = new THREE.CubeGeometry(100,900,100);
                material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                    color: 'white',
                    // wireframe: true
                }),.8,.3);

                obsticle1 = new Physijs.BoxMesh(geometry,material,0);
                obsticle1.position.y=height/2;
                obsticle1.position.z = 50;
                scene.add(obsticle1);

                obsticle2 = new Physijs.BoxMesh(geometry,material,0);
                obsticle2.position.y=-width/2;
                obsticle2.position.x=width/2-25;
                obsticle2.position.z = 50;
                scene.add(obsticle2);
            }
        },
        _gameOver:function() {
        if (isPaused) return;
        isPaused = true;
        alert("GAME OVER");
         },

        _outOfBound:function (width,height) {
        if (persona.position.y < -(height / 2 + 50) || persona.position.y > height / 2 + 50)  _level._gameOver();
    }
    };
    window.addEventListener('resize', function(){
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect	= window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix()
    }, false);
    return _game;
};
