-- =====================================================
-- FallsCar Enterprise - Banco Completo Integrado
-- Schema base + todas as migrações em um único arquivo
-- PostgreSQL/Supabase
-- =====================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELAS DE CONFIGURAÇÃO E LOCALIZAÇÃO
-- =====================================================

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

-- =====================================================
-- 2. TABELAS DE VEÍCULOS E CATEGORIAS
-- =====================================================

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
    imagem_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELAS DE CLIENTES E PERFIS
-- =====================================================

CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(20),
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    nome VARCHAR NOT NULL,
    cpf_cnpj VARCHAR NOT NULL UNIQUE,
    telefone VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 4. TABELAS DE MOTORISTAS
-- =====================================================

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

-- =====================================================
-- 5. TABELAS DE SERVIÇOS EXTRAS
-- =====================================================

CREATE TABLE public.servicos_extra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    tipo_cobranca VARCHAR(20) DEFAULT 'Taxa Unica' CHECK (tipo_cobranca IN ('Por Dia', 'Taxa Unica')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELAS DE LOCAÇÕES (RESERVAS)
-- =====================================================

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
    user_id UUID REFERENCES auth.users(id),
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

-- =====================================================
-- 7. TABELAS DE VISTORIAS
-- =====================================================

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
    funcionario_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (locacao_id, fase)
);

-- =====================================================
-- 8. TABELAS DE MULTAS
-- =====================================================

CREATE TABLE public.tipos_multa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descricao VARCHAR(100) NOT NULL,
    valor_referencia DECIMAL(10,2),
    gravidade VARCHAR(20) DEFAULT 'Contratual' CHECK (gravidade IN ('Baixa', 'Media', 'Grave', 'Gravissima', 'Contratual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- =====================================================
-- 9. TABELAS DE AVALIAÇÕES
-- =====================================================

CREATE TABLE public.avaliacoes_veiculos (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    locacao_id UUID NOT NULL REFERENCES public.locacoes(id) ON DELETE CASCADE,
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(locacao_id)
);

-- =====================================================
-- 10. TABELAS DE FUNCIONARIOS
-- =====================================================

CREATE TABLE public.funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(20),
    cargo VARCHAR(20) NOT NULL CHECK (cargo IN ('Avaliador', 'Motorista', 'Gerente', 'Atendente')),
    loja_id UUID REFERENCES public.lojas(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Ferias', 'Inativo', 'Demitido')),
    data_admissao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. TABELAS DE PAGAMENTOS
-- =====================================================

CREATE TABLE public.pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    locacao_id UUID NOT NULL REFERENCES public.locacoes(id) ON DELETE CASCADE,
    valor DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Processando', 'Pago', 'Falhou', 'Estornado', 'Contestado')),
    metodo_pagamento VARCHAR(30) NOT NULL CHECK (metodo_pagamento IN ('Cartao_Credito', 'Cartao_Debito', 'PIX', 'Boleto', 'Dinheiro', 'Transferencia')),
    gateway_externo VARCHAR(50),
    transaction_id_externo VARCHAR(100),
    data_pagamento TIMESTAMP WITH TIME ZONE,
    data_estorno TIMESTAMP WITH TIME ZONE,
    motivo_estorno TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABELAS DE LOGS DO SISTEMA
-- =====================================================

CREATE TABLE public.logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_ocorrencia TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario VARCHAR(50) DEFAULT 'SYSTEM',
    acao VARCHAR(50),
    descricao TEXT
);

-- =====================================================
-- 13. ÍNDICES
-- =====================================================

CREATE INDEX idx_veiculos_status ON public.veiculos(status);
CREATE INDEX idx_veiculos_loja ON public.veiculos(loja_atual_id);
CREATE INDEX idx_veiculos_categoria ON public.veiculos(categoria_id);
CREATE INDEX idx_veiculos_placa ON public.veiculos(placa);

CREATE INDEX idx_locacoes_status ON public.locacoes(status);
CREATE INDEX idx_locacoes_cliente ON public.locacoes(cliente_id);
CREATE INDEX idx_locacoes_veiculo ON public.locacoes(veiculo_id);
CREATE INDEX idx_locacoes_codigo ON public.locacoes(codigo_reserva);
CREATE INDEX idx_locacoes_data_retirada ON public.locacoes(data_retirada);
CREATE INDEX idx_locacoes_data_devolucao ON public.locacoes(data_devolucao_prevista);
CREATE INDEX idx_locacoes_user_id ON public.locacoes(user_id);

CREATE INDEX idx_motoristas_status ON public.motoristas(status);
CREATE INDEX idx_motoristas_cpf ON public.motoristas(cpf);

CREATE INDEX idx_vistorias_locacao ON public.vistorias(locacao_id);
CREATE INDEX idx_vistorias_veiculo ON public.vistorias(veiculo_id);
CREATE INDEX idx_vistorias_fase ON public.vistorias(fase);

CREATE INDEX idx_multas_locacao ON public.multas(locacao_id);
CREATE INDEX idx_multas_status ON public.multas(status_pagamento);

CREATE INDEX idx_avaliacoes_veiculo ON public.avaliacoes_veiculos(veiculo_id);
CREATE INDEX idx_avaliacoes_cliente ON public.avaliacoes_veiculos(cliente_id);

CREATE INDEX idx_funcionarios_cargo ON public.funcionarios(cargo);
CREATE INDEX idx_funcionarios_loja ON public.funcionarios(loja_id);
CREATE INDEX idx_funcionarios_status ON public.funcionarios(status);
CREATE INDEX idx_funcionarios_cpf ON public.funcionarios(cpf);

CREATE INDEX idx_pagamentos_locacao ON public.pagamentos(locacao_id);
CREATE INDEX idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX idx_pagamentos_gateway ON public.pagamentos(gateway_externo);
CREATE INDEX idx_pagamentos_transaction ON public.pagamentos(transaction_id_externo);
CREATE INDEX idx_pagamentos_data ON public.pagamentos(data_pagamento);
CREATE INDEX idx_pagamentos_updated ON public.pagamentos(updated_at);

CREATE INDEX idx_client_profiles_user ON public.client_profiles(user_id);

-- =====================================================
-- 14. ADICIONAR FK FUNCIONARIO_ID EM VISTORIAS
-- =====================================================

ALTER TABLE public.vistorias 
ADD CONSTRAINT fk_vistorias_funcionario 
FOREIGN KEY (funcionario_id) REFERENCES public.funcionarios(id) ON DELETE SET NULL;

CREATE INDEX idx_vistorias_funcionario ON public.vistorias(funcionario_id);

-- =====================================================
-- 15. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

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
ALTER TABLE public.avaliacoes_veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 16. POLÍTICAS DE ACESSO (RLS)
-- =====================================================

-- Cidades
CREATE POLICY "Permitir usuários autenticados ler cidades" ON public.cidades FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar cidades" ON public.cidades FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público ler cidades" ON public.cidades FOR SELECT USING (true);

-- Lojas
CREATE POLICY "Permitir usuários autenticados ler lojas" ON public.lojas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar lojas" ON public.lojas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público ler lojas" ON public.lojas FOR SELECT USING (true);

-- Categorias de Veículo
CREATE POLICY "Permitir usuários autenticados ler categorias_veiculo" ON public.categorias_veiculo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar categorias_veiculo" ON public.categorias_veiculo FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público ler categorias_veiculo" ON public.categorias_veiculo FOR SELECT USING (true);

-- Veículos
CREATE POLICY "Permitir usuários autenticados ler veiculos" ON public.veiculos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar veiculos" ON public.veiculos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público ler veiculos" ON public.veiculos FOR SELECT USING (true);

-- Clientes
CREATE POLICY "Permitir usuários autenticados ler clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar clientes" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público ler clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Permitir público inserir clientes" ON public.clientes FOR INSERT WITH CHECK (true);

-- Motoristas
CREATE POLICY "Permitir usuários autenticados ler motoristas" ON public.motoristas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar motoristas" ON public.motoristas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público ler motoristas" ON public.motoristas FOR SELECT USING (true);

-- Serviços Extras
CREATE POLICY "Permitir usuários autenticados ler servicos_extra" ON public.servicos_extra FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar servicos_extra" ON public.servicos_extra FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tipos de Multa
CREATE POLICY "Permitir usuários autenticados ler tipos_multa" ON public.tipos_multa FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar tipos_multa" ON public.tipos_multa FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Locações
CREATE POLICY "Permitir usuários autenticados ler locacoes" ON public.locacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar locacoes" ON public.locacoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público ler locacoes" ON public.locacoes FOR SELECT USING (true);
CREATE POLICY "Permitir público atualizar locacoes" ON public.locacoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público inserir locacoes" ON public.locacoes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir autenticados inserir próprias locacoes" ON public.locacoes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Usuários podem ler próprias reservas" ON public.locacoes FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Locações Itens
CREATE POLICY "Permitir usuários autenticados ler locacoes_itens" ON public.locacoes_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar locacoes_itens" ON public.locacoes_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Permitir público inserir locacoes_itens" ON public.locacoes_itens FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir público ler locacoes_itens" ON public.locacoes_itens FOR SELECT USING (true);

-- Vistorias
CREATE POLICY "Permitir usuários autenticados ler vistorias" ON public.vistorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar vistorias" ON public.vistorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Multas
CREATE POLICY "Permitir usuários autenticados ler multas" ON public.multas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar multas" ON public.multas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Logs Sistema
CREATE POLICY "Permitir usuários autenticados ler logs_sistema" ON public.logs_sistema FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados inserir logs_sistema" ON public.logs_sistema FOR INSERT TO authenticated WITH CHECK (true);

-- Avaliações Veículos
CREATE POLICY "Permitir público inserir avaliações" ON public.avaliacoes_veiculos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir público ler avaliações" ON public.avaliacoes_veiculos FOR SELECT USING (true);
CREATE POLICY "Permitir autenticados gerenciar avaliações" ON public.avaliacoes_veiculos FOR ALL USING (true) WITH CHECK (true);

-- Client Profiles
CREATE POLICY "Usuários podem ler próprio perfil" ON public.client_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir próprio perfil" ON public.client_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.client_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Funcionarios
CREATE POLICY "Permitir usuários autenticados ler funcionarios" ON public.funcionarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar funcionarios" ON public.funcionarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pagamentos
CREATE POLICY "Permitir usuários autenticados ler pagamentos" ON public.pagamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar pagamentos" ON public.pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 17. FUNÇÕES E TRIGGERS
-- =====================================================

-- Trigger para criar perfil de cliente automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_client_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.client_profiles (user_id, nome, cpf_cnpj, telefone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'cpf_cnpj', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'telefone', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_client_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data ->> 'is_client' = 'true')
  EXECUTE FUNCTION public.handle_new_client_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pagamentos_updated_at
BEFORE UPDATE ON public.pagamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para log de pagamento confirmado
CREATE OR REPLACE FUNCTION public.log_pagamento_confirmado()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Pago' AND OLD.status != 'Pago' THEN
        INSERT INTO public.logs_sistema (acao, descricao, usuario)
        VALUES ('PAGAMENTO_CONFIRMADO', 
                'Pagamento ' || NEW.id::TEXT || ' confirmado para locação ' || NEW.locacao_id::TEXT, 
                'SYSTEM');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pagamento_pago
AFTER UPDATE ON public.pagamentos
FOR EACH ROW
EXECUTE FUNCTION public.log_pagamento_confirmado();

-- =====================================================
-- 18. VIEWS
-- =====================================================

CREATE OR REPLACE VIEW public.vw_locacoes_detalhadas AS
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
FROM public.locacoes l
JOIN public.clientes c ON l.cliente_id = c.id
JOIN public.veiculos v ON l.veiculo_id = v.id
JOIN public.categorias_veiculo cat ON v.categoria_id = cat.id
JOIN public.lojas lj ON l.loja_retirada_id = lj.id
JOIN public.cidades cid ON lj.cidade_id = cid.id
LEFT JOIN public.motoristas m ON l.motorista_id = m.id;

CREATE OR REPLACE VIEW public.vw_faturamento_mensal AS
SELECT 
    DATE_FORMAT(data_reserva, '%Y-%m') AS mes,
    COUNT(*) AS total_locacoes,
    SUM(valor_total) AS faturamento_total,
    AVG(valor_total) AS ticket_medio
FROM public.locacoes
WHERE status IN ('Ativa', 'Concluida')
GROUP BY DATE_FORMAT(data_reserva, '%Y-%m')
ORDER BY mes DESC;

CREATE OR REPLACE VIEW public.vw_veiculos_disponiveis AS
SELECT 
    v.*,
    cat.nome AS categoria_nome,
    cat.valor_diaria,
    lj.nome AS loja_nome,
    cid.nome AS cidade_nome,
    cid.uf
FROM public.veiculos v
JOIN public.categorias_veiculo cat ON v.categoria_id = cat.id
JOIN public.lojas lj ON v.loja_atual_id = lj.id
JOIN public.cidades cid ON lj.cidade_id = cid.id
WHERE v.status = 'Livre';

CREATE OR REPLACE VIEW public.vw_pagamentos_detalhados AS
SELECT 
    p.id,
    p.valor,
    p.status,
    p.metodo_pagamento,
    p.gateway_externo,
    p.transaction_id_externo,
    p.data_pagamento,
    l.codigo_reserva,
    c.nome AS cliente_nome,
    v.modelo AS veiculo_modelo,
    v.placa AS veiculo_placa
FROM public.pagamentos p
JOIN public.locacoes l ON p.locacao_id = l.id
JOIN public.clientes c ON l.cliente_id = c.id
JOIN public.veiculos v ON l.veiculo_id = v.id;

CREATE OR REPLACE VIEW public.vw_funcionarios_loja AS
SELECT 
    f.id,
    f.nome,
    f.cpf,
    f.cargo,
    f.status,
    f.data_admissao,
    lj.nome AS loja_nome,
    cid.nome AS cidade_nome,
    cid.uf
FROM public.funcionarios f
LEFT JOIN public.lojas lj ON f.loja_id = lj.id
LEFT JOIN public.cidades cid ON lj.cidade_id = cid.id
ORDER BY lj.nome, f.cargo, f.nome;

-- =====================================================
-- 19. DADOS INICIAIS (SEED)
-- =====================================================

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

-- =====================================================
-- FIM DO BANCO COMPLETO INTEGRADO
-- =====================================================
