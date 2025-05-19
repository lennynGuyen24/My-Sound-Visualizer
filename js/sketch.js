



var song;

function preload() {
    song=loadSound('mp3/swanRemix.mp3');

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
let size=20;
let num=10;
let grid=[];
let smoothedAvgFreq = 0; 







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
   //orbitControl();
   spectrum=fft.analyze();
   let vol= fft.getEnergy(20,140);
   if (vol>240) {
      stroke(random(255),random(255),random(255));
   } else {
        stroke(200);
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
  /*  for (let boxes=0; boxes<num; boxes++) {
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
   } */
   let avgFreq = 0;
   for (let i = 0; i < spectrum.length; i++) {
    avgFreq += spectrum[i];
    }
   avgFreq /= spectrum.length;

   // Smooth the average frequency for less jitter
   smoothedAvgFreq = lerp(smoothedAvgFreq, avgFreq, 0.1);
   // Map average frequency to rotation angles
   let rotX = map(smoothedAvgFreq*10, 0, 255, 0, PI)+frameCount * 0.01;;
   let rotY = map(smoothedAvgFreq*20, 0, 255, 0, TWO_PI) + frameCount * 0.013;
   let rotZ = map(smoothedAvgFreq*20, 0, 255, 0, PI) +  frameCount * 0.008 ;

   push();
   rotateX(rotX);
   rotateY(rotY);
   rotateZ(rotZ);
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
    pop();

   
   

   fft.analyze();
   amp=fft.getEnergy(20, 200);
   waveform=fft.waveform();
   



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
        let r = 200;
        this.pos = p5.Vector.random2D().mult(r);
        

        this.vel = createVector(0,0);
        this.acc=this.pos.copy().normalize().mult(random(0.1,0.5));

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