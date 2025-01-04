Hooks.on('canvasReady', async () => {
    // if (game.user.isGM) return; // Uncomment after testing

    try {
        const template = await renderTemplate("modules/anonymous-stop-button/templates/stop-button.html");
        const buttonElement = $(template);
        $("body").append(buttonElement);

        buttonElement.on('click', async () => {
            console.log("Stop button clicked!");

            // Check WebRTC on click and provide feedback
            if (!(game.webrtc && game.webrtc.clients)) {
                console.warn("WebRTC not available. Cannot mute players.");
                if (game.users.size <= 1) {
                    ui.notifications.warn("Muting requires at least two connected users with audio/video enabled.");
                } else {
                    ui.notifications.warn("WebRTC is not currently available. Muting is disabled.");
                }
                try {
                    await game.togglePause(true); // Pause only locally if WebRTC not available
                    game.socket.emit('module.pause-alert');
                } catch (error) {
                    console.error('Error pausing game:', error);
                    ui.notifications.error('An error occurred. Check the console.');
                }
                return;
            }

            try {
                await game.togglePause(true, true); // Pause for everyone
                for (const client of game.webrtc.clients) {
                    if (client && client !== game.webrtc.client) {
                        await client.toggleAudio(false);
                        await client.toggleVideo(false);
                    }
                }
                game.socket.emit('module.pause-alert');
            } catch (error) {
                console.error('Error pausing game or muting clients:', error);
                ui.notifications.error('An error occurred. Check the console.');
            }
        });
    } catch (err) {
        console.error("Error rendering template or attaching event listener", err);
    }
});

Hooks.once('ready', () => { // Use 'ready' hook for socket setup
    game.socket.on('module.pause-alert', () => {
        if (game.user.isGM) {
            game.togglePause(true, true); // GM also pauses
            ui.notifications.info(`Game paused by a player.`);
        }
    });
});