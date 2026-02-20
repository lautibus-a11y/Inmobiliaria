import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./api/index";

async function startServer() {
  const PORT = 3000;

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
    console.log(`Modo: Desarrollo (Supabase SDK)`);
  });
}

startServer();
