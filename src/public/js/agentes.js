// SCRIPT PARA FETCH Y RENDER DINÁMICO

// ===== TRADUCCIÓN DE ROLES =====
const roleTranslation = {
    'Duelist': 'DUELISTA',
    'Initiator': 'INICIADOR',
    'Controller': 'CONTROLADOR',
    'Sentinel': 'CENTINELA'
};

// ===== TRADUCCIÓN DE HABILIDADES =====
const abilityTranslations = {
    'Q': 'Habilidad Q',
    'E': 'Habilidad E',
    'C': 'Habilidad C',
    'X': 'Definitiva',
    'Passive': 'Pasiva',
    'Grenade': 'Granada',
    'Flash': 'Destello',
    'Smoke': 'Humo',
    'Heal': 'Curación',
    'Wall': 'Muro',
    'Orb': 'Orbe',
    'Cloud': 'Nube',
    'Curveball': 'Curveball',
    'Hot Hands': 'Manos Ardientes',
    'Blaze': 'Llama',
    'Run it Back': 'Repetir Jugada',
    'Fast Lane': 'Carril Rápido',
    'Contagion': 'Contagio',
    'Fault Line': 'Falla',
    'Showstopper': 'Gran Final',
    'Blast Pack': 'Paquete Explosivo',
    'Boom Bot': 'Bot Explosivo',
    'Paint Shells': 'Proyectiles de Pintura',
    'Gatling': 'Ametralladora',
    'Devour': 'Devorar',
    'Dismiss': 'Despedir',
    'Leer': 'Mirada',
    'Paranoia': 'Paranoia',
    'Zero/Point': 'Cero/Punto',
    'Fade': 'Desvanecer',
    'Haunt': 'Emboscar',
    'Prowler': 'Acechador',
    'Seize': 'Capturar',
    'Nightfall': 'Anochecer',
    'Shock Bolt': 'Proyectil Eléctrico',
    'Recon Bolt': 'Proyectil de Reconocimiento',
    'Blindside': 'Destello Lateral',
    'Trademark': 'Marca Registrada',
    'Alarmbot': 'Robot Alarma',
    'Neural Theft': 'Robo Neural',
    'Wingman': 'Compañero',
    'Resurrection': 'Resurrección',
    'Slow Orb': 'Orbe Lento',
    'Toxic Screen': 'Pantalla Tóxica',
    'Poison Cloud': 'Nube Venenosa',
    'Snake Bite': 'Mordedura de Serpiente',
    'Petrol': 'Gasolina',
    'Cascade': 'Cascada',
    'Updraft': 'Corriente Ascendente',
    'Hunters Fury': 'Furia del Cazador',
    'Shrouded Step': 'Paso Sigiloso',
    'Last Resort': 'Último Recurso',
    'Stealth': 'Sigilo',
    'Door': 'Puerta',
    'Tripwire': 'Alambre Trampa',
    'Cyclone': 'Ciclón',
    'Barrier': 'Barrera',
    'Healing Orb': 'Orbe Curativo',
    'Damage Boost': 'Aumento de Daño',
    'Invulnerability': 'Invencibilidad'
};

(async function() {
    const container = document.getElementById('agentes-container');
    if (!container) return;

    try {
        const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
        const data = await res.json();
        const agents = data.data;

        // Definir roles y orden
        const roles = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
        const roleDisplay = {
            'Duelist': 'DUELISTA',
            'Initiator': 'INICIADOR',
            'Controller': 'CONTROLADOR',
            'Sentinel': 'CENTINELA'
        };

        // Organizar agentes por rol
        const agentsByRole = {};
        roles.forEach(role => agentsByRole[role] = []);

        agents.forEach(agent => {
            const roleName = agent.role?.displayName;
            if (roles.includes(roleName)) {
                agentsByRole[roleName].push(agent);
            }
        });

        // Renderizar cada rol con su grid
        for (let role of roles) {
            const agentsList = agentsByRole[role] || [];
            if (agentsList.length === 0) continue;

            // Crear sección de rol
            const roleSection = document.createElement('section');
            roleSection.className = 'mb-20 scroll-reveal';
            roleSection.innerHTML = `
                <h2 class="text-4xl md:text-5xl font-black text-[#ff4655] mb-2">${roleDisplay[role]}</h2>
                <div class="w-16 h-1 bg-white/30 mb-10"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="grid-${role}"></div>
            `;
            container.appendChild(roleSection);

            const grid = document.getElementById(`grid-${role}`);
            
            // Crear tarjetas para cada agente
            agentsList.forEach(agent => {
                const card = document.createElement('div');
                card.className = 'agent-card bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[#ff4655]/20 relative group';
                
                // Imagen full portrait (con fallback)
                const imgUrl = agent.fullPortrait || agent.displayIcon || agent.killfeedPortrait || '';
                
                // ===== CONSTRUCCIÓN DE HABILIDADES CON TRADUCCIÓN Y SCROLL =====
                let abilitiesHtml = '<div class="abilities-container">';
                
                agent.abilities?.forEach(ability => {
                    if (ability.slot !== 'Passive') {
                        // Intentar traducir el nombre de la habilidad
                        let abilityName = ability.displayName;
                        
                        // Buscar coincidencias parciales para traducir
                        Object.keys(abilityTranslations).forEach(key => {
                            if (ability.displayName.toLowerCase().includes(key.toLowerCase())) {
                                abilityName = ability.displayName.replace(new RegExp(key, 'i'), abilityTranslations[key]);
                            }
                        });
                        
                        // Si hay una traducción exacta, usarla
                        if (abilityTranslations[ability.displayName]) {
                            abilityName = abilityTranslations[ability.displayName];
                        }
                        
                        abilitiesHtml += `
                            <div class="flex items-start gap-3 p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                                <img src="${ability.displayIcon || ''}" class="w-10 h-10 object-contain flex-shrink-0" onerror="this.style.display='none'">
                                <div class="flex-1 min-w-0">
                                    <p class="font-bold text-sm text-[#ff4655]">${abilityName}</p>
                                    <p class="text-xs text-gray-300 leading-relaxed mt-1">${ability.description || 'Sin descripción disponible.'}</p>
                                </div>
                            </div>
                        `;
                    }
                });
                
                abilitiesHtml += '</div>';
                
                // Si no hay habilidades, mostrar mensaje
                if (!agent.abilities || agent.abilities.filter(a => a.slot !== 'Passive').length === 0) {
                    abilitiesHtml = '<p class="text-gray-500 text-xs p-3">No hay habilidades listadas</p>';
                }

                card.innerHTML = `
                    <div class="relative">
                        <img src="${imgUrl}" class="w-full h-64 object-cover object-top" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyYTIwMmEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SU1BR0VOIE5PIEZPVU5EPC90ZXh0Pjwvc3ZnPg=='">
                        <div class="card-overlay"></div>
                    </div>
                    <div class="p-5">
                        <h3 class="text-2xl font-black">${agent.displayName}</h3>
                        <p class="text-[#ff4655] font-semibold uppercase text-sm">${roleTranslation[agent.role?.displayName] || agent.role?.displayName || ''}</p>
                        <p class="text-gray-300 text-sm mt-2 line-clamp-2">${agent.description || 'Sin descripción disponible.'}</p>
                        
                        <button class="ability-btn w-full mt-4 text-sm toggle-abilities" data-agent="${agent.uuid}">VER HABILIDADES</button>
                        
                        <div id="abilities-${agent.uuid}" class="ability-dropdown mt-3 bg-black/60 rounded-lg overflow-hidden">
                            ${abilitiesHtml}
                        </div>
                    </div>
                `;

                grid.appendChild(card);
            });
        }

        // Añadir event listeners para los dropdowns (delegación)
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.toggle-abilities');
            if (!btn) return;

            const agentId = btn.dataset.agent;
            const dropdown = document.getElementById(`abilities-${agentId}`);
            
            if (dropdown) {
                dropdown.classList.toggle('open');
                btn.textContent = dropdown.classList.contains('open') ? 'OCULTAR HABILIDADES' : 'VER HABILIDADES';
            }
        });

    } catch (error) {
        console.error('Error fetching agents:', error);
        container.innerHTML = '<p class="text-red-500">Error al cargar agentes. Intenta más tarde.</p>';
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
