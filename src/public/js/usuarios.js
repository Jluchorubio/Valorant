const rolesList = document.getElementById("rolesList");
const usersIndex = document.getElementById("usersIndex");
const createRoleSelect = document.getElementById("create_role_id");
const updateRoleSelect = document.getElementById("update_role_id");
const updateUserPicker = document.getElementById("update_user_picker");
const deleteUserPicker = document.getElementById("delete_user_picker");
const updateIdInput = document.getElementById("update_id");
const deleteIdInput = document.getElementById("delete_id");
const usersCards = document.getElementById("usersCards");

function renderUsersMessage(message) {
    usersCards.innerHTML = "";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = message;
    usersCards.appendChild(empty);
}

function roleClassName(roleName) {
    const normalized = String(roleName || "").toLowerCase();
    if (normalized === "admin") return "role-admin";
    return "role-user";
}

function renderUsersCards(users) {
    usersCards.innerHTML = "";

    if (!Array.isArray(users) || !users.length) {
        renderUsersMessage("No hay usuarios registrados.");
        return;
    }

    const fragment = document.createDocumentFragment();

    users.forEach((user) => {
        const card = document.createElement("article");
        card.className = "user-card";

        const title = document.createElement("h3");
        title.textContent = user.username;

        const email = document.createElement("p");
        email.className = "user-email";
        email.textContent = user.email;

        const meta = document.createElement("div");
        meta.className = "user-meta";

        const idTag = document.createElement("span");
        idTag.className = "meta-chip";
        idTag.textContent = `ID ${user.id}`;

        const roleTag = document.createElement("span");
        roleTag.className = `meta-chip ${roleClassName(user.role)}`;
        roleTag.textContent = `Role: ${user.role || "N/A"}`;

        meta.append(idTag, roleTag);
        card.append(title, email, meta);
        fragment.appendChild(card);
    });

    usersCards.appendChild(fragment);
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

function buildUserOption(user) {
    const option = document.createElement("option");
    option.value = String(user.id);
    option.textContent = `${user.id} - ${user.username} (${user.email})`;
    return option;
}

async function loadRoles() {
    const roles = await apiRequest("/api/roles");
    rolesList.innerHTML = "";
    createRoleSelect.innerHTML = "";
    updateRoleSelect.innerHTML = "";

    const emptyRole = document.createElement("option");
    emptyRole.value = "";
    emptyRole.textContent = "No cambiar role";
    updateRoleSelect.appendChild(emptyRole);

    roles.forEach((role) => {
        const li = document.createElement("li");
        li.className = "role-chip";
        li.textContent = `ID ${role.id}: ${role.name}`;
        rolesList.appendChild(li);

        const createOpt = document.createElement("option");
        createOpt.value = String(role.id);
        createOpt.textContent = `ID ${role.id}: ${role.name}`;
        createRoleSelect.appendChild(createOpt);

        const updateOpt = document.createElement("option");
        updateOpt.value = String(role.id);
        updateOpt.textContent = `ID ${role.id}: ${role.name}`;
        updateRoleSelect.appendChild(updateOpt);
    });
}

async function loadUsersIndex() {
    const users = await apiRequest("/api/users");
    usersIndex.innerHTML = "";
    updateUserPicker.innerHTML = "";
    deleteUserPicker.innerHTML = "";

    users.forEach((user) => {
        usersIndex.appendChild(buildUserOption(user));
        updateUserPicker.appendChild(buildUserOption(user));
        deleteUserPicker.appendChild(buildUserOption(user));
    });

    renderUsersCards(users);

    if (users.length) {
        updateIdInput.value = users[0].id;
        deleteIdInput.value = users[0].id;
    } else {
        updateIdInput.value = "";
        deleteIdInput.value = "";
    }
}

updateUserPicker.addEventListener("change", () => {
    updateIdInput.value = updateUserPicker.value;
});

deleteUserPicker.addEventListener("change", () => {
    deleteIdInput.value = deleteUserPicker.value;
});

document.getElementById("refreshUsers").addEventListener("click", async () => {
    try {
        await loadUsersIndex();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("createUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        await apiRequest("/api/users", {
            method: "POST",
            body: JSON.stringify({
                username: document.getElementById("create_username").value.trim(),
                email: document.getElementById("create_email").value.trim(),
                password: document.getElementById("create_password").value,
                role_id: Number(createRoleSelect.value),
            }),
        });

        event.target.reset();
        await loadUsersIndex();
        alert("Usuario creado.");
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("updateUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = Number(updateIdInput.value);
    const payload = {};

    const username = document.getElementById("update_username").value.trim();
    const email = document.getElementById("update_email").value.trim();
    const password = document.getElementById("update_password").value;
    const roleIdRaw = updateRoleSelect.value;

    if (username) payload.username = username;
    if (email) payload.email = email;
    if (password) payload.password = password;
    if (roleIdRaw) payload.role_id = Number(roleIdRaw);

    if (!Object.keys(payload).length) {
        alert("Debes enviar al menos un campo para actualizar.");
        return;
    }

    try {
        await apiRequest(`/api/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        event.target.reset();
        await loadUsersIndex();
        alert("Usuario actualizado.");
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("deleteUserForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = Number(deleteIdInput.value);
    try {
        await apiRequest(`/api/users/${id}`, { method: "DELETE" });
        event.target.reset();
        await loadUsersIndex();
        alert("Usuario eliminado.");
    } catch (error) {
        alert(error.message);
    }
});

(async function init() {
    try {
        await loadRoles();
        await loadUsersIndex();
    } catch (error) {
        alert(error.message);
        renderUsersMessage(error.message);
    }
})();

// Script para el menú hamburguesa
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
