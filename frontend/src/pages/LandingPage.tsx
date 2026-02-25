import { Link } from '@tanstack/react-router';
import { ArrowRight, Shield, Clock, Users, TrendingUp, Star, CheckCircle2, Calculator, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const bankingPartners = [
  'HDFC Bank', 'Axis Bank', 'Indian Overseas Bank', 'Kotak Mahindra Bank',
  'Mahindra Finance', 'IndusInd Bank', 'Goodrich Finance', 'Island Finance',
];

const loanProducts = [
  { name: 'Personal Loan', icon: '👤', desc: 'Quick funds for personal needs', rate: 'From 10.5%' },
  { name: 'Home Loan', icon: '🏠', desc: 'Make your dream home a reality', rate: 'From 8.4%' },
  { name: 'Business Loan', icon: '💼', desc: 'Fuel your business growth', rate: 'From 11.0%' },
  { name: 'Vehicle Loan', icon: '🚗', desc: 'Drive your dream vehicle', rate: 'From 7.9%' },
  { name: 'Education Loan', icon: '🎓', desc: 'Invest in your future', rate: 'From 9.5%' },
  { name: 'Gold Loan', icon: '✨', desc: 'Unlock value from your gold', rate: 'From 7.5%' },
];

const differentiators = [
  { icon: Shield, title: 'Trusted & Secure', desc: 'Your data is protected with bank-grade security and complete transparency.' },
  { icon: Clock, title: 'Fast Processing', desc: 'Get loan approvals in as little as 24 hours with our streamlined process.' },
  { icon: Users, title: '8+ Banking Partners', desc: 'Access the best rates from leading banks and NBFCs across India.' },
  { icon: TrendingUp, title: 'Smart Tools', desc: 'Use our calculators to plan your finances before you apply.' },
];

const tools = [
  { icon: Calculator, title: 'EMI Calculator', desc: 'Calculate your monthly EMI instantly', path: '/calculators' },
  { icon: BarChart3, title: 'ROI Comparison', desc: 'Compare rates across all banks', path: '/calculators' },
  { icon: TrendingUp, title: 'Eligibility Checker', desc: 'Know your loan eligibility in seconds', path: '/calculators' },
  { icon: FileText, title: 'Prepayment Planner', desc: 'Plan your loan prepayment strategy', path: '/calculators' },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/assets/generated/hero-banner.dim_1440x600.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold/5 translate-y-1/2 -translate-x-1/3" />

        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 hover:bg-gold/30">
              🏆 India's Trusted Loan Partner
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
              Finance Made{' '}
              <span className="text-gold">Simple</span>{' '}
              &amp;{' '}
              <span className="text-gold">Smart</span>
            </h1>
            <p className="text-lg md:text-xl text-white/75 mb-8 leading-relaxed max-w-2xl">
              Access the best loan rates from 8+ leading banks and NBFCs. Compare, calculate, and apply — all in one place with Mahveer Finance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/apply">
                <Button size="lg" className="bg-gold text-navy hover:bg-gold-light font-semibold shadow-gold gap-2">
                  Apply for a Loan <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/calculators">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                  <Calculator size={18} /> Try Calculators
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/60">
              {['No Hidden Charges', 'Instant Eligibility Check', 'Paperless Process'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-gold" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banking Partners */}
      <section className="bg-white border-b border-border py-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">
            Our Banking Partners
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {bankingPartners.map((bank) => (
              <div
                key={bank}
                className="px-4 py-2 rounded-full border border-border bg-secondary text-sm font-medium text-foreground hover:border-gold hover:text-navy transition-colors"
              >
                {bank}
              </div>
            ))}
            <div className="px-4 py-2 rounded-full border border-dashed border-border text-sm text-muted-foreground">
              + Other NBFC Partners
            </div>
          </div>
        </div>
      </section>

      {/* Loan Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
              Loan Products
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Choose from a wide range of loan products tailored to your needs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loanProducts.map((product) => (
              <Link key={product.name} to="/apply">
                <Card className="card-hover cursor-pointer border-border hover:border-gold/50 group">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-3">{product.icon}</div>
                    <h3 className="font-semibold text-lg text-navy mb-1 group-hover:text-gold transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.desc}</p>
                    <span className="text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                      {product.rate}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Tools */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
              Smart Financial Tools
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Plan your finances with our powerful calculators before you apply
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tools.map((tool) => (
              <Link key={tool.title} to={tool.path}>
                <Card className="card-hover cursor-pointer text-center border-border hover:border-gold/50 group h-full">
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center mb-4 group-hover:bg-gold/10 transition-colors">
                      <tool.icon size={22} className="text-navy group-hover:text-gold transition-colors" />
                    </div>
                    <h3 className="font-semibold text-navy mb-1 group-hover:text-gold transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/calculators">
              <Button className="bg-navy text-white hover:bg-navy-light gap-2">
                Explore All Tools <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
              Why Choose Mahveer Finance?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We make the loan process transparent, fast, and hassle-free
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={26} className="text-gold" />
                </div>
                <h3 className="font-semibold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="navy-gradient py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Apply for your loan today and get a response within 24 hours. No hidden charges, no surprises.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/apply">
              <Button size="lg" className="bg-gold text-navy hover:bg-gold-light font-semibold shadow-gold gap-2">
                Apply Now <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/portal">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Track My Application
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
