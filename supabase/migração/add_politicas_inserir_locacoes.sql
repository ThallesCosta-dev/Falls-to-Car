CREATE POLICY "Permitir público inserir locacoes"
ON public.locacoes
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir autenticados inserir próprias locacoes"
ON public.locacoes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);