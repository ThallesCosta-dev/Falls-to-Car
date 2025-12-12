CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome VARCHAR NOT NULL,
  cpf_cnpj VARCHAR NOT NULL UNIQUE,
  telefone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ler próprio perfil"
ON public.client_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprio perfil"
ON public.client_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.client_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

ALTER TABLE public.locacoes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_locacoes_user_id ON public.locacoes(user_id);

CREATE POLICY "Usuários podem ler próprias reservas"
ON public.locacoes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

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