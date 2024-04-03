console.log("lets do some javscirpt")
let currentSong = new Audio()
let songs;
let currFolder;
function secMin(sec) {
    const min = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    const Minutes = String(min).padStart(2, '0')
    const Seconds = String(secs).padStart(2, '0')

    return `${Minutes}:${Seconds}`
}
async function Getsongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const e = as[i]
        if (e.href.endsWith(".mp3")) {
            songs.push(e.href.split(`/${folder}/`)[1])
        }
    }

    let songul = document.querySelector('.songlist').getElementsByTagName('ul')[0]
    songul.innerHTML = ""
    for (let song of songs) {
        songul.innerHTML = songul.innerHTML + `                        <li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
            <span>${song.replaceAll('%20', ' ').split('-')[0]}.mp3</span>
            <div>${song.replaceAll('%20', ' ').split('-')[1].split('.')[0]}</div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
        </div>
    </li>`;
    }

    //attach an event listener to each of the song
    Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', () => {
            console.log(e.querySelector('.info').getElementsByTagName('span')[0].innerHTML.split('.')[0].trim() + '-' + e.querySelector('.info').getElementsByTagName('div')[0].innerHTML.trim() + '.mp3')
            playmusic(e.querySelector('.info').getElementsByTagName('span')[0].innerHTML.split('.')[0].trim() + '-' + e.querySelector('.info').getElementsByTagName('div')[0].innerHTML.trim() + '.mp3')
            // play.src='pause.svg'
        })
    })
    return songs
}







function playmusic(track, pause = false) {
    //  let a=new Audio('/songs/'+track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        play.src = 'pause.svg'
        currentSong.play()
    }
    document.querySelector('.songInfo').innerHTML = decodeURI(track)
    document.querySelector('.songtime').innerHTML = "00:00/00:00"

}






async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors= div.getElementsByTagName('a')
    let cardcontainer=document.querySelector('.card-container')
    let array=Array.from(anchors)
        for(let i=0;i<array.length;i++){
            const e=array[i]
        if(e.href.includes("/songs/")){
            // console.log(e.href.split('/').slice(-1)[0])
            let folder=e.href.split('/').slice(-1)[0]

            //getting metadarta of folder
            let n=await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response=await n.json()
            console.log(response)
            cardcontainer.innerHTML=cardcontainer.innerHTML+`<div data-folder="${folder}"  class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="70" height="70"
                    fill="none">
                    <!-- Green background -->
                    <circle cx="12" cy="12" r="10" stroke="#1fdf64" stroke-width=".5" fill="#1fdf64" />

                    <!-- Play button -->
                    <path fill="#000"
                        d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z"
                        stroke="black" stroke-width="1.5" stroke-linejoin="round" fill="none" />
                </svg>

            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
        //Load the playlist
        Array.from(document.getElementsByClassName('card')).forEach(e=>{
            e.addEventListener('click', async item=>{
                console.log('fetching songs')
                songs=await Getsongs(`songs/${item.currentTarget.dataset.folder}`)
                playmusic(songs[0])
            })
        })
}


async function main() {
    await Getsongs("songs/Alan-walker")
    playmusic(songs[0], true)
    // console.log(songs)

     // Display all the albums on the page
     await displayAlbums()

    //to play nest previeous
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = 'pause.svg'
        }
        else {
            play.src = 'play.svg'
            currentSong.pause()
        }
    })

    //time update of song
    currentSong.addEventListener('timeupdate', () => {
        console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector('.songtime').innerHTML = `${secMin(currentSong.currentTime)}/${secMin(currentSong.duration)}`
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        if(currentSong.currentTime==currentSong.duration){
            let idx = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((idx + 1) <= songs.length - 1) {
                playmusic(decodeURI(songs[idx + 1]))
            }
            else if((idx+1)>songs.length){
                playmusic(decodeURI(songs[songs.length-idx]))
            }
        }
    })

    //seeking the seekbar
    document.querySelector('.seekbar').addEventListener('click', e => {
        let point = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = point + "%";
        currentSong.currentTime = (point / 100) * currentSong.duration

    })

    //clicking hamburger
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = "0%"
    })

    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = "-120%"
    })

    //previous
    pre.addEventListener('click', () => {
        let idx = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        if ((idx - 1) >= 0) {
            playmusic(decodeURI(songs[idx - 1]))
        }
    })

    //next button
    next.addEventListener('click', () => {
        let idx = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((idx + 1) <= songs.length - 1) {
            playmusic(decodeURI(songs[idx + 1]))
        }
    })

    //volume controller
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //mute controller
    document.querySelector('.volume>img').addEventListener('click',(e)=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume=0
            document.querySelector('.range').getElementsByTagName('input')[0].value=0
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume=.1
            document.querySelector('.range').getElementsByTagName('input')[0].value=50
        }
    })
}



main()