CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.cidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.lojas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    cidade_id UUID NOT NULL REFERENCES public.cidades(id) ON DELETE RESTRICT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.categorias_veiculo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL,
    valor_diaria DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.veiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modelo VARCHAR(50) NOT NULL,
    placa VARCHAR(10) NOT NULL UNIQUE,
    categoria_id UUID NOT NULL REFERENCES public.categorias_veiculo(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'Livre' CHECK (status IN ('Livre', 'Alugado', 'Reservado', 'Manutencao')),
    loja_atual_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE RESTRICT,
    ano INT,
    cor VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(20),
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    cnh VARCHAR(20) NOT NULL,
    valor_diaria DECIMAL(10,2) DEFAULT 150.00,
    status VARCHAR(20) DEFAULT 'Disponivel' CHECK (status IN ('Disponivel', 'Em Servico')),
    telefone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.servicos_extra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    tipo_cobranca VARCHAR(20) DEFAULT 'Taxa Unica' CHECK (tipo_cobranca IN ('Por Dia', 'Taxa Unica')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.tipos_multa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(100) NOT NULL,
    valor_referencia DECIMAL(10,2),
    gravidade VARCHAR(20) DEFAULT 'Contratual' CHECK (gravidade IN ('Baixa', 'Media', 'Grave', 'Gravissima', 'Contratual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.locacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_reserva VARCHAR(50) NOT NULL UNIQUE,
    data_reserva TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_retirada DATE NOT NULL,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real DATE,
    periodo_dias INT NOT NULL,
    com_motorista BOOLEAN DEFAULT FALSE,
    valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Concluida', 'Cancelada')),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
    veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE RESTRICT,
    loja_retirada_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE RESTRICT,
    motorista_id UUID REFERENCES public.motoristas(id) ON DELETE SET NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.locacoes_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    locacao_id UUID NOT NULL REFERENCES public.locacoes(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES public.servicos_extra(id) ON DELETE RESTRICT,
    quantidade INT DEFAULT 1,
    valor_total_item DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.vistorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    locacao_id UUID NOT NULL REFERENCES public.locacoes(id) ON DELETE CASCADE,
    veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE RESTRICT,
    data_vistoria TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fase VARCHAR(20) NOT NULL CHECK (fase IN ('Retirada', 'Devolucao')),
    nivel_tanque VARCHAR(20) NOT NULL CHECK (nivel_tanque IN ('Reserva', '1/4', '1/2', '3/4', 'Cheio')),
    quilometragem INT NOT NULL,
    tem_avarias BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    responsavel_vistoria VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (locacao_id, fase)
);

CREATE TABLE public.multas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    locacao_id UUID NOT NULL REFERENCES public.locacoes(id) ON DELETE CASCADE,
    tipo_multa_id UUID NOT NULL REFERENCES public.tipos_multa(id) ON DELETE RESTRICT,
    data_infracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valor_cobrado DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    status_pagamento VARCHAR(20) DEFAULT 'Pendente' CHECK (status_pagamento IN ('Pendente', 'Pago')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_ocorrencia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario VARCHAR(50) DEFAULT 'SYSTEM',
    acao VARCHAR(50),
    descricao TEXT
);

ALTER TABLE public.cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_veiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos_extra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_multa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locacoes_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vistorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir usuários autenticados ler cidades" ON public.cidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar cidades" ON public.cidades FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler lojas" ON public.lojas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar lojas" ON public.lojas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler categorias_veiculo" ON public.categorias_veiculo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar categorias_veiculo" ON public.categorias_veiculo FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler veiculos" ON public.veiculos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar veiculos" ON public.veiculos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar clientes" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler motoristas" ON public.motoristas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar motoristas" ON public.motoristas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler servicos_extra" ON public.servicos_extra FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar servicos_extra" ON public.servicos_extra FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler tipos_multa" ON public.tipos_multa FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar tipos_multa" ON public.tipos_multa FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler locacoes" ON public.locacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar locacoes" ON public.locacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler locacoes_itens" ON public.locacoes_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar locacoes_itens" ON public.locacoes_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler vistorias" ON public.vistorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar vistorias" ON public.vistorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler multas" ON public.multas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar multas" ON public.multas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Permitir usuários autenticados ler logs_sistema" ON public.logs_sistema FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados inserir logs_sistema" ON public.logs_sistema FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_veiculos_status ON public.veiculos(status);
CREATE INDEX idx_veiculos_loja ON public.veiculos(loja_atual_id);
CREATE INDEX idx_locacoes_status ON public.locacoes(status);
CREATE INDEX idx_locacoes_cliente ON public.locacoes(cliente_id);
CREATE INDEX idx_locacoes_veiculo ON public.locacoes(veiculo_id);
CREATE INDEX idx_motoristas_status ON public.motoristas(status);

INSERT INTO public.cidades (nome, uf) VALUES 
('Rio de Janeiro', 'RJ'), 
('São Paulo', 'SP'),
('Brasília', 'DF'),
('Belo Horizonte', 'MG');

INSERT INTO public.lojas (nome, cidade_id) VALUES 
('Aeroporto Galeão', (SELECT id FROM public.cidades WHERE nome = 'Rio de Janeiro')),
('Aeroporto Congonhas', (SELECT id FROM public.cidades WHERE nome = 'São Paulo')),
('Centro RJ', (SELECT id FROM public.cidades WHERE nome = 'Rio de Janeiro')),
('Aeroporto Guarulhos', (SELECT id FROM public.cidades WHERE nome = 'São Paulo'));

INSERT INTO public.categorias_veiculo (nome, valor_diaria, descricao) VALUES 
('Econômico', 120.00, 'Veículos compactos e econômicos para uso urbano'),
('Sedan', 180.00, 'Sedans confortáveis para viagens e executivos'),
('SUV', 250.00, 'SUVs espaçosos para famílias e aventuras'),
('Luxo', 450.00, 'Veículos premium com máximo conforto');

INSERT INTO public.servicos_extra (nome, valor_unitario, tipo_cobranca) VALUES 
('GPS', 15.00, 'Por Dia'),
('Cadeirinha Bebê', 20.00, 'Por Dia'),
('Seguro Completo', 50.00, 'Por Dia'),
('Lavagem Completa', 80.00, 'Taxa Unica'),
('Tanque Cheio', 150.00, 'Taxa Unica');

INSERT INTO public.tipos_multa (descricao, valor_referencia, gravidade) VALUES 
('Tanque Vazio na Devolução', 150.00, 'Contratual'),
('Dano na Lataria', 500.00, 'Media'),
('Dano Interno', 300.00, 'Media'),
('Atraso na Devolução (por dia)', 100.00, 'Contratual'),
('Limpeza Necessária', 120.00, 'Baixa');