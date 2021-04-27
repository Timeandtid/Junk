        var canvas;
        var ctx;
        var height; 
        var width;
        var points = [];
        var verticies = [];
        var surface = [];
        var counter = 90;
        var viewDistance = 1800.5;
 

        $('document').ready(function() {
  width = $(window).width();
  height = $(window).height();
  $('#canvas').attr("width", width);
  $("#canvas").attr("height", height);
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  $(window).resize(function() {
    width = $(window).width();
    height = $(window).height();
    $('#canvas').attr("width", width);
    $("#canvas").attr("height", height);
  });
  $('#canvas').bind('mousewheel', function(e) {
    if (e.originalEvent.wheelDelta / 120 > 0) {
      viewDistance += 20;
    } else {
      viewDistance -= 20;
    }
  });
  init();
  window.requestAnimationFrame(mainloop);

});

function init() {
  var resolution = 2;
  points = [];
  for (var i = 0; i < 350; i += 20.0/resolution) {
    for (var o = 0; o < 360; o += 20) {
      points.push(new Point(380 + 300 * Math.log(Math.abs(Math.PI * i / 180)+0.2), width / 2 + 300 * Math.sin(Math.PI * i / 180) * Math.sin(Math.PI * o / 180), height / 2 + 300 * Math.sin(Math.PI * i / 180) * Math.cos(Math.PI * o / 180)));
    }
  }
  for (var i = 0; i < 144*resolution; i++) {
    verticies.push([i % points.length, (i + 18) % points.length]);
    if (i % 18 == 17) {
      verticies.push([i % points.length, (i - 17) % points.length]);
    } else {
      verticies.push([i % points.length, (i + 1) % points.length]);

    }
  }
  for (var i = 0; i < 168*resolution; i++) {
    if (i % 18 == 17) {
      surface.push([i, i - 17, i + 18]);
      if(i>=18){
        surface.push([i - 17, i , i - 35]);
      }
      
    } else {
      surface.push([i, i + 1 , i + 18]);
            if(i>=17){
        surface.push([i + 1, i, i - 17]);
      }
    }

  }
}

function mainloop() {
  for(var i=0;i<points.length;i++){
      points[i].calc2d(width / 2, height / 2);
  }
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
 
  for (var i = 0; i < surface.length; ++i) {
    points[surface[i][0]].drawSurface(points[surface[i][1]], points[surface[i][2]]);
  }
  for (var i = 0; i < points.length; i++) {
    points[i].rotate(380, width / 2, height / 2, counter, 360 * Math.sin(Math.PI * counter / 360), counter / 10);
  }
  counter += 1;
  viewDistance += 20*Math.sin(counter/100);
  window.requestAnimationFrame(mainloop);
}
var Point = function(x1, x2, x3) {
  this.x1 = x1;
  this.x2 = x2;
  this.x3 = x3;
  this.x1o = x1;
  this.x2o = x2;
  this.x3o = x3;
  this.x = 0;
  this.y = 0;
  this.calc2d = function(vx, vy){
     this.x = this.x2 + (vx - this.x2) * ((1 - 1.0 / ((this.x1 - viewDistance) / 1000)));
    this.y = this.x3 + (vy - this.x3) * ((1 - 1.0 / ((this.x1 - viewDistance) / 1000)));
  };
  this.draw = function() {

    ctx.arc(this.x, this.y, 2 / Math.pow((this.x1 - viewDistance) / 1400, 1), 0, Math.PI * 2);

  };
  this.drawLine = function(obj2) {
    if (this.x == -1 || obj2.x == -1) {
      return;
    }
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(obj2.x, obj2.y);
  };
  this.drawSurface = function(obj2, obj3) {
    var n = Kreuzprodukt(obj2.x1 - this.x1, obj2.x2 - this.x2, obj2.x3 - this.x3, obj3.x1 - this.x1, obj3.x2 - this.x2, obj3.x3 - this.x3);
    var nl = [10, -2, 3];
    var nv = [1, 0, 0];
    var bn = Math.sqrt(Math.pow(n[0], 2) + Math.pow(n[1], 2) + Math.pow(n[2], 2));
    var beta = Math.acos((n[0] * nv[0] + n[1] * nv[1] + n[2] * nv[2]) / (Math.sqrt(1) * bn ));
    if(beta > Math.PI/2){return;}
    var alpha = Math.acos((n[0] * nl[0] + n[1] * nl[1] + n[2] * nl[2]) / (Math.sqrt(Math.pow(nl[0], 2) + Math.pow(nl[1], 2) + Math.pow(nl[2], 2)) * bn ));
    if(alpha > Math.PI/2){return;}
        ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(obj2.x, obj2.y);
    ctx.lineTo(obj3.x, obj3.y);
    ctx.moveTo(this.x, this.y);
    ctx.fillStyle = "rgb("+(parseInt(255-alpha*162))+","+(parseInt(255-alpha*162))+","+(parseInt(255-alpha*162))+")";
    ctx.fill();
  }
  this.rotate = function(m1, m2, m3, v1, v2, v3) {
    this.x1 = this.x1o;
    this.x2 = this.x2o;
    this.x3 = this.x3o;
    var zw = this.x2;
    this.x2 = m2 + xRot(this.x2 - m2, this.x3o - m3, v2);
    this.x3 = m3 + yRot(zw - m2, this.x3 - m3, v2);
    zw = this.x1;
    this.x1 = m1 + xRot(this.x1 - m1, this.x3 - m3, v1);
    this.x3 = m3 + yRot(zw - m1, this.x3 - m3, v1);
    zw = this.x1;
    this.x1 = m1 + xRot(this.x1 - m1, this.x2 - m2, v3);
    this.x2 = m2 + yRot(zw - m1, this.x2 - m2, v3);
  }
}

function xRot(dx, dy, deg) {
  deg = 3.14 * deg / 180;
  return dx * Math.cos(deg) - dy * Math.sin(deg);
}

function yRot(dx, dy, deg) {
  deg = 3.14 * deg / 180;
  return dx * Math.sin(deg) + dy * Math.cos(deg);
}

function Kreuzprodukt(x1, x2, x3, z1, z2, z3) {
  return [x2 * z3 - x3 * z2, x3 * z1 - x1 * z3, x1 * z2 - x2 * z1];
}
