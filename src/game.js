
window.game = window.game || {};
const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const Physijs = require('../vendor/physijs/physi.js')(THREE);//unable to use physijs or webpack-physijs npm modules
const STLLoader = require('three-stl-loader')(THREE);
const Music = require('../vendor/music/musicControl');
const loader = new STLLoader();
Physijs.scripts.worker = 'vendor/physijs/physijs_worker.js';//unavoidable nail

game.core = function () {
    var jumpForce = 300;
    var score = 0;
    const scene = new Physijs.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
    var controls = new OrbitControls(camera);
    const gameArea = document.querySelector('#gameArea');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: gameArea });
    var sceneWidth = gameArea.offsetWidth, sceneHeight = gameArea.offsetHeight;
    var gameState = 'pending';
	const music = Music.music();
    const _game = {
        init:function () {
      			_level.initPersona();
            _level.initWorld(sceneWidth,sceneHeight);
            //_level.initBackground();
            _level.initLVL(sceneWidth,sceneHeight);
            _game.initGUI();
			      _game._runEngine();
        },
        initGUI:function () {
          game.GUI ={};
          game.GUI.playButton = document.querySelector('#playButton');
          game.GUI.scoreTable = document.querySelector('#scoreTable');
          game.GUI.gameOverMsg = document.querySelector('#gameOverMsg');
          game.GUI.endScore = document.querySelector('#endScore');
          game.GUI.gameDifficulty = document.querySelector('#gameDifficulty');
          game.GUI.difficulty = document.getElementsByClassName("difficulty");
          game.GUI.greetingMsg = document.querySelector('#greetingMsg');



          function onPlayGame() {
              game.GUI.playButton.style.display = 'none';
              game.GUI.gameOverMsg.style.display = 'none';
              game.GUI.gameDifficulty.style.display = 'none';
              game.GUI.greetingMsg.style.display = 'none';

              gameState = 'running';
          }
            game.GUI.playButton.addEventListener('click',onPlayGame);

            for (var i = 0; i < game.GUI.difficulty.length; i++) {
                game.GUI.difficulty[i].addEventListener('click', onPlayGame, false);
            }
            game.GUI.difficulty['low'].addEventListener('click',_game.setDifficulty.low);
            game.GUI.difficulty['middle'].addEventListener('click',_game.setDifficulty.middle);
            game.GUI.difficulty['high'].addEventListener('click',_game.setDifficulty.high);
        },
        setDifficulty:{
            low:function () {
                game.sceneSpeed = 1;
                game.gap = 400;
                game.distance = 400;
            },
            middle:function () {
                game.sceneSpeed = 1.5;
                game.gap = 300;
                game.distance = 300;
            },
            high:function () {
                game.sceneSpeed = 4;
                game.gap = 250;
                game.distance = 500;
            }
        },
        _runEngine:function () {
            //_game.background.backgroundTexture.offset.set(_game.background.backgroundTexture.offset.x += 0.0005,0);
            requestAnimationFrame( _game._runEngine );

            if (gameState === 'running') {
                scene.simulate();
                renderer.render( scene, camera );

            } else if (gameState === 'pending') {
                renderer.render( scene, camera );
            } else {
              _level.restartLVL();
            }

        }
    };


    const _level = {
        initWorld: function () {
            game.sceneSpeed = 1;
            game.gap = 300;
            game.distance = 300;
            renderer.setSize( sceneWidth, sceneHeight );
            scene.setGravity(new THREE.Vector3( 0,-250+(-10*game.sceneSpeed), 0 ));
            camera.position.z = 550;

            // const  galaxyTexture = THREE.ImageUtils.loadTexture('resources/textures/galaxy_starfield.png');
            // let material	= new THREE.MeshBasicMaterial({
            //     map	: galaxyTexture,
            //     side	: THREE.BackSide,
            //     color	: 0x808080,
            // });
            // let geometry	= new THREE.SphereGeometry(9000, 32, 32);
            // let skySphere	= new THREE.Mesh(geometry, material);
            // skySphere.userData.keepMe = true;
            // scene.add(skySphere);
            // const  galaxyTexture = THREE.ImageUtils.loadTexture('resources/textures/negy.jpg');
            // var skybox = new SkyBox( renderer , galaxyTexture );

            var materialArray = [];
            materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '../resources/textures/posx.jpg' ) }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '../resources/textures/negx.jpg' ) }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '../resources/textures/posy.jpg' ) }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '../resources/textures/negy.jpg' ) }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '../resources/textures/posz.jpg' ) }));
            materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '../resources/textures/negz.jpg' ) }));



            for (var i = 0; i < 6; i++)
               materialArray[i].side = THREE.BackSide;
            var skyboxMaterial = new THREE.MeshFaceMaterial( materialArray );
            var skyboxGeom = new THREE.CubeGeometry( 5000, 5000, 5000, 1, 1, 1 );
            var skybox = new THREE.Mesh( skyboxGeom, skyboxMaterial );
            skybox.userData.keepMe = true;
            scene.add( skybox );

            const light = new THREE.PointLight(0xFFFF00);
            light.position.set(100, 0, 250);
            light.userData.keepMe=true;
            scene.add(light);
            renderer.render(scene,camera);
        },
        initPersona: function () {

                    loader.load('resources/models/octocat.STL', function (geometry) {

                        var material = new THREE.MeshPhongMaterial({
                            color:0xFACE8D
                        });

                        game.persona = new Physijs.CylinderMesh(geometry, material);

                        game.persona.rotation.set(-1.5, 0, -1.5);
                        game.persona.__dirtyRotation = true;
                        game.persona.addEventListener( 'collision', function functionName(obj) {
                            if (obj.collision == 'true') _level._gameOver();
                        });
                        game.persona.position.z=game.persona.geometry.boundingBox.max.z/2;
                        game.persona.position.x=-400;
                        game.persona.userData.keepMe=true;
                        scene.add(game.persona);

                        window.addEventListener('keydown',function () {
                        game.persona.setAngularVelocity({x: 0, y: 0, z: 0});
                        var effect = new THREE.Vector3(0,jumpForce,0);
                        game.persona.setLinearVelocity(effect);
                        game.persona.typeObject = 'persona';
                    })
                });
            return game.persona;
        },
        initBackground:function(){
            _game.background = {};
            _game.background.backgroundTexture = new THREE.TextureLoader().load( 'resources/textures/city.png' );
            _game.background.backgroundTexture.wrapS = THREE.RepeatWrapping; //set background texture to repeat wrapping for animation
            _game.background.backgroundPlane = new THREE.Mesh( new THREE.PlaneGeometry( sceneWidth,sceneHeight , 0 ), new THREE.MeshBasicMaterial( {map: _game.background.backgroundTexture, side: THREE.DoubleSide} ) );
            _game.background.backgroundPlane.userData.keepMe=true;
            _game.background.backgroundPlane.position.set( 0, 0, 50 );  //move the background texture back off the bird and pipe gates a bit
            scene.add( _game.background.backgroundPlane );
        },

        initLVL:function () {
            _level.spawnObstacles();
            music.initializeSound();
            music.playSound(music.soundTrack);
        },
        restartLVL:function () {
            var to_remove = [];

            scene.traverse ( function( child ) {
                if ( child instanceof THREE.Mesh &&!child.userData.keepMe === true ) {
                    to_remove.push( child );
                }
            } );

            for ( var i = 0; i < to_remove.length; i++ ) {
                scene.remove( to_remove[i] );
            }
            scene.remove(game.persona);
            game.persona.position.y = 0;

            scene.add(game.persona);

            _level.initLVL(sceneWidth,sceneHeight);
            scene.onSimulationResume();

            score = 0;
            music.pauseSound(music.soundGameOver);
            music.loadSound();
            music.playSound(music.soundTrack);
        },
        spawnObstacles: function () {
          function setDeletingLine() {
            let geometry = new THREE.CubeGeometry(0.1,sceneHeight,0.1);
            let material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                visible: false,
            }),.8,.3);

            let deletingLine = new Physijs.BoxMesh(geometry,material);

            deletingLine.position.x = - sceneWidth / 2 - 200;
            deletingLine.position.z = deletingLine.geometry.boundingBox.max.z/2;
            var effect = new THREE.Vector3(0,0,0);
            deletingLine.addEventListener( 'collision', function functionName(obj) {
              deleteObstacles(obj);
            });

            scene.add(deletingLine);
            _level.setVectorSpeed(deletingLine, effect);
          };

          function setSpawnLine(distance) {
              geometry = new THREE.CubeGeometry(0.01, sceneHeight, 0.01);
              material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                  visible: false,
              }),.8,.3);

              let spawnLine = new Physijs.CylinderMesh(geometry,material);
              spawnLine.position.x = sceneWidth / 2 - distance;
              spawnLine.position.y = 0;
              spawnLine.position.z = 0;
              spawnLine.addEventListener( 'collision', function functionName(obj) {
                  if (obj.typeObject === 'obstacle') {
                      setObstacles(game.gap);
                      obj.typeObject = 'passed';
                  }

              });
              var effect = new THREE.Vector3(0,0,0);
              scene.add(spawnLine);
              _level.setVectorSpeed(spawnLine, effect);
              spawnLine.typeObject = 'spawnline';
          }

          function setScoreLine(gap, positionX, positionY, vector1, vector2) {
              geometry = new THREE.CubeGeometry(0.01, gap - 50, 0.01);
              material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                  visible: false,
                  // wireframe: true
              }),.8,.3);

              let scoreLine = new Physijs.CylinderMesh(geometry,material);
              scoreLine.position.x = positionX;
              scoreLine.position.y = positionY;
              scoreLine.position.z = 50;
              scoreLine.addEventListener( 'collision', function functionName(obj) {
                  if (obj.typeObject == 'persona') {
                      music.playSound(music.soundEffect);
                      score++;
                      game.GUI.scoreTable.textContent = score;
                      _level.checkScore();
                      deleteObstacles(scoreLine);
                  }

              });
              scene.add(scoreLine);
              _level.setVectorSpeed(scoreLine, vector1, vector2);
              scoreLine.typeObject = "scoreLine";

          };

          function setObstacles(gap, position = 0) {
            let obstaclesUpper, obstaclesLower;
            const upperHeight = Math.random() * (sceneHeight - gap - 100) + 50;
            const lowerPosition = sceneHeight / 2 - upperHeight - gap;
            const lowerHeight = Math.abs(-sceneHeight / 2 - lowerPosition);

            geometry = new THREE.CubeGeometry(100, upperHeight, 100);
            material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                color: new THREE.Color("rgb(192, 0, 192)"),
            }),.8,.3);

            obstaclesUpper = new Physijs.BoxMesh(geometry,material);
            obstaclesUpper.position.x = sceneWidth / 2 + 150 - position;
            obstaclesUpper.position.y= sceneHeight/2 - (upperHeight / 2);
            obstaclesUpper.position.z = 50;
            var effect = new THREE.Vector3(0,0,0);
            var effect1 = new THREE.Vector3(-200,0,0);
            scene.add(obstaclesUpper);
            _level.setVectorSpeed(obstaclesUpper, effect, effect1);
            obstaclesUpper.typeObject = 'obstacle';
            obstaclesUpper.collision = 'true';

            geometry = new THREE.CubeGeometry(100, lowerHeight, 100);
            obstaclesLower = new Physijs.BoxMesh(geometry,material);
            obstaclesLower.position.x = sceneWidth / 2 + 150 - position;
            obstaclesLower.position.y= lowerPosition - lowerHeight / 2 ;
            obstaclesLower.position.z = 50;
            scene.add(obstaclesLower);

            _level.setVectorSpeed(obstaclesLower, effect, effect1);
            obstaclesUpper.lowerPart = obstaclesLower;
            obstaclesLower.collision = 'true';

            let positionX = obstaclesUpper.position.x + 60 + 50;
            let positionY = sceneHeight/2 - upperHeight - 10 - gap/2;

            setScoreLine(gap, positionX, positionY, effect, effect1);

          };

          function setWalls() {
              geometry = new THREE.CubeGeometry(sceneWidth, 2, 2);
              material = Physijs.createMaterial(  new THREE.MeshLambertMaterial({
                  visible: false,
              }),.8,.3);

              let wallUpper = new Physijs.BoxMesh(geometry,material);
              wallUpper.position.x = 0;
              wallUpper.position.y = sceneHeight / 2;
              wallUpper.position.z = 0;
              let effect = new THREE.Vector3(0,0,0);
              wallUpper.addEventListener( 'collision', function (obj) {
                  if (obj.typeObject == 'persona') _level._gameOver();
              });

              scene.add(wallUpper);
              _level.setVectorSpeed(wallUpper, effect);
              wallUpper.typeObject = 'wall';

              let wallLower = new Physijs.BoxMesh(geometry,material);
              wallLower.position.x = 0;
              wallLower.position.y = - sceneHeight / 2;
              wallLower.position.z = 0;
              wallLower.addEventListener( 'collision', function (obj) {
                  if (obj.typeObject == 'persona') _level._gameOver();
              });
              scene.add(wallLower);

              _level.setVectorSpeed(wallLower, effect);
              wallLower.typeObject = 'wall';

          }

          function deleteObstacles(obj) {
              scene.remove(obj);
              scene.remove(obj.lowerPart);
          };

          setDeletingLine();
          setSpawnLine(game.distance);
          setObstacles(game.gap, game.distance / 2);
          setWalls();

        },

        setVectorSpeed: function (obj, vector1, vector2 = vector1) {
          obj.setAngularFactor(vector1);
          obj.setLinearFactor(vector1);
          obj.setLinearVelocity(vector2);
          obj.setAngularVelocity(vector1);
        },
        checkScore: function(speed) {
            if (score % 5 === 0 && score !== 0) game.sceneSpeed += 0.1;
        },

        _gameOver:function() {
            music.pauseSound(music.soundTrack);
            music.playSound(music.soundGameOver);
            game.GUI.scoreTable.textContent = '0';
            game.GUI.playButton.style.display = 'block';
            game.GUI.gameOverMsg.style.display = 'block';
            game.GUI.endScore.innerHTML = `Your score:${score}`;
            gameState = 'paused';
        }
    };
    window.addEventListener('resize', function(){
        renderer.setSize(sceneWidth, sceneHeight );
        camera.aspect	= sceneWidth / sceneHeight;
        camera.updateProjectionMatrix()
    }, false);
    return _game;
};
