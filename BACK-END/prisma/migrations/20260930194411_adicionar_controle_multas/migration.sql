-- AlterTable
ALTER TABLE `emprestimos` ADD COLUMN `data_pagamento` DATE NULL,
    ADD COLUMN `status_multa` VARCHAR(30) NOT NULL DEFAULT 'SEM_MULTA';
