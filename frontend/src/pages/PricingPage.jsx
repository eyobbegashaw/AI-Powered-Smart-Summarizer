// import React, { useState } from 'react';
// import { Check, Star, Zap, Building, CreditCard, Shield, Sparkles, Users, FileText, Clock, Headphones } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';

// const PricingPage = () => {
//   const { user } = useAuth();
//   const [billingCycle, setBillingCycle] = useState('monthly');

//   const plans = [
//     {
//       name: 'Free',
//       price: { monthly: 0, yearly: 0 },
//       description: 'Perfect for occasional use',
//       features: [
//         '50 summaries per month',
//         'Documents up to 10MB',
//         'Basic summarization',
//         'Export to TXT',
//         '7-day history retention',
//         'Email support'
//       ],
//       limitations: ['No API access', 'No priority support', 'Limited to 1 device'],
//       icon: Star,
//       color: 'gray',
//       buttonText: 'Current Plan',
//       popular: false
//     },
//     {
//       name: 'Pro',
//       price: { monthly: 29, yearly: 290 },
//       description: 'For professionals and power users',
//       features: [
//         '500 summaries per month',
//         'Documents up to 50MB',
//         'Advanced AI summarization',
//         'All summary types',
//         'Export to PDF, DOCX, TXT',
//         'Keyword extraction',
//         '30-day history retention',
//         'API access (1000 requests/month)',
//         'Priority email support',
//         'Bilingual summarization'
//       ],
//       limitations: [],
//       icon: Zap,
//       color: 'primary',
//       buttonText: 'Upgrade to Pro',
//       popular: true
//     },
//     {
//       name: 'Enterprise',
//       price: { monthly: 99, yearly: 990 },
//       description: 'For organizations and teams',
//       features: [
//         'Unlimited summaries',
//         'Documents up to 100MB',
//         'Custom AI model training',
//         'Bulk document processing',
//         'Team collaboration',
//         'SSO integration',
//         'Unlimited API access',
//         'Custom integrations',
//         '24/7 dedicated support',
//         'SLA guarantee',
//         'On-premise deployment'
//       ],
//       limitations: [],
//       icon: Building,
//       color: 'purple',
//       buttonText: 'Contact Sales',
//       popular: false
//     }
//   ];

//   const handleSubscribe = (planName) => {
//     if (planName === 'Enterprise') {
//       window.location.href = 'mailto:sales@summarizer.com';
//     } else if (planName !== 'Free') {
//       window.location.href = `/checkout?plan=${planName.toLowerCase()}&cycle=${billingCycle}`;
//     }
//   };

//   const annualSavings = (monthlyPrice, yearlyPrice) => {
//     if (monthlyPrice === 0) return 0;
//     return (monthlyPrice * 12) - yearlyPrice;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
//       <div className="container mx-auto px-4 py-16">
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
//             <Sparkles className="h-8 w-8 text-white" />
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
//             Simple, Transparent Pricing
//           </h1>
//           <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
//             Choose the plan that fits your needs. All plans include Amharic and bilingual document support.
//           </p>
          
//           <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mt-8">
//             <button
//               onClick={() => setBillingCycle('monthly')}
//               className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                 billingCycle === 'monthly'
//                   ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
//                   : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
//               }`}
//             >
//               Monthly
//             </button>
//             <button
//               onClick={() => setBillingCycle('yearly')}
//               className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                 billingCycle === 'yearly'
//                   ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
//                   : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
//               }`}
//             >
//               Yearly <span className="text-green-600 dark:text-green-400 text-xs ml-1">Save 20%</span>
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           {plans.map((plan) => {
//             const Icon = plan.icon;
//             const isCurrentPlan = user?.subscription_tier === plan.name.toLowerCase();
//             const price = plan.price[billingCycle];
//             const yearlyPrice = plan.price.yearly;
//             const monthlyEquivalent = yearlyPrice / 12;
//             const savings = annualSavings(plan.price.monthly, plan.price.yearly);
//             const colorClasses = {
//               gray: 'from-gray-500 to-gray-600',
//               primary: 'from-primary-500 to-primary-600',
//               purple: 'from-purple-500 to-purple-600'
//             };
            
//             return (
//               <div
//                 key={plan.name}
//                 className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border transition-all duration-300 hover:scale-105 ${
//                   plan.popular 
//                     ? 'border-primary-500 dark:border-primary-500 ring-2 ring-primary-500/20 scale-105' 
//                     : 'border-gray-200 dark:border-gray-700'
//                 }`}
//               >
//                 {plan.popular && (
//                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
//                     Most Popular
//                   </div>
//                 )}
                
//                 <div className="p-6">
//                   <div className={`w-14 h-14 bg-gradient-to-r ${colorClasses[plan.color]} rounded-xl flex items-center justify-center mb-4`}>
//                     <Icon className="h-7 w-7 text-white" />
//                   </div>
                  
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
//                   <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{plan.description}</p>
                  
//                   <div className="mb-4">
//                     <span className="text-4xl font-bold text-gray-900 dark:text-white">
//                       ${price}
//                     </span>
//                     <span className="text-gray-500 dark:text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
//                   </div>
                  
//                   {billingCycle === 'yearly' && plan.name !== 'Free' && (
//                     <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
//                       <p className="text-sm text-green-700 dark:text-green-300">
//                         Save ${savings}/year • ${monthlyEquivalent}/mo equivalent
//                       </p>
//                     </div>
//                   )}
                  
//                   <button
//                     onClick={() => handleSubscribe(plan.name)}
//                     disabled={isCurrentPlan}
//                     className={`
//                       w-full py-3 rounded-xl font-semibold transition-all duration-200 mb-6
//                       ${isCurrentPlan
//                         ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
//                         : plan.name === 'Pro'
//                           ? `bg-gradient-to-r ${colorClasses.primary} text-white hover:shadow-lg transform hover:-translate-y-0.5`
//                           : plan.name === 'Enterprise'
//                             ? `bg-gradient-to-r ${colorClasses.purple} text-white hover:shadow-lg transform hover:-translate-y-0.5`
//                             : 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
//                       }
//                     `}
//                   >
//                     {isCurrentPlan ? 'Current Plan' : plan.buttonText}
//                   </button>
                  
//                   <div className="space-y-3">
//                     <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Features:</p>
//                     {plan.features.map((feature, idx) => (
//                       <div key={idx} className="flex items-start space-x-2">
//                         <Check className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
//                         <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
//                       </div>
//                     ))}
//                     {plan.limitations.map((limitation, idx) => (
//                       <div key={idx} className="flex items-start space-x-2 opacity-60">
//                         <span className="text-gray-400 text-sm">•</span>
//                         <span className="text-sm text-gray-500 dark:text-gray-500">{limitation}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="max-w-4xl mx-auto mt-20">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
//             Everything you need to succeed
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors">
//               <Shield className="h-6 w-6 text-primary-500 flex-shrink-0" />
//               <div>
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Enterprise-grade security</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Your data is encrypted and protected with bank-level security</p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors">
//               <Users className="h-6 w-6 text-primary-500 flex-shrink-0" />
//               <div>
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Team collaboration</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Share summaries and work together with your team</p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors">
//               <FileText className="h-6 w-6 text-primary-500 flex-shrink-0" />
//               <div>
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Unlimited documents</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Process as many documents as you need with Pro plan</p>
//               </div>
//             </div>
//             <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors">
//               <Clock className="h-6 w-6 text-primary-500 flex-shrink-0" />
//               <div>
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Priority processing</h3>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Get your summaries faster with priority queue</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="max-w-3xl mx-auto mt-16 text-center">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//             Frequently Asked Questions
//           </h2>
//           <div className="grid grid-cols-1 gap-4">
//             <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
//               <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I cancel my subscription?</h3>
//               <p className="text-gray-600 dark:text-gray-400 text-sm">Yes, you can cancel anytime. No long-term contracts or hidden fees.</p>
//             </div>
//             <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
//               <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Do you offer student discounts?</h3>
//               <p className="text-gray-600 dark:text-gray-400 text-sm">Yes, students get 50% off on Pro plan with valid .edu email verification.</p>
//             </div>
//             <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
//               <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is Amharic summarization included?</h3>
//               <p className="text-gray-600 dark:text-gray-400 text-sm">Yes, all plans support Amharic and bilingual document summarization.</p>
//             </div>
//             <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
//               <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I upgrade or downgrade?</h3>
//               <p className="text-gray-600 dark:text-gray-400 text-sm">Yes, you can change your plan at any time. Prorated charges apply.</p>
//             </div>
//           </div>
//         </div>

//         <div className="mt-16 text-center">
//           <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full">
//             <CreditCard className="h-5 w-5 text-primary-500" />
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               🔒 Secure payment processing • 30-day money-back guarantee • No hidden fees
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PricingPage;