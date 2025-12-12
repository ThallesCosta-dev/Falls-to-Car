import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { startOfMonth, endOfMonth, subMonths, format, getDaysInMonth, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [veiculosRes, locacoesRes, clientesRes, lojasRes] = await Promise.all([
        supabase.from("veiculos").select("status", { count: "exact" }),
        supabase.from("locacoes").select("status, valor_total", { count: "exact" }),
        supabase.from("clientes").select("id", { count: "exact" }),
        supabase.from("lojas").select("id", { count: "exact" }),
      ]);

      const locacoesAtivas = locacoesRes.data?.filter(l => l.status === "Ativa").length || 0;
      const locacoesCanceladas = locacoesRes.data?.filter(l => l.status === "Cancelada").length || 0;
      const locacoesFinalizadas = locacoesRes.data?.filter(l => l.status === "Finalizada").length || 0;
      const totalFaturamento = locacoesRes.data?.reduce((sum, l) => {
        const valor = typeof l.valor_total === 'string' ? parseFloat(l.valor_total) : (l.valor_total || 0);
        return sum + valor;
      }, 0) || 0;

      const veiculosLivres = veiculosRes.data?.filter(v => v.status === "Livre").length || 0;
      const veiculosAlugados = veiculosRes.data?.filter(v => v.status === "Alugado").length || 0;
      const veiculosManutencao = veiculosRes.data?.filter(v => v.status === "Manutencao").length || 0;

      return {
        totalVeiculos: veiculosRes.count || 0,
        veiculosLivres,
        veiculosAlugados,
        veiculosManutencao,
        locacoesAtivas,
        locacoesCanceladas,
        locacoesFinalizadas,
        totalClientes: clientesRes.count || 0,
        totalLojas: lojasRes.count || 0,
        totalFaturamento,
        totalLocacoes: locacoesRes.count || 0,
      };
    },
  });

  // Fetch daily revenue for current month
  const { data: dailyRevenueData } = useQuery({
    queryKey: ["daily-revenue"],
    queryFn: async () => {
      const today = new Date();
      const daysInMonth = getDaysInMonth(today);
      const currentDay = today.getDate();
      const monthStart = startOfMonth(today);
      
      const days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), i);
        const start = startOfDay(date);
        const end = endOfDay(date);
        
        // Only fetch data for past and current days
        if (i <= currentDay) {
          const { data } = await supabase
            .from("locacoes")
            .select("valor_total")
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString());
          
          const total = data?.reduce((sum, l) => {
            const valor = typeof l.valor_total === 'string' ? parseFloat(l.valor_total) : (l.valor_total || 0);
            return sum + valor;
          }, 0) || 0;

          days.push({
            day: i.toString(),
            valor: total,
          });
        } else {
          days.push({
            day: i.toString(),
            valor: 0,
          });
        }
      }
      return days;
    },
  });

  // Calculate today's total from daily data
  const todayRevenue = dailyRevenueData?.[new Date().getDate() - 1]?.valor || 0;

  // Fetch monthly revenue data (last 8 months)
  const { data: monthlyData } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const months = [];
      for (let i = 7; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        
        const { data } = await supabase
          .from("locacoes")
          .select("valor_total")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());
        
        const total = data?.reduce((sum, l) => {
          const valor = typeof l.valor_total === 'string' ? parseFloat(l.valor_total) : (l.valor_total || 0);
          return sum + valor;
        }, 0) || 0;

        months.push({
          month: format(date, "MMM", { locale: ptBR }),
          valor: total,
        });
      }
      return months;
    },
  });

  // Calculate current month's total
  const currentMonthRevenue = monthlyData?.[monthlyData.length - 1]?.valor || 0;

  const { data: recentRentals } = useQuery({
    queryKey: ["recent-rentals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locacoes")
        .select(`
          *,
          veiculos(modelo, placa, imagem_url, categorias_veiculo(nome))
        `)
        .eq("status", "Ativa")
        .order("created_at", { ascending: false })
        .limit(3);
      return data;
    },
  });

  // Pie chart data with real values
  const pieData = [
    { name: "Livres", value: stats?.veiculosLivres || 0, color: "#2CB67D" },
    { name: "Alugados", value: stats?.veiculosAlugados || 0, color: "#3B82F6" },
    { name: "Manutenção", value: stats?.veiculosManutencao || 0, color: "#F59E0B" },
  ];

  return (
    <Layout title="Bem-vindo, Admin." subtitle="">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalClientes || 0}</p>
                  <p className="text-sm text-muted-foreground">Numero de Clientes</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalLojas || 0}</p>
                  <p className="text-sm text-muted-foreground">Numeros de Franquias</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Profit Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Faturamento Diário - {format(new Date(), "MMMM", { locale: ptBR })}</CardTitle>
                    <p className="text-xs text-muted-foreground">Reservas criadas por dia</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    R${(todayRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    <span className="text-sm font-normal text-muted-foreground ml-2">hoje</span>
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyRevenueData || []} barGap={1}>
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#888' }}
                        interval={2}
                      />
                      <YAxis hide />
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                        labelFormatter={(label) => `Dia ${label}`}
                      />
                      <Bar dataKey="valor" fill="#2CB67D" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Chart */}
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Valor Recebido Mensal</CardTitle>
                  <p className="text-2xl font-bold text-foreground">
                    R${currentMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData || []} barGap={2}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                      <YAxis hide />
                      <Bar dataKey="valor" fill="#2CB67D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Rentals */}
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Recém Alugados</CardTitle>
                  <Link to="/locacoes" className="text-sm text-accent hover:underline">
                    Ver Todos
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentRentals?.map((rental) => (
                  <div key={rental.id} className="flex items-center gap-3">
                    <div className="h-16 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {rental.veiculos?.imagem_url ? (
                        <img 
                          src={rental.veiculos.imagem_url} 
                          alt={rental.veiculos.modelo}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{rental.veiculos?.modelo}</p>
                      <p className="text-xs text-muted-foreground">{rental.veiculos?.categorias_veiculo?.nome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(rental.data_retirada).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="font-semibold text-foreground">
                        R${Number(rental.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
                {!recentRentals?.length && (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Nenhuma locação recente
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Rental Stats Pie Chart */}
            <Card className="bg-card border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Status dos Veículos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-lg font-bold mb-3">{stats?.totalVeiculos || 0} Veículos</p>
                    <div className="space-y-2">
                      {pieData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">
                            <span className="font-medium">{item.value}</span>{" "}
                            <span className="text-muted-foreground">{item.name}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-24 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}