



var song;

function preload() {
    song=loadSound('mp3/swanRemix.mp3');

}

var canvas;
var smoothing=0.8;
var bins=512;
var fft;
var waveform=[];

var particles = [];






function setup() {
    createCanvas(windowWidth, windowHeight);
    fft=new p5.FFT(smoothing, bins);
    angleMode(DEGREES);

    

}

function draw() {
   background(255);
   stroke(200);
   strokeWeight(2);
   noFill();
   translate(width/2, height/2);

   fft.analyze();
   amp=fft.getEnergy(20, 200);
   var wave=fft.waveform();


    for (var t=-1; t<=1; t+=2) { //draw two half circles
        beginShape();
        for (var i=0; i<=360; i+=0.5) { //half circle
            var index= floor(map(i, 0, 180 ,0, wave.length-1));

            var r= map(wave[index], -1, 1, 150, 350);
            var x=r*sin(i)*t;
            var y=r*cos(i);
            vertex(x,y);
        }
        endShape();
    } 
    var p = new Particle();
    
    particles.push(p);

    for (var i=length; i<particles.length; i++) {
        particles[i].update(amp>230);
        particles[i].show();
        
    }
    



}

function mouseClicked() {
    if (song.isPlaying()) {
        song.pause();
        noLoop();
} else {
        song.play();
        loop();
    }
}

class Particle{
    constructor(){
        this.pos = p5.Vector.random2D().mult(250);
        this.vel = createVector(0,0);
        this.acc=this.pos.copy().mult(random(0.0001,0.0001));

        this.w=random(3, 5);
        this.color= [random(200,255), random(200,255), random(200,255)];


    }
    update(cond) {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        if (cond) {
            this.pos.add(this.vel);
            this.pos.add(this.vel);
            this.pos.add(this.vel);
        }

    }

    show() {
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, 10);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}