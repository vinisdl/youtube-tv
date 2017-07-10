const { ipcRenderer, remote } = require('electron')
const closeBtn = document.querySelector(".close")
const menuBtn = document.querySelector(".menu")
const panel = document.querySelector(".panel")
const playBtn = document.querySelector(".play-btn")
const player = videojs('player')
const errorMessage = ''
const apikey = '' // your App key


function play () {	
	const input = document.getElementById("video-url").value
	if (!input) { return }

  videojs('player').src({"src": input, "type": "video/youtube"})
  togglePanel()
}

function togglePanel () {
  panel.classList.toggle('is-visible')
  menuBtn.classList.toggle("is-panel-visible")
}

function onInputKeyup (event) {
	if (event.which == 13) {
		play()
	}
}

function onError (err) {
	togglePanel()
	document.querySelector('.message').innerHTML = player.error().code
}

function onLoadedMetadata () {
	document.querySelector('.message').innerHTML = ''
}

function onUserActive () {
	document.querySelector('.action-bar').classList.remove('hidden')
}

function onUserInactive () {
	if (!(player.paused() || panel.classList.contains('is-visible'))) {
    document.querySelector('.action-bar').classList.add('hidden')
  }
}

function shutdown () {
	ipcRenderer.send('asynchronous-message', 'shutdown')
}

menuBtn.addEventListener("click", togglePanel)
playBtn.addEventListener("click", play)
closeBtn.addEventListener("click", shutdown)
player.on('error', onError, true)
player.on('loadedmetadata', onLoadedMetadata, true)
player.on('useractive', onUserActive, true)
player.on('userinactive', onUserInactive, true)
player.on('ended', function() {	
	if(apikey){
		var url = document.getElementById("video-url").value
		var path = url.split("v=")[1].replace("v=", "")	
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {		
			if (this.readyState == 4 && this.status == 200) {					
				var object = JSON.parse(xhttp.responseText);						
				document.getElementById("video-url").value = "https://www.youtube.com/watch?v=" + object.items[1].id.videoId			
				play();
				togglePanel()
			}
		};
		xhttp.open("GET", "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId="+ path
		+"&type=video&key=" + apikey
		, true);
		xhttp.send();
	}
});

window.onresize = function (event) {
	const win = remote.getCurrentWindow()
	const bounds = win.getBounds()
	const newWidth = window.innerWidth
	const newHeight = window.innerHeight
	const newX = bounds.x - (newWidth - bounds.width)
	const newY = bounds.y - (newHeight - bounds.height)

  win.setBounds({
		x: newX,
		y: newY,
		width: newWidth,
		height: newHeight
	})
}
