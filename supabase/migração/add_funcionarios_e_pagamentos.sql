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

-- Criar índices
CREATE INDEX idx_funcionarios_cargo ON public.funcionarios(cargo);
CREATE INDEX idx_funcionarios_loja ON public.funcionarios(loja_id);
CREATE INDEX idx_funcionarios_status ON public.funcionarios(status);
CREATE INDEX idx_funcionarios_cpf ON public.funcionarios(cpf);

-- Habilitar RLS
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Permitir usuários autenticados ler funcionarios" ON public.funcionarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar funcionarios" ON public.funcionarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. ALTERAR VISTORIAS PARA USAR FK FUNCIONARIO_ID

-- Passo 1: Adicionar nova coluna funcionario_id
ALTER TABLE public.vistorias 
ADD COLUMN funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL;

-- Passo 2: Criar índice para a nova FK
CREATE INDEX idx_vistorias_funcionario ON public.vistorias(funcionario_id);

-- 3. CRIAR TABELA PAGAMENTOS

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

-- Criar índices
CREATE INDEX idx_pagamentos_locacao ON public.pagamentos(locacao_id);
CREATE INDEX idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX idx_pagamentos_gateway ON public.pagamentos(gateway_externo);
CREATE INDEX idx_pagamentos_transaction ON public.pagamentos(transaction_id_externo);
CREATE INDEX idx_pagamentos_data ON public.pagamentos(data_pagamento);

-- Criar índice para updated_at (para trigger)
CREATE INDEX idx_pagamentos_updated ON public.pagamentos(updated_at);

-- Habilitar RLS
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Permitir usuários autenticados ler pagamentos" ON public.pagamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir usuários autenticados gerenciar pagamentos" ON public.pagamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. FUNÇÃO E TRIGGER PARA ATUALIZAR UPDATED_AT

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

-- 5. FUNÇÃO E TRIGGER PARA LOG DE PAGAMENTO CONFIRMADO

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

-- 6. VIEW PARA CONSULTA DE PAGAMENTOS

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

-- 7. VIEW PARA FUNCIONARIOS POR LOJA

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