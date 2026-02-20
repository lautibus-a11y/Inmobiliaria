import pg from 'pg';

async function migrate() {
    const connectionString = 'postgresql://postgres:afX6TKPcNOahudET@db.afbcyivirvhcwdmdqyvz.supabase.co:5432/postgres';
    const client = new pg.Client({ connectionString });

    try {
        await client.connect();
        console.log('Conectado a Supabase (Postgres)...');

        // Create tables
        await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price NUMERIC NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL, -- 'casa', 'apartamento', 'terreno', 'comercial', 'villa'
        operation TEXT NOT NULL, -- 'venta', 'alquiler'
        bedrooms INTEGER,
        bathrooms INTEGER,
        area NUMERIC,
        featured BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'disponible', -- 'disponible', 'reservada', 'vendida'
        main_image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        url TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        client_name TEXT NOT NULL,
        client_phone TEXT,
        message TEXT,
        status TEXT DEFAULT 'pendiente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS favorites (
        property_id INTEGER PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Tablas creadas exitosamente.');

        // Seed initial data if empty
        const res = await client.query('SELECT COUNT(*) FROM properties');
        const count = parseInt(res.rows[0].count);

        if (count === 0) {
            console.log('Insertando datos iniciales...');
            await client.query(`
        INSERT INTO properties (title, description, price, location, type, operation, bedrooms, bathrooms, area, featured, main_image)
        VALUES 
        ('Casa Minimalista con Piscina', 'Hermosa casa de diseño moderno con amplios ventanales, piscina privada y jardín parquizado.', 450000, 'Poblenou, Barcelona', 'casa', 'venta', 3, 2, 120, true, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'),
        ('Atico de Lujo con Vistas', 'Exclusivo ático en el centro de la ciudad con terraza panorámica, acabados de primera calidad.', 285000, 'Eixample, Valencia', 'apartamento', 'venta', 2, 2, 85, false, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'),
        ('Terreno Urbano en Sierra Nevada', 'Amplio terreno con vistas espectaculares a la montaña. Ideal para proyecto de cabañas.', 120000, 'Sierra Nevada, Granada', 'terreno', 'venta', 0, 0, 1500, false, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')
      `);
            console.log('Datos iniciales insertados.');
        }

    } catch (err) {
        console.error('Error durante la migración:', err);
    } finally {
        await client.end();
    }
}

migrate();
