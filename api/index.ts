import express, { Router } from "express";
import { supabase } from "../src/supabase";

const app = express();
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const { data, error } = await supabase.from('properties').select('id').limit(1);
        if (error) throw error;
        res.json({ status: "ok", database: "connected", timestamp: new Date() });
    } catch (err) {
        console.error("Health check failed:", err);
        res.status(500).json({ status: "error", database: "disconnected", error: String(err) });
    }
});

const apiRouter = Router();

apiRouter.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Properties
apiRouter.get("/properties", async (req, res) => {
    const { type, operation, minPrice, maxPrice } = req.query;
    let query = supabase.from('properties').select('*');

    if (type) query = query.eq('type', type);
    if (operation) query = query.eq('operation', operation);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));

    query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

apiRouter.get("/properties/:id", async (req, res) => {
    const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*, property_images(*)')
        .eq('id', req.params.id)
        .single();

    if (propError) return res.status(500).json({ error: propError.message });
    if (!property) return res.status(404).json({ error: "Property not found" });

    res.json({ ...property, images: property.property_images });
});

apiRouter.post("/properties", async (req, res) => {
    const { title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, main_image, images } = req.body;

    const { data: property, error: propError } = await supabase
        .from('properties')
        .insert([{
            title, description, price, location, type, operation, bedrooms, bathrooms, area, featured: !!featured, main_image
        }])
        .select()
        .single();

    if (propError) return res.status(500).json({ error: propError.message });

    if (images && Array.isArray(images)) {
        const imageData = images.map(url => ({ property_id: property.id, url }));
        const { error: imgError } = await supabase.from('property_images').insert(imageData);
        if (imgError) console.error("Error inserting images:", imgError);
    }

    res.json({ id: property.id });
});

apiRouter.put("/properties/:id", async (req, res) => {
    const { title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, status, main_image, images } = req.body;

    const { error: propError } = await supabase
        .from('properties')
        .update({
            title, description, price, location, type, operation, bedrooms, bathrooms, area, featured: !!featured, status, main_image
        })
        .eq('id', req.params.id);

    if (propError) return res.status(500).json({ error: propError.message });

    await supabase.from('property_images').delete().eq('property_id', req.params.id);

    if (images && Array.isArray(images)) {
        const imageData = images.map(url => ({ property_id: parseInt(req.params.id), url }));
        const { error: imgError } = await supabase.from('property_images').insert(imageData);
        if (imgError) console.error("Error updating images:", imgError);
    }

    res.json({ success: true });
});

apiRouter.delete("/properties/:id", async (req, res) => {
    const { error } = await supabase.from('properties').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// Stats
apiRouter.get("/stats", async (req, res) => {
    const [total, active, sold, inquiries] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'disponible'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'vendida'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true })
    ]);

    res.json({
        total: total.count || 0,
        active: active.count || 0,
        sold: sold.count || 0,
        inquiries: inquiries.count || 0
    });
});

// Favorites
apiRouter.get("/favorites", async (req, res) => {
    const { data, error } = await supabase
        .from('favorites')
        .select('properties(*)')

    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(f => f.properties).filter(Boolean));
});

apiRouter.post("/favorites/:id", async (req, res) => {
    const { error } = await supabase.from('favorites').insert([{ property_id: req.params.id }]);
    if (error && error.code !== '23505') return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

apiRouter.delete("/favorites/:id", async (req, res) => {
    const { error } = await supabase.from('favorites').delete().eq('property_id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// Inquiries
apiRouter.get("/inquiries", async (req, res) => {
    const { data, error } = await supabase
        .from('inquiries')
        .select('*, properties(title, main_image)')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(i => ({
        ...i,
        property_title: i.properties?.title,
        property_image: i.properties?.main_image
    })));
});

apiRouter.post("/inquiries", async (req, res) => {
    const { property_id, client_name, client_phone, message } = req.body;
    const { error } = await supabase.from('inquiries').insert([{
        property_id, client_name, client_phone, message
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.use("/api", apiRouter);

export default app;
