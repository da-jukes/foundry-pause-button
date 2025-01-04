(async () => {
    Hooks.on('renderPlayerList', async () => {
        // if (game.user.isGM) return;

        try {
            const template = await renderTemplate("modules/anonymous-stop-button/templates/stop-button.html");
            const buttonElement = $(template);
            $("body").append(buttonElement);

            buttonElement.on('click', async () => {
                console.log("Stop button clicked!");

                setTimeout(async () => {
                    console.log("WebRTC Mode (delayed):", game.webrtc?.mode);
                    console.log("WebRTC Clients (delayed):", game.webrtc?.clients);

                    if (!(game.webrtc && game.webrtc.clients)) {
                        console.warn("WebRTC not available. Cannot mute players.");
                        if (game.users.size <= 1) {
                            ui.notifications.warn("Muting requires at least two connected users with audio/video enabled.");
                        } else {
                            ui.notifications.warn("WebRTC is not currently available. Muting is disabled.");
                        }
                        try {
                            await game.togglePause(true); // Pause locally
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
                }, 250); // Delay
            });
        } catch (err) {
            console.error("Error rendering template or attaching event listener", err);
        }
    });

    Hooks.once('ready', () => {
        game.socket.on('module.pause-alert', () => {
            if (game.user.isGM) {
                game.togglePause(true, true); // GM also pauses
                ui.notifications.info(`Game paused by a player.`);
            }
        });
    });
})();