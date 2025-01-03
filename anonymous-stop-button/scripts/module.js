Hooks.on('canvasReady', async () => {
  // if (game.user.isGM) return; // Uncomment this after testing

  const stopButton = document.createElement('button');
  stopButton.innerText = 'STOP';
  stopButton.style.position = 'absolute'; // Use absolute positioning for canvas
  stopButton.style.bottom = '20px';
  stopButton.style.right = '20px';
  stopButton.style.backgroundColor = 'red';
  stopButton.style.color = 'white';
  stopButton.style.padding = '15px 20px';
  stopButton.style.border = '3px solid white';
  stopButton.style.borderRadius = '50%';
  stopButton.style.width = '80px';
  stopButton.style.height = '80px';
  stopButton.style.textAlign = 'center';
  stopButton.style.fontSize = '18px';
  stopButton.style.fontWeight = 'bold';
  stopButton.style.cursor = 'pointer';
  stopButton.style.zIndex = '1000';

  // Target the canvas directly
  const canvas = document.getElementById('board');
  if (canvas) { // Check if the canvas exists
      canvas.appendChild(stopButton);
      console.log("Stop button added to canvas:", stopButton);
  } else {
      console.error("Canvas element not found!");
  }

  stopButton.addEventListener('click', async () => {
      console.log("Stop button clicked!"); // Check if click event is triggered
      try {
          await game.togglePause(true, true);

          if (game.webrtc && game.webrtc.clients) {
              console.log("WebRTC and clients are available:", game.webrtc, game.webrtc.clients);
              for (const client of game.webrtc.clients) {
                  if (client && client !== game.webrtc.client) {
                      await client.toggleAudio(false);
                      await client.toggleVideo(false);
                  }
              }
          } else {
              console.log("WebRTC or clients are NOT available:", game.webrtc, game.webrtc.clients);
              ui.notifications.warn("WebRTC not available. Cannot mute players.");
          }
          await game.socket.emit('module.pause-alert');
      } catch (error) {
          console.error('Error pausing game or muting clients:', error);
          ui.notifications.error('An error occurred. Check the console.');
      }
  });
});

Hooks.once('socketlib.ready', () => {
  game.socket.on('module.pause-alert', () => {
      if (game.user.isGM) {
          ui.notifications.info(`Game paused by an anonymous player.`);
      }
  });
});