CREATE DATABASE IF NOT EXISTS `dispexa` DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

USE `dispexa`;

-- Table: usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) DEFAULT NULL,
    `data_nascimento` DATE NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
    `grupo_id` INT UNSIGNED DEFAULT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `ux_usuarios_email` (`email`),
    INDEX `idx_usuarios_status` (`status`),
    INDEX `idx_usuarios_grupo` (`grupo_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table: grupos
CREATE TABLE IF NOT EXISTS `grupos` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `owner_id` INT UNSIGNED DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX (`owner_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

ALTER TABLE `grupos`
ADD CONSTRAINT IF NOT EXISTS `fk_grupos_owner` FOREIGN KEY (`owner_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Table: categoria
CREATE TABLE IF NOT EXISTS `categoria` (
    `id_categoria` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` TEXT DEFAULT NULL,
    `status` VARCHAR(50) DEFAULT 'ativo',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_categoria`),
    UNIQUE KEY `ux_categoria_nome` (`nome`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table: alimento
CREATE TABLE IF NOT EXISTS `alimento` (
    `id_alimento` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NOT NULL,
    `id_categoria` INT UNSIGNED NOT NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL DEFAULT 0,
    `unidade` VARCHAR(50) DEFAULT NULL,
    `estoque_minimo` DECIMAL(10, 3) NOT NULL DEFAULT 0,
    `validade` DATE DEFAULT NULL,
    `observacoes` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_alimento`),
    INDEX (`id_categoria`),
    INDEX (`validade`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

ALTER TABLE `alimento`
ADD CONSTRAINT IF NOT EXISTS `fk_alimento_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Table: consumo
CREATE TABLE IF NOT EXISTS `consumo` (
    `id_consumo` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_alimento` INT UNSIGNED NOT NULL,
    `quantidade` DECIMAL(10, 3) NOT NULL,
    `data` DATE NOT NULL,
    `observacoes` TEXT DEFAULT NULL,
    `registrado_por` INT UNSIGNED DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_consumo`),
    INDEX (`id_alimento`),
    INDEX (`data`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

ALTER TABLE `consumo`
ADD CONSTRAINT IF NOT EXISTS `fk_consumo_alimento` FOREIGN KEY (`id_alimento`) REFERENCES `alimento` (`id_alimento`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `consumo`
ADD CONSTRAINT IF NOT EXISTS `fk_consumo_registrado_por` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO
    usuarios (
        nome,
        email,
        senha,
        data_nascimento,
        status,
        created_at,
        is_admin
    )
VALUES (
        'Admin',
        'admin@dispexa.local',
        '40028922',
        '2025-01-01',
        'ativo',
        1,
        NOW()
    );