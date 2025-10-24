import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Inicializa el cliente de Supabase una sola vez
const supabaseUrl = '%VITE_SUPABASE_URL%';
const supabaseKey = '%VITE_SUPABASE_ANON_KEY%';

let supabase;
if (supabaseUrl.startsWith('%VITE_')) {
    console.error("Supabase URL no configurada. Revisa tus variables de entorno.");
} else {
    supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Carga datos de una tabla de Supabase y los renderiza en un grid.
 * @param {string} tableName - El nombre de la tabla en Supabase (ej. 'restaurantes').
 * @param {string} gridId - El ID del elemento HTML donde se renderizarán las tarjetas.
 * @param {function(object): string} cardRenderer - Una función que toma un item y devuelve su HTML.
 */
export async function loadDataAndRender(tableName, gridId, cardRenderer) {
    const grid = document.getElementById(gridId);
    if (!supabase) {
        grid.innerHTML = '<p class="text-red-400">Error: No se pudo conectar con la base de datos.</p>';
        return;
    }

    try {
        const { data, error } = await supabase.from(tableName).select('*');

        if (error) throw error;

        if (data.length === 0) {
            grid.innerHTML = `<p>No hay ${tableName.replace('_', ' ')} para mostrar.</p>`;
            return;
        }

        // Limpiar el loader y renderizar las tarjetas
        grid.innerHTML = data.map(cardRenderer).join('');

    } catch (error) {
        console.error(`Error cargando ${tableName}:`, error);
        grid.innerHTML = `<p>No se pudieron cargar los ${tableName.replace('_', ' ')}.</p>`;
    }
}