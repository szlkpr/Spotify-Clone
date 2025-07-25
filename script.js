console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
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
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();  
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${currFolder}/`)[1])
        }
    }
 
    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + track

    let play = document.querySelector(".playbtn");

    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}


async function main() {
    // Get the list of all the songs
    let songs = await getSongs("songs/ncs")
    playMusic(songs[0], true)

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Sazal</div>
                            </div>`
                            ;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })


    // Attach an event listener to play, next and previous

    let play = document.querySelector(".playbtn");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

     // Add an event listener to seekbar
     document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    
    
    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
    })

    // const previous = document.getElementById(".previous");
    // const next = document.getElementById(".next");

        // Add an event listener to previous
        previous.addEventListener("click", () => {
            currentSong.pause()
            console.log("Previous clicked")
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1])
            }
        })

        // Add an event listener to next
        next.addEventListener("click", () => {
            currentSong.pause()
            console.log("Next clicked")

            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1])
            }
        })

         // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (event) => {
            let cardElement = event.currentTarget;
            let folder = cardElement.dataset.folder;
    
            if (!folder) {
                console.warn("Clicked card does not have a data-folder attribute.");
                return;
            }
    
            console.log("Fetching songs from:", folder);
            songs = await getSongs(`songs/${folder}`);
            console.log("Fetched songs:", songs);
    
            // Display songs in the left section
            let songUL = document.querySelector(".songList ul");
            if (!songUL) {
                console.error("Song list not found!");
                return;
            }
    
            songUL.innerHTML = ""; // Clear existing songs
            for (const song of songs) {
                songUL.innerHTML += `<li class="song-item" data-track="${song}">
                    <img class="invert" width="34" src="music.svg" alt="">
                    <div class="info">
                        <div>${decodeURI(song)}</div>
                        <div>Artist Name</div>
                    </div>
                </li>`;
            }
    
            console.log("Updated song list:", songUL.innerHTML);
            songUL.style.display = "block"; // Ensure visibility
    
            // Automatically play the first song
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
    
            // Attach click event to play songs when clicked
            addSongClickListeners();
        });
    });
    
    // Function to add click event listeners to each song in the left section
    function addSongClickListeners() {
        let songItems = document.querySelectorAll(".songList .song-item");
        songItems.forEach(songItem => {
            songItem.addEventListener("click", () => {
                let track = songItem.dataset.track;
                console.log("Playing song:", track);
                playMusic(track);
            });
        });
    } 

}

main()