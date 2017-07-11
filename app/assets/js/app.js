const { ipcRenderer, remote } = require('electron')
const closeBtn = document.querySelector(".close")
const menuBtn = document.querySelector(".menu")
const panel = document.querySelector(".panel")
const playBtn = document.querySelector(".play-btn")
const nextBtn = document.querySelector(".next")
const player = videojs('player')
const iframe = document.getElementById('iframetwitchtv')
const faceIframe = document.getElementById("facebookVideo")
const errorMessage = ''
const apikey = process.env.apikey
var lastv = [];

function play () {	
	const input = document.getElementById("video-url").value
	if (!input) { return }


  if(input.indexOf("twitch") != -1){		
		var splitedInput = input.split('/');
		var path = 'https://player.twitch.tv/?channel=' + splitedInput[splitedInput.length -1];		
		iframe.src = path;
		iframe.style.display = 'flex';
		togglePanel();
		player.hide();
		reseize();
		nextBtn.style.display = 'none';
	}	if(input.indexOf('facebook') != -1)
	{
		var path = 'https://www.facebook.com/plugins/video.php?show_text=0&href=' + input;
		faceIframe.src = path;
		faceIframe.style.display = 'flex';
				iframe.style.display = 'none'

		togglePanel();
		player.hide();
		reseize();
		nextBtn.style.display = 'none';
	}	
	else{
		iframe.style.display = 'none'
  	videojs('player').src({"src": input, "type": "video/youtube"})
		togglePanel()
		player.show()
		nextBtn.style.display = '';
	}
}

function togglePanel () {
  panel.classList.toggle('is-visible')
  menuBtn.classList.toggle("is-panel-visible")
}

function removeClass(){
	panel.classList.remove('is-visible')
  menuBtn.classList.remove("is-panel-visible")
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

nextBtn.addEventListener("click", nextPlaylistVideo)
menuBtn.addEventListener("click", togglePanel)
playBtn.addEventListener("click", play)
closeBtn.addEventListener("click", shutdown)
player.on('error', onError, true)
player.on('loadedmetadata', onLoadedMetadata, true)
player.on('useractive', onUserActive, true)
player.on('userinactive', onUserInactive, true)
player.on('ended', function() {	
	nextPlaylistVideo();
});

function nextPlaylistVideo(){
		if(apikey){
		var url = document.getElementById("video-url").value
		var path = url.split("v=")[1].replace("v=", "")	
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {		
			if (this.readyState == 4 && this.status == 200) {									
				var object = JSON.parse(xhttp.responseText);						
				var random = Math.floor((Math.random() * object.items.length));
				var videoId = object.items[random].id.videoId;

				if(lastv.indexOf(videoId) == -1)
				{
					document.getElementById("video-url").value = "https://www.youtube.com/watch?v=" + videoId
					play();
					removeClass();
					lastv.push(videoId);
				} else {
					nextPlaylistVideo();
				}
				
			}
		};
		xhttp.open("GET", "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId="+ path
		+"&type=video&key=" + apikey
		, true);
		xhttp.send();
	}
}

window.onresize = reseize;


function reseize(){
	const win = remote.getCurrentWindow()
	const bounds = win.getBounds()
	const newWidth = window.innerWidth
	const newHeight = window.innerHeight
	const newX = bounds.x - (newWidth - bounds.width)
	const newY = bounds.y - (newHeight - bounds.height)
	faceIframe.height = newHeight;
	iframe.height = newHeight;
	faceIframe.width = newWidth;
	iframe.width = newWidth;
  win.setBounds({
		x: newX,
		y: newY,
		width: newWidth,
		height: newHeight
	})
}
