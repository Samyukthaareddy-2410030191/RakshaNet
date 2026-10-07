import React, { useState } from 'react';
import {
  HeartPulse,
  Mic,
  MicOff,
  Navigation,
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  Radio,
  Send,
  Droplets,
  LifeBuoy,
} from 'lucide-react';
import { SosRequest, Shelter, AuthUser } from '../types';

interface Props {
  currentUser: AuthUser;
  sosRequests: SosRequest[];
  shelters: Shelter[];
  onCreateSos: (sos: any) => void;
  onOpenMap: () => void;
}

export const CitizenPortalView: React.FC<Props> = ({
  currentUser,
  sosRequests,
  shelters,
  onCreateSos,
  onOpenMap,
}) => {
  const [address, setAddress] = useState('Plot 44, Nadeem Colony, Tolichowki, Hyderabad');
  const [victimCount, setVictimCount] = useState(4);
  const [medicalUrgency, setMedicalUrgency] = useState(true);
  const [language, setLanguage] = useState<'Telugu' | 'Hindi' | 'English'>('Telugu');
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>('SOS-HYD-4892');

  const mySosTickets = sosRequests.filter((s) => s.mobile.includes(currentUser.phone || '91234') || s.priority === 'P1');

  const handleSimulateVoice = () => {
    setVoiceRecording(true);
    setTimeout(() => {
      setVoiceRecording(false);
      if (language === 'Telugu') {
        setVoiceText('మా ఇల్లు నీటిలో మునిగిపోయింది. టెర్రస్ పై 4 మంది ఉన్నాము. తాతయ్య గారికి ఆక్సిజన్ కావాలి, వెంటనే రండి!');
      } else if (language === 'Hindi') {
        setVoiceText('हम टोलीचौकी नदीम कॉलोनी में छत पर फंसे हैं। पानी 5 फीट चढ़ गया है। कृपया बोट भेजिए!');
      } else {
        setVoiceText('Flood water has entered first floor in Tolichowki. 4 people stranded on roof, need urgent boat rescue!');
      }
    }, 2000);
  };

  const handleTriggerSos = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = `SOS-HYD-${Math.floor(1000 + Math.random() * 9000)}`;
    onCreateSos({
      citizenName: currentUser.name,
      mobile: currentUser.phone || '+91 91234 56789',
      location: { lat: 17.3985, lng: 78.4062 },
      address,
      emergencyType: 'FLOOD_TRAPPED',
      victimCount,
      medicalUrgency,
      priority: 'P1',
      status: 'VERIFIED',
      trustScore: 95,
      voiceTranscript: voiceText || 'Citizen pressed 1-Tap Emergency SOS beacon.',
    });
    setSubmittedCode(newCode);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Civilian Emergency Lifeline */}
      <div className="bg-red-950/70 border border-red-500/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30">
            <HeartPulse className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                CITIZEN DISASTER LIFELINE • TELANGANA
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-red-900">
                24x7 ACTIVE
              </span>
            </div>
            <p className="text-xs text-red-200 mt-0.5">
              Citizen Profile: <span className="font-semibold text-white">{currentUser.name}</span> • Tolichowki Basin Emergency Zone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-red-900 font-bold text-xs shadow-md transition hover:bg-slate-100"
          >
            <PhoneCall className="w-4 h-4" />
            <span>DIAL 112 (NATIONAL)</span>
          </a>
          <a
            href="tel:108"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white font-bold text-xs shadow-md transition hover:bg-red-500"
          >
            <PhoneCall className="w-4 h-4" />
            <span>DIAL 108 (AMBULANCE)</span>
          </a>
        </div>
      </div>

      {/* Main Grid: SOS Form & Live Rescue Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 1-Tap SOS Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>REQUEST IMMEDIATE RESCUE ASSISTANCE</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              GPS PINPOINTED
            </span>
          </div>

          <form onSubmit={handleTriggerSos} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                Your Exact Location / Landmark
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs pl-8 outline-none focus:border-red-400"
                />
                <MapPin className="w-4 h-4 text-red-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Number of Victims Stranded
                </label>
                <input
                  type="number"
                  min={1}
                  value={victimCount}
                  onChange={(e) => setVictimCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs outline-none focus:border-red-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Medical / Oxygen Need?
                </label>
                <button
                  type="button"
                  onClick={() => setMedicalUrgency(!medicalUrgency)}
                  className={`w-full py-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    medicalUrgency
                      ? 'bg-red-950 border-red-500 text-red-300'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  {medicalUrgency ? 'YES (CRITICAL AMBULANCE)' : 'NO (STANDARD RESCUE)'}
                </button>
              </div>
            </div>

            {/* Multilingual Voice SOS Section */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>Voice Distress Note (Telugu/Hindi/English)</span>
                </span>
                <div className="flex items-center gap-1">
                  {(['Telugu', 'Hindi', 'English'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLanguage(l)}
                      className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                        language === l
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateVoice}
                  disabled={voiceRecording}
                  className={`flex-1 py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    voiceRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                  }`}
                >
                  {voiceRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>LISTENING & TRANSCRIBING...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>RECORD VOICE SOS ({language})</span>
                    </>
                  )}
                </button>
              </div>

              {voiceText && (
                <div className="p-2 rounded bg-slate-900 border border-amber-500/40 text-amber-200 text-xs italic">
                  "{voiceText}"
                </div>
              )}
            </div>

            {/* Big 1-Tap SOS Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl transition cursor-pointer shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transform active:scale-98"
            >
              <HeartPulse className="w-5 h-5 animate-bounce" />
              <span>TRANSMIT 1-TAP SOS TO NDRF & 108 DISPATCH</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live SOS Status Tracker & Safe Shelters */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Ticket Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h4 className="font-bold text-slate-100 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>YOUR ACTIVE SOS DISPATCH TICKET</span>
              </h4>
              <span className="font-mono text-xs text-amber-400 font-bold">
                {submittedCode || 'SOS-HYD-4892'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/50">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>STATUS: RESCUE EN ROUTE</span>
                  </span>
                  <span className="text-slate-400">ETA: 14 mins</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <div>
                    <span className="text-slate-500">Assigned Unit:</span>{' '}
                    <span className="font-bold text-slate-100">108-ALS-Delta 01 + NDRF Boat Team 4</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Destination Facility:</span>{' '}
                    <span className="font-bold text-emerald-300">Gandhi Hospital Secunderabad (PVNR Bypass)</span>
                  </div>
                  <div className="text-[11px] text-amber-300 mt-2 p-1.5 rounded bg-amber-950/40 border border-amber-500/40">
                    Rescue advice: Remain on highest ground of rooftop. Tie brightly colored cloth to railing for drone recon visual.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenMap}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-mono transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Track Rescue Vehicle on Live GIS Map</span>
              </button>
            </div>
          </div>

          {/* High Ground Relief Shelters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h4 className="font-bold text-slate-100 text-xs border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <span>NEAREST HIGH-GROUND RELIEF SHELTERS</span>
              <span className="text-[10px] text-slate-500 font-mono">VERIFIED FLOOD-FREE</span>
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {shelters.slice(0, 3).map((shelter) => (
                <div
                  key={shelter.id}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-200">{shelter.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Capacity: {shelter.maxCapacity - shelter.currentOccupancy} beds free • Food:{' '}
                      {shelter.foodStockDays} days
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold">
                      SAFE GROUND
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
