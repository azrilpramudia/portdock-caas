import React from 'react';
import { 
  Globe, 
  CheckCircle2, 
  PauseCircle, 
  XCircle, 
  Lock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const TrendIndicator = ({ value, timeframe, isPositive = true }: { value: number, timeframe: string, isPositive?: boolean }) => {
  return (
    <div className="flex items-start text-[10px] xl:text-[11px] mt-0.5">
      <span className={`font-bold flex items-center shrink-0 ${isPositive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded' : 'text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded'}`}>
        {isPositive ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
        {Math.abs(value)}%
      </span>
      <span className="text-muted-foreground ml-1.5 font-medium leading-tight pt-[1px]">{timeframe}</span>
    </div>
  );
};

export function DomainStats({ domains }: { domains: any[] }) {
  const totalDomains = domains?.length || 0;
  const activeDomainsList = domains?.filter(d => d.status === 'ACTIVE') || [];
  const activeDomains = activeDomainsList.length;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringSoonList = domains?.filter(d => {
    if (!d.sslExpiresAt) return false;
    const expiresAt = new Date(d.sslExpiresAt);
    return expiresAt > now && expiresAt <= thirtyDaysFromNow;
  }) || [];
  const expiringSoonCount = expiringSoonList.length;

  const expiredList = domains?.filter(d => {
    if (!d.sslExpiresAt) return false;
    const expiresAt = new Date(d.sslExpiresAt);
    return expiresAt <= now;
  }) || [];
  const expiredCount = expiredList.length;

  const getGrowth = (items: any[]) => {
    if (!items || items.length === 0) return { value: 0, isPositive: true };
    
    const totalNow = items.length;
    const totalLastWeek = items.filter(d => new Date(d.createdAt) < oneWeekAgo).length;
    
    if (totalLastWeek === 0) {
      return { value: totalNow > 0 ? 100 : 0, isPositive: true };
    }
    
    const growth = Math.round(((totalNow - totalLastWeek) / totalLastWeek) * 100);
    return { value: Math.abs(growth), isPositive: growth >= 0 };
  };

  const totalGrowth = getGrowth(domains);
  const activeGrowth = getGrowth(activeDomainsList);
  const expiringSoonGrowth = getGrowth(expiringSoonList);
  const expiredGrowth = getGrowth(expiredList);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {/* Total Domains */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">Total Domains</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalDomains}</h3>
            <TrendIndicator value={totalGrowth.value} timeframe="dari minggu lalu" isPositive={totalGrowth.isPositive} />
          </div>
        </div>
      </div>

      {/* Active Domains */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">Active Domains</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{activeDomains}</h3>
            <TrendIndicator value={activeGrowth.value} timeframe="dari minggu lalu" isPositive={activeGrowth.isPositive} />
          </div>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <PauseCircle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">Expiring Soon</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{expiringSoonCount}</h3>
            <TrendIndicator value={expiringSoonGrowth.value} timeframe="dari minggu lalu" isPositive={expiringSoonGrowth.isPositive} />
          </div>
        </div>
      </div>

      {/* Expired Domains */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">Expired Domains</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{expiredCount}</h3>
            <TrendIndicator value={expiredGrowth.value} timeframe="dari minggu lalu" isPositive={expiredGrowth.isPositive} />
          </div>
        </div>
      </div>

      {/* Total SSL */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-purple-600 dark:text-purple-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">Total SSL</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{activeDomains}</h3>
            <TrendIndicator value={activeGrowth.value} timeframe="dari minggu lalu" isPositive={activeGrowth.isPositive} />
          </div>
        </div>
      </div>
    </div>
  );
}
