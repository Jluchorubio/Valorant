const express = require("express");
const apiRoutes = require("./src/routes");
const sessionMiddleware = require("./src/config/sessionMiddleware");
const { errorHandler, notFoundHandler } = require("./src/config/errorMiddleware");
const { testConnection } = require("./src/config/db");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Valorant API backend activo." });
});

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible iniciar el servidor:", error.message);
    process.exit(1);
  }
}

startServer();
