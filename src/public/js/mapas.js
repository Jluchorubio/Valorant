        (async function() {
            const grid = document.getElementById('mapas-grid');
            if (!grid) return;

            try {
                const res = await fetch('https://valorant-api.com/v1/maps');
                const data = await res.json();
                const maps = data.data;

                maps.forEach(map => {
                    // Filtrar mapas que no sean de The Range o nulos
                    if (!map.displayName || map.displayName === 'The Range' || !map.splash) return;

                    const card = document.createElement('div');
                    card.className = 'map-card relative group';

                    // Coordenadas: si no existen, placeholder
                    const coords = map.coordinates || '??° ??′ ??″';

                    card.innerHTML = `
                        <div class="relative overflow-hidden">
                            <img src="${map.splash}" alt="${map.displayName}" class="w-full h-56 object-cover" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMxYzI4MzAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TUFQIE5PVCBGT1VORDwvdGV4dD48L3N2Zz4='">
                            <div class="map-overlay"></div>
                        </div>
                        <div class="p-6">
                            <h3 class="text-3xl font-black">${map.displayName}</h3>
                            <p class="text-[#ff4655] font-mono text-sm mt-1">${coords}</p>
                            <p class="text-gray-300 text-sm mt-3 line-clamp-2">${map.description || 'Un campo de batalla táctico en el mundo de VALORANT.'}</p>
                            <div class="mt-5 flex justify-end">
                                <span class="text-xs text-white/50 border border-white/10 px-3 py-1 rounded-full">${map.assetPath?.split('/').pop() || 'mapa'}</span>
                            </div>
                        </div>
                    `;
                    grid.appendChild(card);
                });

            } catch (error) {
                console.error('Error fetching maps:', error);
                grid.innerHTML = '<p class="text-red-500 col-span-3">Error al cargar mapas. Intenta más tarde.</p>';
            }
        })();

    // Script para el menú hamburguesa
    document.addEventListener('DOMContentLoaded', function() {
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
            });
        }
    });

