CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}
app.controller("TestController", 
               ["$scope", "$window", "$timeout", 
                function($scope, $window, $timeout) {
                  
                  var Block = function (i, j) {
                    this.width = canvas.width / colCount;
                    this.height = 20;
                    this.x = j * this.width;
                    this.y = i * this.height;
                    var r = Math.ceil(Math.random() * 255);
                    var g = Math.ceil(Math.random() * 255);
                    var b = Math.ceil(Math.random() * 255);
                    this.color = 'rgba(' + r + ',' + g + ',' + b + ',' + '1)';
                    this.touches = function () {
                      return ball.x > (this.x - ball.radius) &&
                        ball.x < (this.x + this.width + ball.radius) &&
                        ball.y > (this.y - ball.radius) &&
                        ball.y < (this.y + this.height + ball.radius);
                    }
                    this.render = function () {
                      var r = Math.ceil(Math.random() * 255);
                      var g = Math.ceil(Math.random() * 255);
                      var b = Math.ceil(Math.random() * 255);
                      ctx.roundRect(this.x, this.y, this.width, this.height, 5);
                      ctx.fillStyle = this.color;
                      ctx.fill();
                      ctx.strokeStyle = 'white';
                      ctx.stroke();
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
                    this.moveRight = function() {
                      if (this.x < canvas.width - this.length) {
                        this.x += padSpeed;
                      }
                      if (this.x + this.length > canvas.width) {
                        this.x = canvas.width - this.length;
                      }
                    };

                    this.moveLeft = function () {
                      if (this.x > 0) {
                        this.x -= padSpeed;
                      }
                      if (this.x < 0) {
                        this.x = 0;
                      }
                    };
                  }

                  var Ball = function(x, y) {
                    this.x = x;
                    this.y = y;
                    this.angle = Math.random() * Math.PI / 2;
                    this.radius = 10;
                    this.xdir = Math.random() > 0.5 ? 1 : -1;
                    this.ydir = -1;
                    this.color = 'white'
                    this.render = function() {
                      ctx.beginPath();
                      ctx.fillStyle = this.color;
                      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                      ctx.fill();
                      ctx.closePath();
                    };

                    this.update = function() {
                      if (this.x < this.radius ||
                          this.x > canvas.width - this.radius|| 
                          this.y < this.radius ||
                          this.y > canvas.height - this.radius) {
                        this.angle = Math.PI / 2 - this.angle;
                        if (this.x > canvas.width - this.radius) {
                          this.xdir = -1;
                        }
                        if (this.x < this.radius) {
                          this.xdir = 1;
                        }
                        if (this.y > canvas.height - this.radius) {
                          this.ydir = -1;
                        }
                        if (this.y < this.radius) {
                          this.ydir = 1;
                        }
                      }

                      //check pad hit
                      if (this.x >= (paddle.x - this.radius)&& 
                          this.x < (paddle.x + paddle.length + this.radius) && 
                          this.y > (canvas.height - paddle.height - this.radius)) {
                        this.angle = Math.PI / 2 - this.angle;
                        this.ydir = -1;
                        this.y = canvas.height - paddle.height - this.radius;
                      } else if (ball.y > canvas.height - paddle.height) {
                        $scope.life -= 1;
                        if ($scope.life == 0) {
                          $scope.state = 'over';
                        } else {
                          $scope.state = 'lost';
                        }
                      }
                      
                      // Adjust angle
                      if (this.angle < Math.PI / 12) {
                        this.angle += Math.PI / 24;
                      } else if (this.angle > 5 * Math.PI / 12) {
                        this.angle -= Math.PI / 24;
                      }

                      this.x += ballSpeed * (Math.sin(this.angle) * this.xdir);
                      this.y += ballSpeed * (Math.cos(this.angle) * this.ydir);
                    }
                  }
                  
                  var canvas = document.getElementById('canvas');
                  var canvasWidth = $window.innerWidth - 50;
                  var canvasHeight = $window.innerHeight - 50;
                  var FPS = 30;
                  var padSpeed = 20;
                  var ballSpeed = 5;
                  var blocks = [];
                  var colCount = 8;
                  var rowCount = 4;
                  $scope.life = 3;
                  canvas.width = canvasWidth;
                  canvas.height = canvasHeight;
                  var ctx = canvas.getContext('2d');
                  $scope.state = 'start';
                  var paddle = new Paddle(80);
                  var ball = new Ball(canvas.width / 2, canvas.height / 2);
                  
                  $scope.reset = function () {
                    var blocks = [];
                    paddle = new Paddle(80);
                    ball = new Ball(canvas.width / 2, canvas.height / 2);
                    $scope.life = 3;
                  }
                  
                  
                  
                  function generateBlocks() {
                    for(var i = 0; i < rowCount; i++) {
                      for(var j = 0; j < colCount; j++) {
                        var block = new Block(i, j);
                        blocks.push(block);
                      }
                    }
                  }
                  
                  
                  
                  
                  function draw() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    paddle.render();
                    ball.render();
                    ball.update();
                    //draw blocks
                    var updatedBlocks = [];
                    for(block of blocks) {
                      if (!block.touches()) {
                        updatedBlocks.push(block);
                        block.render();
                      }
                    }
                    blocks = updatedBlocks;
                    if (blocks.length == 0) {
                      $scope.state = 'win';
                    }
                    if($scope.state == 'play') {
                      $timeout(draw, 1000 / FPS);
                    } else if ($scope.state == 'lost') {
                      $timeout($scope.proceed, 4000);
                    }
                  }
                  
                  // Continue after losting one life.
                  $scope.proceed = function() {
                    ball = new Ball(canvas.width / 2, canvas.height / 2);
                    $scope.state = 'play';
                    draw();
                  }
                  
                  $scope.play = function() {
                    generateBlocks();
                    draw();
                  }
                  
                  $scope.touch = function($event) {
                    var x = $event.clientX;
                    if (x > canvas.width / 2) {
                      paddle.moveRight();
                    } else {
                      paddle.moveLeft();
                    }
                  }

                  document.addEventListener('keydown', function (e) {
                    var key = e.which;
                    if (key == 39) {
                      paddle.moveRight();
                    } else if (key == 37) {
                      paddle.moveLeft();
                    }
                  });
                  
                  
                                
                }]
              );
