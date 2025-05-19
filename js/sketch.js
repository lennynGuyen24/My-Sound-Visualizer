



var song;

function preload() {
    song=loadSound('mp3/swanRemix.mp3');

}

var canvas;
let playButton, pauseButton;
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
    colorMode(HSB, 255);
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
   //play button
   let buttonSpace=select('#buttonSpace');
   playButton = createButton('play');
   playButton.parent(buttonSpace);
   playButton.addClass('playButton');
   playButton.mousePressed(()=>{
    song.play();
    loop();
   });
   //pause button
   pauseButton = createButton('pause');
   pauseButton.parent(buttonSpace);
   pauseButton.addClass('pauseButton')
   pauseButton.mousePressed(() => {
    song.pause();
    noLoop();
    });
}

function compareDistances(a,b) { //compare distance 
    return a.distance - b.distance;


}
function draw() {
   background(255,30);
   fill(255,0,0);
   //orbitControl();
   spectrum=fft.analyze();
   let vol= fft.getEnergy(20,140);
   if (vol>240) {
      stroke(random(255),70,255);
   } else if (vol>220 && vol<240) {
        stroke(0,0,220);
        strokeWeight(0.5);
   } else {
        noStroke();
   }
   
   let totalCubes=num*num*num;
   /* for (let i=0; i<totalCubes; i++) {
    let pos=distFromCenter[i];
    let color=map(spectrum[i],0, 255, min,255);
    grid[pos.boxes][pos.boxes2][pos.boxes3]=color;
   } *///Purple-ish
   for (let i = 0; i < totalCubes; i++) {
    let pos = distFromCenter[i];
    // Map the index or spectrum value to a hue (0-255)
    //let hue = map(i, 0, totalCubes, 0, 255);// Rainbow by position
    let hue = map(spectrum[i], 0, 255, 0, 255); 
    // For audio-reactive rainbow: 
    grid[pos.boxes][pos.boxes2][pos.boxes3] = hue;
}



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
                    fill(grid[boxes][boxes2][boxes3],60,255);
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
   if (amp > 220) {
    particles.push(new Particle());
    }
   



  

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(amp > 230);
        particles[i].show();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
    

}



class Particle{
    constructor(){
        let r = 200;
        this.pos = p5.Vector.random2D().mult(r);
        this.vel = createVector(0,0);
        this.acc=this.pos.copy().normalize().mult(random(0.1,0.5));

        this.w=random(8, 16);
        this.hue=random(180, 255);//pastel
        this.lifetime=255; //fading out

    }
    update(cond) {
        this.vel.add(this.acc);
        this.vel.limit(6); //prevent moving too fast
        this.pos.add(this.vel);
        if (cond) {
            this.pos.add(this.vel);
            this.pos.add(this.vel);
            this.pos.add(this.vel);
        }
        this.lifetime -=3;

    }

    show() {
        noStroke();
        fill(this.hue,60,255,this.lifetime);
        ellipse(this.pos.x, this.pos.y, this.w);
    }
    isDead() {
        return this.lifetime<0;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}