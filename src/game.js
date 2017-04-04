
window.game = window.game || {};
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var Physijs = require('../vendor/physijs/physi.js')(THREE);//unable to use physijs or webpack-physijs npm modules
Physijs.scripts.worker = 'vendor/physijs/physijs_worker.js';//unavoidable nail


window.game.core = function (component) {
    var obsticles = {};
    var waves = 3;
    var obI = 0,
        obJ = 1;
    var first = true;
    var KEYDOWN = 200;
    var scene = new Physijs.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
    controls = new OrbitControls(camera);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    var isPaused = false;
    var sceneSpeed = 3 ;
    var _game = {
        init:function () {
            _level.initWorld(window.innerWidth,window.innerHeight);
            _level.initPersona();
            _level.initGO();
            _level.initLVL(window.innerWidth,window.innerHeight);
            _game._loop();
        },
        _loop:function () {
            requestAnimationFrame( _game._loop );

            for (let i = 0, j = 1; i < Object.keys(obsticles).length; i = i + 2, j = j + 2) {
              obsticles[i].__dirtyPosition = true;
              obsticles[j].__dirtyPosition = true;
              obsticles[i].position.x-=sceneSpeed;
              obsticles[j].position.x-=sceneSpeed;

            }
            //
            // obsticleUpper.__dirtyPosition = true;
            // obsticleLower.__dirtyPosition = true;
            // obsticleUpper.position.x-=sceneSpeed;
            //
            // obsticleLower.position.x-=sceneSpeed;

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
        initPersona: function () {
            let geometry = new THREE.CubeGeometry(100,100,100);
            let material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                color: 'white',
            }),.8,.3);

            window.persona = new Physijs.BoxMesh(geometry,material);
            persona.addEventListener( 'collision', function functionName() {
                _level._gameOver();


                //alert("oops");

            });
            persona.position.z=60;
            persona.position.x=-400;
            scene.add(persona);

            window.addEventListener('keydown',function () {
                persona.setAngularVelocity({x: 0, y: 0, z: 0});
                var effect = new THREE.Vector3(0,KEYDOWN,0);
                persona.setLinearVelocity(effect);
            });
        },

        initGO: function () {
            // window.invisibleLine = new Physijs.PlaneMesh(
            //     new THREE.PlaneGeometry(1, 900, 1),
            //     Physijs.createMaterial(new THREE.MeshBasicMaterial({color: 0x00ffff, side: THREE.DoubleSide}),.8,.3)
            // );
            let geometry = new THREE.CubeGeometry(0.1,900,0.1);
            let material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                color: 'black',
            }),.8,.3);

            window.invisibleLine = new Physijs.BoxMesh(geometry,material, 200);

            invisibleLine.position.x = - window.innerHeight / 2 - 550;
            invisibleLine.position.z = 50;
            invisibleLine.addEventListener( 'collision', function functionName() {
              //if (lastObsticle <
              _level.deleteObsticles();
              _level.initLVL(window.innerWidth,window.innerHeight);


              //  waves = waves + 2;
                //alert("hello");

            });
            scene.add(invisibleLine);

            window.addEventListener('keydown',function () {
                invisibleLine.setAngularVelocity({x: 0, y: 0, z: 0});
                var effect = new THREE.Vector3(0,KEYDOWN,0);
                invisibleLine.setLinearVelocity(effect);
            });

        },

        initLVL:function (width,height) {
          if (first) {
            for ( ; obI < waves * 2; obI += 2, obJ += 2) {
              spawnObsticles(400, obI, obJ, 300);
              renderer.setSize( window.innerWidth, window.innerHeight );
              document.body.appendChild( renderer.domElement );
              first = false;
            }
          } else {
            obI += 2;
            obJ += 2;
            if (obI > waves * 2 - 1) {
              obI = 0;
              obJ = 1;

            }
            console.log(obI);
            spawnObsticles(400, obI, obJ);

          }

            //#TODO:niowa
            function spawnObsticles(gap, i, j, distance = 0) {
                const upperHeight = Math.random() * (height - gap - 100 - 100) + 100;
                const lowerPosition = height / 2 - upperHeight - gap;
                const lowerHeight = Math.abs(-height / 2 - lowerPosition);

                geometry = new THREE.CubeGeometry(100, upperHeight, 100);
                material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                    color: 'white',
                    // wireframe: true
                }),.8,.3);

                obsticleUpper = new Physijs.BoxMesh(geometry,material,0);
                obsticleUpper.position.x = width / 2 + 200 + distance * i;
                obsticleUpper.position.y= height/2 - (upperHeight / 2);
                obsticleUpper.position.z = 50;
                scene.add(obsticleUpper);

                geometry = new THREE.CubeGeometry(100, lowerHeight, 100);
                obsticleLower = new Physijs.BoxMesh(geometry,material,0);
                obsticleLower.position.x = width / 2 + 200 + distance * i;
                obsticleLower.position.y= lowerPosition - lowerHeight / 2 ;
                obsticleLower.position.z = 50;
                scene.add(obsticleLower);
                obsticles[i] = obsticleUpper;
                obsticles[j] = obsticleLower;
            }
        },
        deleteObsticles: function(obj) {
            var allChildren = scene.children;
            var lastObject = allChildren[allChildren.length-waves * 2];
            var prevLastrObject = allChildren[allChildren.length-waves * 2 + 1];
            scene.remove(lastObject);
            scene.remove(prevLastrObject);
            // scene.remove(obj);
        },
        _gameOver:function() {
        if (isPaused) return;
        isPaused = true;
        alert("GAME OVER");
         },

        _outOfBound:function (width,height) {
        if (persona.position.y < -(height / 2 - 150) || persona.position.y > height / 2 - 150)  _level._gameOver();
    }
    };
    window.addEventListener('resize', function(){
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect	= window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix()
    }, false);
    return _game;
};
