import React from 'react';
import { useApp } from '../context/Store';
import { Card } from '../components/ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, Briefcase, Clock, UserPlus, TrendingUp, TrendingDown, Activity } from 'lucide-react';

// Restored diverse palette for data visualization
const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

const MetricCard = ({ title, value, trend, trendDirection, icon: Icon, colorClass, trendColorClass }: any) => (
  <Card className="flex flex-col justify-between h-full border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[13px] font-medium text-gray-500 tracking-wide uppercase">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-3 tracking-tight">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 border border-opacity-10`}>
        <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs font-medium">
      {trendDirection === 'up' ? (
        <TrendingUp size={14} className={`${trendColorClass} mr-1.5`} />
      ) : (
        <TrendingDown size={14} className={`${trendColorClass} mr-1.5`} />
      )}
      <span className={`${trendColorClass} mr-1.5`}>{trend}</span>
      <span className="text-gray-400 font-normal">vs last month</span>
    </div>
  </Card>
);

export const Dashboard: React.FC = () => {
  const { candidates, jobs, activities } = useApp();

  // Derived Data
  const totalCandidates = candidates.length;
  const activeJobs = jobs.filter(j => j.status === 'Open').length;
  const newCandidates = candidates.filter(c => {
    const date = new Date(c.addedAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return date >= sevenDaysAgo;
  }).length;

  // Funnel Data
  const stageCounts = candidates.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const funnelData = [
    { name: 'Applied', value: stageCounts['Applied'] || 0 },
    { name: 'Screening', value: stageCounts['Screening'] || 0 },
    { name: 'Technical', value: stageCounts['Technical'] || 0 },
    { name: 'Manager', value: stageCounts['Manager'] || 0 },
    { name: 'Offer', value: stageCounts['Offer'] || 0 },
    { name: 'Hired', value: stageCounts['Hired'] || 0 },
  ].filter(d => d.value > 0);

  // Skills Data (Mock aggregated)
  const skillsData = [
    { name: 'React', count: 12 },
    { name: 'TypeScript', count: 10 },
    { name: 'Python', count: 8 },
    { name: 'Design', count: 6 },
    { name: 'Node.js', count: 5 },
  ];

  // Rejection Data
  const rejectionData = [
    { name: 'Skills', value: 30 },
    { name: 'Culture', value: 20 },
    { name: 'Salary', value: 15 },
    { name: 'Other', value: 35 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Candidates"
          value={totalCandidates}
          trend="+12%"
          trendDirection="up"
          trendColorClass="text-blue-600"
          icon={Users}
          colorClass="bg-blue-500 text-blue-600 border-blue-200"
        />
        <MetricCard
          title="New (7d)"
          value={newCandidates}
          trend="+5%"
          trendDirection="up"
          trendColorClass="text-violet-600"
          icon={UserPlus}
          colorClass="bg-violet-500 text-violet-600 border-violet-200"
        />
        <MetricCard
          title="Active Jobs"
          value={activeJobs}
          trend="Stable"
          trendDirection="up"
          trendColorClass="text-amber-600"
          icon={Briefcase}
          colorClass="bg-amber-500 text-amber-600 border-amber-200"
        />
        <MetricCard
          title="Avg Time to Hire"
          value="18d"
          trend="-2 days"
          trendDirection="down" // Good thing
          trendColorClass="text-emerald-600"
          icon={Clock}
          colorClass="bg-emerald-500 text-emerald-600 border-emerald-200"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="min-h-[400px] flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900">Pipeline Volume</h3>
            <p className="text-sm text-gray-500">Candidates currently in each stage</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }} barSize={32}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="min-h-[400px] flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900">Talent Pool Skills</h3>
            <p className="text-sm text-gray-500">Most common skills among candidates</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 min-h-[300px]">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Rejection Reasons</h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rejectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rejectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">142</span>
            </div>
          </div>
          <div className="mt-6 space-y-3 px-2">
            {rejectionData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-gray-600 font-medium">{entry.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{entry.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest updates from your team</p>
            </div>
            <button className="text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">View All</button>
          </div>
          <div className="space-y-0">
            {activities.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-start py-4 border-b border-gray-200 last:border-0 hover:bg-gray-50/50 -mx-4 px-4 transition-colors">
                <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center mr-4 mt-0.5 shrink-0 border
                    ${activity.type === 'upload' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                    ${activity.type === 'stage_change' ? 'bg-violet-50 text-violet-600 border-violet-100' : ''}
                    ${activity.type === 'note' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                  `}>
                  {activity.type === 'upload' && <UserPlus size={16} />}
                  {activity.type === 'stage_change' && <Activity size={16} />}
                  {activity.type === 'note' && <Briefcase size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400 font-medium tabular-nums whitespace-nowrap ml-4">
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};