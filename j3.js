        const gameCanvas = document.getElementById("game-canvas");
        const gameContext = gameCanvas.getContext("2d");
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
        var previousTimeStamp = 0;
        var maxDeltaTime = 20;
        var player;
        var camera;

        function drawGameObject(gameObject) {
        	gameContext.fillStyle = gameObject.color;
        	let positionOnScreen = copyVector(gameObject.position);
        	subVectors(positionOnScreen, camera.position);
        	positionOnScreen.x += gameCanvas.width / 2;
        	positionOnScreen.y += gameCanvas.height / 2;
        	gameContext.fillRect(positionOnScreen.x, positionOnScreen.y, gameObject.scale.x, gameObject.scale.y);
        }

        function drawGameScreen() {
        	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        	gameObjects.forEach(drawGameObject);
        }
        window.addEventListener('load', () => {
        	player = Player(Vector2D(140, 200));
        	camera = Camera();
        	Block(Vector2D(10, 400), Vector2D(500, 60));
        	Block(Vector2D(410, 260), Vector2D(500, 60));
        	Block(Vector2D(550, 100), Vector2D(500, 60));
        	Portal(Vector2D(550, 100), Vector2D(50, 50));
        	Enemy(Vector2D(460, -100));
        	window.requestAnimationFrame(frame);
        });

        function frame(timeStamp) {
        	if (!previousTimeStamp) {
        		previousTimeStamp = timeStamp;
        	}
        	let deltaTime = timeStamp - previousTimeStamp;
        	if (deltaTime > maxDeltaTime) {
        		deltaTime = maxDeltaTime;
        	}
        	updateGameObjects(deltaTime);
        	gameObjects = gameObjects.filter(gameObject => {
        		return !gameObject.destroy;
        	});
        	drawGameScreen();
        	window.requestAnimationFrame(frame);
        }
        var maxFallSpeed = 5;

        function Vector2D(x, y) {
        	let vector2D = {
        		x: x,
        		y: y
        	};
        	return vector2D;
        }

        function copyVector(vector2D) {
        	return Vector2D(vector2D.x, vector2D.y);
        }

        function addVectors(a, b) {
        	a.x += b.x;
        	a.y += b.y;
        }

        function subVectors(a, b) {
        	a.x -= b.x;
        	a.y -= b.y;
        }

        function vectorMulNum(vector2D, number) {
        	vector2D.x *= number;
        	vector2D.y *= number;
        }

        function checkCollision(a, b) {
        	if (a.id == b.id) return false;
        	return a.position.x <= b.position.x + b.scale.x && a.position.x + a.scale.x >= b.position.x && a.position.y <= b.position.y + b.scale.y && a.position.y + a.scale.y >= b.position.y;
        }

        function collisions(gameObject) {
        	gameObjects.forEach(other => {
        		if (checkCollision(gameObject, other)) {
        			gameObject.onCollision(other);
        			if (gameObject.solid && other.solid) {
        				blockGameObject(gameObject, other);
        			}
        		}
        	});
        }

        function updateGameObject(gameObject, deltaTime) {
        	if (!gameObject.grounded) {
        		gameObject.velocity.y += gameObject.g * deltaTime;
        		if (gameObject.velocity.y > maxFallSpeed) {
        			gameObject.velocity.y = maxFallSpeed;
        		}
        	}
        	gameObject.onUpdate(deltaTime);
        	gameObject.grounded = false;
        	collisions(gameObject);
        	let velocity = copyVector(gameObject.velocity);
        	vectorMulNum(velocity, deltaTime);
        	addVectors(gameObject.position, velocity);
        }

        function updateGameObjects(deltaTime) {
        	gameObjects.forEach(gameObject => {
        		updateGameObject(gameObject, deltaTime);
        	});
        }

        function blockGameObject(gameObject, blocker) {
        	let gameObjectLeft = gameObject.position.x;
        	let gameObjectRight = gameObjectLeft + gameObject.scale.x;
        	let blockerLeft = blocker.position.x;
        	let blockerRight = blockerLeft + blocker.scale.x;
        	let gameObjectTop = gameObject.position.y;
        	let gameObjectBottom = gameObjectTop + gameObject.scale.y;
        	let blockerTop = blocker.position.y;
        	let blockerBottom = blockerTop + blocker.scale.y;
        	let dx = Math.min(gameObjectRight - blockerLeft, blockerRight - gameObjectLeft);
        	let dy = Math.min(gameObjectBottom - blockerTop, blockerBottom - gameObjectTop);
        	if (dx < dy) {
        		if (gameObject.position.x > blocker.position.x) {
        			if (gameObject.velocity.x < 0) {
        				gameObject.velocity.x = 0;
        				gameObject.position.x = blocker.position.x + blocker.scale.x;
        			}
        		} else {
        			if (gameObject.velocity.x > 0) {
        				gameObject.velocity.x = 0;
        				gameObject.position.x = blocker.position.x - gameObject.scale.x;
        			}
        		}
        	} else {
        		if (gameObject.position.y > blocker.position.y) {
        			if (gameObject.velocity.y < 0) {
        				gameObject.velocity.y = 0;
        				gameObject.position.y = blocker.position.y + blocker.scale.y;
        			}
        		} else {
        			if (gameObject.velocity.y > 0) {
        				gameObject.velocity.y = 0;
        				gameObject.position.y = blocker.position.y - gameObject.scale.y;
        				gameObject.grounded = true;
        			}
        		}
        	}
        }
        var gameObjects = [];
        var currentId = 0;

        function GameObject(position, scale, color) {
        	let gameObject = {
        		id: currentId,
        		position: position,
        		velocity: Vector2D(0, 0),
        		scale: scale,
        		color: color,
        		solid: true,
        		onUpdate: deltaTime => {},
        		onCollision: other => {},
        		g: 0.004,
        		grounded: false
        	};
        	currentId++;
        	gameObjects.push(gameObject);
        	return gameObject;
        }

        function Player(position) {
        	let player = GameObject(position, Vector2D(50, 50), "gold");
        	player.walkSpeed = 0.5;
        	player.jumpSpeed = 1.2;
        	player.maxJumpTime = 1000;
        	player.jumpTime = 0;
        	player.startJumpG = player.g;
        	player.endJumpG = player.g * 2;
        	player.onUpdate = deltaTime => {
        		if (player.grounded) {
        			player.jumpTime = 0;
        			player.g = player.startJumpG;
        		}
        		player.velocity.x = 0;
        		if (controls.left.pressed) {
        			player.velocity.x -= player.walkSpeed;
        		}
        		if (controls.right.pressed) {
        			player.velocity.x += player.walkSpeed;
        		}
        		if (controls.up.pressed && player.jumpTime < player.maxJumpTime) {
        			if (player.grounded) {
        				player.velocity.y = -player.jumpSpeed;
        			}
        			player.jumpTime += deltaTime;
        		} else {
        			player.jumpTime = player.maxJumpTime;
        			player.g = player.endJumpG;
        		}
        	};
        	player.onCollision = other => {
        		if (other.damage) {
        			player.destroy = true;
        		}
        	};
        	return player;
        }

        function Block(position, scale) {
        	let block = GameObject(position, scale, "black");
        	block.g = 0;
        	return block;
        }

        function Portal(position, scale) {
        	let portal = GameObject(position, scale, "green");
        	portal.g = 0;
        	return portal;
        }

        function Camera() {
        	let camera = GameObject(copyVector(player.position), Vector2D(0, 0));
        	camera.g = 0;
        	camera.solid = false;
        	camera.followPresentage = 0.005;
        	camera.onUpdate = deltaTime => {
        		vectorMulNum(camera.velocity, 0);
        		addVectors(camera.velocity, player.position);
        		subVectors(camera.velocity, camera.position);
        		vectorMulNum(camera.velocity, camera.followPresentage);
        	};
        	return camera;
        }

        function Enemy(position) {
        	let enemy = GameObject(position, Vector2D(50, 50), "red");
        	enemy.damage = true;
        	enemy.walkSpeed = 0.3;
        	enemy.maxWalkTime = 1000;
        	enemy.time = 0;
        	enemy.onUpdate = deltaTime => {
        		enemy.velocity.x = enemy.walkSpeed;
        		enemy.time += deltaTime;
        		if (enemy.time >= enemy.maxWalkTime) {
        			enemy.time = 0;
        			enemy.walkSpeed *= -1;
        		}
        	}
        	return enemy;
        }
        var controls = {
        	up: Key("UP", 38),
        	down: Key("DOWN", 40),
        	left: Key("LEFT", 37),
        	right: Key("RIGHT", 39)
        };

        function Key(key, keyCode) {
        	return {
        		key: key,
        		keyCode: keyCode,
        		pressed: false
        	};
        }

        function changeKeyPressed(event, pressed) {
        	switch (event.keyCode) {
        		case controls.up.keyCode:
        			controls.up.pressed = pressed;
        			break;
        		case controls.down.keyCode:
        			controls.down.pressed = pressed;
        			break;
        		case controls.left.keyCode:
        			controls.left.pressed = pressed;
        			break;
        		case controls.right.keyCode:
        			controls.right.pressed = pressed;
        			break;
        	}
        }
        window.addEventListener('keydown', event => {
        	changeKeyPressed(event, true);
        });
        window.addEventListener('keyup', event => {
        	changeKeyPressed(event, false);
        });
