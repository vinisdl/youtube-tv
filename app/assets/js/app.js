const { ipcRenderer, remote } = require('electron')
const closeBtn = document.querySelector(".close")
const menuBtn = document.querySelector(".menu")
const panel = document.querySelector(".panel")
const playBtn = document.querySelector(".play-btn")
const nextBtn = document.querySelector(".next")
const player = videojs('player')
const twitchIframe = document.getElementById('iframetwitchtv')
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
			twitchIframe.src = path;		
			showFrame(false, true,false);
	}	else if(input.indexOf('facebook') != -1)
	{
		var path = 'https://www.facebook.com/plugins/video.php?show_text=0&href=' + input;
		faceIframe.src = path;	
		showFrame(false, false, true);
	}	
	else{	
  	videojs('player').src({"src": input, "type": "video/youtube"})
		showFrame(true, false,false);
	}
}


function showFrame(youtube,twitch, facebook){
		if(twitch || facebook){	
			player.hide();		
			nextBtn.style.display = 'none';
		} 
		if(twitch){
			faceIframe.style.display = 'none';
			twitchIframe.style.display = 'flex'
		} else if(facebook){
			faceIframe.style.display = 'flex';
			twitchIframe.style.display = 'none'
		} else {
			player.show()
			twitchIframe.style.display = 'none'
			faceIframe.style.display = 'none';
			nextBtn.style.display = '';
		}
		togglePanel();
	reseize();
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
	twitchIframe.height = newHeight;
	faceIframe.width = newWidth;
	twitchIframe.width = newWidth;
  win.setBounds({
		x: newX,
		y: newY,
		width: newWidth,
		height: newHeight
	})
}
