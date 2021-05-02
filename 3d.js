  var sketchProc = function(processingInstance) {
     with (processingInstance) {
        size(400, 400); 
        frameRate(0);
        
        // ProgramCodeGoesHere
 var Vertex = function(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
};
Vertex.prototype.rotateZ = function(t){
    var x = this.x * cos(t) - this.y * sin(t);
    var y = this.y * cos(t) + this.x * sin(t);
    this.y = y;
    this.x = x;
    
 
};
Vertex.prototype.rotateX = function(t){
    var y = this.y * cos(t) - this.z * sin(t);
    var z = this.z * cos(t) + this.y * sin(t);
    this.y = y;
    this.z = z;
};
Vertex.prototype.rotateY = function(t){
    var x = this.x * cos(t) - this.z * sin(t);
    var z = this.z * cos(t) + this.x * sin(t);
    this.x = x;
    this.z = z;
};
Vertex.prototype.rotate = function(rx,ry,rz){
    this.rotateX(rx);
    this.rotateY(ry);
    this.rotateZ(rz);
};
Vertex.prototype.translate = function(x,y){
    this.x += x;
    this.y += y;
};
Vertex.prototype.sum = function(vertex){
    var x = vertex.x + this.x;
    var y = vertex.y + this.y;
    var z = vertex.z + this.z;
    return new Vertex(x,y,z);
};
Vertex.prototype.get = function(){
    return new Vertex(this.x, this.y, this.z);
};
Vertex.prototype.dist = function(vertex){
    return sqrt(Math.pow(vertex.x - this.x, 2) + 
        Math.pow(vertex.y - this.y, 2) + 
        Math.pow(vertex.z - this.z, 2));
};

var Vertex2d = function(x,y){
    this.x = x;
    this.y = y;
};

var Face = function(vertices, color){
    this.vertices = vertices;
    this.color = color;
};

var Camera = function(x,y,z,rx,ry,rz){
    this.x = x;
    this.y = y;
    this.z = z;
    this.rx = rx;
    this.ry = ry;
    this.rz = rz;
};

var Shape = function(vertices, faces, color){
    this.vertices = vertices;
    this.faces = faces;
    this.color = color;
};
Shape.prototype.rotate = function(x,y,z){
    for(var i = 0; i < this.vertices.length; i++){
        this.vertices[i].rotateX(x);
        this.vertices[i].rotateY(y);
        this.vertices[i].rotateZ(z);
    }
};
Shape.prototype.translate = function(x,y,z){
    for(var i = 0; i < this.vertices.length; i++){
        this.vertices[i].x += x;
        this.vertices[i].y += y;
        this.vertices[i].z += z;
    }
};

var Cube = function(center, width, color){
    var w = width/2;
    this.center = center;
    this.width = width;
    var vertices = [
        new Vertex(center.x+w, center.y+w, center.z+w),
        new Vertex(center.x+w, center.y+w, center.z-w),
        new Vertex(center.x+w, center.y-w, center.z+w),
        new Vertex(center.x+w, center.y-w, center.z-w),
        new Vertex(center.x-w, center.y+w, center.z+w),
        new Vertex(center.x-w, center.y+w, center.z-w),
        new Vertex(center.x-w, center.y-w, center.z+w),
        new Vertex(center.x-w, center.y-w, center.z-w)
    ];
    var faces = [
        new Face([vertices[0], vertices[1],
            vertices[3],vertices[2]], color),
        new Face([vertices[1], vertices[5],
            vertices[7],vertices[3]], color),
        new Face([vertices[4], vertices[0],
            vertices[2],vertices[6]], color),
        new Face([vertices[5], vertices[4],
            vertices[6], vertices[7]], color),
        new Face([vertices[0], vertices[4],
            vertices[5], vertices[1]], color),
        new Face([vertices[2], vertices[3],
            vertices[7], vertices[6]], color),
    ];
    Shape.call(this, vertices, faces);
};
Cube.prototype = Shape.prototype;

var Cuboid = function(center, w, h, d, color){
    this.center = center;
    this.width = width;
    
    w /= 2;
    h /= 2;
    d /= 2;
    var vertices = [
        new Vertex(center.x+w, center.y+h, center.z+d),
        new Vertex(center.x+w, center.y+h, center.z-d),
        new Vertex(center.x+w, center.y-h, center.z+d),
        new Vertex(center.x+w, center.y-h, center.z-d),
        new Vertex(center.x-w, center.y+h, center.z+d),
        new Vertex(center.x-w, center.y+h, center.z-d),
        new Vertex(center.x-w, center.y-h, center.z+d),
        new Vertex(center.x-w, center.y-h, center.z-d)
    ];
    var faces = [
        new Face([vertices[0], vertices[1],
            vertices[3],vertices[2]], color),
        new Face([vertices[1], vertices[5],
            vertices[7],vertices[3]], color),
        new Face([vertices[4], vertices[0],
            vertices[2],vertices[6]], color),
        new Face([vertices[5], vertices[4],
            vertices[6], vertices[7]], color),
        new Face([vertices[0], vertices[4],
            vertices[5], vertices[1]], color),
        new Face([vertices[2], vertices[3],
            vertices[7], vertices[6]], color),
    ];
    Shape.call(this, vertices, faces);
};
Cuboid.prototype = Shape.prototype;

var Scene = function(perspective, camera){
    this.perspective = perspective;
    this.camera = camera;
    this.objects = [];
    this.allFaces = [];
};
Scene.prototype.addObject = function(object){
    this.allFaces.push.apply(object.faces);
    this.objects.push(object);
    for(var i = 0; i < object.faces.length; i++){
        this.allFaces.push(object.faces[i]);
    }
};
Scene.prototype.clear = function(){
    this.objects = [];
};
Scene.prototype.render = function(){
    
    var camera = this.camera;
    
    this.allFaces.sort(function(a,b){
        var a = a.vertices;
        var b = b.vertices;
        
        var highestA = a[0].dist(camera);
        var highestB = b[0].dist(camera);
        var averageA = 0;
        var averageB = 0;
        
        for(var i = 0; i < a.length; i++){
            var d = a[i].dist(camera);
            if(d > highestA){
                highestA = d;
            }
            averageA += d;
        }
        averageA /= a.length;
        
        for(var i = 0; i < b.length; i++){
            var d = b[i].dist(camera);
            if(d > highestB){
                highestB = d;
            }
            averageB += d;
        }
        averageB /= b.length;
    
        if(highestA !== highestB){
            return highestB - highestA;
        }else{
            return averageB - averageA;
        }
    });
    
    for(var l = 0; l < this.allFaces.length; l++){
        var allVerts = this.allFaces[l].vertices;
        var coords3d = [];
        
        //
        for(var i = 0; i < allVerts.length; i++){
            var copy = allVerts[i].get();
            //copy.rotate(this.camera.rx, this.camera.ry, this.camera.rz);
            copy.translate(this.camera.x, this.camera.y);
            coords3d.push(copy);
        }
        
        //calc 2d coordinates for face
        var coords2d = this.projectPoints(coords3d, this.perspective, this.camera);
        
        //draw the face
        fill(this.allFaces[l].color);
        beginShape();
        for(var i = 0; i < coords2d.length; i++){
            if(coords3d[i].z > this.camera.z){
                continue;
            }
            vertex(coords2d[i].x, coords2d[i].y);
        }
        vertex(coords2d[0].x, coords2d[0].y);
        endShape();
    }
};
Scene.prototype.projectPoint = function(vertex, perspective, camera){
    if(perspective){
        var cam = camera;
        var d = vertex.dist(cam);
        return new Vertex2d((vertex.x*(1000/d)), (vertex.y*(1000/d)));
    }else {
        return new Vertex2d(vertex.x, vertex.y);
    }
};
Scene.prototype.projectPoints = function(vertices, perspective, camera){
    var newPoints = [];
    for(var i = 0; i < vertices.length; i++){
        newPoints.push(this.projectPoint(vertices[i], perspective, camera));
    }
    return newPoints;
};
Scene.prototype.distToVert = function(vertex){
    return vertex.dist(this.camera);
};

var mouseMove = (function(){
    var lastX = mouseX;
    var lastY = mouseY;
    return {
        get x(){
            var moveX = mouseX-lastX;
            lastX = mouseX;
            return moveX;
        },
        get y(){
            var moveY = mouseY-lastY;
            lastY = mouseY;
            return moveY;
        }
    };
}());

    }};

    // Get the canvas that Processing-js will use
    var canvas = document.getElementById("mycanvas"); 
  
    var processingInstance = new Processing(canvas, sketchProc); 
