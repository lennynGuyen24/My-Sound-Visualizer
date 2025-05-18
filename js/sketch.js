



var song;

function preload() {
    song=loadSound('mp3/renai.mp3');

}

var canvas;
let smoothing=0.8;
let bins=512;
let fft;
let waveform=[];
let r=100;
let spectrum=[];


var particles = [];
let size=50;
let num=3;






function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    fft=new p5.FFT(smoothing, bins);
    angleMode(DEGREES);

    

}

function draw() {
   background(255);
   orbitControl();
   stroke(200);
   /*stroke(200);
   strokeWeight(2);
   noFill();*/
   for (let boxes=0; boxes<num; boxes++) {
        for (let boxes2=0; boxes2<num; boxes2++) {
            for (let boxes3=0; boxes3<num; boxes3++){
                push();
                translate(boxes*size, boxes2*size, boxes3*size);
                box(size);
                pop();
            }
            
        }
        
   }
   fill(255,0,0);
   box(size);
   
   

   fft.analyze();
   amp=fft.getEnergy(20, 200);
   waveform=fft.waveform();
   spectrum=fft.analyze();
   let vol= fft.getEnergy(20,140);
   console.log(vol);




//Draw time domain graph
   /* for (let a=0; a<waveform.length; a++) { 
    let w= height/2 + map(waveform[a],-1,1, -r,r);
    ellipse(a,w,1,1);

   } */
/* //Draw frequency domain graph
    for(let i=0; i<waveform.kength; i++){
        let y= map(spectrum[i], 0, 255, 0, height);
        line(i, height, i, height-y);

    } */

/* //Draw waveform in circle
    for (var t=-1; t<=1; t+=2) { //draw two half circles
        beginShape();
        for (var i=0; i<=360; i+=0.5) { //half circle
            var index= floor(map(i, 0, 180 ,0, waveform.length-1));

            var r= map(waveform[index], -1, 1, 150, 350);
            var x=r*sin(i)*t;
            var y=r*cos(i);
            vertex(x,y);
        }
        endShape();
    }  */
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