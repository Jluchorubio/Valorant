document.addEventListener("DOMContentLoaded", async () => {

    try {
        // ===== FETCH AGENTS =====
        const agentsRes = await fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true");
        const agentsData = await agentsRes.json();
        const agents = agentsData.data.filter(a => a.fullPortrait);

        // ===== FETCH MAPS =====
        const mapsRes = await fetch("https://valorant-api.com/v1/maps");
        const mapsData = await mapsRes.json();
        const maps = mapsData.data.filter(m => m.splash);

        // ===============================
        // LATEST ARTICLES (usar displayIcon)
        // ===============================

        // ===============================
        // ISO SECTION (big left image)
        // ===============================
        const isoImage = document.querySelector(".diagonal-iso .img-placeholder");

        if (isoImage && agents.length > 0) {

            // Buscar el agente llamado "Iso"
            const isoAgent = agents.find(agent => agent.displayName === "Iso");

            if (isoAgent && isoAgent.fullPortrait) {
                isoImage.style.background = `url(${isoAgent.fullPortrait}) center/cover no-repeat`;
            }
        }

        // ===============================
        // YOUR AGENTS (2 tilted cards)
        // ===============================
        const agentCards = document.querySelectorAll(".agent-card");

        agentCards.forEach((card, index) => {
            const agent = agents[index + 3];
            if (agent) {
                card.style.background = `url(${agent.fullPortrait}) center/cover no-repeat`;
            }
        });

        // ===============================
        // MAP SECTION
        // ===============================
        const mapPlaceholder = document.querySelector(".map-bg");

        if (mapPlaceholder && maps.length > 0) {
            const randomMap = maps[Math.floor(Math.random() * maps.length)];
            mapPlaceholder.style.background = `url(${randomMap.splash}) center/cover no-repeat`;
        }

    } catch (error) {
        console.error("Error cargando datos de Valorant API:", error);
    }

});
