require("dotenv").config(); // Load environment variables
const io = require("socket.io")(process.env.PORT || 3000, {
  cors: {
    origin: process.env.URL, // Allowed client origin
    methods: ["GET", "POST"],
  },
});

let lightStates = {}; // Track light state for each slot
let slotParagraphs = {}; // Map slot IDs to assigned paragraphs

// Predefined paragraphs
const paragraphs = [
  "In Squid Game, players must remain perfectly still when the giant doll turns around. Any movement detected means instant elimination.",
  "The rules are simple: move during red light and you're eliminated. Only move when the light is green. Stay focused and control your movements.",
  "456 players entered the game seeking the ultimate prize. Many failed at this first challenge, unable to control their trembling bodies.",
  "The giant doll's song echoes through the field: 'Red light, green light, 1-2-3!' Each note could be your last if you're not careful.",
  "The stakes are life and death. One wrong move, one slight tremor, and it's game over. Keep your eyes on the prize and stay absolutely still.",
];

// Utility function to randomly assign a paragraph to a slot
function assignRandomParagraph(slotId) {
  if (!slotParagraphs[slotId]) {
    const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    slotParagraphs[slotId] = randomParagraph;
  }
  return slotParagraphs[slotId];
}

io.on("connection", (socket) => {
  console.log("A user connected");

  // Emit the current light state and assigned paragraph to the connected client
  socket.on("request-light-state", (data) => {
    const { slotId } = data;
    const assignedParagraph = assignRandomParagraph(slotId); // Ensure paragraph is assigned
    socket.emit("light-state", {
      slotId,
      isGreen: lightStates[slotId] || false,
      paragraph: assignedParagraph,
    });
  });

  // Admin toggles the light
  socket.on("toggle-light", (data) => {
    const { slotId } = data;
    lightStates[slotId] = !lightStates[slotId];
    io.emit("light-toggle", {
      slotId,
      isGreen: lightStates[slotId],
    }); // Notify all clients
    console.log(`Light for slot ${slotId} is now ${lightStates[slotId] ? "green" : "red"}`);
  });

  socket.on("score-update", (data) => {
    // Broadcast the score update to all connected clients
    io.emit("leaderboard-update", {
      slotId: data.slotId,
      username: data.username,
      score: data.score
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
