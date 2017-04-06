
window.game = window.game || {};
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var Physijs = require('../vendor/physijs/physi.js')(THREE);//unable to use physijs or webpack-physijs npm modules
Physijs.scripts.worker = 'vendor/physijs/physijs_worker.js';//unavoidable nail


window.game.core = function (component) {
    var persona;
    var KEYDOWN = 200;
    var scene = new Physijs.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
    controls = new OrbitControls(camera);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    var isPaused = false;
    var sceneSpeed = 1 ;
    var _game = {
        init:function () {
            _level.initWorld(window.innerWidth,window.innerHeight);
            _level.initPersona();
            _level.initGenerationObsticles();
            _level.initLVL(window.innerWidth,window.innerHeight);
            _game._loop();
        },
        _loop:function () {
            requestAnimationFrame( _game._loop );

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

            persona = new Physijs.BoxMesh(geometry,material);
            persona.addEventListener( 'collision', function functionName() {
                _level._gameOver();
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

        initGenerationObsticles: function () {
            let geometry = new THREE.CubeGeometry(0.1,900,0.1);
            let material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                color: 'black',
            }),.8,.3);

            let invisibleLine = new Physijs.BoxMesh(geometry,material, 10000);

            invisibleLine.position.x = - window.innerHeight / 2 - 550;
            invisibleLine.position.z = 50;
            var effect = new THREE.Vector3(0,0,0);
            invisibleLine.addEventListener( 'collision', function functionName(obj) {
              _level.deleteObsticles(obj);
              _level.spawnObsticles(300);
            });

            scene.add(invisibleLine);
            _level.setVectorSpeed(invisibleLine, effect);
        },

        initLVL:function (width,height) {
          let distance = 400;
          for (let i = -1; i < 3; i++) {
            _level.spawnObsticles(300, distance * i);
          }

          renderer.setSize( window.innerWidth, window.innerHeight );
          document.body.appendChild( renderer.domElement );

        },
        spawnObsticles: function (gap, distance = 0) {
            const upperHeight = Math.random() * (window.innerHeight - gap - 100 - 100) + 100;
            const lowerPosition = window.innerHeight / 2 - upperHeight - gap;
            const lowerHeight = Math.abs(-window.innerHeight / 2 - lowerPosition);

            geometry = new THREE.CubeGeometry(100, upperHeight, 100);
            material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                color: 'white',
                // wireframe: true
            }),.8,.3);

            obsticleUpper = new Physijs.BoxMesh(geometry,material);
            obsticleUpper.position.x = window.innerWidth / 2 + 200 + distance;
            obsticleUpper.position.y= window.innerHeight/2 - (upperHeight / 2);
            obsticleUpper.position.z = 50;
            var effect = new THREE.Vector3(0,0,0);
            var effect1 = new THREE.Vector3(-200,0,0);
            scene.add(obsticleUpper);
            _level.setVectorSpeed(obsticleUpper, effect, effect1);

            geometry = new THREE.CubeGeometry(100, lowerHeight, 100);
            obsticleLower = new Physijs.BoxMesh(geometry,material);
            obsticleLower.position.x = window.innerWidth / 2 + 200 + distance;
            obsticleLower.position.y= lowerPosition - lowerHeight / 2 ;
            obsticleLower.position.z = 50;
            scene.add(obsticleLower);
            _level.setVectorSpeed(obsticleLower, effect, effect1);

            obsticleUpper.together = obsticleLower;
        },

        setVectorSpeed: function (obj, vector1, vector2 = vector1) {
          obj.setAngularFactor(vector1);
          obj.setLinearFactor(vector1);
          obj.setLinearVelocity(vector2);
          obj.setAngularVelocity(vector1);
        },


        deleteObsticles: function(obj) {
            scene.remove(obj);
            scene.remove(obj.together);
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
