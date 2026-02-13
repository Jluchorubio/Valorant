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
        // HERO SECTION (background agent)
        // ===============================
        const heroPlaceholder = document.querySelector(".diagonal-hero .img-placeholder");

        if (heroPlaceholder && agents.length > 0) {
            const randomAgent = agents[Math.floor(Math.random() * agents.length)];
            heroPlaceholder.style.background = `url(${randomAgent.background}) center/cover no-repeat`;
        }

        // ===============================
        // LATEST ARTICLES (usar displayIcon)
        // ===============================
        const articlePlaceholders = document.querySelectorAll(".article-card .img-placeholder");

        articlePlaceholders.forEach((placeholder, index) => {
            const agent = agents[index % agents.length];
            placeholder.style.background = `url(${agent.displayIcon}) center/contain no-repeat`;
            placeholder.style.backgroundColor = "#0b0b0f";
        });

        // ===============================
        // ISO SECTION (big left image)
        // ===============================
        const isoImage = document.querySelector(".diagonal-iso .img-placeholder");

        if (isoImage && agents.length > 1) {
            isoImage.style.background = `url(${agents[1].fullPortrait}) center/cover no-repeat`;
        }

        // ===============================
        // WE ARE VALORANT (right image)
        // ===============================
        const weAreImage = document.querySelector(".diagonal-dark-section .img-placeholder");

        if (weAreImage && agents.length > 2) {
            weAreImage.style.background = `url(${agents[2].fullPortrait}) center/cover no-repeat`;
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
