// main{
function main() {
	new Color_Instances();
	var mazeSizeInCells = new Coords(4, 4, 1);
	//var mazeSizeInCells = new Coords(2, 1, 1);
	var universe0 = Universe.buildRandom(mazeSizeInCells, new Coords(80, 80, 40) // mazeCellSizeInPixels
	);
	var inputs = new Input_Instances();
	var amountToMoveForward = .4;
	var amountToMoveBackward = amountToMoveForward / 2;
	var amountToYaw = 0.1;
	var amountToStrafe = .1;
	var inputToActionBindings = [
		new InputToActionBinding(inputs.A, new Action_Turn(new Coords(amountToYaw, 0, 0))),
		new InputToActionBinding(inputs.E, new Action_DoSomething()),
		new InputToActionBinding(inputs.C, new Action_Move(new Coords(0, amountToStrafe, 0))),
		new InputToActionBinding(inputs.D, new Action_Turn(new Coords(0 - amountToYaw, 0, 0))),
		//new InputToActionBinding( inputs.F, new Action_CameraZoomOut(-1) ),
		//new InputToActionBinding( inputs.R, new Action_CameraZoomOut(1) ),
		new InputToActionBinding(inputs.S, new Action_Move(new Coords(-amountToMoveBackward, 0, 0))),
		new InputToActionBinding(inputs.W, new Action_Move(new Coords(amountToMoveForward, 0, 0))),
		new InputToActionBinding(inputs.X, new Action_Stop()),
		new InputToActionBinding(inputs.Z, new Action_Move(new Coords(0, 0 - amountToStrafe, 0))),
		new InputToActionBinding(inputs.MouseButton, new Action_DoNothing()),
		new InputToActionBinding(inputs.Space, new Action_Jump(.6)),
	];
	Globals.Instance.initialize(50, // millisecondsPerTick
		new Coords(320, 240, 2000), // viewSizeInPixels
		//new Coords(640, 480, 2000), // viewSizeInPixels
		inputToActionBindings, universe0);
}
// extensions
function ArrayExtensions() {} {
	Array.prototype.addLookups = function(propertyNameForKey) {
		for (var i = 0; i < this.length; i++) {
			var arrayItem = this[i];
			var key = arrayItem[propertyNameForKey];
			this[key] = arrayItem;
		}
	}
	Array.prototype.appendElementsFrom = function(other) {
		for (var i = 0; i < other.length; i++) {
			this.push(other[i]);
		}
	}
	Array.prototype.clone = function() {
		var returnValue = [];
		for (var i = 0; i < this.length; i++) {
			var item = this[i];
			var itemClone = item.clone();
			returnValue.push(itemClone);
		}
		return returnValue;
	}
	Array.prototype.getPropertyValueForEachItem = function(propertyName) {
		var returnValues = [];
		for (var i = 0; i < this.length; i++) {
			returnValues.push(this[i][propertyName]);
		}
		return returnValues;
	}
	Array.prototype.prependElementsFrom = function(other) {
		for (var i = 0; i < other.length; i++) {
			this.splice(0, 0, other[i]);
		}
	}
	Array.prototype.sortArrayIntoOtherUsingCompareFunction = function(arraySorted, compareFunction) {
		for (var i = 0; i < this.length; i++) {
			var elementToSort = this[i];
			var j = 0;
			for (j = 0; j < arraySorted.length; j++) {
				var elementSorted = arraySorted[j];
				if (compareFunction(elementToSort, elementSorted) > 0) {
					break;
				}
			}
			arraySorted.splice(j, 0, elementToSort);
		}
		return arraySorted;
	}
}
// classes
function Action_DoNothing() {
	this.name = "DoNothing";
} {
	Action_DoNothing.prototype.perform = function(world, body) {
		// do nothing
	}
}

function Action_DoSomething() {
	this.name = "DoSomething";
} {
	Action_DoSomething.prototype.perform = function(world, body) {
		var animationRun = body.constraints["Animate"].animationRun;
		animationRun.animationDefnNameCurrent = "DoSomething";
	}
}

function Action_Move(amountToMoveForwardRightDown) {
	this.amountToMoveForwardRightDown = amountToMoveForwardRightDown;
	this.name = "Move" + this.amountToMoveForwardRightDown.toString();
	this.acceleration = new Coords(0, 0, 0);
	this.transformOrient = new Transform_Orient();
} {
	Action_Move.prototype.perform = function(world, body) {
		var bodyLoc = body.loc;
		var isBodyOnGround = (bodyLoc.pos.z >= 0); // hack
		if (isBodyOnGround == true) {
			this.transformOrient.orientation = bodyLoc.orientation;
			this.acceleration.overwriteWith(this.amountToMoveForwardRightDown).transform(this.transformOrient)
			bodyLoc.accel.add(this.acceleration);
			var animationRun = body.constraints["Animate"].animationRun;
			animationRun.animationDefnNameCurrent = "Walk";
		}
	}
}

function Action_CameraZoomOut(distanceToZoomOut) {
	this.ticksToHold = 1;
	this.distanceToZoomOut = distanceToZoomOut;
	this.name = "CameraZoomOut" + this.distanceToZoomOut;
} {
	Action_CameraZoomOut.prototype.perform = function(world, body) {
		var world = Globals.Instance.universe.worldCurrent;
		var bodyForCamera = world.camera.body;
		var constraintAttach = bodyForCamera.constraints["Attach"];
		constraintAttach.offsetForwardRightDown.add(new Coords(-1, 0, -1).normalize().multiplyScalar(this.distanceToZoomOut));
	}
}

function Action_Jump(acceleration) {
	this.name = "Jump";
	this.acceleration = acceleration;
} {
	Action_Jump.prototype.perform = function(world, body) {
		var bodyLoc = body.loc;
		if (bodyLoc.pos.z >= 0) {
			bodyLoc.accel.z -= this.acceleration;
		}
		var animationRun = body.constraints["Animate"].animationRun;
		animationRun.animationDefnNameCurrent = "Jump";
	}
}

function Action_Stop() {
	this.name = "Stop";
} {
	Action_Stop.prototype.perform = function(world, body) {
		var bodyLoc = body.loc;
		bodyLoc.vel.clear();
		bodyLoc.accel.clear();
	}
}

function Action_Turn(amountToTurnRightAndDown) {
	this.ticksToHold = 1;
	this.amountToTurnRightAndDown = amountToTurnRightAndDown;
	this.name = "Turn" + this.amountToTurnRightAndDown.toString();
	this.orientationTemp = Orientation.buildDefault();
} {
	Action_Turn.prototype.perform = function(world, body) {
		var bodyOrientation = body.loc.orientation;
		this.orientationTemp.overwriteWith(bodyOrientation);
		bodyOrientation.overwriteWith(new Orientation(this.orientationTemp.forward.add(this.orientationTemp.right.multiplyScalar(this.amountToTurnRightAndDown.x)), bodyOrientation.down))
		// todo - Down.
	}
}

function Activity(defn, parameters) {
	this.defn = defn;
	this.parameters = parameters;
} {
	Activity.prototype.perform = function(world, body) {
		this.defn.perform(world, body, this);
	}
}

function ActivityDefn(name, perform) {
	this.name = name;
	this.perform = perform;
} {
	function ActivityDefn_Instances() {
		if (ActivityDefn.Instances == null) {
			ActivityDefn.Instances = this;
		}
		this.DoNothing = new ActivityDefn("Do Nothing", function(world, body, activity) {
			// do nothing
		});
		this.UserInputAccept = new ActivityDefn("Accept User Input", function(world, body, activity) {
			var inputHelper = Globals.Instance.inputHelper;
			var actionsFromInput = inputHelper.actionsForInputsPressed;
			var actionsFromActor = body.actions;
			for (var a = 0; a < actionsFromInput.length; a++) {
				var action = actionsFromInput[a];
				var ticksToHold = (action.ticksToHold == null ? action.ticksSoFar // hold forever
					: action.ticksToHold);
				if (action.ticksSoFar <= ticksToHold) {
					actionsFromActor.push(action);
				}
			}
		});
	}
	ActivityDefn.Instances = new ActivityDefn_Instances();
}

function AnimationDefn(name, keyframes) {
	this.name = name;
	this.keyframes = keyframes;
	this.numberOfFramesTotal = this.keyframes[this.keyframes.length - 1].frameIndex - this.keyframes[0].frameIndex;
	this.propagateTransformsToAllKeyframes();
} {
	AnimationDefn.prototype.propagateTransformsToAllKeyframes = function() {
		var propertyNamesAll = [];
		for (var f = 0; f < this.keyframes.length; f++) {
			var keyframe = this.keyframes[f];
			var transforms = keyframe.transforms;
			for (var t = 0; t < transforms.length; t++) {
				var transform = transforms[t];
				var propertyName = transform.propertyName;
				if (propertyNamesAll[propertyName] == null) {
					propertyNamesAll[propertyName] = propertyName;
					propertyNamesAll.push(propertyName);
				}
			}
		}
		var keyframe = null;
		var keyframePrev = null;
		for (var f = 0; f < this.keyframes.length; f++) {
			keyframePrev = keyframe;
			keyframe = this.keyframes[f];
			var transforms = keyframe.transforms;
			for (var p = 0; p < propertyNamesAll.length; p++) {
				var propertyName = propertyNamesAll[p];
				if (transforms[propertyName] == null) {
					var keyframeNext = null;
					for (var g = f + 1; g < this.keyframes.length; g++) {
						var keyframeFuture = this.keyframes[g];
						var transformFuture = keyframeFuture.transforms[propertyName];
						if (transformFuture != null) {
							keyframeNext = keyframeFuture;
							break;
						}
					}
					if (keyframePrev != null && keyframeNext != null) {
						var transformPrev = keyframePrev.transforms[propertyName];
						var transformNext = keyframeNext.transforms[propertyName];
						var numberOfFramesFromPrevToNext = keyframeNext.frameIndex - keyframePrev.frameIndex;
						var numberOfFramesFromPrevToCurrent = keyframe.frameIndex - keyframePrev.frameIndex;
						var fractionOfProgressFromPrevToNext = numberOfFramesFromPrevToCurrent / numberOfFramesFromPrevToNext;
						var transformNew = transformPrev.interpolateWith(transformNext, fractionOfProgressFromPrevToNext);
						transforms[propertyName] = transformNew;
						transforms.push(transformNew);
					}
				}
			}
		}
	}
}

function AnimationDefnGroup(name, animationDefns) {
	this.name = name;
	this.animationDefns = animationDefns;
	this.animationDefns.addLookups("name");
}

function AnimationKeyframe(frameIndex, transforms) {
	this.frameIndex = frameIndex;
	this.transforms = transforms;
	this.transforms.addLookups("propertyName");
} {
	AnimationKeyframe.prototype.interpolateWith = function(other, fractionOfProgressTowardOther) {
		var transformsInterpolated = [];
		for (var i = 0; i < this.transforms.length; i++) {
			var transformThis = this.transforms[i];
			var transformOther = other.transforms[transformThis.propertyName];
			var transformInterpolated = transformThis.interpolateWith(transformOther, fractionOfProgressTowardOther);
			transformsInterpolated.push(transformInterpolated);
		}
		var returnValue = new AnimationKeyframe(null, // frameIndex
			transformsInterpolated);
		return returnValue;
	}
}

function AnimationRun(animationDefnGroup, transformableAtRest, transformable) {
	this.animationDefnGroup = animationDefnGroup;
	this.animationDefnNameCurrent = null;
	this.transformableAtRest = transformableAtRest;
	this.transformable = transformable;
} {
	AnimationRun.prototype.animationDefnCurrent = function() {
		var returnValue = null;
		if (this.animationDefnNameCurrent != null) {
			var animationDefns = this.animationDefnGroup.animationDefns;
			returnValue = animationDefns[this.animationDefnNameCurrent];
		}
		return returnValue;
	}
	AnimationRun.prototype.frameCurrent = function() {
		var returnValue = null;
		var animationDefn = this.animationDefnCurrent();
		var framesSinceBeginningOfCycle = Globals.Instance.timerTicksSoFar % animationDefn.numberOfFramesTotal;
		var i;
		var keyframes = animationDefn.keyframes;
		for (i = keyframes.length - 1; i >= 0; i--) {
			keyframe = keyframes[i];
			if (keyframe.frameIndex <= framesSinceBeginningOfCycle) {
				break;
			}
		}
		var keyframe = keyframes[i];
		var framesSinceKeyframe = framesSinceBeginningOfCycle - keyframe.frameIndex;
		var keyframeNext = keyframes[i + 1];
		var numberOfFrames = keyframeNext.frameIndex - keyframe.frameIndex;
		var fractionOfProgressFromKeyframeToNext = framesSinceKeyframe / numberOfFrames;
		returnValue = keyframe.interpolateWith(keyframeNext, fractionOfProgressFromKeyframeToNext);
		return returnValue;
	}
	AnimationRun.prototype.updateForTimerTick = function() {
		this.transformable.overwriteWith(this.transformableAtRest);
		if (this.animationDefnNameCurrent != null) {
			var frameCurrent = this.frameCurrent();
			var transforms = frameCurrent.transforms;
			for (var i = 0; i < transforms.length; i++) {
				var transformToApply = transforms[i];
				transformToApply.transform(this.transformable);
			}
		}
	}
}

function Body(name, defn, loc) {
	this.name = name;
	this.defn = defn;
	this.loc = loc;
	if (this.defn.mesh != null) {
		this.meshTransformed = this.defn.mesh.clone();
		this.collidableData = new CollidableData();
	}
} {
	Body.prototype.resetMeshTransformed = function() {
		if (this.meshTransformed != null) {
			this.meshTransformed.overwriteWith(this.defn.mesh);
		}
	}
}

function BodyDefn(name, isDrawable, isMovable, mesh) {
	this.name = name;
	this.isDrawable = isDrawable;
	this.isMovable = isMovable;
	this.mesh = mesh;
}

function Bone(name, length, orientation, children, isVisible) {
	this.name = name;
	this.length = length;
	this.orientation = orientation;
	this.children = children;
	this.isVisible = (isVisible == null ? true : isVisible);
	for (var i = 0; i < this.children.length; i++) {
		var child = this.children[i];
		child.parentName = this.name;
	}
} {
	// instance methods
	Bone.prototype.pos = function(bonesAll) {
		var returnValue = new Coords(0, 0, 0);
		var bone = bonesAll[this.parentName];
		while (bone != null) {
			returnValue.add(bone.orientation.forward.clone().multiplyScalar(bone.length));
			bone = bonesAll[bone.parentName];
		}
		return returnValue;
	}
	// cloneable
	Bone.prototype.clone = function() {
		// test
		var orientationCloned = this.orientation.clone();
		var returnValue = new Bone(this.name, this.length, orientationCloned, Cloneable.cloneMany(this.children), this.isVisible);
		return returnValue;
	}
	Bone.prototype.overwriteWith = function(other) {
		this.orientation.overwriteWith(other.orientation);
		Cloneable.overwriteManyWithOthers(this.children, other.children);
	}
	// transformable
	Bone.prototype.transform = function(transformToApply) {
		this.orientation.transform(transformToApply);
	}
}

function BoneInfluence(boneName, vertexIndicesControlled) {
	this.boneName = boneName;
	this.vertexIndicesControlled = vertexIndicesControlled;
} {
	// static methods
	BoneInfluence.buildManyForBonesAndVertexGroups = function(bones, vertexGroups) {
		var boneInfluences = [];
		for (var i = 0; i < vertexGroups.length; i++) {
			var vertexGroup = vertexGroups[i];
			var boneName = vertexGroup.name;
			var bone = bones[boneName];
			if (bone != null) {
				var boneInfluence = new BoneInfluence(boneName, vertexGroup.vertexIndices.slice());
				boneInfluences.push(boneInfluence);
			}
		}
		return boneInfluences;
	}
}

function Bounds(min, max) {
	this.min = min;
	this.max = max;
} {
	Bounds.prototype.containsPos = function(posToCheck) {
		return posToCheck.isWithinRangeMinMax(this.min, this.max);
	}
	Bounds.prototype.minAndMax = function() {
		return [this.min, this.max];
	}
	Bounds.prototype.setFromPositions = function(positions) {
		this.min = positions[0].clone();
		this.max = positions[0].clone();
		for (var i = 1; i < positions.length; i++) {
			var pos = positions[i];
			for (var d = 0; d < Coords.NumberOfDimensions; d++) {
				var posDimension = pos.dimension(d);
				if (posDimension < this.min.dimension(d)) {
					this.min.dimension_Set(d, posDimension);
				}
				if (posDimension > this.max.dimension(d)) {
					this.max.dimension_Set(d, posDimension);
				}
			}
		}
	}
}

function Camera(viewSize, focalLength, body) {
	this.viewSize = viewSize;
	this.focalLength = focalLength;
	this.body = body;
	this.viewSizeHalf = this.viewSize.clone().divideScalar(2);
	this.viewSizeHalf.z = 0;
	this._clipPlanes = [
		new Plane(new Coords(0, 0, 0), 0),
		new Plane(new Coords(0, 0, 0), 0),
		new Plane(new Coords(0, 0, 0), 0),
		new Plane(new Coords(0, 0, 0), 0),
	];
} {
	Camera.prototype.clipPlanes = function() {
		var returnValues = [];
		var cameraLoc = this.body.loc;
		var cameraOrientation = cameraLoc.orientation;
		var cameraPos = cameraLoc.pos.clone();
		var centerOfViewPlane = cameraPos.clone().add(cameraOrientation.forward.clone().multiplyScalar(this.focalLength));
		var cornerOffsetRight = cameraOrientation.right.clone().multiplyScalar(this.viewSizeHalf.x);
		var cornerOffsetDown = cameraOrientation.down.clone().multiplyScalar(this.viewSizeHalf.y);
		var cameraViewCorners = [
			centerOfViewPlane.clone().add(cornerOffsetRight).add(cornerOffsetDown),
			centerOfViewPlane.clone().subtract(cornerOffsetRight).add(cornerOffsetDown),
			centerOfViewPlane.clone().subtract(cornerOffsetRight).subtract(cornerOffsetDown),
			centerOfViewPlane.clone().add(cornerOffsetRight).subtract(cornerOffsetDown),
		];
		var numberOfCorners = cameraViewCorners.length;
		for (var i = 0; i < numberOfCorners; i++) {
			var iNext = i + 1;
			if (iNext >= numberOfCorners) {
				iNext = 0;
			}
			var clipPlane = this._clipPlanes[i];
			var cameraViewCorner = cameraViewCorners[i];
			var cameraViewCornerNext = cameraViewCorners[iNext];
			clipPlane.fromPoints(cameraPos, cameraViewCorner, cameraViewCornerNext);
		}
		return this._clipPlanes;
	}
}

function Cloneable() {} {
	Cloneable.cloneMany = function(cloneablesToClone) {
		var returnValues = null;
		if (cloneablesToClone != null) {
			returnValues = [];
			for (var c = 0; c < cloneablesToClone.length; c++) {
				var clone = cloneablesToClone[c].clone();
				returnValues.push(clone);
			}
		}
		return returnValues;
	}
	Cloneable.overwriteManyWithOthers = function(cloneablesToBeOverwritten, cloneablesToOverwriteWith) {
		for (var i = 0; i < cloneablesToBeOverwritten.length; i++) {
			var cloneableToBeOverwritten = cloneablesToBeOverwritten[i];
			var cloneableToOverwriteWith = cloneablesToOverwriteWith[i];
			cloneableToBeOverwritten.overwriteWith(cloneableToOverwriteWith);
		}
	}
}

function CollidableData() {
	this.collisionNodesOccupied = [];
}

function Collision(pos, distanceToCollision, colliders) {
	this.pos = pos;
	this.distanceToCollision = distanceToCollision;
	this.colliders = colliders;
} {
	// static methods
	Collision.addCollisionsOfEdgeAndMeshToList = function(edge, mesh, listToAddTo) {
		for (var f = 0; f < mesh.faces.length; f++) {
			var face = mesh.faces[f];
			if (face.plane.normal.dotProduct(edge.direction) < 0) {
				var collision = Collision.findCollisionOfEdgeAndFace(edge, face);
				if (collision != null) {
					collision.colliders["Mesh"] = mesh;
					listToAddTo.push(collision);
				}
			}
		}
		return listToAddTo;
	}
	Collision.addCollisionsOfEdgeAndWorldToList = function(edge, world, listToAddTo) {
		for (var z = 0; z < world.zonesActive.length; z++) {
			var zone = world.zonesActive[z];
			Collision.addCollisionsOfEdgeAndZoneToList(edge, zone, listToAddTo);
		}
		return listToAddTo;
	}
	Collision.addCollisionsOfEdgeAndZoneToList = function(edge, zone, listToAddTo) {
		Collision.addCollisionsOfEdgeAndMeshToList(edge, zone.body.meshTransformed, listToAddTo);
		return listToAddTo;
	}
	Collision.doBoundsCollide = function(bounds0, bounds1) {
		var returnValue = false;
		var bounds = [bounds0, bounds1];
		for (var b = 0; b < bounds.length; b++) {
			var boundsThis = bounds[b];
			var boundsOther = bounds[1 - b];
			var doAllDimensionsOverlapSoFar = true;
			for (var d = 0; d < Coords.NumberOfDimensions; d++) {
				if (boundsThis.max.dimension(d) < boundsOther.min.dimension(d) || boundsThis.min.dimension(d) > boundsOther.max.dimension(d)) {
					doAllDimensionsOverlapSoFar = false;
					break;
				}
			}
			if (doAllDimensionsOverlapSoFar == true) {
				returnValue = true;
				break;
			}
		}
		return returnValue;
	}
	Collision.findClosest = function(collisionsToCheck) {
		var collisionClosest = collisionsToCheck[0];
		for (var i = 1; i < collisionsToCheck.length; i++) {
			var collision = collisionsToCheck[i];
			if (collision.distanceToCollision < collisionClosest.distanceToCollision) {
				collisionClosest = collision;
			}
		}
		return collisionClosest;
	}
	Collision.findCollisionOfEdgeAndFace = function(edge, face) {
		var returnValue = null;
		var collisionOfEdgeWithFacePlane = Collision.findCollisionOfEdgeAndPlane(edge, face.plane);
		if (collisionOfEdgeWithFacePlane != null) {
			var isWithinFace = Collision.isPosWithinFace(collisionOfEdgeWithFacePlane.pos, face);
			if (isWithinFace == true) {
				returnValue = collisionOfEdgeWithFacePlane;
				returnValue.colliders["Face"] = face;
			}
		}
		return returnValue;
	}
	Collision.findCollisionOfEdgeAndPlane = function(edge, plane) {
		var returnValue = null;
		var distanceToCollision = (plane.distanceFromOrigin - plane.normal.dotProduct(edge.vertices[0])) / plane.normal.dotProduct(edge.direction);
		if (distanceToCollision >= 0 && distanceToCollision <= edge.length) {
			var collisionPos = edge.direction.clone().multiplyScalar(distanceToCollision).add(edge.vertices[0]);
			var colliders = [];
			colliders["Edge"] = edge;
			colliders["Plane"] = plane;
			returnValue = new Collision(collisionPos, distanceToCollision, colliders);
		}
		return returnValue;
	}
	Collision.isPosWithinFace = function(posToCheck, face) {
		var displacementFromVertex0ToCollision = Coords.Instances.Temp;
		var isPosWithinAllEdgesOfFaceSoFar = true;
		for (var e = 0; e < face.edges.length; e++) {
			var edgeFromFace = face.edges[e];
			displacementFromVertex0ToCollision.overwriteWith(posToCheck).subtract(edgeFromFace.vertices[0]);
			var displacementProjectedAlongEdgeTransverse = displacementFromVertex0ToCollision.dotProduct(edgeFromFace.transverse);
			if (displacementProjectedAlongEdgeTransverse > 0) {
				isPosWithinAllEdgesOfFaceSoFar = false;
				break;
			}
		}
		return isPosWithinAllEdgesOfFaceSoFar;
	}
	Collision.findDistanceOfPositionAbovePlane = function(posToCheck, plane) {
		var returnValue = posToCheck.dotProduct(plane.normal) - plane.distanceFromOrigin;
		return returnValue;
	}
}

function Color(name, symbol, componentsRGBA) {
	this.name = name;
	this.symbol = symbol;
	this.componentsRGBA = componentsRGBA;
	this.systemColor = "rgba(" + Math.floor(255 * this.componentsRGBA[0]) + ", " + Math.floor(255 * this.componentsRGBA[1]) + ", " + Math.floor(255 * this.componentsRGBA[2]) + ", " + this.componentsRGBA[3] + ")";
} {
	// contants
	Color.NumberOfComponentsRGBA = 4;
	// instances
	function Color_Instances() {
		if (Color.Instances == null) {
			Color.Instances = this;
		}
		this._Transparent = new Color("Transparent", ".", [0, 0, 0, 0]);
		this.Black = new Color("Black", "k", [0, 0, 0, 1]);
		this.Blue = new Color("Blue", "b", [0, 0, 1, 1]);
		this.Cyan = new Color("Cyan", "c", [0, 1, 1, 1]);
		this.Gray = new Color("Gray", "a", [0.5, 0.5, 0.5, 1]);
		this.GrayDark = new Color("GrayDark", "A", [0.25, 0.25, 0.25, 1]);
		this.GrayLight = new Color("GrayLight", "@", [0.75, 0.75, 0.75, 1]);
		this.Green = new Color("Green", "g", [0, 1, 0, 1]);
		this.Red = new Color("Red", "r", [1, 0, 0, 1]);
		this.White = new Color("White", "w", [1, 1, 1, 1]);
		this.Yellow = new Color("Yellow", "y", [1, 1, 0, 1]);
		this._All = [
			this._Transparent,
			this.Black,
			this.Blue,
			this.Cyan,
			this.Gray,
			this.GrayDark,
			this.GrayLight,
			this.Green,
			this.Red,
			this.White,
			this.Yellow,
		];
		this._All.addLookups("symbol");
	}
	Color.Instances = new Color_Instances();
}

function Constants() {} {
	Constants.RadiansPerCircle = Math.PI * 2;
}

function Constraint_Animate(transformableAtRest, transformableTransformed, animationDefnGroup) {
	this.name = "Animate";
	this.transformableAtRest = transformableAtRest;
	this.transformableTransformed = transformableTransformed;
	this.animationDefnGroup = animationDefnGroup;
	this.animationRun = new AnimationRun(this.animationDefnGroup, this.transformableAtRest, this.transformableTransformed);
} {
	Constraint_Animate.prototype.constrainBody = function(world, bodyToConstrain) {
		this.animationRun.updateForTimerTick();
	}
}

function Constraint_Attach(bodyAttachedTo, offsetForwardRightDown) {
	this.name = "Attach";
	this.bodyAttachedTo = bodyAttachedTo;
	this.offsetForwardRightDown = offsetForwardRightDown;
	this.transformOrient = new Transform_Orient(this.bodyAttachedTo.loc.orientation);
} {
	Constraint_Attach.prototype.constrainBody = function(world, bodyToConstrain) {
		bodyToConstrain.loc.pos.overwriteWith(this.offsetForwardRightDown).transform(this.transformOrient).add(this.bodyAttachedTo.loc.pos);
	}
}

function Constraint_Follow(bodyToFollow, distanceToKeep) {
	this.name = "Follow";
	this.bodyToFollow = bodyToFollow;
	this.distanceToKeep = distanceToKeep;
} {
	Constraint_Follow.prototype.constrainBody = function(world, bodyToConstrain) {
		var bodyToConstrainLoc = bodyToConstrain.loc;
		var bodyToConstrainPos = bodyToConstrainLoc.pos;
		var bodyToFollowLoc = this.bodyToFollow.loc;
		var bodyToFollowPos = bodyToFollowLoc.pos;
		var displacementToLeader = bodyToFollowPos.clone().subtract(bodyToConstrainPos);
		displacementToLeader.z = 0; // hack - XY only
		var distanceToLeader = displacementToLeader.magnitude();
		var directionToLeader = displacementToLeader.clone().divideScalar(distanceToLeader);
		var deviation = distanceToLeader - this.distanceToKeep;
		if (deviation > 0) {
			var deviationFractional = deviation / this.distanceToKeep;
			var thrustBase = this.distanceToKeep / 2; // hack
			var thrustToApply = deviationFractional * thrustBase;
			bodyToConstrainPos.add(directionToLeader.clone().multiplyScalar(thrustToApply))
		}
	}
}

function Constraint_Friction(speedMax, frictionPerTick, epsilon) {
	this.speedMax = speedMax;
	this.frictionPerTick = frictionPerTick;
	this.epsilon = epsilon;
} {
	Constraint_Friction.prototype.constrainBody = function(world, bodyToConstrain) {
		var vel = bodyToConstrain.loc.vel;
		var velZ = vel.z;
		var speed = vel.magnitude();
		if (speed > this.speedMax) {
			vel.normalize().multiplyScalar(this.speedMax);
		} else if (speed > this.epsilon) {
			vel.multiplyScalar(1 - this.frictionPerTick);
		} else {
			vel.clear();
			var animationRun = bodyToConstrain.constraints["Animate"].animationRun;
			animationRun.animationDefnNameCurrent = null;
		}
		vel.z = velZ;
	}
}

function Constraint_Gravity(accelerationPerTick) {
	this.accelerationPerTick = accelerationPerTick;
} {
	Constraint_Gravity.prototype.constrainBody = function(world, bodyToConstrain) {
		var bodyLoc = bodyToConstrain.loc;
		if (bodyLoc.pos.z < 0) {
			bodyLoc.accel.z += this.accelerationPerTick;
		} else {
			bodyLoc.vel.z = 0;
			bodyLoc.pos.z = 0;
			var animationRun = bodyToConstrain.constraints["Animate"].animationRun;
			if (animationRun.animationDefnNameCurrent == "Jump") {
				animationRun.animationDefnNameCurrent = "Walk";
			}
		}
	}
}

function Constraint_Movable() {
	// todo
} {
	Constraint_Movable.prototype.constrainBody = function(world, bodyToConstrain) {
		var bodyLoc = bodyToConstrain.loc;
		var bodyPos = bodyLoc.pos;
		var bodyVel = bodyLoc.vel;
		var bodyAccel = bodyLoc.accel;
		bodyVel.add(bodyAccel);
		bodyAccel.clear();
		bodyPos.add(bodyVel);
		var transformLocate = new Transform_Locate(bodyLoc);
		bodyToConstrain.meshTransformed.transform(transformLocate);
		bodyToConstrain.meshTransformed.recalculateDerivedValues();
	}
}

function Constraint_OrientToward(targetBody) {
	this.targetBody = targetBody;
	this.transformOrient = new Transform_Orient(Orientation.buildDefault());
} {
	Constraint_OrientToward.prototype.constrainBody = function(world, bodyToConstrain) {
		var bodyOrientationForward = this.targetBody.loc.pos.clone().subtract(bodyToConstrain.loc.pos).normalize();
		bodyToConstrain.loc.orientation.overwriteWith(new Orientation(bodyOrientationForward, this.targetBody.loc.orientation.down));
	}
}

function Constraint_Pose(skeletonAtRest, skeletonPosed) {
	this.skeletonAtRest = skeletonAtRest;
	this.skeletonPosed = skeletonPosed;
} {
	Constraint_Pose.prototype.constrainBody = function(world, bodyToConstrain) {
		var meshAtRest = bodyToConstrain.defn.mesh;
		var meshPosed = bodyToConstrain.meshTransformed;
		var transformPose = new Transform_MeshPoseWithSkeleton(meshAtRest, this.skeletonAtRest, this.skeletonPosed, BoneInfluence.buildManyForBonesAndVertexGroups(this.skeletonAtRest.bonesAll, meshAtRest.vertexGroups));
		transformPose.transformMesh(meshPosed);
	}
}

function Constraint_Solid() {
	this.collisions = [];
} {
	Constraint_Solid.prototype.constrainBody = function(world, bodyToConstrain) {
		var bodyLoc = bodyToConstrain.loc;
		var bodyPos = bodyLoc.pos;
		var bodyVel = bodyLoc.vel;
		var bodyAccel = bodyLoc.accel;
		while (true) {
			var bodyPosNext = bodyPos.clone().add(bodyVel).add(bodyAccel)
			var edgeForMovement = new Edge(null, // face
				[bodyPos, bodyPosNext]);
			if (edgeForMovement.length == 0) {
				break;
			} else {
				this.collisions.length = 0;
				Collision.addCollisionsOfEdgeAndWorldToList(edgeForMovement, world, this.collisions);
				if (this.collisions.length == 0) {
					break;
				} else {
					var collisionClosest = Collision.findClosest(this.collisions);
					var faceCollidedWith = collisionClosest.colliders["Face"];
					var planeCollidedWith = faceCollidedWith.plane;
					var planeNormal = planeCollidedWith.normal;
					bodyPos.overwriteWith(collisionClosest.pos);
					bodyVel.subtract(planeNormal.clone().multiplyScalar(bodyVel.dotProduct(planeNormal)));
					bodyAccel.subtract(planeNormal.clone().multiplyScalar(bodyAccel.dotProduct(planeNormal)));
				}
			} // end if (edgeForMovement.length > 0)
		} // end while (true)
	} // end method
}

function Coords(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
} {
	// constants
	Coords.NumberOfDimensions = 3;
	// instances
	function Coords_Instances() {
		if (Coords.Instances == null) {
			Coords.Instances = this;
		}
		this.OneZeroZero = new Coords(1, 0, 0);
		this.Ones = new Coords(1, 1, 1);
		this.ZeroZeroOne = new Coords(0, 0, 1);
		this.Zeroes = new Coords(0, 0, 0);
		this.Temp = new Coords(0, 0, 0);
	}
	Coords.Instances = new Coords_Instances();
	// instance methods
	Coords.prototype.absolute = function() {
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		this.z = Math.abs(this.z);
		return this;
	}
	Coords.prototype.add = function(other) {
		this.x += other.x;
		this.y += other.y;
		this.z += other.z;
		return this;
	}
	Coords.prototype.clear = function() {
		this.x = 0;
		this.y = 0;
		this.z = 0;
		return this;
	}
	Coords.prototype.clone = function() {
		return new Coords(this.x, this.y, this.z);
	}
	Coords.prototype.crossProduct = function(other) {
		this.overwriteWithDimensions(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x);
		return this;
	}
	Coords.prototype.dimension = function(dimensionIndex) {
		if (dimensionIndex == 0) {
			returnValue = this.x;
		} else if (dimensionIndex == 1) {
			returnValue = this.y;
		} else // if (dimensionIndex == 2)
		{
			returnValue = this.z;
		}
		return returnValue;
	}
	Coords.prototype.dimension_Set = function(dimensionIndex, value) {
		if (dimensionIndex == 0) {
			this.x = value;
		} else if (dimensionIndex == 1) {
			this.y = value;
		} else // if (dimensionIndex == 2)
		{
			this.z = value;
		}
		return returnValue;
	}
	Coords.prototype.dimensions = function() {
		return [this.x, this.y, this.z];
	}
	Coords.prototype.divide = function(other) {
		this.x /= other.x;
		this.y /= other.y;
		this.z /= other.z;
		return this;
	}
	Coords.prototype.divideScalar = function(scalar) {
		this.x /= scalar;
		this.y /= scalar;
		this.z /= scalar;
		return this;
	}
	Coords.prototype.dotProduct = function(other) {
		var returnValue = this.x * other.x + this.y * other.y + this.z * other.z;
		return returnValue;
	}
	Coords.prototype.equals = function(other, epsilon) {
		if (epsilon == null) {
			epsilon = 0;
		}
		var returnValue = (
			(Math.abs(this.x - other.x) < epsilon) && (Math.abs(this.y - other.y) < epsilon) && (Math.abs(this.z - other.z) < epsilon));
		return returnValue;
	}
	Coords.prototype.floor = function() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		return this;
	}
	Coords.prototype.isWithinRangeMinMax = function(min, max) {
		var returnValue = (this.x >= min.x && this.y >= min.y && this.z >= min.z && this.x <= max.x && this.y <= max.y && this.z <= max.z);
		return returnValue;
	}
	Coords.prototype.isWithinRangeMax = function(max) {
		var returnValue = (this.x >= 0 && this.y >= 0 && this.z >= 0 && this.x <= max.x && this.y <= max.y && this.z <= max.z);
		return returnValue;
	}
	Coords.prototype.magnitude = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	Coords.prototype.multiply = function(other) {
		this.x *= other.x;
		this.y *= other.y;
		this.z *= other.z;
		return this;
	}
	Coords.prototype.multiplyScalar = function(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}
	Coords.prototype.normalize = function() {
		return this.divideScalar(this.magnitude());
	}
	Coords.prototype.overwriteWith = function(other) {
		this.x = other.x;
		this.y = other.y;
		this.z = other.z;
		return this;
	}
	Coords.prototype.overwriteWithDimensions = function(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}
	Coords.prototype.productOfDimensions = function() {
		var returnValue = (this.x * this.y * this.z);
		return returnValue;
	}
	Coords.prototype.randomize = function() {
		var randomizer = Randomizer.Instance;
		return this.overwriteWithDimensions(randomizer.next(), randomizer.next(), randomizer.next());
	}
	Coords.prototype.subtract = function(other) {
		this.x -= other.x;
		this.y -= other.y;
		this.z -= other.z;
		return this;
	}
	Coords.prototype.sumOfDimensions = function() {
		var returnValue = (this.x + this.y + this.z);
		return returnValue;
	}
	Coords.prototype.toString = function() {
		return "(" + this.x + "," + this.y + "," + this.z + ")";
	}
	Coords.prototype.transform = function(transformToApply) {
		transformToApply.applyToCoords(this);
		return this;
	}
	Coords.prototype.trimToRange = function(rangeToTrimTo) {
		if (this.x < 0) {
			this.x = 0;
		} else if (this.x > rangeToTrimTo.x) {
			this.x = rangeToTrimTo.x;
		}
		if (this.y < 0) {
			this.y = 0;
		} else if (this.y > rangeToTrimTo.y) {
			this.y = rangeToTrimTo.y;
		}
		if (this.z < 0) {
			this.z = 0;
		} else if (this.z > rangeToTrimTo.z) {
			this.z = rangeToTrimTo.z;
		}
		return this;
	}
}

function DisplayHelper2D() {
	this.drawPositions = [];
	this.isSketchModeOn = false;
} {
	/*
	DisplayHelper2D.prototype.camera_Set = function(camera)
	{
		this.camera = camera;

		this.canvas = document.createElement("canvas");
		this.canvas.width = this.camera.viewSize.x;
		this.canvas.height = this.camera.viewSize.y;
		this.graphics = this.canvas.getContext("2d");

		document.body.appendChild(this.canvas);

		this.transformCamera = new Transform_Camera(this.camera);
	}
	*/
	DisplayHelper2D.prototype.clear = function() {
		this.graphics.strokeStyle = "LightGray";
		if (this.isSketchModeOn == true) {
			this.graphics.fillStyle = Color.Instances.White.systemColor;
		} else {
			this.graphics.fillStyle = Color.Instances.Black.systemColor;
		}
		this.graphics.fillRect(0, 0, this.viewSize.x, this.viewSize.y);
		this.graphics.strokeRect(0, 0, this.viewSize.x, this.viewSize.y);
	}
	DisplayHelper2D.prototype.drawFaceForCamera = function(faceToDraw, camera) {
		var cameraClipPlanes = camera.clipPlanes();
		faceToDraw = MeshHelper.clipFaceAgainstPlanes(faceToDraw, cameraClipPlanes);
		if (faceToDraw == null) {
			return;
		}
		var vertices = faceToDraw.vertices;
		var displacementFromCameraToVertex0 = vertices[0].pos.clone().subtract(camera.body.loc.pos);
		var faceNormalDotDisplacementFromCameraToVertex0 = faceToDraw.plane.normal.dotProduct(displacementFromCameraToVertex0)
		if (faceNormalDotDisplacementFromCameraToVertex0 >= 0) {
			return;
		}
		var transformCamera = new Transform_Camera(camera);
		var material = faceToDraw.material;
		this.graphics.fillStyle = material.colorFill.systemColor;
		this.graphics.beginPath();
		for (var i = 0; i < vertices.length; i++) {
			this.drawPos.overwriteWith(vertices[i].pos).transform(transformCamera);
			if (i == 0) {
				this.graphics.moveTo(this.drawPos.x, this.drawPos.y);
			} else {
				this.graphics.lineTo(this.drawPos.x, this.drawPos.y);
			}
		}
		this.graphics.closePath();
		this.graphics.stroke();
		if (this.isSketchModeOn == true) {
			this.graphics.fillStyle = "White";
			this.graphics.strokeStyle = "LightGray";
		} else {
			this.graphics.fill();
		}
		//this.graphics.stroke();
	}
	DisplayHelper2D.prototype.drawFacesForCamera = function(facesToDraw, camera) {
		for (var i = 0; i < facesToDraw.length; i++) {
			this.drawFaceForCamera(facesToDraw[i], camera);
		}
	}
	DisplayHelper2D.prototype.drawLine = function(startPos, endPos, color) {
		this.graphics.strokeStyle = color.systemColor;
		this.graphics.beginPath();
		this.graphics.moveTo(startPos.x, startPos.y);
		this.graphics.lineTo(endPos.x, endPos.y);
		this.graphics.stroke();
	}
	DisplayHelper2D.prototype.drawText = function(textToDraw, pos) {
		this.graphics.fillStyle = Color.Instances.White.systemColor;
		this.graphics.fillText(textToDraw, pos.x, pos.y);
	}
	DisplayHelper2D.prototype.drawWorld = function(world) {
		var facesToDraw = [];
		var cameraPos = world.camera.body.loc.pos;
		var spacePartitioningTreeRoot = world.spacePartitioningTreeForZonesActive.nodeRoot;
		spacePartitioningTreeRoot.addFacesBackToFrontForCameraPosToList(cameraPos, facesToDraw);
		var bodies = world.bodies;
		for (var b = 0; b < bodies.length; b++) {
			var body = bodies[b];
			var bodyDefn = body.defn;
			if (bodyDefn.isDrawable == true) {
				if (bodyDefn.isMovable == true) {
					// hack
					// Find the floor the mover is standing on,
					// and draw the mover immediately after that floor.
					var edgeForFootprint = new Edge(null, [
						body.loc.pos,
						body.loc.pos.clone().add(new Coords(0, 0, 100))
					]);
					for (var g = facesToDraw.length - 1; g >= 0; g--) {
						var face = facesToDraw[g];
						var collisionForFootprint = Collision.findCollisionOfEdgeAndFace(edgeForFootprint, face);
						var isBodyStandingOnFace = (collisionForFootprint != null);
						if (isBodyStandingOnFace == true) {
							var moverFaces = body.meshTransformed.faces;
							for (var f = 0; f < moverFaces.length; f++) {
								var moverFace = moverFaces[f];
								facesToDraw.splice(g + 1, 0, moverFace)
							}
							break;
						}
					}
				}
			}
		}
		this.clear();
		this.drawFacesForCamera(facesToDraw, world.camera);
		this.drawText(world.name, new Coords(0, 10));
		this.drawText(world.secondsElapsed(), new Coords(0, 20));
		this.drawText(world.bodies[0].loc.pos.clone().floor().toString(), new Coords(0, 30));
	}
	DisplayHelper2D.prototype.initialize = function(viewSize) {
		this.viewSize = viewSize;
		this.canvas = document.createElement("canvas");
		this.canvas.width = viewSize.x;
		this.canvas.height = viewSize.y;
		this.graphics = this.canvas.getContext("2d");
		document.body.appendChild(this.canvas);
		this.drawPos = new Coords(0, 0, 0);
		this.drawPosFrom = new Coords(0, 0, 0);
		this.drawPosTo = new Coords(0, 0, 0);
		this.faces = [];
		this.meshesToDrawSorted = [];
	}
}

function DisplayHelper3D() {
	// do nothing
} {
	DisplayHelper3D.prototype.drawMesh = function(mesh) {
		var webGLContext = this.webGLContext;
		var gl = webGLContext.gl;
		var shaderProgram = webGLContext.shaderProgram;
		var vertexPositionsAsFloatArray = [];
		var vertexColorsAsFloatArray = [];
		var vertexNormalsAsFloatArray = [];
		var vertexTextureUVsAsFloatArray = [];
		var numberOfTrianglesSoFar = 0;
		var faces = mesh.faces;
		var textureUVsForFaceVertices = mesh.textureUVsForFaceVertices;
		for (var f = 0; f < faces.length; f++) {
			var face = faces[f];
			var faceMaterial = face.material;
			var faceNormal = face.plane.normal;
			var vertexNormalsForFaceVertices = mesh.vertexNormalsForFaceVertices;
			var vertexIndicesForTriangles = [
				[0, 1, 2]
			];
			var numberOfVerticesInFace = face.vertices.length;
			if (numberOfVerticesInFace == 4) {
				vertexIndicesForTriangles.push([0, 2, 3]);
			}
			for (var t = 0; t < vertexIndicesForTriangles.length; t++) {
				var vertexIndicesForTriangle = vertexIndicesForTriangles[t];
				for (var vi = 0; vi < vertexIndicesForTriangle.length; vi++) {
					var vertexIndex = vertexIndicesForTriangle[vi];
					var vertex = face.vertices[vertexIndex];
					var vertexPosition = vertex.pos;
					vertexPositionsAsFloatArray = vertexPositionsAsFloatArray.concat(vertexPosition.dimensions());
					var vertexColor = faceMaterial.colorFill;
					vertexColorsAsFloatArray = vertexColorsAsFloatArray.concat(vertexColor.componentsRGBA);
					var vertexNormal = (vertexNormalsForFaceVertices == null ? faceNormal : vertexNormalsForFaceVertices[f][vertexIndex]);
					vertexNormalsAsFloatArray = vertexNormalsAsFloatArray.concat(vertexNormal.dimensions());
					var vertexTextureUV = (textureUVsForFaceVertices == null ? new Coords(-1, -1) : textureUVsForFaceVertices[f] == null ? new Coords(-1, -1) : textureUVsForFaceVertices[f][vertexIndex]);
					vertexTextureUVsAsFloatArray = vertexTextureUVsAsFloatArray.concat(
						[
							vertexTextureUV.x,
							vertexTextureUV.y
						]);
				}
			}
			numberOfTrianglesSoFar += vertexIndicesForTriangles.length;
		}
		var colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColorsAsFloatArray), gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, Color.NumberOfComponentsRGBA, gl.FLOAT, false, 0, 0);
		var normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormalsAsFloatArray), gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, Coords.NumberOfDimensions, gl.FLOAT, false, 0, 0);
		var positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionsAsFloatArray), gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, Coords.NumberOfDimensions, gl.FLOAT, false, 0, 0);
		var texture = mesh.material.texture;
		if (texture != null) {
			var textureName = texture.name;
			var textureRegistered = this.texturesRegistered[textureName];
			if (textureRegistered == null) {
				texture.initializeForWebGLContext(this.webGLContext);
				this.texturesRegistered[textureName] = texture;
			}
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture.systemTexture);
		}
		gl.uniform1i(shaderProgram.samplerUniform, 0);
		var textureBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureUVsAsFloatArray), gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderProgram.vertexTextureUVAttribute, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, numberOfTrianglesSoFar * Mesh.VerticesInATriangle);
	}
	DisplayHelper3D.prototype.drawWorld = function(world) {
		var webGLContext = this.webGLContext;
		var gl = webGLContext.gl;
		var shaderProgram = webGLContext.shaderProgram;
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		var camera = world.camera;
		var cameraLoc = camera.body.loc;
		gl.uniform1f(shaderProgram.lightAmbientIntensity, this.lighting.ambientIntensity);
		gl.uniform3fv(shaderProgram.lightDirection, WebGLContext.coordsToWebGLArray(this.lighting.direction));
		gl.uniform1f(shaderProgram.lightDirectionalIntensity, this.lighting.directionalIntensity);
		var cameraMatrix = this.matrixCamera.overwriteWithTranslate(this.tempCoords.overwriteWith(cameraLoc.pos).multiplyScalar(-1)).multiply(this.matrixOrient.overwriteWithOrientationCamera(cameraLoc.orientation)).multiply(this.matrixPerspective.overwriteWithPerspectiveForCamera(camera));
		/*
		gl.uniformMatrix4fv
		(
			shaderProgram.cameraMatrix, 
			false, // transpose
			cameraMatrix.toWebGLArray()
		);
		*/
		var bodies = world.bodies;
		for (var b = 0; b < bodies.length; b++) {
			var body = bodies[b];
			var bodyLoc = body.loc;
			var bodyOrientation = bodyLoc.orientation;
			var normalMatrix;
			normalMatrix = this.matrixOrient;
			if (body.defn.mesh != null && body.defn.mesh.name == "MeshBiped") {
				normalMatrix = this.matrixOrient.overwriteWithOrientationMover(bodyOrientation);
			} else {
				normalMatrix = this.matrixOrient.overwriteWithOrientationBody(bodyOrientation);
			}
			var bodyMatrix = this.matrixBody.overwriteWith(normalMatrix).multiply(this.matrixOrient.overwriteWithOrientationBody(bodyOrientation));
			/*
			// Commenting this multiply out
			// allows us to use body.meshTransformed,
			// rather than body.defn.mesh.
			.multiply
			(
				this.matrixTranslate.overwriteWithTranslate
				(
					bodyLoc.pos
				)
			);
			*/
			gl.uniformMatrix4fv(shaderProgram.normalMatrix, false, // transpose
				normalMatrix.multiplyScalar(1).toWebGLArray());
			gl.uniformMatrix4fv(shaderProgram.bodyMatrix, false, // transpose
				bodyMatrix.toWebGLArray());
			var bodyDefn = body.defn;
			var bodyMesh =
				//bodyDefn.mesh;
				body.meshTransformed;
			if (bodyMesh != null) {
				this.drawMesh(bodyMesh);
			}
		}
		gl.uniformMatrix4fv(shaderProgram.cameraMatrix, false, // transpose
			cameraMatrix.toWebGLArray());
	}
	DisplayHelper3D.prototype.initialize = function(viewSize) {
		this.viewSize = viewSize;
		var canvas = document.createElement("canvas");
		canvas.width = viewSize.x;
		canvas.height = viewSize.y;
		document.body.appendChild(canvas);
		this.webGLContext = new WebGLContext(canvas);
		this.texturesRegistered = [];
		// hack
		this.lighting = new Lighting(.5, // ambientIntensity
			new Coords(-1, -1, -1), // direction
			.3 // directionalIntensity
		);
		// temps
		this.matrixBody = Matrix.buildZeroes();
		this.matrixCamera = Matrix.buildZeroes();
		this.matrixOrient = Matrix.buildZeroes();
		this.matrixPerspective = Matrix.buildZeroes();
		this.matrixTranslate = Matrix.buildZeroes();
		this.tempCoords = new Coords(0, 0, 0);
		this.tempMatrix0 = Matrix.buildZeroes();
		this.tempMatrix1 = Matrix.buildZeroes();
	}
}

function Edge(face, vertices) {
	this.face = face;
	this.vertices = vertices;
	this.displacement = new Coords(0, 0, 0);
	this.direction = new Coords(0, 0, 0);
	this.transverse = new Coords(0, 0, 0);
	this.recalculateDerivedValues();
} {
	Edge.prototype.recalculateDerivedValues = function() {
		this.displacement.overwriteWith(this.vertices[1]).subtract(this.vertices[0]);
		this.length = this.displacement.magnitude();
		this.direction.overwriteWith(this.displacement).divideScalar(this.length);
		if (this.face != null) {
			this.transverse.overwriteWith(this.direction).crossProduct(this.face.plane.normal);
		}
	}
}

function Face(vertices, material) {
	this.vertices = vertices;
	this.material = material;
	this.bounds = new Bounds(new Coords(0, 0, 0), new Coords(0, 0, 0));
	this.plane = new Plane(new Coords(), new Coords()).fromPoints(this.vertices[0].pos, this.vertices[1].pos, this.vertices[2].pos);
	this.edges = [];
	for (var i = 0; i < this.vertices.length; i++) {
		var iNext = i + 1;
		if (iNext >= this.vertices.length) {
			iNext = 0;
		}
		var vertexPos = this.vertices[i].pos;
		var vertexPosNext = this.vertices[iNext].pos;
		var edge = new Edge(this, [vertexPos, vertexPosNext]);
		this.edges.push(edge);
	}
	var vertexPositions = Vertex.addPositionsOfManyToList(this.vertices, []);
	this.bounds.setFromPositions(vertexPositions);
} {
	Face.prototype.recalculateDerivedValues = function() {
		this.plane.fromPoints(this.vertices[0].pos, this.vertices[1].pos, this.vertices[2].pos);
		for (var i = 0; i < this.edges.length; i++) {
			var edge = this.edges[i];
			edge.recalculateDerivedValues();
		}
		var vertexPositions = Vertex.addPositionsOfManyToList(this.vertices, []);
		this.bounds.setFromPositions(vertexPositions);
	}
}

function Globals() {
	this.displayHelpers = [
		//new DisplayHelper2D(),
		new DisplayHelper3D(),
	]
	this.inputHelper = new InputHelper();
} {
	Globals.Instance = new Globals();
	Globals.prototype.initialize = function(millisecondsPerTimerTick, viewSizeInPixels, inputToActionBindings, universe) {
		for (var i = 0; i < this.displayHelpers.length; i++) {
			var displayHelper = this.displayHelpers[i];
			displayHelper.initialize(viewSizeInPixels);
		}
		this.inputHelper.initialize(inputToActionBindings);
		this.universe = universe;
		this.universe.initialize();
		this.timerTicksSoFar = 0;
		setInterval("Globals.Instance.handleTimerTick()", millisecondsPerTimerTick);
	}
	Globals.prototype.handleTimerTick = function() {
		this.timerTicksSoFar++;
		this.universe.update();
	}
}

function Image() {} {
	// static methods
	Image.buildFromFilePath = function(name, filePath) {
		var returnValue = new Image();
		returnValue.name = name;
		returnValue.filePath = filePath;
		returnValue.systemImage = document.createElement("img");
		returnValue.systemImage.src = filePath;
		return returnValue;
	}
	Image.buildFromSystemImage = function(name, systemImage, sizeInPixels) {
		var returnValue = new Image();
		returnValue.name = name;
		returnValue.htmlElementID = systemImage.id;
		returnValue.filePath = systemImage.src;
		returnValue.sizeInPixels = sizeInPixels;
		returnValue.systemImage = systemImage;
		return returnValue;
	}
	// instance methods
	Image.prototype.clone = function() {
		var returnValue = new Image();
		returnValue.name = name;
		returnValue.filePath = this.filePath;
		returnValue.sizeInPixels = this.sizeInPixels.clone();
		returnValue.systemImage = this.systemImage;
		return returnValue;
	}
	Image.prototype.cloneAsVisual = function() {
		return this.clone();
	}
	Image.prototype.drawToGraphicsAtPos = function(graphics, drawPos) {
		graphics.drawImage(this.systemImage, drawPos.x, drawPos.y);
	}
	Image.prototype.updateForVenue = function() {
		// do nothing
	}
}

function ImageHelper() {} {
	// static methods
	ImageHelper.buildImageFromStrings = function(name, stringsForPixels) {
		return ImageHelper.buildImageFromStringsScaled(name, Coords.Instances.Ones, stringsForPixels);
	}
	ImageHelper.buildImagesFromStringArrays = function(name, stringArraysForImagePixels) {
		var returnValue = [];
		for (var i = 0; i < stringArraysForImagePixels.length; i++) {
			var stringsForImagePixels = stringArraysForImagePixels[i];
			var image = ImageHelper.buildImageFromStrings(name + i, stringsForImagePixels);
			returnValue.push(image);
		}
		return returnValue;
	}
	ImageHelper.buildImageFromStringsScaled = function(name, scaleFactor, stringsForPixels) {
		var sizeInPixels = new Coords(stringsForPixels[0].length, stringsForPixels.length);
		var htmlElementLibrary = Globals.Instance.htmlElementLibrary;
		var canvas = document.createElement("canvas");
		canvas.width = sizeInPixels.x * scaleFactor.x;
		canvas.height = sizeInPixels.y * scaleFactor.y;
		var graphics = canvas.getContext("2d");
		var pixelPos = new Coords(0, 0);
		var colorForPixel;
		for (var y = 0; y < sizeInPixels.y; y++) {
			var stringForPixelRow = stringsForPixels[y];
			pixelPos.y = y * scaleFactor.y;
			for (var x = 0; x < sizeInPixels.x; x++) {
				var charForPixel = stringForPixelRow[x];
				pixelPos.x = x * scaleFactor.x;
				colorForPixel = Color.Instances._All[charForPixel];
				graphics.fillStyle = colorForPixel.systemColor;
				graphics.fillRect(pixelPos.x, pixelPos.y, scaleFactor.x, scaleFactor.y);
			}
		}
		var imageFromCanvasURL = canvas.toDataURL("image/png");
		var htmlImageFromCanvas = document.createElement("img");
		htmlImageFromCanvas.width = canvas.width;
		htmlImageFromCanvas.height = canvas.height;
		htmlImageFromCanvas.src = imageFromCanvasURL;
		var returnValue = Image.buildFromSystemImage(name, htmlImageFromCanvas, sizeInPixels);
		return returnValue;
	}
	ImageHelper.sliceImageIntoTiles = function(imageToSlice, sizeInTiles) {
		var returnImages = [];
		var systemImageToSlice = imageToSlice.systemImage;
		var imageToSliceSize = imageToSlice.sizeInPixels;
		var tileSize = imageToSliceSize.clone().divide(sizeInTiles);
		var tilePos = new Coords(0, 0);
		var sourcePos = new Coords(0, 0);
		for (var y = 0; y < sizeInTiles.y; y++) {
			tilePos.y = y;
			var returnImageRow = [];
			for (var x = 0; x < sizeInTiles.x; x++) {
				tilePos.x = x;
				var canvas = document.createElement("canvas");
				canvas.id = "tile_" + x + "_" + y;
				canvas.width = tileSize.x;
				canvas.height = tileSize.y;
				canvas.style.position = "absolute";
				var graphics = canvas.getContext("2d");
				sourcePos.overwriteWith(tilePos).multiply(tileSize);
				graphics.drawImage(systemImageToSlice, sourcePos.x, sourcePos.y, // source pos
					tileSize.x, tileSize.y, // source size
					0, 0, // destination pos
					tileSize.x, tileSize.y // destination size
				);
				// browser dependent?
				var imageFromCanvasURL = canvas.toDataURL("image/png");
				var htmlImageFromCanvas = document.createElement("img");
				htmlImageFromCanvas.width = canvas.width;
				htmlImageFromCanvas.height = canvas.height;
				htmlImageFromCanvas.style.position = "absolute";
				htmlImageFromCanvas.src = imageFromCanvasURL;
				imageFromCanvas = Image.buildFromSystemImage(imageToSlice.name + tilePos.toString(), htmlImageFromCanvas, tileSize);
				returnImageRow.push(imageFromCanvas);
			}
			returnImages.push(returnImageRow);
		}
		return returnImages;
	}
}

function Input(name, keyCode) {
	this.name = name;
	this.keyCode = keyCode;
} {
	function Input_Instances() {
		if (Input.Instances == null) {
			Input.Instances = this;
		}
		this.A = new Input("A", 65);
		this.C = new Input("C", 67);
		this.D = new Input("D", 68);
		this.E = new Input("E", 69);
		this.F = new Input("F", 70);
		this.R = new Input("R", 82);
		this.S = new Input("S", 83);
		this.W = new Input("W", 87);
		this.X = new Input("X", 88);
		this.Z = new Input("Z", 90);
		this.Space = new Input("Space", 32);
		this.MouseButton = new Input("MouseButton", "MouseButton");
		this._All = [
			this.A,
			this.C,
			this.D,
			this.E,
			this.F,
			this.R,
			this.S,
			this.W,
			this.X,
			this.Z,
			this.Space,
			this.MouseButton,
		];
		return Input.Instances;
	}
	Input.Instances = new Input_Instances();
}

function InputToActionBinding(input, action) {
	this.input = input;
	this.action = action;
}

function InputHelper() {
	this.mousePos = new Coords(0, 0, 0);
	this.keyCodeToBindingLookup = [];
	this.actionsForInputsPressed = [];
} {
	// instance methods
	InputHelper.prototype.initialize = function(bindings) {
		this.bindings = bindings;
		this.actionsForInputsPressed.length = 0;
		this.keyCodeToBindingLookup.length = 0;
		for (var i = 0; i < this.bindings.length; i++) {
			var binding = this.bindings[i];
			this.keyCodeToBindingLookup[binding.input.keyCode] = binding;
		}
		document.body.onkeydown = this.handleKeyDownEvent.bind(this);
		document.body.onkeyup = this.handleKeyUpEvent.bind(this);
		document.body.onmousedown = this.handleMouseDownEvent.bind(this);
		document.body.onmouseup = this.handleMouseUpEvent.bind(this);
		document.body.onmousemove = this.handleMouseMoveEvent.bind(this);
	}
	InputHelper.prototype.updateForTimerTick = function() {
		for (var i = 0; i < this.actionsForInputsPressed.length; i++) {
			var action = this.actionsForInputsPressed[i];
			action.ticksSoFar++;
		}
	}
	// events
	InputHelper.prototype.handleKeyDownEvent = function(event) {
		var keyCodePressed = event.keyCode;
		var binding = this.keyCodeToBindingLookup[keyCodePressed];
		if (binding != null) {
			var action = binding.action;
			var actionName = action.name;
			if (this.actionsForInputsPressed[actionName] == null) {
				action.ticksSoFar = 0;
				this.actionsForInputsPressed.push(action);
				this.actionsForInputsPressed[actionName] = action;
			}
		}
	}
	InputHelper.prototype.handleKeyUpEvent = function(event) {
		var keyCodeReleased = event.keyCode;
		var binding = this.keyCodeToBindingLookup[keyCodeReleased];
		if (binding != null) {
			var action = binding.action;
			var actionName = action.name;
			if (this.actionsForInputsPressed[actionName] != null) {
				this.actionsForInputsPressed.splice(this.actionsForInputsPressed.indexOf(action), 1);
				delete this.actionsForInputsPressed[actionName];
			}
		}
	}
	InputHelper.prototype.handleMouseDownEvent = function(event) {
		var boundingClientRectangle = event.target.getBoundingClientRect();
		this.mousePos.overwriteWithDimensions(event.x - boundingClientRectangle.left, event.y - boundingClientRectangle.top, 0);
		var keyCodePressed = Input.Instances.MouseButton.keyCode;
		var binding = this.keyCodeToBindingLookup[keyCodePressed];
		if (binding != null) {
			var action = binding.action;
			var actionName = action.name;
			if (this.actionsForInputsPressed[actionName] == null) {
				action.ticksSoFar = 0;
				this.actionsForInputsPressed.push(action);
				this.actionsForInputsPressed[actionName] = action;
			}
		}
	}
	InputHelper.prototype.handleMouseUpEvent = function(event) {
		var boundingClientRectangle = event.target.getBoundingClientRect();
		this.mousePos.overwriteWithDimensions(event.x - boundingClientRectangle.left, event.y - boundingClientRectangle.top, 0);
		var keyCodeReleased = Input.Instances.MouseButton.keyCode;
		var binding = this.keyCodeToBindingLookup[keyCodeReleased];
		if (binding != null) {
			var action = binding.action;
			var actionName = action.name;
			if (this.actionsForInputsPressed[actionName] != null) {
				this.actionsForInputsPressed.splice(this.actionsForInputsPressed.indexOf(action), 1);
				delete this.actionsForInputsPressed[actionName];
			}
		}
	}
	InputHelper.prototype.handleMouseMoveEvent = function(event) {
		var boundingClientRectangle = event.target.getBoundingClientRect();
		this.mousePos.overwriteWithDimensions(event.x - boundingClientRectangle.left, event.y - boundingClientRectangle.top, 0);
	}
}

function Lighting(ambientIntensity, direction, directionalIntensity) {
	this.ambientIntensity = ambientIntensity;
	this.direction = direction.clone().normalize();
	this.directionalIntensity = directionalIntensity;
}

function Location(zoneName, pos, orientation) {
	this.zoneName = zoneName;
	this.pos = pos;
	this.orientation = orientation;
	this.vel = new Coords(0, 0, 0);
	this.accel = new Coords(0, 0, 0);
} {
	Location.prototype.clone = function(other) {
		return new Location(this.zoneName, this.pos.clone(), this.orientation.clone());
	}
	Location.prototype.overwriteWith = function(other) {
		this.zoneName = other.zoneName;
		this.pos.overwriteWith(other.pos);
		this.orientation.overwriteWith(other.orientation);
	}
}

function Material(name, colorStroke, colorFill, texture) {
	this.name = name;
	this.colorStroke = colorStroke;
	this.colorFill = colorFill;
	this.texture = texture;
} {
	function Material_Instances() {
		if (Material.Instances == null) {
			Material.Instances = this;
		}
		this.Default = new Material("MaterialDefault", Color.Instances.Blue, // colorStroke
			Color.Instances.Yellow, // colorFill
			null // texture
		);
	}
	Material.Instances = new Material_Instances();
}

function Maze(cellSizeInPixels, sizeInCells, neighborOffsets) {
	this.cellSizeInPixels = cellSizeInPixels;
	this.sizeInCells = sizeInCells;
	this.neighborOffsets = neighborOffsets;
	this.sizeInPixels = this.sizeInCells.clone().multiply(this.cellSizeInPixels);
	var numberOfNeighbors = this.neighborOffsets.length;
	var numberOfCellsInMaze = this.sizeInCells.productOfDimensions();
	this.cells = [];
	for (var i = 0; i < numberOfCellsInMaze; i++) {
		var cell = new MazeCell(numberOfNeighbors);
		this.cells.push(cell);
	}
	this.sizeInCellsMinusOnes = sizeInCells.clone().subtract(new Coords(1, 1, 1));
} {
	// static methods
	Maze.prototype.generateRandom = function() {
		var cells = this.cells;
		var sizeInCells = this.sizeInCells;
		var neighborOffsets = this.neighborOffsets;
		var numberOfCellsInMaze = this.sizeInCells.productOfDimensions();
		var numberOfNeighbors = neighborOffsets.length;
		var cellPos = new Coords(0, 0, 0);
		var cellPosNeighbor = new Coords(0, 0, 0);
		var numberOfCellsInLargestNetworkSoFar = 0;
		while (numberOfCellsInLargestNetworkSoFar < numberOfCellsInMaze) {
			for (var y = 0; y < sizeInCells.y; y++) {
				cellPos.y = y;
				for (var x = 0; x < sizeInCells.x; x++) {
					cellPos.x = x;
					var numberOfCellsInNetworkMerged = this.generateRandom_ConnectCellToRandomNeighbor(cellPos, cellPosNeighbor);
					if (numberOfCellsInNetworkMerged > numberOfCellsInLargestNetworkSoFar) {
						numberOfCellsInLargestNetworkSoFar = numberOfCellsInNetworkMerged
					}
				}
			}
		}
		return this;
	}
	Maze.prototype.generateRandom_ConnectCellToRandomNeighbor = function(cellPos, cellPosNeighbor) {
		var cells = this.cells;
		var sizeInCells = this.sizeInCells;
		var sizeInCellsMinusOnes = this.sizeInCellsMinusOnes;
		var neighborOffsets = this.neighborOffsets;
		var numberOfNeighbors = neighborOffsets.length;
		var numberOfCellsInNetworkMerged = 0;
		var cellCurrent = this.cellAtPos(cellPos);
		var randomizer = Randomizer.Instance;
		var neighborOffsetIndex = Math.floor(randomizer.next() * numberOfNeighbors);
		var neighborOffset = neighborOffsets[neighborOffsetIndex];
		cellPosNeighbor.overwriteWith(cellPos).add(neighborOffset);
		if (cellPosNeighbor.isWithinRangeMax(sizeInCellsMinusOnes) == true) {
			if (cellCurrent.connectedToNeighbors[neighborOffsetIndex] == false) {
				var cellNeighbor = this.cellAtPos(cellPosNeighbor);
				if (cellCurrent.network.networkID != cellNeighbor.network.networkID) {
					cellCurrent.connectedToNeighbors[neighborOffsetIndex] = true;
					var neighborOffsetIndexReversed = Math.floor(neighborOffsetIndex / 2) * 2 + (1 - (neighborOffsetIndex % 2));
					cellNeighbor.connectedToNeighbors[neighborOffsetIndexReversed] = true;
					var networkMerged = MazeCellNetwork.mergeNetworks(cellCurrent.network, cellNeighbor.network);
					numberOfCellsInNetworkMerged = networkMerged.cells.length;
				}
			}
		}
		return numberOfCellsInNetworkMerged;
	}
	// instance methods
	Maze.prototype.cellAtPos = function(cellPos) {
		var cellIndex = this.indexOfCellAtPos(cellPos);
		return this.cells[cellIndex];
	}
	Maze.prototype.convertToZones = function(materialNormal, cellPosOfStart, materialStart, cellPosOfGoal, materialGoal) {
		var returnValues = [];
		var sizeInPixels = this.sizeInPixels;
		var cellSizeInPixels = this.cellSizeInPixels;
		var cellSizeInPixelsHalf = cellSizeInPixels.clone().divideScalar(2);
		var roomSizeInPixelsHalf = cellSizeInPixels.clone().divideScalar(8);
		var hallWidthMultiplier = .5;
		var cellPos = new Coords(0, 0, 0);
		var numberOfNeighbors = this.neighborOffsets.length;
		for (var y = 0; y < this.sizeInCells.y; y++) {
			cellPos.y = y;
			for (var x = 0; x < this.sizeInCells.x; x++) {
				cellPos.x = x;
				var cellPosInPixels = cellPos.clone().multiply(cellSizeInPixels);
				var cellCurrent = this.cellAtPos(cellPos);
				var zoneForNodeName = cellPos.toString();
				var faceIndicesToRemove = [4];
				var namesOfZonesAdjacent = [];
				var connectedToNeighbors = cellCurrent.connectedToNeighbors;
				for (var n = 0; n < numberOfNeighbors; n++) {
					if (cellCurrent.connectedToNeighbors[n] == true) {
						faceIndicesToRemove.push(n);
						var neighborOffset = this.neighborOffsets[n];
						var neighborPosInCells = cellPos.clone().add(neighborOffset);
						namesOfZonesAdjacent.push(neighborPosInCells.toString());
						var zoneForConnectorName;
						if (n % 2 == 1) {
							zoneForConnectorName = cellPos.toString() + neighborPosInCells.toString();
						} else {
							zoneForConnectorName = neighborPosInCells.toString() + cellPos.toString();
						}
						namesOfZonesAdjacent.push(zoneForConnectorName);
					}
				}
				var mesh = MeshHelper.buildRoom(zoneForNodeName, materialNormal, roomSizeInPixelsHalf.x, roomSizeInPixelsHalf.y, roomSizeInPixelsHalf.z, this.neighborOffsets, cellCurrent.connectedToNeighbors);
				var zoneForNode = new Zone(zoneForNodeName, cellPosInPixels, //pos, 
					namesOfZonesAdjacent,
					// meshes
					[
						mesh
					]);
				returnValues.push(zoneForNode);
				returnValues[zoneForNode.name] = zoneForNode;
				for (var n = 1; n < numberOfNeighbors; n += 2) {
					var isConnectedToNeighbor = cellCurrent.connectedToNeighbors[n];
					if (isConnectedToNeighbor == true) {
						var neighborOffset = this.neighborOffsets[n];
						var neighborPosInCells = cellPos.clone().add(neighborOffset);
						var zoneForConnectorName = cellPos.toString() + neighborPosInCells.toString();
						var connectorPosInPixels = cellPosInPixels.clone().add(new Coords(cellSizeInPixelsHalf.x, cellSizeInPixelsHalf.y, 0).multiply(neighborOffset));
						var connectorSizeInPixels = new Coords(
							(n == 1 ? (cellSizeInPixelsHalf.x - roomSizeInPixelsHalf.x) : (roomSizeInPixelsHalf.x * hallWidthMultiplier)), (n == 3 ? (cellSizeInPixelsHalf.y - roomSizeInPixelsHalf.y) : (roomSizeInPixelsHalf.y * hallWidthMultiplier)), roomSizeInPixelsHalf.z);
						var mesh = MeshHelper.buildRoom(zoneForConnectorName, materialNormal, connectorSizeInPixels.x, connectorSizeInPixels.y, connectorSizeInPixels.z, this.neighborOffsets,
							// connectedToNeighbors
							[
								(n == 1), (n == 1), (n != 1), (n != 1)
							]);
						var zoneForConnector = new Zone(zoneForConnectorName, connectorPosInPixels,
							// namesOfZonesAdjacent
							[
								zoneForNodeName,
								neighborPosInCells.toString(),
							],
							// meshes
							[
								mesh
							]);
						returnValues.push(zoneForConnector);
						returnValues[zoneForConnector.name] = zoneForConnector;
					}
				} // end for each neighbor
			}
		}
		var zoneStart = returnValues[cellPosOfStart.toString()];
		var meshStart = zoneStart.body.meshTransformed;
		meshStart.material = materialStart;
		meshStart.recalculateDerivedValues();
		var zoneGoal = returnValues[cellPosOfGoal.toString()];
		var meshGoal = zoneGoal.body.meshTransformed;
		meshGoal.material = materialGoal;
		meshGoal.recalculateDerivedValues();
		return returnValues;
	}
	Maze.prototype.indexOfCellAtPos = function(cellPos) {
		var cellIndex = cellPos.y * this.sizeInCells.x + cellPos.x;
		return cellIndex;
	}
}

function MazeCell(numberOfNeighbors) {
	this.connectedToNeighbors = [];
	for (var n = 0; n < numberOfNeighbors; n++) {
		this.connectedToNeighbors.push(false);
	}
	this.network = new MazeCellNetwork();
	this.network.cells.push(this);
}

function MazeCellNetwork() {
	this.networkID = MazeCellNetwork.MaxIDSoFar;
	MazeCellNetwork.MaxIDSoFar++;
	this.cells = [];
} {
	MazeCellNetwork.MaxIDSoFar = 0;
	MazeCellNetwork.mergeNetworks = function(network0, network1) {
		var networkMerged = new MazeCellNetwork();
		var networksToMerge = [network0, network1];
		var numberOfNetworks = networksToMerge.length;
		for (var n = 0; n < numberOfNetworks; n++) {
			var network = networksToMerge[n];
			for (var c = 0; c < network.cells.length; c++) {
				var cell = network.cells[c];
				cell.network = networkMerged;
				networkMerged.cells.push(cell);
			}
		}
		return networkMerged;
	}
}

function Matrix(values) {
	this.values = values;
} {
	// static methods
	Matrix.buildZeroes = function() {
		var returnValue = new Matrix([
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
		]);
		return returnValue;
	}
	// instance methods
	Matrix.prototype.clone = function() {
		var valuesCloned = [];
		for (var i = 0; i < this.values.length; i++) {
			valuesCloned[i] = this.values[i];
		}
		var returnValue = new Matrix(valuesCloned);
		return returnValue;
	}
	Matrix.prototype.divideScalar = function(scalar) {
		for (var i = 0; i < this.values.length; i++) {
			this.values[i] /= scalar;
		}
		return this;
	}
	Matrix.prototype.multiply = function(other) {
		// hack
		// Instantiates a new matrix.
		var valuesMultiplied = [];
		for (var y = 0; y < 4; y++) {
			for (var x = 0; x < 4; x++) {
				var valueSoFar = 0;
				for (var i = 0; i < 4; i++) {
					// This appears backwards,
					// but the other way doesn't work?
					valueSoFar += other.values[y * 4 + i] * this.values[i * 4 + x];
				}
				valuesMultiplied[y * 4 + x] = valueSoFar;
			}
		}
		this.overwriteWithValues(valuesMultiplied);
		return this;
	}
	Matrix.prototype.multiplyScalar = function(scalar) {
		for (var i = 0; i < this.values.length; i++) {
			this.values[i] *= scalar;
		}
		return this;
	}
	Matrix.prototype.overwriteWith = function(other) {
		for (var i = 0; i < this.values.length; i++) {
			this.values[i] = other.values[i];
		}
		return this;
	}
	Matrix.prototype.overwriteWithOrientationBody = function(orientation) {
		var forward = orientation.forward.clone().multiplyScalar(1);
		var right = orientation.right.clone().multiplyScalar(1);
		var down = orientation.down.clone().multiplyScalar(1);
		/*
		this.overwriteWithValues
		([
			right.x, 	down.x, 	forward.x, 	0,
			right.y, 	down.y,		forward.y, 	0,
			right.z, 	down.z, 	forward.z, 	0,
			0, 		0, 		0, 		1,
		]);
		*/
		this.overwriteWithValues([
			forward.x, right.x, down.x, 0,
			forward.y, right.y, down.y, 0,
			forward.z, right.z, down.z, 0,
			0, 0, 0, 1,
		]);
		return this;
	}
	Matrix.prototype.overwriteWithOrientationCamera = function(orientation) {
		var forward = orientation.forward.clone().multiplyScalar(1);
		var right = orientation.right.clone().multiplyScalar(1);
		var down = orientation.down.clone().multiplyScalar(1);
		this.overwriteWithValues([
			right.x, right.y, right.z, 0,
			0 - down.x, 0 - down.y, 0 - down.z, 0,
			0 - forward.x, 0 - forward.y, 0 - forward.z, 0,
			0, 0, 0, 1,
		]);
		return this;
	}
	Matrix.prototype.overwriteWithOrientationMover = function(orientation) {
		// hack
		// This function shouldn't even exist!
		// It should be possible to use the -Body function for this,
		// but for some reason movers end up in the wrong place.
		// It looks like I needed to transpose the array
		// for some mathematical reason...
		var forward = orientation.forward.clone();
		var right = orientation.right.clone();
		var down = orientation.down.clone();
		this.overwriteWithValues([
			forward.x, forward.y, forward.z, 0,
			right.x, right.y, right.z, 0,
			down.x, down.y, down.z, 0,
			0, 0, 0, 1,
		]);
		return this;
	}
	Matrix.prototype.overwriteWithPerspectiveForCamera = function(camera) {
		var viewSize = camera.viewSize;
		var clipDistanceNear = .001; //camera.focalLength;
		var clipDistanceFar = camera.viewSize.z;
		var scaleFactorY = 1.0 / Math.tan(viewSize.y / 2);
		var scaleFactorX = scaleFactorY * viewSize.y / viewSize.x;
		// hack
		// Trying to make the 3D perspective match the 2D one,
		// because I don't actually understand this math.
		// Must be adjusted if viewSize changes.
		var scaleFactorMultiplier = .7;
		scaleFactorX *= scaleFactorMultiplier;
		scaleFactorY *= scaleFactorMultiplier;
		var clipRange = clipDistanceNear - clipDistanceFar;
		var distanceFromFocusToClipPlaneFar = clipDistanceFar + clipDistanceNear;
		var clipDistanceSumOverDifference = distanceFromFocusToClipPlaneFar / clipRange;
		var clipDistanceProductOverDifference = (clipDistanceFar * clipDistanceNear) / clipRange;
		this.overwriteWithValues([
			scaleFactorX, 0, 0, 0,
			0, scaleFactorY, 0, 0,
			0, 0, clipDistanceSumOverDifference, 2 * clipDistanceProductOverDifference,
			0, 0, -1, 0,
		]);
		return this;
	}
	Matrix.prototype.overwriteWithTranslate = function(displacement) {
		this.overwriteWithValues([
			1, 0, 0, displacement.x,
			0, 1, 0, displacement.y,
			0, 0, 1, displacement.z,
			0, 0, 0, 1,
		]);
		return this;
	}
	Matrix.prototype.overwriteWithValues = function(otherValues) {
		for (var i = 0; i < this.values.length; i++) {
			this.values[i] = otherValues[i];
		}
		return this;
	}
	Matrix.prototype.toWebGLArray = function() {
		var returnValues = [];
		for (var x = 0; x < 4; x++) {
			for (var y = 0; y < 4; y++) {
				returnValues.push(this.values[(y * 4 + x)]);
			}
		}
		var returnValues = new Float32Array(returnValues);
		return returnValues;
	}
}

function MediaLoader(objectContainingCallback, callbackToRunWhenLoadingComplete, items) {
	this.objectContainingCallback = objectContainingCallback;
	this.callbackToRunWhenLoadingComplete = callbackToRunWhenLoadingComplete;
	this.items = items;
	this.items.addLookups("name");
} {
	MediaLoader.prototype.itemLoaded = function(event) {
		this.numberOfItemsLoadedSoFar++;
		if (this.numberOfItemsLoadedSoFar >= this.items.length) {
			this.callbackToRunWhenLoadingComplete.call(this.objectContainingCallback, this);
		}
	}
	MediaLoader.prototype.loadItemsAll = function() {
		this.numberOfItemsLoadedSoFar = 0;
		for (var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			item.load(this, item);
		}
	}
}

function MediaLoaderItem(name, itemType, path) {
	this.name = name;
	this.itemType = itemType;
	this.path = path;
} {
	MediaLoaderItem.prototype.load = function(mediaLoader) {
		this.itemType.load(mediaLoader, this);
	}
}

function MediaLoaderItemType(name, load) {
	this.name = name;
	this.load = load;
} {
	function MediaLoaderItemType_Instances() {
		this.Image = new MediaLoaderItemType("Image", function(mediaLoader, mediaLoaderItem) {
			var htmlElement = document.createElement("img");
			mediaLoaderItem.htmlElement = htmlElement;
			htmlElement.mediaLoaderItem = mediaLoaderItem;
			htmlElement.onload = mediaLoader.itemLoaded.bind(mediaLoader);
			htmlElement.src = mediaLoaderItem.path;
		});
	}
	MediaLoaderItemType.Instances = new MediaLoaderItemType_Instances();
}

function Mesh(name, material, vertices, vertexIndicesForFaces, textureUVsForFaceVertices, vertexGroups) {
	this.name = name;
	this.material = material;
	this.vertices = vertices;
	this.vertexIndicesForFaces = vertexIndicesForFaces;
	this.textureUVsForFaceVertices = textureUVsForFaceVertices;
	this.vertexGroups = vertexGroups;
	this.faces = [];
	var numberOfFaces = this.vertexIndicesForFaces.length;
	for (var f = 0; f < numberOfFaces; f++) {
		var vertexIndicesForFace = this.vertexIndicesForFaces[f];
		var numberOfVerticesInFace = vertexIndicesForFace.length;
		var verticesForFace = [];
		for (var vi = 0; vi < numberOfVerticesInFace; vi++) {
			var vertexIndex = vertexIndicesForFace[vi];
			var vertex = this.vertices[vertexIndex];
			verticesForFace.push(vertex);
		}
		var face = new Face(verticesForFace, this.material);
		this.faces.push(face);
	}
	this.bounds = new Bounds(new Coords(0, 0, 0), new Coords(0, 0, 0));
	var vertexPositions = Vertex.addPositionsOfManyToList(this.vertices, []);
	this.bounds.setFromPositions(vertexPositions);
} {
	// constants
	Mesh.VerticesInATriangle = 3;
	Mesh.prototype.clone = function() {
		return new Mesh(this.name, this.material, Cloneable.cloneMany(this.vertices), this.vertexIndicesForFaces, Cloneable.cloneMany(this.textureUVsForFaceVertices), Cloneable.cloneMany(this.vertexGroups));
	}
	Mesh.prototype.overwriteWith = function(other) {
		for (var i = 0; i < this.vertices.length; i++) {
			this.vertices[i].overwriteWith(other.vertices[i]);
		}
		return this;
	};
	Mesh.prototype.recalculateDerivedValues = function() {
		var numberOfFaces = this.faces.length;
		for (var f = 0; f < numberOfFaces; f++) {
			var face = this.faces[f];
			face.material = this.material;
			face.recalculateDerivedValues();
		}
		var vertexPositions = Vertex.addPositionsOfManyToList(this.vertices, []);
		this.bounds.setFromPositions(vertexPositions);
		return this;
	}
	Mesh.prototype.transform = function(transformToApply) {
		var vertexPositions = Vertex.addPositionsOfManyToList(this.vertices, []);
		Transform.applyTransformToCoordsMany(transformToApply, vertexPositions);
		this.recalculateDerivedValues();
		return this;
	}
	Mesh.prototype.transformTextureUVs = function(transformToApply) {
		Transform.applyTransformToCoordsArrays(transformToApply, this.textureUVsForFaceVertices);
		return this;
	}
}

function MeshHelper() {
	// do nothing
} {
	MeshHelper.buildBiped = function(material, heightInPixels) {
		var heightOver2 = heightInPixels / 2;
		var heightOver3 = heightInPixels / 3;
		var heightOver4 = heightInPixels / 4;
		var heightOver6 = heightInPixels / 6;
		var heightOver8 = heightInPixels / 8;
		var heightOver9 = heightInPixels / 9;
		var heightOver12 = heightInPixels / 12;
		var heightOver18 = heightInPixels / 18;
		var heightOver24 = heightInPixels / 24;
		var heightOver36 = heightInPixels / 36;
		var meshesForBodyParts = [
			MeshHelper.buildBox("Pelvis", material, new Coords(heightOver12, heightOver24, heightOver24), new Coords(0, 0, -heightOver2)),
			MeshHelper.buildBox("Spine.1", material, new Coords(heightOver12, heightOver24, heightOver6), new Coords(0, 0, 0 - heightOver2 - heightOver4)),
			MeshHelper.buildBox("Head", material, new Coords(heightOver18, heightOver18, heightOver18), new Coords(0, heightOver36, 0 - heightInPixels)),
			MeshHelper.buildBox("Thigh.L", material, new Coords(heightOver36, heightOver36, heightOver8), new Coords(heightOver18, 0, 0 - heightOver2 + heightOver12)),
			MeshHelper.buildBox("Shin.L", material, new Coords(heightOver36, heightOver36, heightOver8), new Coords(heightOver18, 0, 0 - heightOver6)),
			MeshHelper.buildBox("Foot.L", material, new Coords(heightOver36, heightOver12, heightOver36), new Coords(heightOver18, heightOver12, 0 - heightOver36)),
			MeshHelper.buildBox("Bicep.L", material, new Coords(heightOver36, heightOver36, heightOver12), new Coords(heightOver6, 0, 0 - heightOver2 - heightOver3)),
			MeshHelper.buildBox("Forearm.L", material, new Coords(heightOver36, heightOver36, heightOver12), new Coords(heightOver6, 0, 0 - heightOver2 - heightOver4 + heightOver8)),
			MeshHelper.buildBox("Thigh.R", material, new Coords(heightOver36, heightOver36, heightOver8), new Coords(0 - heightOver18, 0, 0 - heightOver2 + heightOver12)),
			MeshHelper.buildBox("Shin.R", material, new Coords(heightOver36, heightOver36, heightOver8), new Coords(0 - heightOver18, 0, 0 - heightOver6)),
			MeshHelper.buildBox("Foot.R", material, new Coords(heightOver36, heightOver12, heightOver36), new Coords(0 - heightOver18, heightOver12, 0 - heightOver36)),
			MeshHelper.buildBox("Bicep.R", material, new Coords(heightOver36, heightOver36, heightOver12), new Coords(0 - heightOver6, 0, 0 - heightOver2 - heightOver3)),
			MeshHelper.buildBox("Forearm.R", material, new Coords(heightOver36, heightOver36, heightOver12), new Coords(0 - heightOver6, 0, 0 - heightOver2 - heightOver4 + heightOver8)),
		];
		var returnValue = MeshHelper.mergeMeshes("MeshBiped", meshesForBodyParts);
		/*
		returnValue.transform(new Transform_DimensionsSwap([0, 1]))
		returnValue.transform(new Transform_Scale(new Coords(-1, -1, 1)));
		*/
		returnValue.transform(new Transform_Orient(new Orientation(new Coords(0, 1, 0), new Coords(0, 0, 1))));
		// fix
		//MeshHelper.meshVerticesMergeIfWithinDistance(returnValue, 3);
		return returnValue;
	}
	MeshHelper.buildBox = function(name, material, size, pos) {
		var returnMesh = MeshHelper.buildUnitCube(name, material);
		returnMesh.transform(new Transform_Scale(size));
		returnMesh.transform(new Transform_Translate(new Coords(0, 0, 0) //size.z / 2)
		));
		returnMesh.transform(new Transform_Translate(pos));
		return returnMesh;
	}
	MeshHelper.buildRoom = function(name, material, x, y, z, neighborOffsets, connectedToNeighbors) {
		var wallNormals = neighborOffsets;
		if (connectedToNeighbors == null) {
			connectedToNeighbors = [false, false, false, false];
		}
		var meshesForRoom = [];
		var down = new Coords(0, 0, 1);
		for (var i = 0; i < wallNormals.length; i++) {
			var wallNormal = wallNormals[i];
			var scaleFactors = new Coords(x, y, z);
			var meshName = "[wall]";
			var meshForWall;
			if (connectedToNeighbors[i] == true) {
				meshForWall = MeshHelper.buildRoom_WallWithDoorway(meshName, material);
			} else {
				meshForWall = MeshHelper.buildRoom_Wall(meshName, material);
			}
			wallOrientation = new Orientation(wallNormal, down);
			meshForWall.transform(new Transform_Orient(wallOrientation)).transform(new Transform_Translate(wallNormal));
			// hack
			if (wallNormal.y != 0) {
				meshForWall.transform(new Transform_Scale(new Coords(-1, 1, 1)));
			}
			meshesForRoom.push(meshForWall);
		}
		var meshForFloor = MeshHelper.buildRoom_Floor(material);
		meshesForRoom.push(meshForFloor);
		//var meshForCeiling = MeshHelper.buildRoom_Ceiling(material);
		//meshesForRoom.push(meshForCeiling);
		for (var i = 0; i < meshesForRoom.length; i++) {
			var mesh = meshesForRoom[i];
			var face = mesh.faces[0];
			var faceNormal = face.plane.normal;
			var faceOrientation;
			if (faceNormal.z == 0) {
				faceOrientation = new Orientation(faceNormal, down);
			} else {
				faceOrientation = new Orientation(faceNormal, new Coords(1, 0, 0));
			}
			var faceTangent = faceOrientation.right;
			var faceDown = faceOrientation.down;
			mesh.transformTextureUVs(new Transform_Scale(new Coords(faceTangent.dotProduct(scaleFactors), faceDown.dotProduct(scaleFactors)).absolute()))
		}
		var returnMesh = MeshHelper.mergeMeshes(name, meshesForRoom);
		returnMesh.transform(new Transform_Scale(scaleFactors)).transform(new Transform_Translate(new Coords(0, 0, -z))).recalculateDerivedValues();
		return returnMesh;
	}
	MeshHelper.buildUnitRing = function(name, material, numberOfVertices) {
		var vertices = [];
		var vertexIndicesForFace = [];
		for (var i = 0; i < numberOfVertices; i++) {
			var vertexAngle = Constants.RadiansPerCircle * i / numberOfVertices;
			var vertexPolar = new Polar(vertexAngle, 0, 1);
			var vertexPos = vertexPolar.toCoords();
			var vertex = new Vertex(vertexPos);
			vertices.push(vertex);
			vertexIndicesForFace.splice(0, 0, i);
		}
		var returnMesh = new Mesh(name, material, vertices, [vertexIndicesForFace]);
		return returnMesh;
	}
	MeshHelper.buildRoom_Ceiling = function(material) {
		var returnMesh = new MeshHelper.buildUnitSquare("Ceiling", material).transform(new Transform_Scale(new Coords(1, 1, -1))).transform(new Transform_Translate(new Coords(0, 0, -1))).transformTextureUVs(new Transform_Scale(new Coords(1, 1, 1).multiplyScalar(.2)));
		return returnMesh;
	}
	MeshHelper.buildRoom_Floor = function(material) {
		var returnMesh = new MeshHelper.buildUnitSquare("Floor", material).transform(new Transform_Translate(new Coords(0, 0, 1))).transformTextureUVs(new Transform_Scale(new Coords(1, 1, 1).multiplyScalar(.2)));
		return returnMesh;
	}
	MeshHelper.buildRoom_Wall = function(name, material) {
		var returnMesh = new Mesh(name, material,
			// vertices
			Vertex.buildManyFromPositions([
				// wall
				new Coords(0, 1, -1),
				new Coords(0, -1, -1),
				new Coords(0, -1, 1),
				new Coords(0, 1, 1),
			]),
			// vertexIndicesForFaces
			[
				//[ 3, 2, 1, 0 ],
				[0, 1, 2, 3],
			],
			// textureUVs
			[
				[
					new Coords(.2, 0),
					new Coords(0, 0),
					new Coords(0, .2),
					new Coords(.2, .2),
				],
			]);
		return returnMesh;
	}
	MeshHelper.buildRoom_WallWithDoorway = function(name, material) {
		var returnMesh = new Mesh(name, material,
			// vertices
			Vertex.buildManyFromPositions([
				// top
				new Coords(0, -.25, -1),
				new Coords(0, .25, -1),
				new Coords(0, .25, -.5),
				new Coords(0, -.25, -.5),
				// left
				new Coords(0, -1, -1),
				new Coords(0, -.25, -1),
				new Coords(0, -.25, 1),
				new Coords(0, -1, 1),
				// right
				new Coords(0, 1, -1),
				new Coords(0, 1, 1),
				new Coords(0, .25, 1),
				new Coords(0, .25, -1),
			]),
			// vertexIndicesForFaces
			[
				// top, left, right
				[3, 2, 1, 0],
				[7, 6, 5, 4],
				[11, 10, 9, 8],
			],
			// textureUVs
			[
				// top
				[
					new Coords(0, .05),
					new Coords(.05, .05),
					new Coords(.05, 0),
					new Coords(0, 0),
				],
				// left
				[
					new Coords(0, .2),
					new Coords(.05, .2),
					new Coords(.05, 0),
					new Coords(0, 0),
				],
				// right
				[
					new Coords(0, 0),
					new Coords(0, .2),
					new Coords(.05, .2),
					new Coords(.05, 0),
				],
			]);
		return returnMesh;
	}
	MeshHelper.buildUnitCube = function(name, material) {
		var returnMesh = new Mesh(name, material,
			// vertices
			Vertex.buildManyFromPositions([
				// top
				new Coords(-1, -1, -1),
				new Coords(1, -1, -1),
				new Coords(1, 1, -1),
				new Coords(-1, 1, -1),
				// bottom
				new Coords(-1, -1, 1),
				new Coords(1, -1, 1),
				new Coords(1, 1, 1),
				new Coords(-1, 1, 1),
			]),
			// vertexIndicesForFaces
			[
				[7, 4, 0, 3], // west
				[5, 6, 2, 1], // east
				[4, 5, 1, 0], // north
				[6, 7, 3, 2], // south
				[0, 1, 2, 3], // top
				[5, 4, 7, 6], // bottom
			]);
		return returnMesh;
	}
	MeshHelper.buildUnitSquare = function(name, material) {
		var returnMesh = new Mesh(name, material,
			// vertices
			Vertex.buildManyFromPositions([
				// back 
				new Coords(1, -1, 0),
				new Coords(1, 1, 0),
				new Coords(-1, 1, 0),
				new Coords(-1, -1, 0),
			]),
			// vertexIndicesForFaces
			[
				[3, 2, 1, 0]
				//[0, 1, 2, 3]
			],
			// textureUVs
			[
				[
					new Coords(0, 0),
					new Coords(1, 0),
					new Coords(1, 1),
					new Coords(0, 1),
				]
			]);
		return returnMesh;
	}
	MeshHelper.clipFaceAgainstPlanes = function(faceToClip, planesToClipAgainst) {
		var returnValue = faceToClip;
		for (var p = 0; p < planesToClipAgainst.length; p++) {
			faceToClip = MeshHelper.splitFaceByPlaneFrontAndBack(faceToClip, planesToClipAgainst[p])[0];
			if (faceToClip == null) {
				break;
			}
		}
		return faceToClip;
	}
	MeshHelper.mergeMeshes = function(name, meshesToMerge) {
		var verticesMerged = [];
		var vertexIndicesForFacesMerged = [];
		var textureUVsForFacesMerged = [];
		var vertexGroups = [];
		var numberOfVerticesSoFar = 0;
		for (var m = 0; m < meshesToMerge.length; m++) {
			var meshToMerge = meshesToMerge[m];
			verticesMerged = verticesMerged.concat(meshToMerge.vertices
				//Cloneable.cloneMany(meshToMerge.vertices)
			);
			for (var f = 0; f < meshToMerge.vertexIndicesForFaces.length; f++) {
				var vertexIndicesForFace = meshToMerge.vertexIndicesForFaces[f];
				var vertexIndicesForFaceShifted = [];
				for (var vi = 0; vi < vertexIndicesForFace.length; vi++) {
					var vertexIndex = vertexIndicesForFace[vi];
					var vertexIndexShifted = vertexIndex + numberOfVerticesSoFar;
					vertexIndicesForFaceShifted.push(vertexIndexShifted);
				}
				vertexIndicesForFacesMerged.push(vertexIndicesForFaceShifted);
			}
			var textureUVsForFaces = meshToMerge.textureUVsForFaceVertices;
			if (textureUVsForFaces != null) {
				for (var f = 0; f < textureUVsForFaces.length; f++) {
					var textureUVsForFace = textureUVsForFaces[f];
					var textureUVsForFaceCloned = textureUVsForFace.clone();
					textureUVsForFacesMerged.push(textureUVsForFaceCloned);
				}
			}
			var vertexIndicesInVertexGroup = [];
			for (var v = 0; v < meshToMerge.vertices.length; v++) {
				vertexIndicesInVertexGroup.push(numberOfVerticesSoFar + v);
			}
			var vertexGroup = new VertexGroup(meshToMerge.name, vertexIndicesInVertexGroup);
			vertexGroups.push(vertexGroup);
			numberOfVerticesSoFar += meshToMerge.vertices.length;
		}
		var returnMesh = new Mesh(name, meshesToMerge[0].material, verticesMerged, vertexIndicesForFacesMerged, textureUVsForFacesMerged, vertexGroups);
		return returnMesh;
	}
	MeshHelper.meshVerticesMergeIfWithinDistance = function(mesh, distanceToMergeWithin) {
		var vertices = mesh.vertices;
		var verticesDuplicated = [];
		var vertexIndexDuplicateToOriginalLookup = [];
		var displacementBetweenVertices = new Coords(0, 0, 0);
		for (var i = 0; i < vertices.length; i++) {
			var vertexToConsider = vertices[i];
			for (j = 0; j < i; j++) {
				var vertexAlreadyConsidered = vertices[j];
				displacementBetweenVertices.overwriteWith(vertexToConsider).subtract(vertexAlreadyConsidered);
				var distanceBetweenVertices = displacementBetweenVertices.magnitude();
				if (distanceBetweenVertices <= distanceToMergeWithin) {
					// if the original is not itself a duplicate
					if (vertexIndexDuplicateToOriginalLookup[j] == null) {
						verticesDuplicated.push(vertexToConsider);
						vertexIndexDuplicateToOriginalLookup[i] = j;
						break;
					}
				}
			}
		}
		var verticesMinusDuplicates = vertices.slice();
		for (var i = 0; i < verticesDuplicated.length; i++) {
			var vertexDuplicated = verticesDuplicated[i];
			verticesMinusDuplicates.splice(verticesMinusDuplicates.indexOf(vertexDuplicated), 1);
		}
		for (var f = 0; f < mesh.vertexIndicesForFaces.length; f++) {
			var vertexIndices = mesh.vertexIndicesForFaces[f];
			for (var vi = 0; vi < vertexIndices.length; vi++) {
				var vertexIndexToUpdate = vertexIndices[vi];
				var vertexToUpdate = vertices[vertexIndexToUpdate];
				var isVertexDuplicated = (verticesDuplicated.indexOf(vertexToUpdate) >= 0);
				if (isVertexDuplicated == true) {
					var vertexIndexOriginal = vertexIndexDuplicateToOriginalLookup[vertexIndexToUpdate];
					vertexToUpdate = vertices[vertexIndexOriginal];
				}
				var vertexIndexUpdated = verticesMinusDuplicates.indexOf(vertexToUpdate);
				vertexIndices[vi] = vertexIndexUpdated;
			}
		}
		for (var g = 0; g < mesh.vertexGroups.length; g++) {
			var vertexGroup = mesh.vertexGroups[g];
			var vertexIndices = vertexGroup.vertexIndices;
			for (var vi = 0; vi < vertexIndices.length; vi++) {
				var vertexIndexToUpdate = vertexIndices[vi];
				var vertexToUpdate = vertices[vertexIndexToUpdate];
				var isVertexDuplicated = (verticesDuplicated.indexOf(vertexToUpdate) >= 0);
				if (isVertexDuplicated == true) {
					var vertexIndexOriginal = vertexIndexDuplicateToOriginalLookup[vertexIndexToUpdate];
					vertexToUpdate = vertices[vertexIndexOriginal];
				}
				var vertexIndexUpdated = verticesMinusDuplicates.indexOf(vertexToUpdate);
				vertexIndices[vi] = vertexIndexUpdated;
			}
		}
		mesh.vertices = verticesMinusDuplicates;
	}
	MeshHelper.removeFacesWithIndicesFromMesh = function(indicesOfFacesToRemove, meshToRemoveFrom) {
		var indicesOfFacesToRemoveSorted = indicesOfFacesToRemove.sortIntoOtherUsingCompareFunction(
			[], // arraySorted, 
			function(index0, index1) {
				return index0 - index1;
			})
		for (var i = 0; i < indicesOfFacesToRemoveSorted.length; i++) {
			var indexOfFaceToRemove = indicesOfFacesToRemoveSorted[i];
			meshToRemoveFrom.vertexIndicesForFaces.splice(indexOfFaceToRemove, 1);
			meshToRemoveFrom.faces.splice(indexOfFaceToRemove, 1);
		}
		meshToRemoveFrom.recalculateDerivedValues();
		return meshToRemoveFrom;
	}
	MeshHelper.splitFaceByPlaneFrontAndBack = function(faceToDivide, planeToDivideOn) {
		var returnValues = [];
		var verticesInFacesDivided = [
			[], // front
			[], // back
		];
		var distanceOfVertexAbovePlane = 0;
		for (var v = 0; v < faceToDivide.vertices.length; v++) {
			var vertexPosition = faceToDivide.vertices[v].pos;
			var distanceOfVertexAbovePlane = Collision.findDistanceOfPositionAbovePlane(vertexPosition, planeToDivideOn);
			if (distanceOfVertexAbovePlane != 0) {
				break;
			}
		}
		var facesDividedIndex = (distanceOfVertexAbovePlane > 0 ? 0 : 1);
		var verticesInFaceDivided = verticesInFacesDivided[facesDividedIndex];
		var doAnyEdgesCollideWithPlaneSoFar = false;
		for (var e = 0; e < faceToDivide.edges.length; e++) {
			var edge = faceToDivide.edges[e];
			var vertexPosition0 = edge.vertices[0];
			verticesInFaceDivided.push(new Vertex(vertexPosition0));
			var distanceOfVertex0AbovePlane = Collision.findDistanceOfPositionAbovePlane(vertexPosition0, planeToDivideOn);
			var distanceOfVertex1AbovePlane = Collision.findDistanceOfPositionAbovePlane(edge.vertices[1], planeToDivideOn);
			if (distanceOfVertex0AbovePlane * distanceOfVertex1AbovePlane < 0) {
				var collision = Collision.findCollisionOfEdgeAndPlane(edge, planeToDivideOn);
				if (collision != null) {
					doAnyEdgesCollideWithPlaneSoFar = true;
					verticesInFaceDivided.push(new Vertex(collision.pos));
					facesDividedIndex = 1 - facesDividedIndex;
					verticesInFaceDivided = verticesInFacesDivided[facesDividedIndex];
					verticesInFaceDivided.push(new Vertex(collision.pos));
				}
			}
		}
		if (doAnyEdgesCollideWithPlaneSoFar == true) {
			for (var i = 0; i < verticesInFacesDivided.length; i++) {
				var verticesInFace = verticesInFacesDivided[i];
				if (verticesInFace.length > 2) {
					var faceDivided = new Face(verticesInFace, faceToDivide.material)
					returnValues.push(faceDivided);
				}
			}
		} else {
			returnValues[facesDividedIndex] = faceToDivide;
		}
		return returnValues;
	}
}

function Orientation(forward, down, right) {
	this.forward = forward.clone().normalize();
	this.down = down.clone().normalize();
	if (right == null) {
		this.right = this.down.clone().crossProduct(this.forward);
	} else {
		this.right = right.clone();
	}
	this.right.normalize();
	this.axes = [this.forward, this.right, this.down];
	this.orthogonalizeAxes();
} {
	// static methods
	Orientation.buildDefault = function() {
		return new Orientation(new Coords(1, 0, 0), new Coords(0, 0, 1));
	}
	// instance methods
	Orientation.prototype.equals = function(other, epsilon) {
		var returnValue = true;
		for (var i = 0; i < this.axes.length; i++) {
			var axisFromThis = this.axes[i];
			var axisFromOther = other.axes[i];
			if (axisFromThis.equals(axisFromOther, epsilon) == false) {
				returnValue = false;
				break;
			}
		}
		return returnValue;
	}
	Orientation.prototype.toString = function() {
		return this.axes.toString();
	}
	// cloneable
	Orientation.prototype.clone = function() {
		return new Orientation(this.forward, this.down, this.right);
	}
	Orientation.prototype.overwriteWith = function(other) {
		this.forward.overwriteWith(other.forward);
		this.right.overwriteWith(other.right);
		this.down.overwriteWith(other.down);
	}
	Orientation.prototype.orthogonalizeAxes = function() {
		// This either causes or exposes a grave problem
		// somewhere in the Orientation math.
		this.down.overwriteWith(this.forward).crossProduct(this.right);
		//this.down.overwriteWith(this.right).crossProduct(this.forward);
		this.down.normalize();
		return this;
	}
	// transformable
	Orientation.prototype.transform = function(transformToApply) {
		for (var i = 0; i < this.axes.length; i++) {
			var axis = this.axes[i];
			transformToApply.applyToCoords(axis);
		}
	}
}

function Plane(normal, distanceFromOrigin) {
	this.normal = normal;
	this.distanceFromOrigin = distanceFromOrigin;
} {
	// static variables
	Plane.DisplacementFromPoint0To1 = new Coords(0, 0, 0);
	// instance methods
	Plane.prototype.equals = function(other) {
		var returnValue = (this.normal.equals(other.normal) && this.distanceFromOrigin == other.distanceFromOrigin);
		return returnValue;
	}
	Plane.prototype.fromPoints = function(point0, point1, point2) {
		var displacementFromPoint0To1 = Plane.DisplacementFromPoint0To1;
		displacementFromPoint0To1.overwriteWith(point1).subtract(point0);
		var displacementFromPoint0To2 = point2.clone().subtract(point0);
		this.normal.overwriteWith(displacementFromPoint0To1).crossProduct(displacementFromPoint0To2).normalize();
		this.distanceFromOrigin = this.normal.dotProduct(point0);
		return this;
	}
}

function Polar(azimuth, elevation, radius) {
	// values in radians
	this.azimuth = azimuth;
	this.elevation = elevation;
	this.radius = radius;
} {
	// static methods
	Polar.fromCoords = function(coordsToConvert) {
		var azimuth = Math.atan2(coordsToConvert.y, coordsToConvert.x);
		if (azimuth < 0) {
			azimuth += Constants.Tau;
		}
		var radius = coordsToConvert.magnitude();
		var elevation = Math.asin(coordsToConvert.z / radius);
		var returnValue = new Polar(azimuth, elevation, radius);
		return returnValue;
	}
	// instance methods
	Polar.prototype.randomize = function() {
		this.azimuth = randomizer.next() * Constants.Tau;
		this.elevation = randomizer.next() * Constants.Tau;
		this.radius = randomzier.next();
	}
	Polar.prototype.toCoords = function() {
		var cosineOfElevation = Math.cos(this.elevation);
		var returnValue = new Coords(Math.cos(this.azimuth) * cosineOfElevation, Math.sin(this.azimuth) * cosineOfElevation, Math.sin(this.elevation)).multiplyScalar(this.radius);
		return returnValue;
	}
}

function Quaternion(w, x, y, z) {
	this.w = w;
	this.x = x;
	this.y = y;
	this.z = z;
} {
	// static methods
	Quaternion.fromAxisAndCyclesToRotate = function(axisToRotateAround, cyclesToRotate) {
		var radiansToRotateHalf = cyclesToRotate * Math.PI;
		var sineOfRadiansToRotateHalf = Math.sin(radiansToRotateHalf);
		var w = Math.cos(radiansToRotateHalf);
		var x = axisToRotateAround.x * sineOfRadiansToRotateHalf;
		var y = axisToRotateAround.y * sineOfRadiansToRotateHalf;
		var z = axisToRotateAround.z * sineOfRadiansToRotateHalf;
		var returnValue = new Quaternion(w, x, y, z).normalize();
		return returnValue;
	}
	// instance methods
	Quaternion.prototype.applyToCoordsAsRotation = function(coordsToRotate) {
		var coordsToRotateAsQuaternion = new Quaternion(0, coordsToRotate.x, coordsToRotate.y, coordsToRotate.z);
		var result = this.clone().multiply(coordsToRotateAsQuaternion).multiply(this.clone().invert());
		coordsToRotate.overwriteWith(result);
		return coordsToRotate;
	}
	Quaternion.prototype.clone = function() {
		return new Quaternion(this.w, this.x, this.y, this.z);
	}
	Quaternion.prototype.divide = function(divisor) {
		this.w /= divisor;
		this.x /= divisor;
		this.y /= divisor;
		this.z /= divisor;
		return this;
	}
	Quaternion.prototype.invert = function() {
		var magnitude = this.magnitude();
		this.divide(magnitude * magnitude);
		this.x *= -1;
		this.y *= -1;
		this.z *= -1;
		return this;
	}
	Quaternion.prototype.multiply = function(other) {
		return this.overwriteWithWXYZ(this.w * other.w - this.x * other.x - this.y * other.y - this.z * other.z, this.w * other.x + this.x * other.w + this.y * other.z - this.z * other.y, this.w * other.y - this.x * other.z + this.y * other.w + this.z * other.x, this.w * other.z + this.x * other.y - this.y * other.x + this.z * other.w);
	}
	Quaternion.prototype.magnitude = function() {
		return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
	}
	Quaternion.prototype.normalize = function() {
		return this.divide(this.magnitude());
	}
	Quaternion.prototype.overwriteWith = function(other) {
		this.overwriteWithWXYZ(other.w, other.x, other.y, other.z);
		return this;
	}
	Quaternion.prototype.overwriteWithWXYZ = function(w, x, y, z) {
		this.w = w;
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}
}

function Randomizer(seed) {
	if (seed == null) {
		seed = Math.random();
	}
	this.current = seed;
} {
	// Pass a value to Randomizer() to test with a known maze.
	Randomizer.Instance = new Randomizer();
	Randomizer.prototype.next = function() {
		// hack - Not very random.
		this.current = Math.sin(this.current) * 10000;
		this.current -= Math.floor(this.current);
		return this.current;
	}
}

function Skeleton(name, boneRoot) {
	this.name = name;
	this.boneRoot = boneRoot;
	this.bonesAll = [];
	this.bonesAll = TreeHelper.addNodeAndAllDescendantsToList(this.boneRoot, []);
	this.bonesAll.addLookups("name");
} {
	Skeleton.prototype.equals = function(other) {
		var returnValue = true;
		for (var i = 0; i < this.bonesAll.length; i++) {
			var boneFromThis = this.bonesAll[i];
			var boneFromOther = other.bonesAll[i];
			if (boneFromThis.orientation.equals(boneFromOther.orientation) == false) {
				returnValue = false;
				break;
			}
		}
		return returnValue;
	}
	// cloneable
	Skeleton.prototype.clone = function(other) {
		return new Skeleton(this.name, this.boneRoot.clone());
	}
	Skeleton.prototype.overwriteWith = function(other) {
		for (var i = 0; i < this.bonesAll.length; i++) {
			this.bonesAll[i].overwriteWith(other.bonesAll[i]);
		}
	}
	// transformable
	Skeleton.prototype.transform = function(transformToApply) {
		for (var i = 0; i < this.bonesAll.length; i++) {
			var bone = this.bonesAll[i];
			bone.transform(transformToApply);
		}
	}
}

function SkeletonHelper() {
	// static class
} {
	SkeletonHelper.biped = function(heightInPixels) {
		var heightOver2 = heightInPixels / 2;
		var heightOfSpine = heightInPixels / 2.4;
		var heightOver3 = heightInPixels / 3;
		var heightOver4 = heightInPixels / 4;
		var heightOver6 = heightInPixels / 6;
		var heightOver8 = heightInPixels / 8;
		var heightOver9 = heightInPixels / 9;
		var heightOver12 = heightInPixels / 12;
		var heightOver18 = heightInPixels / 18;
		var legRight = new Bone("Hip.R", heightOver12, new Orientation(new Coords(-1, 0, 0), new Coords(0, 0, 1)), [
			new Bone("Thigh.R", heightOver4, new Orientation(new Coords(0, 0, 1), new Coords(-1, 0, 0)), [
				new Bone("Shin.R", heightOver4, new Orientation(new Coords(0, 0, 1), new Coords(1, 0, 0)), [
					new Bone("Foot.R", heightOver8, new Orientation(new Coords(0, 1, 0), new Coords(1, 0, 0)), [])
				]),
			])
		]);
		var legLeft = new Bone("Hip.L", heightOver12, new Orientation(new Coords(1, 0, 0), new Coords(0, 0, 1)), [
			new Bone("Thigh.L", heightOver4, new Orientation(new Coords(0, 0, 1), new Coords(-1, 0, 0)), [
				new Bone("Shin.L", heightOver4, new Orientation(new Coords(0, 0, 1), new Coords(1, 0, 0)), [
					new Bone("Foot.L", heightOver8, new Orientation(new Coords(0, 1, 0), new Coords(1, 0, 0)), [])
				]),
			])
		]);
		var upperBody = new Bone("Spine.1", heightOfSpine, new Orientation(new Coords(0, 0, -1), new Coords(0, -1, 0)), [
			new Bone("Neck", heightOver12, new Orientation(new Coords(0, 0, -1), new Coords(0, 1, 0)), [
				new Bone("Head.Back", heightOver18, new Orientation(new Coords(0, 0, -1), new Coords(0, 1, 0)), [
					new Bone("Head.Front", heightOver9, new Orientation(new Coords(0, 1, 0), new Coords(0, 0, 1)), []),
				])
			]),
			new Bone("Shoulder.L", heightOver6, new Orientation(new Coords(1, 0, 0), new Coords(0, 0, 1)), [
				new Bone("Bicep.L", heightOver6, new Orientation(new Coords(0, -.1, 1), new Coords(-1, 0, 0)), [
					new Bone("Forearm.L", heightOver6, new Orientation(new Coords(0, .1, 1), new Coords(-1, 0, 0)), [])
				])
			]),
			new Bone("Shoulder.R", heightOver6, new Orientation(new Coords(-1, 0, 0), new Coords(0, 0, 1)), [
				new Bone("Bicep.R", heightOver6, new Orientation(new Coords(0, -.1, 1), new Coords(-1, 0, 0)), [
					new Bone("Forearm.R", heightOver6, new Orientation(new Coords(0, .1, 1), new Coords(-1, 0, 0)), [])
				])
			])
		]); // end spine
		var skeletonBiped = new Skeleton("Skeleton0", new Bone("Root", heightOver2, new Orientation(new Coords(0, 0, -1), new Coords(0, 1, 0)), [
				legRight,
				legLeft,
				upperBody,
			], false // isVisible - hide the root bone
		));
		/*
		skeletonBiped.transform(new Transform_DimensionsSwap([0, 1]));
		skeletonBiped.transform(new Transform_Scale(new Coords(-1, -1, 1)));
		*/
		skeletonBiped.transform(new Transform_Orient(new Orientation(new Coords(0, 1, 0), new Coords(0, 0, 1))));
		return skeletonBiped;
	}
	SkeletonHelper.bipedAnimationDefnGroup = function() {
		var returnValue = new AnimationDefnGroup("Biped", [
			SkeletonHelper.bipedAnimationDefnDoSomething(),
			SkeletonHelper.bipedAnimationDefnJump(),
			SkeletonHelper.bipedAnimationDefnWalk(),
		]);
		return returnValue;
	}
	SkeletonHelper.bipedAnimationDefnDoSomething = function() {
		var returnValue = new AnimationDefn("DoSomething", [
			new AnimationKeyframe(0, [
				new TransformBonePose("Forearm.L", [.25]),
				new TransformBonePose("Bicep.L", [.25, 0, -.25]),
				new TransformBonePose("Forearm.R", [.25]),
				new TransformBonePose("Bicep.R", [.25, 0, .25]),
			]),
			new AnimationKeyframe(1, [
				new TransformBonePose("Forearm.L", [.25]),
				new TransformBonePose("Bicep.L", [.25, 0, .25]),
				new TransformBonePose("Forearm.R", [.25]),
				new TransformBonePose("Bicep.R", [.25, 0, -.25]),
			]),
		]);
		return returnValue;
	}
	SkeletonHelper.bipedAnimationDefnJump = function() {
		var returnValue = new AnimationDefn("Jump", [
			new AnimationKeyframe(0, [
				new TransformBonePose("Thigh.L", [.25]),
				new TransformBonePose("Shin.L", [.25]),
				new TransformBonePose("Thigh.R", [.25]),
				new TransformBonePose("Shin.R", [.25]),
			]),
			new AnimationKeyframe(1, [
				new TransformBonePose("Thigh.L", [.25]),
				new TransformBonePose("Shin.L", [.25]),
				new TransformBonePose("Thigh.R", [.25]),
				new TransformBonePose("Shin.R", [.25]),
			]),
		]);
		return returnValue;
	}
	SkeletonHelper.bipedAnimationDefnWalk = function() {
		var animationDefnBipedWalk = new AnimationDefn("Walk", [
			new AnimationKeyframe(0, [
				new TransformBonePose("Bicep.L", [-.1]),
				new TransformBonePose("Forearm.L", [0]),
				new TransformBonePose("Thigh.L", [.1]),
				new TransformBonePose("Shin.L", [0]),
				new TransformBonePose("Bicep.R", [.1]),
				new TransformBonePose("Forearm.R", [.1]),
				new TransformBonePose("Thigh.R", [-.05]),
				new TransformBonePose("Shin.R", [0]),
			]),
			new AnimationKeyframe(5, [
				new TransformBonePose("Thigh.L", [.1]),
				new TransformBonePose("Shin.L", [.1]),
				new TransformBonePose("Thigh.R", [-.1]),
				new TransformBonePose("Shin.R", [0]),
			]),
			new AnimationKeyframe(10, [
				new TransformBonePose("Thigh.L", [0]),
				new TransformBonePose("Shin.L", [0]),
				new TransformBonePose("Thigh.R", [0]),
				new TransformBonePose("Shin.R", [.1]),
			]),
			new AnimationKeyframe(15, [
				new TransformBonePose("Bicep.L", [.1]),
				new TransformBonePose("Forearm.L", [.1]),
				new TransformBonePose("Thigh.L", [-.05]),
				new TransformBonePose("Bicep.R", [-.1]),
				new TransformBonePose("Forearm.R", [0]),
				new TransformBonePose("Thigh.R", [.1]),
				new TransformBonePose("Shin.R", [0]),
			]),
			new AnimationKeyframe(20, [
				new TransformBonePose("Thigh.L", [-.1]),
				new TransformBonePose("Shin.L", [0]),
				new TransformBonePose("Thigh.R", [.1]),
				new TransformBonePose("Shin.R", [.1]),
			]),
			new AnimationKeyframe(25, [
				new TransformBonePose("Thigh.L", [0]),
				new TransformBonePose("Shin.L", [.1]),
				new TransformBonePose("Thigh.R", [0]),
				new TransformBonePose("Shin.R", [0]),
			]),
			new AnimationKeyframe(30, [
				new TransformBonePose("Bicep.L", [-.1]),
				new TransformBonePose("Forearm.L", [0]),
				new TransformBonePose("Thigh.L", [.1]),
				new TransformBonePose("Shin.L", [0]),
				new TransformBonePose("Bicep.R", [.1]),
				new TransformBonePose("Forearm.R", [.1]),
				new TransformBonePose("Thigh.R", [-.05]),
				new TransformBonePose("Shin.R", [0]),
			]),
		]);
		return animationDefnBipedWalk;
	}
	SkeletonHelper.transformBuildForMeshAndSkeleton_Proximity = function(meshAtRest, skeletonAtRest, skeletonPosed) {
		var vertices = meshAtRest.vertices;
		var bones = skeletonAtRest.bonesAll;
		var boneNameToInfluenceLookup = [];
		for (var v = 0; v < vertices.length; v++) {
			var vertexPos = vertices[v];
			var distanceLeastSoFar = Number.POSITIVE_INFINITY;
			var indexOfBoneClosestSoFar = null;
			for (var b = 0; b < bones.length; b++) {
				var bone = bones[b];
				var displacement = vertexPos.clone().subtract(bone.pos(bones).add(bone.orientation.forward.clone().multiplyScalar(bone.length)));
				var distance = displacement.magnitude();
				if (distance < distanceLeastSoFar) {
					distanceLeastSoFar = distance;
					indexOfBoneClosestSoFar = b;
				}
			}
			var boneClosest = bones[indexOfBoneClosestSoFar];
			var boneClosestName = boneClosest.name;
			var boneInfluence = boneNameToInfluenceLookup[boneClosestName];
			if (boneInfluence == null) {
				boneInfluence = new BoneInfluence(boneClosestName, []);
				boneNameToInfluenceLookup[boneClosestName] = boneInfluence;
				boneNameToInfluenceLookup.push(boneInfluence);
			}
			boneInfluence.vertexIndicesControlled.push(v);
		}
		var returnValue = new TransformMeshPoseWithSkeleton(meshAtRest, skeletonAtRest, skeletonPosed, boneNameToInfluenceLookup);
		return returnValue;
	}
}

function SpaceTree(name, size, nodeSizeInChildren, depthMax) {
	this.name = name;
	this.size = size;
	this.nodeSizeInChildren = nodeSizeInChildren;
	this.depthMax = depthMax;
	this.nodeSizeInChildrenMinusOnes = this.nodeSizeInChildren.clone().subtract(Coords.Instances.Ones);
	this.sizesAtDepths = [];
	var sizeOfDescendantsAtDepth = this.size.clone();
	for (var i = 0; i < this.depthMax; i++) {
		this.sizesAtDepths.push(sizeOfDescendantsAtDepth.clone());
		sizeOfDescendantsAtDepth.divide(this.nodeSizeInChildren);
	}
	this.nodeRoot = new SpaceTreeNode(null);
	this.nodesFree = [];
	this.maxNodesToSaveForReuse = 1024;
} {
	SpaceTree.prototype.addItemWithBounds = function(item, bounds, nodesItemAddedToSoFar) {
		var pos = new Coords(0, 0, 0);
		this.nodeRoot.addItemWithBounds(this, // tree
			0, // depth
			pos, // pos
			item, bounds, nodesItemAddedToSoFar);
	}
	SpaceTree.prototype.addItemsInBoundsToList = function(bounds, listToAddTo) {
		this.nodeRoot.addItemsInBoundsToList(this, // tree
			0, // depth
			new Coords(0, 0, 0), // pos
			bounds, listToAddTo);
	}
	SpaceTree.prototype.nodeAllocate = function(parent) {
		if (this.nodesFree.length == 0) {
			this.nodesFree.push(new SpaceTreeNode(parent));
		}
		var nodeToAllocate = this.nodesFree[0];
		nodeToAllocate.parent = parent;
		nodeToAllocate.children = null;
		nodeToAllocate.items.length = 0;
		this.nodesFree.splice(0, 1);
		return nodeToAllocate;
	}
	SpaceTree.prototype.nodeDeallocateIfEmpty = function(nodeToDeallocate) {
		var nodeCurrent = nodeToDeallocate;
		while (nodeCurrent != null) {
			var nodeNext = nodeCurrent.parent;
			if (nodeCurrent.items.length == 0) {
				if (this.nodesFree.length < this.maxNodesToSaveForReuse) {
					// Save it for later reuse.
					this.nodesFree.push(nodeCurrent);
				} else {
					// Plenty are already available, 
					// so just discard this one.
					nodeCurrent.parent = null;
					nodeCurrent.children = null;
					nodeCurrent.items = null;
				}
			} else {
				break;
			}
			nodeCurrent = nodeNext;
		}
	}
	SpaceTree.prototype.removeItemFromNodes = function(itemToRemove, listOfNodesToRemoveFrom) {
		for (var i = 0; i < listOfNodesToRemoveFrom.length; i++) {
			var node = listOfNodesToRemoveFrom[i];
			var nodeItems = node.items;
			nodeItems.splice(nodeItems.indexOf(itemToRemove), 1);
			this.nodeDeallocateIfEmpty(node);
		}
		listOfNodesToRemoveFrom.length = 0;
	}
}

function SpaceTreeNode(parent) {
	this.parent = parent;
	this.children = null;
	this.items = [];
} {
	// instance methods
	SpaceTreeNode.prototype.addItemWithBounds = function(tree, depth, pos, itemToAdd, bounds, nodesItemAddedToSoFar) {
		this.items.push(itemToAdd);
		nodesItemAddedToSoFar.push(this);
		var depthNext = depth + 1;
		if (depthNext >= tree.depthMax) {
			return;
		}
		if (this.children == null) {
			this.createChildren(tree, depth);
		}
		var childIndicesStartAndEnd = this.startAndEndIndicesForChildrenInBounds(tree, depth, pos, bounds);
		var childIndicesStart = childIndicesStartAndEnd[0];
		var childIndicesEnd = childIndicesStartAndEnd[1];
		var childIndices = new Coords(0, 0, 0);
		for (var y = childIndicesStart.y; y <= childIndicesEnd.y; y++) {
			childIndices.y = y;
			for (var x = childIndicesStart.x; x <= childIndicesEnd.x; x++) {
				childIndices.x = x;
				var child = this.childAtIndices(tree, childIndices);
				var posOfChild = pos.clone().add(childIndices.clone().multiply(tree.sizesAtDepths[depthNext]));
				child.addItemWithBounds(tree, depthNext, posOfChild, itemToAdd, bounds, nodesItemAddedToSoFar);
			}
		}
	}
	SpaceTreeNode.prototype.addItemsInBoundsToList = function(tree, depth, pos, bounds, listToAddTo) {
		var leafNodes = [];
		this.addLeafNodesInBoundsToList(tree, depth, pos, bounds, leafNodes);
		for (var i = 0; i < leafNodes.length; i++) {
			var leafNodeItems = leafNodes[i].items;
			for (var j = 0; j < leafNodeItems.length; j++) {
				var leafNodeItem = leafNodeItems[j];
				var itemBounds = leafNodeItem.collidableData.bounds;
				if (Bounds.doBoundsOverlap(bounds, itemBounds) == true) {
					listToAddTo.push(leafNodeItem);
				}
			}
		}
	}
	SpaceTreeNode.prototype.addLeafNodesInBoundsToList = function(tree, depth, pos, bounds, listToAddTo) {
		if (this.children == null) {
			listToAddTo.push(this);
		} else {
			var depthNext = depth + 1;
			var childIndicesStartAndEnd = this.startAndEndIndicesForChildrenInBounds(tree, depth, pos, bounds);
			var childIndicesStart = childIndicesStartAndEnd[0];
			var childIndicesEnd = childIndicesStartAndEnd[1];
			var childIndices = new Coords(0, 0, 0);
			for (var y = childIndicesStart.y; y <= childIndicesEnd.y; y++) {
				childIndices.y = y;
				for (var x = childIndicesStart.x; x <= childIndicesEnd.x; x++) {
					childIndices.x = x;
					var child = this.childAtIndices(tree, childIndices);
					child.addLeafNodesInBoundsToList(tree, depthNext, pos.clone().add(childIndices.clone().multiply(tree.sizesAtDepths[depthNext])), bounds, listToAddTo)
				}
			}
		}
	}
	SpaceTreeNode.prototype.addLeafDescendantsToList = function(listToAddTo) {
		if (this.children == null) {
			listToAddTo.add(this);
		} else {
			for (var c = 0; c < this.children.length; c++) {
				this.children[c].addLeafDescendantsToList(listToAddTo);
			}
		}
	}
	SpaceTreeNode.prototype.childAtIndices = function(tree, childIndices) {
		return this.children[this.childIndicesFlatten(tree, childIndices)];
	}
	SpaceTreeNode.prototype.childAtIndices_Set = function(tree, childIndices, valueToSet) {
		this.children[this.childIndicesFlatten(tree, childIndices)] = valueToSet;
	}
	SpaceTreeNode.prototype.childIndicesFlatten = function(tree, childIndices) {
		return childIndices.y * tree.nodeSizeInChildren.x + childIndices.x;
	}
	SpaceTreeNode.prototype.createChildren = function(tree, depth) {
		if (depth < tree.depthMax) {
			this.children = [];
			var childIndices = new Coords(0, 0, 0);
			var nodeSizeInChildren = tree.nodeSizeInChildren;
			for (var y = 0; y < nodeSizeInChildren.y; y++) {
				childIndices.y = y;
				for (var x = 0; x < nodeSizeInChildren.x; x++) {
					childIndices.x = x;
					var childNew = tree.nodeAllocate(this);
					this.childAtIndices_Set(tree, childIndices, childNew);
				}
			}
		}
	}
	SpaceTreeNode.prototype.neighborAtOffsetIndices = function(neighborOffsetIndices) {
		var returnValue;
		if (this.parent == null) {
			returnValue = this;
		} else {
			var neighborIndices = this.indicesWithinParent.add(neighborOffsetIndices);
			var neighborIndicesWrapped = neighborIndices.clone().wrapToRangeInPlace(this.parent.sizeInChildren);
			if (neighborIndicesWrapped.equals(neighborIndices) == true) {
				returnValue = this.parent.getChildAtIndices(neighborIndices);
			} else {
				var parentNeighbor = this.parent.getNeighborAtOffsetIndices(neighborOffsetIndices);
				if (parentNeighbor.children == null) {
					parentNeighbor.createChildren();
				}
				returnValue = parentNeighbor.getChildAtIndices(neighborIndicesWrapped);
			}
		}
		return returnValue;
	}
	SpaceTreeNode.prototype.startAndEndIndicesForChildrenInBounds = function(tree, depth, pos, bounds) {
		var sizeInChildrenMinusOnes = tree.nodeSizeInChildrenMinusOnes;
		var sizeOfChildren = tree.sizesAtDepths[depth + 1];
		var returnValues = [];
		var boundsMinAndMax = bounds.minAndMax();
		for (var i = 0; i < boundsMinAndMax.length; i++) {
			var boundsExtreme = boundsMinAndMax[i];
			var value = boundsExtreme.clone().subtract(pos).divide(sizeOfChildren).floor().trimToRange(sizeInChildrenMinusOnes);
			returnValues.push(value);
		}
		return returnValues;
	}
}

function SpacePartitioningTree(nodeRoot) {
	this.nodeRoot = nodeRoot;
} {
	SpacePartitioningTree.fromFaces = function(faces) {
		var nodeRoot = new SpacePartitioningTreeNode(faces);
		var returnValue = new SpacePartitioningTree(nodeRoot);
		return returnValue;
	}
}

function SpacePartitioningTreeNode(faces) {
	var faceToDivideOn = faces[0];
	this.faces = [faceToDivideOn];
	var planeToDivideOn = faceToDivideOn.plane;
	if (faces.length == 1) {
		this.children = null;
	} else {
		var faceSetsFrontAndBack = [
			[],
			[]
		];
		for (var f = 1; f < faces.length; f++) {
			var faceOther = faces[f];
			if (faceOther.plane.equals(faceToDivideOn.plane) == true) {
				this.faces.push(faceOther);
			} else {
				var facesDividedFrontAndBack = MeshHelper.splitFaceByPlaneFrontAndBack(faceOther, planeToDivideOn);
				for (var i = 0; i < facesDividedFrontAndBack.length; i++) {
					var facePart = facesDividedFrontAndBack[i];
					if (facePart != null) {
						var facesForChildNode = faceSetsFrontAndBack[i];
						facesForChildNode.push(facePart);
					}
				}
			}
		}
		this.children = [];
		for (var i = 0; i < faceSetsFrontAndBack.length; i++) {
			var faceSet = faceSetsFrontAndBack[i];
			var childNode = null;
			if (faceSet.length > 0) {
				childNode = new SpacePartitioningTreeNode(faceSet);
			}
			this.children[i] = childNode;
		}
	}
} {
	SpacePartitioningTreeNode.prototype.addFacesBackToFrontForCameraPosToList = function(cameraPos, facesToAddTo) {
		if (this.children == null) {
			for (var i = 0; i < this.faces.length; i++) {
				facesToAddTo.push(this.faces[i]);
			}
		} else {
			var distanceOfCameraAbovePlane = Collision.findDistanceOfPositionAbovePlane(cameraPos, this.faces[0].plane)
			var childIndexFirst = (distanceOfCameraAbovePlane > 0 ? 1 : 0);
			var nodeChild = this.children[childIndexFirst];
			if (nodeChild != null) {
				nodeChild.addFacesBackToFrontForCameraPosToList(cameraPos, facesToAddTo);
			}
			for (var f = 0; f < this.faces.length; f++) {
				facesToAddTo.push(this.faces[f]);
			}
			var nodeChild = this.children[1 - childIndexFirst];
			if (nodeChild != null) {
				nodeChild.addFacesBackToFrontForCameraPosToList(cameraPos, facesToAddTo);
			}
		}
	}
}

function Texture(name, image) {
	this.name = name;
	this.image = image;
} {
	// instances
	function Texture_Instances() {
		this.TestPattern = new Texture("TextureTestPattern", ImageHelper.buildImageFromStrings("ImageTestPattern", ["rg", "by"]));
		this.Goal = new Texture("TextureGoal", ImageHelper.buildImageFromStrings("ImageGoal", ["@"]));
		this.Start = new Texture("TextureStart", ImageHelper.buildImageFromStrings("ImageStart", ["A"]));
		this.Wall = new Texture("TextureWall", ImageHelper.buildImageFromStrings("ImageWall", ["AAAAAAAAAAAAAAAA", "AaaaAaaaAaaaAaaa", "AaaaAaaaAaaaAaaa", "AaaaAaaaAaaaAaaa", "AAAAAAAAAAAAAAAA", "aaAaaaAaaaAaaaAa", "aaAaaaAaaaAaaaAa", "aaAaaaAaaaAaaaAa", "AAAAAAAAAAAAAAAA", "AaaaAaaaAaaaAaaa", "AaaaAaaaAaaaAaaa", "AaaaAaaaAaaaAaaa", "AAAAAAAAAAAAAAAA", "aaAaaaAaaaAaaaAa", "aaAaaaAaaaAaaaAa", "aaAaaaAaaaAaaaAa", ]));
	}
	Texture.Instances = new Texture_Instances();
	// methods
	Texture.prototype.initializeForWebGLContext = function(webGLContext) {
		var gl = webGLContext.gl;
		this.systemTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.systemTexture);
		//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image.systemImage);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}

function Transform() {} {
	Transform.applyTransformToCoordsArrays = function(transformToApply, coordsArraysToTransform) {
		if (coordsArraysToTransform == null) {
			return;
		}
		for (var i = 0; i < coordsArraysToTransform.length; i++) {
			var coordsArray = coordsArraysToTransform[i];
			Transform.applyTransformToCoordsMany(transformToApply, coordsArray);
		}
	}
	Transform.applyTransformToCoordsMany = function(transformToApply, coordsSetToTransform) {
		for (var i = 0; i < coordsSetToTransform.length; i++) {
			transformToApply.applyToCoords(coordsSetToTransform[i]);
		}
	}
}

function TransformBonePose(boneName, cyclesToRotateAroundAxesDownRightForward) {
	this.boneName = boneName;
	this.cyclesToRotateAroundAxesDownRightForward = cyclesToRotateAroundAxesDownRightForward;
	this.propertyName = this.boneName;
} {
	// instance methods
	TransformBonePose.prototype.clone = function() {
		return new TransformBonePose(this.boneName, this.cyclesToRotateAroundAxesDownRightForward);
	}
	TransformBonePose.prototype.interpolateWith = function(other, fractionOfProgressTowardOther) {
		var cyclesToRotateAroundAxesDownRightForwardInterpolated = [];
		for (var i = 0; i < this.cyclesToRotateAroundAxesDownRightForward.length; i++) {
			var cyclesToRotateInterpolated = (1 - fractionOfProgressTowardOther) * this.cyclesToRotateAroundAxesDownRightForward[i] + fractionOfProgressTowardOther * other.cyclesToRotateAroundAxesDownRightForward[i];
			cyclesToRotateAroundAxesDownRightForwardInterpolated[i] = cyclesToRotateInterpolated;
		}
		var returnValue = new TransformBonePose(this.boneName, cyclesToRotateAroundAxesDownRightForwardInterpolated);
		return returnValue;
	}
	TransformBonePose.prototype.transform = function(transformableToTransform) {
		var skeletonToTransform = transformableToTransform;
		var boneToTransform = skeletonToTransform.bonesAll[this.boneName];
		var boneOrientation = boneToTransform.orientation;
		var axesToRotateAround = [
			boneOrientation.down,
			boneOrientation.right,
			boneOrientation.forward,
		];
		var quaternionsForRotation = [];
		for (var i = 0; i < this.cyclesToRotateAroundAxesDownRightForward.length; i++) {
			var axisToRotateAround = axesToRotateAround[i];
			var cyclesToRotateAroundAxis = this.cyclesToRotateAroundAxesDownRightForward[i];
			if (cyclesToRotateAroundAxis != 0) {
				var quaternionForRotation = Quaternion.fromAxisAndCyclesToRotate(axisToRotateAround, cyclesToRotateAroundAxis);
				quaternionsForRotation.push(quaternionForRotation);
			}
		}
		this.transform_Bone(quaternionsForRotation, boneToTransform)
	}
	TransformBonePose.prototype.transform_Bone = function(quaternionsForRotation, boneToTransform) {
		var axesToTransform = boneToTransform.orientation.axes;
		for (var i = 0; i < quaternionsForRotation.length; i++) {
			var quaternionForRotation = quaternionsForRotation[i];
			for (var a = 0; a < axesToTransform.length; a++) {
				var axisToTransform = axesToTransform[a];
				quaternionForRotation.applyToCoordsAsRotation(axisToTransform);
			}
		}
		for (var i = 0; i < boneToTransform.children.length; i++) {
			var childBone = boneToTransform.children[i];
			this.transform_Bone(quaternionsForRotation, childBone);
		}
	}
}

function Transform_DimensionsSwap(dimensionIndices) {
	this.dimensionIndices = dimensionIndices;
} {
	Transform_DimensionsSwap.prototype.applyToCoords = function(coordsToTransform) {
		var dimensionIndex0 = this.dimensionIndices[0];
		var dimensionIndex1 = this.dimensionIndices[1];
		var dimension0 = coordsToTransform.dimension(dimensionIndex0);
		var dimension1 = coordsToTransform.dimension(dimensionIndex1);
		coordsToTransform.dimension_Set(dimensionIndex0, dimension1);
		coordsToTransform.dimension_Set(dimensionIndex1, dimension0);
	}
}

function Transform_Camera(camera) {
	this.camera = camera;
	this.transformTranslateInvert = new Transform_TranslateInvert(this.camera.body.loc.pos);
	this.transformOrientForCamera = new Transform_OrientForCamera(this.camera.body.loc.orientation);
	this.transformPerspective = new Transform_Perspective(this.camera.focalLength);
	this.transformViewCenter = new Transform_Translate(this.camera.viewSizeHalf);
} {
	Transform_Camera.prototype.applyToCoords = function(coordsToTransform) {
		this.transformTranslateInvert.applyToCoords(coordsToTransform);
		this.transformOrientForCamera.applyToCoords(coordsToTransform);
		this.transformPerspective.applyToCoords(coordsToTransform);
		this.transformViewCenter.applyToCoords(coordsToTransform);
	}
}

function Transform_Locate(loc) {
	this.loc = loc;
	this.transformOrient = new Transform_Orient(loc.orientation);
	this.transformTranslate = new Transform_Translate(loc.pos);
} {
	Transform_Locate.prototype.applyToCoords = function(coordsToTransform) {
		this.transformOrient.applyToCoords(coordsToTransform);
		this.transformTranslate.applyToCoords(coordsToTransform);
	}
}

function Transform_MeshPoseWithSkeleton(meshAtRest, skeletonAtRest, skeletonPosed, boneInfluences) {
	this.meshAtRest = meshAtRest;
	this.skeletonAtRest = skeletonAtRest;
	this.skeletonPosed = skeletonPosed;
	this.boneInfluences = boneInfluences;
	this.boneInfluences.addLookups("boneName");
} {
	Transform_MeshPoseWithSkeleton.prototype.transformMesh = function(meshToPose) {
		var bonesAtRest = this.skeletonAtRest.bonesAll;
		var bonesPosed = this.skeletonPosed.bonesAll;
		for (var i = 0; i < this.boneInfluences.length; i++) {
			var boneInfluence = this.boneInfluences[i];
			var boneName = boneInfluence.boneName;
			var boneAtRest = bonesAtRest[boneName];
			var bonePosed = bonesPosed[boneName];
			var boneAtRestOrientation = boneAtRest.orientation;
			var bonePosedOrientation = bonePosed.orientation;
			var vertexIndicesControlled = boneInfluence.vertexIndicesControlled;
			for (var vi = 0; vi < vertexIndicesControlled.length; vi++) {
				var vertexIndex = vertexIndicesControlled[vi];
				var vertexAtRest = this.meshAtRest.vertices[vertexIndex].pos;
				var vertexToPose = meshToPose.vertices[vertexIndex].pos;
				var boneAtRestPos = boneAtRest.pos(bonesAtRest);
				var bonePosedPos = bonePosed.pos(bonesPosed);
				var vertexAtRestProjected = vertexAtRest.clone().subtract(boneAtRestPos);
				vertexAtRestProjected.overwriteWithDimensions(vertexAtRestProjected.dotProduct(boneAtRestOrientation.right), vertexAtRestProjected.dotProduct(boneAtRestOrientation.down), vertexAtRestProjected.dotProduct(boneAtRestOrientation.forward));
				vertexToPose.overwriteWith(bonePosedPos);
				vertexToPose.add(bonePosedOrientation.right.clone().multiplyScalar(vertexAtRestProjected.x)).add(bonePosedOrientation.down.clone().multiplyScalar(vertexAtRestProjected.y)).add(bonePosedOrientation.forward.clone().multiplyScalar(vertexAtRestProjected.z));
			}
		} // end for each boneInfluence
	}
}

function Transform_Multiple(transforms) {
	this.transforms = transforms;
} {
	Transform_Multiple.prototype.applyToCoords = function(coordsToTransform) {
		for (var i = 0; i < this.transforms.length; i++) {
			var transform = this.transforms[i];
			transform.applyToCoords(coordsToTransform);
		}
	}
}

function Transform_Orient(orientation) {
	this.orientation = orientation;
} {
	Transform_Orient.prototype.applyToCoords = function(coordsToTransform) {
		coordsToTransform.overwriteWithDimensions(this.orientation.forward.dotProduct(coordsToTransform), this.orientation.right.dotProduct(coordsToTransform), this.orientation.down.dotProduct(coordsToTransform));
	}
}

function Transform_OrientForCamera(orientation) {
	this.orientation = orientation;
} {
	Transform_OrientForCamera.prototype.applyToCoords = function(coordsToTransform) {
		coordsToTransform.overwriteWithDimensions(this.orientation.right.dotProduct(coordsToTransform), this.orientation.down.dotProduct(coordsToTransform), this.orientation.forward.dotProduct(coordsToTransform));
	}
}

function Transform_Perspective(focalLength) {
	this.focalLength = focalLength;
} {
	Transform_Perspective.prototype.applyToCoords = function(coordsToTransform) {
		var distanceAlongCameraForward = coordsToTransform.z;
		coordsToTransform.multiplyScalar(this.focalLength);
		if (distanceAlongCameraForward != 0) {
			coordsToTransform.divideScalar(distanceAlongCameraForward);
		}
	}
}

function Transform_Scale(scaleFactors) {
	this.scaleFactors = scaleFactors;
} {
	Transform_Scale.prototype.applyToCoords = function(coordsToTransform) {
		coordsToTransform.multiply(this.scaleFactors);
	}
}

function Transform_Translate(displacement) {
	this.displacement = displacement;
} {
	Transform_Translate.prototype.applyToCoords = function(coordsToTransform) {
		coordsToTransform.add(this.displacement);
	}
}

function Transform_TranslateInvert(displacement) {
	this.displacement = displacement;
} {
	Transform_TranslateInvert.prototype.applyToCoords = function(coordsToTransform) {
		coordsToTransform.subtract(this.displacement);
	}
}

function TreeHelper() {} {
	TreeHelper.addNodeAndAllDescendantsToList = function(node, listToAddTo) {
		listToAddTo.push(node);
		for (var i = 0; i < node.children.length; i++) {
			var nodeChild = node.children[i];
			TreeHelper.addNodeAndAllDescendantsToList(nodeChild, listToAddTo);
		}
		return listToAddTo;
	}
}

function Universe(name, materials, bodyDefns, worlds) {
	this.name = name;
	this.materials = materials;
	this.bodyDefns = bodyDefns;
	this.worlds = worlds;
	this.worlds.addLookups("name");
	this.worldCurrent = this.worlds[0];
} {
	// static methods
	Universe.buildRandom = function(mazeSizeInCells, mazeCellSizeInPixels) {
		var textures = Texture.Instances;
		var materials = [
			new Material("MaterialMover", Color.Instances.Black, Color.Instances.Gray, textures.TestPattern),
			new Material("MaterialGoal", Color.Instances.Blue, Color.Instances.GrayLight, textures.Goal),
			new Material("MaterialStart", Color.Instances.Blue, Color.Instances.GrayDark, textures.Start),
			new Material("MaterialWall", Color.Instances.Blue, Color.Instances.Gray, textures.Wall),
		];
		materials.addLookups("name");
		/*
		var meshMover = MeshHelper.buildUnitRing
		(
			"MeshMover", materials["MaterialMover"], 3
		).transform
		(
			new Transform_Scale(new Coords(3, 2, 2))
		);
		*/
		/*
		// An alternate, asymmetric mesh.
		var meshMover = new Mesh
		(
			"MeshMover",
			materials["MaterialMover"],
			Vertex.buildManyFromPositions
			([
				new Coords(-1, -1, 0),
				new Coords(1, -1, 0),
				new Coords(4, 1, 0),
				new Coords(-1, 1, 0),
			]),
			//vertexIndicesForFaces
			[
				[3, 2, 1, 0]
			],
			// textureUVsForFaceVertices
			[
				[ 
					new Coords(0, 0), 
					new Coords(1, 0), 
					new Coords(1, 1), 
					new Coords(0, 1) 
				]
			]
		);
		*/
		var meshMover = MeshHelper.buildBiped(materials["MaterialMover"], 6 // height
		);
		var bodyDefnMover = new BodyDefn("BodyDefnMover", true, // isDrawable
			true, // isMovable
			meshMover);
		var bodyDefns = [
			bodyDefnMover,
		];
		bodyDefns.addLookups("name");
		var worldRandom = World.buildRandom(materials, bodyDefns, mazeSizeInCells, mazeCellSizeInPixels);
		var returnValue = new Universe("Random Universe", materials, bodyDefns,
			// worlds
			[
				worldRandom,
			]);
		return returnValue;
	}
	// instance methods
	Universe.prototype.initialize = function() {
		this.worldNext = this.worlds[0];
	}
	Universe.prototype.update = function() {
		if (this.worldNext != null) {
			if (this.worldCurrent != null) {
				this.worldCurrent.finalize();
			}
			this.worldCurrent = this.worldNext;
			this.worldCurrent.initialize();
			this.worldNext = null;
		}
		this.worldCurrent.update();
	}
}

function Vertex(pos) {
	this.pos = pos;
} {
	// static methods
	Vertex.addPositionsOfManyToList = function(vertices, listToAddTo) {
		for (var i = 0; i < vertices.length; i++) {
			var vertex = vertices[i];
			var vertexPos = vertex.pos;
			listToAddTo.push(vertexPos);
		}
		return listToAddTo;
	}
	Vertex.buildManyFromPositions = function(positions) {
		var returnValues = [];
		for (var i = 0; i < positions.length; i++) {
			var pos = positions[i];
			var vertex = new Vertex(pos);
			returnValues.push(vertex);
		}
		return returnValues;
	}
	// cloneable
	Vertex.prototype.clone = function() {
		return new Vertex(this.pos.clone());
	}
	Vertex.prototype.overwriteWith = function(other) {
		this.pos.overwriteWith(other.pos);
	}
}

function VertexGroup(name, vertexIndices) {
	this.name = name;
	this.vertexIndices = vertexIndices;
} {
	// cloneable
	VertexGroup.prototype.clone = function() {
		return new VertexGroup(this.name, this.vertexIndices.slice());
	}
}

function WebGLContext(canvas) {
	this.gl = this.initGL(canvas);
	this.shaderProgram = this.buildShaderProgram(this.gl);
} {
	// methods
	// static methods
	WebGLContext.coordsToWebGLArray = function(coordsToConvert) {
		var returnValues = new Float32Array(coordsToConvert.dimensions());
		return returnValues;
	}
	// instance methods
	WebGLContext.prototype.initGL = function(canvas) {
		var gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		var colorBackground = Color.Instances.Black;
		var colorBackgroundComponentsRGBA = colorBackground.componentsRGBA;
		gl.clearColor(colorBackgroundComponentsRGBA[0], colorBackgroundComponentsRGBA[1], colorBackgroundComponentsRGBA[2], colorBackgroundComponentsRGBA[3]);
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);
		return gl;
	}
	WebGLContext.prototype.buildShaderProgram = function(gl) {
		var shaderProgram = this.buildShaderProgram_Compile(gl, this.buildShaderProgram_FragmentShader(gl), this.buildShaderProgram_VertexShader(gl));
		this.buildShaderProgram_SetUpInputVariables(gl, shaderProgram);
		return shaderProgram;
	}
	WebGLContext.prototype.buildShaderProgram_FragmentShader = function(gl) {
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		var fragmentShaderCode = "precision mediump float;" + "uniform sampler2D uSampler;" + "varying vec4 vColor;" + "varying vec3 vLight;" + "varying vec2 vTextureUV;" + "void main(void) {" + "    if (vTextureUV.x < 0.0) {" + "        gl_FragColor = vColor;" + "    } else {" + "        vec4 textureColor = " + "            texture2D(uSampler, vec2(vTextureUV.s, vTextureUV.t));" + "        gl_FragColor = vec4(vLight * textureColor.rgb, textureColor.a);" + "    }" + "}";
		gl.shaderSource(fragmentShader, fragmentShaderCode);
		gl.compileShader(fragmentShader);
		return fragmentShader;
	}
	WebGLContext.prototype.buildShaderProgram_VertexShader = function(gl) {
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		var vertexShaderCode = "attribute vec4 aVertexColor;" + "attribute vec3 aVertexNormal;" + "attribute vec3 aVertexPosition;" + "attribute vec2 aVertexTextureUV;" + "uniform mat4 uBodyMatrix;" + "uniform mat4 uCameraMatrix;" + "uniform float uLightAmbientIntensity;" + "uniform vec3 uLightDirection;" + "uniform float uLightDirectionalIntensity;" + "uniform mat4 uNormalMatrix;" + "varying vec4 vColor;" + "varying vec3 vLight;" + "varying vec2 vTextureUV;" + "void main(void) {" + "    vColor = aVertexColor;" + "    vec4 vertexNormal4 = vec4(aVertexNormal, 0.0);" + "    vec4 transformedNormal4 = uNormalMatrix * vertexNormal4;" + "    vec3 transformedNormal = vec3(transformedNormal4.xyz) * -1.0;" + "    float lightMagnitude = uLightAmbientIntensity;" + "    lightMagnitude += " + "        uLightDirectionalIntensity " + "        * max(dot(transformedNormal, uLightDirection), 0.0);" + "    vLight = vec3(1.0, 1.0, 1.0) * lightMagnitude;" + "    vTextureUV = aVertexTextureUV;" + "    vec4 vertexPos = vec4(aVertexPosition, 1.0);" + "    gl_Position = uCameraMatrix * uBodyMatrix * vertexPos;" + "}";
		gl.shaderSource(vertexShader, vertexShaderCode);
		gl.compileShader(vertexShader);
		return vertexShader;
	}
	WebGLContext.prototype.buildShaderProgram_Compile = function(gl, fragmentShader, vertexShader) {
		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);
		gl.useProgram(shaderProgram);
		return shaderProgram;
	}
	WebGLContext.prototype.buildShaderProgram_SetUpInputVariables = function(gl, shaderProgram) {
		shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
		gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
		shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
		gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
		shaderProgram.vertexTextureUVAttribute = gl.getAttribLocation(shaderProgram, "aVertexTextureUV");
		gl.enableVertexAttribArray(shaderProgram.vertexTextureUVAttribute);
		shaderProgram.bodyMatrix = gl.getUniformLocation(shaderProgram, "uBodyMatrix");
		shaderProgram.cameraMatrix = gl.getUniformLocation(shaderProgram, "uCameraMatrix");
		shaderProgram.lightAmbientIntensity = gl.getUniformLocation(shaderProgram, "uLightAmbientIntensity");
		shaderProgram.lightDirection = gl.getUniformLocation(shaderProgram, "uLightDirection");
		shaderProgram.lightDirectionalIntensity = gl.getUniformLocation(shaderProgram, "uLightDirectionalIntensity");
		shaderProgram.normalMatrix = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
	}
}

function World(name, sizeInPixels, zones, bodies) {
	this.name = name;
	this.sizeInPixels = sizeInPixels;
	this.zones = zones;
	this.bodies = bodies;
	this.zones.addLookups("name");
} {
	// static methods
	World.buildRandom = function(materials, bodyDefns, mazeSizeInCells, mazeCellSizeInPixels) {
		var maze = new Maze(mazeCellSizeInPixels, mazeSizeInCells,
			// neighborOffsets
			[
				new Coords(-1, 0, 0), // west
				new Coords(1, 0, 0), // east
				new Coords(0, -1, 0), // north
				new Coords(0, 1, 0), // south
			]).generateRandom();
		var cellPosOfStart = new Coords().randomize().multiply(maze.sizeInCells).floor();
		var cellPosOfGoal = null;
		var distanceOrthogonalFromStartToGoalMin = maze.sizeInCells.x / 2;
		var distanceOrthogonalFromStartToGoal = 0;
		// hack - The time this will take is nondeterministic.
		while (distanceOrthogonalFromStartToGoal < distanceOrthogonalFromStartToGoalMin) {
			cellPosOfGoal = new Coords().randomize().multiply(maze.sizeInCells).floor();
			distanceOrthogonalFromStartToGoal = cellPosOfGoal.clone().subtract(cellPosOfStart).absolute().sumOfDimensions();
		}
		zones = maze.convertToZones(materials["MaterialWall"], cellPosOfStart, materials["MaterialStart"], cellPosOfGoal, materials["MaterialGoal"]);
		var nameOfZoneStart = cellPosOfStart.toString();
		var bodyForPlayer = new Body("Player", bodyDefns["BodyDefnMover"], new Location(nameOfZoneStart, cellPosOfStart.clone().multiply(maze.cellSizeInPixels).add(new Coords(0, 0, -10)), new Orientation(new Coords(0, 1, 0), new Coords(0, 0, 1))));
		var bodyForMoverOther = new Body("MoverOther", bodyDefns["BodyDefnMover"], new Location(nameOfZoneStart, cellPosOfStart.clone().multiply(maze.cellSizeInPixels).add(maze.cellSizeInPixels.multiplyScalar(.1)), new Orientation(new Coords(0, 1, 0), new Coords(0, 0, 1))));
		var returnValue = new World("Maze-" + maze.sizeInCells.x + "x" + maze.sizeInCells.y, maze.sizeInPixels, zones,
			// bodies
			[
				bodyForPlayer,
				bodyForMoverOther,
			]);
		return returnValue;
	}
	// instance methods
	World.prototype.secondsElapsed = function() {
		var now = new Date();
		var secondsElapsed = Math.floor(
			(now - this.dateStarted) / 1000);
		return secondsElapsed;
	}
	// venue
	World.prototype.finalize = function() {
		// todo
	}
	World.prototype.initialize = function() {
		/*
		this.collisionTree = new SpaceTree
		(
			this.name + "_CollisionTree",
			this.sizeInPixels,
			new Coords(2, 2, 1), // nodeSizeInChildren
			4 //depthMax
		);
		*/
		this.meshesToDraw = [];
		var bodyForPlayer = this.bodies[0];
		this.zoneNext = this.zones[bodyForPlayer.loc.zoneName];
		this.zonesActive = [];
		var activityDefns = new ActivityDefn_Instances();
		bodyForPlayer.activity = new Activity(activityDefns.UserInputAccept);
		var skeleton = SkeletonHelper.biped(6 // hack - figureHeightInPixels
		);
		var animationDefnGroupBiped = SkeletonHelper.bipedAnimationDefnGroup();
		var constraintsForMovers = [
			new Constraint_Gravity(.1),
			new Constraint_Solid(),
			new Constraint_Friction(1, .5, .01),
			new Constraint_Movable(),
		];
		for (var i = 0; i < this.bodies.length; i++) {
			var body = this.bodies[i];
			if (body.defn.mesh.name == "MeshBiped") {
				body.actions = [];
				body.constraints = [];
				body.constraints.appendElementsFrom(constraintsForMovers);
				var skeletonCloned = skeleton.clone();
				body.constraints.prependElementsFrom([
					new Constraint_Pose(skeleton, skeletonCloned),
					new Constraint_Animate(skeleton, skeletonCloned, animationDefnGroupBiped),
				]);
				body.constraints.addLookups("name");
			}
		}
		var viewSizeInPixels = Globals.Instance.displayHelpers[0].viewSize.clone();
		var focalLength = viewSizeInPixels.z / 16;
		var followDivisor = 16;
		var offsetOfCameraFromPlayer = new Coords(0 - focalLength, 0, 0 - focalLength).divideScalar(followDivisor);
		this.camera = new Camera(viewSizeInPixels, focalLength, // focalLength,
			new Body("BodyCamera", new BodyDefn("BodyDefnCamera", false, // isDrawable
				true, // isMovable
				null // mesh
			), new Location(this.zoneNext.name, this.zoneNext.body.loc.pos.clone().add(offsetOfCameraFromPlayer), new Orientation(new Coords(1, 0, 1), // forward
				new Coords(0, 0, 1) // down
			))));
		this.camera.body.constraints = [
			//new Constraint_Attach(bodyForPlayer, offsetOfCameraFromPlayer),
			new Constraint_Follow(bodyForPlayer, focalLength / followDivisor),
			new Constraint_OrientToward(bodyForPlayer),
		];
		this.camera.body.constraints.addLookups("name");
		this.bodies.push(this.camera.body);
		this.dateStarted = new Date();
	}
	World.prototype.update = function() {
		if (this.zoneNext != null) {
			if (this.zoneNext.body.meshTransformed.material.name == "MaterialGoal") {
				var messageWin = "You reached the goal in " + this.secondsElapsed() + " seconds!  Press refresh for a new maze.";
				alert(messageWin);
			}
			for (var i = 0; i < this.zonesActive.length; i++) {
				var zoneActive = this.zonesActive[i];
				zoneActive.finalize();
				var zoneActiveBodyIndex = this.bodies.indexOf(zoneActive.body);
				this.bodies.splice(zoneActiveBodyIndex, 1);
			}
			this.zoneCurrent = this.zoneNext;
			this.zonesActive.length = 0;
			this.zonesActive.push(this.zoneCurrent);
			var namesOfZonesAdjacent = this.zoneCurrent.namesOfZonesAdjacent;
			for (var i = 0; i < namesOfZonesAdjacent.length; i++) {
				var nameOfZoneAdjacent = namesOfZonesAdjacent[i];
				var zoneAdjacent = this.zones[nameOfZoneAdjacent];
				this.zonesActive.push(zoneAdjacent);
			}
			var facesForZonesActive = [];
			for (var i = 0; i < this.zonesActive.length; i++) {
				var zoneActive = this.zonesActive[i];
				zoneActive.initialize();
				this.bodies.push(zoneActive.body);
				facesForZonesActive.appendElementsFrom(zoneActive.body.meshTransformed.faces);
			}
			this.spacePartitioningTreeForZonesActive = SpacePartitioningTree.fromFaces(facesForZonesActive);
			this.zoneNext = null;
		}
		for (var z = 0; z < this.zonesActive.length; z++) {
			var zoneActive = this.zonesActive[z];
			zoneActive.update();
		}
		for (var b = 0; b < this.bodies.length; b++) {
			var body = this.bodies[b];
			if (body.activity != null) {
				body.activity.perform(this, body);
			}
			if (body.actions != null) {
				for (var a = 0; a < body.actions.length; a++) {
					var action = body.actions[a];
					action.perform(this, body);
				}
				body.actions.length = 0;
			}
			var bodyConstraints = body.constraints;
			if (bodyConstraints != null) {
				body.resetMeshTransformed();
				for (var c = 0; c < bodyConstraints.length; c++) {
					var constraint = bodyConstraints[c];
					constraint.constrainBody(this, body);
				}
			}
			// todo - Get collision tree working.
			/*
			this.collisionTree.removeItemFromNodes
			(
				body,
				body.collidableData.collisionNodesOccupied
			);

			this.collisionTree.addItemWithBounds
			(
				body,
				body.meshTransformed.bounds,
				body.collidableData.collisionNodesOccupied
			);
			*/
		}
		var displayHelpers = Globals.Instance.displayHelpers;
		for (var i = 0; i < displayHelpers.length; i++) {
			var displayHelper = displayHelpers[i];
			displayHelper.drawWorld(this);
		}
		var bodyForPlayer = this.bodies[0];
		var zoneCurrentBounds = this.zoneCurrent.body.meshTransformed.bounds;
		if (zoneCurrentBounds.containsPos(bodyForPlayer.loc.pos) == false) {
			for (var z = 0; z < this.zonesActive.length; z++) {
				var zoneActive = this.zonesActive[z];
				var zoneActiveMesh = zoneActive.body.meshTransformed;
				var zoneActiveBounds = zoneActiveMesh.bounds;
				var isPlayerInZoneActive = zoneActiveBounds.containsPos(bodyForPlayer.loc.pos);
				if (isPlayerInZoneActive == true) {
					this.zoneNext = zoneActive;
					break;
				}
			}
		}
	}
}

function Zone(name, pos, namesOfZonesAdjacent, meshes) {
	this.name = name;
	this.namesOfZonesAdjacent = namesOfZonesAdjacent;
	this.body = new Body(this.name, new BodyDefn(this.name, true, // isDrawable
		false, // isMovable
		meshes[0] // hack
	), new Location(this.name, pos, new Orientation(new Coords(1, 0, 0), new Coords(0, 0, 1))));
} {
	Zone.prototype.finalize = function() {
		// todo
	}
	Zone.prototype.initialize = function() {
		this.body.resetMeshTransformed();
		this.body.meshTransformed.transform(new Transform_Locate(this.body.loc));
	}
	Zone.prototype.update = function() {
		//var displayHelper = Globals.Instance.displayHelper;
		//displayHelper.drawMesh(this.body.meshTransformed);
	}
}
// run}
main();
