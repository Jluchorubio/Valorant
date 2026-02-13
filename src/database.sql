-- =========================
-- CREAR BASE DE DATOS
-- =========================
CREATE DATABASE valorant_db;
USE valorant_db;

-- =========================
-- TABLA ROLES
-- =========================
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- TABLA USERS
-- =========================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =========================
-- TABLA INVENTORIES
-- =========================
CREATE TABLE inventories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- TABLA WEAPONS
-- =========================
CREATE TABLE weapons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    api_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    image TEXT,
    price INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLA SKINS
-- =========================
CREATE TABLE skins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    weapon_id INT NOT NULL,
    api_skin_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (weapon_id) REFERENCES weapons(id) ON DELETE CASCADE
);

-- =========================
-- TABLA INTERMEDIA INVENTORY_WEAPONS
-- =========================
CREATE TABLE inventory_weapons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    weapon_id INT NOT NULL,
    skin_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventories(id) ON DELETE CASCADE,
    FOREIGN KEY (weapon_id) REFERENCES weapons(id) ON DELETE CASCADE,
    FOREIGN KEY (skin_id) REFERENCES skins(id) ON DELETE CASCADE
);

-- =========================
-- INSERT ROLES
-- =========================
INSERT INTO roles (name) VALUES
('admin'),
('user');

-- =========================
-- INSERT USERS
-- (Sin encriptar porque es prueba)
-- =========================
INSERT INTO users (username, email, password, role_id) VALUES
('admin_valo', 'admin@valorant.com', 'valorant123', 1),
('jake', 'jake@valorant.com', 'valorant123', 2),
('maria', 'maria@valorant.com', 'valorant123', 2),
('carlos', 'carlos@valorant.com', 'valorant123', 2);

-- =========================
-- CREAR INVENTARIOS PARA CADA USUARIO
-- =========================
INSERT INTO inventories (user_id) VALUES
(1),
(2),
(3),
(4);
