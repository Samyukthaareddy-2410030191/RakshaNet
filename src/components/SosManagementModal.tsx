import React, { useState } from 'react';
import {
  HeartPulse,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Languages,
  Clock,
  Sparkles,
  MapPin,
  Users,
} from 'lucide-react';
import { SosRequest, GeoPoint } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sosRequests: SosRequest[];
  onCreateSos: (sos: Omit<SosRequest, 'id' | 'trackingCode' | 'timestamp'>) => void;
  onUpdateStatus: (id: string, status: SosRequest['status']) => void;
  isEdgeMode: boolean;
}

export const SosManagementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sosRequests,
  onCreateSos,
  onUpdateStatus,
  isEdgeMode,
}) => {
  const [citizenName, setCitizenName] = useState('Anil Kumar Rao');
  const [mobile, setMobile] = useState('+91 98491 55670');
  const [address, setAddress] = useState('Nadeem Colony, Tolichowki, Hyderabad');
  const [emergencyType, setEmergencyType] = useState<SosRequest['emergencyType']>('FLOOD_TRAPPED');
  const [victimCount, setVictimCount] = useState(6);
  const [medicalUrgency, setMedicalUrgency] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('Telugu');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [nlpParsing, setNlpParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const voicePresets: Record<string, string> = {
    Telugu: 'మా కాలనీలో నీళ్లు 5 అడుగులు చేరాయి, మా ఇంట్లో 6 మంది మేడపై చిక్కుకున్నారు. నాన్నగారికి ఆక్సిజన్ అవసరం ఉంది!',
    Hindi: 'छत पर 8 लोग फंसे हैं, पानी लगातार बढ़ रहा है। तुरंत नाव और फर्स्ट-एड भेजें!',
    English: 'Ground floor submerged completely. 5 elderly residents trapped on terrace, water level rising rapidly.',
    Tamil: 'எங்கள் பகுதியில் வெள்ள நீர் சூழ்ந்துள்ளது. 7 பேர் கூரையில் தவித்து வருகின்றனர். உதவி தேவை!',
    Kannada: 'ನಮ್ಮ ಮನೆಯಲ್ಲಿ ನೀರು ತುಂಬಿದೆ. 4 ಜನರು ಅಪಾಯದಲ್ಲಿದ್ದಾರೆ. ದಯವಿಟ್ಟು ಬೋಟ್ ಕಳುಹಿಸಿ!',
  };

  const handleSelectPreset = (lang: string) => {
    setSelectedLanguage(lang);
    setVoiceTranscript(voicePresets[lang] || '');
  };

  const handleParseVoiceNlp = async () => {
    if (!voiceTranscript) return;
    setNlpParsing(true);
    try {
      const response = await fetch('/api/sos/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: voiceTranscript,
          language: selectedLanguage,
        }),
      });
      const data = await response.json();
      if (data.success && data.structuredSos) {
        setParsedResult(data.structuredSos);
        setVictimCount(data.structuredSos.victimCount || 6);
        setMedicalUrgency(data.structuredSos.medicalNeed || false);
      }
    } catch {
      // Offline / Local heuristic fallback
      setParsedResult({
        detectedLanguage: selectedLanguage,
        disasterType: 'Flood Inundation',
        urgency: 'P1_CRITICAL',
        victimCount: 6,
        trappedPeople: true,
        medicalNeed: true,
        locationHint: 'Nadeem Colony, Tolichowki',
        summaryEnglish: '6 citizens stranded on terrace with medical oxygen emergency.',
      });
    } finally {
      setNlpParsing(false);
    }
  };

  const handleSubmitSos = (e: React.FormEvent) => {
    e.preventDefault();
    const priority = medicalUrgency || victimCount >= 5 ? 'P1' : 'P2';
    onCreateSos({
      citizenName,
      mobile,
      location: { lat: 17.3985, lng: 78.4065 },
      address,
      emergencyType,
      victimCount,
      medicalUrgency,
      priority,
      status: 'NEW',
      trustScore: 92,
      voiceTranscript,
      detectedLanguage: selectedLanguage,
    });
    alert(`SOS Request Created Successfully!\nPriority: ${priority}\nTracking Code Generated.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  CITIZEN SOS DISPATCH & MULTILINGUAL VOICE ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500 text-red-400 font-mono text-[10px]">
                  NLP TRIAGE v2.4 (INDIC LLM)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Natural-language voice processing across Telugu, Hindi, Tamil, Kannada, Marathi & English.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-sm font-mono px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Voice SOS & NLP Parsing (6 cols) */}
          <div className="lg:col-span-6 space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <Languages className="w-4 h-4" /> MULTILINGUAL VOICE SOS RECORDER
              </span>
              <span className="text-[10px] text-slate-400">Auto-Dial 112 / 108</span>
            </div>

            {/* Language Selection Chips */}
            <div className="flex flex-wrap gap-1.5">
              {['Telugu', 'Hindi', 'English', 'Tamil', 'Kannada'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleSelectPreset(lang)}
                  className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition ${
                    selectedLanguage === lang
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Transcript Box */}
            <div className="space-y-1.5">
              <label className="text-slate-300 block">Citizen Spoken Voice Audio Transcript:</label>
              <textarea
                rows={3}
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                placeholder="Click a preset language chip above or speak/type citizen distress message..."
                className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-100 outline-none text-xs focus:border-amber-400"
              />
            </div>

            {/* Voice Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (!isRecording) {
                    setVoiceTranscript(voicePresets[selectedLanguage]);
                  }
                }}
                className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'RECORDING... (LISTENING)' : 'SIMULATE LIVE VOICE RECORD'}</span>
              </button>

              <button
                type="button"
                onClick={handleParseVoiceNlp}
                disabled={!voiceTranscript || nlpParsing}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{nlpParsing ? 'PARSING...' : 'PARSE WITH AI'}</span>
              </button>
            </div>

            {/* Structured NLP Output Card */}
            {parsedResult && (
              <div className="bg-slate-900/90 border border-amber-500/50 rounded-lg p-3 space-y-2 text-[11px]">
                <div className="text-amber-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> STRUCTURED INCIDENT EXTRACTED:
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Language: <span className="text-slate-100 font-bold">{parsedResult.detectedLanguage}</span></div>
                  <div>Urgency: <span className="text-red-400 font-bold">{parsedResult.urgency}</span></div>
                  <div>Victims: <span className="text-slate-100 font-bold">{parsedResult.victimCount}</span></div>
                  <div>Medical Need: <span className="text-red-400 font-bold">{parsedResult.medicalNeed ? 'CRITICAL' : 'NO'}</span></div>
                </div>
                <div className="text-slate-400 text-[10px]">
                  English Summary: "{parsedResult.summaryEnglish}"
                </div>
              </div>
            )}

            {/* Manual SOS Submission Form */}
            <form onSubmit={handleSubmitSos} className="space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px] block">Citizen Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] block">Mobile No</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 text-[10px] block">Address / Hyderabad Locality</label>
                  <span className="text-[9px] text-amber-400">Quick Select:</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {[
                    'Plot 44, Nadeem Colony, Tolichowki',
                    'Kamal Nagar, Chaderghat Causeway',
                    'Phoolbagh, Chandrayangutta',
                    'Surveyor Colony, Alwal',
                    'Bhandari Layout, Nizampet',
                    'Near Old Bridge, Moosarambagh',
                    'Brahmanwadi, Begumpet',
                  ].map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAddress(loc)}
                      className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[9px] text-slate-300 border border-slate-800 hover:border-amber-400 transition cursor-pointer"
                    >
                      {loc.split(',')[1]?.trim() || loc}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px] block">Victims</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={victimCount}
                    onChange={(e) => setVictimCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="med"
                    checked={medicalUrgency}
                    onChange={(e) => setMedicalUrgency(e.target.checked)}
                    className="accent-red-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="med" className="text-slate-300 text-[11px] cursor-pointer">
                    Medical Urgency (P1)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>GENERATE VERIFIED SOS TICKET</span>
              </button>
            </form>
          </div>

          {/* Right Column: Active SOS Tickets & Status Pipeline (6 cols) */}
          <div className="lg:col-span-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200 uppercase">
                ACTIVE SOS PIPELINE ({sosRequests.length} INCIDENTS)
              </span>
              <span className="text-[10px] text-slate-400">
                Workflow: NEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {sosRequests.map((sos) => (
                <div
                  key={sos.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-3 space-y-2 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sos.priority === 'P1' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {sos.priority}
                      </span>
                      <span className="font-bold text-slate-200">{sos.citizenName}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <select
                        value={sos.status}
                        onChange={(e) => onUpdateStatus(sos.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 text-amber-300 rounded px-2 py-0.5 text-[10px] font-bold outline-none cursor-pointer"
                      >
                        <option value="NEW">NEW</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <div>{sos.address}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px]">
                      <span>Victims: <strong className="text-slate-200">{sos.victimCount}</strong></span>
                      <span>Urgency: <strong className={sos.medicalUrgency ? 'text-red-400' : 'text-slate-300'}>{sos.medicalUrgency ? 'P1 CRITICAL' : 'Standard'}</strong></span>
                      <span>Trust: <strong className="text-emerald-400">{sos.trustScore}%</strong></span>
                    </div>
                  </div>

                  {sos.voiceTranscript && (
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-850 text-[10px] text-slate-300 italic">
                      "{sos.voiceTranscript}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
