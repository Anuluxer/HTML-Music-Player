var audioPlayer = new Audio();
var queue = [];
var queueNames = {};
var queueImgs = {};
var queuePosition = 0;
var playing = false;
var muted = false;
var dark = false;

var title = document.getElementById("musictitle");
var playButton = document.getElementById("playbutton");
var slider = document.getElementById("progress");
var volume = document.getElementById("volume");
var albumCover = document.getElementById("albumcover");
var queueDiv = document.getElementById("queue");

var jsmediatags = window.jsmediatags;

function handleDarkLight(part) {
    for (const i of part.children) {
        i.classList.toggle("darkmode");
        if (i.children) {
            handleDarkLight(i);
        }
    }
}

function shufflearray(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

function initInfo() {
    let a = queue[queuePosition];
    albumCover.src = queueImgs[a];
    title.innerText = queueNames[a];
    audioPlayer.src = a;
    displayQueue();
    setTimeout(function() {
        albumCover.src = queueImgs[a];
    }, 1000);
}

function displayQueue() {
    queueDiv.innerHTML = "";
    for (var i = 0; i < queue.length; i++) {
        let newDiv = document.createElement("div");
        newDiv.id = i;
        if (i == queuePosition) {
            newDiv.style.backgroundColor = "#4b4b4b"
        }
        newDiv.onclick = function(e) {
            if (e.target.id == "PLAY") {
                queuePosition = this.id;
                initInfo();
                play();
            } else if (e.target.id == "DELETE") {
                let curr = queue[this.id];
                delete queueImgs[curr];
                delete queueNames[curr];
                queue.splice(this.id, 1)
                if (queuePosition == this.id) {
                    queuePosition--;
                    initInfo();
                    pause();
                } else if (queuePosition > this.id) {
                    queuePosition--;
                }
                displayQueue();
            }
        }
        var playIcon = document.createElement("img");
        playIcon.id = "PLAY";
        playIcon.src = "icons/play-solid.svg";
        newDiv.appendChild(playIcon);
        newDiv.title = queueNames[queue[i]];
        if (queueNames[queue[i]].length > 15) {
            newDiv.innerHTML += queueNames[queue[i]].slice(0, 15) + "...";
        } else {
            newDiv.innerHTML += queueNames[queue[i]];
        }
        let deleteIcon = document.createElement("img");
        deleteIcon.src = "icons/x-solid.svg";
        deleteIcon.id = "DELETE";
        newDiv.appendChild(deleteIcon);
        queueDiv.appendChild(newDiv);
    }
}

audioPlayer.addEventListener("ended", function() {
    queuePosition++;
    if (queuePosition >= queue.length) {
        queuePosition = 0;
        initInfo();
        pause();
    } else {
        initInfo();
        play();
    }
})

function handlePlayPause() {
    if (!playing) {
        play();
    } else {
        pause();
    }
}

function play() {
    playing = true;
    playButton.src = "icons/pause-solid.svg";
    audioPlayer.play();
}

function pause() {
    playing = false;
    playButton.src = "icons/play-solid.svg";
    audioPlayer.pause();
}

function shuffle() {
    pause();
    queue = shufflearray(queue);
    queuePosition = -1;
    audioPlayer.dispatchEvent(new Event("ended"));
    displayQueue();
}

function addSongsToQueue(f) {
    let first = queue.length == 0; 
    for (const i of f) {
        let blob = URL.createObjectURL(i);
        jsmediatags.read(i, {
            onSuccess: function(tag) {
                const { data, format } = tag.tags.picture;
                let base64String = "";
                for (var i = 0; i < data.length; i++) {
                    base64String += String.fromCharCode(data[i]);
                }
                let df = data.format;
                let bt = window.btoa(base64String);
                let str = `data:${df};base64,${bt}`;
                queueImgs[blob] = str;

            },
            onError: function(error) {
                queueImgs[blob] = './album-placeholder.png'
            }
        });
        queue.push(blob);
        queueNames[blob] = i.name.replace(/\.[^/.]+$/, "");
    }
    displayQueue();
    if (first) {
        initInfo();
    }
}

function handleVolume() {
    if (muted) {
        volume.src = "icons/volume-high-solid.svg";
        audioPlayer.volume = 1;
    } else {
        volume.src = "icons/volume-xmark-solid.svg";
        audioPlayer.volume = 0;
    }
    muted = !muted
}

function handleStep(step) {
    if (step) {
        audioPlayer.dispatchEvent(new Event("ended"));
    } else {
        queuePosition -= 1;
        if (queuePosition == -1) {
            queuePosition = queue.length - 1;
        }
        initInfo();
        play();
    }
}

function updateSlider() {
    slider.value = audioPlayer.currentTime/audioPlayer.duration * 100;
}

setInterval(function() {
    if (playing) {
        updateSlider();
    }
}, 10);

slider.addEventListener('mousedown', function() {
    pause();
});
slider.addEventListener('mouseup', function() {
    audioPlayer.currentTime = slider.value/100 * audioPlayer.duration;
    play();
});
document.addEventListener("keypress", function(e) {
    if (e.key == " ") {
        handlePlayPause();
    }
})
document.onkeydown = function(event) {
    switch (event.keyCode) {
        case 37:
            audioPlayer.currentTime -= 5;
            updateSlider();
            break;
        case 39:
            audioPlayer.currentTime += 5;
            updateSlider();
            break;
    }
};
