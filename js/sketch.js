



var song;

function preload() {
    song=loadSound('mp3/Luis Fonsi - Despacito ft. Daddy Yankee.mp3');

}

var canvas;
let smoothing=0.8;
let bins=512;
let fft;
let waveform=[];
let r=100;
let spectrum=[];
let min=150;
let distFromCenter=[];



var particles = [];
let size=15;
let num=10;
let grid=[];







function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    fft=new p5.FFT();
    angleMode(DEGREES);
     for (let boxes=0; boxes<num; boxes++) {
        grid[boxes]=[];
        for (let boxes2=0; boxes2<num; boxes2++) {
            grid[boxes][boxes2]=[];
            for (let boxes3=0; boxes3<num; boxes3++){
                grid[boxes][boxes2][boxes3]=floor(random(2));

                let offset=size/2 -num/2*size
                let x=boxes*size +offset;
                let y=boxes2*size +offset;
                let z=boxes3*size +offset;
                let distance=dist(x,y,z,0,0,0);

                distFromCenter.push({boxes,boxes2,boxes3,distance});
                console.log(distFromCenter);

            }
        }
   }
   distFromCenter.sort(compareDistances);
}

function compareDistances(a,b) { //compare distance 
    return a.distance - b.distance;


}
function draw() {
   background(255);
   fill(255,0,0);
   orbitControl();
   spectrum=fft.analyze();
   let vol= fft.getEnergy(20,140);
   if (vol>240) {
       stroke(grid[boxes][boxes2][boxes3],0,200);
   } else {
        noStroke();
   }
   let totalCubes=num*num*num;
   for (let i=0; i<totalCubes; i++) {
    let pos=distFromCenter[i];
    let color=map(spectrum[i],0, 255, min,255);
    grid[pos.boxes][pos.boxes2][pos.boxes3]=color;
   }

   /*stroke(200);
   strokeWeight(2);
   noFill();*/
   noFill();
   let offset=size/2 -num/2*size
   translate(offset, offset, offset);
   for (let boxes=0; boxes<num; boxes++) {
        for (let boxes2=0; boxes2<num; boxes2++) {
            for (let boxes3=0; boxes3<num; boxes3++){
                if (grid[boxes][boxes2][boxes3]>min) {
                    fill(grid[boxes][boxes2][boxes3],0,200);
                } else {
                    noFill();
                }
                
                push();
                translate(boxes*size, boxes2*size, boxes3*size);
                box(size- size/4);
                pop();
            }
            
        }
   }

   
   

   fft.analyze();
   amp=fft.getEnergy(20, 200);
   waveform=fft.waveform();
   




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