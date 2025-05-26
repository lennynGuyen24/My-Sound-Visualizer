
//Original idea + tutorial for the 3D sound visualizer: https://youtu.be/8O5aCwdopLo?si=s1detCu0abm2zs2s
//Original idea + Tutorial for the moving Particles: https://youtu.be/uk96O7N1Yo0?si=qB6z4Wlv11RLXnJs
//Tutorials for HTML/CSS/DOM in p5.js : https://youtube.com/playlist?list=PLRqwX-V7Uu6bI1SlcCRfLH79HZrFAtBvX&si=BkO4deQzh9QsA6OG


let song;
const songs = ['mp3/magnetic.mp3', 'mp3/seeLove.mp3', 'mp3/kawaiiRemix.mp3', 'mp3/suMuZheRemix.mp3', 'mp3/bukanPho.mp3', 'mp3/drum.mp3'];
let songNames = ["1.Magnetic-ILLIT", "2.See Tinh-Hoang Thuy Linh",
    "3.Kawaikute Gomen Remix-HoneyWorks", "4.SuMuZhe Remix-Zhang Xiaotan", "5.De Yang Gatal Gatal Sa-Bukan Pho DJ DESA Remix", "6.Drum"
];
let currentSongIndex = 0;
let changeSongButton;

var canvas;
let playButton, pauseButton;
let smoothing = 0.8;
let bins = 512;
let min = 150;
let size = 20;
let num = 10;


let fft;
let waveform = [];
let r = 100;
let spectrum = [];
let distFromCenter = [];
let grid = [];
var particles = [];
let smoothedAvgFreq = 0;

//Volume control by mic
let mic;
let vol = 0;

function preload() { //Load the first song
    song = loadSound(songs[currentSongIndex]);
    song.setVolume(window.lastSetVol || 0.5);
    console.log('Now playing:', songs[currentSongIndex]);

}


function setup() {

    createCanvas(windowWidth, windowHeight, WEBGL);

    var buttonSpace = select('#buttonSpace');
    var volumeSliderSpace = select('#volumeSliderSpace');

    colorMode(HSB, 255);
    fft = new p5.FFT();
    mic = new p5.AudioIn(); //create a new mic
    mic.start();
    angleMode(DEGREES);

    //Build 3D grid and distance array. 
    //Calculates the distance of each grid cell from the center of the grid.
    for (let boxes = 0; boxes < num; boxes++) {
        grid[boxes] = [];
        for (let boxes2 = 0; boxes2 < num; boxes2++) {
            grid[boxes][boxes2] = [];
            for (let boxes3 = 0; boxes3 < num; boxes3++) {
                grid[boxes][boxes2][boxes3] = floor(random(2));

                let offset = size / 2 - num / 2 * size
                let x = boxes * size + offset;
                let y = boxes2 * size + offset;
                let z = boxes3 * size + offset;
                let distance = dist(x, y, z, 0, 0, 0);

                distFromCenter.push({ boxes, boxes2, boxes3, distance });
                //console.log(distFromCenter);

            }
        }
    }
    distFromCenter.sort(compareDistances);


    // Previous song button
    prevSongButton = createButton('⏮');
    prevSongButton.parent(buttonSpace);
    prevSongButton.addClass('changeSong');
    prevSongButton.mousePressed(() => {
        song.stop();
        currentSongIndex = (currentSongIndex - 1+ songs.length) % songs.length; //Formula to calculate previous song
        song = loadSound(songs[currentSongIndex], () => {
            song.play();
            playButton.html('❚❚');
            song.onended(() => {
                playButton.html('▶');
            });
            //loop();
            songSelector.selected(currentSongIndex);
        });
        console.log('Now playing:', songs[currentSongIndex]);
    });

    // Toggle Play/Pause button. Icon source: https://emojidb.org/play-button-emojis
    playButton = createButton('▶');
    playButton.parent(buttonSpace);
    playButton.addClass('playButton');
    playButton.mousePressed(() => {
        if (song && song.isLoaded() && !song.isPlaying()) {
            song.play();
            //loop();
            playButton.html('❚❚');
            song.onended(() => {
                playButton.html('▶');
            });
        } else {
            song.pause();
            //noLoop();
            playButton.html('▶');
        }
        songSelector.selected(currentSongIndex);
    })


    //Next song button
    changeSongButton = createButton('⏭');
    changeSongButton.parent(buttonSpace);
    changeSongButton.addClass('changeSong');
    changeSongButton.mousePressed(() => {
        song.stop();
        currentSongIndex = (currentSongIndex + 1) % songs.length; //Formula to calculate next song
        song = loadSound(songs[currentSongIndex], () => {
            song.play();
            loop();
            playButton.html('❚❚');
            songSelector.selected(currentSongIndex);

        });
        console.log('Now playing:', songs[currentSongIndex]);
    });

    // Song selection dropdown
    let songSelector = createSelect();
    songSelector.parent(buttonSpace);
    songSelector.addClass('changeSong');


    // Populate the dropdown with song names
    for (let i = 0; i < songs.length; i++) {
        songSelector.option(songNames[i], i);
    };


    // Handle song selection
    songSelector.changed(() => {
        let selectedIndex = int(songSelector.value());
        if (selectedIndex !== currentSongIndex) {
            song.stop();
            currentSongIndex = selectedIndex;
            song = loadSound(songs[currentSongIndex], () => {
                //loop();
                //playButton.html('▶');
                song.onended(() => {
                    playButton.html('▶');
                });
                //Not auto-play
                songSelector.selected(currentSongIndex);
            });
            console.log('Loaded', songs[currentSongIndex]);
        }
    });

    // Create volume slider with speaker icon
    let speakerIcon = createSpan('🔊');
    speakerIcon.parent(volumeSliderSpace);
    speakerIcon.addClass('speakerIcon');

    window.volumeSlider = createSlider(0, 100, 50);
    window.volumeSlider.parent(volumeSliderSpace);
    window.volumeSlider.addClass('sliderCust');
    window.volumeSlider.input(() => {
        let val = window.volumeSlider.value() / 100;
        window.lastSetVol = val;
        song.setVolume(val);
    });




}

function compareDistances(a, b) { //compare distance 
    return a.distance - b.distance;


}
function draw() {
    background(255, 30);


    spectrum = fft.analyze();
    let vol = fft.getEnergy(20, 140);
    if (vol > 240) {
        stroke(random(255), 50, 255);
    } else if (vol > 220 && vol < 240) {
        stroke(0, 1, 220);
        strokeWeight(0.3);
    } else {
        noStroke();
    }

    let totalCubes = num * num * num;
    /* for (let i=0; i<totalCubes; i++) {
     let pos=distFromCenter[i];
     let color=map(spectrum[i],0, 255, min,255);
     grid[pos.boxes][pos.boxes2][pos.boxes3]=color;
    } *///Purple-ish-Original tutorial
    for (let i = 0; i < totalCubes; i++) {
        let pos = distFromCenter[i];
        // Map the spectrum value to a hue (0-255)
        let hue = map(spectrum[i], 0, 255, 0, 255);
        // For audio-reactive rainbow: 
        grid[pos.boxes][pos.boxes2][pos.boxes3] = hue;
    }



    noFill();
    let offset = size / 2 - num / 2 * size
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
    let rotX = map(smoothedAvgFreq * 10, 0, 255, 0, PI) + frameCount * 0.01;;
    let rotY = map(smoothedAvgFreq * 20, 0, 255, 0, TWO_PI) + frameCount * 0.013;
    let rotZ = map(smoothedAvgFreq * 20, 0, 255, 0, PI) + frameCount * 0.008;

    push();
    rotateX(rotX);
    rotateY(rotY);
    rotateZ(rotZ);
    for (let boxes = 0; boxes < num; boxes++) {
        for (let boxes2 = 0; boxes2 < num; boxes2++) {
            for (let boxes3 = 0; boxes3 < num; boxes3++) {
                if (grid[boxes][boxes2][boxes3] > min) {
                    fill(grid[boxes][boxes2][boxes3], 60, 255);
                } else {
                    noFill();
                }

                push();
                translate(boxes * size, boxes2 * size, boxes3 * size);
                box(size - size / 4);
                pop();
            }

        }
    }
    pop();




    fft.analyze();
    amp = fft.getEnergy(20, 200);
    if (amp > 200) {
        particles.push(new Particle());
    }






    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(amp > 210);
        particles[i].show();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }

    //MIC INTERACTING FUNCTION!!! (change the song volume)
    let micVol = mic.getLevel();
    if (!window.lastSetVol) window.lastSetVol = 0.5;
    let targetVol = constrain(micVol * 5, 0, 1);
    if (targetVol > window.lastSetVol + 0.02) {
        window.lastSetVol = targetVol;
        song.setVolume(window.lastSetVol); //Apply the new volume to the song
        if (window.volumeSlider) window.volumeSlider.value(window.lastSetVol * 100);
        if (window.volumeTimeout) clearTimeout(window.volumeTimeout);//clear any existing timeout to avoid multiple resets.
        window.volumeTimeout = setTimeout(() => {//set a timeout so the vol and mic reset to 0.5
            window.lastSetVol = 0.5;
            song.setVolume(window.lastSetVol);
            if (window.volumeSlider) window.volumeSlider.value(50);
        }, 3000);
    }

    //Draw the mic circle
    let baseRadius = Math.min(width, height) / 10;
    let radius = baseRadius + map(micVol, 0, 1, 0, baseRadius * 2);

    push();
    resetMatrix();
    translate(-windowWidth / 2 + baseRadius + 20, -windowHeight / 2 + baseRadius + 20, 0);
    noFill();
    stroke(180, 255, 255);
    ellipse(0, 0, radius);
    pop();


}



class Particle {
    constructor() {
        let r = 200;
        this.pos = p5.Vector.random2D().mult(r);
        this.vel = createVector(0, 0);
        this.acc = this.pos.copy().normalize().mult(random(0.1, 0.5));

        this.w = random(8, 16);
        this.hue = random(180, 255);//pastel
        this.lifetime = 255; //fading out

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
        this.lifetime -= 3;

    }

    show() {
        noStroke();
        fill(this.hue, 60, 255, this.lifetime);
        ellipse(this.pos.x, this.pos.y, this.w);
    }
    isDead() {
        return this.lifetime < 0;
    }

}



function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}