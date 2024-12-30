Hooks.on('ready', () => {
    if (game.user.isGM) return; // Only players see the button
  
    // Create the 'Stop' button
    const stopButton = document.createElement('button');
    stopButton.innerText = 'Stop';
    stopButton.style.position = 'fixed';
    stopButton.style.bottom = '20px';
    stopButton.style.right = '20px';
    stopButton.style.backgroundColor = 'red';
    stopButton.style.color = 'white';
    stopButton.style.padding = '10px 20px';
    stopButton.style.border = 'none';
    stopButton.style.borderRadius = '5px';
    stopButton.style.cursor = 'pointer';
    stopButton.style.zIndex = '1000';
  
    // Add button to the DOM
    document.body.appendChild(stopButton);
  
    // Handle click event
    stopButton.addEventListener('click', () => {
      game.socket.emit('module.pause-alert', { user: game.user.name });
      game.togglePause(true, true); // Pause the game
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
  