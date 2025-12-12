-- =====================================================
-- FallsCarEnterprise - Script de Criação do Banco MySQL
-- =====================================================

CREATE DATABASE IF NOT EXISTS fallscar_enterprise
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fallscar_enterprise;

-- =====================================================
-- TABELAS DE CONFIGURAÇÃO E LOCALIZAÇÃO
-- =====================================================

CREATE TABLE cidades (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cidades_uf (uf),
    INDEX idx_cidades_nome (nome)
) ENGINE=InnoDB;

CREATE TABLE lojas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    cidade_id CHAR(36) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON DELETE RESTRICT,
    INDEX idx_lojas_cidade (cidade_id),
    INDEX idx_lojas_ativo (ativo)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE VEÍCULOS E CATEGORIAS
-- =====================================================

CREATE TABLE categorias_veiculo (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    valor_diaria DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_categorias_nome (nome)
) ENGINE=InnoDB;

CREATE TABLE veiculos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    modelo VARCHAR(100) NOT NULL,
    placa VARCHAR(10) NOT NULL UNIQUE,
    cor VARCHAR(50),
    ano INT,
    status ENUM('Livre', 'Alugado', 'Reservado', 'Manutencao') DEFAULT 'Livre',
    imagem_url TEXT,
    categoria_id CHAR(36) NOT NULL,
    loja_atual_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias_veiculo(id) ON DELETE RESTRICT,
    FOREIGN KEY (loja_atual_id) REFERENCES lojas(id) ON DELETE RESTRICT,
    INDEX idx_veiculos_status (status),
    INDEX idx_veiculos_categoria (categoria_id),
    INDEX idx_veiculos_loja (loja_atual_id),
    INDEX idx_veiculos_placa (placa)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE CLIENTES E PERFIS
-- =====================================================

CREATE TABLE clientes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(20),
    endereco TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clientes_cpf (cpf_cnpj),
    INDEX idx_clientes_email (email)
) ENGINE=InnoDB;

CREATE TABLE client_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_client_profiles_user (user_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE MOTORISTAS
-- =====================================================

CREATE TABLE motoristas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    cnh VARCHAR(20) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    valor_diaria DECIMAL(10,2) DEFAULT 150.00,
    status ENUM('Disponivel', 'Ocupado', 'Ferias', 'Inativo') DEFAULT 'Disponivel',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_motoristas_status (status),
    INDEX idx_motoristas_cpf (cpf)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE SERVIÇOS EXTRAS
-- =====================================================

CREATE TABLE servicos_extra (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(100) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    tipo_cobranca ENUM('Taxa Unica', 'Por Dia') DEFAULT 'Taxa Unica',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_servicos_ativo (ativo)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE LOCAÇÕES (RESERVAS)
-- =====================================================

CREATE TABLE locacoes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    codigo_reserva VARCHAR(20) NOT NULL UNIQUE,
    cliente_id CHAR(36) NOT NULL,
    veiculo_id CHAR(36) NOT NULL,
    loja_retirada_id CHAR(36) NOT NULL,
    motorista_id CHAR(36),
    user_id CHAR(36),
    data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_retirada DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real DATE,
    periodo_dias INT NOT NULL,
    com_motorista BOOLEAN DEFAULT FALSE,
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('Ativa', 'Concluida', 'Cancelada', 'Atrasada') DEFAULT 'Ativa',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (loja_retirada_id) REFERENCES lojas(id) ON DELETE RESTRICT,
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE SET NULL,
    INDEX idx_locacoes_codigo (codigo_reserva),
    INDEX idx_locacoes_cliente (cliente_id),
    INDEX idx_locacoes_veiculo (veiculo_id),
    INDEX idx_locacoes_status (status),
    INDEX idx_locacoes_data_retirada (data_retirada),
    INDEX idx_locacoes_data_devolucao (data_devolucao_prevista)
) ENGINE=InnoDB;

CREATE TABLE locacoes_itens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    locacao_id CHAR(36) NOT NULL,
    servico_id CHAR(36) NOT NULL,
    quantidade INT DEFAULT 1,
    valor_total_item DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locacao_id) REFERENCES locacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos_extra(id) ON DELETE RESTRICT,
    INDEX idx_locacoes_itens_locacao (locacao_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE VISTORIAS
-- =====================================================

CREATE TABLE vistorias (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    locacao_id CHAR(36) NOT NULL,
    veiculo_id CHAR(36) NOT NULL,
    fase ENUM('Retirada', 'Devolucao') NOT NULL,
    data_vistoria TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quilometragem INT NOT NULL,
    nivel_tanque ENUM('Vazio', '1/4', '1/2', '3/4', 'Cheio') NOT NULL,
    tem_avarias BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    responsavel_vistoria VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locacao_id) REFERENCES locacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE RESTRICT,
    INDEX idx_vistorias_locacao (locacao_id),
    INDEX idx_vistorias_veiculo (veiculo_id),
    INDEX idx_vistorias_fase (fase)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE MULTAS
-- =====================================================

CREATE TABLE tipos_multa (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    descricao VARCHAR(200) NOT NULL,
    valor_referencia DECIMAL(10,2),
    gravidade ENUM('Leve', 'Media', 'Grave', 'Gravissima', 'Contratual') DEFAULT 'Contratual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE multas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    locacao_id CHAR(36) NOT NULL,
    tipo_multa_id CHAR(36) NOT NULL,
    data_infracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_cobrado DECIMAL(10,2) NOT NULL,
    status_pagamento ENUM('Pendente', 'Pago', 'Contestado') DEFAULT 'Pendente',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locacao_id) REFERENCES locacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_multa_id) REFERENCES tipos_multa(id) ON DELETE RESTRICT,
    INDEX idx_multas_locacao (locacao_id),
    INDEX idx_multas_status (status_pagamento)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE AVALIAÇÕES
-- =====================================================

CREATE TABLE avaliacoes_veiculos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    veiculo_id CHAR(36) NOT NULL,
    cliente_id CHAR(36) NOT NULL,
    locacao_id CHAR(36) NOT NULL,
    nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (locacao_id) REFERENCES locacoes(id) ON DELETE CASCADE,
    INDEX idx_avaliacoes_veiculo (veiculo_id),
    INDEX idx_avaliacoes_cliente (cliente_id),
    UNIQUE KEY uk_avaliacao_locacao (locacao_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABELAS DE LOGS DO SISTEMA
-- =====================================================

CREATE TABLE logs_sistema (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario VARCHAR(100) DEFAULT 'SYSTEM',
    acao VARCHAR(100),
    descricao TEXT,
    data_ocorrencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_logs_usuario (usuario),
    INDEX idx_logs_data (data_ocorrencia),
    INDEX idx_logs_acao (acao)
) ENGINE=InnoDB;

-- =====================================================
-- TRIGGERS PARA AUTOMAÇÃO
-- =====================================================

DELIMITER //

-- Trigger para atualizar status do veículo ao criar locação
CREATE TRIGGER trg_locacao_reservar_veiculo
AFTER INSERT ON locacoes
FOR EACH ROW
BEGIN
    UPDATE veiculos SET status = 'Reservado' WHERE id = NEW.veiculo_id;
    INSERT INTO logs_sistema (acao, descricao, usuario)
    VALUES ('RESERVA_CRIADA', CONCAT('Reserva ', NEW.codigo_reserva, ' criada para veículo'), 'SYSTEM');
END//

-- Trigger para liberar veículo ao concluir locação
CREATE TRIGGER trg_locacao_concluir
AFTER UPDATE ON locacoes
FOR EACH ROW
BEGIN
    IF NEW.status = 'Concluida' AND OLD.status != 'Concluida' THEN
        UPDATE veiculos SET status = 'Livre' WHERE id = NEW.veiculo_id;
        INSERT INTO logs_sistema (acao, descricao, usuario)
        VALUES ('LOCACAO_CONCLUIDA', CONCAT('Locação ', NEW.codigo_reserva, ' concluída'), 'SYSTEM');
    END IF;
END//

-- Trigger para atualizar status do motorista
CREATE TRIGGER trg_locacao_motorista
AFTER INSERT ON locacoes
FOR EACH ROW
BEGIN
    IF NEW.motorista_id IS NOT NULL THEN
        UPDATE motoristas SET status = 'Ocupado' WHERE id = NEW.motorista_id;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- =====================================================

CREATE VIEW vw_locacoes_detalhadas AS
SELECT 
    l.id,
    l.codigo_reserva,
    l.data_reserva,
    l.data_retirada,
    l.data_devolucao_prevista,
    l.periodo_dias,
    l.valor_total,
    l.status,
    c.nome AS cliente_nome,
    c.cpf_cnpj AS cliente_documento,
    v.modelo AS veiculo_modelo,
    v.placa AS veiculo_placa,
    cat.nome AS categoria_nome,
    lj.nome AS loja_nome,
    cid.nome AS cidade_nome,
    cid.uf,
    m.nome AS motorista_nome
FROM locacoes l
JOIN clientes c ON l.cliente_id = c.id
JOIN veiculos v ON l.veiculo_id = v.id
JOIN categorias_veiculo cat ON v.categoria_id = cat.id
JOIN lojas lj ON l.loja_retirada_id = lj.id
JOIN cidades cid ON lj.cidade_id = cid.id
LEFT JOIN motoristas m ON l.motorista_id = m.id;

CREATE VIEW vw_faturamento_mensal AS
SELECT 
    DATE_FORMAT(data_reserva, '%Y-%m') AS mes,
    COUNT(*) AS total_locacoes,
    SUM(valor_total) AS faturamento_total,
    AVG(valor_total) AS ticket_medio
FROM locacoes
WHERE status IN ('Ativa', 'Concluida')
GROUP BY DATE_FORMAT(data_reserva, '%Y-%m')
ORDER BY mes DESC;

CREATE VIEW vw_veiculos_disponiveis AS
SELECT 
    v.*,
    cat.nome AS categoria_nome,
    cat.valor_diaria,
    lj.nome AS loja_nome,
    cid.nome AS cidade_nome,
    cid.uf
FROM veiculos v
JOIN categorias_veiculo cat ON v.categoria_id = cat.id
JOIN lojas lj ON v.loja_atual_id = lj.id
JOIN cidades cid ON lj.cidade_id = cid.id
WHERE v.status = 'Livre';
