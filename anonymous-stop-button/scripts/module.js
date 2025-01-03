Hooks.on('canvasReady', async () => {
    // if (game.user.isGM) return; // Uncomment after testing

    const template = await renderTemplate("modules/anonymous-stop-button/templates/stop-button.html");
    const buttonElement = $(template); // Use jQuery to create the element

    $("body").append(buttonElement); // Use jQuery to append to the body

    buttonElement.on('click', async () => { // Use jQuery for event handling
        console.log("Stop button clicked!");
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