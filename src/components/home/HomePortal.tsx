import React, { useState } from 'react';
import { useSurveillanceStore, DEMO_USERS } from '../../store/surveillanceStore';
import { UserRole, Language } from '../../types/surveillance';
import { I18nService } from '../../services/i18nService';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Globe, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  KeyRound, 
  Eye, 
  EyeOff,
  UserCheck,
  Activity,
  MapPin,
  Camera,
  Mic,
  Layers,
  Radio,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface HomePortalProps {
  onLoginSuccess?: (role: UserRole) => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({ onLoginSuccess }) => {
  const { state, login, setLanguage, setIsOffline } = useSurveillanceStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [identifier, setIdentifier] = useState(DEMO_USERS.farmer.email);
  const [password, setPassword] = useState(DEMO_USERS.farmer.pass);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const lang = state.language;
  const t = (k: any) => I18nService.get(lang, k);

  // Role metadata
  const roleCards: Array<{
    role: UserRole;
    name: string;
    title: string;
    icon: string;
    badge: string;
    clearance: string;
    description: string;
    features: string[];
  }> = [
    {
      role: 'farmer',
      name: 'Ramesh Patel',
      title: 'Farmer / Livestock Owner',
      icon: '👨‍🌾',
      badge: 'Rural Producer',
      clearance: 'Tier-1 Public Intake',
      description: 'Report sick animals with clinical symptoms, take lesion photos via live camera, record voice notes, and receive early outbreak advisories.',
      features: ['Clinical Symptom Reporting', 'Live Lesion Camera & AI Screener', 'Voice Notes (Telugu / Hindi / English)', 'SMS & Voice Ring Alerts']
    },
    {
      role: 'vet',
      name: 'Dr. A. Sharma',
      title: 'Chief Veterinary Officer',
      icon: '👨‍⚕️',
      badge: 'Command Triage',
      clearance: 'Tier-2 Clinical Authority',
      description: 'Review incoming syndromic reports, analyze AI-stratified risk scores, inspect GIS containment buffers, and dispatch emergency response missions.',
      features: ['Epidemiological Triage', 'GIS 5km/10km Ring Buffer Analysis', 'Rapid Response Mission Dispatch', 'Biosecurity Quarantine Orders']
    },
    {
      role: 'field_worker',
      name: 'Pooja Patil',
      title: 'Field Para-Vet Inspector',
      icon: '👷',
      badge: 'Rapid Response',
      clearance: 'Tier-2 Field Operations',
      description: 'Conduct on-site farm inspections, verify syndromic case checklists, collect biological swab/blood samples, and record ring vaccinations.',
      features: ['On-Site Farm Investigations', 'Syndromic Checklist Verification', 'Biological Sample Barcoding', 'Ring Vaccination Logging']
    },
    {
      role: 'lab_staff',
      name: 'Dr. P. Rao',
      title: 'Diagnostic Microbiologist',
      icon: '🧪',
      badge: 'RDDL Diagnostic Lab',
      clearance: 'Tier-3 Laboratory Authority',
      description: 'Process incoming epidemiological samples, perform RT-PCR and ELISA diagnostic testing, confirm viral strains, and certify molecular results.',
      features: ['Sample Accession & Tracking', 'RT-PCR / ELISA Assay Verification', 'Viral Strain Identification', 'National Diagnostic Certification']
    },
    {
      role: 'admin',
      name: 'Lead Evaluator',
      title: 'National System Auditor',
      icon: '🛡️',
      badge: 'National Oversight',
      clearance: 'Tier-4 Master Clearance',
      description: 'Oversee the complete 32-step national response lifecycle, audit district containment metrics, and monitor post-intervention decline curves.',
      features: ['32-Step Master Response Lifecycle', 'District Surveillance Analytics', 'Post-Intervention Decline Curves', 'Cross-State Biosecurity Audit']
    }
  ];

  // Handle changing role selection
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const demo = DEMO_USERS[role === 'flow_inspector' ? 'admin' : role];
    if (demo) {
      setIdentifier(demo.email);
      setPassword(demo.pass);
    }
    setError('');
  };

  // Submit login with credentials
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');

    try {
      const success = await login(identifier, password);
      if (success) {
        if (onLoginSuccess) {
          onLoginSuccess(selectedRole);
        }
      } else {
        setError(t('loginFailed') || 'Invalid credentials. Please verify your User ID / Email and Password.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials or server connection.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const currentRoleCard = roleCards.find(r => r.role === selectedRole) || roleCards[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Universal Government Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  {t('brandTitle') || 'JeevaRaksha'}
                </span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                  National Surveillance Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Department of Animal Husbandry & Dairying (DAHD) • Government of India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline Simulation Switch */}
            <button
              onClick={() => setIsOffline(!state.isOffline)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors flex items-center gap-1.5 ${
                state.isOffline
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Toggle Offline Simulation"
            >
              {state.isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-600" /> : <Wifi className="w-3.5 h-3.5 text-blue-600" />}
              <span>{state.isOffline ? t('offline') : t('online')}</span>
            </button>

            {/* Language Selector: English | తెలుగు | हिंदी */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  state.language === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  state.language === 'te' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  state.language === 'hi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Home Portal Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>National Integrated Animal Health Intelligence System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Livestock Disease Surveillance & Early Warning Command Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            A unified digital biosecurity platform integrating rural livestock owners, district veterinary officers, rapid field response units, and certified diagnostic laboratories for real-time disease detection and containment.
          </p>
        </div>

        {/* Live Surveillance Status Highlights (Clean White & Blue, No Red) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Outbreak Status</span>
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {state.clusters.filter(c => c.status !== 'CONTAINED').length} Active Zone
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">Under Active Ring Containment</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Surveillance Cases</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {state.cases.length} Registered Reports
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">District-Wide Continuous Triage</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Field Response Teams</span>
              <UserCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {state.missions.length} Missions Dispatched
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">Para-Vets on Active Field Duty</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Laboratory Diagnostics</span>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-extrabold text-slate-900">
              {state.samples.length} Samples in RDDL
            </div>
            <span className="text-[11px] text-blue-700 font-semibold">Molecular RT-PCR & ELISA Tracking</span>
          </div>
        </div>

        {/* PRIMARY INTERACTIVE SECTION: Role Selection & Credential Access */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                  Select Role & Verify Credentials
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Access Your Operational Dashboard
                </h2>
              </div>
              <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                Choose a role below to configure credentials and open the dashboard
              </span>
            </div>
          </div>

          {/* 5 Interactive Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {roleCards.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleSelectRole(r.role)}
                  className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{r.icon}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {r.badge}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-slate-900 block leading-tight">
                      {r.title}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      {r.name}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-blue-700 font-semibold block">
                      {r.clearance}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Credential Verification Form for the Selected Role */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentRoleCard.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">
                      {currentRoleCard.title} Authentication Gateway
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {currentRoleCard.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {currentRoleCard.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Security Clearance:</span>
                <span className="text-xs font-bold text-blue-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg inline-block">
                  {currentRoleCard.clearance}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    User Identifier / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter registered ID or email"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Access Password / PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Launch Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const demo = DEMO_USERS[selectedRole === 'flow_inspector' ? 'admin' : selectedRole];
                    if (demo) {
                      setIdentifier(demo.email);
                      setPassword(demo.pass);
                    }
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset to default verified credentials for this role</span>
                </button>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isAuthenticating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Open {currentRoleCard.title} Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Platform Capabilities Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">AI Lesion Screening</h4>
            <p className="text-xs text-slate-600">
              Live camera analysis of mouth blisters, hoof lesions, and skin nodules with instant stratification.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">District GIS Risk Mapping</h4>
            <p className="text-xs text-slate-600">
              Interactive 5km infected and 10km surveillance ring buffers with real-time cluster proximity alerts.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Multilingual Voice Reporting</h4>
            <p className="text-xs text-slate-600">
              Speech-to-text recording in Telugu, Hindi, and English with automated regional audio advisories.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <WifiOff className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Offline-First Outbox</h4>
            <p className="text-xs text-slate-600">
              Complete local cache outbox allowing rural reports without connectivity, syncing when online.
            </p>
          </div>
        </div>
      </main>

      {/* Universal Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>JeevaRaksha • Department of Animal Husbandry & Dairying (DAHD)</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Government of India • National Integrated Animal Health Intelligence System
          </span>
        </div>
      </footer>
    </div>
  );
};
