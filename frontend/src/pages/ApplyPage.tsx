import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Upload, Loader2, FileText } from 'lucide-react';
import { useSubmitApplication, type LoanType, type EmploymentType, type DocumentMeta } from '../hooks/useQueries';

interface FormData {
  applicantName: string;
  email: string;
  phone: string;
  loanType: LoanType;
  loanAmount: number;
  preferredBank: string;
  employmentType: EmploymentType;
  monthlyIncome: number;
}

const BANKS = [
  'HDFC Bank', 'Axis Bank', 'Indian Overseas Bank', 'Kotak Mahindra Bank',
  'Mahindra Finance', 'IndusInd Bank', 'Goodrich Finance', 'Island Finance',
];

const LOAN_TYPES: LoanType[] = ['Personal', 'Home', 'Business', 'Vehicle', 'Education', 'Gold'];
const EMPLOYMENT_TYPES: EmploymentType[] = ['Salaried', 'Self-Employed', 'Business Owner', 'Freelancer'];

export default function ApplyPage() {
  const navigate = useNavigate();
  const { mutateAsync: submitApplication, isPending } = useSubmitApplication();
  const [loanType, setLoanType] = useState<LoanType>('Personal');
  const [preferredBank, setPreferredBank] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Salaried');
  const [docMeta, setDocMeta] = useState<DocumentMeta | null>(null);
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, JPG, or PNG files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setDocMeta({ name: file.name, size: file.size, type: file.type });
  };

  const onSubmit = async (data: FormData) => {
    if (!preferredBank) {
      toast.error('Please select a preferred bank');
      return;
    }
    try {
      const result = await submitApplication({
        ...data,
        loanType,
        preferredBank,
        employmentType,
        loanAmount: Number(data.loanAmount),
        monthlyIncome: Number(data.monthlyIncome),
        documentMeta: docMeta ?? undefined,
        interestRate: 0,
        tenure: 0,
      });
      setSubmitted({ id: result.id });
      toast.success('Application submitted successfully!');
    } catch {
      toast.error('Failed to submit application. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-navy">Application Submitted!</h2>
            <p className="text-muted-foreground text-sm">
              Your loan application has been received. We'll review it and get back to you within 24 hours.
            </p>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Your Application ID</p>
              <p className="font-mono font-bold text-lg text-navy">{submitted.id}</p>
              <p className="text-xs text-muted-foreground mt-1">Save this ID to track your application</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: '/portal' })}
              >
                Track Application
              </Button>
              <Button
                className="flex-1 bg-navy text-white hover:bg-navy-light"
                onClick={() => setSubmitted(null)}
              >
                New Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-10 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-2">
            Apply for a Loan
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below and we'll connect you with the best lender
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-navy">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="applicantName">Full Name *</Label>
                  <Input
                    id="applicantName"
                    placeholder="Enter your full name"
                    {...register('applicantName', { required: 'Name is required' })}
                  />
                  {errors.applicantName && <p className="text-xs text-destructive">{errors.applicantName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                    })}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit mobile number' }
                    })}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Employment Type *</Label>
                  <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as EmploymentType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyIncome">Monthly Income (₹) *</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    placeholder="50000"
                    {...register('monthlyIncome', {
                      required: 'Monthly income is required',
                      min: { value: 1, message: 'Must be positive' }
                    })}
                  />
                  {errors.monthlyIncome && <p className="text-xs text-destructive">{errors.monthlyIncome.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-navy">Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Loan Type *</Label>
                  <Select value={loanType} onValueChange={(v) => setLoanType(v as LoanType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map((t) => <SelectItem key={t} value={t}>{t} Loan</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loanAmount">Desired Loan Amount (₹) *</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="500000"
                    {...register('loanAmount', {
                      required: 'Loan amount is required',
                      min: { value: 10000, message: 'Minimum ₹10,000' }
                    })}
                  />
                  {errors.loanAmount && <p className="text-xs text-destructive">{errors.loanAmount.message}</p>}
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Preferred Bank *</Label>
                  <div className="flex flex-wrap gap-2">
                    {BANKS.map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setPreferredBank(bank)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          preferredBank === bank
                            ? 'bg-navy text-white border-navy'
                            : 'border-border hover:border-navy/50 text-foreground'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-navy">Document Upload</CardTitle>
                <CardDescription>Upload supporting documents (PDF, JPG, PNG — max 5MB)</CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-navy/50 hover:bg-secondary/50 transition-colors">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {docMeta ? (
                      <>
                        <FileText size={24} className="text-navy" />
                        <span className="text-sm font-medium text-navy">{docMeta.name}</span>
                        <span className="text-xs">{(docMeta.size / 1024).toFixed(1)} KB</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} />
                        <span className="text-sm">Click to upload document</span>
                        <span className="text-xs">PDF, JPG, PNG up to 5MB</span>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                </label>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gold text-navy hover:bg-gold-light font-semibold shadow-gold"
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 size={18} className="mr-2 animate-spin" /> Submitting...</>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
