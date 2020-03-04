var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
camera = {
    "x" : window.innerWidth / 2,
    "y" : window.innerHeight / 2
}
objs = new Object();

init();
update();

function init() {
    loadJSON("levels/01.json", jsonToLevel);

    moveableCam();
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false );
}

function update() {
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

    draw();
    collision();
    control();

    requestAnimationFrame( update );
}

// updates
function draw() {
    for (var group in objs) {
        if (objs.hasOwnProperty(group)) {
            for (var num = 0; num < objs[group].length; num++) {
                ctx.fillStyle = objs[group][num].color;
                ctx.fillRect(objs[group][num].position.x + camera.x,
                    objs[group][num].position.y + camera.y,
                    objs[group][num].size.width,
                    objs[group][num].size.height);
                    ctx.beginPath();
                    ctx.strokeStyle = 'blue';
                    ctx.moveTo(camera.x + objs[group][num].position.x, camera.y + objs[group][num].position.y);
                    ctx.lineTo(camera.x + objs[group][num].position.x + objs[group][num].viewDistance * Math.cos(objs[group][num].angle * Math.PI / 180),
                                camera.y + objs[group][num].position.y + objs[group][num].viewDistance * Math.sin(objs[group][num].angle * Math.PI / 180));
                    ctx.stroke();
            }
        }
    }
}

function collision() {
    if (typeof objs.entities != "undefined") {
        for (var i = 0; i < objs.entities.length; i++) {
            // reset all collision to false
            objs.entities[i].collision = "null";
            var x1 = objs.entities[i].position.x;
            var y1 = objs.entities[i].position.y;
            var x2 = objs.entities[i].position.x + objs.entities[i].viewDistance * Math.cos(objs.entities[i].angle * Math.PI / 180);
            var y2 = objs.entities[i].position.y + objs.entities[i].viewDistance * Math.sin(objs.entities[i].angle * Math.PI / 180);
            for (var group in objs) {
                if (objs.hasOwnProperty(group)) {
                    if (group != "entities") {
                        for (var j = 0; j < objs[group].length; j++) {
                            if (lineIntersect(x1,y1, x2,y2,
                                                objs[group][j].position.x,
                                                objs[group][j].position.y,
                                                objs[group][j].position.x + objs[group][j].size.width,
                                                objs[group][j].position.y) ||
                                lineIntersect(x1,y1, x2,y2,
                                                objs[group][j].position.x,
                                                objs[group][j].position.y,
                                                objs[group][j].position.x,
                                                objs[group][j].position.y + objs[group][j].size.height) ||
                                lineIntersect(x1,y1, x2,y2,
                                                objs[group][j].position.x + objs[group][j].size.width,
                                                objs[group][j].position.y,
                                                objs[group][j].position.x + objs[group][j].size.width,
                                                objs[group][j].position.y + objs[group][j].size.height) ||
                                lineIntersect(x1,y1, x2,y2,
                                                objs[group][j].position.x,
                                                objs[group][j].position.y + objs[group][j].size.height,
                                                objs[group][j].position.x + objs[group][j].size.width,
                                                objs[group][j].position.y + objs[group][j].size.height)) {
                                objs.entities[i].collision = group;
                                console.log(group);
                            }
                        }
                    }
                }
            }
        }
    }
}

function control() {
    if (typeof objs.entities != "undefined") {
        for (var i = 0; i < objs.entities.length; i++) {
            // fix negative angles
            while (objs.entities[i].angle < 0) {
                objs.entities[i].angle += 360;
            }
            // fix the coordinates so they are between 0 and 360
            while ( Math.abs(objs.entities[i].angle) > 360) {
                objs.entities[i].angle = objs.entities[i].angle - Math.sign(objs.entities[i].angle) * 360;
            }
            var forward = objs.entities[i].genes[ Math.round(objs.entities[i].angle) ][objs.entities[i].collision].forward;
            var side = objs.entities[i].genes[ Math.round(objs.entities[i].angle) ][objs.entities[i].collision].side;
            objs.entities[i].angle += side;
            objs.entities[i].position.x += forward * Math.cos(objs.entities[i].angle * Math.PI / 180);
            objs.entities[i].position.y += forward * Math.sin(objs.entities[i].angle * Math.PI / 180);
        }
    }
}

// classes
function Entity(props) {
    this.collision = "null";
    this.viewDistance = 35;
    this.angleChange = 3;
    this.speed = 1;
    this.position = _.cloneDeep(props.position) || {
        "x" : 0,
        "y" : 0
    }
    this.size = props.size || {
        "width" : 3,
        "height" : 3
    }
    this.color = props.color || "#88bb88";
    this.angle = Math.random() * 360;
    this.genes = new Array();
    for (var i = 0; i <= 360; i++) {
        this.genes[i] = {
            "walls" : {"forward": Math.random()*this.speed*2 - this.speed, "side": Math.random()*this.angleChange*2 - this.angleChange},
            "goals" : {"forward": Math.random()*this.speed*2 - this.speed, "side": Math.random()*this.angleChange*2 - this.angleChange},
            "null" : {"forward": Math.random()*this.speed*2 - this.speed, "side": Math.random()*this.angleChange*2 - this.angleChange}
        };
    }
    // TODO: make memes possible / instuctions that are exchanged through different entities
    // this.memes = new Array();
}

function Goal(props) {
    this.position = props.position || {
        "x" : 100,
        "y" : 0
    }
    this.size = props.size || {
        "width" : 10,
        "height" : 10
    }
    this.color = props.color || "#bb8888";
}

function Wall(props) {
    this.position = props.position || {
        "x" : 50,
        "y" : 0
    }
    this.size = props.size || {
        "width" : 10,
        "height" : 10
    }
    this.color = props.color || "#888888";
}

// additional
function onWindowResize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
}

function loadJSON(filename, callback) {
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
 }

 function jsonToLevel(input) {
    input = JSON.parse(input)

    objs.entities = new Array();
    for (var i = 0; i < input.entities.length; i++) {
        for (var j = 0; j < input.entities[i].amount; j++) {
            objs.entities.push( new Entity(input.entities[i]) );
        }
    }
    objs.goals = new Array();
    for (var i = 0; i < input.goals.length; i++) {
        objs.goals.push( new Goal(input.goals[i]) );
    }
    objs.walls = new Array();
    for (var i = 0; i < input.walls.length; i++) {
        objs.walls.push( new Wall(input.walls[i]) );
    }
    // objs.walls.fill(new Wall({}) );
 }

function moveableCam() {
    // move the camera ({"x", "y"}) by draging it around the screen
    var mousePressed = false;
    var originX = 0;
    var originY = 0;
    var camX = 0;
    var camY = 0;

    c.addEventListener( 'mousedown', function(e) {
        originX = e.clientX;
        originY = e.clientY;
        mousePressed = true;
    }, false )
    c.addEventListener( 'mouseup', function(e) {
        mousePressed = false;
    }, false )
    c.addEventListener( 'mousemove', function(e) {
        if (mousePressed == true) {
            camera.x = camX + -1 * (originX - e.clientX);
            camera.y = camY + -1 * (originY - e.clientY);
        }else {
            camX = camera.x;
            camY = camera.y;
        }
    }, false )
}

function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}
