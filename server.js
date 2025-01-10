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
  "Paragraph 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
  "Paragraph 2: Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.",
  "Paragraph 3: Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla.",
  "Paragraph 4: Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero.",
  "Paragraph 5: Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.",
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

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
