import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role (full access, server-side only)
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Helper
function setHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Strip /api prefix to get the route
    const url = req.url?.replace(/^\/api/, '') || '/';
    const method = req.method?.toUpperCase() || 'GET';

    console.log(`[API] ${method} ${url}`);

    // Route: GET /health
    if (url === '/health' && method === 'GET') {
        try {
            const { error } = await supabase.from('properties').select('id').limit(1);
            if (error) throw error;
            return res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
        } catch (err) {
            return res.status(500).json({ status: 'error', message: String(err) });
        }
    }

    // Route: GET /properties
    if (url === '/properties' && method === 'GET') {
        let query = supabase.from('properties').select('*');
        const { type, operation, minPrice, maxPrice } = req.query;
        if (type) query = query.eq('type', type as string);
        if (operation) query = query.eq('operation', operation as string);
        if (minPrice) query = query.gte('price', Number(minPrice));
        if (maxPrice) query = query.lte('price', Number(maxPrice));
        query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // Route: POST /properties
    if (url === '/properties' && method === 'POST') {
        const { title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, main_image, images } = req.body;
        const { data: property, error } = await supabase
            .from('properties')
            .insert([{ title, description, price, location, type, operation, bedrooms, bathrooms, area, featured: !!featured, main_image }])
            .select()
            .single();
        if (error) return res.status(500).json({ error: error.message });
        if (images && Array.isArray(images)) {
            const imageData = images.map((url: string) => ({ property_id: property.id, url }));
            await supabase.from('property_images').insert(imageData);
        }
        return res.status(200).json({ id: property.id });
    }

    // Route: GET /properties/:id
    const propMatch = url.match(/^\/properties\/(\d+)$/);
    if (propMatch && method === 'GET') {
        const id = propMatch[1];
        const { data: property, error } = await supabase
            .from('properties')
            .select('*, property_images(*)')
            .eq('id', id)
            .single();
        if (error) return res.status(500).json({ error: error.message });
        if (!property) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json({ ...property, images: property.property_images });
    }

    // Route: PUT /properties/:id
    if (propMatch && method === 'PUT') {
        const id = propMatch[1];
        const { title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, status, main_image, images } = req.body;
        const { error } = await supabase
            .from('properties')
            .update({ title, description, price, location, type, operation, bedrooms, bathrooms, area, featured: !!featured, status, main_image })
            .eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        await supabase.from('property_images').delete().eq('property_id', id);
        if (images && Array.isArray(images)) {
            const imageData = images.map((url: string) => ({ property_id: parseInt(id), url }));
            await supabase.from('property_images').insert(imageData);
        }
        return res.status(200).json({ success: true });
    }

    // Route: DELETE /properties/:id
    if (propMatch && method === 'DELETE') {
        const id = propMatch[1];
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    // Route: GET /stats
    if (url === '/stats' && method === 'GET') {
        const [total, active, sold, inquiries] = await Promise.all([
            supabase.from('properties').select('id', { count: 'exact', head: true }),
            supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'disponible'),
            supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'vendida'),
            supabase.from('inquiries').select('id', { count: 'exact', head: true }),
        ]);
        return res.status(200).json({
            total: total.count || 0,
            active: active.count || 0,
            sold: sold.count || 0,
            inquiries: inquiries.count || 0,
        });
    }

    // Route: GET /favorites
    if (url === '/favorites' && method === 'GET') {
        const { data, error } = await supabase.from('favorites').select('properties(*)');
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data.map((f: any) => f.properties).filter(Boolean));
    }

    // Route: POST /favorites/:id
    const favMatch = url.match(/^\/favorites\/(\d+)$/);
    if (favMatch && method === 'POST') {
        const { error } = await supabase.from('favorites').insert([{ property_id: parseInt(favMatch[1]) }]);
        if (error && error.code !== '23505') return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    // Route: DELETE /favorites/:id
    if (favMatch && method === 'DELETE') {
        const { error } = await supabase.from('favorites').delete().eq('property_id', parseInt(favMatch[1]));
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    // Route: GET /inquiries
    if (url === '/inquiries' && method === 'GET') {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*, properties(title, main_image)')
            .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data.map((i: any) => ({
            ...i,
            property_title: i.properties?.title,
            property_image: i.properties?.main_image,
        })));
    }

    // Route: POST /inquiries
    if (url === '/inquiries' && method === 'POST') {
        const { property_id, client_name, client_phone, message } = req.body;
        const { error } = await supabase.from('inquiries').insert([{ property_id, client_name, client_phone, message }]);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
    }

    // 404 fallback
    return res.status(404).json({ error: `Route not found: ${method} ${url}` });
}
