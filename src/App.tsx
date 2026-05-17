import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Star, Share2, Play, Plus, ChevronLeft, Zap, Info, MessageSquare, Video, VideoOff, Eye, Archive, CalendarDays, Check, X, Monitor, Link } from 'lucide-react';
import Peer from 'simple-peer';
import { getMatchCommentary, getMatchPrediction } from './services/geminiService';

// --- Types ---
type Sport = 'Cricket' | 'Volleyball' | 'Kabaddi';
type Language = 'en' | 'kn' | 'hi';

const translations = {
  en: {
    home: "Home",
    liveMatches: "Live Matches",
    upcoming: "Scheduled",
    finished: "Finished",
    players: "Player Rankings",
    teams: "Team Profiles",
    archive: "Match Records",
    loginAs: "Login as",
    admin: "Admin",
    viewer: "Viewer",
    back: "Back",
    registerTeam: "Add New Team Profile",
    playerProfile: "Player Profile",
    village: "Village",
    matches: "Matches",
    runs: "Runs",
    wickets: "Wickets",
    mom: "MOM",
    performance: "Performance",
    stats: "Stats",
    won: "Won",
    lost: "Lost",
    finalsOnly: "Finals Only",
    filterFinals: "Filter Finals",
    all: "All",
    matchDetails: "Match Details",
    predictions: "Match Prediction",
    commentary: "Live Commentary",
    liveStream: "Live Stream",
    startStream: "Start Stream",
    stopStream: "Stop Stream",
    tournamentHistory: "Tournament History",
    launchScoreboard: "Launch Scoreboard",
    score: "Score",
    venue: "Venue",
    date: "Date",
    time: "Time",
    matchTitle: "Match Title / Name",
    confirmLogo: "Confirm New Logo",
    looksGood: "Looks Good",
    cancel: "Cancel",
    register: "Register Team",
    selectSport: "Select Sport",
    teamProfile: "Team Profile",
  },
  kn: {
    home: "ಮುಖಪುಟ",
    liveMatches: "ನೇರ ಪಂದ್ಯಗಳು",
    upcoming: "ನಿಗದಿತ",
    finished: "ಮುಗಿದ ಪಂದ್ಯಗಳು",
    players: "ಆಟಗಾರರ ಶ್ರೇಯಾಂಕ",
    teams: "ತಂಡದ ವಿವರಗಳು",
    archive: "ಪಂದ್ಯದ ದಾಖಲೆಗಳು",
    loginAs: "ಇದರಂತೆ ಲಾಗಿನ್ ಮಾಡಿ",
    admin: "ನಿರ್ವಾಹಕ",
    viewer: "ಪ್ರೇಕ್ಷಕ",
    back: "ಹಿಂದಕ್ಕೆ",
    registerTeam: "ಹೊಸ ತಂಡವನ್ನು ಸೇರಿಸಿ",
    playerProfile: "ಆಟಗಾರನ ಪ್ರೊಫೈಲ್",
    village: "ಗ್ರಾಮ",
    matches: "ಪಂದ್ಯಗಳು",
    runs: "ರನ್",
    wickets: "ವಿಕೆಟ್",
    mom: "ಪಂದ್ಯ ಪುರುಷೋತ್ತಮ",
    performance: "ಕಾರ್ಯಕ್ಷಮತೆ",
    stats: "ಅಂಕಿಅಂಶಗಳು",
    won: "ಜಯ",
    lost: "ಸೋಲು",
    finalsOnly: "ಫೈನಲ್ಸ್ ಮಾತ್ರ",
    filterFinals: "ಫೈನಲ್ಸ್ ಫಿಲ್ಟರ್",
    all: "ಎಲ್ಲಾ",
    matchDetails: "ಪಂದ್ಯದ ವಿವರಗಳು",
    predictions: "ಪಂದ್ಯದ ಭವಿಷ್ಯ",
    commentary: "ನೇರ ವೀಕ್ಷಕ ವಿವರಣೆ",
    liveStream: "ಲೈವ್ ಸ್ಟ್ರೀಮ್",
    startStream: "ಸ್ಟ್ರೀಮ್ ಪ್ರಾರಂಭಿಸಿ",
    stopStream: "ಸ್ಟ್ರೀಮ್ ನಿಲ್ಲಿಸಿ",
    tournamentHistory: "ಟೂರ್ನಮೆಂಟ್ ಇತಿಹಾಸ",
    launchScoreboard: "ಸ್ಕೋರ್‌ಬೋರ್ಡ್ ಪ್ರಾರಂಭಿಸಿ",
    score: "ಸ್ಕೋರ್",
    venue: "ಸ್ಥಳ",
    date: "ದಿನಾಂಕ",
    time: "ಸಮಯ",
    matchTitle: "ಪಂದ್ಯದ ಶೀರ್ಷಿಕೆ / ಹೆಸರು",
    confirmLogo: "ಹೊಸ ಲೋಗೋ ಖಚಿತಪಡಿಸಿ",
    looksGood: "ಚೆನ್ನಾಗಿದೆ",
    cancel: "ರದ್ದುಮಾಡಿ",
    register: "ತಂಡವನ್ನು ನೋಂದಾಯಿಸಿ",
    selectSport: "ಕ್ರೀಡೆಯನ್ನು ಆರಿಸಿ",
    teamProfile: "ತಂಡದ ಪ್ರೊಫೈಲ್",
  },
  hi: {
    home: "होम",
    liveMatches: "लाइव मैच",
    upcoming: "निर्धारित",
    finished: "समाप्त मैच",
    players: "खिलाड़ियों की रैंकिंग",
    teams: "टीम प्रोफाइल",
    archive: "मैच रिकॉर्ड",
    loginAs: "इस रूप में लॉगिन करें",
    admin: "एडमिन",
    viewer: "दर्शक",
    back: "पीछे",
    registerTeam: "नयी टीम जोड़ें",
    playerProfile: "खिलाड़ी की प्रोफाइल",
    village: "गांव",
    matches: "मैच",
    runs: "रन",
    wickets: "विकेट",
    mom: "मैन ऑफ द मैच",
    performance: "प्रदर्शन",
    stats: "आंकड़े",
    won: "जीत",
    lost: "हार",
    finalsOnly: "केवल फाइनल",
    filterFinals: "फाइनल फिल्टर",
    all: "सभी",
    matchDetails: "मैच विवरण",
    predictions: "मैच की भविष्यवाणी",
    commentary: "लाइव कमेंट्री",
    liveStream: "लाइव स्ट्रीम",
    startStream: "स्ट्रीम शुरू करें",
    stopStream: "स्ट्रीम बंद करें",
    tournamentHistory: "टूर्नामेंट इतिहास",
    launchScoreboard: "स्कोरबोर्ड शुरू करें",
    score: "स्कोर",
    venue: "स्थान",
    date: "तारीख",
    time: "समय",
    matchTitle: "मैच का शीर्षक / नाम",
    confirmLogo: "नए लोगो की पुष्टि करें",
    looksGood: "ठीक है",
    cancel: "रद्द करें",
    register: "टीम पंजीकृत करें",
    selectSport: "खेल चुनें",
    teamProfile: "टीम प्रोफाइल",
  }
};

interface Match {
  id: string;
  sport: Sport;
  teamA: { name: string; score: number; wickets?: number; logo?: string; stats?: any };
  teamB: { name: string; score: number; wickets?: number; logo?: string; stats?: any };
  status: 'live' | 'finished' | 'scheduled';
  title?: string;
  date: string;
  time: string;
  createdAt: number;
  lastEvent?: {
    team: 'A' | 'B';
    points: number;
    player?: string;
    type?: string;
  };
  isStreaming?: boolean;
  streamHostId?: string;
  playerScores?: Record<string, { runs: number, wickets: number }>;
  venue?: string;
  poll?: { teamA: number; teamB: number; total: number };
}

interface Player {
  id: string;
  name: string;
  village: string;
  stats: {
    matches: number;
    runs: number;
    wickets: number;
    mom: number;
  };
  history?: {
    opponent: string;
    score: number;
    secondary: number;
    date: string;
    result: 'W' | 'L' | 'D';
  }[];
}

interface Team {
  id: string;
  name: string;
  logo?: string;
  village: string;
  performance: string; // e.g. "W-W-L"
  stats: {
    matches: number;
    won: number;
    lost: number;
  };
  players: string[];
}

// --- Socket Provider Hook (Simple) ---
let socket: Socket;

export default function App() {
  const [view, setView] = useState<'home' | 'match' | 'admin' | 'android' | 'player' | 'team' | 'login' | 'archive'>('login');
  const [userRole, setUserRole] = useState<'viewer' | 'admin' | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  useEffect(() => {
    socket = io();
    
    socket.on('connect', () => {
      socket.emit('get-matches');
      socket.emit('get-players');
      socket.emit('get-teams');
    });

    socket.on('match-list', (data) => {
      setMatches(data);
      // Handle deep linking after matches are loaded
      const params = new URLSearchParams(window.location.search);
      const matchId = params.get('matchId');
      if (matchId && view === 'login') { // Only auto-redirect if not already logged in/viewing something
        const match = data.find((m: Match) => m.id === matchId);
        if (match) {
          setSelectedMatch(match);
          setUserRole('viewer');
          setView('match');
        }
      }
    });
    socket.on('player-list', (data) => setPlayers(data));
    socket.on('team-list', (data) => setTeams(data));
    socket.on('new-match', (match) => setMatches(prev => [...prev, match]));
    socket.on('match-update', (updated) => {
      setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
      if (selectedMatch?.id === updated.id) {
        setSelectedMatch(updated);
      }
    });

    return () => { socket.disconnect(); };
  }, [selectedMatch]);

  useEffect(() => {
    if (selectedMatch) {
      socket.emit('join-match', selectedMatch.id);
    }
  }, [selectedMatch?.id]);

  const handleLogin = (role: 'viewer' | 'admin') => {
    setUserRole(role);
    setView('home');
  };

  const handleLogout = () => {
    setUserRole(null);
    setView('login');
  };

  const updateTeamLogo = (teamId: string, logo: string) => {
    socket.emit('update-team', { id: teamId, logo });
  };

  const registerTeam = (teamData: Partial<Team>) => {
    socket.emit('register-team', teamData);
  };

  const updateMatchStatus = (matchId: string, status: 'live' | 'finished' | 'scheduled') => {
    socket.emit('update-match-status', { matchId, status });
  };

  const createMatch = (sport: Sport, teamAData: { name: string; logo?: string }, teamBData: { name: string; logo?: string }, date: string, time: string, title?: string) => {
    const newMatch = {
      id: Math.random().toString(36).substr(2, 9),
      sport,
      title,
      teamA: { ...teamAData, score: 0 },
      teamB: { ...teamBData, score: 0 },
      status: 'live',
      date: date || new Date().toLocaleDateString(),
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now()
    };
    socket.emit('create-match', newMatch);
    setSelectedMatch(newMatch as Match);
    setView('admin');
  };

  const setScore = (matchId: string, team: 'A' | 'B', absoluteScore: number) => {
    if (!selectedMatch) return;
    const teamKey = team === 'A' ? 'teamA' : 'teamB';
    
    socket.emit('update-score', {
      matchId,
      scoreData: {
        [teamKey]: { ...selectedMatch[teamKey], score: absoluteScore },
        lastEvent: { team, points: absoluteScore - selectedMatch[teamKey].score, player: 'Admin', type: 'correction' }
      }
    });
  };

  const setPlayerStats = (matchId: string, playerName: string, runs: number, wickets: number) => {
    if (!selectedMatch) return;
    const updatedPlayerScores = { 
      ...(selectedMatch.playerScores || {}), 
      [playerName]: { runs, wickets } 
    };
    
    socket.emit('update-score', {
      matchId,
      scoreData: {
        playerScores: updatedPlayerScores,
        lastEvent: { team: 'A', points: 0, player: playerName, type: 'stats-update' } // Generic team for stats update
      }
    });
  };

  const updateScore = (matchId: string, team: 'A' | 'B', points: number, player?: string, type?: string) => {
    if (!selectedMatch) return;
    const teamKey = team === 'A' ? 'teamA' : 'teamB';
    const currentScore = selectedMatch[teamKey].score;
    const updatedScore = Math.max(0, currentScore + points);
    
    // Optional: Auto-update individual player stats if a player is selected
    const updatedPlayerScores = { ...(selectedMatch.playerScores || {}) };
    const updatedTeam = { ...selectedMatch[teamKey] };
    
    if (player) {
      if (!updatedPlayerScores[player]) {
        updatedPlayerScores[player] = { runs: 0, wickets: 0 };
      }
      if (type === 'wicket') {
        updatedPlayerScores[player].wickets = Math.max(0, updatedPlayerScores[player].wickets + (points >= 0 ? 1 : -1));
      } else {
        updatedPlayerScores[player].runs = Math.max(0, updatedPlayerScores[player].runs + points);
      }
    }

    if (type === 'wicket') {
       updatedTeam.wickets = Math.max(0, (updatedTeam.wickets || 0) + (points >= 0 ? 1 : -1));
    }

    socket.emit('update-score', {
      matchId,
      scoreData: {
        [teamKey]: { ...updatedTeam, score: updatedScore },
        playerScores: updatedPlayerScores,
        lastEvent: { team, points, player, type }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Mobile-style Container */}
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header */}
        {(view !== 'login') && (
          <header className="p-6 border-bottom border-[#141414] bg-[#141414] text-[#E4E3E0] flex justify-between items-center z-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
              <Trophy className="w-5 h-5 text-[#FF6321]" />
              <div className="flex flex-col -gap-1">
                <h1 className="text-lg font-bold tracking-tighter uppercase leading-none">GK Sports</h1>
                <span className="text-[7px] font-mono tracking-widest opacity-50">{userRole === 'admin' ? t.admin : t.viewer}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
                 <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
                 <button 
                  onClick={handleLogout}
                  className="text-[9px] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
                >
                  Logout
                </button>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative p-4 pb-24">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <LoginScreen 
                onLogin={handleLogin} 
                lang={lang}
                setLang={setLang}
                t={t}
              />
            )}
            {view === 'home' && (
              <Home 
                matches={matches} 
                players={players}
                teams={teams}
                userRole={userRole}
                onSelectMatch={(m) => { setSelectedMatch(m); setView('match'); }} 
                onSelectPlayer={(p) => { setSelectedPlayer(p); setView('player'); }}
                onSelectTeam={(t) => { setSelectedTeam(t); setView('team'); }}
                onViewArchive={() => setView('archive')}
                onCreateMatch={createMatch}
                onRegisterTeam={registerTeam}
                onViewAndroid={() => setView('android')}
                t={t}
                lang={lang}
              />
            )}
            {view === 'archive' && (
              <MatchArchive 
                matches={matches}
                onSelectMatch={(m) => { setSelectedMatch(m); setView('match'); }}
                onBack={() => setView('home')}
                t={t}
                lang={lang}
              />
            )}
            {view === 'match' && selectedMatch && (
              <MatchDetail 
                match={selectedMatch} 
                userRole={userRole}
                onBack={() => setView('home')} 
                onAdmin={() => setView('admin')}
                t={t}
                lang={lang}
              />
            )}
            {view === 'admin' && selectedMatch && (
              <AdminControls 
                match={selectedMatch} 
                teams={teams}
                matches={matches}
                onUpdate={updateScore} 
                onSetScore={setScore}
                onSetPlayerStats={setPlayerStats}
                onUpdateStatus={updateMatchStatus}
                onSelectMatch={(m) => setSelectedMatch(m)}
                onBack={() => setView('match')} 
                t={t}
                lang={lang}
              />
            )}
            {view === 'player' && selectedPlayer && (
              <PlayerProfile
                player={selectedPlayer}
                onBack={() => setView('home')}
                t={t}
              />
            )}
            {view === 'team' && selectedTeam && (
              <TeamProfile
                team={selectedTeam}
                onBack={() => setView('home')}
                t={t}
                onUpdateLogo={userRole === 'admin' ? updateTeamLogo : undefined}
              />
            )}
            {view === 'android' && (
              <AndroidDeliverable onBack={() => setView('home')} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- Live Stream Component ---
function LiveStream({ stream, isMuted = false, lang = 'en' }: { stream: MediaStream | null, isMuted?: boolean, lang?: Language }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div className="relative w-full aspect-video bg-black rounded-[32px] overflow-hidden border-2 border-[#141414] shadow-2xl">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={isMuted} 
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
          {lang === 'en' ? 'Live Feed' : lang === 'kn' ? 'ನೇರ ಪ್ರಸಾರ' : 'सीधा प्रसारण'}
        </span>
      </div>
    </div>
  );
}

// --- Language Switcher ---
function LanguageSwitcher({ currentLang, onLangChange }: { currentLang: Language, onLangChange: (l: Language) => void }) {
  return (
    <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg w-fit">
      {(['en', 'kn', 'hi'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => onLangChange(l)}
          className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${
            currentLang === l ? 'bg-[#141414] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {l === 'en' ? 'EN' : l === 'kn' ? 'KN' : 'HI'}
        </button>
      ))}
    </div>
  );
}

// --- Login Screen ---
function LoginScreen({ onLogin, lang, setLang, t }: { onLogin: (role: 'viewer' | 'admin') => void, lang: Language, setLang: (l: Language) => void, t: any }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    // Mock Admin Credentials
    if (username === 'admin' && password === 'grama2026') {
      onLogin('admin');
    } else {
      setError(lang === 'en' ? 'Invalid Username or Password' : lang === 'kn' ? 'ತಪ್ಪು ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್' : 'अमान्य उपयोगकर्ता नाम या पासवर्ड');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col justify-center p-8 space-y-10"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-[#FF6321] rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-[#FF632144]">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Grama-Kalyana Sports</h1>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-[0.2em]">Village Tournament Live Hub</p>
        </div>
        <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t.loginAs} {t.viewer}</p>
          <button 
            onClick={() => onLogin('viewer')}
            className="w-full py-5 bg-[#141414] text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            {t.viewer}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-white px-4 text-gray-400">OFFICIALS ONLY</span></div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <input 
              type="text"
              placeholder={lang === 'en' ? 'USERNAME' : lang === 'kn' ? 'ಬಳಕೆದಾರ ಹೆಸರು' : 'उपयोगकर्ता नाम'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-100 rounded-xl text-xs font-black tracking-widest focus:ring-2 focus:ring-[#FF6321] outline-none"
            />
            <input 
              type="password"
              placeholder={lang === 'en' ? 'PASSWORD' : lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್' : 'पासवर्ड'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-100 rounded-xl text-xs font-black tracking-widest focus:ring-2 focus:ring-[#FF6321] outline-none"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={handleAdminLogin}
              className="w-full py-5 border-4 border-[#141414] text-[#141414] rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-[#141414] hover:text-white active:scale-95 transition-all"
            >
              {t.admin} login
            </button>
            {error && <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-red-500 font-bold uppercase">{error}</p>}
          </div>

          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
             <p className="text-[9px] text-orange-800 font-bold uppercase text-center">Admin: admin / grama2026</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TeamLogo({ logo, name, className = "w-12 h-12" }: { logo?: string, name: string, className?: string }) {
  if (logo) {
    return (
      <div className={`${className} rounded-2xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center shrink-0`}>
        <img src={logo} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
    );
  }
  return (
    <div className={`${className} bg-[#141414] text-[#E4E3E0] rounded-2xl flex items-center justify-center text-xl font-black uppercase shrink-0`}>
      {name.charAt(0)}
    </div>
  );
}

// --- Home Component ---
function Home({ matches, players, teams, userRole, onSelectMatch, onSelectPlayer, onSelectTeam, onCreateMatch, onRegisterTeam, onViewArchive, onViewAndroid, t, lang }: { 
  matches: Match[], 
  players: Player[],
  teams: Team[],
  userRole: 'viewer' | 'admin' | null,
  onSelectMatch: (m: Match) => void, 
  onSelectPlayer: (p: Player) => void,
  onSelectTeam: (t: Team) => void,
  onCreateMatch: (s: Sport, a: { name: string; logo?: string }, b: { name: string; logo?: string }, date: string, time: string, title?: string) => void,
  onRegisterTeam: (data: Partial<Team>) => void,
  onViewArchive: () => void,
  onViewAndroid: () => void,
  t: any,
  lang: Language
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [sport, setSport] = useState<Sport>('Cricket');
  const [teamA, setTeamA] = useState<{name: string, logo?: string}>({ name: '' });
  const [teamB, setTeamB] = useState<{name: string, logo?: string}>({ name: '' });
  const [matchTitle, setMatchTitle] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [sportFilter, setSportFilter] = useState<Sport | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'scheduled' | 'finished'>('all');
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'runs' | 'wickets' | 'mom'>('name');

  const filteredPlayers = players
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'runs') return b.stats.runs - a.stats.runs;
      if (sortBy === 'wickets') return b.stats.wickets - a.stats.wickets;
      if (sortBy === 'mom') return b.stats.mom - a.stats.mom;
      return 0;
    });

  const filteredMatches = matches
    .filter(m => {
      const matchSport = sportFilter === 'All' || m.sport === sportFilter;
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSport && matchStatus;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Live Tournaments */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{t.liveMatches}</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Real-time Scoreboards • Karnataka League</p>
        </div>

        {/* Home Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'live', 'scheduled', 'finished'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                  statusFilter === s ? 'bg-[#FF6321] text-white border-[#FF6321]' : 'bg-white text-gray-400 border-gray-100'
                }`}
              >
                {s === 'all' ? t.all : s === 'live' ? t.liveMatches : s === 'scheduled' ? t.upcoming : t.finished}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['All', 'Cricket', 'Volleyball', 'Kabaddi'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                  sportFilter === s ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white text-gray-400 border-gray-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredMatches.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 gap-4">
              <Users className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium uppercase tracking-tight">No matches found with current filters</p>
              <button 
                onClick={onViewArchive}
                className="text-[10px] font-black uppercase text-[#FF6321] tracking-widest border-b-2 border-[#FF6321]"
              >
                {t.archive}
              </button>
            </div>
          ) : (
            filteredMatches.map(match => (
              <div 
                key={match.id}
                onClick={() => onSelectMatch(match)}
                className="group p-5 bg-white border-2 border-[#141414] rounded-3xl cursor-pointer hover:bg-[#141414] hover:text-[#E4E3E0] transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full w-fit ${
                        match.status === 'live' ? 'bg-[#FF6321] text-white animate-pulse' :
                        match.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {match.status === 'live' ? 'LIVE' : match.status === 'scheduled' ? 'UPCOMING' : 'FINISHED'}
                      </span>
                      {match.title && (
                        <span className="text-[10px] font-black uppercase text-[#FF6321] tracking-tighter italic">{match.title}</span>
                      )}
                    </div>
                    <span className="text-[8px] font-mono uppercase opacity-50">
                      {match.date} • {match.time}
                      {match.venue && ` • ${match.venue}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = `${window.location.origin}${window.location.pathname}?matchId=${match.id}`;
                        navigator.clipboard.writeText(link);
                        alert('Match link copied!');
                      }}
                      className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#FF6321] transition-all"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-mono uppercase opacity-50">{match.sport}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <TeamLogo logo={match.teamA.logo} name={match.teamA.name} className="w-10 h-10" />
                    <div className="space-y-0.5 truncate">
                      <p className="text-base font-bold uppercase tracking-tighter leading-none truncate">{match.teamA.name}</p>
                      <p className="text-xl font-black tabular-nums">{match.teamA.score}</p>
                    </div>
                  </div>
                  <div className="text-xs font-black opacity-20 italic font-mono px-2">VS</div>
                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                    <div className="space-y-0.5 truncate">
                      <p className="text-base font-bold uppercase tracking-tighter leading-none truncate">{match.teamB.name}</p>
                      <p className="text-xl font-black tabular-nums">{match.teamB.score}</p>
                    </div>
                    <TeamLogo logo={match.teamB.logo} name={match.teamB.name} className="w-10 h-10" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Registered Players Section */}
      <div className="space-y-4 pt-4 border-t-2 border-gray-100">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl font-black uppercase tracking-tighter italic">{t.players}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Local Heroes & Top Performers</p>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="space-y-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="SEARCH PLAYERS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-xs font-bold uppercase tracking-tight focus:ring-2 focus:ring-[#FF6321] outline-none"
            />
            <Users className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['name', 'runs', 'wickets', 'mom'].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s as any)}
                className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  sortBy === s ? 'bg-[#141414] text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                Sort by {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {filteredPlayers.map(player => (
            <div 
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#141414] cursor-pointer transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#FF6321] font-black uppercase">
                {player.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold uppercase tracking-tight text-sm truncate">{player.name}</p>
                <p className="text-[10px] uppercase text-gray-500 font-mono italic">{player.village}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black tabular-nums">{player.stats.runs} R</p>
                <p className="text-[10px] font-mono opacity-50">{player.stats.wickets} W • {player.stats.mom} MOM</p>
              </div>
            </div>
          ))}
          {filteredPlayers.length === 0 && (
             <div className="text-center py-8 text-gray-400 text-xs uppercase font-bold">No players found</div>
          )}
        </div>
      </div>

      {/* Team Profiles Section */}
      <div className="space-y-4 pt-4 border-t-2 border-gray-100">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tighter italic">{t.teams}</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Elite Squads of the Region</p>
          {userRole === 'admin' && (
            <button 
              onClick={() => setShowAddTeam(true)}
              className="w-full py-4 border-2 border-dashed border-[#141414] rounded-[32px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all opacity-60 hover:opacity-100"
            >
              <Plus className="w-4 h-4" /> {t.registerTeam}
            </button>
          )}
        </div>

        <AnimatePresence>
          {showAddTeam && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <RegisterTeamForm 
                onClose={() => setShowAddTeam(false)} 
                onRegister={(data) => {
                  onRegisterTeam(data);
                  setShowAddTeam(false);
                }}
                t={t}
                lang={lang}
              />
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-3">
          {teams.map(team => (
            <div 
              key={team.id}
              onClick={() => onSelectTeam(team)}
              className="p-5 bg-white border border-gray-200 rounded-[32px] hover:border-[#141414] cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center gap-4">
                <TeamLogo logo={team.logo} name={team.name} className="w-14 h-14" />
                <div className="flex-1">
                  <h3 className="font-bold uppercase tracking-tight text-lg">{team.name}</h3>
                  <p className="text-[10px] uppercase text-[#FF6321] font-mono tracking-widest">{team.village}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black uppercase tracking-tighter opacity-40">Record</p>
                   <p className="text-lg font-black tabular-nums">{team.stats.won}-{team.stats.lost}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                 {team.players.slice(0, 3).map((p, idx) => (
                   <span key={idx} className="px-2 py-1 bg-gray-50 text-[8px] font-bold uppercase tracking-widest rounded-lg border border-gray-100">
                     {p}
                   </span>
                 ))}
                 {team.players.length > 3 && <span className="text-[8px] font-bold opacity-30">+{team.players.length - 3} MORE</span>}
              </div>

              <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
                 <div className="flex gap-1">
                    {team.performance.split('-').map((res, idx) => (
                       <div key={idx} className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${res === 'W' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {res}
                       </div>
                    ))}
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Recent Form</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats / Info */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onViewArchive}
          className="p-6 bg-white border-2 border-[#141414] rounded-3xl flex flex-col items-center justify-center gap-3 group hover:bg-[#141414] hover:text-white transition-all shadow-lg"
        >
          <div className="w-10 h-10 bg-[#FF6321] rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
            <Archive className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest">{t.archive}</p>
            <p className="text-[8px] opacity-50 uppercase font-bold">Past Results</p>
          </div>
        </button>

        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shrink-0">
             <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Live Predictions</p>
            <p className="text-[8px] opacity-50 uppercase font-bold">AI Features</p>
          </div>
        </div>
      </div>

      {/* Manual Create Form - ADMIN ONLY */}
      {userRole === 'admin' && (
        <div className="p-6 border-2 border-[#141414] rounded-3xl space-y-4">
          <h3 className="font-bold uppercase tracking-tight">{t.launchScoreboard}</h3>
          <div className="space-y-3">
            <select 
              value={sport} 
              onChange={(e) => setSport(e.target.value as Sport)}
              className="w-full p-3 rounded-xl bg-gray-100 border-none text-sm font-bold uppercase tracking-tight focus:ring-2 focus:ring-[#FF6321]"
            >
              <option value="Cricket">Cricket</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Kabaddi">Kabaddi</option>
            </select>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">{t.matchTitle}</label>
                <input 
                  placeholder={lang === 'en' ? "E.G. FINAL MATCH" : lang === 'kn' ? "ಉದಾ: ಫೈನಲ್ ಪಂದ್ಯ" : "उदा: फाइनल मैच"} 
                  value={matchTitle} 
                  onChange={(e) => setMatchTitle(e.target.value)}
                  className="p-3 bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-tight w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  placeholder="TEAM A" 
                  value={teamA.name} 
                  onChange={(e) => {
                    const name = e.target.value;
                    const existingTeam = teams.find(t => t.name.toLowerCase() === name.toLowerCase());
                    setTeamA({ name, logo: existingTeam?.logo });
                  }}
                  className="p-3 bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-tight w-full"
                />
                <input 
                  placeholder="TEAM B" 
                  value={teamB.name} 
                  onChange={(e) => {
                    const name = e.target.value;
                    const existingTeam = teams.find(t => t.name.toLowerCase() === name.toLowerCase());
                    setTeamB({ name, logo: existingTeam?.logo });
                  }}
                  className="p-3 bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-tight w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">{t.date}</label>
                <input 
                  type="date"
                  value={matchDate} 
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="p-3 bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-tight w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">{t.time}</label>
                <input 
                  type="time"
                  value={matchTime} 
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="p-3 bg-gray-100 rounded-xl text-xs font-bold uppercase tracking-tight w-full"
                />
              </div>
            </div>
            <button 
              onClick={() => onCreateMatch(sport, teamA, teamB, matchDate, matchTime, matchTitle)}
              className="w-full py-3 bg-[#141414] text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#FF6321] transition-colors"
            >
              {t.launchScoreboard}
            </button>
          </div>
        </div>
      )}

      {/* Android Code Link */}
      <button 
        onClick={onViewAndroid}
        className="w-full py-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 group hover:bg-[#141414] hover:text-white transition-all"
      >
        <Zap className="w-4 h-4 text-[#FF6321]" />
        <span className="text-[10px] font-black uppercase tracking-widest">Access Native Android Docs</span>
      </button>
    </motion.div>
  );
}

// --- Team Profile View ---
function RegisterTeamForm({ onClose, onRegister, t, lang }: { onClose: () => void, onRegister: (data: Partial<Team>) => void, t: any, lang: Language }) {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-[40px] p-8 max-w-sm w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
    >
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter">{t.registerTeam}</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">{lang === 'en' ? 'Register Elite Squad' : lang === 'kn' ? 'ಎಲೈಟ್ ತಂಡವನ್ನು ನೋಂದಾಯಿಸಿ' : 'एलीट टीम पंजीकृत करें'}</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 bg-gray-100 rounded-[32px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-all overflow-hidden relative group"
          >
            {logo ? (
              <>
                <img src={logo} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-gray-400 mb-1" />
                <span className="text-[8px] font-black uppercase text-gray-400">Add Logo</span>
              </>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleLogoSelect} accept="image/*" className="hidden" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase opacity-40 ml-1">{lang === 'en' ? 'Team Name' : lang === 'kn' ? 'ತಂಡದ ಹೆಸರು' : 'टीम का नाम'}</label>
          <input 
            type="text" 
            placeholder="E.G. GLADIATORS" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 bg-gray-100 rounded-2xl text-xs font-black tracking-widest focus:ring-2 focus:ring-[#FF6321] outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase opacity-40 ml-1">{t.village}</label>
          <input 
            type="text" 
            placeholder="E.G. UDUPPI" 
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            className="w-full p-4 bg-gray-100 rounded-2xl text-xs font-black tracking-widest focus:ring-2 focus:ring-[#FF6321] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button 
          onClick={onClose}
          className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
        >
          {t.cancel}
        </button>
        <button 
          onClick={() => {
            if (name && village) {
              onRegister({ name, village, logo: logo || undefined });
            }
          }}
          disabled={!name || !village}
          className="py-4 bg-[#141414] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-[#FF6321] transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {t.register}
        </button>
      </div>
    </motion.div>
  );
}

function TeamProfile({ team, onBack, t, onUpdateLogo }: { team: Team, onBack: () => void, t: any, onUpdateLogo?: (id: string, logo: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogo, setPendingLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateLogo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmLogoUpdate = () => {
    if (pendingLogo && onUpdateLogo) {
      onUpdateLogo(team.id, pendingLogo);
      setPendingLogo(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8 pb-12"
    >
      <AnimatePresence>
        {pendingLogo && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full space-y-6 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">{t.confirmLogo}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Does this look correct?</p>
              </div>

              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-gray-50 shadow-xl">
                  <img src={pendingLogo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                  onClick={() => setPendingLogo(null)}
                  className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> {t.cancel}
                </button>
                <button 
                  onClick={confirmLogoUpdate}
                  className="py-4 bg-[#FF6321] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#FF632144]"
                >
                  <Check className="w-4 h-4" /> {t.looksGood}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
        <ChevronLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <TeamLogo logo={team.logo} name={team.name} className="w-24 h-24 shadow-xl shadow-[#FF632122]" />
          {onUpdateLogo && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-center px-2"
            >
              Update Logo
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{team.name}</h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{team.village}</p>
          <div className="flex gap-1 pt-2">
             {team.performance.split('-').map((res, i) => (
                <div key={i} className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${res === 'W' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {res}
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Played', value: team.stats.matches },
          { label: 'Wins', value: team.stats.won },
          { label: 'Losses', value: team.stats.lost },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl text-center space-y-1">
            <p className="text-[8px] font-black uppercase opacity-40 tracking-widest leading-none">{stat.label}</p>
            <p className="text-xl font-black tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
         <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF6321]" /> Active Squad
         </h3>
         <div className="grid gap-2">
            {team.players.map((playerName, idx) => (
               <div key={idx} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center group hover:bg-[#141414] hover:text-white transition-all">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white text-[#141414] flex items-center justify-center text-[10px] font-black">
                        {playerName.charAt(0)}
                     </div>
                     <span className="text-sm font-bold uppercase tracking-tight">{playerName}</span>
                  </div>
                  <span className="text-[10px] font-black opacity-30 group-hover:opacity-100">PRO PLAYER</span>
               </div>
            ))}
         </div>
      </div>

      <div className="p-6 bg-[#141414] text-white rounded-[40px] space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#FF6321]" /> Season Stats
        </h3>
        <div className="space-y-4">
           <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                 <span>Win Rate</span>
                 <span>{Math.round((team.stats.won / team.stats.matches) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-[#FF6321]" 
                   style={{ width: `${(team.stats.won / team.stats.matches) * 100}%` }}
                 />
              </div>
           </div>
           <p className="text-[10px] opacity-50 font-mono italic">"The strongest team in the North-Sagar division, consistently performing under pressure." - GK Sports AI</p>
        </div>
      </div>
    </motion.div>
  );
}

// --- Player Profile View ---
function PlayerProfile({ player, onBack, t }: { player: Player, onBack: () => void, t: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
        <ChevronLeft className="w-4 h-4" /> {t.back}
      </button>

      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-[#141414] text-[#E4E3E0] rounded-[32px] flex items-center justify-center text-4xl font-black shadow-xl">
          {player.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">{player.name}</h2>
          <p className="text-xs text-[#FF6321] font-mono uppercase tracking-widest flex items-center gap-1">
            <Zap className="w-3 h-3" /> {player.village}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: t.matches, value: player.stats.matches },
          { label: t.runs, value: player.stats.runs },
          { label: t.wickets, value: player.stats.wickets },
          { label: t.mom, value: player.stats.mom },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border-2 border-[#141414] rounded-3xl text-center space-y-1">
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Performance History */}
      {player.history && player.history.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Archive className="w-4 h-4 text-[#FF6321]" /> Recent Form (Last 5)
          </h3>
          <div className="space-y-2">
            {player.history.slice(0, 5).map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase opacity-40">{h.date}</span>
                  <span className="text-[10px] font-black uppercase tracking-tight">vs {h.opponent}</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                     <span className="text-[10px] font-black uppercase block">{h.score} pts</span>
                     <span className="text-[8px] font-bold text-gray-400 block uppercase">{h.secondary} aux</span>
                   </div>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                     h.result === 'W' ? 'bg-green-100 text-green-600' : h.result === 'L' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                   }`}>
                     {h.result}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 bg-[#141414] text-white rounded-[40px] space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <Star className="w-4 h-4 text-[#FF6321]" /> Recent Form
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
             <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-[10px] font-mono uppercase opacity-50">Match #{i + 10} vs Blue Tigers</span>
                <span className="text-xs font-bold text-[#FF6321]">EXCELLENT</span>
             </div>
          ))}
        </div>
      </div>
      
      <button className="w-full py-4 bg-[#FF6321] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
        <Share2 className="w-5 h-5" /> EXPORT CAREER STATS
      </button>
    </motion.div>
  );
}

// --- Match Poll Component ---
function MatchPoll({ match, lang }: { match: Match, lang: Language }) {
  const [voted, setVoted] = useState<string | null>(null);
  
  const handleVote = (team: 'A' | 'B') => {
    if (voted) return;
    setVoted(team);
    socket.emit('vote', { matchId: match.id, team });
  };

  const poll = match.poll || { teamA: 0, teamB: 0, total: 0 };
  const percentA = poll.total > 0 ? Math.round((poll.teamA / poll.total) * 100) : 50;
  const percentB = 100 - percentA;

  return (
    <div className="bg-[#141414] text-white p-6 rounded-[32px] space-y-4 shadow-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#FF6321]" />
          <h4 className="text-[10px] font-black uppercase tracking-widest">{lang === 'en' ? 'Fan Victory Poll' : lang === 'kn' ? 'ಅಭಿಮಾನಿಗಳ ಭವಿಷ್ಯ' : 'प्रशंसक जीत पोल'}</h4>
        </div>
        <span className="text-[8px] font-mono opacity-50 uppercase tracking-tighter">{poll.total} {lang === 'en' ? 'Votes' : lang === 'kn' ? 'ಮತಗಳು' : 'मत'}</span>
      </div>

      <div className="space-y-4">
        {voted ? (
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase">
              <span className="truncate max-w-[120px]">{match.teamA.name} ({percentA}%)</span>
              <span className="truncate max-w-[120px]">{match.teamB.name} ({percentB}%)</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentA}%` }}
                className="h-full bg-[#FF6321]"
              />
              <div className="h-full bg-blue-500 flex-1" />
            </div>
            <p className="text-center text-[10px] font-bold uppercase opacity-50 tracking-tight">Vote Registered! Stay tuned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleVote('A')}
              className="p-4 rounded-2xl border-2 border-white/10 hover:border-[#FF6321] transition-all bg-white/5 flex flex-col items-center gap-2 group"
            >
              <TeamLogo logo={match.teamA.logo} name={match.teamA.name} className="w-8 h-8 opacity-50 group-hover:opacity-100" />
              <span className="text-[10px] font-black uppercase truncate w-full text-center">{match.teamA.name}</span>
            </button>
            <button 
              onClick={() => handleVote('B')}
              className="p-4 rounded-2xl border-2 border-white/10 hover:border-blue-500 transition-all bg-white/5 flex flex-col items-center gap-2 group"
            >
              <TeamLogo logo={match.teamB.logo} name={match.teamB.name} className="w-8 h-8 opacity-50 group-hover:opacity-100" />
              <span className="text-[10px] font-black uppercase truncate w-full text-center">{match.teamB.name}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Broadcaster Scoreboard (Full Screen) ---
function BroadcasterScoreboard({ match, onExit, t }: { match: Match, onExit: () => void, t: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#141414] text-white flex flex-col p-8 md:p-12 overflow-hidden select-none"
    >
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF6321] animate-pulse">LIVE TRANSMISSION</span>
          <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{match.sport} • {match.title || 'Regional Final'}</h2>
        </div>
      </div>

      <div className="absolute top-8 right-8 flex items-center gap-3">
        <button 
          onClick={() => {
            const link = `${window.location.origin}${window.location.pathname}?matchId=${match.id}`;
            navigator.clipboard.writeText(link);
            alert('Live Link Copied!');
          }}
          className="p-4 rounded-full bg-white/5 hover:bg-[#FF6321] transition-all flex items-center gap-2 group"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Share Live</span>
        </button>
        <button 
          onClick={onExit}
          className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-12 md:gap-24">
        <div className="flex w-full items-center justify-between gap-8">
           {/* Team A */}
           <div className="flex-1 flex flex-col items-center gap-8 text-center">
              <motion.div 
                key={match.teamA.score}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <TeamLogo logo={match.teamA.logo} name={match.teamA.name} className="w-24 h-24 md:w-48 md:h-48 shadow-2xl border-4 border-white/10" />
                {match.lastEvent?.team === 'A' && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-4 -right-4 bg-[#FF6321] text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl"
                  >
                    +{match.lastEvent.points}
                  </motion.div>
                )}
              </motion.div>
              <div className="space-y-4">
                 <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">{match.teamA.name}</h3>
                 <div className="flex items-center justify-center gap-4">
                   <p className="text-8xl md:text-[180px] font-black tabular-nums tracking-tighter leading-none animate-in zoom-in duration-500">
                     {match.teamA.score}
                   </p>
                   {match.sport === 'Cricket' && (
                      <span className="text-5xl md:text-8xl font-black opacity-20 italic">/ {match.teamA.wickets || 0}</span>
                   )}
                 </div>
              </div>
           </div>

           {/* VS Divider */}
           <div className="flex flex-col items-center gap-4 opacity-20">
              <div className="w-[2px] h-32 bg-white" />
              <div className="text-4xl md:text-6xl font-black italic">VS</div>
              <div className="w-[2px] h-32 bg-white" />
           </div>

           {/* Team B */}
           <div className="flex-1 flex flex-col items-center gap-8 text-center">
              <motion.div 
                key={match.teamB.score}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
              >
                <TeamLogo logo={match.teamB.logo} name={match.teamB.name} className="w-24 h-24 md:w-48 md:h-48 shadow-2xl border-4 border-white/10" />
                {match.lastEvent?.team === 'B' && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-4 -left-4 bg-[#FF6321] text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl"
                  >
                    +{match.lastEvent.points}
                  </motion.div>
                )}
              </motion.div>
              <div className="space-y-4">
                 <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">{match.teamB.name}</h3>
                 <div className="flex items-center justify-center gap-4">
                   <p className="text-8xl md:text-[180px] font-black tabular-nums tracking-tighter leading-none animate-in zoom-in duration-500">
                     {match.teamB.score}
                   </p>
                   {match.sport === 'Cricket' && (
                      <span className="text-5xl md:text-8xl font-black opacity-20 italic">/ {match.teamB.wickets || 0}</span>
                   )}
                 </div>
              </div>
           </div>
        </div>

        {/* Global Footer Stats Bar */}
        <div className="mt-auto grid grid-cols-3 items-center border-t-2 border-white/10 pt-8 gap-12">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Tournament Feed</span>
               <span className="text-sm font-bold uppercase tracking-tight truncate">Village Cup Karnataka Edition 2026</span>
            </div>
            <div className="flex flex-col items-center gap-1">
               <div className="px-4 py-3 bg-white/5 rounded-3xl flex items-center gap-6 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{match.venue || 'Grama Stadium'}</span>
                  </div>
                  {match.playerScores && Object.keys(match.playerScores).length > 0 && (
                    <div className="flex items-center gap-4 text-[10px] font-mono border-l border-white/10 pl-6">
                       <span className="opacity-40 uppercase">Top Performer:</span>
                       {Object.entries(match.playerScores).sort(([,a], [,b]) => b.runs - a.runs).slice(0, 1).map(([name, stats]) => (
                         <span key={name} className="font-bold text-[#FF6321] animate-in slide-in-from-right">
                           {name.toUpperCase()} {stats.runs}R / {stats.wickets}W
                         </span>
                       ))}
                    </div>
                  )}
               </div>
            </div>
            <div className="flex flex-col items-end gap-1">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Local Time</span>
               <span className="text-sm font-mono font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Match Detail (Viewer) ---
function MatchDetail({ match, userRole, onBack, onAdmin, t, lang }: { match: Match, userRole: 'viewer' | 'admin' | null, onBack: () => void, onAdmin: () => void, t: any, lang: Language }) {
  const [commentary, setCommentary] = useState<string>('');
  const [prediction, setPrediction] = useState<{prediction: string, reason: string} | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showBroadcaster, setShowBroadcaster] = useState(false);
  const [scoreboardStyle, setScoreboardStyle] = useState<'hero' | 'minimal'>('hero');
  const peerRef = useRef<Peer.Instance | null>(null);

  const requestStream = () => {
    socket.emit('request-stream', match.id);
  };

  useEffect(() => {
    if (!match.isStreaming) {
      setRemoteStream(null);
      if (peerRef.current) peerRef.current.destroy();
      peerRef.current = null;
    }
  }, [match.isStreaming]);

  useEffect(() => {
    socket.on('signal', ({ from, signal }) => {
      if (!peerRef.current) {
        const peer = new Peer({
          initiator: false,
          trickle: false,
        });

        peer.on('signal', (data) => {
          socket.emit('signal', { to: from, from: socket.id, signal: data });
        });

        peer.on('stream', (stream) => {
          setRemoteStream(stream);
        });

        peerRef.current = peer;
      }
      peerRef.current.signal(signal);
    });

    return () => {
      socket.off('signal');
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    const fetchAI = async () => {
      setLoadingAI(true);
      const c = await getMatchCommentary(match.sport, match);
      const p = await getMatchPrediction(match.sport, match);
      setCommentary(c || '');
      setPrediction(p);
      setLoadingAI(false);
    };
    fetchAI();
    const interval = setInterval(fetchAI, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, [match.id, match.sport, match.teamA.score, match.teamB.score, match.lastEvent]);

  const getShareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?matchId=${match.id}`;
  };

  const copyLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const shareToWhatsApp = () => {
    const link = getShareLink();
    const text = `Watch ${match.teamA.name} vs ${match.teamB.name} live on Grama-Kalyana Sports! ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6 pb-12"
    >
      <AnimatePresence>
        {showBroadcaster && (
          <BroadcasterScoreboard match={match} onExit={() => setShowBroadcaster(false)} t={t} />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
          <ChevronLeft className="w-4 h-4" /> {t.back}
        </button>
        <button 
          onClick={() => setShowBroadcaster(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all shadow-sm"
        >
          <Monitor className="w-3 h-3" /> Broadcaster View
        </button>
      </div>

      {/* Main Scoreboard */}
      <div className="space-y-4">
        <div className="flex justify-end gap-2 px-1">
          {(['hero', 'minimal'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScoreboardStyle(s)}
              className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all ${
                scoreboardStyle === s ? 'bg-[#141414] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {s} Style
            </button>
          ))}
        </div>

        {match.isStreaming && remoteStream ? (
          <LiveStream stream={remoteStream} lang={lang} />
        ) : scoreboardStyle === 'hero' ? (
          <div className="p-8 bg-[#141414] text-white rounded-[40px] shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-center items-center gap-8">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
               <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase opacity-70">
                  {match.title ? `${match.title} • ` : ''}LIVE • {match.sport}
                </span>
               </div>
               <span className="text-[8px] font-mono uppercase opacity-40">{match.date} • {match.time}</span>
            </div>

            <div className="flex w-full items-center justify-around gap-4 text-center mt-4">
               <div className="flex-1 space-y-2 flex flex-col items-center">
                  <TeamLogo logo={match.teamA.logo} name={match.teamA.name} className="w-16 h-16 shadow-lg shadow-black/20" />
                  <h3 className="text-xl font-bold uppercase tracking-tighter line-clamp-1">{match.teamA.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-7xl font-black tabular-nums tracking-tighter leading-none">{match.teamA.score}</p>
                    {match.sport === 'Cricket' && (
                      <span className="text-3xl font-black opacity-30 italic">/ {match.teamA.wickets || 0}</span>
                    )}
                  </div>
               </div>
               <div className="text-4xl font-black italic opacity-20 text-center">VS</div>
               <div className="flex-1 space-y-2 flex flex-col items-center">
                  <TeamLogo logo={match.teamB.logo} name={match.teamB.name} className="w-16 h-16 shadow-lg shadow-black/20" />
                  <h3 className="text-xl font-bold uppercase tracking-tighter line-clamp-1">{match.teamB.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-7xl font-black tabular-nums tracking-tighter leading-none">{match.teamB.score}</p>
                    {match.sport === 'Cricket' && (
                      <span className="text-3xl font-black opacity-30 italic">/ {match.teamB.wickets || 0}</span>
                    )}
                  </div>
               </div>
            </div>

            {userRole === 'admin' && (
              <div className="absolute bottom-6 right-6">
                 <button onClick={onAdmin} className="p-3 bg-[#333] rounded-full hover:bg-[#FF6321] transition-colors group">
                    <Zap className="w-5 h-5 text-white" />
                 </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border-2 border-[#141414] rounded-[40px] p-8 shadow-xl space-y-8">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
               <span>{match.sport} Championship</span>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-[#FF6321] rounded-full animate-pulse" />
                 <span>LIVE</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#141414] text-white rounded-full flex items-center justify-center text-[10px] font-black italic z-10">VS</div>
               
               <div className="space-y-4">
                  <TeamLogo logo={match.teamA.logo} name={match.teamA.name} className="w-12 h-12" />
                  <h3 className="text-lg font-black uppercase italic tracking-tighter leading-tight">{match.teamA.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black tabular-nums tracking-tighter">{match.teamA.score}</p>
                    {match.sport === 'Cricket' && (
                      <span className="text-2xl font-black opacity-30 italic">/ {match.teamA.wickets || 0}</span>
                    )}
                  </div>
               </div>

               <div className="space-y-4 text-right flex flex-col items-end">
                  <TeamLogo logo={match.teamB.logo} name={match.teamB.name} className="w-12 h-12" />
                  <h3 className="text-lg font-black uppercase italic tracking-tighter leading-tight">{match.teamB.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-black tabular-nums tracking-tighter">{match.teamB.score}</p>
                    {match.sport === 'Cricket' && (
                      <span className="text-2xl font-black opacity-30 italic">/ {match.teamB.wickets || 0}</span>
                    )}
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
               <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase opacity-40">Last Event</span>
                  <p className="text-[10px] font-bold uppercase tracking-tight">
                    {match.lastEvent ? `${match.lastEvent.player || 'Admin'} scored ${match.lastEvent.points} pts` : 'No events yet'}
                  </p>
               </div>
               {userRole === 'admin' && (
                 <button onClick={onAdmin} className="text-[9px] font-black uppercase tracking-widest text-[#FF6321] border-b-2 border-[#FF6321]">
                    Manage Match
                 </button>
               )}
            </div>
          </div>
        )}

        {/* Fan Interaction Feature */}
        {match.status === 'live' && (
          <MatchPoll match={match} lang={lang} />
        )}

        {/* Live Link Sharing */}
        <div className="bg-white border-2 border-gray-100 rounded-[32px] p-6 space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-[#FF6321]" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Share Live Match</h4>
              </div>
              {copyStatus && <span className="text-[8px] font-black text-green-500 uppercase tracking-widest animate-pulse">Copied!</span>}
           </div>
           <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 font-mono text-[9px] text-gray-400 truncate">
                {getShareLink()}
              </div>
              <button 
                onClick={copyLink}
                className="px-4 bg-[#141414] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF6321] transition-all"
              >
                Copy Link
              </button>
           </div>
        </div>
 
        {/* Live Match Scorecard */}
        {match.playerScores && Object.keys(match.playerScores).length > 0 && (
          <div className="bg-white border-2 border-gray-100 rounded-[32px] p-6 space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Archive className="w-4 h-4 text-[#FF6321]" /> {lang === 'en' ? 'Live Scorecard' : lang === 'kn' ? 'ನೇರ ಅಂಕಪಟ್ಟಿ' : 'लाइव स्कोरकार्ड'}
                </h3>
                <span className="text-[8px] font-mono uppercase opacity-40">Automatic Updates</span>
             </div>
             <div className="space-y-2">
                {Object.entries(match.playerScores)
                  .sort(([, a], [, b]) => b.runs - a.runs)
                  .map(([name, stats]) => (
                  <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black uppercase">
                        {name.charAt(0)}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight">{name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <span className="text-[8px] block font-bold text-gray-400 uppercase leading-none mb-1">{match.sport === 'Cricket' ? 'Runs' : 'Points'}</span>
                        <span className="text-sm font-black italic">{stats.runs}</span>
                      </div>
                      {match.sport === 'Cricket' && stats.wickets > 0 && (
                        <div className="text-center">
                          <span className="text-[8px] block font-bold text-gray-400 uppercase leading-none mb-1">Wkts</span>
                          <span className="text-sm font-black italic text-[#FF6321]">{stats.wickets}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {match.isStreaming && !remoteStream && (
          <button 
            onClick={requestStream}
            className="w-full py-6 bg-[#FF6321] text-white rounded-[32px] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Eye className="w-6 h-6" />
            <span className="text-sm font-black uppercase tracking-widest">{t.liveStream}</span>
          </button>
        )}
      </div>

      {/* AI Commentary Section */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF6321]" /> {t.commentary}
            </h4>
            {loadingAI && <div className="text-[10px] uppercase font-mono animate-pulse opacity-50">Analyzing...</div>}
         </div>
         <div className="p-6 bg-white border border-[#141414] rounded-3xl relative">
            <div className="absolute top-0 left-6 -translate-y-1/2 bg-white px-2">
               <Star className="w-4 h-4 text-[#FF6321]" fill="#FF6321" />
            </div>
            <p className="text-sm font-medium leading-relaxed italic">
              "{commentary || 'Waiting for the next big move...'}"
            </p>
         </div>
      </div>

      {/* Match Prediction */}
      {prediction && (
        <div className="p-6 bg-[#FF6321] text-white rounded-3xl space-y-2">
           <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">{t.predictions}</p>
           <p className="text-lg font-black uppercase tracking-tight">Expected Winner: {prediction.prediction}</p>
           <p className="text-[10px] uppercase font-mono opacity-60 leading-relaxed font-bold">{prediction.reason}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4">
         <button 
           onClick={copyLink}
           className="flex items-center justify-center gap-2 py-4 bg-[#FF6321] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#141414] transition-all shadow-lg"
         >
            <Share2 className="w-4 h-4" /> Copy Live Stream Link
         </button>
         <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={shareToWhatsApp}
              className="flex items-center justify-center gap-2 py-4 border-2 border-[#141414] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100"
            >
                <MessageSquare className="w-4 h-4" /> WhatsApp
            </button>
            <button 
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(match, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `match_${match.id}_result.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
              className="flex items-center justify-center gap-2 py-4 border-2 border-[#141414] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100"
            >
                <Share2 className="w-4 h-4" /> Export JSON
            </button>
         </div>
      </div>

    </motion.div>
  );
}

// --- Admin Controls ---
function AdminControls({ match, teams, matches, onUpdate, onSetScore, onSetPlayerStats, onUpdateStatus, onSelectMatch, onBack, t, lang }: { 
  match: Match, 
  teams: Team[], 
  matches: Record<string, Match>,
  onUpdate: (id: string, t: 'A' | 'B', p: number, player?: string, type?: string) => void, 
  onSetScore: (id: string, t: 'A' | 'B', s: number) => void,
  onSetPlayerStats: (id: string, name: string, runs: number, wickets: number) => void,
  onUpdateStatus: (id: string, s: 'live' | 'finished' | 'scheduled') => void, 
  onSelectMatch: (m: Match) => void,
  onBack: () => void, 
  t: any, 
  lang: Language 
}) {
  const [playerName, setPlayerName] = useState('');
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [directScore, setDirectScore] = useState<string>('');
  const [playerRuns, setPlayerRuns] = useState<string>('');
  const [playerWickets, setPlayerWickets] = useState<string>('');
  const peersRef = useRef<Record<string, Peer.Instance>>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  const teamAPlayers = teams.find(t => t.name === match.teamA.name)?.players || [];
  const teamBPlayers = teams.find(t => t.name === match.teamB.name)?.players || [];
  const currentActiveTeam = activeSide === 'A' ? match.teamA : match.teamB;
  const currentTeamPlayers = activeSide === 'A' ? teamAPlayers : teamBPlayers;

  useEffect(() => {
    socket.on('viewer-joined', ({ viewerId }) => {
      if (localStreamRef.current) {
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: localStreamRef.current,
        });

        peer.on('signal', (data) => {
          socket.emit('signal', { to: viewerId, from: socket.id, signal: data });
        });

        peer.on('close', () => {
          delete peersRef.current[viewerId];
        });

        peersRef.current[viewerId] = peer;
      }
    });

    socket.on('signal', ({ from, signal }) => {
      if (peersRef.current[from]) {
        peersRef.current[from].signal(signal);
      }
    });

    return () => {
      socket.off('viewer-joined');
      socket.off('signal');
      Object.values(peersRef.current).forEach((p: any) => p.destroy());
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;
      socket.emit('start-stream', match.id);
    } catch (err) {
      console.error("Failed to get local stream", err);
    }
  };

  const stopStreaming = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    socket.emit('stop-stream', match.id);
  };

  const pointsOptions = match.sport === 'Cricket' ? [0, 1, 2, 3, 4, 6] : [0, 1, 2, 3];
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8 pb-32"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter">{t.scorerDashboard}</h2>
        <button onClick={onBack} className="p-2 border border-[#141414] rounded-full">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <Video className="w-4 h-4 text-[#FF6321]" /> {lang === 'en' ? 'Live Broadcast Console' : 'ಲೈವ್ ಬ್ರಾಡ್‌ಕಾಸ್ಟ್'}
        </h3>
        
        {localStream ? (
          <div className="space-y-4">
            <LiveStream stream={localStream} isMuted={true} lang={lang} />
            <button 
              onClick={stopStreaming}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg"
            >
              <VideoOff className="w-4 h-4" /> Stop Broadcast
            </button>
          </div>
        ) : (
          <button 
            onClick={startStreaming}
            className="w-full py-5 border-2 border-[#141414] text-[#141414] rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-[#141414] hover:text-white transition-all shadow-xl"
          >
            <Video className="w-5 h-5" /> Start Live Stream
          </button>
        )}
      </div>

      {/* Live Scorecard in Console */}
      {match.playerScores && Object.keys(match.playerScores).length > 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-[32px] p-6 space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FF6321]">
                Live Stats (Auto-Track)
              </h3>
           </div>
           <div className="grid grid-cols-2 gap-3">
              {Object.entries(match.playerScores).map(([name, stats]) => (
                <div key={name} className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase truncate">{name}</span>
                  <div className="flex gap-3 text-[10px] font-bold text-gray-500">
                    <span>R: {stats.runs}</span>
                    {match.sport === 'Cricket' && <span>W: {stats.wickets}</span>}
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Team Selection Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl">
        <button 
          onClick={() => setActiveSide('A')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSide === 'A' ? 'bg-white shadow-sm text-[#FF6321]' : 'text-gray-400'}`}
        >
          {match.teamA.name}
        </button>
        <button 
          onClick={() => setActiveSide('B')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSide === 'B' ? 'bg-white shadow-sm text-[#FF6321]' : 'text-gray-400'}`}
        >
          {match.teamB.name}
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase opacity-40 ml-1">{t.currentScorer}</label>
          <div className="flex flex-col gap-2">
             <div className="flex flex-wrap gap-1">
                {currentTeamPlayers.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPlayerName(p)}
                    className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all border-2 ${playerName === p ? 'bg-[#FF6321] text-white border-[#FF6321]' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                  >
                    {p}
                  </button>
                ))}
             </div>
             <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder={lang === 'en' ? "OR TYPE PLAYER NAME..." : lang === 'kn' ? "ಅಥವಾ ಆಟಗಾರನ ಹೆಸರನ್ನು ಟೈಪ್ ಮಾಡಿ..." : "या खिलाड़ी का नाम टाइप करें..."} 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="flex-1 p-3 bg-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-tight focus:ring-2 focus:ring-[#FF6321] outline-none"
                />
                <button 
                  onClick={() => setPlayerName('')}
                  className="p-3 bg-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  {t.clear}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Single Dynamic Scoreboard */}
      <div className="space-y-6">
      <div className="p-6 bg-[#141414] text-white rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-center items-center gap-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{t.activeTeamScore}</div>
        <div className="flex flex-col items-center gap-2">
          <TeamLogo logo={currentActiveTeam.logo} name={currentActiveTeam.name} className="w-16 h-16 border-2 border-white/10" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">{currentActiveTeam.name}</h3>
          <p className="text-8xl font-black tabular-nums tracking-tighter leading-none animate-in fade-in zoom-in duration-300" key={currentActiveTeam.score}>
            {currentActiveTeam.score}
          </p>
        </div>
        {playerName && (
          <div className="px-4 py-1.5 bg-[#FF6321] rounded-full text-[10px] font-black uppercase tracking-widest">
            {t.scorer}: {playerName}
          </div>
        )}
      </div>

      {/* Quick Match Switcher */}
      {Object.keys(match).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Other Active Sessions</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {Object.values(matches)
              .filter(m => m.id !== match.id)
              .map(m => (
              <button 
                key={m.id}
                onClick={() => {
                  onSelectMatch?.(m);
                  setPlayerName('');
                }}
                className="shrink-0 p-4 bg-white border border-gray-100 rounded-2xl flex flex-col gap-1 min-w-[120px] hover:border-[#FF6321] transition-all"
              >
                <span className="text-[8px] font-black uppercase opacity-40">{m.sport}</span>
                <span className="text-[10px] font-black uppercase truncate">{m.teamA.name} v {m.teamB.name}</span>
                <span className="text-[8px] font-bold text-[#FF6321] uppercase">Match ID: {m.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

          <div className="grid grid-cols-3 gap-3">
             {pointsOptions.map(p => (
               <button 
                key={`${activeSide}-${p}`}
                onClick={() => {
                  onUpdate(match.id, activeSide, p, playerName);
                  // Player persists!
                }}
                className="group relative h-24 bg-white border-2 border-[#141414] text-[#141414] rounded-3xl font-black text-3xl hover:bg-[#FF6321] hover:text-white transition-all shadow-lg active:scale-95"
               >
                 <span className="text-xs absolute top-3 left-1/2 -translate-x-1/2 opacity-40 group-hover:opacity-100">ADD</span>
                 +{p}
               </button>
             ))}
             {match.sport === 'Cricket' && (
                <button 
                  onClick={() => onUpdate(match.id, activeSide, 0, playerName, 'wicket')}
                  className="group relative h-24 bg-red-50 border-2 border-red-600 text-red-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95"
                >
                  <span className="text-[8px] absolute top-3 left-1/2 -translate-x-1/2 opacity-40 group-hover:opacity-100">EVENT</span>
                  Wicket
                </button>
             )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => onUpdate(match.id, activeSide, -1)}
              className="flex-1 py-4 border-2 border-red-500 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {lang === 'en' ? 'Undo Point' : lang === 'kn' ? 'ಅಂಕ ರದ್ದುಮಾಡಿ' : 'अंक पूर्ववत करें'}
            </button>
            <button 
              onClick={() => {
                const otherSide = activeSide === 'A' ? 'B' : 'A';
                setActiveSide(otherSide);
              }}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              {t.switchTeam}
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h4 className="text-[10px] font-black uppercase opacity-40 ml-1">Direct Score Correction</h4>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  type="number" 
                  placeholder="0"
                  value={directScore}
                  onChange={(e) => setDirectScore(e.target.value)}
                  className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-black outline-none focus:border-[#FF6321] transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase opacity-30">SCORE</div>
              </div>
              <button 
                onClick={() => {
                  const val = parseInt(directScore);
                  if (!isNaN(val)) {
                    onSetScore(match.id, activeSide, val);
                    setDirectScore('');
                  }
                }}
                className="px-8 bg-[#141414] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#FF6321] transition-all shadow-lg active:scale-95"
              >
                UPDATE
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h4 className="text-[10px] font-black uppercase opacity-40 ml-1">Player Stats Update (Runs & Wickets)</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Runs"
                    value={playerRuns}
                    onChange={(e) => setPlayerRuns(e.target.value)}
                    className="w-full p-4 pl-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-black outline-none focus:border-[#FF6321] transition-all"
                  />
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Wickets"
                    value={playerWickets}
                    onChange={(e) => setPlayerWickets(e.target.value)}
                    className="w-full p-4 pl-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-black outline-none focus:border-[#FF6321] transition-all"
                  />
                </div>
              </div>
              <button 
                disabled={!playerName}
                onClick={() => {
                  const runs = parseInt(playerRuns) || 0;
                  const wickets = parseInt(playerWickets) || 0;
                  if (playerName) {
                    onSetPlayerStats(match.id, playerName, runs, wickets);
                    setPlayerRuns('');
                    setPlayerWickets('');
                  }
                }}
                className="w-full py-4 bg-[#FF6321] text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:grayscale"
              >
                UPDATE PLAYER STATS
              </button>
              {!playerName && <p className="text-[8px] text-center text-red-500 font-bold uppercase">Select a player from tabs first</p>}
            </div>
          </div>
      </div>

      <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Info className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-tight leading-none text-gray-500">{lang === 'en' ? 'Status Management' : lang === 'kn' ? 'ಸ್ಥಿತಿ ನಿರ್ವಹಣೆ' : 'स्थिति प्रबंधन'}</p>
              <p className="text-[8px] text-gray-400 uppercase font-bold">{lang === 'en' ? 'Configure current match state' : lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಪಂದ್ಯದ ಸ್ಥಿತಿಯನ್ನು ಸಂರಚಿಸಿ' : 'वर्तमान मैच स्थिति को कॉन्फ़िगर करें'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {match.status !== 'finished' && (
              <button 
                onClick={() => onUpdateStatus(match.id, 'finished')}
                className="py-3 bg-white border-2 border-red-500 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                {t.finishMatch}
              </button>
            )}
            {match.status === 'finished' && (
              <button 
                onClick={() => onUpdateStatus(match.id, 'live')}
                className="py-3 bg-[#FF6321] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
              >
                {t.resumeLive}
              </button>
            )}
            <button 
              onClick={onBack}
              className="py-3 bg-[#141414] text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
              {t.back}
            </button>
          </div>
          <div className="pt-2 border-t border-gray-200">
             <p className="text-[8px] text-center text-gray-400 uppercase font-mono tracking-tighter">Match ID: {match.id}</p>
          </div>
      </div>
    </motion.div>
  );
}

// --- Android Deliverable ---
function AndroidDeliverable({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#FF6321]">Native Android Architecture</h2>
        <div className="p-4 bg-[#141414] rounded-2xl text-[10px] font-mono text-green-400 overflow-x-auto">
          <pre>{`// Android Auth Mockup
import com.google.firebase.auth.FirebaseAuth

class AuthManager {
    private val auth = FirebaseAuth.getInstance()

    fun signInAsAdmin(pin: String) {
        // Typically you would use standard Email/Google Auth
        // Or check a custom claim 'isScorer'
        auth.signInWithEmailAndPassword("scorer@gk.com", "pin_1234")
            .addOnSuccessListener {
                // Navigate to Admin Dashboard
            }
    }

    fun signInAnonymously() {
        auth.signInAnonymously() // Viewer access
    }
}

// MainActivity.kt (Architectural Example)
import androidx.compose.runtime.*
import androidx.compose.material3.*

@Composable
fun ScoreboardApp() {
    val viewModel: MatchViewModel = viewModel()
    val matchState by viewModel.currentMatch.collectAsState()

    MaterialTheme(colorScheme = GKColorPalette) {
        Column(modifier = Modifier.padding(16.dp)) {
            ScoreHeader(matchState)
            LiveUpdateSection(matchState)
            CommentaryView(matchState.commentary)
        }
    }
}

// ViewModel handles Firebase RTDB logic
class MatchViewModel : ViewModel() {
    private val db = Firebase.database.reference
    private val _match = MutableStateFlow<Match>(EmptyMatch)
    val currentMatch = _match.asStateFlow()

    fun updateScore(team: String, points: Int) {
        db.child("matches/\${matchId}/\${team}/score")
          .setValue(ServerValue.increment(points))
    }
}`}</pre>
        </div>
        <div className="bg-[#141414] p-6 rounded-3xl space-y-4 text-xs font-mono text-gray-400">
           <h4 className="text-white font-bold uppercase">Firebase Schema (RTDB)</h4>
           <pre>{`{
  "matches": {
    "match_id_001": {
      "sport": "Cricket",
      "status": "live",
      "teamA": { "name": "Warriors", "score": 124 },
      "teamB": { "name": "Strikers", "score": 110 },
      "commentary": "Final over approaching!"
    }
  },
  "players": {
    "uid_1": { "name": "Ramesh", "runs": 450, "mom": 3 }
  }
}`}</pre>
        </div>
        <div className="bg-white p-6 border-2 border-[#141414] rounded-3xl space-y-3">
          <h4 className="font-bold uppercase tracking-tight">Key Setup Steps:</h4>
          <ol className="text-xs space-y-2 list-decimal list-inside font-medium opacity-80">
            <li>Open Android Studio and create "Empty Compose Activity"</li>
            <li>Add <code className="bg-gray-100 px-1">google-services.json</code> to your app module</li>
            <li>Enable Realtime Database in Firebase Console</li>
            <li>Add <code className="bg-gray-100 px-1">com.google.firebase:firebase-database-ktx</code> dependency</li>
            <li>Use <code className="bg-gray-100 px-1">onDataChange</code> listeners for 1-second sync</li>
            <li>Implement Intent for sharing via WhatsApp</li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
}

// --- Match Archive Component ---
function MatchArchive({ matches, onSelectMatch, onBack, t, lang }: { matches: Match[], onSelectMatch: (m: Match) => void, onBack: () => void, t: any, lang: Language }) {
  const [selectedSport, setSelectedSport] = useState<Sport | 'All'>('All');
  const [onlyFinals, setOnlyFinals] = useState(false);

  const filteredMatches = matches.filter(m => {
    const sportMatch = selectedSport === 'All' || m.sport === selectedSport;
    const finalMatch = !onlyFinals || (m.title?.toLowerCase().includes('final'));
    return sportMatch && finalMatch;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });

  const groups: Record<string, Match[]> = {};
  sortedMatches.forEach(m => {
    const d = m.date || 'Unknown Date';
    if (!groups[d]) groups[d] = [];
    groups[d].push(m);
  });
  const dates = Object.keys(groups);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
          <ChevronLeft className="w-4 h-4" /> {t.back}
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
           <Archive className="w-3 h-3" /> {t.archive}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{t.matchArchive}</h2>
          <p className="text-xs text-gray-400 font-mono uppercase tracking-widest leading-none">{lang === 'en' ? 'Browse all tournament results' : lang === 'kn' ? 'ಎಲ್ಲಾ ಟೂರ್ನಮೆಂಟ್ ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಿ' : 'सभी टूर्नामेंट परिणाम देखें'}</p>
        </div>

        <div className="flex gap-2 items-center overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setOnlyFinals(!onlyFinals)}
            className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-1 ${
              onlyFinals ? 'bg-[#FF6321] text-white border-[#FF6321]' : 'bg-white text-gray-400 border-gray-100'
            }`}
          >
            🏆 {onlyFinals ? t.finalsOnly : t.filterFinals}
          </button>
          <div className="w-[2px] h-4 bg-gray-100 shrink-0 mx-1 rounded-full" />
          {['All', 'Cricket', 'Volleyball', 'Kabaddi'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSport(s as any)}
              className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                selectedSport === s ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white text-gray-400 border-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="py-20 text-center space-y-4">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <CalendarDays className="w-8 h-8 text-gray-200" />
           </div>
           <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">{lang === 'en' ? 'No match records found yet' : lang === 'kn' ? 'ಯಾವುದೇ ಪಂದ್ಯದ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' : 'अभी तक कोई मैच रिकॉर्ड नहीं मिला'}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map(date => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[2px] flex-1 bg-gray-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6321]">{date}</span>
                <div className="h-[2px] flex-1 bg-gray-100" />
              </div>

              <div className="grid gap-3">
                {groups[date].map(match => (
                  <div 
                    key={match.id}
                    onClick={() => onSelectMatch(match)}
                    className="p-5 bg-white border border-gray-200 rounded-3xl hover:border-[#141414] transition-all cursor-pointer group shadow-sm hover:shadow-md relative overflow-hidden"
                  >
                     {/* Match Type Badge */}
                     {match.title && (
                       <div className="absolute top-0 right-0 bg-[#141414] text-white text-[7px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                         {match.title}
                       </div>
                     )}

                     <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            match.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 
                            match.status === 'finished' ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-500'
                          }`}>
                            {match.status === 'live' ? t.live : match.status === 'finished' ? t.finished : t.upcoming}
                          </span>
                          <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">{match.sport}</span>
                        </div>
                        <span className="text-[9px] font-mono text-gray-400 uppercase">{match.time}</span>
                     </div>
                     
                     <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                           <TeamLogo logo={match.teamA.logo} name={match.teamA.name} className="w-10 h-10" />
                           <div className="truncate">
                              <p className="text-xs font-bold uppercase truncate">{match.teamA.name}</p>
                              <p className="text-lg font-black tabular-nums">{match.teamA.score}</p>
                           </div>
                        </div>
                        <div className="text-[10px] font-black italic opacity-20">VS</div>
                        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                           <div className="truncate">
                              <p className="text-xs font-bold uppercase truncate">{match.teamB.name}</p>
                              <p className="text-lg font-black tabular-nums">{match.teamB.score}</p>
                           </div>
                           <TeamLogo logo={match.teamB.logo} name={match.teamB.name} className="w-10 h-10" />
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
