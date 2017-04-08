
window.game = window.game || {};
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var Physijs = require('../vendor/physijs/physi.js')(THREE);//unable to use physijs or webpack-physijs npm modules
var STLLoader = require('three-stl-loader')(THREE);
var Music = require('../vendor/music/musicControl');
var loader = new STLLoader();
Physijs.scripts.worker = 'vendor/physijs/physijs_worker.js';//unavoidable nail


game.core = function () {
    var jumpForce = 300;
    var sceneSpeed = 1 ;
    var score = 0;
    var scene = new Physijs.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
    var controls = new OrbitControls(camera);
    var container = document.querySelector('#gameContainer');
    var gameArea = document.querySelector('#gameArea');
    var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: gameArea });
    var sceneWidth = gameArea.offsetWidth, sceneHeight = gameArea.offsetHeight;
    var isPaused = false;
	var music = Music.music();
    var _game = {
        init:function () {
            _game._runEngine();
            _level.initWorld(sceneWidth,sceneHeight);
            _level.initPersona();
            _level.initLVL(sceneWidth,sceneHeight);

        },
        _runEngine:function () {

            function outOfBound() {
          //    if (game.persona.position.y < -(sceneHeight / 2 - 150) || game.persona.position.y > sceneHeight / 2 - 150)  _level._gameOver();
            }

            requestAnimationFrame( _game._runEngine );

            outOfBound(sceneHeight);

            if (!isPaused) {
                scene.simulate();
                renderer.render( scene, camera );

            } else {
				
				var to_remove = [];

                scene.traverse ( function( child ) {
                    if ( child instanceof THREE.Mesh &&!child.userData.keepMe === true ) {
                        to_remove.push( child );
                    }
                } );

                for ( var i = 0; i < to_remove.length; i++ ) {
                    scene.remove( to_remove[i] );
                }
               // _level.initWorld(sceneWidth,sceneHeight);
                //_level.initPersona();
                scene.remove(game.persona);
				game.persona.position.y = 0;
				
                scene.add(game.persona);
				
				_level.initLVL(sceneWidth,sceneHeight);
				scene.onSimulationResume();
				isPaused = false;
				
				score = 0;
				music.pauseSound(music.soundGameOver);
				music.loadSound();
				             
            }

        }
    };


    var _level = {
        initWorld: function () {
            renderer.setSize( sceneWidth, sceneHeight );
            scene.setGravity(new THREE.Vector3( 0,-250+(-10*sceneSpeed), 0 ));
            camera.position.z = 500;

            const  galaxyTexture = THREE.ImageUtils.loadTexture('resources/galaxy_starfield.png');
            let material	= new THREE.MeshBasicMaterial({
                map	: galaxyTexture,
                side	: THREE.BackSide,
                color	: 0x808080,
            });
            let geometry	= new THREE.SphereGeometry(9000, 32, 32);
            let skySphere	= new THREE.Mesh(geometry, material);
            skySphere.userData.keepMe = true;
            scene.add(skySphere);

            const light = new THREE.PointLight(0xFFFF00);
            light.position.set(100, 0, 250);
            light.userData.keepMe=true;
            scene.add(light);
            renderer.render(scene,camera);
        },
        initPersona: function () {
                    loader.load('resources/octocat.STL', function (geometry) {
                        var material = new THREE.MeshNormalMaterial();
                        game.persona = new Physijs.CylinderMesh(geometry, material);

                        game.persona.rotation.set(-1.5, 0, -1.5);
                        game.persona.__dirtyRotation = true;
                        game.persona.addEventListener( 'collision', function functionName(obj) {
                            if (obj.typeObject != 'line') _level._gameOver();
                        });
                        game.persona.position.z=game.persona.geometry.boundingBox.max.z/2;
                        game.persona.position.x=-400;
                        game.persona.userData.keepMe=true;
                        scene.add(game.persona);

                        window.addEventListener('keydown',function () {
                        game.persona.setAngularVelocity({x: 0, y: 0, z: 0});
                        var effect = new THREE.Vector3(0,jumpForce,0);
                        game.persona.setLinearVelocity(effect);
                    })
                });
            return game.persona;
        },

        initLVL:function () {
          _level.spawnObstacles();
          music.initializeSound();
          music.playSound(music.soundTrack);

        },
        spawnObstacles: function () {
          function setInvisibleLine() {
            let geometry = new THREE.CubeGeometry(0.1,sceneHeight,0.1);
            let material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                color: 'black',
            }),.8,.3);

            let invisibleLine = new Physijs.BoxMesh(geometry,material);

            invisibleLine.position.x = - sceneWidth/2-100;
            invisibleLine.position.z = invisibleLine.geometry.boundingBox.max.z/2;
            var effect = new THREE.Vector3(0,0,0);
            invisibleLine.addEventListener( 'collision', function functionName(obj) {
              deleteObstacles(obj);
              setObstacles(300);
            });

            scene.add(invisibleLine);
            _level.setVectorSpeed(invisibleLine, effect);
          };

          function setScoreLine(gap, positionX, positionY, vector1, vector2) {
              geometry = new THREE.CubeGeometry(0.01, gap - 50, 0.01);
              material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                  color: 'black',
                  // wireframe: true
              }),.8,.3);

              let scoreLine = new Physijs.CylinderMesh(geometry,material);
              scoreLine.position.x = positionX;
              scoreLine.position.y = positionY;
              scoreLine.position.z = 50;
              scoreLine.addEventListener( 'collision', function functionName() {
                music.playSound(music.soundEffect);
                score++;
                deleteObstacles(scoreLine);
              });
              scene.add(scoreLine);
              _level.setVectorSpeed(scoreLine, vector1, vector2);
              scoreLine.typeObject = "line";

          };

          function setObstacles(gap, distance = 0) {
            let obstaclesUpper, obstaclesLower;
            const upperHeight = Math.random() * (sceneHeight - gap);
            const lowerPosition = sceneHeight / 2 - upperHeight - gap;
            const lowerHeight = Math.abs(-sceneHeight / 2 - lowerPosition);

            geometry = new THREE.CubeGeometry(100, upperHeight, 100);
            material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                color: 'white',
                // wireframe: true
            }),.8,.3);

            obstaclesUpper = new Physijs.BoxMesh(geometry,material);
            obstaclesUpper.position.x = sceneWidth / 2 + 200 + distance;
            obstaclesUpper.position.y= sceneHeight/2 - (upperHeight / 2);
            obstaclesUpper.position.z = 50;
            var effect = new THREE.Vector3(0,0,0);
            var effect1 = new THREE.Vector3(-200,0,0);
            scene.add(obstaclesUpper);
            _level.setVectorSpeed(obstaclesUpper, effect, effect1);

            geometry = new THREE.CubeGeometry(100, lowerHeight, 100);
            obstaclesLower = new Physijs.BoxMesh(geometry,material);
            obstaclesLower.position.x = sceneWidth / 2 + 200 + distance;
            obstaclesLower.position.y= lowerPosition - lowerHeight / 2 ;
            obstaclesLower.position.z = 50;
            scene.add(obstaclesLower);

            _level.setVectorSpeed(obstaclesLower, effect, effect1);
            obstaclesUpper.lowerPart = obstaclesLower;

            let positionX = obstaclesUpper.position.x + 50 + 134;
            let positionY = sceneHeight/2 - upperHeight - 10 - gap/2;

            setScoreLine(gap, positionX, positionY, effect, effect1);

          };

          function deleteObstacles(obj) {
              scene.remove(obj);
              scene.remove(obj.lowerPart);
          };

          setInvisibleLine();

          let distance = 420;
          for (let i = -1; i < 3; i++) {
            setObstacles(300, distance * i);
          }

        },

        setVectorSpeed: function (obj, vector1, vector2 = vector1) {
          obj.setAngularFactor(vector1);
          obj.setLinearFactor(vector1);
          obj.setLinearVelocity(vector2);
          obj.setAngularVelocity(vector1);
        },

        _gameOver:function() {
        music.pauseSound(music.soundTrack);
        music.playSound(music.soundGameOver);

        isPaused = true;
		alert("GAME OVER");
        alert(`Your score ${score}`);
            
        }

    };
    window.addEventListener('resize', function(){
        renderer.setSize( sceneWidth, sceneHeight );
        camera.aspect	= sceneWidth / sceneHeight;
        camera.updateProjectionMatrix()
    }, false);
    return _game;
};
