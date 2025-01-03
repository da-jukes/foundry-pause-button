Hooks.on('webrtcReady', () => {
  if (game.user.isGM) return; // Only players see the button

  // Create the 'Stop' button
  const stopButton = document.createElement('button');
  stopButton.innerText = 'STOP';
  stopButton.style.position = 'fixed';
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

  // Add button to the DOM
  document.body.appendChild(stopButton);

  // Handle click event
  stopButton.addEventListener('click', () => {
    // Pause the game
    game.socket.emit('module.pause-alert', { user: game.user.name });
    game.togglePause(true, true);

    // Mute all players and disable their video
    game.webrtc.clients.forEach(client => {
      if (client !== game.webrtc.client) { // Skip self
        client.toggleAudio(false);
        client.toggleVideo(false);
      }
    });
  });
});

// Handle socket events for the GM
Hooks.once('socketlib.ready', () => {
  game.socket.on('module.pause-alert', (data) => {
    if (game.user.isGM) {
      ui.notifications.info(`Game paused by an anonymous player.`);
    }
  });
});
