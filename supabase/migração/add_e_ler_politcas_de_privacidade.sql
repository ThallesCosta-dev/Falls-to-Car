CREATE POLICY "Permitir público ler categorias_veiculo" 
ON public.categorias_veiculo 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir público ler veiculos" 
ON public.veiculos 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir público ler lojas" 
ON public.lojas 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir público ler cidades" 
ON public.cidades 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir público ler motoristas" 
ON public.motoristas 
FOR SELECT 
USING (true);