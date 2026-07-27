import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import { useNisaballs } from '../hooks/useNisaballs';
import { DISCORD_API_URL } from '../constants';
import { MinecraftHatRenderer } from '../src/components/MinecraftHatRenderer';
import { MINECRAFT_HATS, MinecraftModelElement } from '../src/utils/minecraftModelData';
import availableHats from '../src/utils/availableHats.json';
import { ArrowLeft, Sparkles, Coins, Gift, AlertCircle, RefreshCw, CheckCircle2, Clock, ShoppingBag, Layers, Search, Filter, Package } from 'lucide-react';

import baseSetPackImg from '../src/assets/images/base_set_pack_1784874099886.jpg';
import teamRocketPackImg from '../src/assets/images/team_rocket_pack_1784874174883.jpg';
import gymChallengePackImg from '../src/assets/images/gym_challenge_single_pack_1784876024393.jpg';
import roaringSkiesPackImg from '../src/assets/images/roaring_skies_pack_1784875229495.jpg';
import teamUpPackImg from '../src/assets/images/team_up_pack_1784875241981.jpg';
import unbrokenBoundsPackImg from '../src/assets/images/unbroken_bounds_pack_1784875254553.jpg';
import unifiedMindsPackImg from '../src/assets/images/unified_minds_pack_1784875264871.jpg';
import hiddenFatesPackImg from '../src/assets/images/hidden_fates_pack_1784875274875.jpg';
import evolvingSkiesPackImg from '../src/assets/images/evolving_skies_pack_1784874116241.jpg';
import brilliantStarsPackImg from '../src/assets/images/brilliant_stars_pack_1784875283879.jpg';
import astralRadiancePackImg from '../src/assets/images/astral_radiance_pack_1784875296931.jpg';
import lostOriginPackImg from '../src/assets/images/lost_origin_pack_1784875310763.jpg';
import silverTempestPackImg from '../src/assets/images/silver_tempest_pack_1784875319809.jpg';
import crownZenithPackImg from '../src/assets/images/crown_zenith_pack_1784874141514.jpg';
import paldeaEvolvedPackImg from '../src/assets/images/paldea_evolved_pack_1784875329996.jpg';
import mew151PackImg from '../src/assets/images/mew_151_pack_1784874131820.jpg';
import paradoxRiftPackImg from '../src/assets/images/paradox_rift_pack_1784875340469.jpg';
import paldeanFatesPackImg from '../src/assets/images/paldean_fates_pack_1784875356437.jpg';
import temporalForcesPackImg from '../src/assets/images/temporal_forces_pack_1784875370472.jpg';
import surgingSparksPackImg from '../src/assets/images/surging_sparks_pack_1784874150813.jpg';
import prismaticEvolutionsPackImg from '../src/assets/images/prismatic_evolutions_pack_1784874163704.jpg';
import journeyTogetherPackImg from '../src/assets/images/journey_together_pack_1784875381857.jpg';
import destinedRivalsPackImg from '../src/assets/images/destined_rivals_pack_1784875392756.jpg';
import blackBoltPackImg from '../src/assets/images/black_bolt_pack_1784875406441.jpg';
import whiteFlarePackImg from '../src/assets/images/white_flare_pack_1784875415823.jpg';
import megaEvolutionPackImg from '../src/assets/images/mega_evolution_pack_1784875426288.jpg';
import phantasmalFlamesPackImg from '../src/assets/images/phantasmal_flames_pack_1784875437666.jpg';
import ascendedHeroesPackImg from '../src/assets/images/ascended_heroes_pack_1784875452124.jpg';

const HatSVG: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Cowboy Hat Brim */}
    <path d="M2 17c3-2 15-2 20 0c-3 2-17 2-20 0z" fill="currentColor" fillOpacity="0.1" />
    {/* Cowboy Hat Crown with pinched top */}
    <path d="M5.5 16V13c0-3.5 2.5-5 6.5-3.5c4-1.5 6.5 0 6.5 3.5v3" />
    {/* Hat Band / Ribbon */}
    <path d="M5.5 14.5c3.5 1 9.5 1 13 0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const PackSVG: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Card pack foil wrap */}
    <rect x="5" y="3" width="14" height="18" rx="1" fill="currentColor" fillOpacity="0.1" />
    
    {/* Top crimped seal (zig-zag edge) */}
    <path d="M5 3.5l1.75 1.5l1.75-1.5l1.75 1.5l1.75-1.5l1.75 1.5l1.75-1.5L19 3.5" />
    <line x1="5" y1="5" x2="19" y2="5" />

    {/* Bottom crimped seal (zig-zag edge) */}
    <path d="M5 20.5l1.75-1.5l1.75 1.5l1.75-1.5l1.75 1.5l1.75-1.5l1.75 1.5l1.75-1.5" />
    <line x1="5" y1="19" x2="19" y2="19" />

    {/* Pokeball badge design in center */}
    <circle cx="12" cy="12" r="3.5" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

const LambKeySVG: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="#92400e" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
        <circle cx="16.5" cy="7.5" r="1.5" fill="#fcd34d" stroke="none" />
    </svg>
);

const WagyuKeySVG: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="url(#wagyuKeyGradShop)" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="wagyuKeyGradShop" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7a2034"/>
                <stop offset="50%" stopColor="#fb7185"/>
                <stop offset="100%" stopColor="#9f1239"/>
            </linearGradient>
        </defs>
        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
        <circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" stroke="none" />
    </svg>
);

const LambCrateSVG: React.FC<{ stage?: string; selectedCrate?: string | null }> = ({ stage = 'selection', selectedCrate = null }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(146,64,14,0.6)] relative z-10">
    <defs>
        <linearGradient id="lambCrateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350f"/>
            <stop offset="100%" stopColor="#451a03"/>
        </linearGradient>
        <linearGradient id="lambLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b45309"/>
            <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
        <linearGradient id="lambLockPlateGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="50%" stopColor="#b45309"/>
            <stop offset="100%" stopColor="#451a03"/>
        </linearGradient>
    </defs>
    
    <g>
        {/* Main Box */}
        <rect x="10" y="35" width="130" height="55" rx="4" fill="url(#lambCrateGrad)" stroke="#020617" strokeWidth="2"/>
        {/* Case Details / Texture */}
        <path d="M15 45 L135 45 M15 60 L135 60 M15 75 L135 75" stroke="#000" strokeWidth="1" opacity="0.3"/>
        {/* Vertical Straps */}
        <rect x="35" y="35" width="16" height="55" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        <rect x="99" y="35" width="16" height="55" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        {/* Horizontal Strap */}
        <rect x="10" y="60" width="130" height="12" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        {/* Rivets */}
        <circle cx="43" cy="40" r="2" fill="#d97706"/>
        <circle cx="43" cy="66" r="2" fill="#d97706"/>
        <circle cx="43" cy="83" r="2" fill="#d97706"/>
        <circle cx="107" cy="40" r="2" fill="#d97706"/>
        <circle cx="107" cy="66" r="2" fill="#d97706"/>
        <circle cx="107" cy="83" r="2" fill="#d97706"/>
    </g>

    {/* Lid Group */}
    <g className={stage === 'pre_opening' && selectedCrate === 'lamb' ? 'lid-opening' : ''} style={{ transformOrigin: '75px 25px' }}>
        {/* Top Lid Angle */}
        <path d="M10 35 L25 15 L125 15 L140 35 Z" fill="url(#lambLidGrad)" stroke="#020617" strokeWidth="2"/>
        {/* Vertical Straps (Lid Part) */}
        <rect x="35" y="15" width="16" height="20" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        <rect x="99" y="15" width="16" height="20" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        {/* Lid Rivets */}
        <circle cx="43" cy="22" r="2" fill="#d97706"/>
        <circle cx="107" cy="22" r="2" fill="#d97706"/>
    </g>

    {/* Lock / Keyhole Area */}
    <g className={stage === 'pre_opening' && selectedCrate === 'lamb' ? 'lock-popping' : ''} style={{ transformOrigin: '75px 67px' }}>
        {/* Outer Heavy Lock Plate */}
        <rect x="56" y="50" width="38" height="34" rx="6" fill="url(#lambLockPlateGrad)" stroke="#09090b" strokeWidth="2"/>
        <rect x="58" y="52" width="34" height="30" rx="4" fill="none" stroke="#fcd34d" strokeWidth="0.8" opacity="0.6"/>
        
        {/* Lock Plate Screws */}
        <circle cx="60" cy="54" r="1.3" fill="#1e1b18" stroke="#d97706" strokeWidth="0.5"/>
        <circle cx="90" cy="54" r="1.3" fill="#1e1b18" stroke="#d97706" strokeWidth="0.5"/>
        <circle cx="60" cy="80" r="1.3" fill="#1e1b18" stroke="#d97706" strokeWidth="0.5"/>
        <circle cx="90" cy="80" r="1.3" fill="#1e1b18" stroke="#d97706" strokeWidth="0.5"/>

        {/* Circular Keyhole Escutcheon */}
        <circle cx="75" cy="67" r="11" fill="#180e05" stroke="#f59e0b" strokeWidth="1.5"/>

        {/* Keyhole Cutout */}
        <path d="M75 61.5 a3.5 3.5 0 0 1 2.5 6 L78 72.5 H72 L72.5 67.5 A3.5 3.5 0 0 1 75 61.5 Z" fill="#020617" stroke="#451a03" strokeWidth="0.8"/>
        {/* Inner Void */}
        <path d="M75 62.5 a2.5 2.5 0 0 1 1.8 4.2 L77.2 71.5 H72.8 L73.2 66.7 A2.5 2.5 0 0 1 75 62.5 Z" fill="#000000"/>
    </g>
</svg>
);

const WagyuCrateSVG: React.FC<{ stage?: string; selectedCrate?: string | null }> = ({ stage = 'selection', selectedCrate = null }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(251,191,36,0.4)] relative z-10">
    <defs>
        <linearGradient id="wagyuCrateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a2034"/>
            <stop offset="100%" stopColor="#421019"/>
        </linearGradient>
        <linearGradient id="wagyuLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d7485c"/>
            <stop offset="50%" stopColor="#e37b88"/>
            <stop offset="100%" stopColor="#7a2034"/>
        </linearGradient>
        <linearGradient id="wagyuLockPlateGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a"/>
            <stop offset="35%" stopColor="#fb7185"/>
            <stop offset="70%" stopColor="#9f1239"/>
            <stop offset="100%" stopColor="#4c0519"/>
        </linearGradient>
    </defs>
    
    <g>
        {/* Main Box */}
        <rect x="10" y="35" width="130" height="55" rx="4" fill="url(#wagyuCrateGrad)" stroke="#020617" strokeWidth="2"/>
        {/* Case Details / Texture */}
        <path d="M15 45 L135 45 M15 60 L135 60 M15 75 L135 75" stroke="#000" strokeWidth="1" opacity="0.3"/>
        {/* Vertical Straps */}
        <rect x="35" y="35" width="16" height="55" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        <rect x="99" y="35" width="16" height="55" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        {/* Horizontal Strap */}
        <rect x="10" y="60" width="130" height="12" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        {/* Rivets */}
        <circle cx="43" cy="40" r="2" fill="#fbbf24"/>
        <circle cx="43" cy="66" r="2" fill="#fbbf24"/>
        <circle cx="43" cy="83" r="2" fill="#fbbf24"/>
        <circle cx="107" cy="40" r="2" fill="#fbbf24"/>
        <circle cx="107" cy="66" r="2" fill="#fbbf24"/>
        <circle cx="107" cy="83" r="2" fill="#fbbf24"/>
    </g>

    {/* Lid Group */}
    <g className={stage === 'pre_opening' && selectedCrate === 'wagyu' ? 'lid-opening' : ''} style={{ transformOrigin: '75px 25px' }}>
        {/* Top Lid Angle */}
        <path d="M10 35 L25 15 L125 15 L140 35 Z" fill="url(#wagyuLidGrad)" stroke="#020617" strokeWidth="2"/>
        {/* Vertical Straps (Lid Part) */}
        <rect x="35" y="15" width="16" height="20" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        <rect x="99" y="15" width="16" height="20" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        {/* Lid Rivets */}
        <circle cx="43" cy="22" r="2" fill="#fbbf24"/>
        <circle cx="107" cy="22" r="2" fill="#fbbf24"/>
    </g>

    {/* Lock / Keyhole Area */}
    <g className={stage === 'pre_opening' && selectedCrate === 'wagyu' ? 'lock-popping' : ''} style={{ transformOrigin: '75px 67px' }}>
        {/* Outer Heavy Lock Plate */}
        <rect x="56" y="50" width="38" height="34" rx="6" fill="url(#wagyuLockPlateGrad)" stroke="#09090b" strokeWidth="2"/>
        <rect x="58" y="52" width="34" height="30" rx="4" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.6"/>
        
        {/* Lock Plate Screws */}
        <circle cx="60" cy="54" r="1.3" fill="#1c0a10" stroke="#fbbf24" strokeWidth="0.5"/>
        <circle cx="90" cy="54" r="1.3" fill="#1c0a10" stroke="#fbbf24" strokeWidth="0.5"/>
        <circle cx="60" cy="80" r="1.3" fill="#1c0a10" stroke="#fbbf24" strokeWidth="0.5"/>
        <circle cx="90" cy="80" r="1.3" fill="#1c0a10" stroke="#fbbf24" strokeWidth="0.5"/>

        {/* Circular Keyhole Escutcheon */}
        <circle cx="75" cy="67" r="11" fill="#1c0a10" stroke="#fb7185" strokeWidth="1.5"/>

        {/* Keyhole Cutout */}
        <path d="M75 61.5 a3.5 3.5 0 0 1 2.5 6 L78 72.5 H72 L72.5 67.5 A3.5 3.5 0 0 1 75 61.5 Z" fill="#020617" stroke="#9f1239" strokeWidth="0.8"/>
        {/* Inner Void */}
        <path d="M75 62.5 a2.5 2.5 0 0 1 1.8 4.2 L77.2 71.5 H72.8 L73.2 66.7 A2.5 2.5 0 0 1 75 62.5 Z" fill="#000000"/>
    </g>
</svg>
);

const DAILY_ROTATING_ITEMS = [
  {
    id: 'item-1',
    modelId: 'cowboy',
    name: 'Cowboy Hat',
    category: 'Simple Hats Cosmetic',
    rarity: 'RARE',
    rarityColor: 'from-blue-500/20 to-indigo-600/30 text-blue-300 border-blue-500/40',
    price: 45,
    bgGradient: 'from-amber-950/40 via-zinc-900 to-black',
    glowColor: 'bg-amber-500/20',
    icon: '🤠',
  },
  {
    id: 'item-2',
    modelId: 'crown',
    name: 'Royal Crown',
    category: 'Regal Cosmetic',
    rarity: 'LEGENDARY',
    rarityColor: 'from-rose-500/20 to-red-600/30 text-rose-300 border-rose-500/40',
    price: 150,
    bgGradient: 'from-rose-950/40 via-zinc-900 to-black',
    glowColor: 'bg-rose-500/20',
    icon: '👑',
  },
  {
    id: 'item-3',
    modelId: 'slime',
    name: 'Slime Hat',
    category: 'Animated Cosmetic',
    rarity: 'EXCLUSIVE',
    rarityColor: 'from-amber-500/20 to-orange-600/30 text-amber-300 border-amber-500/40',
    price: 95,
    bgGradient: 'from-emerald-950/40 via-zinc-900 to-black',
    glowColor: 'bg-emerald-500/20',
    icon: '🟢',
  },
  {
    id: 'item-4',
    modelId: 'chef',
    name: 'Chef Hat',
    category: 'Culinary Cosmetic',
    rarity: 'DELUXE',
    rarityColor: 'from-yellow-500/20 to-amber-600/30 text-yellow-300 border-yellow-500/40',
    price: 60,
    bgGradient: 'from-yellow-950/40 via-zinc-900 to-black',
    glowColor: 'bg-zinc-400/20',
    icon: '👨‍🍳',
  },
];

export interface TCGPackItem {
  id: string;
  year: number;
  name: string;
  series: string;
  cardCount: number;
  price: number;
  badgeColor: string;
  gradient: string;
  featuredPokemon: string;
  coverImage: string;
  // Optional crop configuration for multi-pack image strips
  cropScale?: number; // Zoom level (e.g., 3 for 3-pack or 4 for 4-pack horizontal strips)
  cropPosition?: string; // CSS object-position (e.g. '0% 50%' for leftmost pack, '50% 50%' for middle, '100% 50%' for right)
}

const TCG_SERIES_OPTIONS = ['All', 'Classic', 'XY', 'Sun & Moon', 'Sword & Shield', 'Scarlet & Violet', 'Mega Evolution'];

export const TCG_PACKS: TCGPackItem[] = [
  { id: 'tcg-1', year: 1999, name: 'Base Set', series: 'Classic', cardCount: 102, price: 1, badgeColor: 'from-amber-500/30 to-yellow-600/30 text-amber-300 border-amber-500/50', gradient: 'from-amber-950/60 via-amber-900/20 to-zinc-950', featuredPokemon: 'Charizard', coverImage: baseSetPackImg },
  { id: 'tcg-2', year: 2000, name: 'Team Rocket', series: 'Classic', cardCount: 83, price: 1, badgeColor: 'from-zinc-600/30 to-zinc-800/30 text-zinc-300 border-zinc-500/50', gradient: 'from-zinc-900/80 via-zinc-950 to-black', featuredPokemon: 'Dark Charizard', coverImage: teamRocketPackImg },
  { id: 'tcg-3', year: 2000, name: 'Gym Challenge', series: 'Classic', cardCount: 132, price: 1, badgeColor: 'from-emerald-600/30 to-teal-800/30 text-emerald-300 border-emerald-500/50', gradient: 'from-emerald-950/60 via-zinc-900 to-black', featuredPokemon: 'Blaine & Sabrina', coverImage: gymChallengePackImg },
  { id: 'tcg-4', year: 2015, name: 'XY-Roaring Skies', series: 'XY', cardCount: 112, price: 1, badgeColor: 'from-sky-500/30 to-blue-600/30 text-sky-300 border-sky-500/50', gradient: 'from-sky-950/60 via-zinc-900 to-black', featuredPokemon: 'Mega Rayquaza', coverImage: roaringSkiesPackImg },
  { id: 'tcg-5', year: 2019, name: 'Sun & Moon-Team Up', series: 'Sun & Moon', cardCount: 196, price: 1, badgeColor: 'from-yellow-500/30 to-amber-600/30 text-yellow-300 border-yellow-500/50', gradient: 'from-amber-950/50 via-zinc-900 to-black', featuredPokemon: 'Pikachu & Zekrom', coverImage: teamUpPackImg },
  { id: 'tcg-6', year: 2019, name: 'Sun & Moon-Unbroken Bounds', series: 'Sun & Moon', cardCount: 238, price: 1, badgeColor: 'from-orange-500/30 to-red-600/30 text-orange-300 border-orange-500/50', gradient: 'from-red-950/50 via-zinc-900 to-black', featuredPokemon: 'Reshiram & Charizard', coverImage: unbrokenBoundsPackImg },
  { id: 'tcg-7', year: 2019, name: 'Sun & Moon-Unified Minds', series: 'Sun & Moon', cardCount: 260, price: 1, badgeColor: 'from-indigo-500/30 to-purple-600/30 text-indigo-300 border-indigo-500/50', gradient: 'from-indigo-950/50 via-zinc-900 to-black', featuredPokemon: 'Mewtwo & Mew', coverImage: unifiedMindsPackImg },
  { id: 'tcg-8', year: 2019, name: 'Sun & Moon-Hidden Fates', series: 'Sun & Moon', cardCount: 163, price: 1, badgeColor: 'from-purple-500/30 to-pink-600/30 text-purple-300 border-purple-500/50', gradient: 'from-purple-950/60 via-zinc-900 to-black', featuredPokemon: 'Shiny Charizard GX', coverImage: hiddenFatesPackImg },
  { id: 'tcg-9', year: 2021, name: 'Sword & Shield-Evolving Skies', series: 'Sword & Shield', cardCount: 237, price: 2, badgeColor: 'from-teal-500/30 to-cyan-600/30 text-teal-300 border-teal-500/50', gradient: 'from-teal-950/60 via-zinc-900 to-black', featuredPokemon: 'Rayquaza VMAX', coverImage: evolvingSkiesPackImg },
  { id: 'tcg-10', year: 2022, name: 'Sword & Shield-Brilliant Stars', series: 'Sword & Shield', cardCount: 216, price: 1, badgeColor: 'from-amber-400/30 to-yellow-600/30 text-amber-200 border-amber-400/50', gradient: 'from-amber-950/50 via-zinc-900 to-black', featuredPokemon: 'Arceus VSTAR', coverImage: brilliantStarsPackImg },
  { id: 'tcg-11', year: 2022, name: 'Sword & Shield-Astral Radiance', series: 'Sword & Shield', cardCount: 246, price: 1, badgeColor: 'from-blue-500/30 to-cyan-600/30 text-blue-300 border-blue-500/50', gradient: 'from-blue-950/50 via-zinc-900 to-black', featuredPokemon: 'Origin Palkia VSTAR', coverImage: astralRadiancePackImg },
  { id: 'tcg-12', year: 2022, name: 'Sword & Shield-Lost Origin', series: 'Sword & Shield', cardCount: 247, price: 1, badgeColor: 'from-violet-500/30 to-purple-700/30 text-violet-300 border-violet-500/50', gradient: 'from-violet-950/60 via-zinc-900 to-black', featuredPokemon: 'Giratina VSTAR', coverImage: lostOriginPackImg },
  { id: 'tcg-13', year: 2022, name: 'Sword & Shield-Silver Tempest', series: 'Sword & Shield', cardCount: 245, price: 1, badgeColor: 'from-slate-400/30 to-zinc-600/30 text-slate-200 border-slate-400/50', gradient: 'from-slate-900/80 via-zinc-950 to-black', featuredPokemon: 'Lugia VSTAR', coverImage: silverTempestPackImg },
  { id: 'tcg-14', year: 2023, name: 'Sword & Shield-Crown Zenith', series: 'Sword & Shield', cardCount: 230, price: 1, badgeColor: 'from-yellow-400/30 to-amber-600/30 text-amber-200 border-yellow-400/50', gradient: 'from-amber-950/60 via-zinc-900 to-black', featuredPokemon: 'Lucario VSTAR', coverImage: crownZenithPackImg },
  { id: 'tcg-15', year: 2023, name: 'Scarlet & Violet-Paldea Evolved', series: 'Scarlet & Violet', cardCount: 280, price: 1, badgeColor: 'from-rose-500/30 to-red-600/30 text-rose-300 border-rose-500/50', gradient: 'from-rose-950/50 via-zinc-900 to-black', featuredPokemon: 'Meowscarada', coverImage: paldeaEvolvedPackImg },
  { id: 'tcg-16', year: 2023, name: 'Scarlet & Violet-Mew 151', series: 'Scarlet & Violet', cardCount: 210, price: 2, badgeColor: 'from-pink-500/30 to-rose-600/30 text-pink-300 border-pink-500/50', gradient: 'from-pink-950/60 via-zinc-900 to-black', featuredPokemon: 'Mew 151', coverImage: mew151PackImg },
  { id: 'tcg-17', year: 2024, name: 'Scarlet & Violet Paradox Rift', series: 'Scarlet & Violet', cardCount: 268, price: 1, badgeColor: 'from-cyan-500/30 to-blue-600/30 text-cyan-300 border-cyan-500/50', gradient: 'from-cyan-950/50 via-zinc-900 to-black', featuredPokemon: 'Roaring Moon ex', coverImage: paradoxRiftPackImg },
  { id: 'tcg-18', year: 2024, name: 'Scarlet & Violet-Paldean Fates', series: 'Scarlet & Violet', cardCount: 246, price: 1, badgeColor: 'from-fuchsia-500/30 to-pink-600/30 text-fuchsia-300 border-fuchsia-500/50', gradient: 'from-fuchsia-950/60 via-zinc-900 to-black', featuredPokemon: 'Shiny Pikachu', coverImage: paldeanFatesPackImg },
  { id: 'tcg-19', year: 2024, name: 'Scarlet & Violet Temporal Forces', series: 'Scarlet & Violet', cardCount: 220, price: 1, badgeColor: 'from-emerald-500/30 to-teal-600/30 text-emerald-300 border-emerald-500/50', gradient: 'from-emerald-950/50 via-zinc-900 to-black', featuredPokemon: 'Walking Wake ex', coverImage: temporalForcesPackImg },
  { id: 'tcg-20', year: 2024, name: 'Scarlet & Violet-Surging Sparks', series: 'Scarlet & Violet', cardCount: 253, price: 1, badgeColor: 'from-amber-400/30 to-yellow-500/30 text-yellow-300 border-yellow-400/50', gradient: 'from-yellow-950/50 via-zinc-900 to-black', featuredPokemon: 'Pikachu ex Stellar', coverImage: surgingSparksPackImg },
  { id: 'tcg-21', year: 2025, name: 'Scarlet & Violet-Prismatic Evolutions', series: 'Scarlet & Violet', cardCount: 182, price: 1, badgeColor: 'from-indigo-400/30 via-pink-400/30 to-amber-400/30 text-pink-200 border-pink-400/50', gradient: 'from-pink-950/60 via-indigo-950/40 to-black', featuredPokemon: 'Eeveelutions', coverImage: prismaticEvolutionsPackImg },
  { id: 'tcg-22', year: 2025, name: 'Scarlet & Violet Journey Together', series: 'Scarlet & Violet', cardCount: 191, price: 1, badgeColor: 'from-sky-400/30 to-indigo-500/30 text-sky-200 border-sky-400/50', gradient: 'from-sky-950/50 via-zinc-900 to-black', featuredPokemon: 'Lillie & N Partner', coverImage: journeyTogetherPackImg },
  { id: 'tcg-23', year: 2025, name: 'Scarlet & Violet-Destined Rivals', series: 'Scarlet & Violet', cardCount: 245, price: 1, badgeColor: 'from-red-600/30 to-purple-700/30 text-red-300 border-red-500/50', gradient: 'from-red-950/60 via-zinc-900 to-black', featuredPokemon: 'Team Rocket Rivals', coverImage: destinedRivalsPackImg },
  { id: 'tcg-24', year: 2025, name: 'Scarlet & Violet Black Bolt', series: 'Scarlet & Violet', cardCount: 173, price: 1, badgeColor: 'from-zinc-700/50 to-black text-zinc-200 border-zinc-600/50', gradient: 'from-zinc-900 via-zinc-950 to-black', featuredPokemon: 'Black Kyurem', coverImage: blackBoltPackImg },
  { id: 'tcg-25', year: 2025, name: 'Scarlet & Violet White Flare', series: 'Scarlet & Violet', cardCount: 174, price: 1, badgeColor: 'from-orange-400/30 to-amber-200/30 text-amber-200 border-amber-300/50', gradient: 'from-amber-950/40 via-zinc-900 to-black', featuredPokemon: 'White Kyurem', coverImage: whiteFlarePackImg },
  { id: 'tcg-26', year: 2025, name: 'Mega Evolution', series: 'Mega Evolution', cardCount: 190, price: 1, badgeColor: 'from-purple-500/30 to-pink-600/30 text-purple-200 border-purple-400/50', gradient: 'from-purple-950/60 via-zinc-900 to-black', featuredPokemon: 'Mega Lucario', coverImage: megaEvolutionPackImg },
  { id: 'tcg-27', year: 2025, name: 'Mega Evolution-Phantasmal Flames', series: 'Mega Evolution', cardCount: 133, price: 1, badgeColor: 'from-rose-600/30 to-orange-600/30 text-rose-200 border-rose-500/50', gradient: 'from-rose-950/60 via-zinc-900 to-black', featuredPokemon: 'Mega Charizard X', coverImage: phantasmalFlamesPackImg },
  { id: 'tcg-28', year: 2026, name: 'Mega Evolution-Ascended Heroes', series: 'Mega Evolution', cardCount: 296, price: 1, badgeColor: 'from-amber-400/30 via-emerald-400/30 to-cyan-400/30 text-amber-200 border-amber-400/50', gradient: 'from-amber-950/60 via-zinc-900 to-black', featuredPokemon: 'Mega Rayquaza', coverImage: ascendedHeroesPackImg },
];

const Shop: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('urnisa_mc_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return null;
  });

  const { balance: nisaballBalance, refetch, loading: balanceLoading } = useNisaballs(
    user?.twitchUsername || undefined
  );

  // Wheel Spin states
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<'lamb' | 'wagyu' | null>(null);
  const [showResultBanner, setShowResultBanner] = useState(false);
  const [spinError, setSpinError] = useState('');
  const [spinningSound, setSpinningSound] = useState(false);

  // TCG Shop states
  const [tcgSearch, setTcgSearch] = useState('');
  const [tcgSeriesFilter, setTcgSeriesFilter] = useState('All');

  // 3D Hat Preview states
  const [selectedHatId, setSelectedHatId] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(0.65);
  const [previewDyeColor, setPreviewDyeColor] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<{ status: 'success' | 'error', message: string, itemName?: string } | null>(null);
  const [purchaseConfirmationItem, setPurchaseConfirmationItem] = useState<any>(null);

  const [timeRemaining, setTimeRemaining] = useState<string>('24H 00M 00S');

  // Helper for generating card details depending on rarity
  const getHatVisuals = (rarity: string) => {
    switch (rarity) {
      case 'RARE':
        return {
          bgGradient: 'from-blue-950/40 via-zinc-900 to-black',
          glowColor: 'bg-blue-500/20'
        };
      case 'DELUXE':
        return {
          bgGradient: 'from-yellow-950/40 via-zinc-900 to-black',
          glowColor: 'bg-amber-500/20'
        };
      case 'LEGENDARY':
        return {
          bgGradient: 'from-rose-950/40 via-zinc-900 to-black',
          glowColor: 'bg-rose-500/20'
        };
      case 'EXCLUSIVE':
        return {
          bgGradient: 'from-purple-950/40 via-zinc-900 to-black',
          glowColor: 'bg-purple-500/20'
        };
      case 'ULTRA':
        return {
          bgGradient: 'from-teal-950/40 via-zinc-900 to-black',
          glowColor: 'bg-teal-500/20'
        };
      default:
        return {
          bgGradient: 'from-zinc-900 via-zinc-950 to-black',
          glowColor: 'bg-zinc-500/10'
        };
    }
  };

  const AUTHENTIC_HAT_OVERRIDES: { [key: string]: { name: string; dyeable?: boolean } } = {
    "amalgalichhat": { name: "Amalgalich", dyeable: false },
    "angrymask": { name: "Tribal Mask", dyeable: false },
    "antlers": { name: "Antlers", dyeable: false },
    "apple": { name: "Apple", dyeable: false },
    "artsy": { name: "Artsy", dyeable: true },
    "babydolphin": { name: "Baby Dolphin", dyeable: false },
    "babyturtle": { name: "Baby Turtle", dyeable: false },
    "bandana": { name: "Bandana", dyeable: true },
    "bandanargb": { name: "RGB Bandana", dyeable: false },
    "baseballeaster": { name: "Easter Baseball Cap", dyeable: true },
    "baseballhat": { name: "Baseball Cap", dyeable: true },
    "baseballhatfestive": { name: "Festive Baseball Cap", dyeable: false },
    "baseballhatjuly": { name: "Summer Baseball Cap", dyeable: false },
    "baseballhatrgb": { name: "RGB Baseball Cap", dyeable: false },
    "batwinghat": { name: "Bat Wing Hat", dyeable: false },
    "beanie": { name: "Beanie", dyeable: true },
    "beanieeaster": { name: "Easter Beanie", dyeable: true },
    "beaniefestive": { name: "Festive Beanie", dyeable: false },
    "beaniejuly": { name: "Summer Beanie", dyeable: false },
    "beaniergb": { name: "RGB Beanie", dyeable: false },
    "beaniespooky": { name: "Halloween Beanie", dyeable: false },
    "beehat": { name: "Bee Hat", dyeable: false },
    "bicorne": { name: "Bicorne", dyeable: false },
    "bigbrain": { name: "Big Brain", dyeable: false },
    "bigcrown": { name: "Big Crown", dyeable: false },
    "bigeyes": { name: "Big Eyes", dyeable: false },
    "bigribbon": { name: "Big Ribbon", dyeable: true },
    "bigstevehead": { name: "Mascot Head", dyeable: false },
    "bluefireeye": { name: "Skeleton Eye", dyeable: false },
    "bowler": { name: "Bowler Cap", dyeable: true },
    "breadhat": { name: "Bread on Head", dyeable: false },
    "brownbrick": { name: "Brick on Head", dyeable: false },
    "bunnyhat": { name: "Bunny Hat", dyeable: true },
    "burgerhat": { name: "Burger", dyeable: false },
    "caddycap": { name: "Caddy Cap", dyeable: true },
    "camera": { name: "Camera Head", dyeable: false },
    "camerabeard": { name: "Camera Beard", dyeable: false },
    "candleonhead": { name: "Candle", dyeable: false },
    "candycane": { name: "Candy Cane", dyeable: false },
    "carrotonstick": { name: "Carrot on a Stick", dyeable: false },
    "cartoonegg": { name: "Cartoon Egg", dyeable: false },
    "cheeseslice": { name: "Cheese Slice", dyeable: false },
    "chefshat": { name: "Chef's Hat", dyeable: false },
    "chickenhead": { name: "Chicken Head", dyeable: false },
    "chickenonhead": { name: "Chicken on Head", dyeable: false },
    "christmascakehat": { name: "Fruit Cake", dyeable: false },
    "christmastree": { name: "Festive Tree", dyeable: false },
    "clockface": { name: "Clock Head", dyeable: false },
    "cowboy": { name: "Cowboy Hat", dyeable: true },
    "cowboyrgb": { name: "RGB Cowboy Hat", dyeable: false },
    "crabonhead": { name: "Crab on Head", dyeable: false },
    "crown": { name: "Crown", dyeable: false },
    "cuphead": { name: "Cup Head", dyeable: false },
    "cyclopseye": { name: "Cyclops Eye", dyeable: false },
    "dairyqueen": { name: "DQ Lips", dyeable: false },
    "dangereqsue": { name: "Dangeresque Shades", dyeable: false },
    "dangeresquejuly": { name: "Summer Dangeresque Shades", dyeable: false },
    "demoneyes": { name: "Demon Eyes", dyeable: false },
    "demonhorns": { name: "Demon Horns", dyeable: false },
    "digger": { name: "Diglett", dyeable: false },
    "dimmahat": { name: "Dimmadome Dimmahat", dyeable: false },
    "discoball": { name: "Disco", dyeable: false },
    "disguise": { name: "Disguise", dyeable: false },
    "doctorhat": { name: "Doctor's Gear", dyeable: false },
    "dorkglassesandteeth": { name: "Dork", dyeable: false },
    "doubletake": { name: "Double Take", dyeable: false },
    "dragonhead": { name: "Dragon Head", dyeable: false },
    "dragonskull": { name: "Dragon Skull", dyeable: false },
    "dragonskullender": { name: "Ender Dragon Skull", dyeable: false },
    "drinkinhat": { name: "Drinking Hat", dyeable: false },
    "dumhat": { name: "Dum", dyeable: false },
    "dwarfminerbeard": { name: "Dwarven Miner", dyeable: false },
    "easterhead": { name: "Easter Island Head", dyeable: false },
    "egghead": { name: "Egg Head", dyeable: false },
    "eggonhead": { name: "Egg on Head", dyeable: false },
    "elfhat": { name: "Elf Hat", dyeable: true },
    "explorerhat": { name: "Explorer Hat", dyeable: true },
    "eyepatch": { name: "Eye Patch", dyeable: false },
    "fakeblight": { name: "Blight", dyeable: false },
    "fakefire": { name: "Fire", dyeable: false },
    "farmerbrim": { name: "Farmer Brim", dyeable: true },
    "festiveantlers": { name: "Festive Antlers", dyeable: false },
    "festiveribbon": { name: "Festive Ribbon", dyeable: false },
    "finnhood": { name: "Finn Hood", dyeable: true },
    "fireworks": { name: "Fireworks", dyeable: false },
    "fishonhead": { name: "Fish on Head", dyeable: false },
    "flagjuly": { name: "Summer Flag", dyeable: false },
    "flies": { name: "Flies", dyeable: false },
    "floatinghearts": { name: "Floating Hearts", dyeable: false },
    "floatingstar": { name: "Floating Star", dyeable: false },
    "flowercrown": { name: "Flower Crown", dyeable: false },
    "floweronhead": { name: "Flower Head", dyeable: false },
    "foxhat": { name: "Fox Hat", dyeable: false },
    "fro": { name: "Fro", dyeable: true },
    "frozenhead": { name: "Frozen Head", dyeable: false },
    "fullironhelm": { name: "Armor Helm", dyeable: false },
    "ghostmask": { name: "Ghost Head", dyeable: false },
    "goggles": { name: "Goggles", dyeable: true },
    "grandmadisguise": { name: "Grandma Disguise", dyeable: false },
    "greenbirb": { name: "Green Birb", dyeable: false },
    "grinchhat": { name: "Grinch Mask", dyeable: false },
    "halo": { name: "Halo", dyeable: false },
    "headbolts": { name: "Head Bolts", dyeable: false },
    "headphonesblue": { name: "Headphones", dyeable: true },
    "headshot": { name: "Headshot", dyeable: false },
    "hockeymask": { name: "Hockey Mask", dyeable: false },
    "holyhead": { name: "Holy Head", dyeable: false },
    "horsemask": { name: "Horse Head", dyeable: false },
    "hosthat": { name: "Host", dyeable: false },
    "icedragonskull": { name: "Ice Dragon Skull", dyeable: false },
    "jackohat": { name: "Jack-o-Lantern Hat", dyeable: false },
    "jesterhat": { name: "Jester", dyeable: true },
    "julydouble": { name: "Summer Gear", dyeable: false },
    "kirbymouthful": { name: "Mouthful", dyeable: false },
    "largehorns": { name: "Large Horns", dyeable: false },
    "lilbow": { name: "Lil' Bow", dyeable: true },
    "madscientist": { name: "Wily Head", dyeable: false },
    "magikarp": { name: "Magikarp", dyeable: false },
    "megamanhat": { name: "Megaman Head", dyeable: false },
    "mistletoe": { name: "Mistletoe", dyeable: false },
    "mohawk": { name: "Mohawk", dyeable: true },
    "monkeyking": { name: "Monkey King", dyeable: false },
    "monocle": { name: "Monocle", dyeable: false },
    "moreeyes": { name: "Eye Head", dyeable: false },
    "murdered": { name: "Murdered", dyeable: false },
    "nekoears": { name: "Neko Ears", dyeable: true },
    "palmtree": { name: "Palm Tree", dyeable: false },
    "paperbag": { name: "Paper Bag", dyeable: false },
    "partyhat": { name: "Party Hat", dyeable: true },
    "paypay": { name: "Paypay", dyeable: false },
    "penguinbaby": { name: "Baby Penguin", dyeable: false },
    "penguinhat": { name: "Penguin Hat", dyeable: false },
    "pighead": { name: "Pig Head", dyeable: false },
    "pinhead": { name: "Pin Head", dyeable: false },
    "plaguedoctor": { name: "Plague Doctor", dyeable: false },
    "pog": { name: "Poggers", dyeable: false },
    "pohatoe": { name: "Pohatoe", dyeable: false },
    "policebucket": { name: "Police Bucket", dyeable: true },
    "policesiren": { name: "Siren", dyeable: false },
    "poofballhat": { name: "Poofball", dyeable: true },
    "poofballrgb": { name: "RGB Poofball", dyeable: false },
    "popehat": { name: "Pope Hat", dyeable: false },
    "potionhead": { name: "Potion Head", dyeable: false },
    "presentsstack": { name: "Presents", dyeable: false },
    "propelhat": { name: "Propeller", dyeable: true },
    "questbook": { name: "Questbook Hat", dyeable: false },
    "rabbitears": { name: "Bunny Ears", dyeable: true },
    "rabbitonhead": { name: "Bunny on Head", dyeable: false },
    "rainboworbiters": { name: "Rainbow Orbiters", dyeable: false },
    "ranahat": { name: "Rana Cap", dyeable: true },
    "redeyes": { name: "Red Eyes", dyeable: false },
    "rednose": { name: "Red Nose", dyeable: false },
    "redstache": { name: "Plumber Stache", dyeable: false },
    "rgbbigribbon": { name: "RGB Big Ribbon", dyeable: false },
    "rgbbowler": { name: "RGB Bowler Cap", dyeable: false },
    "rgbdragonskull": { name: "RGB Dragon Skull", dyeable: false },
    "rgbdrinkinhat": { name: "RGB Drinking Hat", dyeable: false },
    "rgbeasterhead": { name: "RGB Easter Island Head", dyeable: false },
    "rgbfullhelm": { name: "RGB Armor Helm", dyeable: false },
    "rgbpartyhat": { name: "RGB Party Hat", dyeable: false },
    "rgbsmallbowler": { name: "RGB Small Bowler Cap", dyeable: false },
    "rgbsunglasses": { name: "RGB Sunglasses", dyeable: false },
    "rgbtoptophathat": { name: "RGB Toptop Hathat", dyeable: false },
    "rgbushanka": { name: "RGB Ushanka", dyeable: false },
    "rock": { name: "Rock Eye", dyeable: false },
    "rubbernipple": { name: "Baby Bottle Head", dyeable: false },
    "sandcastle": { name: "Sand Castle", dyeable: false },
    "santaclaus": { name: "Santa Claus", dyeable: false },
    "sausage": { name: "Sausage", dyeable: false },
    "seaweedhat": { name: "Seaweed Hat", dyeable: false },
    "shakehat": { name: "Shake Head", dyeable: false },
    "sheep": { name: "Sheep Head", dyeable: false },
    "shrekears": { name: "Shrek Ears", dyeable: false },
    "shroomcap": { name: "Shroom Cap", dyeable: true },
    "smokingpipe": { name: "Smoking Pipe", dyeable: false },
    "snowmanbaby": { name: "Baby Snowman", dyeable: false },
    "sombrero": { name: "Sombrero", dyeable: true },
    "sonichood": { name: "Sonic Head", dyeable: false },
    "spadesoldier": { name: "Spade Soldier", dyeable: false },
    "spiderweb": { name: "Web Head", dyeable: false },
    "springer": { name: "Springer", dyeable: false },
    "sprout": { name: "Sprout", dyeable: false },
    "spyzombie": { name: "Spy Zombie", dyeable: false },
    "stackofeggs": { name: "Egg Stack", dyeable: false },
    "stress": { name: "Stress", dyeable: false },
    "summerhat": { name: "Summer Hat", dyeable: true },
    "sunglasses": { name: "Sunglasses", dyeable: false },
    "sunglassesbig": { name: "Big Sunglasses", dyeable: false },
    "supersandhat": { name: "Saiyan Head", dyeable: false },
    "swimmer": { name: "Swimmer Cap", dyeable: true },
    "tinkerhat": { name: "Tinker's Helm", dyeable: false },
    "topcathat": { name: "Top Cat Hat", dyeable: false },
    "tophat": { name: "Top Hat", dyeable: true },
    "toptophathat": { name: "Toptop Hathat", dyeable: false },
    "triangleshades": { name: "Angled Shades", dyeable: false },
    "tricorne": { name: "Tricorne", dyeable: false },
    "tvhead": { name: "TV Head", dyeable: false },
    "unicornhorn": { name: "Unicorn Horn", dyeable: false },
    "ushanka": { name: "Ushanka", dyeable: true },
    "vikinghatbeard": { name: "Viking Helm", dyeable: false },
    "villagernose": { name: "Villager Nose", dyeable: false },
    "winghat": { name: "Wing Cap", dyeable: false },
    "zigzagwitchhat": { name: "Witch Hat", dyeable: true },
    "acornhat": { name: "Acorn Cap", dyeable: true },
    "aegishat": { name: "Aegis", dyeable: false },
    "alienphil": { name: "Phil?", dyeable: false },
    "simsgem": { name: "Plumbob", dyeable: false },
    "artsy_doll": { name: "Artsy Doll", dyeable: false },
    "azumanga_hat": { name: "Azumanga's Hat", dyeable: false },
    "beret_ribbon": { name: "Beret Ribbon", dyeable: true },
    "bucket": { name: "Bucket", dyeable: true },
    "burning_m_bison": { name: "Burning Flames Team Captain", dyeable: false },
    "chalk_stick": { name: "Chalk Stick", dyeable: false },
    "chi_ears": { name: "Chi's Ears", dyeable: false },
    "circular_glasses": { name: "Circular Glasses", dyeable: false },
    "cucumbereyemask": { name: "Cucumber Eye Mask", dyeable: false },
    "dejiko": { name: "Dejiko's Hat", dyeable: false },
    "fez": { name: "Fez", dyeable: true },
    "fishing_hat": { name: "Fishing Hat", dyeable: true },
    "lightning_eyes": { name: "Lightning Eyes", dyeable: false },
    "longfoxears": { name: "Long Fox Ears", dyeable: false },
    "milady_doll": { name: "Milady Doll", dyeable: false },
    "nyan_doll": { name: "Nyan Doll", dyeable: false },
    "orange_hat": { name: "Orange Hat", dyeable: true },
    "peppino": { name: "Peppino", dyeable: false },
    "pom_moog": { name: "Pom-Moog", dyeable: false },
    "puchiko": { name: "Puchiko's Hat", dyeable: false },
    "rabi_en_rose": { name: "Rabi~en~Rose's Hat", dyeable: false },
    "raincloud": { name: "Raincloud", dyeable: false },
    "scouter": { name: "Scouter", dyeable: false },
    "sleepeyemask": { name: "Sleep Eye Mask", dyeable: false },
    "sport_sunglasses": { name: "Sport Sunglasses", dyeable: false },
    "strawberry_hat": { name: "Strawberry Hat", dyeable: false },
    "teddy_bear": { name: "Teddy Bear", dyeable: false },
    "the_noise": { name: "The Noise", dyeable: false },
    "toy_story_alien": { name: "Toy Story Alien", dyeable: false },
    "twilight_doll": { name: "Twilight Doll", dyeable: false },
    "worms_mine": { name: "Worm's Mine", dyeable: false },
    "alien_antennae": { name: "Alien Antennae", dyeable: false },
    "angel_and_devil": { name: "Angel and Devil", dyeable: false },
    "astronaut": { name: "Astronaut", dyeable: false },
    "axolotl_on_head": { name: "Axolotl Friend", dyeable: true },
    "baby_crewmate": { name: "Baby Crewmate", dyeable: true },
    "bee_on_head": { name: "Bee Friend", dyeable: false },
    "beetle_on_head": { name: "Beetle Friend", dyeable: false },
    "binky": { name: "Binky", dyeable: true },
    "cardboard_box": { name: "Cardboard Box", dyeable: false },
    "cat_hat": { name: "Cat Hat", dyeable: true },
    "cat_on_head": { name: "Cat Friend", dyeable: true },
    "caterpillar_on_head": { name: "Caterpillar Friend", dyeable: false },
    "chocolate_sauced": { name: "Chocolate Sauced", dyeable: false },
    "crystal_horns": { name: "Crystal Horns", dyeable: false },
    "dipper": { name: "Dipper", dyeable: false },
    "druid_antlers": { name: "Druid Antlers", dyeable: false },
    "druid_antlers_rare": { name: "Elder Druid Antlers", dyeable: false },
    "eevee_ears": { name: "Eevee Ears", dyeable: false },
    "eyeholder_beeholder": { name: "Beeholder", dyeable: false },
    "eyeholder_dark": { name: "Dark Eyeholder", dyeable: false },
    "eyeholder_evil": { name: "Evil Eyeholder", dyeable: false },
    "eyeholder_warm": { name: "Warm Eyeholder", dyeable: false },
    "eyeholder_xanath": { name: "Xanath Eyeholder", dyeable: false },
    "gnome": { name: "Gnome Hat", dyeable: true },
    "gnome_clover_wig": { name: "Gnome Disguise", dyeable: false },
    "greaser": { name: "Greaser", dyeable: false },
    "hat_of_discipline": { name: "Hat of Discipline", dyeable: false },
    "ladybug_on_head": { name: "Ladybug Friend", dyeable: false },
    "lil_bows": { name: "Lil' Bows", dyeable: true },
    "lil_termagant": { name: "Lil' Termagant", dyeable: false },
    "medusa": { name: "Medusa", dyeable: false },
    "mimic_head": { name: "Mimic", dyeable: false },
    "mimic_head_dark": { name: "Dark Mimic", dyeable: false },
    "mimic_head_gold": { name: "Gold Mimic", dyeable: false },
    "mindflayer": { name: "Mindflayer", dyeable: false },
    "mindflayer_alhoon": { name: "Alhoon", dyeable: false },
    "octodad": { name: "Octodad", dyeable: false },
    "pika_ears": { name: "Pika Ears", dyeable: false },
    "right_hand_hat": { name: "Right Hand", dyeable: false },
    "round_purple_wig": { name: "Purple Wig", dyeable: false },
    "round_red_wig": { name: "Red Wig", dyeable: false },
    "slime_cube_dnd": { name: "Dungeon Slime Cube", dyeable: false },
    "slime_head": { name: "Slime Head", dyeable: false },
    "stinkycheeseman": { name: "Stinky Cheese Man", dyeable: false },
    "stuck_lollipop": { name: "Stuck Lollipop", dyeable: false },
    "tanuki_leaf": { name: "Tanuki Leaf", dyeable: false },
    "the_noisier": { name: "The Noisier", dyeable: false },
    "thumbnail": { name: "Youtube Thumbnail", dyeable: false },
    "tick_on_head": { name: "Tick Friend", dyeable: false },
    "toast": { name: "Toast", dyeable: false },
    "toilet": { name: "Toilet Head", dyeable: false },
    "tomato_splats": { name: "Tomato Splats", dyeable: false },
    "traffic_cone": { name: "Traffic Cone", dyeable: false },
    "udder_hat": { name: "Udder Hat", dyeable: false },
    "worm_hat": { name: "Worm Hat", dyeable: false },
    "frog_on_head": { name: "Frog Friend", dyeable: true },
    "parrot_on_head": { name: "Parrot Friend", dyeable: true },
    "bunny": { name: "Bunny Ears", dyeable: true },
    "beret": { name: "Beret", dyeable: true },
    "headphones": { name: "Headphones", dyeable: true },
    "cap": { name: "Cap", dyeable: true },
    "fedora": { name: "Fedora", dyeable: true }
  };

  const getHatMetadata = (id: string | null) => {
    if (!id) return null;
    const base = MINECRAFT_HATS[id] || availableHats.find((h: any) => h.id === id) || { name: id, description: 'A stylish cosmetic hat.', price: 1, rarity: 'COMMON' };
    const override = AUTHENTIC_HAT_OVERRIDES[id];
    const isDyeable = override?.dyeable || id.includes('on_head') || id.includes('beanie') || id.includes('bunny') || id.includes('bandana') || id.includes('cap');
    return {
      ...base,
      name: override?.name || base.name,
      dyeable: isDyeable,
      price: 1
    };
  };

  const [dailyHats, setDailyHats] = useState<any[]>([]);
  const [shopOffset, setShopOffset] = useState<number>(0);

  useEffect(() => {
    fetch(`${DISCORD_API_URL}/api/shop/daily-offset`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.offset === 'number') {
           setShopOffset(data.offset);
        }
      })
      .catch(err => console.error("Failed to fetch shop offset:", err));
  }, []);

  useEffect(() => {
    if (!availableHats || availableHats.length === 0) return;
    
    // Seed using today's date (YYYY-MM-DD) + offset
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}-${shopOffset}`;
    
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const selected = [];
    const totalHats = availableHats.length;
    const seenIndices = new Set<number>();
    
    for (let i = 0; i < 4; i++) {
      let idx = Math.abs((hash + i * 1493) % totalHats);
      // Ensure we don't have duplicates
      while (seenIndices.has(idx)) {
        idx = (idx + 1) % totalHats;
      }
      seenIndices.add(idx);
      
      const hat = availableHats[idx];
      const meta = getHatMetadata(hat.id);
      selected.push({
        ...hat,
        name: meta?.name || hat.name,
        modelId: hat.id,
        price: 1
      });
    }
    setDailyHats(selected);
  }, [shopOffset]);

  // Ticking countdown timer to next midnight
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0); // Next midnight
      
      const diffMs = tomorrow.getTime() - now.getTime();
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const pad = (num: number) => num.toString().padStart(2, '0');
      setTimeRemaining(`${pad(hrs)}H ${pad(mins)}M ${pad(secs)}S`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);



  const handleOpenPreview = (hatId: string) => {
    setSelectedHatId(hatId);
    setPreviewZoom(0.65);
    setPreviewDyeColor(null);
  };

  // Handlers for skin fetching and sandbox upload removed per user request

  const filteredTcgPacks = TCG_PACKS.filter((pack) => {
    const matchesSeries = tcgSeriesFilter === 'All' || pack.series === tcgSeriesFilter;
    const matchesSearch =
      pack.name.toLowerCase().includes(tcgSearch.toLowerCase()) ||
      pack.year.toString().includes(tcgSearch) ||
      pack.series.toLowerCase().includes(tcgSearch.toLowerCase());
    return matchesSeries && matchesSearch;
  });

  const handleOpenWheel = () => {
    setIsWheelOpen(true);
    setSpinResult(null);
    setShowResultBanner(false);
    setSpinError('');
  };

  const handleCloseWheel = () => {
    if (isSpinning) return; // Prevent closing while spinning
    setIsWheelOpen(false);
  };

  
  const handleBuyItem = (itemDef) => {
    if (!user) return;
    if (nisaballBalance < itemDef.price) {
      setPurchaseResult({ status: 'error', message: "Insufficient Nisaballs! You don't have enough to buy this item." });
      return;
    }
    setPurchaseConfirmationItem(itemDef);
  };

  const confirmPurchase = async () => {
    if (!user || !purchaseConfirmationItem) return;
    const itemDef = purchaseConfirmationItem;
    
    try {
      const response = await fetch(`${DISCORD_API_URL}/api/shop/buy-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId: user.id,
          item: {
            id: itemDef.id,
            name: itemDef.name,
            price: itemDef.price,
            type: itemDef.type,
            rarity: itemDef.rarity || 'COMMON',
            image: itemDef.image || ''
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (selectedHatId) setSelectedHatId(null);
        setPurchaseResult({ status: 'success', message: `Successfully purchased ${itemDef.name}!`, itemName: itemDef.name });
        await refetch();
      } else {
        setPurchaseResult({ status: 'error', message: data.error || "Failed to purchase item." });
      }
    } catch (e) {
      setPurchaseResult({ status: 'error', message: "Error purchasing item. Please try again later." });
    }
    setPurchaseConfirmationItem(null);
  };

  const handleSpinWheel = async () => {
    if (!user || isSpinning) return;

    if (nisaballBalance < 1) {
      setSpinError("Insufficient Nisaballs! You need at least 1 Nisaball to spin the wheel.");
      return;
    }

    setIsSpinning(true);
    setSpinError('');
    setShowResultBanner(false);
    setSpinResult(null);

    try {
      const response = await fetch(`${DISCORD_API_URL}/api/shop/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discordId: user.id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const rawType = (data.reward || data.itemType || '').toLowerCase();
        const isLamb = rawType === 'lamb';
        const wonKeyType = isLamb ? 'lamb' : 'wagyu';
        
        // Calculate physics/angle:
        // Lamb sector center is at 90deg on unrotated wheel. Rotating by 270deg brings 90deg to top (12 o'clock pointer).
        // Wagyu sector center is at 270deg on unrotated wheel. Rotating by 90deg brings 270deg to top (12 o'clock pointer).
        const fullSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
        const sectorOffset = isLamb ? 270 : 90;
        
        // Organic offset within ±20 degrees around center of the 180-degree sector
        const randomOrganicOffset = Math.floor(Math.random() * 40) - 20;
        
        const targetAbsoluteAngle = sectorOffset + randomOrganicOffset;
        const currentBase = Math.floor(wheelRotation / 360) * 360;
        let finalRotation = currentBase + (fullSpins * 360) + targetAbsoluteAngle;
        if (finalRotation <= wheelRotation + 1800) {
          finalRotation += 360 * Math.ceil((wheelRotation + 1800 - finalRotation) / 360);
        }
        
        // Trigger spin animation
        setWheelRotation(finalRotation);

        // After 4.2s animation completes
        setTimeout(async () => {
          setIsSpinning(false);
          setSpinResult(wonKeyType);
          setShowResultBanner(true);
          // Refetch balance to update user stats header
          await refetch();
        }, 4200);

      } else {
        setIsSpinning(false);
        setSpinError(data.error || "The server failed to initiate the spin. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setIsSpinning(false);
      setSpinError("Connection error. Failed to reach the shop system.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-brand-primary/30">
            🔒
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Login Required</h1>
          <p className="text-gray-400 mb-8 text-sm">
            You must log in with Discord and link your Twitch/Minecraft accounts to access the Nisamon Shop.
          </p>
          <UserProfile className="w-full justify-center" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 sm:pt-12 pb-12 px-4 sm:px-6 lg:px-8 relative font-sans">
      <UserProfile className="!absolute top-4 right-4 z-30" />

      <style>{`
        .crate-float {
            animation: crateFloat 4s ease-in-out infinite;
        }
        @keyframes crateFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full">
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link 
            to="/minecraft" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>NISAMON <span className="text-brand-primary">SHOP</span></span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Buy stuff and gamble your life savings away for some cool stuff!
          </p>
        </div>

        {/* User twitch connection reminder */}
        {!user.twitchUsername && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl text-yellow-200 mb-8 text-sm flex gap-3 items-start animate-fade-in">
            <span>⚠️</span>
            <div>
              <p className="font-bold">Twitch Account Not Synced</p>
              <p className="mt-0.5 text-yellow-300/80">
                We couldn't detect a linked Twitch account in your Minecraft integration. Please link your Twitch username under the <Link to="/minecraft" className="underline font-bold hover:text-white">Minecraft Dashboard</Link> to ensure your live Nisaball balance is fetched!
              </p>
            </div>
          </div>
        )}

        {/* Large Gacha Wheel Promo Banner */}
        <div 
          onClick={handleOpenWheel}
          className="bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-brand-primary/30 hover:border-amber-500/60 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(245,158,11,0.25)] active:scale-[0.99]"
        >
          {/* Animated red & amber glowing backdrops */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-brand-primary/20 to-amber-500/10 rounded-full blur-[120px] pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <div className="absolute -bottom-10 -left-10 w-[300px] h-[300px] bg-gradient-to-tr from-brand-primary/15 to-transparent rounded-full blur-[80px] pointer-events-none opacity-30"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Promo Info */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                THE 50/50 KEY <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 bg-clip-text text-transparent">WHEEL SPIN</span>
              </h2>

              {/* Actual Crates from Gacha Page */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl my-4">
                {/* LAMB CRATE */}
                <div className="flex flex-col items-center p-8 bg-gradient-to-b from-amber-900/20 to-black border border-amber-900/40 rounded-3xl shadow-xl transition-all duration-300 hover:border-amber-700/60 cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(146,64,14,0.4)]">
                  <div className="w-48 h-32 mb-6 text-amber-800 drop-shadow-[0_0_15px_rgba(146,64,14,0.5)] relative crate-float">
                    <LambCrateSVG stage="selection" selectedCrate={null} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Lamb Crate</h2>
                  <p className="text-amber-200/80 text-sm text-center mb-2 min-h-[2.5rem]">Contains common to rare loot and hats, relic coins and the 1999 Base Set TCG Pack!</p>
                </div>

                {/* WAGYU CRATE */}
                <div className="flex flex-col items-center p-8 bg-gradient-to-b from-[#7a2034]/20 to-black border border-[#d7485c]/20 rounded-3xl shadow-xl transition-all duration-300 hover:border-[#fbbf24]/50 cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(215,72,92,0.4)]">
                  <div className="w-48 h-32 mb-6 text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,113,133,0.5)] relative crate-float">
                    <WagyuCrateSVG stage="selection" selectedCrate={null} />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Wagyu Crate</h2>
                  <p className="text-[#fbbf24]/80 text-sm text-center mb-2 min-h-[2.5rem]">Contains epic to legendary loot and hats, koban coins, the 2023 Scarlet & Violet-Mew 151 TCG Pack and a MEW EX TCG card!</p>
                </div>
              </div>
            </div>

            {/* Simulated Wheel Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
                {/* Rotating subtle halo */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-full blur-2xl animate-pulse"></div>
                
                {/* Main spinning element */}
                <div 
                  className="w-full h-full rounded-full border-4 border-zinc-800 relative overflow-hidden animate-[spin_20s_linear_infinite]"
                  style={{
                    background: 'conic-gradient(from 0deg, #78350f 0deg, #b45309 180deg, #7a2034 180deg, #d7485c 360deg)'
                  }}
                >
                  {/* Sector dividers */}
                  <div className="absolute inset-0 bg-black/10 w-[2px] left-1/2 -translate-x-1/2"></div>

                  <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(90deg)' }}>
                    <div className="flex flex-col items-center -translate-y-12">
                      <LambKeySVG className="w-10 h-10 drop-shadow-[0_0_12px_rgba(252,211,77,0.9)] mb-1" />
                      <span className="text-[10px] uppercase font-black tracking-wider text-amber-200">LAMB</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(270deg)' }}>
                    <div className="flex flex-col items-center -translate-y-12">
                      <WagyuKeySVG className="w-10 h-10 drop-shadow-[0_0_12px_rgba(251,113,133,0.9)] mb-1" />
                      <span className="text-[10px] uppercase font-black tracking-wider text-rose-200">WAGYU</span>
                    </div>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black border-2 border-zinc-700 rounded-full z-10 shadow-lg"></div>
                </div>

                {/* Overlay glass decoration */}
                <div className="absolute inset-4 rounded-full border border-white/5 bg-black/10 backdrop-blur-[1px] pointer-events-none"></div>

                {/* Pointer peg */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[16px] border-t-amber-400 z-20 drop-shadow-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VALORANT-Style Daily Rotating Shop Section */}
      <div className="mt-12">
        {/* Header & Timer Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HatSVG className="w-5 h-5 text-brand-primary" />
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">DAILY STORE</h2>
              <span className="bg-brand-primary/20 border border-brand-primary/40 text-brand-primary text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                ROTATING SHOP
              </span>
            </div>
            <p className="text-gray-400 text-xs">
              4 random hats & cosmetics you can get!
            </p>
          </div>

          {/* Countdown Badge */}
          <div className="bg-zinc-900/90 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-lg shrink-0 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest font-mono text-gray-400 font-bold">ROTATES IN</span>
              <span className="text-xs font-black font-mono text-amber-300 tracking-wider">{timeRemaining}</span>
            </div>
          </div>
        </div>

        {/* 4 Horizontal Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dailyHats.map((item) => (
            <div 
              key={item.id}
              className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/10 hover:border-amber-500/50 rounded-3xl p-5 transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative flex flex-col justify-between"
            >


              {/* Item Thumbnail / Interactive 3D Canvas */}
              <div 
                onClick={() => handleOpenPreview(item.modelId)}
                className="my-3 h-48 bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:border-amber-500/30 transition-all cursor-pointer shadow-inner group/renderer"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
                {/* 3D Model Renderer */}
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 pointer-events-none">
                  <MinecraftHatRenderer 
                    modelId={item.modelId} 
                    autoRotate={true} 
                    showHead={false} 
                    width={180} 
                    height={180} 
                    zoom={0.95} 
                    interactive={false} 
                  />
                </div>
              </div>

              {/* Info & Price */}
              <div className="relative z-10 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getHatMetadata(item.modelId)?.dyeable && (
                      <div className="relative group/tooltip inline-flex items-center">
                        <span 
                          className="inline-flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-help"
                        >
                          Dyeable
                        </span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 pointer-events-none z-30 flex flex-col items-center">
                          <div className="bg-zinc-900/95 border border-cyan-500/40 text-cyan-100 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl shadow-black/80 w-44 text-center whitespace-normal leading-normal">
                            You can dye this hat in game for different colors!
                          </div>
                          <div className="w-2 h-2 bg-zinc-900 border-r border-b border-cyan-500/40 rotate-45 -mt-1"></div>
                        </div>
                      </div>
                    )}
                    {item.modelId?.toLowerCase().includes('rgb') && (
                      <div className="relative inline-flex items-center">
                        <span 
                          className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 border border-white/20 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse cursor-default"
                        >
                          RGB
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug group-hover:text-amber-200 transition-colors">
                    {getHatMetadata(item.modelId)?.name || item.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-300 font-black font-mono text-sm">
                    <span>{item.price}</span>
                    <img 
                      src="https://res.cloudinary.com/dsencimjn/image/upload/v1764173339/1341377045602766868_fbuvnf.webp" 
                      alt="NB" 
                      className="w-4 h-4 object-contain inline" 
                    />
                  </div>

                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => {
                      const meta = getHatMetadata(item.modelId);
                      if (meta) {
                        handleBuyItem({ id: meta.id, name: meta.name, price: meta.price, type: 'Item', rarity: meta.rarity });
                      }
                    }}
                      className="cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black text-xs font-black px-3.5 py-1.5 rounded-xl border border-yellow-300 transition-all active:scale-95 shadow-md"
                    >
                      BUY
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* TCG Card Shop Section */}
      <div className="mt-14 pb-12">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <PackSVG className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">TCG CARD PACK SHOP</h2>
              <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {TCG_PACKS.length} PACKS
              </span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              Buy booster packs and rip em open in the game to get 5 cards!
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              value={tcgSearch}
              onChange={(e) => setTcgSearch(e.target.value)}
              placeholder="Search expansion or year..."
              className="w-full bg-zinc-900/90 border border-white/10 focus:border-yellow-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all shadow-inner"
            />
            {tcgSearch && (
              <button 
                onClick={() => setTcgSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Series Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <span className="shrink-0 mr-1 flex items-center">
            <Filter className="w-5 h-5 text-yellow-400" />
          </span>
          {TCG_SERIES_OPTIONS.map((series) => {
            const isActive = tcgSeriesFilter === series;
            return (
              <button
                key={series}
                onClick={() => setTcgSeriesFilter(series)}
                className={`
                  cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0
                  ${isActive 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-yellow-300 shadow-lg shadow-amber-950/40' 
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-gray-300 border-white/10 hover:border-white/20'}
                `}
              >
                {series}
              </button>
            );
          })}
        </div>

        {/* Packs Grid */}
        {filteredTcgPacks.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-12 text-center my-6">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-white font-bold text-base">No TCG Booster Packs Found</p>
            <p className="text-gray-400 text-xs mt-1">Try resetting your search query or era filter.</p>
            <button 
              onClick={() => { setTcgSearch(''); setTcgSeriesFilter('All'); }}
              className="mt-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/10 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTcgPacks.map((pack) => (
              <div
                key={pack.id}
                className={`bg-gradient-to-b ${pack.gradient} border border-white/10 hover:border-yellow-500/50 rounded-3xl p-4 transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col justify-between`}
              >
                {/* Glossy Top Line */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>

                <div>
                  {/* Year & Series Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-black text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {pack.year}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border bg-gradient-to-r ${pack.badgeColor}`}>
                      {pack.series}
                    </span>
                  </div>

                  {/* Pack Title */}
                  <h3 className="text-base font-black text-white tracking-tight leading-snug group-hover:text-yellow-200 transition-colors mb-3">
                    {pack.year} {pack.name}
                  </h3>

                  {/* Real Booster Pack Image */}
                  <div className="relative w-full aspect-[2/3] max-w-[190px] mx-auto mb-4 overflow-hidden rounded-xl bg-black border border-white/10 p-1 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-2xl group-hover:border-yellow-500/50">
                    <img 
                      src={pack.coverImage} 
                      alt={`${pack.name} Booster Pack`} 
                      style={
                        pack.cropScale
                          ? {
                              transform: `scale(${pack.cropScale})`,
                              objectPosition: pack.cropPosition || 'center',
                            }
                          : {}
                      }
                      className="w-full h-full object-cover rounded-lg drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
                      referrerPolicy="no-referrer"
                    />
                    {/* Metallic Shine Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 font-black font-mono text-sm text-yellow-300">
                    <span>{pack.price}</span>
                    <img 
                      src="https://res.cloudinary.com/dsencimjn/image/upload/v1764173339/1341377045602766868_fbuvnf.webp" 
                      alt="NB" 
                      className="w-4 h-4 object-contain inline" 
                    />
                  </div>
                  <button 
                    onClick={() => handleBuyItem({ 
                      id: pack.id, 
                      name: pack.name, 
                      price: pack.price, 
                      type: 'Item', 
                      rarity: 'COMMON', 
                      image: pack.coverImage,
                      cropScale: pack.cropScale,
                      cropPosition: pack.cropPosition
                    })}
                    className="cursor-pointer bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-black text-xs font-black px-3.5 py-1.5 rounded-xl border border-yellow-300 transition-all active:scale-95 shadow-md"
                  >
                    BUY PACK
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Wheel Spin Popup */}
      {isWheelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-[3rem] max-w-xl w-full p-8 relative shadow-2xl my-auto text-center">
            
            {/* Close Button */}
            <button
              onClick={handleCloseWheel}
              disabled={isSpinning}
              className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-4">
              <h2 className="text-3xl font-black text-white mt-1 tracking-tight">50/50 KEY SPIN</h2>
            </div>

            {/* Balance indicator */}
            <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-xl inline-flex items-center gap-2 text-sm font-bold text-gray-300 font-mono mb-6">
              <span>Your Balance:</span>
              <span className="text-brand-accent flex items-center gap-1">
                {Math.floor(nisaballBalance)}
                <img 
                  src="https://res.cloudinary.com/dsencimjn/image/upload/v1764173339/1341377045602766868_fbuvnf.webp" 
                  alt="NB" 
                  className="w-4 h-4 object-contain inline" 
                />
              </span>
            </div>

            {/* Error box */}
            {spinError && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-2xl text-red-200 text-xs max-w-md mx-auto mb-4 flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{spinError}</span>
              </div>
            )}

            {/* Wheel Container */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-6 flex items-center justify-center select-none">
              
              {/* LED Ring simulation */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-full blur-xl pointer-events-none opacity-50"></div>
              
              {/* Outer boundary ring */}
              <div className="absolute -inset-2.5 rounded-full border-4 border-zinc-800 bg-zinc-900/40 z-0"></div>

              {/* The Spinning Wheel */}
              <div 
                className="w-full h-full rounded-full border-4 border-zinc-800 relative overflow-hidden shadow-2xl z-10"
                style={{
                  background: 'conic-gradient(from 0deg, #78350f 0deg, #b45309 180deg, #7a2034 180deg, #d7485c 360deg)',
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)' : 'none'
                }}
              >
                {/* Sector dividers */}
                <div className="absolute inset-0 bg-black/10 w-[2px] left-1/2 -translate-x-1/2"></div>
                
                {/* Lamb Label & Key Art */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(90deg)' }}>
                  <div className="flex flex-col items-center -translate-y-12 sm:-translate-y-14 text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <LambKeySVG className="w-12 h-12 drop-shadow-[0_0_12px_rgba(252,211,77,0.9)] mb-1" />
                    <span className="text-xs uppercase tracking-wider font-extrabold text-amber-200">LAMB KEY</span>
                  </div>
                </div>

                {/* Wagyu Label & Key Art */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(270deg)' }}>
                  <div className="flex flex-col items-center -translate-y-12 sm:-translate-y-14 text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <WagyuKeySVG className="w-12 h-12 drop-shadow-[0_0_12px_rgba(251,113,133,0.9)] mb-1" />
                    <span className="text-xs uppercase tracking-wider font-extrabold text-rose-200">WAGYU KEY</span>
                  </div>
                </div>
              </div>

              {/* Inner center pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black border-2 border-zinc-700 rounded-full z-20 shadow-lg"></div>

              {/* Pointer peg (Top position, pointing down) */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 z-30 filter drop-shadow-md"></div>
            </div>

            {/* Main Spin Action Button */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning || nisaballBalance < 1}
                className={`
                  w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all transform flex items-center justify-center gap-2 shadow-lg
                  ${isSpinning 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5' 
                    : nisaballBalance < 1
                      ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                      : 'cursor-pointer bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 hover:from-amber-500 hover:to-rose-600 text-white hover:scale-105 active:scale-95 shadow-amber-950/20'}
                `}
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Spinning...</span>
                  </>
                ) : (
                  <span>SPIN NOW</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Wheel Spin Result Modal */}
      {showResultBanner && spinResult && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in">
          <div className="relative bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-[3rem] max-w-md w-full p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center animate-scale-in overflow-hidden">
            {/* Ambient Background Glow matching the won key */}
            {spinResult === 'lamb' ? (
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/15 rounded-full blur-[80px] pointer-events-none"></div>
            ) : (
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-500/15 rounded-full blur-[80px] pointer-events-none"></div>
            )}

            {/* Glowing Key Illustration */}
            <div className="relative flex justify-center mb-6">
              {spinResult === 'lamb' ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl scale-150 animate-pulse"></div>
                  <div className="relative w-28 h-28 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <LambKeySVG className="w-16 h-16 drop-shadow-[0_0_15px_rgba(252,211,77,0.9)]" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl scale-150 animate-pulse"></div>
                  <div className="relative w-28 h-28 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                    <WagyuKeySVG className="w-16 h-16 drop-shadow-[0_0_15px_rgba(251,113,133,0.9)]" />
                  </div>
                </div>
              )}
            </div>

            {/* Header / Subheader */}
            <span className="text-brand-accent font-black tracking-widest uppercase text-xs mb-2 block">
              SPIN COMPLETED!
            </span>
            <h3 className="text-3xl font-black text-white tracking-tight mb-2">
              YOU WON!
            </h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
              Congratulations! You obtained 1x {spinResult === 'lamb' ? (
                <span className="text-amber-200 font-extrabold">Lamb Crate Key</span>
              ) : (
                <span className="text-rose-200 font-extrabold">Wagyu Crate Key</span>
              )} in your inventory!
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              <Link 
                to="/minecraft/gacha" 
                className="w-full py-4 bg-brand-primary hover:bg-red-600 text-white font-extrabold rounded-2xl text-xs uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-950/25 flex items-center justify-center gap-2"
                onClick={() => {
                  setShowResultBanner(false);
                  setIsWheelOpen(false);
                }}
              >
                <span>GO OPEN CRATE</span>
              </Link>
              <button 
                onClick={() => setShowResultBanner(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/5 font-extrabold rounded-2xl text-xs uppercase tracking-widest transition-all hover:border-white/10"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Result Modal */}
      {purchaseResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 cursor-pointer" onClick={() => setPurchaseResult(null)}>
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-[2.5rem] max-w-sm w-full p-8 relative shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200 cursor-default" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setPurchaseResult(null)}
              className="absolute top-5 right-5 w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
            >
              ✕
            </button>

            {purchaseResult.status === 'success' ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-emerald-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-red-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
            )}

            <h3 className={`text-2xl font-black mb-3 text-white`}>
              {purchaseResult.status === 'success' ? 'Purchase Successful!' : 'Purchase Failed'}
            </h3>
            
            <p className="text-gray-400 font-medium leading-relaxed mb-8">
              {purchaseResult.message}
            </p>
            
            <button
              onClick={() => setPurchaseResult(null)}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg ${purchaseResult.status === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* 3D Hat Preview Modal */}
      {selectedHatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-[2.5rem] max-w-lg w-full p-6 relative shadow-2xl flex flex-col items-center">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedHatId(null)}
              className="absolute top-5 right-5 w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 z-50"
            >
              ✕
            </button>

            {/* Title / Header */}
            <div className="w-full text-center mb-4 flex flex-col items-center gap-1.5">
              <h3 className="text-3xl font-black text-white tracking-tight mt-1">{getHatMetadata(selectedHatId)?.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                {getHatMetadata(selectedHatId)?.dyeable && (
                  <div className="relative group/tooltip inline-flex items-center">
                    <span 
                      className="inline-flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md cursor-help"
                    >
                      Dyeable
                    </span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 pointer-events-none z-50 flex flex-col items-center">
                      <div className="bg-zinc-900/95 border border-cyan-500/40 text-cyan-100 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl shadow-black/80 w-44 text-center whitespace-normal leading-normal">
                        You can dye this hat in game for different colors!
                      </div>
                      <div className="w-2 h-2 bg-zinc-900 border-l border-t border-cyan-500/40 rotate-45 -mb-1"></div>
                    </div>
                  </div>
                )}
                {selectedHatId?.toLowerCase().includes('rgb') && (
                  <div className="relative inline-flex items-center">
                    <span 
                      className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 border border-white/20 text-yellow-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md animate-pulse cursor-default"
                    >
                      RGB
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3D Model Renderer Canvas */}
            <div className="w-full flex items-center justify-center bg-black/60 border border-white/5 rounded-3xl p-4 relative overflow-hidden my-2">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
              <MinecraftHatRenderer 
                modelId={selectedHatId} 
                autoRotate={true}
                showHead={false}
                width={260}
                height={260}
                zoom={previewZoom}
                interactive={true}
                showDragIndicator={false}
              />
            </div>

            {/* Canvas Controls */}
            <div className="w-full flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 px-3 py-2 rounded-xl">
                <span className="text-[10px] text-gray-400 font-mono shrink-0 uppercase tracking-wider">Zoom</span>
                <input 
                  type="range" 
                  min="0.3" 
                  max="1.2" 
                  step="0.05"
                  value={previewZoom}
                  onChange={(e) => setPreviewZoom(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1 rounded-lg cursor-pointer bg-zinc-800"
                />
                <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0">{Math.round(previewZoom * 100)}%</span>
              </div>

              <div className="w-full">
                <button
                  onClick={() => setPreviewZoom(0.65)}
                  className="w-full py-2 px-3 rounded-xl border border-white/5 bg-zinc-900/60 hover:bg-zinc-800 text-gray-400 hover:text-white font-bold text-xs transition-all uppercase tracking-wide"
                >
                  Reset Zoom
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  const hat = getHatMetadata(selectedHatId);
                  if (hat) {
                    handleBuyItem({ id: hat.id, name: hat.name, price: hat.price, type: 'Item', rarity: hat.rarity });
                  }
                }}
                className="cursor-pointer w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/15 border border-yellow-300"
              >
                <span>Buy for {getHatMetadata(selectedHatId)?.price}</span>
                <img 
                  src="https://res.cloudinary.com/dsencimjn/image/upload/v1764173339/1341377045602766868_fbuvnf.webp" 
                  alt="Nisaball" 
                  className="w-4.5 h-4.5 object-contain" 
                />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {purchaseConfirmationItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/10 rounded-[2.5rem] max-w-sm w-full p-6 relative shadow-2xl flex flex-col items-center text-center">
            
            <button
              onClick={() => setPurchaseConfirmationItem(null)}
              className="absolute top-5 right-5 w-9 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 z-50"
            >
              ✕
            </button>

            <h3 className="text-2xl font-black text-white tracking-tight mt-2 mb-1">Confirm Purchase</h3>
            <p className="text-sm text-gray-400 mb-6 font-medium">Are you sure you want to buy this item?</p>

            {purchaseConfirmationItem.image ? (
              <div className="relative w-[110px] h-[165px] mb-4 overflow-hidden rounded-xl bg-black border border-white/10 p-1 flex items-center justify-center shadow-lg">
                <img 
                  src={purchaseConfirmationItem.image} 
                  alt={purchaseConfirmationItem.name} 
                  style={
                    purchaseConfirmationItem.cropScale
                      ? {
                          transform: `scale(${purchaseConfirmationItem.cropScale})`,
                          objectPosition: purchaseConfirmationItem.cropPosition || 'center',
                        }
                      : {}
                  }
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-black/60 border border-white/5 rounded-3xl p-2 relative overflow-hidden mb-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:10px_16px] pointer-events-none"></div>
                <MinecraftHatRenderer 
                  modelId={purchaseConfirmationItem.id} 
                  autoRotate={true}
                  showHead={false}
                  width={110}
                  height={110}
                  zoom={0.65}
                  interactive={true}
                  showDragIndicator={false}
                />
              </div>
            )}

            <h4 className="text-xl font-bold text-white mb-2">{purchaseConfirmationItem.name}</h4>
            
            <div className="flex items-center gap-2 mb-6 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Price:</span>
              <span className="font-black font-mono text-lg text-yellow-300">{purchaseConfirmationItem.price}</span>
              <img 
                src="https://res.cloudinary.com/dsencimjn/image/upload/v1764173339/1341377045602766868_fbuvnf.webp" 
                alt="NB" 
                className="w-5 h-5 object-contain" 
              />
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={() => setPurchaseConfirmationItem(null)}
                className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-900/20 border border-green-400 flex items-center justify-center gap-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
