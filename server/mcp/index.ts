import Server from "./server.js";

// Create server instance
const server = new Server("weather");

server
  .start()
  .then(() =>
    console.log(
      `Server ${server.ServerName} is running on port ${server.ServerPort}`
    )
  );
