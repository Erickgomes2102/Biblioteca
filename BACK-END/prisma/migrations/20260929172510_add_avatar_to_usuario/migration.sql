-- CreateTable
CREATE TABLE `categorias` (
    `id_categorias` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(80) NOT NULL,

    UNIQUE INDEX `categorias_nome_key`(`nome`),
    PRIMARY KEY (`id_categorias`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `livros` (
    `id_livros` INTEGER NOT NULL AUTO_INCREMENT,
    `isbn` VARCHAR(20) NOT NULL,
    `titulo` VARCHAR(200) NOT NULL,
    `autor` VARCHAR(150) NOT NULL,
    `editora` VARCHAR(150) NOT NULL,
    `ano` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 0,
    `capa` VARCHAR(500) NULL,
    `id_categorias` INTEGER NOT NULL,

    UNIQUE INDEX `livros_isbn_key`(`isbn`),
    PRIMARY KEY (`id_livros`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuarios` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `tipo` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(500) NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id_usuarios`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leitores` (
    `id_leitores` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `cpf` VARCHAR(11) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `id_usuarios` INTEGER NOT NULL,

    UNIQUE INDEX `leitores_cpf_key`(`cpf`),
    UNIQUE INDEX `leitores_email_key`(`email`),
    PRIMARY KEY (`id_leitores`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emprestimos` (
    `id_emprestimo` INTEGER NOT NULL AUTO_INCREMENT,
    `data_emprestimo` DATE NOT NULL,
    `data_prevista` DATE NULL,
    `data_devolucao` DATE NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `multa` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `id_leitores` INTEGER NOT NULL,
    `id_livros` INTEGER NOT NULL,
    `id_usuarios` INTEGER NOT NULL,

    PRIMARY KEY (`id_emprestimo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `livros` ADD CONSTRAINT `livros_id_categorias_fkey` FOREIGN KEY (`id_categorias`) REFERENCES `categorias`(`id_categorias`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leitores` ADD CONSTRAINT `leitores_id_usuarios_fkey` FOREIGN KEY (`id_usuarios`) REFERENCES `usuarios`(`id_usuarios`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emprestimos` ADD CONSTRAINT `emprestimos_id_leitores_fkey` FOREIGN KEY (`id_leitores`) REFERENCES `leitores`(`id_leitores`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emprestimos` ADD CONSTRAINT `emprestimos_id_livros_fkey` FOREIGN KEY (`id_livros`) REFERENCES `livros`(`id_livros`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emprestimos` ADD CONSTRAINT `emprestimos_id_usuarios_fkey` FOREIGN KEY (`id_usuarios`) REFERENCES `usuarios`(`id_usuarios`) ON DELETE RESTRICT ON UPDATE CASCADE;
