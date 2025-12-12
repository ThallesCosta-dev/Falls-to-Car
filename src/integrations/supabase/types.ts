export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      avaliacoes_veiculos: {
        Row: {
          cliente_id: string
          comentario: string | null
          created_at: string | null
          id: string
          locacao_id: string
          nota: number
          veiculo_id: string
        }
        Insert: {
          cliente_id: string
          comentario?: string | null
          created_at?: string | null
          id?: string
          locacao_id: string
          nota: number
          veiculo_id: string
        }
        Update: {
          cliente_id?: string
          comentario?: string | null
          created_at?: string | null
          id?: string
          locacao_id?: string
          nota?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_veiculos_locacao_id_fkey"
            columns: ["locacao_id"]
            isOneToOne: true
            referencedRelation: "locacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_veiculos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_veiculo: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          valor_diaria: number
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          valor_diaria: number
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          valor_diaria?: number
        }
        Relationships: []
      }
      cidades: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          uf: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          uf: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          uf?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          cpf_cnpj: string
          created_at: string | null
          id: string
          nome: string
          telefone: string | null
          user_id: string
        }
        Insert: {
          cpf_cnpj: string
          created_at?: string | null
          id?: string
          nome: string
          telefone?: string | null
          user_id: string
        }
        Update: {
          cpf_cnpj?: string
          created_at?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cpf_cnpj: string
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cpf_cnpj: string
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cpf_cnpj?: string
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      locacoes: {
        Row: {
          cliente_id: string
          codigo_reserva: string
          com_motorista: boolean | null
          created_at: string | null
          data_devolucao_prevista: string
          data_devolucao_real: string | null
          data_reserva: string | null
          data_retirada: string
          id: string
          loja_retirada_id: string
          motorista_id: string | null
          observacoes: string | null
          periodo_dias: number
          status: string | null
          user_id: string | null
          valor_total: number
          veiculo_id: string
        }
        Insert: {
          cliente_id: string
          codigo_reserva: string
          com_motorista?: boolean | null
          created_at?: string | null
          data_devolucao_prevista: string
          data_devolucao_real?: string | null
          data_reserva?: string | null
          data_retirada: string
          id?: string
          loja_retirada_id: string
          motorista_id?: string | null
          observacoes?: string | null
          periodo_dias: number
          status?: string | null
          user_id?: string | null
          valor_total?: number
          veiculo_id: string
        }
        Update: {
          cliente_id?: string
          codigo_reserva?: string
          com_motorista?: boolean | null
          created_at?: string | null
          data_devolucao_prevista?: string
          data_devolucao_real?: string | null
          data_reserva?: string | null
          data_retirada?: string
          id?: string
          loja_retirada_id?: string
          motorista_id?: string | null
          observacoes?: string | null
          periodo_dias?: number
          status?: string | null
          user_id?: string | null
          valor_total?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locacoes_loja_retirada_id_fkey"
            columns: ["loja_retirada_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locacoes_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locacoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      locacoes_itens: {
        Row: {
          created_at: string | null
          id: string
          locacao_id: string
          quantidade: number | null
          servico_id: string
          valor_total_item: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          locacao_id: string
          quantidade?: number | null
          servico_id: string
          valor_total_item: number
        }
        Update: {
          created_at?: string | null
          id?: string
          locacao_id?: string
          quantidade?: number | null
          servico_id?: string
          valor_total_item?: number
        }
        Relationships: [
          {
            foreignKeyName: "locacoes_itens_locacao_id_fkey"
            columns: ["locacao_id"]
            isOneToOne: false
            referencedRelation: "locacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locacoes_itens_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos_extra"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_sistema: {
        Row: {
          acao: string | null
          data_ocorrencia: string | null
          descricao: string | null
          id: string
          usuario: string | null
        }
        Insert: {
          acao?: string | null
          data_ocorrencia?: string | null
          descricao?: string | null
          id?: string
          usuario?: string | null
        }
        Update: {
          acao?: string | null
          data_ocorrencia?: string | null
          descricao?: string | null
          id?: string
          usuario?: string | null
        }
        Relationships: []
      }
      lojas: {
        Row: {
          ativo: boolean | null
          cidade_id: string
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          cidade_id: string
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          cidade_id?: string
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "lojas_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
        ]
      }
      motoristas: {
        Row: {
          cnh: string
          cpf: string
          created_at: string | null
          id: string
          nome: string
          status: string | null
          telefone: string | null
          valor_diaria: number | null
        }
        Insert: {
          cnh: string
          cpf: string
          created_at?: string | null
          id?: string
          nome: string
          status?: string | null
          telefone?: string | null
          valor_diaria?: number | null
        }
        Update: {
          cnh?: string
          cpf?: string
          created_at?: string | null
          id?: string
          nome?: string
          status?: string | null
          telefone?: string | null
          valor_diaria?: number | null
        }
        Relationships: []
      }
      multas: {
        Row: {
          created_at: string | null
          data_infracao: string | null
          id: string
          locacao_id: string
          observacoes: string | null
          status_pagamento: string | null
          tipo_multa_id: string
          valor_cobrado: number
        }
        Insert: {
          created_at?: string | null
          data_infracao?: string | null
          id?: string
          locacao_id: string
          observacoes?: string | null
          status_pagamento?: string | null
          tipo_multa_id: string
          valor_cobrado: number
        }
        Update: {
          created_at?: string | null
          data_infracao?: string | null
          id?: string
          locacao_id?: string
          observacoes?: string | null
          status_pagamento?: string | null
          tipo_multa_id?: string
          valor_cobrado?: number
        }
        Relationships: [
          {
            foreignKeyName: "multas_locacao_id_fkey"
            columns: ["locacao_id"]
            isOneToOne: false
            referencedRelation: "locacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "multas_tipo_multa_id_fkey"
            columns: ["tipo_multa_id"]
            isOneToOne: false
            referencedRelation: "tipos_multa"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos_extra: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          tipo_cobranca: string | null
          valor_unitario: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          tipo_cobranca?: string | null
          valor_unitario: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          tipo_cobranca?: string | null
          valor_unitario?: number
        }
        Relationships: []
      }
      tipos_multa: {
        Row: {
          created_at: string | null
          descricao: string
          gravidade: string | null
          id: string
          valor_referencia: number | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          gravidade?: string | null
          id?: string
          valor_referencia?: number | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          gravidade?: string | null
          id?: string
          valor_referencia?: number | null
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          categoria_id: string
          cor: string | null
          created_at: string | null
          id: string
          imagem_url: string | null
          loja_atual_id: string
          modelo: string
          placa: string
          status: string | null
        }
        Insert: {
          ano?: number | null
          categoria_id: string
          cor?: string | null
          created_at?: string | null
          id?: string
          imagem_url?: string | null
          loja_atual_id: string
          modelo: string
          placa: string
          status?: string | null
        }
        Update: {
          ano?: number | null
          categoria_id?: string
          cor?: string | null
          created_at?: string | null
          id?: string
          imagem_url?: string | null
          loja_atual_id?: string
          modelo?: string
          placa?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_veiculo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_loja_atual_id_fkey"
            columns: ["loja_atual_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      vistorias: {
        Row: {
          created_at: string | null
          data_vistoria: string | null
          fase: string
          id: string
          locacao_id: string
          nivel_tanque: string
          observacoes: string | null
          quilometragem: number
          responsavel_vistoria: string | null
          tem_avarias: boolean | null
          veiculo_id: string
        }
        Insert: {
          created_at?: string | null
          data_vistoria?: string | null
          fase: string
          id?: string
          locacao_id: string
          nivel_tanque: string
          observacoes?: string | null
          quilometragem: number
          responsavel_vistoria?: string | null
          tem_avarias?: boolean | null
          veiculo_id: string
        }
        Update: {
          created_at?: string | null
          data_vistoria?: string | null
          fase?: string
          id?: string
          locacao_id?: string
          nivel_tanque?: string
          observacoes?: string | null
          quilometragem?: number
          responsavel_vistoria?: string | null
          tem_avarias?: boolean | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vistorias_locacao_id_fkey"
            columns: ["locacao_id"]
            isOneToOne: false
            referencedRelation: "locacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vistorias_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
