import React from 'react';
import { useStore } from './store';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user, setUser } = useStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-2xl w-full">
      <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
      <p className="text-slate-400 mb-8">Manage your personal information and preferences.</p>
      
      <form onSubmit={handleSave} className="space-y-6 glass p-8 rounded-2xl shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Name</label>
          <Input defaultValue={user.name} required className="bg-slate-800 border-white/10 text-white" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email Address</label>
          <Input type="email" defaultValue={user.email} disabled className="bg-white/5 border-white/10 text-slate-400" />
          <p className="text-xs text-slate-500">Contact support to change your email address.</p>
        </div>
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-300">Password</label>
           <Input type="password" placeholder="••••••••" className="bg-slate-800 border-white/10 text-white" />
           <p className="text-xs text-slate-500">Leave blank to keep your current password.</p>
        </div>
        
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

export function BillingPage() {
  const { user } = useStore();
  const navigate = () => { window.location.href = '/pricing' };

  if (!user) return null;

  return (
    <div className="p-8 max-w-3xl w-full">
      <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
      <p className="text-slate-400 mb-8">Manage your plan and payment methods.</p>

      <div className="glass bg-indigo-900/10 p-8 rounded-2xl border border-indigo-500/30 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-lg font-semibold text-white mb-1">Current Plan</h2>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-indigo-400">{user.plan}</span>
            {user.plan !== 'Free' && <span className="text-slate-500 font-medium mb-1">Active</span>}
          </div>
          
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Credits Usage</h3>
            {user.plan === 'Free' ? (
              <div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" style={{ width: `${(user.credits / 10) * 100}%` }} />
                </div>
                <p className="text-sm text-slate-500 mt-2">{user.credits} / 10 daily credits remaining</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                Unlimited generation credits available
              </p>
            )}
          </div>

          <div className="flex gap-4">
            {user.plan === 'Free' ? (
              <Button onClick={navigate} className="active-tab">Upgrade Plan</Button>
            ) : (
              <>
                <Button variant="danger" onClick={navigate}>Cancel Subscription</Button>
                <Button onClick={navigate} className="active-tab">Change Plan</Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {user.plan !== 'Free' && (
        <div className="glass p-8 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
          <div className="flex items-center gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
             <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center font-bold text-slate-400 text-xs shadow-inner">VISA</div>
             <div>
               <p className="font-medium text-white text-sm">•••• •••• •••• 4242</p>
               <p className="text-xs text-slate-500">Expires 12/28</p>
             </div>
             <Button variant="ghost" size="sm" className="ml-auto">Update</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const { user } = useStore();
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  if (!user?.isAdmin) return <div className="p-8">Unauthorized</div>;

  return (
    <div className="p-8 max-w-6xl w-full">
      <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 mb-8">Platform overview and user management.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <p className="text-sm text-slate-400 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-white mt-2">{loading ? '...' : users.length}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
           <p className="text-sm text-slate-400 font-medium">Active Subs</p>
           <p className="text-3xl font-bold text-indigo-400 mt-2">{loading ? '...' : users.filter(u => u.plan && u.plan !== 'Free' && u.plan.toLowerCase() !== 'free').length}</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
           <p className="text-sm text-slate-400 font-medium">Platform</p>
           <p className="text-3xl font-bold text-green-400 mt-2">Active</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
           <p className="text-sm text-slate-400 font-medium">AI Models</p>
           <p className="text-3xl font-bold text-white mt-2">Online</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
           <h3 className="font-semibold text-white">Recent Users (Supabase Integration)</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-400">User</th>
                <th className="px-6 py-3 font-medium text-slate-400">Plan</th>
                <th className="px-6 py-3 font-medium text-slate-400">Credits Remaining</th>
                <th className="px-6 py-3 font-medium text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users found. Check Supabase connection.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{u.name || 'Anonymous User'}</div>
                      <div className="text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${u.plan?.toLowerCase() === 'free' || !u.plan ? 'bg-slate-800 text-slate-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                        {u.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {u.credits !== undefined ? u.credits : 10}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
