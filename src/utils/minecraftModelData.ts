export interface MinecraftModelFace {
  uv: [number, number, number, number]; // [u0, v0, u1, v1] in texture pixels
  texture: string;
}

export interface MinecraftModelElement {
  from: [number, number, number]; // [x, y, z] coordinates (0 to 16 base block space)
  to: [number, number, number];   // [x, y, z] coordinates
  faces: {
    north?: MinecraftModelFace;
    south?: MinecraftModelFace;
    east?: MinecraftModelFace;
    west?: MinecraftModelFace;
    up?: MinecraftModelFace;
    down?: MinecraftModelFace;
  };
  color?: string; // Optional fallback solid color for wireframe/shaded non-texture rendering
}

export interface MinecraftHatModel {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'COMMON' | 'RARE' | 'DELUXE' | 'LEGENDARY' | 'EXCLUSIVE' | 'ULTRA';
  rarityColor: string;
  price: number;
  bgGradient: string;
  glowColor: string;
  elements: MinecraftModelElement[];
  textureType: string;
}

// 1. Steve's Head Model (Standard 8x8x8 block positioned at [4, 8, 4] to [12, 16, 12])
export const STEVE_HEAD_ELEMENT: MinecraftModelElement = {
  from: [4, 8, 4],
  to: [12, 16, 12],
  faces: {
    north: { uv: [8, 8, 16, 16], texture: '#head' },  // Face
    south: { uv: [24, 8, 32, 16], texture: '#head' }, // Back
    west: { uv: [0, 8, 8, 16], texture: '#head' },    // Left ear side
    east: { uv: [16, 8, 24, 16], texture: '#head' },   // Right ear side
    up: { uv: [8, 0, 16, 8], texture: '#head' },       // Top of hair
    down: { uv: [16, 0, 24, 8], texture: '#head' },    // Neck bottom
  }
};

// 2. Hat Models
export const MINECRAFT_HATS: { [key: string]: MinecraftHatModel } = {
  cowboy: {
    id: 'cowboy',
    name: 'Cowboy Hat',
    description: 'A rugged brown leather Stetson hat. Yeehaw! Perfect for high-noon standoffs.',
    category: 'Wild West Cosmetic',
    rarity: 'RARE',
    rarityColor: 'from-blue-500/20 to-indigo-600/30 text-blue-300 border-blue-500/40',
    price: 45,
    bgGradient: 'from-amber-950/40 via-zinc-900 to-black',
    glowColor: 'bg-amber-500/20',
    textureType: 'cowboy',
    elements: [
      // Wide Brim
      {
        from: [1, 15.8, 1],
        to: [15, 16.4, 15],
        faces: {
          up: { uv: [0, 0, 14, 14], texture: '#layer0' },
          down: { uv: [0, 14, 14, 28], texture: '#layer0' },
          north: { uv: [14, 0, 28, 1], texture: '#layer0' },
          south: { uv: [14, 1, 28, 2], texture: '#layer0' },
          west: { uv: [14, 2, 28, 3], texture: '#layer0' },
          east: { uv: [14, 3, 28, 4], texture: '#layer0' },
        }
      },
      // Hat Band
      {
        from: [3.8, 16.4, 3.8],
        to: [12.2, 17.2, 12.2],
        faces: {
          north: { uv: [28, 0, 36, 1], texture: '#layer0' },
          south: { uv: [28, 1, 36, 2], texture: '#layer0' },
          west: { uv: [28, 2, 36, 3], texture: '#layer0' },
          east: { uv: [28, 3, 36, 4], texture: '#layer0' },
        }
      },
      // Hat Crown
      {
        from: [4, 17.2, 4],
        to: [12, 20.5, 12],
        faces: {
          up: { uv: [0, 28, 8, 36], texture: '#layer0' },
          north: { uv: [8, 28, 16, 31], texture: '#layer0' },
          south: { uv: [16, 28, 24, 31], texture: '#layer0' },
          west: { uv: [24, 28, 32, 31], texture: '#layer0' },
          east: { uv: [32, 28, 40, 31], texture: '#layer0' },
        }
      }
    ]
  },
  crown: {
    id: 'crown',
    name: 'Royal Crown',
    description: 'A dazzling golden crown studded with royal rubies and sapphires. Fit for a streamer-king or queen!',
    category: 'Regal Cosmetic',
    rarity: 'LEGENDARY',
    rarityColor: 'from-rose-500/20 to-red-600/30 text-rose-300 border-rose-500/40',
    price: 150,
    bgGradient: 'from-rose-950/40 via-zinc-900 to-black',
    glowColor: 'bg-rose-500/20',
    textureType: 'crown',
    elements: [
      // Base gold band
      {
        from: [3.5, 15.8, 3.5],
        to: [12.5, 17.2, 12.5],
        faces: {
          up: { uv: [0, 0, 9, 9], texture: '#layer0' },
          down: { uv: [0, 9, 9, 18], texture: '#layer0' },
          north: { uv: [9, 0, 18, 2], texture: '#layer0' },
          south: { uv: [9, 2, 18, 4], texture: '#layer0' },
          west: { uv: [9, 4, 18, 6], texture: '#layer0' },
          east: { uv: [9, 6, 18, 8], texture: '#layer0' },
        }
      },
      // Front Spike
      {
        from: [7.2, 17.2, 3.5],
        to: [8.8, 19.2, 4.2],
        faces: {
          north: { uv: [18, 0, 20, 2], texture: '#layer0' },
          south: { uv: [18, 2, 20, 4], texture: '#layer0' },
          west: { uv: [18, 4, 19, 6], texture: '#layer0' },
          east: { uv: [19, 4, 20, 6], texture: '#layer0' },
          up: { uv: [20, 0, 22, 1], texture: '#layer0' },
        }
      },
      // Back Spike
      {
        from: [7.2, 17.2, 11.8],
        to: [8.8, 19.2, 12.5],
        faces: {
          north: { uv: [18, 6, 20, 8], texture: '#layer0' },
          south: { uv: [18, 8, 20, 10], texture: '#layer0' },
          west: { uv: [20, 6, 21, 8], texture: '#layer0' },
          east: { uv: [21, 6, 22, 8], texture: '#layer0' },
          up: { uv: [22, 1, 24, 2], texture: '#layer0' },
        }
      },
      // Left Spike
      {
        from: [3.5, 17.2, 7.2],
        to: [4.2, 19.2, 8.8],
        faces: {
          north: { uv: [22, 2, 23, 4], texture: '#layer0' },
          south: { uv: [23, 2, 24, 4], texture: '#layer0' },
          west: { uv: [24, 0, 26, 2], texture: '#layer0' },
          east: { uv: [24, 2, 26, 4], texture: '#layer0' },
          up: { uv: [26, 0, 27, 2], texture: '#layer0' },
        }
      },
      // Right Spike
      {
        from: [11.8, 17.2, 7.2],
        to: [12.5, 19.2, 8.8],
        faces: {
          north: { uv: [22, 4, 23, 6], texture: '#layer0' },
          south: { uv: [23, 4, 24, 6], texture: '#layer0' },
          west: { uv: [24, 4, 26, 6], texture: '#layer0' },
          east: { uv: [24, 6, 26, 8], texture: '#layer0' },
          up: { uv: [27, 0, 28, 2], texture: '#layer0' },
        }
      }
    ]
  },
  slime: {
    id: 'slime',
    name: 'Slime Hat',
    description: 'A bouncy, squishy, semi-transparent green slime sitting happily on your head. Complete with wiggle eyes!',
    category: 'Meme Cosmetic',
    rarity: 'EXCLUSIVE',
    rarityColor: 'from-amber-500/20 to-orange-600/30 text-amber-300 border-amber-500/40',
    price: 95,
    bgGradient: 'from-amber-950/40 via-zinc-900 to-black',
    glowColor: 'bg-emerald-500/20',
    textureType: 'slime',
    elements: [
      // Transparent Jelly Body
      {
        from: [3.2, 15.5, 3.2],
        to: [12.8, 23.5, 12.8],
        faces: {
          up: { uv: [0, 0, 10, 10], texture: '#layer0' },
          down: { uv: [0, 10, 10, 20], texture: '#layer0' },
          north: { uv: [10, 0, 20, 8], texture: '#layer0' },
          south: { uv: [10, 8, 20, 16], texture: '#layer0' },
          west: { uv: [20, 0, 30, 8], texture: '#layer0' },
          east: { uv: [20, 8, 30, 16], texture: '#layer0' },
        }
      },
      // Dark Core (Mouth and Core inside)
      {
        from: [5.5, 17.5, 5.5],
        to: [10.5, 21.5, 10.5],
        faces: {
          up: { uv: [30, 0, 35, 5], texture: '#layer0' },
          north: { uv: [30, 5, 35, 9], texture: '#layer0' },
          south: { uv: [35, 5, 40, 9], texture: '#layer0' },
          west: { uv: [40, 0, 45, 4], texture: '#layer0' },
          east: { uv: [40, 4, 45, 8], texture: '#layer0' },
        }
      }
    ]
  },
  chef: {
    id: 'chef',
    name: 'Chef Hat',
    description: 'A tall, puffed baker’s toque. Let him cook! Ideal for culinary masters in Minecraft.',
    category: 'Chef Cosmetic',
    rarity: 'DELUXE',
    rarityColor: 'from-yellow-500/20 to-amber-600/30 text-yellow-300 border-yellow-500/40',
    price: 60,
    bgGradient: 'from-yellow-950/40 via-zinc-900 to-black',
    glowColor: 'bg-zinc-400/20',
    textureType: 'chef',
    elements: [
      // Base tighter rim
      {
        from: [3.5, 15.8, 3.5],
        to: [12.5, 17.5, 12.5],
        faces: {
          up: { uv: [0, 0, 9, 9], texture: '#layer0' },
          down: { uv: [0, 9, 9, 18], texture: '#layer0' },
          north: { uv: [9, 0, 18, 2], texture: '#layer0' },
          south: { uv: [9, 2, 18, 4], texture: '#layer0' },
          west: { uv: [9, 4, 18, 6], texture: '#layer0' },
          east: { uv: [9, 6, 18, 8], texture: '#layer0' },
        }
      },
      // Puffy, larger top cylinder
      {
        from: [2.5, 17.5, 2.5],
        to: [13.5, 24.5, 13.5],
        faces: {
          up: { uv: [18, 0, 29, 11], texture: '#layer0' },
          down: { uv: [18, 11, 29, 22], texture: '#layer0' },
          north: { uv: [0, 18, 11, 25], texture: '#layer0' },
          south: { uv: [11, 18, 22, 25], texture: '#layer0' },
          west: { uv: [22, 18, 33, 25], texture: '#layer0' },
          east: { uv: [29, 11, 40, 18], texture: '#layer0' },
        }
      }
    ]
  },
  santa: {
    id: 'santa',
    name: 'Santa Hat',
    description: 'A cozy holiday hat. Soft red velvet trimmed with fluffy white snow-fur and a dangling pompom.',
    category: 'Seasonal Cosmetic',
    rarity: 'DELUXE',
    rarityColor: 'from-yellow-500/20 to-amber-600/30 text-yellow-300 border-yellow-500/40',
    price: 80,
    bgGradient: 'from-yellow-950/40 via-zinc-900 to-black',
    glowColor: 'bg-red-500/20',
    textureType: 'santa',
    elements: [
      // Fluffy White Brim
      {
        from: [3.5, 15.8, 3.5],
        to: [12.5, 17.2, 12.5],
        faces: {
          north: { uv: [0, 0, 9, 2], texture: '#layer0' },
          south: { uv: [0, 2, 9, 4], texture: '#layer0' },
          west: { uv: [0, 4, 9, 6], texture: '#layer0' },
          east: { uv: [0, 6, 9, 8], texture: '#layer0' },
          up: { uv: [9, 0, 18, 9], texture: '#layer0' },
        }
      },
      // Red Cap Cone
      {
        from: [4, 17.2, 4],
        to: [12, 21.0, 12],
        faces: {
          north: { uv: [18, 0, 26, 4], texture: '#layer0' },
          south: { uv: [18, 4, 26, 8], texture: '#layer0' },
          west: { uv: [26, 0, 34, 4], texture: '#layer0' },
          east: { uv: [26, 4, 34, 8], texture: '#layer0' },
          up: { uv: [34, 0, 42, 8], texture: '#layer0' },
        }
      },
      // Slanted hat fold
      {
        from: [6, 21.0, 7.5],
        to: [11.5, 23.5, 11.5],
        faces: {
          north: { uv: [0, 18, 6, 21], texture: '#layer0' },
          south: { uv: [0, 21, 6, 24], texture: '#layer0' },
          west: { uv: [6, 18, 10, 21], texture: '#layer0' },
          east: { uv: [6, 21, 10, 24], texture: '#layer0' },
          up: { uv: [10, 18, 16, 22], texture: '#layer0' },
        }
      },
      // White Pompom
      {
        from: [10.5, 20.0, 9.0],
        to: [12.5, 22.0, 11.0],
        faces: {
          north: { uv: [34, 8, 36, 10], texture: '#layer0' },
          south: { uv: [34, 10, 36, 12], texture: '#layer0' },
          west: { uv: [36, 8, 38, 10], texture: '#layer0' },
          east: { uv: [36, 10, 38, 12], texture: '#layer0' },
          up: { uv: [38, 8, 40, 10], texture: '#layer0' },
          down: { uv: [38, 10, 40, 12], texture: '#layer0' },
        }
      }
    ]
  },
  witch: {
    id: 'witch',
    name: 'Witch Hat',
    description: 'A pointy, spooky, wide-brimmed witch hat with a green ribbon and brass buckle.',
    category: 'Spooky Cosmetic',
    rarity: 'ULTRA',
    rarityColor: 'from-purple-500/20 to-indigo-600/30 text-purple-300 border-purple-500/40',
    price: 110,
    bgGradient: 'from-purple-950/40 via-zinc-900 to-black',
    glowColor: 'bg-purple-500/20',
    textureType: 'witch',
    elements: [
      // Giant Brim
      {
        from: [0.5, 15.8, 0.5],
        to: [15.5, 16.4, 15.5],
        faces: {
          up: { uv: [0, 0, 15, 15], texture: '#layer0' },
          down: { uv: [0, 15, 15, 30], texture: '#layer0' },
        }
      },
      // Green buckle belt
      {
        from: [3.8, 16.4, 3.8],
        to: [12.2, 17.5, 12.2],
        faces: {
          north: { uv: [15, 0, 23, 1], texture: '#layer0' },
          south: { uv: [15, 1, 23, 2], texture: '#layer0' },
          west: { uv: [15, 2, 23, 3], texture: '#layer0' },
          east: { uv: [15, 3, 23, 4], texture: '#layer0' },
        }
      },
      // Cone Section 1 (base)
      {
        from: [4, 17.5, 4],
        to: [12, 20.5, 12],
        faces: {
          north: { uv: [23, 0, 31, 3], texture: '#layer0' },
          south: { uv: [23, 3, 31, 6], texture: '#layer0' },
          west: { uv: [31, 0, 39, 3], texture: '#layer0' },
          east: { uv: [31, 3, 39, 6], texture: '#layer0' },
          up: { uv: [39, 0, 47, 8], texture: '#layer0' },
        }
      },
      // Cone Section 2 (pointed, angled slightly)
      {
        from: [5, 20.5, 5],
        to: [11, 23.5, 11],
        faces: {
          north: { uv: [0, 30, 6, 33], texture: '#layer0' },
          south: { uv: [0, 33, 6, 36], texture: '#layer0' },
          west: { uv: [6, 30, 12, 33], texture: '#layer0' },
          east: { uv: [6, 33, 12, 36], texture: '#layer0' },
          up: { uv: [12, 30, 18, 36], texture: '#layer0' },
        }
      },
      // Cone Tip (dangling tip)
      {
        from: [6.5, 23.5, 6.0],
        to: [9.5, 26.5, 9.0],
        faces: {
          north: { uv: [18, 30, 21, 33], texture: '#layer0' },
          south: { uv: [18, 33, 21, 36], texture: '#layer0' },
          west: { uv: [21, 30, 24, 33], texture: '#layer0' },
          east: { uv: [21, 33, 24, 36], texture: '#layer0' },
          up: { uv: [24, 30, 27, 33], texture: '#layer0' },
        }
      }
    ]
  },
  top_hat: {
    id: 'top_hat',
    name: 'Gentleman Top Hat',
    description: 'A sophisticated black top hat with a vibrant red ribbon. Highly classy, perfect for theater and high society.',
    category: 'Classy Cosmetic',
    rarity: 'ULTRA',
    rarityColor: 'from-purple-500/20 to-indigo-600/30 text-purple-300 border-purple-500/40',
    price: 75,
    bgGradient: 'from-purple-950/40 via-zinc-900 to-black',
    glowColor: 'bg-zinc-800/40',
    textureType: 'top_hat',
    elements: [
      // Brim
      {
        from: [2, 15.8, 2],
        to: [14, 16.4, 14],
        faces: {
          up: { uv: [0, 0, 12, 12], texture: '#layer0' },
          down: { uv: [0, 12, 12, 24], texture: '#layer0' },
          north: { uv: [12, 0, 24, 1], texture: '#layer0' },
          south: { uv: [12, 1, 24, 2], texture: '#layer0' },
          west: { uv: [12, 2, 24, 3], texture: '#layer0' },
          east: { uv: [12, 3, 24, 4], texture: '#layer0' },
        }
      },
      // Red ribbon
      {
        from: [3.8, 16.4, 3.8],
        to: [12.2, 17.5, 12.2],
        faces: {
          north: { uv: [24, 0, 32, 1], texture: '#layer0' },
          south: { uv: [24, 1, 32, 2], texture: '#layer0' },
          west: { uv: [24, 2, 32, 3], texture: '#layer0' },
          east: { uv: [24, 3, 32, 4], texture: '#layer0' },
        }
      },
      // Tall cylinder
      {
        from: [4, 17.5, 4],
        to: [12, 24.5, 12],
        faces: {
          up: { uv: [0, 24, 8, 32], texture: '#layer0' },
          north: { uv: [8, 24, 16, 31], texture: '#layer0' },
          south: { uv: [16, 24, 24, 31], texture: '#layer0' },
          west: { uv: [24, 24, 32, 31], texture: '#layer0' },
          east: { uv: [32, 24, 40, 31], texture: '#layer0' },
        }
      }
    ]
  }
};

// 3. Procedural Texture Painter for 2D Canvas matching Minecraft UV layout
export function drawProceduralTexture(type: string, ctx: CanvasRenderingContext2D) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);

  // Use crisp, blocky pixel rendering
  ctx.imageSmoothingEnabled = false;

  const scaleX = width / 64;
  const scaleY = height / 32;

  function fillPix(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(w * scaleX), Math.ceil(h * scaleY));
  }

  if (type === 'steve_head') {
    // Standard Steve Face (64x64 or 64x32 mapping)
    // Skin colors: #fbc599, #db9c6d
    // Hair colors: #503018, #2f1808
    // Eyes: white/blue
    // Mouth: #983c2e
    
    // Background Neck/Bottom
    ctx.fillStyle = '#db9c6d';
    ctx.fillRect(0, 0, width, height);

    // 1. Hair Top (8,0) to (16,8)
    fillPix(8, 0, 8, 8, '#503018');
    // Top of head details
    fillPix(10, 2, 4, 4, '#2f1808');

    // 2. Face Front (8,8) to (16,16)
    fillPix(8, 8, 8, 8, '#fbc599');
    // Steve Eyes
    fillPix(9, 11, 2, 1, '#ffffff'); // Left eye white
    fillPix(10, 11, 1, 1, '#4a5bbf'); // Left eye pupil (blue)
    fillPix(13, 11, 2, 1, '#ffffff'); // Right eye white
    fillPix(13, 11, 1, 1, '#4a5bbf'); // Right eye pupil (blue)
    // Nose
    fillPix(11, 12, 2, 1, '#db9c6d');
    // Beard / Mouth
    fillPix(11, 13, 2, 1, '#983c2e'); // Mouth
    fillPix(10, 13, 1, 2, '#503018'); // Mustache left
    fillPix(13, 13, 1, 2, '#503018'); // Mustache right
    fillPix(11, 14, 2, 1, '#503018'); // Mustache center

    // Hair overlap on face
    fillPix(8, 8, 8, 2, '#503018');
    fillPix(8, 10, 1, 1, '#503018');
    fillPix(15, 10, 1, 1, '#503018');

    // 3. Side Head (Left Side) (0,8) to (8,16)
    fillPix(0, 8, 8, 8, '#fbc599');
    fillPix(0, 8, 8, 4, '#503018');
    fillPix(4, 12, 4, 4, '#503018'); // Hair drops down back

    // 4. Side Head (Right Side) (16,8) to (24,16)
    fillPix(16, 8, 8, 8, '#fbc599');
    fillPix(16, 8, 8, 4, '#503018');
    fillPix(16, 12, 4, 4, '#503018');

    // 5. Back of Head (24,8) to (32,16)
    fillPix(24, 8, 8, 8, '#503018');
    fillPix(24, 14, 8, 2, '#2f1808'); // Shaded back bottom

  } else if (type === 'cowboy') {
    // Rich brown leather leather texture with some nice dark leather highlights and wood grain.
    ctx.fillStyle = '#8b5a2c'; // Base leather
    ctx.fillRect(0, 0, width, height);

    // Add noise / texture
    for (let i = 0; i < 40; i++) {
      const rx = Math.floor(Math.random() * 64);
      const ry = Math.floor(Math.random() * 32);
      const randColor = Math.random() < 0.5 ? '#704620' : '#a06e3e';
      fillPix(rx, ry, 1 + Math.floor(Math.random() * 3), 1, randColor);
    }

    // Cowboy Hatband: Dark chocolate brown (at the band UV: x from 28 to 36, y from 0 to 4)
    fillPix(28, 0, 8, 4, '#381c0e');
    // Golden Buckle in the center of the band (say at x=31, y=1)
    fillPix(31, 1, 2, 2, '#f59e0b');
    fillPix(31.5, 1.5, 1, 1, '#fef08a');

  } else if (type === 'crown') {
    // Rich royal gold, bright shiny, with gems
    ctx.fillStyle = '#f59e0b'; // Royal Gold
    ctx.fillRect(0, 0, width, height);

    // Golden Highlights
    for (let i = 0; i < 20; i++) {
      const rx = Math.floor(Math.random() * 64);
      const ry = Math.floor(Math.random() * 32);
      fillPix(rx, ry, 1, 1, '#fbbf24');
    }
    // Darker gold creases
    for (let i = 0; i < 15; i++) {
      const rx = Math.floor(Math.random() * 64);
      const ry = Math.floor(Math.random() * 32);
      fillPix(rx, ry, 1, 1, '#b45309');
    }

    // Jewels: Rubies and Sapphires (placed systematically on the crown band at north/south/east/west faces)
    // North Band is UV: x from 9 to 18, y from 0 to 2
    fillPix(11, 0, 1, 1, '#ef4444'); // Ruby (red)
    fillPix(14, 0, 1, 1, '#3b82f6'); // Sapphire (blue)
    fillPix(16, 0, 1, 1, '#ef4444'); // Ruby (red)

    // South Band is UV: x from 9 to 18, y from 2 to 4
    fillPix(11, 2, 1, 1, '#3b82f6');
    fillPix(14, 2, 1, 1, '#ef4444');
    fillPix(16, 2, 1, 1, '#3b82f6');

    // Spike elements (rubies on top of gold arches)
    // UV: x from 18 to 28, y from 0 to 10
    fillPix(19, 1, 1, 1, '#fef08a'); // Shiny diamonds
    fillPix(21, 5, 1, 1, '#ef4444'); // Ruby on spikes
    fillPix(25, 1, 1, 1, '#3b82f6'); // Sapphire

  } else if (type === 'slime') {
    // Lime green translucent jelly texture, with darker core
    ctx.fillStyle = 'rgba(34, 197, 94, 0.4)'; // Transparent Lime Green
    ctx.fillRect(0, 0, width, height);

    // Draw lime green block outlines and bubbles inside
    for (let i = 0; i < 25; i++) {
      const rx = Math.floor(Math.random() * 64);
      const ry = Math.floor(Math.random() * 32);
      ctx.fillStyle = Math.random() < 0.5 ? 'rgba(74, 222, 128, 0.6)' : 'rgba(21, 128, 61, 0.5)';
      ctx.fillRect(rx * scaleX, ry * scaleY, scaleX, scaleY);
    }

    // Slime Face on the outer layer (North UV: x from 10 to 20, y from 0 to 8)
    // In Minecraft, the slime has two 2x2 square eyes and a tiny 1x2 mouth
    fillPix(12, 2, 2, 2, '#14532d'); // Left Eye (Dark Green)
    fillPix(16, 2, 2, 2, '#14532d'); // Right Eye
    fillPix(14, 5, 2, 1, '#14532d'); // Mouth

    // Inner Core (UV: x from 30 to 45, y from 0 to 10)
    // Draw a dark green opaque slime core
    ctx.fillStyle = '#15803d'; // Opaque Dark Green Core
    ctx.fillRect(30 * scaleX, 0, 15 * scaleX, 10 * scaleY);
    // Draw core face
    fillPix(32, 2, 1, 1, '#052e16');
    fillPix(36, 2, 1, 1, '#052e16');
    fillPix(34, 4, 1, 1, '#052e16');

  } else if (type === 'chef') {
    // Pure clean white with light grey shadowing for puffiness
    ctx.fillStyle = '#f9fafb'; // White fabric
    ctx.fillRect(0, 0, width, height);

    // Subtle shaded folds / folds of toque
    for (let i = 0; i < 30; i++) {
      const rx = Math.floor(Math.random() * 64);
      const ry = Math.floor(Math.random() * 32);
      fillPix(rx, ry, 2 + Math.floor(Math.random() * 2), 1, Math.random() < 0.5 ? '#e5e7eb' : '#f3f4f6');
    }

    // Dark grey crease shading on cylinder borders to show round puffiness
    // Chef Brim is UV: x from 9 to 18, y from 0 to 8
    fillPix(9, 7, 9, 1, '#d1d5db'); // Dark shadow on brim base

  } else if (type === 'santa') {
    // Red velvet and white snow fur
    ctx.fillStyle = '#dc2626'; // Christmas Red
    ctx.fillRect(0, 0, width, height);

    // Red shading / velvet noise
    for (let i = 0; i < 20; i++) {
      const rx = Math.floor(Math.random() * 64);
      const ry = Math.floor(Math.random() * 32);
      fillPix(rx, ry, 2, 1, '#991b1b');
    }

    // White fluffy snow brim (UV: x from 0 to 18, y from 0 to 9)
    ctx.fillStyle = '#f9fafb'; // Crisp White
    ctx.fillRect(0, 0, 18 * scaleX, 9 * scaleY);
    // Add fluffy grey texture details on the brim
    for (let i = 0; i < 12; i++) {
      const rx = Math.floor(Math.random() * 18);
      const ry = Math.floor(Math.random() * 9);
      fillPix(rx, ry, 1, 1, '#e5e7eb');
    }

    // White Pompom (UV: x from 34 to 40, y from 8 to 12)
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(34 * scaleX, 8 * scaleY, 6 * scaleX, 4 * scaleY);
    fillPix(35, 9, 1, 1, '#cbd5e1');
    fillPix(37, 10, 1, 1, '#cbd5e1');

  } else if (type === 'witch') {
    // Spooky purple/black with a lime-green buckle strap and golden buckle
    ctx.fillStyle = '#311042'; // Dark purple witch fabric
    ctx.fillRect(0, 0, width, height);

    // Spooky Shading
    for (let i = 0; i < 25; i++) {
      const rx = Math.floor(Math.random() * 64);
      const ry = Math.floor(Math.random() * 32);
      fillPix(rx, ry, 1 + Math.floor(Math.random() * 2), 1, Math.random() < 0.5 ? '#1a0524' : '#4d2063');
    }

    // Lime green buckle strap (UV: x from 15 to 23, y from 0 to 4)
    fillPix(15, 0, 8, 4, '#22c55e');
    // Golden Buckle in front
    fillPix(18, 1, 2, 2, '#fbbf24');
    fillPix(18.5, 1.5, 1, 1, '#1e1b4b'); // Inner buckle cut-out

  } else if (type === 'top_hat') {
    // Shiny charcoal black silk with hot scarlet red ribbon
    ctx.fillStyle = '#1e1b1e'; // Dark silk black
    ctx.fillRect(0, 0, width, height);

    // Shiny silk noise
    for (let i = 0; i < 25; i++) {
      const rx = Math.floor(Math.random() * 64);
      const ry = Math.floor(Math.random() * 32);
      fillPix(rx, ry, 2, 1, Math.random() < 0.5 ? '#110e11' : '#3f3a40');
    }

    // Scarlet ribbon (UV: x from 24 to 32, y from 0 to 4)
    fillPix(24, 0, 8, 4, '#e11d48'); // Rich ruby/scarlet red ribbon
    fillPix(27, 1, 2, 2, '#f43f5e'); // Highlight in center
  }
}
