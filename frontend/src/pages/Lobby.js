const socket = io("http://localhost:3000");

function createLobby(name) {
  socket.emit("create-lobby", { name }, ({ lobbyCode }) => {
    console.log("Lobby created:", lobbyCode);
    // Show lobby code to host
  });
}

function joinLobby(name, code) {
  socket.emit("join-lobby", { lobbyCode: code, name }, (res) => {
    if (res.error) alert(res.error);
    else console.log("Joined lobby:", code);
  });
}

socket.on("lobby-update", (players) => {
  console.log("Updated player list:", players);
  // Update lobby UI
});

socket.on("game-started", () => {
  console.log("Game started!");
  // Navigate to trivia screen
});
