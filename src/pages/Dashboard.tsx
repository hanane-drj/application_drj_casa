import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, Building2, Handshake, Trophy, Tent, Sparkles, GraduationCap,
  TrendingUp, ChevronRight, CheckCircle2, Clock, FileEdit, Download, FileText, FileSpreadsheet,
} from 'lucide-react';
import { computeTotalBeneficiaries, formatNumber, formatDate, usePrefName } from '@/lib/data';
import { exportDashboardCsv, exportDashboardPdf } from '@/lib/export';
import { exportDashboardXlsx } from '@/lib/excelExport';

const STATUS_STYLE: Record<string, string> = {
  validee: 'bg-success/15 text-success border-success/30',
  soumise: 'bg-info/15 text-info border-info/30',
  brouillon: 'bg-warning/15 text-warning border-warning/30',
};

const STATUS_ICON: Record<string, any> = {
  validee: CheckCircle2,
  soumise: Clock,
  brouillon: FileEdit,
};

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { profile, isDirector } = useAuth();
  const navigate = useNavigate();
  const getName = usePrefName();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [prefectures, setPrefectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('submissions').select('*').eq('year', 2025),
      supabase.from('prefectures').select('*'),
    ]).then(([subs, prefs]) => {
      setSubmissions(subs.data ?? []);
      setPrefectures(prefs.data ?? []);
      setLoading(false);
    });
  }, []);

  // Auto-redirect director vers la saisie 2026 (sa mission principale)
  useEffect(() => {
    if (isDirector && profile?.prefecture_id) {
      navigate('/saisie', { replace: true });
    }
  }, [isDirector, profile, navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="grid gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      </AppLayout>
    );
  }

  const submitted = submissions.filter(s => s.status !== 'brouillon').length;
  const avgCompleteness = submissions.length
    ? submissions.reduce((a, s) => a + Number(s.completeness_pct ?? 0), 0) / submissions.length
    : 0;

  const totalBeneficiaries = submissions.reduce((a, s) => a + computeTotalBeneficiaries(s), 0);
  const totalAssoc = submissions.reduce((a, s) => a + (s.perm_associations ?? 0), 0);
  const totalConv = submissions.reduce((a, s) => a + (s.perm_conventions ?? 0), 0);
  const totalClubs = submissions.reduce((a, s) => a + (s.perm_clubs ?? 0), 0);
  const totalTrainings = submissions.reduce((a, s) => a + (s.integration_trainings ?? 0) + (s.camping_trainings ?? 0), 0);
  const totalFestivals = submissions.reduce((a, s) => a + (s.festivals_participants ?? 0), 0);
  const totalCamping = submissions.reduce((a, s) => a + (s.camping_participants ?? 0), 0);

  const prefMap = new Map(prefectures.map(p => [p.id, p]));

  // Ranking
  const ranking = [...submissions]
    .map(s => ({
      ...s,
      pref: prefMap.get(s.prefecture_id),
      total: computeTotalBeneficiaries(s),
    }))
    .filter(s => s.pref)
    .sort((a, b) => Number(b.global_score) - Number(a.global_score));

  const programData = [
    { name: t('detail.permanent'), value: submissions.reduce((a, s) => a + (s.perm_educative + s.perm_cultural + s.perm_sportive + s.perm_capacity), 0), color: 'hsl(var(--primary))' },
    { name: t('detail.outreach'), value: submissions.reduce((a, s) => a + (s.outreach_educative + s.outreach_cultural + s.outreach_sportive + s.outreach_capacity), 0), color: 'hsl(var(--primary-glow))' },
    { name: t('detail.camping'), value: totalCamping, color: 'hsl(var(--secondary))' },
    { name: t('detail.festivals'), value: totalFestivals, color: 'hsl(var(--info))' },
    { name: t('detail.integration'), value: submissions.reduce((a, s) => a + (s.integration_beneficiaries ?? 0), 0), color: 'hsl(var(--success))' },
  ];

  const KPIS = [
    { icon: Building2, label: t('dashboard.kpi.submitted'), value: `${submitted}/13`, tone: 1 },
    { icon: TrendingUp, label: t('dashboard.kpi.completeness'), value: `${avgCompleteness.toFixed(1)}%`, tone: 2 },
    { icon: Users, label: t('dashboard.kpi.beneficiaries'), value: formatNumber(totalBeneficiaries, i18n.language), tone: 3 },
    { icon: Sparkles, label: t('dashboard.kpi.associations'), value: formatNumber(totalAssoc, i18n.language), tone: 4 },
    { icon: Handshake, label: t('dashboard.kpi.conventions'), value: formatNumber(totalConv, i18n.language), tone: 5 },
    { icon: Trophy, label: t('dashboard.kpi.clubs'), value: formatNumber(totalClubs, i18n.language), tone: 6 },
    { icon: GraduationCap, label: t('dashboard.kpi.trainings'), value: formatNumber(totalTrainings, i18n.language), tone: 7 },
    { icon: Tent, label: t('dashboard.kpi.camping'), value: formatNumber(totalCamping, i18n.language), tone: 8 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 sm:p-8 text-primary-foreground shadow-elegant">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{t('dashboard.welcomeBack', { name: profile?.full_name ?? '' })}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">{t('dashboard.title')}</h1>
              <p className="text-sm sm:text-base opacity-90 mt-1">{t('dashboard.subtitle', { year: 2025 })}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => exportDashboardCsv(ranking, i18n.language, t)}
                className="gap-1.5 bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => exportDashboardXlsx(ranking, KPIS.map(k => ({ label: k.label, value: k.value })), i18n.language, t, 2025)}
                className="gap-1.5 bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => exportDashboardPdf(ranking, KPIS.map(k => ({ label: k.label, value: k.value })), i18n.language, t)}
                className="gap-1.5 bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
          <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute -bottom-8 -start-8 w-40 h-40 rounded-full bg-primary-glow/40 blur-2xl" />
        </div>

        {/* KPI Grid — palette catégorielle */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {KPIS.map((k, i) => {
            const Icon = k.icon;
            return (
              <Card
                key={i}
                className="relative p-4 sm:p-5 border-border/60 hover:shadow-elegant transition-smooth hover:-translate-y-0.5 overflow-hidden bg-card"
              >
                {/* Barre d'accent verticale */}
                <span
                  className="absolute inset-y-0 start-0 w-1"
                  style={{ background: `hsl(var(--kpi-${k.tone}))` }}
                />
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
                  style={{
                    background: `hsl(var(--kpi-${k.tone}-soft))`,
                    color: `hsl(var(--kpi-${k.tone}))`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div
                  className="text-xl sm:text-2xl font-extrabold tracking-tight tabular-nums"
                  style={{ color: `hsl(var(--kpi-${k.tone}))` }}
                >
                  {k.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1 leading-tight">{k.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground">{t('dashboard.ranking')}</h2>
              <Badge variant="outline" className="text-xs">{t('common.year')} 2025</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ranking.slice(0, 13).map(r => ({ name: getName(r.pref).split(' ')[0], score: Number(r.global_score) }))}>
                <XAxis dataKey="name" fontSize={10} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="font-bold text-foreground mb-4">{t('dashboard.byProgram')}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={programData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {programData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3">
              {programData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-muted-foreground truncate">{d.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{formatNumber(d.value, i18n.language)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Comparison table */}
        <Card className="overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-border">
            <h2 className="font-bold text-foreground">{t('dashboard.comparison')}</h2>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-start ps-6 py-3 font-semibold">{t('dashboard.rank')}</th>
                  <th className="text-start py-3 font-semibold">{t('dashboard.direction')}</th>
                  <th className="text-end py-3 font-semibold">{t('dashboard.score')}</th>
                  <th className="text-end py-3 font-semibold">{t('detail.beneficiaries')}</th>
                  <th className="text-start py-3 font-semibold">{t('dashboard.completeness')}</th>
                  <th className="text-center py-3 font-semibold">Statut</th>
                  <th className="text-end pe-6 py-3 font-semibold">{t('dashboard.lastUpdate')}</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, i) => {
                  const StatusIcon = STATUS_ICON[row.status] ?? FileEdit;
                  return (
                    <tr key={row.id} onClick={() => navigate(`/directions/${row.prefecture_id}`)}
                      className="border-t border-border hover:bg-muted/30 cursor-pointer transition-smooth">
                      <td className="ps-6 py-3">
                        <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold ${i < 3 ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-foreground">{getName(row.pref)}</td>
                      <td className="py-3 text-end font-bold tabular-nums">{Number(row.global_score).toFixed(1)}</td>
                      <td className="py-3 text-end tabular-nums">{formatNumber(row.total, i18n.language)}</td>
                      <td className="py-3 w-40">
                        <div className="flex items-center gap-2">
                          <Progress value={Number(row.completeness_pct)} className="h-1.5" />
                          <span className="text-xs font-semibold tabular-nums w-10">{Number(row.completeness_pct).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant="outline" className={`gap-1 text-xs ${STATUS_STYLE[row.status]}`}>
                          <StatusIcon className="h-3 w-3" />
                          {t(`status.${row.status}`)}
                        </Badge>
                      </td>
                      <td className="pe-6 py-3 text-end text-xs text-muted-foreground">{formatDate(row.submitted_at, i18n.language)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {ranking.map((row, i) => {
              const StatusIcon = STATUS_ICON[row.status] ?? FileEdit;
              return (
                <button
                  key={row.id}
                  onClick={() => navigate(`/directions/${row.prefecture_id}`)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-smooth text-start"
                >
                  <span className={`flex-shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-bold ${i < 3 ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground truncate">{getName(row.pref)}</span>
                      <span className="text-base font-extrabold text-primary tabular-nums flex-shrink-0">{Number(row.global_score).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={`gap-1 text-[10px] h-5 ${STATUS_STYLE[row.status]}`}>
                        <StatusIcon className="h-2.5 w-2.5" />
                        {t(`status.${row.status}`)}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {formatNumber(row.total, i18n.language)} {t('detail.beneficiaries')}
                      </span>
                    </div>
                    <Progress value={Number(row.completeness_pct)} className="h-1 mt-2" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 rtl:rotate-180" />
                </button>
              );
            })}
          </div>
        </Card>

        <p className="text-xs text-muted-foreground text-center">{t('detail.scoreFormula')}</p>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
