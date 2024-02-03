let currentsong = new Audio();
let songs;
let currFolder;

function convertSecondsToTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    // let a=await fetch(`http://127.0.0.1:3000/${folder}/`);
    let a = await fetch(`./${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    // show all the songs in the playlist
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
          <img class="invert" src="img/song.svg" alt="">
          <div class="info">
              <div>${song.replaceAll("%20", " ")}</div>
              <div>Shubham</div>
          </div>
          <div class="playnow">
              <span>Play Now</span>
              <img class="invert" src="img/play.svg">
          </div></li>`;
    }

    // Attch an event listner to each song
    Array.from(document.querySelector('.songList').getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            console.log(e.getElementsByClassName('info')[0].firstElementChild.innerHTML);
            playMusic(e.getElementsByClassName('info')[0].firstElementChild.innerHTML.trim());

        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            // Get the metadata of folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            let cardContainer = document.querySelector(".cardContainer");
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
          <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" height="32px"
                  style="enable-background:new 0 0 32 32;" version="1.1" viewBox="0 0 32 32" width="32px"
                  xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink">
                  <g id="Layer_1" />
                  <g id="play_x5F_alt">
                      <path
                          d="M16,0C7.164,0,0,7.164,0,16s7.164,16,16,16s16-7.164,16-16S24.836,0,16,0z M10,24V8l16.008,8L10,24z   "
                          style="fill:#1ed760;" />
                  </g>
              </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
          </div>`
        }
    }

    // Load the playlist whwnever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/new");
    playMusic(songs[0], true);

    // Display All the Albums on the Page
    displayAlbums();

    // Attach an event listener to previous,play and next
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    })

    // Listen for timeUpdate Event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToTime(currentsong.currentTime)} / ${convertSecondsToTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // Add an listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration) * percent / 100;
    })

    // Add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listner for close
    document.querySelector(".close").addEventListener("click", e => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener to prev
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })
    // Add an event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        currentsong.pause;
        if ((index + 1) < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e);
        currentsong.volume = parseInt(e.target.value) / 100;
        if(currentsong.volume >0) {
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("img/mute.svg","img/volume.svg");
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume > img").addEventListener("click",(e)=>{
        if(e.target.src.includes("img/volume.svg")) {
            e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg");
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value="0";
        }
        else{
            e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg");
           currentsong.volume=.10;
           document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })

}
main();
