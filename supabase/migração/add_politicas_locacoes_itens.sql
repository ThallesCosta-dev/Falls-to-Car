CREATE POLICY "Permitir público inserir locacoes_itens" 
ON public.locacoes_itens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir público ler locacoes_itens" 
ON public.locacoes_itens 
FOR SELECT 
USING (true);