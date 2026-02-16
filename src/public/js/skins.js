    // Tu JavaScript existente (sin cambios)
    const createWeaponSelect = document.getElementById("create_weapon_api_id");
    const createUserSelect = document.getElementById("create_user_id");
    const updateWeaponSelect = document.getElementById("update_weapon_api_id");
    const catalogSelect = document.getElementById("create_api_skin_id");
    const catalogPreview = document.getElementById("catalogPreview");
    const skinsOutput = document.getElementById("skinsOutput");
    const updateSkinInfo = document.getElementById("updateSkinInfo");
    const updateSkinPreview = document.getElementById("updateSkinPreview");
    const deleteSkinInfo = document.getElementById("deleteSkinInfo");
    const deleteSkinPreview = document.getElementById("deleteSkinPreview");
    const inventoryPreview = document.getElementById("inventoryPreview");

    const inventoryUserAdd = document.getElementById("inventory_user_id");
    const inventoryUserUpdate = document.getElementById("inventory_update_user_id");
    const inventoryUserDelete = document.getElementById("inventory_delete_user_id");
    const inventoryAddSkinSelect = document.getElementById("inventory_add_skin_id");
    const inventoryUpdateSkinSelect = document.getElementById("inventory_update_skin_id");
    const inventoryItemSelect = document.getElementById("inventory_item_id");
    const inventoryDeleteItemSelect = document.getElementById("inventory_delete_item_id");

    const SKIN_PLACEHOLDER_IMAGE =
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="220" viewBox="0 0 640 220"><rect width="640" height="220" fill="#0f121b"/><path d="M78 170L150 54h58l-72 116z" fill="#ff4655"/><text x="242" y="108" fill="#d8def4" font-size="36" font-family="Arial, sans-serif">Skin no disponible</text></svg>'
      );

    function setImage(imgElement, url) {
      if (url) {
        imgElement.src = url;
        imgElement.classList.remove("hidden");
      } else {
        imgElement.removeAttribute("src");
        imgElement.classList.add("hidden");
      }
    }

    async function apiRequest(url, options = {}) {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Error en la solicitud");
      return data;
    }

    function renderWeaponOption(weapon) {
      const option = document.createElement("option");
      option.value = weapon.api_id;
      option.textContent = weapon.name;
      return option;
    }

    function renderUserOption(user) {
      const option = document.createElement("option");
      option.value = String(user.id);
      option.textContent = `${user.id} - ${user.username} (${user.email})`;
      return option;
    }

    function renderSkinOption(skin) {
      const option = document.createElement("option");
      option.value = String(skin.id);
      option.textContent = `${skin.id} - ${skin.name}`;
      return option;
    }

    function renderSavedSkinsMessage(message) {
      skinsOutput.innerHTML = "";
      const empty = document.createElement("p");
      empty.className = "col-span-full text-center p-4 border border-dashed border-white/20 rounded-lg text-[#bbc3db] bg-[rgba(10,13,23,0.65)]";
      empty.textContent = message;
      skinsOutput.appendChild(empty);
    }

    function renderSavedSkins(skins) {
      skinsOutput.innerHTML = "";

      if (!Array.isArray(skins) || !skins.length) {
        renderSavedSkinsMessage("No hay skins guardadas todavia.");
        return;
      }

      const fragment = document.createDocumentFragment();
      skins.forEach((skin) => {
        const card = document.createElement("article");
        card.className = "border border-white/10 border-t-2 border-t-[#ff4655]/60 rounded-xl overflow-hidden bg-[rgba(8,11,19,0.9)] shadow-2xl";

        const image = document.createElement("img");
        image.className = "w-full h-[150px] object-contain bg-[radial-gradient(circle_at_50%_20%,rgba(255,70,85,0.15),rgba(9,12,20,0.98))] p-2";
        image.loading = "lazy";
        image.decoding = "async";
        image.src = skin.image || SKIN_PLACEHOLDER_IMAGE;
        image.alt = `${skin.name || "Skin"} - ${skin.weapon_name || "Arma"}`;
        image.addEventListener("error", () => {
          image.src = SKIN_PLACEHOLDER_IMAGE;
        });

        const body = document.createElement("div");
        body.className = "grid gap-1 p-3";

        const name = document.createElement("h3");
        name.className = "text-lg font-bold";
        name.textContent = skin.name || "Skin sin nombre";

        const weapon = document.createElement("p");
        weapon.className = "text-[#bbc3db] text-base";
        weapon.textContent = `Arma: ${skin.weapon_name || "No disponible"}`;

        const id = document.createElement("p");
        id.className = "text-[#95a2c8] text-base";
        id.textContent = `ID BD: ${skin.id}`;

        body.append(name, weapon, id);
        card.append(image, body);
        fragment.appendChild(card);
      });

      skinsOutput.appendChild(fragment);
    }

    async function loadWeaponsCatalog() {
      const weapons = await apiRequest("/api/weapons/catalog");
      createWeaponSelect.innerHTML = "";
      updateWeaponSelect.innerHTML = "";

      const updateEmpty = document.createElement("option");
      updateEmpty.value = "";
      updateEmpty.textContent = "No cambiar weapon";
      updateWeaponSelect.appendChild(updateEmpty);

      weapons.forEach((weapon) => {
        createWeaponSelect.appendChild(renderWeaponOption(weapon));
        updateWeaponSelect.appendChild(renderWeaponOption(weapon));
      });
    }

    async function loadUsersCatalog() {
      const users = await apiRequest("/api/users");
      const userSelects = [createUserSelect, inventoryUserAdd, inventoryUserUpdate, inventoryUserDelete];
      userSelects.forEach((select) => {
        select.innerHTML = "";
        users.forEach((user) => select.appendChild(renderUserOption(user)));
      });
    }

    async function loadExistingSkinsForInventorySelectors() {
      const skins = await apiRequest("/api/skins");
      inventoryAddSkinSelect.innerHTML = "";
      inventoryUpdateSkinSelect.innerHTML = "";

      const emptyUpdate = document.createElement("option");
      emptyUpdate.value = "";
      emptyUpdate.textContent = "No cambiar skin";
      inventoryUpdateSkinSelect.appendChild(emptyUpdate);

      skins.forEach((skin) => {
        inventoryAddSkinSelect.appendChild(renderSkinOption(skin));
        inventoryUpdateSkinSelect.appendChild(renderSkinOption(skin));
      });
    }

    async function loadSkinsForSelectedWeapon(search = "") {
      const weaponApiId = createWeaponSelect.value;
      if (!weaponApiId) {
        catalogSelect.innerHTML = "";
        catalogSelect.disabled = true;
        setImage(catalogPreview, "");
        return;
      }

      const query = new URLSearchParams({ weapon_api_id: weaponApiId });
      if (search) query.set("search", search);

      const skins = await apiRequest(`/api/skins/catalog?${query.toString()}`);
      catalogSelect.innerHTML = "";

      if (!skins.length) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No hay skins para este filtro";
        catalogSelect.appendChild(option);
        catalogSelect.disabled = true;
        setImage(catalogPreview, "");
        return;
      }

      skins.forEach((skin) => {
        const option = document.createElement("option");
        option.value = skin.api_skin_id;
        option.textContent = skin.name;
        option.dataset.image = skin.image || "";
        catalogSelect.appendChild(option);
      });

      catalogSelect.disabled = false;
      setImage(catalogPreview, skins[0].image || "");
    }

    async function loadInventoryItemsByUser(userId) {
      const data = await apiRequest(`/api/inventories/user/${userId}`);
      inventoryItemSelect.innerHTML = "";
      inventoryDeleteItemSelect.innerHTML = "";

      data.weapons.forEach((item) => {
        const text = `${item.inventory_weapon_id} - ${item.name} / ${item.skin_name || "N/A"} / x${item.quantity}`;
        const optA = document.createElement("option");
        optA.value = String(item.inventory_weapon_id);
        optA.textContent = text;
        inventoryItemSelect.appendChild(optA);

        const optB = document.createElement("option");
        optB.value = String(item.inventory_weapon_id);
        optB.textContent = text;
        inventoryDeleteItemSelect.appendChild(optB);
      });

      inventoryPreview.textContent = JSON.stringify(data, null, 2);
    }

    createWeaponSelect.addEventListener("change", async () => {
      try {
        document.getElementById("catalog_search").value = "";
        await loadSkinsForSelectedWeapon("");
      } catch (error) {
        alert(error.message);
      }
    });

    catalogSelect.addEventListener("change", () => {
      const selected = catalogSelect.options[catalogSelect.selectedIndex];
      setImage(catalogPreview, selected ? selected.dataset.image : "");
    });

    inventoryUserUpdate.addEventListener("change", async () => {
      try {
        if (inventoryUserUpdate.value) await loadInventoryItemsByUser(inventoryUserUpdate.value);
      } catch (error) {
        inventoryPreview.textContent = error.message;
      }
    });

    inventoryUserDelete.addEventListener("change", async () => {
      try {
        if (inventoryUserDelete.value) await loadInventoryItemsByUser(inventoryUserDelete.value);
      } catch (error) {
        inventoryPreview.textContent = error.message;
      }
    });

    document.getElementById("searchCatalogBtn").addEventListener("click", async () => {
      try {
        const search = document.getElementById("catalog_search").value.trim();
        await loadSkinsForSelectedWeapon(search);
      } catch (error) {
        alert(error.message);
      }
    });

    async function previewSkinById(id, infoEl, imgEl) {
      try {
        const skin = await apiRequest(`/api/skins/${id}`);
        infoEl.textContent = `ID: ${skin.id} | Arma: ${skin.weapon_name || skin.weapon_id} | Skin: ${skin.name}`;
        setImage(imgEl, skin.image || SKIN_PLACEHOLDER_IMAGE);
      } catch (error) {
        infoEl.textContent = error.message;
        setImage(imgEl, "");
      }
    }

    async function loadSkins() {
      try {
        const skins = await apiRequest("/api/skins");
        renderSavedSkins(skins);
      } catch (error) {
        renderSavedSkinsMessage(error.message);
      }
    }

    document.getElementById("createSkinForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        if (!createUserSelect.value) {
          alert("No hay usuarios disponibles para guardar inventario.");
          return;
        }
        if (!catalogSelect.value) {
          alert("Selecciona una skin valida del catalogo.");
          return;
        }

        await apiRequest("/api/skins", {
          method: "POST",
          body: JSON.stringify({
            weapon_api_id: createWeaponSelect.value,
            api_skin_id: catalogSelect.value,
            user_id: Number(createUserSelect.value),
            quantity: Number(document.getElementById("create_quantity").value),
          }),
        });

        await loadSkins();
        await loadExistingSkinsForInventorySelectors();
        alert("Skin guardada en inventario.");
      } catch (error) {
        alert(error.message);
      }
    });

    document.getElementById("updateSkinForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = Number(document.getElementById("update_skin_id").value);
      const payload = {};
      const weaponApiId = updateWeaponSelect.value;
      const apiSkinId = document.getElementById("update_api_skin_id").value.trim();

      if (weaponApiId) payload.weapon_api_id = weaponApiId;
      if (apiSkinId) payload.api_skin_id = apiSkinId;

      if (!Object.keys(payload).length) {
        alert("Debes enviar al menos un campo para actualizar.");
        return;
      }

      try {
        await apiRequest(`/api/skins/${id}`, { method: "PUT", body: JSON.stringify(payload) });
        await previewSkinById(id, updateSkinInfo, updateSkinPreview);
        await loadSkins();
        await loadExistingSkinsForInventorySelectors();
        alert("Skin actualizada.");
      } catch (error) {
        alert(error.message);
      }
    });

    document.getElementById("deleteSkinForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = Number(document.getElementById("delete_skin_id").value);
      try {
        await apiRequest(`/api/skins/${id}`, { method: "DELETE" });
        deleteSkinInfo.textContent = "";
        setImage(deleteSkinPreview, "");
        await loadSkins();
        await loadExistingSkinsForInventorySelectors();
        alert("Skin eliminada.");
      } catch (error) {
        alert(error.message);
      }
    });

    document.getElementById("previewUpdateSkinBtn").addEventListener("click", async () => {
      const id = Number(document.getElementById("update_skin_id").value);
      if (!id) return alert("Ingresa un ID valido.");
      await previewSkinById(id, updateSkinInfo, updateSkinPreview);
    });

    document.getElementById("previewDeleteSkinBtn").addEventListener("click", async () => {
      const id = Number(document.getElementById("delete_skin_id").value);
      if (!id) return alert("Ingresa un ID valido.");
      await previewSkinById(id, deleteSkinInfo, deleteSkinPreview);
    });

    document.getElementById("inventoryAddForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await apiRequest(`/api/inventories/user/${inventoryUserAdd.value}/skins`, {
          method: "POST",
          body: JSON.stringify({
            skin_id: Number(inventoryAddSkinSelect.value),
            quantity: Number(document.getElementById("inventory_add_quantity").value),
          }),
        });

        if (inventoryUserUpdate.value) await loadInventoryItemsByUser(inventoryUserUpdate.value);
        alert("Skin agregada al inventario del usuario.");
      } catch (error) {
        alert(error.message);
      }
    });

    document.getElementById("inventoryUpdateForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = {};
      const newSkinId = inventoryUpdateSkinSelect.value;
      const newQuantity = document.getElementById("inventory_update_quantity").value;

      if (newSkinId) payload.skin_id = Number(newSkinId);
      if (newQuantity) payload.quantity = Number(newQuantity);

      if (!Object.keys(payload).length) {
        alert("Debes enviar skin y/o cantidad para actualizar.");
        return;
      }

      try {
        await apiRequest(
          `/api/inventories/user/${inventoryUserUpdate.value}/skins/${inventoryItemSelect.value}`,
          { method: "PUT", body: JSON.stringify(payload) }
        );

        await loadInventoryItemsByUser(inventoryUserUpdate.value);
        alert("Inventario actualizado.");
      } catch (error) {
        alert(error.message);
      }
    });

    document.getElementById("inventoryDeleteForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await apiRequest(
          `/api/inventories/user/${inventoryUserDelete.value}/skins/${inventoryDeleteItemSelect.value}`,
          { method: "DELETE" }
        );

        await loadInventoryItemsByUser(inventoryUserDelete.value);
        alert("Skin eliminada del inventario.");
      } catch (error) {
        alert(error.message);
      }
    });

    document.getElementById("refreshSkins").addEventListener("click", loadSkins);

    (async function init() {
      try {
        setImage(catalogPreview, "");
        setImage(updateSkinPreview, "");
        setImage(deleteSkinPreview, "");
        await loadWeaponsCatalog();
        await loadUsersCatalog();
        await loadSkinsForSelectedWeapon("");
        await loadSkins();
        await loadExistingSkinsForInventorySelectors();
        if (inventoryUserUpdate.value) await loadInventoryItemsByUser(inventoryUserUpdate.value);
      } catch (error) {
        alert(error.message);
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