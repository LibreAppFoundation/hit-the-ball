window.onload = function() {
    function generateRandomColor() {
      var r = Math.ceil(Math.random() * 255);
      var g = Math.ceil(Math.random() * 255);
      var b = Math.ceil(Math.random() * 255);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + '1)';
    }

    var Block = function (i, j) {
      this.width = (canvas.width - 2 * sideOffset - colCount * blockPadding)/ colCount;
      this.height = 20;
      this.x = j * this.width + sideOffset + j * blockPadding;
      this.y = i * this.height + topOffset + i * blockPadding;
      this.color = generateRandomColor();
      this.active = true;
      this.update = function (ball) {
        if (ball.x > (this.x - ball.radius) &&
          ball.x < (this.x + this.width + ball.radius) &&
          ball.y > (this.y - ball.radius) &&
          ball.y < (this.y + this.height + ball.radius)) {
          if (Math.random() > 0.5) dy *= -1;
          this.active = false;
          score += Math.ceil(Math.random() * 3);
        }
      }
      this.render = function () {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height, 5);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.closePath();
      }
    }

    var Paddle = function(length) {
      this.length = length;
      this.height = 10;
      this.x = (canvas.width - length) / 2;
      this.y = canvas.height - this.height;
      this.color = 'brown';
      this.render = function() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.length, this.height);
      };
      this.update = function () {
        if (rightPress && this.x < canvas.width - this.length) {
          this.x += padSpeed;
        } else if (leftPress && this.x > 0) {
          this.x -= padSpeed;
        }
      }
    }

    var Ball = function(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 10;
      this.color = 'white'
      this.render = function() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      };

      this.update = function() {
        var verMove = dy * ballSpeed;
        var horMove = dx * ballSpeed;
        if (this.x + horMove < this.radius || 
            this.x + horMove > canvasWidth - this.radius) {
          dx = -dx;
          horMove *= -1;
        }
        
        if (this.y + verMove < this.radius) {
          dy = -dy;
          verMove *= -1;
        }
        
        // Check ball hit or miss
        if (this.y + verMove > canvasHeight - paddle.height - this.radius &&
            this.x > paddle.x && this.x < paddle.x + paddle.length) {
          dy = -dy;
          verMove = canvasHeight - paddle.height -this.radius - this.y;
        }
        
        if (this.y + verMove > canvasHeight - this.radius) {
          return true;
        }

        this.x += horMove;
        this.y += verMove;
        return false;
      }
    }

    var canvas = document.getElementById('canvas');
    var canvasWidth = window.innerWidth - 50;
    var canvasHeight = window.innerHeight - 50;
    if (canvasWidth > canvasHeight) {
      canvasWidth = canvasHeight;
    }
    var FPS = 30;
    var padSpeed = 5;
    var ballSpeed = 2;
    var blocks = [];
    var colCount = 6;
    var rowCount = 5;
    var life = 3;
    var score = 0;
    var topOffset = 40;
    var sideOffset = 20;
    var blockPadding = 5;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    var ctx = canvas.getContext('2d');
    var paddle = new Paddle(80);
    var ball = new Ball(canvas.width / 2, canvas.height / 2);
    var leftPress = false;
    var rightPress = false;
    var dx = (Math.random() > 0.5) ? 1 : -1;
    var dy = -1;

    var reset = function () {
      var blocks = [];
      paddle = new Paddle(80);
      ball = new Ball(canvas.width / 2, canvas.height / 2);
      life = 3;
      score = 0;
      play();
    }

    function generateBlocks() {
      for(var i = 0; i < rowCount; i++) {
        for(var j = 0; j < colCount; j++) {
          var block = new Block(i, j);
          blocks.push(block);
        }
      }
    };

    function drawText(x, y, text, font, color = 'white', align = 'center') {
      ctx.beginPath();
      ctx.textAlign = align;
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.closePath();
    }

    function drawBtn(x, y, width, height, text, color = 'white') {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.fillStyle = color;
      ctx.fill();
      drawText(x + width / 2, y + height / 2 + 10, text, '32px sans-serif', '#3cb371', 'center');
      ctx.closePath();
    }

    function drawImage(x, y, path, width, height) {
      var img = new Image();
      img.onload = function() {
        ctx.drawImage(img, x, y, width, height);
      }
      img. src = path;
    }

    function drawScore() {
      drawText(sideOffset, 20, "Score : " + score, "18px sans-serif", "white", "left");
    }

    function drawLife() {
      drawText(canvasWidth - sideOffset, 20, "Life : " + life, "18px sans-serif", "white", "right");
    }

    function welcome() {
      screen = 'welcome';
      drawText(canvasWidth / 2, canvasHeight / 4, "Hit the Ball", "32px sans-serif");
      drawBtn(canvasWidth / 4, canvasHeight / 2, canvasWidth / 2, 40, "PLAY");
    }

    function lost() {
      screen = 'lost';
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawText(canvasWidth / 2, canvasHeight / 7, "Game Over", "bold 32px sans-serif");
      drawText(canvasWidth / 2, 2 * canvasHeight / 7, "You scored " + score + " points", "bold 12px sans-serif");
      drawImage(canvasWidth / 3, 3 * canvasHeight / 7, "./img/cry.png", canvasWidth / 3, canvasWidth / 3);
      drawBtn(canvasWidth / 6, 4 * canvasHeight / 5, 2 * canvasWidth / 3, 40, "TRY AGAIN");
    }

    function win() {
      screen = 'win';
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawText(canvasWidth / 2, canvasHeight / 7, "AWESOME", "bold 32px sans-serif");
      drawText(canvasWidth / 2, 2 * canvasHeight / 7, "You scored " + score + " points", "bold 12px sans-serif");
      drawImage(canvasWidth / 3, 3 * canvasHeight / 7, "./img/win.png", canvasWidth / 3, canvasWidth / 3);
      drawBtn(canvasWidth / 6, 4 * canvasHeight / 5, 2 * canvasWidth / 3, 40, "TRY AGAIN");
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      paddle.render();
      ball.render();
      drawScore();
      drawLife();
      var done = true;
      //draw blocks
      for(block of blocks) {
        if (block.active) {
          block.render();
          block.update(ball);
          done = false;
        }
      }
      paddle.update();
      
      var miss = ball.update();
      if (miss) {
        life -= 1;
        if (life == 0) {
          lost();
        } else {
          ball = new Ball(canvasWidth / 2, canvasHeight / 2);
          var message1 = "You lost one chance.";
          var message2 =  life + " chance(s) are remaining";
          drawText(canvasWidth / 2, canvasHeight / 2, message1, "18px sans-serif", "red");
          drawText(canvasWidth / 2, canvasHeight / 2 + 24, message2, "18px sans-serif", "red");
          setTimeout(function() {
            requestAnimationFrame(draw);
          }, 3000);
        }
      }
      else if (done) {
        win();
      } else {
        requestAnimationFrame(draw);
      }
    };

    function play() {
      screen = 'play';
      generateBlocks();
      draw();
    };

    function keydownEvent(e) {
      var key = e.which;
      if (key == 39) {
        rightPress = true;
      } else if (key == 37) {
        leftPress = true;
      }
    }

    function keyupEvent(e) {
      var key = e.which;
      if (key == 39) {
        rightPress = false;
      } else if (key == 37) {
        leftPress = false;
      }
    }

    function touchStartEvent(e) {
      var touches = e.touches;
      for (touch of touches) {
        var x = touch.clientX - 25;
        var y = touch.clientY;
        if ( screen == 'welcome') {
          if (x > canvasWidth / 4 && 
               x < 3 * canvasWidth / 4 &&
               y > canvasHeight / 2 &&
               y < canvasHeight + 40) {
               play();
             }
          } else if (screen == 'play') {
            if (x > canvasWidth / 2) {
              rightPress = true;
            } else {
              leftPress = true;
            }
          } else if (screen == 'win' || screen == 'lost') {
            if (x > canvasWidth / 6 && 
                 x < (canvasWidth / 6 + 2 * canvasWidth / 3) &&
                 y > 4 * canvasHeight / 5 &&
                 y < 4 * canvasHeight / 5 + 40) {
                 reset();
            }
          }
       }
    }

    function touchEndEvent(e) {
      rightPress = false;
      leftPress = false;
    }

    document.addEventListener('keydown', keydownEvent);
    document.addEventListener('keyup', keyupEvent);
    document.addEventListener('touchstart', touchStartEvent);
    document.addEventListener('touchend', touchEndEvent);

    welcome();
    // win();
    // lost();
    // play();
}
