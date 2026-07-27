import React, { useRef, useEffect, useState } from 'react';
import { 
  MinecraftModelElement, 
  MINECRAFT_HATS, 
  STEVE_HEAD_ELEMENT, 
  drawProceduralTexture 
} from '../utils/minecraftModelData';
import { extractHatAssets } from '../utils/zipLoader';

interface MinecraftHatRendererProps {
  modelId?: string; // cowboy, crown, slime, chef, santa, witch, top_hat
  customModelElements?: MinecraftModelElement[]; // For custom uploaded models
  customTextureImage?: HTMLImageElement | null;  // For custom uploaded textures
  autoRotate?: boolean;
  showHead?: boolean;
  width?: number;
  height?: number;
  zoom?: number;
  interactive?: boolean;
  onHover?: () => void;
  headSkinType?: 'steve' | 'custom';
  customHeadTextureImage?: HTMLImageElement | null;
  dyeColor?: string | null;
  showDragIndicator?: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface FaceToRender {
  vertices2D: { x: number; y: number }[];
  avgZ: number;
  faceName: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
  uv: [number, number, number, number] | null;
  textureSource: 'head' | 'layer0';
  solidColor?: string;
  isHead: boolean;
}

export const MinecraftHatRenderer: React.FC<MinecraftHatRendererProps> = ({
  modelId = 'cowboy',
  customModelElements,
  customTextureImage,
  autoRotate = true,
  showHead = false,
  width = 200,
  height = 200,
  zoom = 1.0,
  interactive = true,
  headSkinType = 'steve',
  customHeadTextureImage = null,
  dyeColor = null,
  showDragIndicator = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [yaw, setYaw] = useState<number>(-0.5); // Initial horizontal rotation
  const [pitch, setPitch] = useState<number>(-0.25); // Initial vertical tilt
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartAngles = useRef<{ yaw: number; pitch: number }>({ yaw: 0, pitch: 0 });
  const autoRotateAngleRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  // States for dynamically fetched custom models & textures
  const [fetchedElements, setFetchedElements] = useState<MinecraftModelElement[] | null>(null);
  const [fetchedTexture, setFetchedTexture] = useState<HTMLImageElement | null>(null);
  const [fetchedTextureSize, setFetchedTextureSize] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to load custom model & texture when modelId is a dynamically generated one
  useEffect(() => {
    const builtInTypes = ['cowboy', 'crown', 'slime', 'chef', 'santa', 'witch', 'top_hat'];
    if (!modelId || builtInTypes.includes(modelId) || modelId === 'sandbox') {
      setFetchedElements(null);
      setFetchedTexture(null);
      setFetchedTextureSize(null);
      setError(null);
      return;
    }

    let isSubscribed = true;
    setLoading(true);
    setError(null);

    const loadModelAndTexture = async () => {
      try {
        console.log(`MinecraftHatRenderer: Loading model "${modelId}" from zip`);
        // Load model elements and texture blob url from the zip package client-side
        const { elements: rawElements, textureUrl } = await extractHatAssets(modelId);

        if (!isSubscribed) return;
        console.log(`MinecraftHatRenderer: Successfully fetched assets for "${modelId}" from zip`);

        // Fetch/load the texture image from the generated blob URL
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load texture image from zip for ${modelId}`));
          img.src = textureUrl;
        });

        if (!isSubscribed) return;

        // Calculate scaling factors for UV based on loaded image dimensions (standard Minecraft UV is 0..16)
        const scaleU = img.naturalWidth / 16;
        // If height is greater than width, it's typically an animated vertical texture strip,
        // so a single frame's height equals the width of the image.
        const frameHeight = img.naturalHeight > img.naturalWidth ? img.naturalWidth : img.naturalHeight;
        const scaleV = frameHeight / 16;

        // Determine Y-offset shift automatically:
        // Rule: If any element starts at Y <= 1 and ends at Y >= 12, it's a helmet (shift by 8 to cover head).
        // Otherwise, it's a hat that sits on top of the head (shift by 16).
        let isHelmet = false;
        rawElements.forEach((el: any) => {
          const fromY = el.from ? el.from[1] : 0;
          const toY = el.to ? el.to[1] : 0;
          if (fromY <= 1 && toY >= 12) {
            isHelmet = true;
          }
        });

        const yShift = isHelmet ? 8 : 16;

        // Clean and map elements
        const mappedElements: MinecraftModelElement[] = rawElements.map((el: any) => {
          const from: [number, number, number] = [
            el.from ? el.from[0] : 0,
            (el.from ? el.from[1] : 0) + yShift,
            el.from ? el.from[2] : 0
          ];
          const to: [number, number, number] = [
            el.to ? el.to[0] : 16,
            (el.to ? el.to[1] : 0) + yShift,
            el.to ? el.to[2] : 16
          ];

          const faces: any = {};
          if (el.faces) {
            Object.keys(el.faces).forEach((faceName) => {
              const f = el.faces[faceName];
              if (f && f.uv) {
                // scale standard 16x16 grid UV to actual pixel dimensions
                faces[faceName] = {
                  uv: [
                    f.uv[0] * scaleU,
                    f.uv[1] * scaleV,
                    f.uv[2] * scaleU,
                    f.uv[3] * scaleV
                  ],
                  texture: '#layer0'
                };
              }
            });
          }

          return { from, to, faces };
        });

        setFetchedElements(mappedElements);
        setFetchedTexture(img);
        setLoading(false);
      } catch (err: any) {
        console.error(`Error loading hat assets from zip for "${modelId}":`, err);
        if (isSubscribed) {
          setError(err?.message || String(err));
          setLoading(false);
        }
      }
    };

    loadModelAndTexture();

    return () => {
      isSubscribed = false;
    };
  }, [modelId]);

  // Textures caches (In-memory canvas elements)
  const texturesRef = useRef<{ [key: string]: HTMLCanvasElement }>({});

  // Initialize cached procedural textures on mount
  useEffect(() => {
    const headCanvas = document.createElement('canvas');
    headCanvas.width = 64;
    headCanvas.height = 32;
    const headCtx = headCanvas.getContext('2d');
    if (headCtx) {
      drawProceduralTexture('steve_head', headCtx);
      texturesRef.current['head'] = headCanvas;
    }

    // Draw all known hat textures
    const hatTypes = ['cowboy', 'crown', 'slime', 'chef', 'santa', 'witch', 'top_hat'];
    hatTypes.forEach(type => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawProceduralTexture(type, ctx);
        texturesRef.current[type] = canvas;
      }
    });
  }, []);

  // Handle Drag / Rotation Interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    setIsDragging(true);
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartAngles.current = { yaw, pitch };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !interactive) return;
    const deltaX = e.clientX - dragStartMouse.current.x;
    const deltaY = e.clientY - dragStartMouse.current.y;

    // Adjust sensitivity
    const sensitivity = 0.01;
    let newYaw = dragStartAngles.current.yaw + deltaX * sensitivity;
    let newPitch = dragStartAngles.current.pitch + deltaY * sensitivity;

    // Constrain pitch to avoid flipping upside down (-1.4 to 1.4 radians)
    newPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, newPitch));

    setYaw(newYaw);
    setPitch(newPitch);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!interactive || e.touches.length === 0) return;
    setIsDragging(true);
    dragStartMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    dragStartAngles.current = { yaw, pitch };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !interactive || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - dragStartMouse.current.x;
    const deltaY = e.touches[0].clientY - dragStartMouse.current.y;

    const sensitivity = 0.012;
    let newYaw = dragStartAngles.current.yaw + deltaX * sensitivity;
    let newPitch = dragStartAngles.current.pitch + deltaY * sensitivity;

    newPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, newPitch));

    setYaw(newYaw);
    setPitch(newPitch);
  };

  // Main 3D Rendering Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Crucial for Minecraft blocky look
    ctx.imageSmoothingEnabled = false;

    let isDestroyed = false;

    // Animation frame callback
    const render = () => {
      if (isDestroyed) return;

      if (loading) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading Hat...', width / 2, height / 2);
        return;
      }

      if (error) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Load Error', width / 2, height / 2 - 20);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '8px monospace';
        
        // Wrap error text to max 22 characters per line
        const words = error.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        for (const word of words) {
          if ((currentLine + ' ' + word).trim().length <= 22) {
            currentLine = (currentLine + ' ' + word).trim();
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        lines.slice(0, 3).forEach((line, idx) => {
          ctx.fillText(line, width / 2, height / 2 - 5 + (idx * 10));
        });
        return;
      }

      // Handle auto rotation or RGB color cycling
      let currentYaw = yaw;
      if (autoRotate && !isDragging) {
        autoRotateAngleRef.current += 0.012; // slow rot speed
        currentYaw = yaw + autoRotateAngleRef.current;
      }

      const isRgb = modelId?.toLowerCase().includes('rgb');
      const rgbColor = isRgb ? `hsl(${Math.floor((Date.now() / 15) % 360)}, 100%, 60%)` : null;

      // Clear
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Retrieve elements to draw
      const hatData = MINECRAFT_HATS[modelId];
      const elements: MinecraftModelElement[] = [];

      // Add Steve's head if requested
      if (showHead) {
        elements.push(STEVE_HEAD_ELEMENT);
      }

      // Add hat elements
      if (customModelElements) {
        elements.push(...customModelElements);
      } else if (fetchedElements) {
        elements.push(...fetchedElements);
      } else if (hatData) {
        elements.push(...hatData.elements);
      }

      // Compute bounding box for perfect centering & scaling
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      elements.forEach(el => {
        minX = Math.min(minX, el.from[0], el.to[0]);
        maxX = Math.max(maxX, el.from[0], el.to[0]);
        minY = Math.min(minY, el.from[1], el.to[1]);
        maxY = Math.max(maxY, el.from[1], el.to[1]);
        minZ = Math.min(minZ, el.from[2], el.to[2]);
        maxZ = Math.max(maxZ, el.from[2], el.to[2]);
      });

      if (elements.length === 0 || minX === Infinity) {
        minX = 0; maxX = 16; minY = 0; maxY = 16; minZ = 0; maxZ = 16;
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const centerZ = (minZ + maxZ) / 2;

      const sizeX = maxX - minX || 16;
      const sizeY = maxY - minY || 16;
      const sizeZ = maxZ - minZ || 16;
      const maxSize = Math.max(sizeX, sizeY, sizeZ);

      // Projection parameters with auto-scaling based on bounding box size
      const baseScale = (Math.min(width, height) * 0.42) / Math.max(maxSize, 8);
      const scale = baseScale * zoom;
      const originX = width / 2;
      const originY = height / 2;

      // Sine and Cosine of angles
      const cosY = Math.cos(currentYaw);
      const sinY = Math.sin(currentYaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const project = (pt: Point3D): Point3D & { px: number; py: number } => {
        // 1. Center coordinates
        let dx = pt.x - centerX;
        let dy = pt.y - centerY;
        let dz = pt.z - centerZ;

        // 2. Rotate Yaw (around Y axis)
        const xY = dx * cosY - dz * sinY;
        const zY = dx * sinY + dz * cosY;

        // 3. Rotate Pitch (around X axis)
        const yP = dy * cosP - zY * sinP;
        const zP = dy * sinP + zY * cosP;

        // 4. Orthographic projection with slight depth tilting (isometric-ish look)
        // Orthographic mapping:
        const px = originX + xY * scale;
        // Invert Y because canvas draws 0 at the top, but Minecraft height Y is positive upwards
        const py = originY - yP * scale;

        return { x: xY, y: yP, z: zP, px, py };
      };

      const facesToRender: FaceToRender[] = [];

      // Process each element's faces
      elements.forEach((elem) => {
        const isHead = elem === STEVE_HEAD_ELEMENT;
        
        const x0 = elem.from[0];
        const y0 = elem.from[1];
        const z0 = elem.from[2];
        const x1 = elem.to[0];
        const y1 = elem.to[1];
        const z1 = elem.to[2];

        // The 8 corners of the cuboid
        const corners: Point3D[] = [
          { x: x0, y: y0, z: z0 }, // v0: bottom-north-west
          { x: x1, y: y0, z: z0 }, // v1: bottom-north-east
          { x: x1, y: y1, z: z0 }, // v2: top-north-east
          { x: x0, y: y1, z: z0 }, // v3: top-north-west
          { x: x0, y: y0, z: z1 }, // v4: bottom-south-west
          { x: x1, y: y0, z: z1 }, // v5: bottom-south-east
          { x: x1, y: y1, z: z1 }, // v6: top-south-east
          { x: x0, y: y1, z: z1 }, // v7: top-south-west
        ];

        // Project all corners
        const pCorners = corners.map(project);

        // Face mappings. Each face consists of 4 vertices (P0, P1, P2, P3)
        // Ordered as: P0 (Top-Left), P1 (Top-Right), P2 (Bottom-Left), P3 (Bottom-Right) in texture space
        const faceConfigs: {
          name: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
          indices: number[]; // corner indexes mapping to [P0, P1, P2, P3]
        }[] = [
          { name: 'north', indices: [3, 2, 0, 1] }, // Front (looking at negative Z)
          { name: 'south', indices: [6, 7, 5, 4] }, // Back (looking at positive Z)
          { name: 'west', indices: [7, 3, 4, 0] },  // Left (looking at negative X)
          { name: 'east', indices: [2, 6, 1, 5] },  // Right (looking at positive X)
          { name: 'up', indices: [3, 2, 7, 6] },    // Top (looking at positive Y)
          { name: 'down', indices: [4, 5, 0, 1] },  // Bottom (looking at negative Y)
        ];

        faceConfigs.forEach((face) => {
          const faceData = elem.faces[face.name];
          if (!faceData) return; // ignore faces not specified in the model

          // Get the 4 projected corners of this face
          const pVerts = face.indices.map(idx => pCorners[idx]);

          // Simple backface culling to prevent sorting glitches (only on opaque faces)
          // For orthographic projection, normal's Z determines if the face is pointing towards us
          // Let's compute normal of P0 -> P1 -> P2 in screen coordinates (or 3D space)
          const p0 = pVerts[0];
          const p1 = pVerts[1];
          const p2 = pVerts[2];

          // 2D cross product to find if counter-clockwise (facing us or back-facing)
          // In canvas coordinates (y is down):
          const cross = (p1.px - p0.px) * (p2.py - p0.py) - (p1.py - p0.py) * (p2.px - p0.px);

          // Render all faces with painter's algorithm (depth sorting) without culling
          // Compute average depth (Z) for painter's algorithm
          const avgZ = (pVerts[0].z + pVerts[1].z + pVerts[2].z + pVerts[3].z) / 4;

          facesToRender.push({
            vertices2D: pVerts.map(v => ({ x: v.px, y: v.py })),
            avgZ,
            faceName: face.name,
            uv: faceData.uv,
            textureSource: faceData.texture === '#head' ? 'head' : 'layer0',
            solidColor: elem.color,
            isHead
          });
        });
      });

      // Sort faces by depth: larger Z is further back in our projection, so render further back first (descending Z)
      // Since positive Z points towards us (due to rotatePitch/Yaw calculation),
      // elements with lower rotated Z are further away, elements with higher Z are closer.
      // So sort in ASCENDING order of avgZ (furthest away gets drawn first, closest last).
      facesToRender.sort((a, b) => a.avgZ - b.avgZ);

      // Render each face
      facesToRender.forEach((face) => {
        const p = face.vertices2D;
        const p0 = p[0];
        const p1 = p[1];
        const p2 = p[2];
        const p3 = p[3];

        // Draw polygon outline and fill
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();

        // Shading factor based on face direction to create realistic blocky 3D depth
        let shadeFactor = 1.0;
        if (face.faceName === 'up') shadeFactor = 1.0;          // Top (brightest)
        else if (face.faceName === 'north') shadeFactor = 0.85;  // Front
        else if (face.faceName === 'south') shadeFactor = 0.80;  // Back
        else if (face.faceName === 'east') shadeFactor = 0.70;   // Right
        else if (face.faceName === 'west') shadeFactor = 0.65;   // Left
        else if (face.faceName === 'down') shadeFactor = 0.50;   // Bottom (darkest)

        // Texture Source Resolution
        let textureCanvas: HTMLCanvasElement | null = null;
        let imageToUse: HTMLImageElement | HTMLCanvasElement | null = null;

        if (face.isHead) {
          imageToUse = customHeadTextureImage || texturesRef.current['head'];
        } else {
          imageToUse = customTextureImage || fetchedTexture || texturesRef.current[modelId] || null;
        }

        // Texture Mapping via Affine Transformation
        if (imageToUse && face.uv) {
          // UV coordinates
          const u0 = face.uv[0];
          const v0 = face.uv[1];
          const u1 = face.uv[2];
          const v1 = face.uv[3];
          const w = u1 - u0;
          const h = v1 - v0;

          ctx.clip(); // clip drawing to the face quad

          // Canvas affine transformation matrix to warp the 2D texture rect onto the 3D projected parallelogram
          // Maps (u0, v0) -> p0, (u1, v0) -> p1, (u0, v1) -> p2
          const m11 = (p1.x - p0.x) / w;
          const m12 = (p1.y - p0.y) / w;
          const m21 = (p2.x - p0.x) / h;
          const m22 = (p2.y - p0.y) / h;
          const dx = p0.x - u0 * m11 - v0 * m21;
          const dy = p0.y - u0 * m12 - v0 * m22;

          ctx.transform(m11, m12, m21, m22, dx, dy);

          // Apply texture filter/shadowing by overlaying a shaded multiplier
          ctx.drawImage(imageToUse, 0, 0);

          if ((dyeColor || rgbColor) && !face.isHead) {
            ctx.fillStyle = rgbColor || dyeColor;
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillRect(-100, -100, 300, 300);
            ctx.globalCompositeOperation = 'source-over';
          }

          // Restore clip, then overlay shading multiplier
          ctx.restore();
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.closePath();

          // Darken overlay
          if (shadeFactor < 1.0) {
            // Slime is translucent, keep shadow translucent too
            const opacity = modelId === 'slime' && !face.isHead ? 0.35 * (1 - shadeFactor) : 1 - shadeFactor;
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.fill();
          }

          // Subtle hairline border to hide pixel gaps in canvas rasterization
          ctx.strokeStyle = modelId === 'slime' && !face.isHead ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 0, 0, 0.15)';
          ctx.lineWidth = 0.5;
          ctx.stroke();

        } else {
          // Solid shaded color fallback if no texture is present
          let baseColor = face.solidColor || '#cccccc';
          if (face.isHead) baseColor = '#e1a980'; // skin color
          
          ctx.fillStyle = baseColor;
          ctx.fill();

          // Apply shading
          ctx.fillStyle = `rgba(0, 0, 0, ${1 - shadeFactor})`;
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.restore();
      });

      ctx.restore();

      if (autoRotate || isDragging || isRgb) {
        requestRef.current = requestAnimationFrame(render);
      }
    };

    // Begin render loop
    render();

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(requestRef.current);
    };
  }, [modelId, yaw, pitch, isDragging, autoRotate, showHead, width, height, zoom, customModelElements, customTextureImage, customHeadTextureImage, fetchedElements, fetchedTexture, loading, error]);

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        className={`cursor-grab active:cursor-grabbing rounded-2xl ${
          interactive ? 'hover:scale-[1.02] transition-transform duration-200' : ''
        }`}
        id={`minecraft-hat-canvas-${modelId}`}
      />
      
      {/* Tiny corner interactive guide indicator */}
      {interactive && showDragIndicator && (
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[8px] text-gray-400 font-mono tracking-widest uppercase px-2 py-0.5 rounded-md border border-white/5 pointer-events-none">
          Drag 3D
        </div>
      )}
    </div>
  );
};
