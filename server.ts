import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import type { Request, Response } from "express";

// Local dev: use hardcoded credentials so server starts without env vars
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://afbcyivirvhcwdmdqyvz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYmN5aXZpcnZoY3dkbWRxeXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU1MTM3OCwiZXhwIjoyMDg3MTI3Mzc4fQ.yCZo1quJOEm1G3M4WzUrpHT4biOkATMYCJGta3c5XaA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // ─── Health ─────────────────────────────────────────────────────────────────
  app.get("/api/health", async (_req: Request, res: Response) => {
    const { error } = await supabase.from('properties').select('id').limit(1);
    if (error) return res.status(500).json({ status: 'error', message: error.message });
    res.json({ status: 'ok', database: 'connected' });
  });

  // ─── Properties ────────────────────────────────────────────────────────────
  app.get("/api/properties", async (req: Request, res: Response) => {
    let query = supabase.from('properties').select('*');
    const { type, operation, minPrice, maxPrice } = req.query;
    if (type) query = query.eq('type', type as string);
    if (operation) query = query.eq('operation', operation as string);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    const { data, error } = await supabase
      .from('properties').select('*, property_images(*)')
      .eq('id', req.params.id).single();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({ ...data, images: data.property_images });
  });

  app.post("/api/properties", async (req: Request, res: Response) => {
    const { title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, main_image, images } = req.body;
    const { data, error } = await supabase.from('properties')
      .insert([{ title, description, price, location, type, operation, bedrooms, bathrooms, area, featured: !!featured, main_image }])
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    if (images && Array.isArray(images)) {
      await supabase.from('property_images').insert(images.map((url: string) => ({ property_id: data.id, url })));
    }
    res.json({ id: data.id });
  });

  app.put("/api/properties/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    const { title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, status, main_image, images } = req.body;
    const { error } = await supabase.from('properties')
      .update({ title, description, price, location, type, operation, bedrooms, bathrooms, area, featured: !!featured, status, main_image })
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    await supabase.from('property_images').delete().eq('property_id', id);
    if (images && Array.isArray(images)) {
      await supabase.from('property_images').insert(images.map((url: string) => ({ property_id: parseInt(id), url })));
    }
    res.json({ success: true });
  });

  app.delete("/api/properties/:id", async (req: Request, res: Response) => {
    const { error } = await supabase.from('properties').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // ─── Stats ──────────────────────────────────────────────────────────────────
  app.get("/api/stats", async (_req: Request, res: Response) => {
    const [total, active, sold, inquiries] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'disponible'),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'vendida'),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }),
    ]);
    res.json({ total: total.count || 0, active: active.count || 0, sold: sold.count || 0, inquiries: inquiries.count || 0 });
  });

  // ─── Favorites ──────────────────────────────────────────────────────────────
  app.get("/api/favorites", async (_req: Request, res: Response) => {
    const { data, error } = await supabase.from('favorites').select('properties(*)');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map((f: any) => f.properties).filter(Boolean));
  });

  app.post("/api/favorites/:id", async (req: Request, res: Response) => {
    const { error } = await supabase.from('favorites').insert([{ property_id: parseInt(req.params.id) }]);
    if (error && error.code !== '23505') return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete("/api/favorites/:id", async (req: Request, res: Response) => {
    const { error } = await supabase.from('favorites').delete().eq('property_id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // ─── Inquiries ──────────────────────────────────────────────────────────────
  app.get("/api/inquiries", async (_req: Request, res: Response) => {
    const { data, error } = await supabase
      .from('inquiries').select('*, properties(title, main_image)')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map((i: any) => ({ ...i, property_title: i.properties?.title, property_image: i.properties?.main_image })));
  });

  app.post("/api/inquiries", async (req: Request, res: Response) => {
    const { property_id, client_name, client_phone, message } = req.body;
    const { error } = await supabase.from('inquiries').insert([{ property_id, client_name, client_phone, message }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // ─── Vite (Frontend) ────────────────────────────────────────────────────────
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);

  app.listen(PORT, () => {
    console.log(`✅ Servidor local: http://localhost:${PORT}`);
    console.log(`📡 Conectado a Supabase: ${SUPABASE_URL}`);
  });
}

startServer();
