import React, { useState, useEffect } from 'react';
import {
  Users,
  Radio,
  Send,
  MessageSquare,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Mic,
  MicOff,
  LifeBuoy,
  PhoneCall,
  Volume2,
  Sparkles,
  QrCode,
  Clock,
  Navigation,
} from 'lucide-react';
import { AuthUser, IntercomMessage, SosRequest, GeoPoint } from '../types';

interface Props {
  currentUser: AuthUser;
  sosRequests: SosRequest[];
  onOpenMap: () => void;
  onSubmitIncidentReport: (report: any) => void;
}

const DEFAULT_CHANNELS = [
  { id: '#volunteers-and-helpers', name: 'Volunteers & Field Helpers', count: 18 },
  { id: '#sector-4-rescue', name: 'Sector 4: Tolichowki Basin', count: 9 },
  { id: '#hospital-triage', name: 'Hospital Triage & EMT', count: 6 },
  { id: '#general-sos-alerts', name: 'Live Emergency Feed', count: 42 },
];

export const VolunteerWorkspaceView: React.FC<Props> = ({
  currentUser,
  sosRequests,
  onOpenMap,
  onSubmitIncidentReport,
}) => {
  const [activeChannel, setActiveChannel] = useState('#volunteers-and-helpers');
  const [messages, setMessages] = useState<IntercomMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isRecordingRadio, setIsRecordingRadio] = useState(false);
  const [radioTimer, setRadioTimer] = useState(0);

  // Field incident form
  const [fieldAddress, setFieldAddress] = useState('Nadeem Colony, Lane 3, Tolichowki');
  const [waterDepth, setWaterDepth] = useState('42 inches (Waist-deep)');
  const [victimsFound, setVictimsFound] = useState('4');
  const [fieldNotes, setFieldNotes] = useState('Elderly cardiac patient stabilized with oxygen cylinder. Staging for boat pickup.');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Load live messages from backend or initial preset
  useEffect(() => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => {
        // Fallback default messages
        setMessages([
          {
            id: 'm-1',
            channel: '#volunteers-and-helpers',
            senderId: 'usr-vol-01',
            senderName: 'Kiran Kumar (NDRF Wing)',
            senderRole: 'VOLUNTEER',
            senderBadge: 'NDRF-VOL-HYD-409',
            text: 'Sector 4 Nadeem Colony: 4 rubber rafts deployed. Reached rooftop at Plot 44. Rescued family of 6.',
            timestamp: '10:42 AM',
            isUrgent: false,
          },
          {
            id: 'm-2',
            channel: '#volunteers-and-helpers',
            senderId: 'usr-coord-01',
            senderName: 'Insp. Anita Rao (Central Dispatch)',
            senderRole: 'COORDINATOR',
            senderBadge: 'HYD-DISP-08',
            text: 'Copy that Kiran. 108-ALS-Delta 01 is staging on PVNR exit 4 to receive elderly casualty. Do not route through Chaderghat causeway.',
            timestamp: '10:44 AM',
            isUrgent: true,
          },
          {
            id: 'm-3',
            channel: '#volunteers-and-helpers',
            senderId: 'vol-02',
            senderName: 'Priya Sharma (St. John Ambulance)',
            senderRole: 'VOLUNTEER',
            senderBadge: 'SJA-EMT-882',
            text: 'Masab Tank Relief Hub setup completed. 1,200 drinking water packets and 50 ORS boxes ready for field distribution.',
            timestamp: '10:48 AM',
            isUrgent: false,
          },
        ]);
      });
  }, []);

  // Voice Push-to-Talk simulation timer
  useEffect(() => {
    let interval: any;
    if (isRecordingRadio) {
      interval = setInterval(() => setRadioTimer((t) => t + 1), 1000);
    } else {
      setRadioTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingRadio]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const payload = {
      channel: activeChannel,
      senderId: currentUser.id,
      senderName: `${currentUser.name} (${currentUser.role})`,
      senderRole: currentUser.role,
      senderBadge: currentUser.badgeId,
      text,
      isUrgent: text.toLowerCase().includes('urgent') || text.toLowerCase().includes('need ambulance') || text.toLowerCase().includes('boat'),
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [data.message, ...prev]);
      }
    } catch {
      // Local fallback
      const localMsg: IntercomMessage = {
        id: `msg-${Date.now()}`,
        channel: activeChannel,
        senderId: currentUser.id,
        senderName: `${currentUser.name} (${currentUser.role})`,
        senderRole: currentUser.role,
        senderBadge: currentUser.badgeId,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUrgent: payload.isUrgent,
      };
      setMessages((prev) => [localMsg, ...prev]);
    }

    setInputMsg('');
  };

  const handlePushToTalk = () => {
    if (!isRecordingRadio) {
      setIsRecordingRadio(true);
    } else {
      setIsRecordingRadio(false);
      handleSendMessage('🎙️ [Radio PTT Voice Broadcast]: "Sector 4 team reporting clear passage along high-ridge. Requesting 2 additional volunteer life vests."');
    }
  };

  const filteredMessages = messages.filter((m) => m.channel === activeChannel || m.channel === '#volunteers-and-helpers');

  return (
    <div className="space-y-4">
      {/* Top Banner: Volunteer Credentials & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                {currentUser.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-500 text-amber-300">
                VERIFIED FIELD RESPONDER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                TRUST SCORE: 98%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Badge: <span className="text-slate-200 font-mono font-semibold">{currentUser.badgeId}</span> • Division:{' '}
              <span className="text-slate-200 font-semibold">{currentUser.department}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs transition cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Tactical GIS Map</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Comms Hub (Volunteer <-> Helper Communication) & Right Tasks/Reporting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 360-Degree Volunteer & Helper Intercom */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[600px] overflow-hidden shadow-2xl">
          {/* Intercom Header */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-xs">
                  FIELD MESH INTERCOM & RADIO HUB
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Live encrypted 2-way coordination between Volunteers, Boat Helpers & Central Dispatch
                </p>
              </div>
            </div>

            {/* Push to talk voice broadcast trigger */}
            <button
              type="button"
              onClick={handlePushToTalk}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer shadow-lg ${
                isRecordingRadio
                  ? 'bg-red-600 text-white animate-pulse shadow-red-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40'
              }`}
            >
              {isRecordingRadio ? (
                <>
                  <Mic className="w-3.5 h-3.5 fill-current" />
                  <span>TRANSMITTING RADIO ({radioTimer}s)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>PUSH-TO-TALK RADIO</span>
                </>
              )}
            </button>
          </div>

          {/* Channel selector sub-bar */}
          <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none font-mono text-[11px]">
            {DEFAULT_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannel(ch.id)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  activeChannel === ch.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{ch.id}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                  {ch.count}
                </span>
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
            {filteredMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-slate-200">{msg.senderName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-amber-400">
                      {msg.senderBadge}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-amber-600/20 border border-amber-500/60 text-amber-100 rounded-tr-none'
                        : msg.isUrgent
                        ? 'bg-red-950/70 border border-red-500/70 text-red-200 rounded-tl-none animate-pulse'
                        : 'bg-slate-800/90 border border-slate-700 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Field Ping Presets */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none font-mono text-[10px]">
            <span className="text-slate-500 font-bold uppercase shrink-0">TACTICAL PINGS:</span>
            {[
              'Need Inflatable Boat at Plot 44',
              'Distributed 100 Clean Water Packets',
              'Submerged Road - Light vehicles stalled',
              'Paramedic on site, victim stabilized',
              'Shelter capacity at 80% - reroute families',
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(preset)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 whitespace-nowrap transition cursor-pointer hover:border-amber-400"
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message ${activeChannel}... (e.g. "Arrived at Nadeem Colony with 20 life jackets")`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Right Column: Assigned Sector Tasks & Direct Field Incident Report */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Sector Assignment */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <h4 className="font-bold text-slate-100 text-xs">
                  ASSIGNED SECTOR: TOLICHOWKI (SECTOR 4)
                </h4>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 border border-red-500 text-red-400 font-bold">
                P1 CRITICAL
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">Task 1: Rooftop Inundation Evacuation</div>
                  <div className="text-[11px] text-slate-400">
                    Coordinate with NDRF Boat Unit 4 to evacuate 6 stranded victims from Plot 44.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">Task 2: Drinking Water Distribution</div>
                  <div className="text-[11px] text-slate-400">
                    Distribute 250 water sachets at Masab Tank relief staging post.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded bg-slate-950 border border-slate-800">
                <LifeBuoy className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-200">Task 3: Causeway Warning Beacon</div>
                  <div className="text-[11px] text-slate-400">
                    Prevent civilian two-wheelers from entering submerged Chaderghat causeway.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Direct Field Recon Report */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-slate-100 text-xs">
                SUBMIT FIELD INCIDENT TELEMETRY
              </h4>
            </div>

            {reportSubmitted ? (
              <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-500 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-bold text-emerald-200 text-xs">
                  Field Report Ingested into OR-Tools Optimizer!
                </div>
                <div className="text-[11px] text-slate-300">
                  TrustScore calculated: 98% (Verified NDRF Volunteer Credential).
                </div>
                <button
                  type="button"
                  onClick={() => setReportSubmitted(false)}
                  className="mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-mono transition cursor-pointer"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmitIncidentReport({
                    fieldAddress,
                    waterDepth,
                    victimsFound: parseInt(victimsFound, 10) || 1,
                    fieldNotes,
                  });
                  setReportSubmitted(true);
                }}
                className="space-y-2.5 text-xs font-mono"
              >
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Incident Landmark / Location</label>
                  <input
                    type="text"
                    value={fieldAddress}
                    onChange={(e) => setFieldAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Water Depth</label>
                    <input
                      type="text"
                      value={waterDepth}
                      onChange={(e) => setWaterDepth(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Victims Stranded</label>
                    <input
                      type="number"
                      value={victimsFound}
                      onChange={(e) => setVictimsFound(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Ground Observations & Triage</label>
                  <textarea
                    rows={2}
                    value={fieldNotes}
                    onChange={(e) => setFieldNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Broadcast Verified Report to Command Center
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
