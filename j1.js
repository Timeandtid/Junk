       
/* Returns A, B, C and D vertices of an element
---------------------------------------------------------------- */

function computeVertexData (elem) {
    var w = elem.offsetWidth,
        h = elem.offsetHeight,
        v = {
            a: { x: -w / 2, y: -h / 2, z: 0 },
            b: { x:  w / 2, y: -h / 2, z: 0 },
            c: { x:  w / 2, y:  h / 2, z: 0 },
            d: { x: -w / 2, y:  h / 2, z: 0 }
        },
        transform;

    while (elem.nodeType === 1) {
        transform = getTransform(elem);
        v.a = addVectors(rotateVector(v.a, transform.rotate), transform.translate);
        v.b = addVectors(rotateVector(v.b, transform.rotate), transform.translate);
        v.c = addVectors(rotateVector(v.c, transform.rotate), transform.translate);
        v.d = addVectors(rotateVector(v.d, transform.rotate), transform.translate);
        elem = elem.parentNode;
    }
    return v;
}


/* Returns the rotation and translation components of an element
---------------------------------------------------------------- */

function getTransform (elem) {
    var computedStyle = getComputedStyle(elem, null),
        val = computedStyle.transform ||
            computedStyle.webkitTransform ||
            computedStyle.MozTransform ||
            computedStyle.msTransform,
        matrix = parseMatrix(val),
        rotateY = Math.asin(-matrix.m13),
        rotateX, 
        rotateZ;

        rotateX = Math.atan2(matrix.m23, matrix.m33);
        rotateZ = Math.atan2(matrix.m12, matrix.m11);

    /*if (Math.cos(rotateY) !== 0) {
        rotateX = Math.atan2(matrix.m23, matrix.m33);
        rotateZ = Math.atan2(matrix.m12, matrix.m11);
    } else {
        rotateX = Math.atan2(-matrix.m31, matrix.m22);
        rotateZ = 0;
    }*/

    return {
        transformStyle: val,
        matrix: matrix,
        rotate: {
            x: rotateX,
            y: rotateY,
            z: rotateZ
        },
        translate: {
            x: matrix.m41,
            y: matrix.m42,
            z: matrix.m43
        }
    };
}


/* Parses a matrix string and returns a 4x4 matrix
---------------------------------------------------------------- */

function parseMatrix (matrixString) {
    var c = matrixString.split(/\s*[(),]\s*/).slice(1,-1),
        matrix;

    if (c.length === 6) {
        // 'matrix()' (3x2)
        matrix = {
            m11: +c[0], m21: +c[2], m31: 0, m41: +c[4],
            m12: +c[1], m22: +c[3], m32: 0, m42: +c[5],
            m13: 0,     m23: 0,     m33: 1, m43: 0,
            m14: 0,     m24: 0,     m34: 0, m44: 1
        };
    } else if (c.length === 16) {
        // matrix3d() (4x4)
        matrix = {
            m11: +c[0], m21: +c[4], m31: +c[8], m41: +c[12],
            m12: +c[1], m22: +c[5], m32: +c[9], m42: +c[13],
            m13: +c[2], m23: +c[6], m33: +c[10], m43: +c[14],
            m14: +c[3], m24: +c[7], m34: +c[11], m44: +c[15]
        };

    } else {
        // handle 'none' or invalid values.
        matrix = {
            m11: 1, m21: 0, m31: 0, m41: 0,
            m12: 0, m22: 1, m32: 0, m42: 0,
            m13: 0, m23: 0, m33: 1, m43: 0,
            m14: 0, m24: 0, m34: 0, m44: 1
        };
    }
    return matrix;
}

/* Adds vector v2 to vector v1
---------------------------------------------------------------- */

function addVectors (v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        z: v1.z + v2.z
    };
}


/* Rotates vector v1 around vector v2
---------------------------------------------------------------- */

function rotateVector (v1, v2) {
    var x1 = v1.x,
        y1 = v1.y,
        z1 = v1.z,
        angleX = v2.x / 2,
        angleY = v2.y / 2,
        angleZ = v2.z / 2,

        cr = Math.cos(angleX),
        cp = Math.cos(angleY),
        cy = Math.cos(angleZ),
        sr = Math.sin(angleX),
        sp = Math.sin(angleY),
        sy = Math.sin(angleZ),

        w = cr * cp * cy + -sr * sp * -sy,
        x = sr * cp * cy - -cr * sp * -sy,
        y = cr * sp * cy + sr * cp * sy,
        z = cr * cp * sy - -sr * sp * -cy,

        m0 = 1 - 2 * ( y * y + z * z ),
        m1 = 2 * (x * y + z * w),
        m2 = 2 * (x * z - y * w),

        m4 = 2 * ( x * y - z * w ),
        m5 = 1 - 2 * ( x * x + z * z ),
        m6 = 2 * (z * y + x * w ),

        m8 = 2 * ( x * z + y * w ),
        m9 = 2 * ( y * z - x * w ),
        m10 = 1 - 2 * ( x * x + y * y );

    return {
        x: x1 * m0 + y1 * m4 + z1 * m8,
        y: x1 * m1 + y1 * m5 + z1 * m9,
        z: x1 * m2 + y1 * m6 + z1 * m10
    };
}

/* Vector functions
-------------------------------------------------- */

var Vect3 = {
    create: function(x, y, z) {
        return {x: x || 0, y: y || 0, z: z || 0};
    },
    add: function(v1, v2) {
        return {x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z};
    },
    sub: function(v1, v2) {
        return {x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z};
    },
    mul: function(v1, v2) {
        return {x: v1.x * v2.x, y: v1.y * v2.y, z: v1.z * v2.z};
    },
    div: function(v1, v2) {
        return {x: v1.x / v2.x, y: v1.y / v2.y, z: v1.z / v2.z};
    },
    muls: function(v, s) {
        return {x: v.x * s, y: v.y * s, z: v.z * s};
    },
    divs: function(v, s) {
        return {x: v.x / s, y: v.y / s, z: v.z / s};
    },
    len: function(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    },
    dot: function(v1, v2) {
        return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
    },
    cross: function(v1, v2) {
        return {x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x};
    },
    normalize: function(v) {
        return Vect3.divs(v, Vect3.len(v));
    },
    ang: function(v1, v2) {
        return Math.acos(Vect3.dot(v1, v2) / (Vect3.len(v1) * Vect3.len(v2)));
    },
    copy: function(v) {
        return {x: v.x, y: v.y, z: v.z};
    },
    equal: function(v1,v2) {
        return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
    },
    rotate: function(v1, v2) {
        var x1 = v1.x,
            y1 = v1.y,
            z1 = v1.z,
            angleX = v2.x / 2,
            angleY = v2.y / 2,
            angleZ = v2.z / 2,

            cr = Math.cos(angleX),
            cp = Math.cos(angleY),
            cy = Math.cos(angleZ),
            sr = Math.sin(angleX),
            sp = Math.sin(angleY),
            sy = Math.sin(angleZ),

            w = cr * cp * cy + -sr * sp * sy,
            x = sr * cp * cy - -cr * sp * sy,
            y = cr * sp * cy + sr * cp * -sy,
            z = cr * cp * sy - -sr * sp * cy,

            m0 = 1 - 2 * ( y * y + z * z ),
            m1 = 2 * (x * y + z * w),
            m2 = 2 * (x * z - y * w),

            m4 = 2 * ( x * y - z * w ),
            m5 = 1 - 2 * ( x * x + z * z ),
            m6 = 2 * (z * y + x * w ),

            m8 = 2 * ( x * z + y * w ),
            m9 = 2 * ( y * z - x * w ),
            m10 = 1 - 2 * ( x * x + y * y );

        return {
            x: x1 * m0 + y1 * m4 + z1 * m8,
            y: x1 * m1 + y1 * m5 + z1 * m9,
            z: x1 * m2 + y1 * m6 + z1 * m10
        };
    }
};

 // shim requestAnimationFrame()
        window.requestAnimationFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(f) { setTimeout(f, 1000/60); };

        // shim performance.now()
        window.performance = 
            window.performance ||
            { now: function() { return +new Date(); } };

        // Determine the vendor prefixed transform property
        var transformProp = ["transform", "webkitTransform", "MozTransform", "msTransform"].filter(function (prop) {
            return prop in document.documentElement.style;
        })[0];


        // Default positions
        var angleX = -40, angleY = 30;
        var speedX = 0, speedY = 0;
        var lightX = 100, lightY = -200;
        var nextFaceIndex = 0;

        // Define the light source
        var light = document.querySelector(".light");

        // Grab the x-wing element
        var xWing = document.querySelector(".scene");

        // Precalculate the normals and centres for each face
        var faces = [].slice.call(xWing.querySelectorAll(".face")).map(function (face){
            var verticies = computeVertexData(face);
            return {
                verticies: verticies,
                normal: Vect3.normalize(Vect3.cross(Vect3.sub(verticies.b, verticies.a), Vect3.sub(verticies.c, verticies.a))),
                center: Vect3.divs(Vect3.sub(verticies.c, verticies.a), 2),
                elem: face 
            };
        });

        /* Render
        ---------------------------------------------------------------- */

        function render (startTime) {
            var face, direction, amount,
                faceNum = 0, faceCount = faces.length,
                xwingTransform = getTransform(xWing),
                lightTransform = getTransform(light),
                lightPosition = Vect3.rotate(lightTransform.translate, Vect3.muls(xwingTransform.rotate, -1));

            while (++faceNum < faceCount && performance.now() - startTime <= 5) {
                face = faces[nextFaceIndex];
                direction = Vect3.normalize(Vect3.sub(lightPosition, face.center));
                amount = 1 - Math.max(0, Vect3.dot(face.normal, direction)).toFixed(2);
                if (face.light != amount) {
                    face.light = amount;
                    face.elem.style.backgroundImage = "linear-gradient(rgba(0,0,0," + amount + "),rgba(0,0,0," + amount + "))";
                }
                nextFaceIndex = (nextFaceIndex + 1) % faceCount;
            }
        }


        /* Loop
        ---------------------------------------------------------------- */

        function loop(time) {
            var s = performance.now();
            requestAnimationFrame(loop);
            xWing.style[transformProp] = "rotateY(" + (angleX / 100).toFixed(4) + "rad) rotateX(" + (-angleY / 100).toFixed(4) + "rad)";
            light.style[transformProp] = "translateY(" + lightY.toFixed(4) + "px) translateX(" + lightX.toFixed(4) + "px) translateZ(250px) scale(.65)";
            speedX /= 1.1;
            speedY /= 1.1;
            angleX += speedX;
            angleY += speedY;
            render(s);
        }


        function startDrag(e) {
            var originX, originY,
                dragHandler = function(e) {
                    var x, y;
                    if (e.targetTouches) {
                        x = e.targetTouches[0].pageX;
                        y = e.targetTouches[0].pageY;
                    } else {
                        x = e.pageX;
                        y = e.pageY;
                    }
                    if (originX || originY) {
                        if (e.altKey) {
                            lightX += x - originX;
                            lightY += y - originY;
                        } else {
                            speedX = x - originX;
                            speedY = y - originY;
                        }
                    }
                    originX = x;
                    originY = y;
                },
                endDrag = function () {
                    document.removeEventListener("touchmove", dragHandler);
                    document.removeEventListener("mousemove", dragHandler);
                    document.removeEventListener("touchend", endDrag);
                    document.removeEventListener("mouseup", endDrag);
                };
            document.addEventListener("touchmove", dragHandler);
            document.addEventListener("mousemove", dragHandler);
            document.addEventListener("mouseup", endDrag);
            document.addEventListener("touchend", endDrag);
            e.preventDefault();
        }

        document.addEventListener("touchstart", startDrag);
        document.addEventListener("mousedown", startDrag);

        loop();
        
