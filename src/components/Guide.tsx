import { useState } from 'react';
import { BookOpen, Target, PiggyBank, TrendingUp, Calculator, Shield, Users, ChevronRight, Play, ExternalLink } from 'lucide-react';
import { Card, Button } from './ui';
import { motion, AnimatePresence } from 'framer-motion';
import { parseMarkdown } from '../utils/markdownParser';

interface GuideSection {
  id: string;
  title: string;
  icon: any;
  description: string;
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  content: string;
  actionButton?: {
    text: string;
    action: () => void;
    available: boolean;
  };
  tips: string[];
}

interface Props {
  onNavigate?: (route: string) => void;
  onOpenTransactionForm?: () => void;
  onOpenWalletManager?: () => void;
}

export default function Guide({ onNavigate, onOpenTransactionForm, onOpenWalletManager }: Props) {
  const [selectedSection, setSelectedSection] = useState<string>('basics');
  const [selectedArticle, setSelectedArticle] = useState<string>('');

  const sections: GuideSection[] = [
    {
      id: 'basics',
      title: 'Financial Basics',
      icon: BookOpen,
      description: 'Learn the fundamentals of personal finance',
      articles: [
        {
          id: 'emergency-fund',
          title: 'Building Your Emergency Fund',
          content: `An emergency fund is your financial safety net. It should cover 3-6 months of your essential expenses.

**Why You Need It:**
• Unexpected medical bills
• Job loss or income reduction  
• Major home or car repairs
• Economic downturns

**How to Build It:**
1. Calculate your monthly essential expenses
2. Set a target of 3-6 months of expenses
3. Start with a small goal (Rp 5.000.000)
4. Save automatically each month
5. Keep it in a separate, easily accessible account

**Quick Start:** Begin by saving Rp 500.000 per month. In 10 months, you'll have Rp 5.000.000 emergency fund!`,
          actionButton: {
            text: 'Track Your Emergency Fund',
            action: () => onOpenTransactionForm?.(),
            available: true
          },
          tips: [
            'Start small - even Rp 100.000/month adds up',
            'Use a separate wallet in this app to track it',
            'Automate transfers to avoid temptation'
          ]
        },
        {
          id: 'budgeting-101',
          title: 'Budgeting 101: The 50/30/20 Rule',
          content: `The 50/30/20 rule is a simple budgeting framework that helps you allocate your income effectively.

**The Breakdown:**
• **50% - Needs:** Rent, utilities, groceries, minimum debt payments
• **30% - Wants:** Entertainment, dining out, hobbies, shopping
• **20% - Savings & Debt:** Emergency fund, investments, extra debt payments

**Example with Rp 6.000.000 monthly income:**
• Needs: Rp 3.000.000 (rent, utilities, groceries)
• Wants: Rp 1.800.000 (entertainment, shopping)
• Savings: Rp 1.200.000 (emergency fund, investments)

**Getting Started:**
1. Track your expenses for one month
2. Categorize them into needs, wants, and savings
3. Adjust your spending to match the 50/30/20 ratio
4. Review and adjust monthly`,
          actionButton: {
            text: 'Start Tracking Expenses',
            action: () => onOpenTransactionForm?.(),
            available: true
          },
          tips: [
            'Use categories in this app to track needs vs wants',
            'Review your spending weekly',
            'Adjust percentages based on your situation'
          ]
        }
      ]
    },
    {
      id: 'saving',
      title: 'Smart Saving',
      icon: PiggyBank,
      description: 'Strategies to save money effectively',
      articles: [
        {
          id: 'saving-strategies',
          title: 'Proven Saving Strategies',
          content: `Saving money doesn't have to be painful. Here are proven strategies that work:

**1. Pay Yourself First**
Treat savings like a bill. Save before you spend on anything else.

**2. The 24-Hour Rule**
Wait 24 hours before making non-essential purchases over Rp 200.000.

**3. Automate Everything**
Set up automatic transfers to savings accounts.

**4. Use the Envelope Method**
Allocate cash for different spending categories.

**5. Find Your Money Leaks**
Track small, recurring expenses that add up:
• Daily coffee: Rp 10.000 × 30 = Rp 300.000/month
• Unused subscriptions: Rp 50.000-200.000/month
• Impulse purchases: Rp 100.000-500.000/month

**Quick Wins:**
• Cook at home 3 more times per week: Save Rp 300.000/month
• Cancel unused subscriptions: Save Rp 100.000/month
• Use public transport twice a week: Save Rp 150.000/month`,
          actionButton: {
            text: 'Analyze Your Spending',
            action: () => onNavigate?.('/dashboard'),
            available: true
          },
          tips: [
            'Start with one strategy at a time',
            'Use this app to track your progress',
            'Celebrate small wins to stay motivated'
          ]
        }
      ]
    },
    {
      id: 'investing',
      title: 'Investment Basics',
      icon: TrendingUp,
      description: 'Start your investment journey',
      articles: [
        {
          id: 'investment-fundamentals',
          title: 'Investment Fundamentals for Beginners',
          content: `Investing helps your money grow over time. Here's how to start:

**Investment Hierarchy:**
1. **Emergency Fund First** (3-6 months expenses)
2. **High-Interest Debt** (Pay off credit cards)
3. **Employer Provident Fund** (Get the match)
4. **Diversified Investments** (Mutual funds, stocks)

**Investment Options in Indonesia:**
• **SIP in Mutual Funds:** Start with Rp 100.000/month
• **Deposito:** Safe but low returns
• **Obligasi:** Government bonds
• **Saham:** Higher risk, higher potential returns
• **Emas:** Gold investment

**Golden Rules:**
• Start early (time is your biggest advantage)
• Diversify your investments
• Don't try to time the market
• Invest regularly (SIP approach)
• Review annually, don't check daily

**Sample Portfolio for Beginners:**
• 60% Equity Mutual Funds (SIP)
• 20% Debt Funds
• 10% PPF
• 10% Emergency Fund (Liquid)`,
          actionButton: {
            text: 'Coming Soon - Investment Tracker',
            action: () => {},
            available: false
          },
          tips: [
            'Start with just Rp 50.000/month SIP',
            'Use this app to track investment transactions',
            'Focus on learning, not quick profits'
          ]
        }
      ]
    },
    {
      id: 'debt',
      title: 'Debt Management',
      icon: Calculator,
      description: 'Strategies to manage and eliminate debt',
      articles: [
        {
          id: 'debt-elimination',
          title: 'Debt Elimination Strategies',
          content: `Debt can be overwhelming, but with the right strategy, you can become debt-free:

**Two Popular Methods:**

**1. Debt Snowball Method:**
• List debts from smallest to largest balance
• Pay minimums on all debts
• Put extra money toward smallest debt
• Once paid off, move to next smallest
• Builds momentum and motivation

**2. Debt Avalanche Method:**
• List debts from highest to lowest interest rate
• Pay minimums on all debts  
• Put extra money toward highest interest debt
• Mathematically optimal, saves more money

**Credit Card Debt Priority:**
Credit cards typically have 24-48% annual interest. Pay these off first!

**Example Debt Payoff Plan:**
• Credit Card: Rp 5.000.000 at 36% interest → Pay Rp 800.000/month
• Personal Loan: Rp 20.000.000 at 12% interest → Pay minimum
• Home Loan: Rp 150.000.000 at 8% interest → Pay minimum

**Debt Prevention:**
• Build emergency fund to avoid new debt
• Use credit cards responsibly (pay full balance)
• Avoid lifestyle inflation`,
          actionButton: {
            text: 'Coming Soon - Debt Management',
            action: () => {},
            available: false
          },
          tips: [
            'Choose the method that motivates you most',
            'Track all debt payments in this app',
            'Consider debt consolidation if beneficial'
          ]
        }
      ]
    },
    {
      id: 'protection',
      title: 'Financial Protection',
      icon: Shield,
      description: 'Protect your financial future',
      articles: [
        {
          id: 'insurance-basics',
          title: 'Essential Insurance Coverage',
          content: `Insurance protects you from financial disasters. Here's what you need:

**Must-Have Insurance:**

**1. Health Insurance**
• Minimum Rp 50.000.000 coverage per person
• Family floater plans are cost-effective
• Covers hospitalization, surgeries, treatments
• Premium: Rp 800.000-1.500.000 annually for family

**2. Term Life Insurance**
• Coverage: 10-15 times your annual income
• If you earn Rp 60.000.000/year, get Rp 600.000.000-900.000.000 coverage
• Premium: Rp 800.000-1.200.000 annually for Rp 1.000.000.000 coverage
• Buy when young for lower premiums

**3. Motor Insurance**
• Mandatory by law
• Third-party + comprehensive coverage
• Premium: Rp 500.000-1.500.000 annually

**Optional but Recommended:**
• Personal Accident Insurance
• Home Insurance (if you own property)
• Travel Insurance (for trips)

**Insurance Mistakes to Avoid:**
• Buying insurance as investment (ULIPs, endowment)
• Under-insuring yourself
• Not reading policy terms
• Delaying purchase (premiums increase with age)`,
          actionButton: {
            text: 'Coming Soon - Insurance Tracker',
            action: () => {},
            available: false
          },
          tips: [
            'Buy term insurance before age 30',
            'Review coverage every 3-5 years',
            'Keep all insurance payments in a separate category'
          ]
        }
      ]
    },
    {
      id: 'family',
      title: 'Family Finance',
      icon: Users,
      description: 'Managing finances as a family',
      articles: [
        {
          id: 'family-budgeting',
          title: 'Family Financial Planning',
          content: `Managing family finances requires coordination and planning:

**Family Budget Categories:**
• **Housing:** 25-30% (rent/EMI, utilities, maintenance)
• **Food:** 10-15% (groceries, dining out)
• **Transportation:** 10-15% (fuel, maintenance, EMI)
• **Children:** 10-20% (education, activities, clothes)
• **Healthcare:** 5-10% (insurance, medical expenses)
• **Savings:** 20-25% (emergency fund, investments)
• **Entertainment:** 5-10% (movies, vacations, hobbies)

**Family Financial Goals:**
• Emergency fund (6 months expenses)
• Children's education fund
• Home down payment
• Retirement planning
• Family vacation fund

**Teaching Kids About Money:**
• Give age-appropriate allowances
• Involve them in budget discussions
• Teach saving vs spending
• Open savings accounts for them
• Use this app to track their expenses

**Dual Income Management:**
• Maintain joint and individual accounts
• Decide who pays for what
• Regular financial meetings
• Shared financial goals`,
          actionButton: {
            text: 'Set Up Family Wallets',
            action: () => onOpenWalletManager?.(),
            available: true
          },
          tips: [
            'Use separate wallets for each family member',
            'Have monthly family budget meetings',
            'Teach children by example'
          ]
        }
      ]
    }
  ];

  const currentSection = sections.find(s => s.id === selectedSection);
  const currentArticle = currentSection?.articles.find(a => a.id === selectedArticle);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Topics */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Topics</h2>
            <div className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section.id);
                      setSelectedArticle('');
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedSection === section.id
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs opacity-75">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!selectedArticle ? (
              // Articles List
              <motion.div
                key="articles-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    {currentSection && (
                      <>
                        <currentSection.icon className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-semibold text-gray-100">{currentSection.title}</h2>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {currentSection?.articles.map((article) => (
                      <div
                        key={article.id}
                        className="p-4 border border-gray-600 rounded-lg hover:border-purple-500 transition-colors cursor-pointer"
                        onClick={() => setSelectedArticle(article.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-100 mb-1">{article.title}</h3>
                            <p className="text-sm text-gray-400">
                              {article.content.split('\n')[0].substring(0, 100)}...
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : (
              // Article Content
              <motion.div
                key="article-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  <div className="mb-4">
                    <Button
                      onClick={() => setSelectedArticle('')}
                      variant="secondary"
                      size="sm"
                      className="mb-4"
                    >
                      ← Back to {currentSection?.title}
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">{currentArticle?.title}</h2>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div 
                      className="text-gray-300 leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: currentArticle?.content ? parseMarkdown(currentArticle.content) : ''
                      }}
                    />
                  </div>

                  {/* Interactive Action */}
                  {currentArticle?.actionButton && (
                    <div className={`mt-8 p-4 rounded-lg border ${
                      currentArticle.actionButton.available 
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30'
                        : 'bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-500/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {currentArticle.actionButton.available ? (
                          <Play className="w-5 h-5 text-purple-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-100">
                          {currentArticle.actionButton.available ? 'Try It Now' : 'Feature In Development'}
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-4">
                        {currentArticle.actionButton.available 
                          ? 'Put this knowledge into practice with your Uwang app:'
                          : 'We\'re actively building this feature to help you manage your finances better. Stay tuned for updates!'
                        }
                      </p>
                      <Button
                        onClick={currentArticle.actionButton.action}
                        variant={currentArticle.actionButton.available ? 'primary' : 'gray'}
                        disabled={!currentArticle.actionButton.available}
                        className="flex items-center gap-2"
                      >
                        {currentArticle.actionButton.available ? (
                          <ExternalLink className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-dashed" />
                        )}
                        {currentArticle.actionButton.text}
                      </Button>
                    </div>
                  )}

                  {/* Tips */}
                  {currentArticle?.tips && currentArticle.tips.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-500/30">
                      <h3 className="font-semibold text-blue-300 mb-3">💡 Pro Tips</h3>
                      <ul className="space-y-2">
                        {currentArticle.tips.map((tip, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}