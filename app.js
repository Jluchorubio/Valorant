const express = require("express");
const path = require("path");
const apiRoutes = require("./src/routes");
const { errorHandler, notFoundHandler } = require("./src/config/errorMiddleware");
const { testConnection } = require("./src/config/db");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src", "public")));

app.use("/", apiRoutes);
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
