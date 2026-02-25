import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoanType = 'Personal' | 'Home' | 'Business' | 'Vehicle' | 'Education' | 'Gold';
export type EmploymentType = 'Salaried' | 'Self-Employed' | 'Business Owner' | 'Freelancer';
export type ApplicationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

export interface DocumentMeta {
  name: string;
  size: number;
  type: string;
}

export interface EMIPayment {
  month: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  paid: boolean;
  paidDate?: string;
}

export interface LoanApplication {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  loanType: LoanType;
  loanAmount: number;
  preferredBank: string;
  employmentType: EmploymentType;
  monthlyIncome: number;
  documentMeta?: DocumentMeta;
  status: ApplicationStatus;
  appliedDate: string;
  emiSchedule: EMIPayment[];
  interestRate: number;
  tenure: number;
}

export interface BankRate {
  bankName: string;
  personalRate: number;
  homeRate: number;
  businessRate: number;
  vehicleRate: number;
  educationRate: number;
  goldRate: number;
}

// ─── Local Storage Helpers ────────────────────────────────────────────────────

const STORAGE_KEY = 'mavir_applications';
const RATES_KEY = 'mavir_bank_rates';
const ADMIN_PASSCODE = 'MAVIR2024';

function loadApplications(): LoanApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveApplications(apps: LoanApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function loadBankRates(): BankRate[] {
  try {
    const raw = localStorage.getItem(RATES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to defaults
  }
  return DEFAULT_BANK_RATES;
}

function saveBankRates(rates: BankRate[]) {
  localStorage.setItem(RATES_KEY, JSON.stringify(rates));
}

export const DEFAULT_BANK_RATES: BankRate[] = [
  { bankName: 'HDFC Bank', personalRate: 10.5, homeRate: 8.4, businessRate: 11.0, vehicleRate: 7.9, educationRate: 9.5, goldRate: 7.5 },
  { bankName: 'Axis Bank', personalRate: 10.75, homeRate: 8.55, businessRate: 11.25, vehicleRate: 8.1, educationRate: 9.75, goldRate: 7.75 },
  { bankName: 'Indian Overseas Bank', personalRate: 11.0, homeRate: 8.7, businessRate: 11.5, vehicleRate: 8.3, educationRate: 9.9, goldRate: 7.9 },
  { bankName: 'Kotak Mahindra Bank', personalRate: 10.99, homeRate: 8.65, businessRate: 11.4, vehicleRate: 8.2, educationRate: 9.8, goldRate: 7.8 },
  { bankName: 'Mahindra Finance', personalRate: 12.0, homeRate: 9.5, businessRate: 12.5, vehicleRate: 9.0, educationRate: 10.5, goldRate: 8.5 },
  { bankName: 'IndusInd Bank', personalRate: 11.5, homeRate: 9.0, businessRate: 12.0, vehicleRate: 8.75, educationRate: 10.25, goldRate: 8.25 },
  { bankName: 'Goodrich Finance', personalRate: 13.0, homeRate: 10.0, businessRate: 13.5, vehicleRate: 9.5, educationRate: 11.0, goldRate: 9.0 },
  { bankName: 'Island Finance', personalRate: 13.5, homeRate: 10.5, businessRate: 14.0, vehicleRate: 10.0, educationRate: 11.5, goldRate: 9.5 },
];

// ─── EMI Calculation ──────────────────────────────────────────────────────────

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function generateEMISchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDate: Date = new Date()
): EMIPayment[] {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const r = annualRate / 12 / 100;
  const schedule: EMIPayment[] = [];
  let balance = principal;

  for (let i = 1; i <= tenureMonths; i++) {
    const interest = balance * r;
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({
      month: i,
      dueDate: dueDate.toISOString().split('T')[0],
      amount: Math.round(emi * 100) / 100,
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      paid: false,
    });
  }
  return schedule;
}

function generateId(): string {
  return 'MF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useApplications() {
  return useQuery<LoanApplication[]>({
    queryKey: ['applications'],
    queryFn: () => loadApplications(),
    staleTime: 0,
  });
}

export function useApplication(id: string, phone: string) {
  return useQuery<LoanApplication | null>({
    queryKey: ['application', id, phone],
    queryFn: () => {
      const apps = loadApplications();
      return apps.find(a => a.id === id && a.phone === phone) ?? null;
    },
    enabled: !!id && !!phone,
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<LoanApplication, 'id' | 'appliedDate' | 'status' | 'emiSchedule'>) => {
      const apps = loadApplications();
      const newApp: LoanApplication = {
        ...data,
        id: generateId(),
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        emiSchedule: [],
      };
      apps.push(newApp);
      saveApplications(apps);
      return newApp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, interestRate, tenure }: { id: string; status: ApplicationStatus; interestRate?: number; tenure?: number }) => {
      const apps = loadApplications();
      const idx = apps.findIndex(a => a.id === id);
      if (idx === -1) throw new Error('Application not found');
      apps[idx].status = status;
      if (status === 'Approved' && interestRate && tenure) {
        apps[idx].interestRate = interestRate;
        apps[idx].tenure = tenure;
        apps[idx].emiSchedule = generateEMISchedule(apps[idx].loanAmount, interestRate, tenure);
      }
      saveApplications(apps);
      return apps[idx];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application'] });
    },
  });
}

export function useMarkEMIPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appId, month }: { appId: string; month: number }) => {
      const apps = loadApplications();
      const idx = apps.findIndex(a => a.id === appId);
      if (idx === -1) throw new Error('Application not found');
      const emiIdx = apps[idx].emiSchedule.findIndex(e => e.month === month);
      if (emiIdx !== -1) {
        apps[idx].emiSchedule[emiIdx].paid = true;
        apps[idx].emiSchedule[emiIdx].paidDate = new Date().toISOString().split('T')[0];
      }
      saveApplications(apps);
      return apps[idx];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application'] });
    },
  });
}

export function useBankRates() {
  return useQuery<BankRate[]>({
    queryKey: ['bankRates'],
    queryFn: () => loadBankRates(),
    staleTime: 0,
  });
}

export function useUpdateBankRates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rates: BankRate[]) => {
      saveBankRates(rates);
      return rates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankRates'] });
    },
  });
}

export function useVerifyAdminPasscode() {
  return useMutation({
    mutationFn: async (passcode: string) => {
      if (passcode !== ADMIN_PASSCODE) throw new Error('Invalid passcode');
      return true;
    },
  });
}
