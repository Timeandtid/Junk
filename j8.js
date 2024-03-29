var DAMPING = 0.9999;
      var GRAVITY = 0.3;

      function Particle(x, y) {
        this.x = this.oldX = x;
        this.y = this.oldY = y;
      }

      Particle.prototype.integrate = function() {
        var velocity = this.getVelocity();
        this.oldX = this.x;
        this.oldY = this.y;
        this.x += velocity.x * DAMPING;
        this.y += velocity.y * DAMPING;
      };

      Particle.prototype.getVelocity = function() {
        return {
          x: this.x - this.oldX,
          y: this.y - this.oldY
        };
      };

      Particle.prototype.move = function(x, y) {
        this.x += x;
        this.y += y;
      };

      Particle.prototype.bounce = function() {
        if (this.y > height) {
          var velocity = this.getVelocity();
          this.oldY = height;
          this.y = this.oldY - velocity.y * 0.3;
        }
      };

      Particle.prototype.draw = function() {
        ctx.strokeStyle = '#0099ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.oldX, this.oldY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
      };

      var display = document.getElementById('display');
      var ctx = display.getContext('2d');
      var drops = [];
      var width = display.width = window.innerWidth;
      var height = display.height = window.innerHeight;

      ctx.globalCompositeOperation = 'overlay';
      requestAnimationFrame(frame);

      function frame() {
        requestAnimationFrame(frame);
        ctx.clearRect(0, 0, width, height);
        for (var j = 0; j < 5; j++) {
          if (drops.length < 1000) {
            var drop = new Particle(width * 0.5, height);
            drop.move(Math.random() * 4 - 2, Math.random() * -2 - 15);
            drops.push(drop);
          }
        }
        for (var i = 0; i < drops.length; i++) {
          drops[i].move(0, GRAVITY);
          drops[i].integrate();
          drops[i].bounce();
          drops[i].draw();
        }
      }
