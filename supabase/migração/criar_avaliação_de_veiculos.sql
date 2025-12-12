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

ALTER TABLE public.avaliacoes_veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir público inserir avaliações" 
ON public.avaliacoes_veiculos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir público ler avaliações" 
ON public.avaliacoes_veiculos 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir autenticados gerenciar avaliações" 
ON public.avaliacoes_veiculos 
FOR ALL 
USING (true)
WITH CHECK (true);