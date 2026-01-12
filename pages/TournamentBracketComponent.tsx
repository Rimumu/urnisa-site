import React, { useMemo } from 'react';

export interface TournamentMatch {
    id: string;
    bracketGroup?: string; // 'winners' | 'losers' | 'finals'
    round: number;
    matchIndex: number;
    player1: string | null;
    player2: string | null;
    winner: string | null;
    score: string;
    status: string;
    nextMatchId: string | null;
}

const BracketMatchCard: React.FC<{ match: TournamentMatch }> = ({ match }) => {
    const scoreObj = useMemo(() => {
        if (!match.score) return { p1: '', p2: '', raw: '' };
        const parts = match.score.match(/^(\d+)\s*[-:,\s]\s*(\d+)$/);
        if (parts) return { p1: parts[1], p2: parts[2], raw: '' };
        return { p1: '', p2: '', raw: match.score };
    }, [match.score]);
    const isP1Winner = match.winner === match.player1 && match.winner;
    const isP2Winner = match.winner === match.player2 && match.winner;

    return (
        <div className="relative group w-64 z-10 select-none">
            <div className={`bg-[#120507] border-2 rounded-xl overflow-hidden shadow-xl transition-all duration-300 ${match.status === 'COMPLETED' ? 'border-brand-primary/60 shadow-brand-primary/10' : 'border-white/10'} hover:border-white/30`}>
                <div className="bg-black/40 px-3 py-1.5 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <span>{match.id}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${match.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-500'}`}>{match.status === 'COMPLETED' ? 'Finished' : match.status}</span>
                </div>
                <div className="flex flex-col">
                    <div className={`px-3 py-2.5 flex items-center justify-between border-b border-white/5 ${isP1Winner ? 'bg-brand-primary/10' : ''}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">{match.player1 ? (<img src={`https://mc-heads.net/avatar/${match.player1}/24`} alt="" className="w-5 h-5 rounded-sm shadow-sm" />) : (<div className="w-5 h-5 rounded-sm bg-white/5"></div>)}<span className={`text-sm font-bold truncate ${isP1Winner ? 'text-brand-primary' : 'text-gray-300'}`}>{match.player1 || <span className="text-gray-600 italic">TBD</span>}</span>{scoreObj.p1 && (<span className={`flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/10 text-xs font-bold font-mono shrink-0 shadow-inner ${isP1Winner ? 'text-brand-primary border-brand-primary/30' : 'text-gray-400'}`}>{scoreObj.p1}</span>)}</div>
                        {isP1Winner && <span className="text-sm shrink-0 ml-2">👑</span>}
                    </div>
                    <div className={`px-3 py-2.5 flex items-center justify-between ${isP2Winner ? 'bg-brand-primary/10' : ''}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">{match.player2 ? (<img src={`https://mc-heads.net/avatar/${match.player2}/24`} alt="" className="w-5 h-5 rounded-sm shadow-sm" />) : (<div className="w-5 h-5 rounded-sm bg-white/5"></div>)}<span className={`text-sm font-bold truncate ${isP2Winner ? 'text-brand-primary' : 'text-gray-300'}`}>{match.player2 || <span className="text-gray-600 italic">TBD</span>}</span>{scoreObj.p2 && (<span className={`flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/10 text-xs font-bold font-mono shrink-0 shadow-inner ${isP2Winner ? 'text-brand-primary border-brand-primary/30' : 'text-gray-400'}`}>{scoreObj.p2}</span>)}</div>
                        {isP2Winner && <span className="text-sm shrink-0 ml-2">👑</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Layout Constants
const CARD_HEIGHT = 120;
const VERTICAL_GAP = 20;
const CARD_TOTAL_H = CARD_HEIGHT + VERTICAL_GAP;
const COLUMN_WIDTH = 280;
const COLUMN_GAP = 60;

const getMatchOffsetBinary = (round: number, index: number): number => {
    if (round === 1) return index * CARD_TOTAL_H;
    const prevRound = round - 1;
    const src1 = getMatchOffsetBinary(prevRound, index * 2);
    const src2 = getMatchOffsetBinary(prevRound, index * 2 + 1);
    return (src1 + src2) / 2;
};

export const CustomBracket: React.FC<{ matches: TournamentMatch[], type: string }> = ({ matches, type }) => {
    const winners = useMemo(() => matches.filter(m => m.bracketGroup === 'winners'), [matches]);
    const losers = useMemo(() => matches.filter(m => m.bracketGroup === 'losers'), [matches]);
    const finals = useMemo(() => matches.filter(m => m.bracketGroup === 'finals'), [matches]);

    const organizeByRound = (matchList: TournamentMatch[]) => {
        const grouped: Record<number, TournamentMatch[]> = {};
        matchList.forEach(m => {
            if (!grouped[m.round]) grouped[m.round] = [];
            grouped[m.round].push(m);
        });
        Object.keys(grouped).forEach(r => {
            grouped[Number(r)].sort((a, b) => a.matchIndex - b.matchIndex);
        });
        return grouped;
    };

    const winnerRounds = organizeByRound(winners);
    const loserRounds = organizeByRound(losers);
    const wRoundKeys = Object.keys(winnerRounds).map(Number).sort((a, b) => a - b);
    const lRoundKeys = Object.keys(loserRounds).map(Number).sort((a, b) => a - b);

    return (
        <div className="relative">
            {/* WINNERS BRACKET */}
            <div className="relative">
                {type === 'DOUBLE_ELIMINATION' && (
                    <div className="absolute -top-8 left-0 font-black text-brand-primary uppercase tracking-widest text-lg opacity-80">Upper Bracket</div>
                )}
                <div className="flex">
                    {wRoundKeys.map((round) => {
                        const roundMatches = winnerRounds[round];
                        return (
                            <div key={round} className="flex flex-col relative" style={{ width: `${COLUMN_WIDTH}px`, marginRight: `${COLUMN_GAP}px` }}>
                                <div className="text-center font-black text-brand-primary uppercase tracking-widest mb-6 text-xs sticky top-0 bg-black/50 backdrop-blur-sm py-1 rounded z-30 border border-white/5">
                                    Round {round}
                                </div>
                                <div className="relative h-full">
                                    {roundMatches.map((m) => {
                                        const top = getMatchOffsetBinary(round, m.matchIndex);
                                        return (
                                            <div key={m.id} className="absolute left-0 w-full" style={{ top: `${top}px` }}>
                                                <BracketMatchCard match={m} />
                                                {/* Binary SVG Lines */}
                                                {round < wRoundKeys.length && m.matchIndex % 2 === 0 && (
                                                    <svg className="absolute top-0 left-full overflow-visible pointer-events-none z-0" width={COLUMN_GAP} height="1" style={{ top: '50%' }}>
                                                        <path d={`M 0 0 H ${COLUMN_GAP / 2} V ${getMatchOffsetBinary(round + 1, Math.floor(m.matchIndex / 2)) - top} H ${COLUMN_GAP}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                                                    </svg>
                                                )}
                                                {round < wRoundKeys.length && m.matchIndex % 2 !== 0 && (
                                                    <svg className="absolute top-0 left-full overflow-visible pointer-events-none z-0" width={COLUMN_GAP} height="1" style={{ top: '50%' }}>
                                                        <path d={`M 0 0 H ${COLUMN_GAP / 2} V ${getMatchOffsetBinary(round + 1, Math.floor(m.matchIndex / 2)) - top} H ${COLUMN_GAP}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                                                    </svg>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* LOSERS BRACKET */}
            {type === 'DOUBLE_ELIMINATION' && losers.length > 0 && (
                <div className="relative mt-12 pt-12 border-t border-white/5">
                    <div className="absolute -top-8 left-0 font-black text-red-500 uppercase tracking-widest text-lg opacity-80">Losers Bracket</div>
                    <div className="flex">
                        {lRoundKeys.map((round) => {
                            const roundMatches = loserRounds[round];
                            return (
                                <div key={`L-${round}`} className="flex flex-col relative" style={{ width: `${COLUMN_WIDTH}px`, marginRight: `${COLUMN_GAP}px` }}>
                                    <div className="text-center font-black text-red-500 uppercase tracking-widest mb-6 text-xs sticky top-0 bg-black/50 backdrop-blur-sm py-1 rounded z-30 border border-white/5">
                                        L-Round {round}
                                    </div>
                                    <div className="relative h-full">
                                        {roundMatches.map((m, idx) => {
                                            const top = idx * CARD_TOTAL_H;
                                            let lineSvg = null;
                                            if (m.nextMatchId) {
                                                const targetMatch = losers.find(lm => lm.id === m.nextMatchId);
                                                if (targetMatch) {
                                                    const targetIdx = loserRounds[targetMatch.round].findIndex(tm => tm.id === targetMatch.id);
                                                    const targetTop = targetIdx * CARD_TOTAL_H;
                                                    const diffY = targetTop - top;
                                                    const roundDiff = targetMatch.round - round;
                                                    const width = (roundDiff * (COLUMN_WIDTH + COLUMN_GAP)) - COLUMN_WIDTH;
                                                    lineSvg = (<svg className="absolute top-0 left-full overflow-visible pointer-events-none z-0" width={width} height="1" style={{ top: '50%' }}><path d={`M 0 0 C ${width / 2} 0, ${width / 2} ${diffY}, ${width} ${diffY}`} fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="2" /></svg>);
                                                }
                                            }
                                            return (
                                                <div key={m.id} className="absolute left-0 w-full" style={{ top: `${top}px` }}>
                                                    <BracketMatchCard match={m} />
                                                    {lineSvg}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* FINALS */}
            {finals.length > 0 && (
                <div className="absolute top-0 right-0 flex flex-col justify-center h-full pl-20 border-l border-white/5" style={{ left: `${(wRoundKeys.length) * (COLUMN_WIDTH + COLUMN_GAP)}px` }}>
                    <div className="font-black text-yellow-400 uppercase tracking-widest mb-6 text-xl text-center">Grand Finals</div>
                    {finals.map(m => (
                        <div key={m.id} className="mb-4">
                            <BracketMatchCard match={m} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomBracket;
