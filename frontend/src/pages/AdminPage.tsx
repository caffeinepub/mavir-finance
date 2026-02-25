import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Lock, FileText, CheckCircle2, Clock, XCircle, AlertCircle,
  Search, Loader2, Settings, DollarSign, BarChart3, TrendingUp, LogOut
} from 'lucide-react';
import {
  useApplications,
  useUpdateApplicationStatus,
  useMarkEMIPaid,
  useBankRates,
  useUpdateBankRates,
  useVerifyAdminPasscode,
  type LoanApplication,
  type ApplicationStatus,
  type BankRate,
} from '../hooks/useQueries';
import { useAuth } from '../hooks/useAuth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_OPTIONS: ApplicationStatus[] = ['Pending', 'Under Review', 'Approved', 'Rejected'];
const LOAN_TYPES = ['Personal', 'Home', 'Business', 'Vehicle', 'Education', 'Gold'] as const;

const statusBadgeClass: Record<ApplicationStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};

// ─── Admin Login (passcode fallback) ──────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [passcode, setPasscode] = useState('');
  const { mutateAsync: verify, isPending } = useVerifyAdminPasscode();

  const handleLogin = async () => {
    try {
      await verify(passcode);
      onLogin();
    } catch {
      toast.error('Invalid passcode. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="max-w-sm w-full shadow-card">
        <CardHeader className="text-center pb-4">
          <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center mx-auto mb-3">
            <Lock size={24} className="text-gold" />
          </div>
          <CardTitle className="text-navy font-display text-xl">Admin Access</CardTitle>
          <CardDescription>Enter the admin passcode to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="passcode">Admin Passcode</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button
            className="w-full bg-navy text-white hover:bg-navy-light"
            onClick={handleLogin}
            disabled={isPending || !passcode}
          >
            {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
            Login
          </Button>
          <p className="text-xs text-center text-muted-foreground">Hint: MAVIR2024</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatsCards({ applications }: { applications: LoanApplication[] }) {
  const total = applications.length;
  const pending = applications.filter((a) => a.status === 'Pending').length;
  const approved = applications.filter((a) => a.status === 'Approved').length;
  const totalValue = applications
    .filter((a) => a.status === 'Approved')
    .reduce((sum, a) => sum + a.loanAmount, 0);

  const stats = [
    { label: 'Total Applications', value: String(total), icon: FileText, color: 'text-navy' },
    { label: 'Pending Review', value: String(pending), icon: Clock, color: 'text-amber-600' },
    { label: 'Approved', value: String(approved), icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Total Approved Value', value: formatINR(totalValue), icon: DollarSign, color: 'text-gold' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-card">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Applications Table ───────────────────────────────────────────────────────

function ApplicationsTable({ applications }: { applications: LoanApplication[] }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Pending');
  const [approvalRate, setApprovalRate] = useState('10.5');
  const [approvalTenure, setApprovalTenure] = useState('36');
  const [markEMIApp, setMarkEMIApp] = useState<LoanApplication | null>(null);

  const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateApplicationStatus();
  const { mutateAsync: markPaid, isPending: markingPaid } = useMarkEMIPaid();

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchSearch =
        !search ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        a.phone.includes(search);
      const matchStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchType = filterType === 'all' || a.loanType === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [applications, search, filterStatus, filterType]);

  const handleUpdateStatus = async () => {
    if (!selectedApp) return;
    try {
      await updateStatus({
        id: selectedApp.id,
        status: newStatus,
        interestRate: newStatus === 'Approved' ? Number(approvalRate) : undefined,
        tenure: newStatus === 'Approved' ? Number(approvalTenure) : undefined,
      });
      toast.success(`Status updated to "${newStatus}"`);
      setSelectedApp(null);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleMarkPaid = async (month: number) => {
    if (!markEMIApp) return;
    try {
      await markPaid({ appId: markEMIApp.id, month });
      toast.success(`EMI #${month} marked as paid`);
    } catch {
      toast.error('Failed to mark EMI as paid');
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {LOAN_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[420px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Applicant</TableHead>
                  <TableHead className="font-semibold">Loan Type</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                  <TableHead className="font-semibold">Bank</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((app) => (
                    <TableRow key={app.id} className="hover:bg-secondary/30">
                      <TableCell className="font-mono text-xs">{app.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{app.applicantName}</p>
                          <p className="text-xs text-muted-foreground">{app.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{app.loanType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">{formatINR(app.loanAmount)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{app.preferredBank}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass[app.status]}`}>
                          {app.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{app.appliedDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => { setSelectedApp(app); setNewStatus(app.status); }}
                          >
                            Update
                          </Button>
                          {app.status === 'Approved' && app.emiSchedule.length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-gold border-gold/30 hover:bg-gold/10"
                              onClick={() => setMarkEMIApp(app)}
                            >
                              EMI
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Application ID</Label>
              <p className="font-mono text-sm text-muted-foreground">{selectedApp?.id}</p>
            </div>
            <div className="space-y-1.5">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ApplicationStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newStatus === 'Approved' && (
              <>
                <div className="space-y-1.5">
                  <Label>Interest Rate (%)</Label>
                  <Input value={approvalRate} onChange={(e) => setApprovalRate(e.target.value)} type="number" step="0.25" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tenure (months)</Label>
                  <Input value={approvalTenure} onChange={(e) => setApprovalTenure(e.target.value)} type="number" />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
            <Button
              className="bg-navy text-white hover:bg-navy-light"
              onClick={handleUpdateStatus}
              disabled={updatingStatus}
            >
              {updatingStatus && <Loader2 size={14} className="animate-spin mr-1" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EMI Dialog */}
      <Dialog open={!!markEMIApp} onOpenChange={(open) => !open && setMarkEMIApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>EMI Schedule — {markEMIApp?.id}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-72">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">EMI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {markEMIApp?.emiSchedule.map((emi) => (
                  <TableRow key={emi.month}>
                    <TableCell className="text-xs">{emi.month}</TableCell>
                    <TableCell className="text-xs">{emi.dueDate}</TableCell>
                    <TableCell className="text-right text-xs">{formatINR(emi.amount)}</TableCell>
                    <TableCell>
                      {emi.paid ? (
                        <span className="text-xs text-green-600 font-medium">Paid</span>
                      ) : (
                        <span className="text-xs text-amber-600">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!emi.paid && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs"
                          onClick={() => handleMarkPaid(emi.month)}
                          disabled={markingPaid}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Bank Rates Settings ──────────────────────────────────────────────────────

function BankRatesSettings() {
  const { data: bankRates = [] } = useBankRates();
  const { mutateAsync: updateRates, isPending } = useUpdateBankRates();
  const [rates, setRates] = useState<BankRate[]>([]);

  useMemo(() => {
    if (bankRates.length > 0) setRates(bankRates);
  }, [bankRates]);

  const handleChange = (bankName: string, field: keyof BankRate, value: string) => {
    setRates((prev) =>
      prev.map((r) => (r.bankName === bankName ? { ...r, [field]: Number(value) } : r))
    );
  };

  const handleSave = async () => {
    try {
      await updateRates(rates);
      toast.success('Bank rates updated successfully');
    } catch {
      toast.error('Failed to update rates');
    }
  };

  const rateFields: { key: keyof BankRate; label: string }[] = [
    { key: 'personalRate', label: 'Personal' },
    { key: 'homeRate', label: 'Home' },
    { key: 'businessRate', label: 'Business' },
    { key: 'vehicleRate', label: 'Vehicle' },
    { key: 'educationRate', label: 'Education' },
    { key: 'goldRate', label: 'Gold' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-navy">Bank Interest Rates</h3>
          <p className="text-xs text-muted-foreground">Configure rates for each bank and loan type</p>
        </div>
        <Button
          className="bg-navy text-white hover:bg-navy-light"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending && <Loader2 size={14} className="animate-spin mr-1" />}
          Save Rates
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[420px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">Bank</TableHead>
                  {rateFields.map((f) => (
                    <TableHead key={f.key} className="font-semibold text-center">{f.label} %</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((bank) => (
                  <TableRow key={bank.bankName}>
                    <TableCell className="font-medium text-sm">{bank.bankName}</TableCell>
                    {rateFields.map((f) => (
                      <TableCell key={f.key} className="p-1.5">
                        <Input
                          type="number"
                          step="0.25"
                          value={bank[f.key] as number}
                          onChange={(e) => handleChange(bank.bankName, f.key, e.target.value)}
                          className="h-8 text-xs text-center w-20"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────

function Reports({ applications }: { applications: LoanApplication[] }) {
  const byType = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    applications.forEach((a) => {
      if (!map[a.loanType]) map[a.loanType] = { count: 0, total: 0 };
      map[a.loanType].count++;
      map[a.loanType].total += a.loanAmount;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [applications]);

  const byBank = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    applications.forEach((a) => {
      if (!map[a.preferredBank]) map[a.preferredBank] = { count: 0, total: 0 };
      map[a.preferredBank].count++;
      map[a.preferredBank].total += a.loanAmount;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [applications]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-navy flex items-center gap-2">
            <BarChart3 size={16} /> Applications by Loan Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan Type</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byType.map(([type, data]) => (
                <TableRow key={type}>
                  <TableCell className="font-medium">{type}</TableCell>
                  <TableCell className="text-right">{data.count}</TableCell>
                  <TableCell className="text-right text-sm">{formatINR(data.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-navy flex items-center gap-2">
            <TrendingUp size={16} /> Applications by Bank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byBank.map(([bank, data]) => (
                <TableRow key={bank}>
                  <TableCell className="font-medium text-sm">{bank}</TableCell>
                  <TableCell className="text-right">{data.count}</TableCell>
                  <TableCell className="text-right text-sm">{formatINR(data.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, getCurrentUser, logout } = useAuth();
  const [passcodeAuthed, setPasscodeAuthed] = useState(false);
  const { data: applications = [], isLoading } = useApplications();

  // Check auth on mount — redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' });
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate({ to: '/login' });
  };

  // If not authenticated via login flow, show passcode gate
  if (!isAuthenticated() && !passcodeAuthed) {
    return <AdminLogin onLogin={() => setPasscodeAuthed(true)} />;
  }

  const currentUser = getCurrentUser();

  return (
    <div className="py-8 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Mahveer Finance — Loan Management System
              {currentUser && (
                <span className="ml-2 text-gold font-medium">• {currentUser.fullName}</span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Logout
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-navy" />
          </div>
        ) : (
          <>
            <StatsCards applications={applications} />

            <Tabs defaultValue="applications" className="space-y-4">
              <TabsList className="bg-secondary">
                <TabsTrigger value="applications" className="gap-1.5">
                  <FileText size={14} /> Applications
                </TabsTrigger>
                <TabsTrigger value="reports" className="gap-1.5">
                  <BarChart3 size={14} /> Reports
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1.5">
                  <Settings size={14} /> Bank Rates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="applications">
                <ApplicationsTable applications={applications} />
              </TabsContent>

              <TabsContent value="reports">
                <Reports applications={applications} />
              </TabsContent>

              <TabsContent value="settings">
                <BankRatesSettings />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
