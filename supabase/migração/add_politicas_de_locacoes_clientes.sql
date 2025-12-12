CREATE POLICY "Permitir público ler locacoes" 
ON public.locacoes 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir público atualizar locacoes" 
ON public.locacoes 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir público inserir clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir público ler clientes" 
ON public.clientes 
FOR SELECT 
USING (true);