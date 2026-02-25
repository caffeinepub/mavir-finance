import { useState } from 'react';
import { useApplication } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  Pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, label: 'Pending' },
  'Under Review': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle, label: 'Under Review' },
  Approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Approved' },
  Rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Rejected' },
};

export default function CustomerPortalPage() {
  const [appId, setAppId] = useState('');
  const [phone, setPhone] = useState('');
  const [searchParams, setSearchParams] = useState<{ id: string; phone: string } | null>(null);

  const { data: application, isLoading, isFetched } = useApplication(
    searchParams?.id ?? '',
    searchParams?.phone ?? ''
  );

  const handleSearch = () => {
    if (!appId.trim() || !phone.trim()) return;
    setSearchParams({ id: appId.trim(), phone: phone.trim() });
  };

  const status = application?.status ?? 'Pending';
  const statusInfo = statusConfig[status] ?? statusConfig.Pending;
  const StatusIcon = statusInfo.icon;

  const paidEMIs = application?.emiSchedule.filter(e => e.paid).length ?? 0;
  const totalEMIs = application?.emiSchedule.length ?? 0;
  const nextEMI = application?.emiSchedule.find(e => !e.paid);

  return (
    <div className="py-10 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-2">
            Customer Portal
          </h1>
          <p className="text-muted-foreground">
            Track your loan application status and EMI schedule
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base text-navy">Look Up Your Application</CardTitle>
            <CardDescription>Enter your Application ID and registered phone number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="appId">Application ID</Label>
                <Input
                  id="appId"
                  placeholder="e.g. MF1A2B3C4D"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="portalPhone">Phone Number</Label>
                <Input
                  id="portalPhone"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="bg-navy text-white hover:bg-navy-light gap-2 w-full sm:w-auto"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 size={32} className="animate-spin mx-auto mb-3" />
            <p>Searching...</p>
          </div>
        )}

        {isFetched && searchParams && !isLoading && !application && (
          <Card className="text-center py-12">
            <CardContent>
              <XCircle size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground">Application Not Found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please check your Application ID and phone number and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {application && (
          <div className="space-y-6 animate-fade-in">
            {/* Status Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Application ID</p>
                    <p className="font-mono font-bold text-lg text-navy">{application.id}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Applied on {new Date(application.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${statusInfo.color}`}>
                    <StatusIcon size={16} />
                    {statusInfo.label}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm text-navy">Applicant Details</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    { label: 'Name', value: application.applicantName },
                    { label: 'Email', value: application.email },
                    { label: 'Phone', value: application.phone },
                    { label: 'Employment', value: application.employmentType },
                    { label: 'Monthly Income', value: formatINR(application.monthlyIncome) },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm text-navy">Loan Details</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    { label: 'Loan Type', value: `${application.loanType} Loan` },
                    { label: 'Loan Amount', value: formatINR(application.loanAmount) },
                    { label: 'Preferred Bank', value: application.preferredBank },
                    ...(application.status === 'Approved' ? [
                      { label: 'Interest Rate', value: `${application.interestRate}% p.a.` },
                      { label: 'Tenure', value: `${application.tenure} months` },
                    ] : []),
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* EMI Schedule (only if approved) */}
            {application.status === 'Approved' && application.emiSchedule.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-navy">EMI Schedule</CardTitle>
                    <div className="flex gap-3 text-sm">
                      <span className="text-green-600 font-medium">{paidEMIs} Paid</span>
                      <span className="text-muted-foreground">{totalEMIs - paidEMIs} Remaining</span>
                    </div>
                  </div>
                  {nextEMI && (
                    <CardDescription>
                      Next EMI: <strong>{formatINR(nextEMI.amount)}</strong> due on {new Date(nextEMI.dueDate).toLocaleDateString('en-IN')}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-72">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead>Month</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">EMI</TableHead>
                          <TableHead className="text-right">Principal</TableHead>
                          <TableHead className="text-right">Interest</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {application.emiSchedule.map((emi) => (
                          <TableRow key={emi.month} className={emi.paid ? 'opacity-60' : ''}>
                            <TableCell>{emi.month}</TableCell>
                            <TableCell>{new Date(emi.dueDate).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell className="text-right">{formatINR(emi.amount)}</TableCell>
                            <TableCell className="text-right">{formatINR(emi.principal)}</TableCell>
                            <TableCell className="text-right">{formatINR(emi.interest)}</TableCell>
                            <TableCell className="text-right">{formatINR(emi.balance)}</TableCell>
                            <TableCell>
                              {emi.paid ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Paid</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Pending</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
