import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { calculateEMI, useBankRates, type BankRate, type LoanType } from '../hooks/useQueries';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function getRateForType(bank: BankRate, loanType: LoanType): number {
  const map: Record<LoanType, keyof BankRate> = {
    Personal: 'personalRate',
    Home: 'homeRate',
    Business: 'businessRate',
    Vehicle: 'vehicleRate',
    Education: 'educationRate',
    Gold: 'goldRate',
  };
  return bank[map[loanType]] as number;
}

// ─── EMI Calculator ───────────────────────────────────────────────────────────

function EMICalculator() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(10.5);
  const [tenure, setTenure] = useState(36);

  const emi = useMemo(() => calculateEMI(principal, rate, tenure), [principal, rate, tenure]);
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - principal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">EMI Calculator</CardTitle>
          <CardDescription>Calculate your monthly EMI instantly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Loan Amount</Label>
              <span className="text-sm font-semibold text-navy">{formatINR(principal)}</span>
            </div>
            <Slider
              min={50000} max={10000000} step={50000}
              value={[principal]}
              onValueChange={([v]) => setPrincipal(v)}
              className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹50K</span><span>₹1Cr</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Annual Interest Rate</Label>
              <span className="text-sm font-semibold text-navy">{rate}%</span>
            </div>
            <Slider
              min={5} max={24} step={0.25}
              value={[rate]}
              onValueChange={([v]) => setRate(v)}
              className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5%</span><span>24%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Loan Tenure</Label>
              <span className="text-sm font-semibold text-navy">{tenure} months</span>
            </div>
            <Slider
              min={6} max={360} step={6}
              value={[tenure]}
              onValueChange={([v]) => setTenure(v)}
              className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6 mo</span><span>360 mo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-navy text-white">
        <CardHeader>
          <CardTitle className="text-gold">Your EMI Breakdown</CardTitle>
          <CardDescription className="text-white/60">Based on your inputs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <p className="text-white/60 text-sm mb-1">Monthly EMI</p>
            <p className="font-display text-5xl font-bold text-gold">{formatINR(emi)}</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Principal Amount', value: formatINR(principal), color: 'text-white' },
              { label: 'Total Interest', value: formatINR(totalInterest), color: 'text-gold' },
              { label: 'Total Payment', value: formatINR(totalPayment), color: 'text-white font-bold' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70 text-sm">{item.label}</span>
                <span className={`text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xs text-white/60">
              Interest is {((totalInterest / totalPayment) * 100).toFixed(1)}% of total payment
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ROI Comparison ───────────────────────────────────────────────────────────

function ROIComparison() {
  const [principal, setPrincipal] = useState(500000);
  const [tenure, setTenure] = useState(36);
  const [loanType, setLoanType] = useState<LoanType>('Personal');
  const { data: bankRates = [] } = useBankRates();

  const comparisons = useMemo(() => {
    return bankRates.map((bank) => {
      const rate = getRateForType(bank, loanType);
      const emi = calculateEMI(principal, rate, tenure);
      const total = emi * tenure;
      const interest = total - principal;
      return { bankName: bank.bankName, rate, emi, total, interest };
    }).sort((a, b) => a.emi - b.emi);
  }, [bankRates, principal, tenure, loanType]);

  const minEMI = comparisons[0]?.emi ?? 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">ROI Comparison Calculator</CardTitle>
          <CardDescription>Compare interest rates across all banking partners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Loan Amount</Label>
                <span className="text-sm font-semibold text-navy">{formatINR(principal)}</span>
              </div>
              <Slider
                min={50000} max={10000000} step={50000}
                value={[principal]}
                onValueChange={([v]) => setPrincipal(v)}
                className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Tenure (months)</Label>
                <span className="text-sm font-semibold text-navy">{tenure} mo</span>
              </div>
              <Slider
                min={6} max={360} step={6}
                value={[tenure]}
                onValueChange={([v]) => setTenure(v)}
                className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
              />
            </div>
            <div className="space-y-2">
              <Label>Loan Type</Label>
              <Select value={loanType} onValueChange={(v) => setLoanType(v as LoanType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['Personal', 'Home', 'Business', 'Vehicle', 'Education', 'Gold'] as LoanType[]).map((t) => (
                    <SelectItem key={t} value={t}>{t} Loan</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Bank / NBFC</TableHead>
                <TableHead className="font-semibold text-right">Rate (p.a.)</TableHead>
                <TableHead className="font-semibold text-right">Monthly EMI</TableHead>
                <TableHead className="font-semibold text-right">Total Interest</TableHead>
                <TableHead className="font-semibold text-right">Total Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisons.map((row, i) => (
                <TableRow key={row.bankName} className={i === 0 ? 'bg-gold/5' : ''}>
                  <TableCell className="font-medium">
                    {row.bankName}
                    {i === 0 && <Badge className="ml-2 bg-gold text-navy text-xs">Best Rate</Badge>}
                  </TableCell>
                  <TableCell className="text-right">{row.rate}%</TableCell>
                  <TableCell className={`text-right font-semibold ${i === 0 ? 'text-gold' : ''}`}>
                    {formatINR(row.emi)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatINR(row.interest)}</TableCell>
                  <TableCell className="text-right">{formatINR(row.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Eligibility Checker ──────────────────────────────────────────────────────

function EligibilityChecker() {
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [existingEMI, setExistingEMI] = useState(0);
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [desiredAmount, setDesiredAmount] = useState(500000);
  const [rate, setRate] = useState(10.5);
  const [tenure, setTenure] = useState(36);
  const [checked, setChecked] = useState(false);

  const FOIR_THRESHOLD = 0.5;

  const result = useMemo(() => {
    const availableForEMI = monthlyIncome * FOIR_THRESHOLD - existingEMI;
    if (availableForEMI <= 0) return { eligible: false, maxAmount: 0, maxEMI: 0 };
    const r = rate / 12 / 100;
    const n = tenure;
    const maxAmount = (availableForEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    const desiredEMI = calculateEMI(desiredAmount, rate, tenure);
    const eligible = desiredEMI <= availableForEMI;
    return { eligible, maxAmount: Math.round(maxAmount), maxEMI: availableForEMI, desiredEMI };
  }, [monthlyIncome, existingEMI, rate, tenure, desiredAmount]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Loan Eligibility Checker</CardTitle>
          <CardDescription>Check your eligibility using FOIR (50% threshold)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Monthly Income (₹)</Label>
              <Input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                placeholder="50000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Existing EMIs (₹)</Label>
              <Input
                type="number"
                value={existingEMI}
                onChange={(e) => setExistingEMI(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Employment Type</Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer'].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Desired Loan Amount (₹)</Label>
            <Input
              type="number"
              value={desiredAmount}
              onChange={(e) => setDesiredAmount(Number(e.target.value))}
              placeholder="500000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.25"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tenure (months)</Label>
              <Input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
              />
            </div>
          </div>
          <Button
            className="w-full bg-navy text-white hover:bg-navy-light"
            onClick={() => setChecked(true)}
          >
            Check Eligibility
          </Button>
        </CardContent>
      </Card>

      {checked && (
        <Card className={result.eligible ? 'border-green-500/50 bg-green-50/50' : 'border-destructive/50 bg-red-50/50'}>
          <CardHeader>
            <CardTitle className={result.eligible ? 'text-green-700' : 'text-destructive'}>
              {result.eligible ? '✅ Eligible for Loan' : '❌ Not Eligible'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { label: 'Monthly Income', value: formatINR(monthlyIncome) },
                { label: 'Existing EMI Obligations', value: formatINR(existingEMI) },
                { label: 'Max EMI Capacity (50% FOIR)', value: formatINR(result.maxEMI ?? 0) },
                { label: 'Required EMI for Desired Loan', value: formatINR(result.desiredEMI ?? 0) },
                { label: 'Maximum Eligible Loan Amount', value: formatINR(result.maxAmount) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
            {!result.eligible && result.maxAmount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                💡 You may be eligible for up to <strong>{formatINR(result.maxAmount)}</strong>. Consider reducing the loan amount or increasing tenure.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Prepayment Calculator ────────────────────────────────────────────────────

function PrepaymentCalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(10.5);
  const [tenure, setTenure] = useState(120);
  const [emisPaid, setEmisPaid] = useState(24);
  const [prepayment, setPrepayment] = useState(200000);
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    const r = rate / 12 / 100;
    const n = tenure;
    const emi = calculateEMI(principal, rate, n);
    // Remaining principal after emisPaid
    let balance = principal;
    for (let i = 0; i < emisPaid; i++) {
      const interest = balance * r;
      balance = balance - (emi - interest);
    }
    const remainingPrincipal = Math.max(0, balance);
    const newPrincipal = Math.max(0, remainingPrincipal - prepayment);
    const remainingTenure = n - emisPaid;
    const newEMI = calculateEMI(newPrincipal, rate, remainingTenure);
    const oldTotalInterest = emi * remainingTenure - remainingPrincipal;
    const newTotalInterest = newEMI * remainingTenure - newPrincipal;
    const interestSaved = Math.max(0, oldTotalInterest - newTotalInterest);
    const foreclosureAmount = remainingPrincipal * 1.02; // 2% foreclosure charge

    return {
      emi: Math.round(emi),
      remainingPrincipal: Math.round(remainingPrincipal),
      newPrincipal: Math.round(newPrincipal),
      newEMI: Math.round(newEMI),
      interestSaved: Math.round(interestSaved),
      foreclosureAmount: Math.round(foreclosureAmount),
      remainingTenure,
    };
  }, [principal, rate, tenure, emisPaid, prepayment]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-navy">Prepayment &amp; Foreclosure Calculator</CardTitle>
          <CardDescription>Plan your loan prepayment strategy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Original Loan Amount (₹)</Label>
              <Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Annual Interest Rate (%)</Label>
              <Input type="number" step="0.25" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Original Tenure (months)</Label>
              <Input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>EMIs Already Paid</Label>
              <Input type="number" value={emisPaid} onChange={(e) => setEmisPaid(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Prepayment Amount (₹)</Label>
            <Input type="number" value={prepayment} onChange={(e) => setPrepayment(Number(e.target.value))} />
          </div>
          <Button
            className="w-full bg-navy text-white hover:bg-navy-light"
            onClick={() => setCalculated(true)}
          >
            Calculate
          </Button>
        </CardContent>
      </Card>

      {calculated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-navy">Prepayment Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Current EMI', value: formatINR(result.emi) },
              { label: 'Remaining Principal (before prepayment)', value: formatINR(result.remainingPrincipal) },
              { label: 'Principal After Prepayment', value: formatINR(result.newPrincipal) },
              { label: 'New EMI (same tenure)', value: formatINR(result.newEMI), highlight: true },
              { label: 'Total Interest Saved', value: formatINR(result.interestSaved), highlight: true },
              { label: 'Foreclosure Amount (2% charge)', value: formatINR(result.foreclosureAmount) },
            ].map((item) => (
              <div key={item.label} className={`flex justify-between py-2 border-b border-border ${item.highlight ? 'font-semibold' : ''}`}>
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm ${item.highlight ? 'text-gold' : ''}`}>{item.value}</span>
              </div>
            ))}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 mt-2">
              💰 By prepaying {formatINR(prepayment)}, you save <strong>{formatINR(result.interestSaved)}</strong> in interest!
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalculatorsPage() {
  return (
    <div className="py-10 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-2">
            Financial Calculators
          </h1>
          <p className="text-muted-foreground">
            Plan your finances with our smart tools before you apply
          </p>
        </div>

        <Tabs defaultValue="emi">
          <TabsList className="mb-6 bg-secondary flex-wrap h-auto gap-1">
            <TabsTrigger value="emi" className="data-[state=active]:bg-navy data-[state=active]:text-white">
              <Calculator size={15} className="mr-1.5" /> EMI Calculator
            </TabsTrigger>
            <TabsTrigger value="roi" className="data-[state=active]:bg-navy data-[state=active]:text-white">
              <TrendingUp size={15} className="mr-1.5" /> ROI Comparison
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="data-[state=active]:bg-navy data-[state=active]:text-white">
              <Users size={15} className="mr-1.5" /> Eligibility Checker
            </TabsTrigger>
            <TabsTrigger value="prepayment" className="data-[state=active]:bg-navy data-[state=active]:text-white">
              <RefreshCw size={15} className="mr-1.5" /> Prepayment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emi"><EMICalculator /></TabsContent>
          <TabsContent value="roi"><ROIComparison /></TabsContent>
          <TabsContent value="eligibility"><EligibilityChecker /></TabsContent>
          <TabsContent value="prepayment"><PrepaymentCalculator /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
