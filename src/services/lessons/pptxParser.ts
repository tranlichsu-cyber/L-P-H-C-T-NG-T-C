export interface PptxTextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  fontSizePt?: number;
}

export interface PptxParagraph {
  align?: 'left' | 'center' | 'right' | 'justify';
  level?: number;
  bullet?: boolean;
  runs: PptxTextRun[];
}

export type PptxAnimEffect = 'fade' | 'flyIn' | 'zoom' | 'wipe' | 'appear';

export interface PptxShapeElement {
  kind: 'shape';
  id: string;
  spId?: string;
  animStep?: number;
  animEffect?: PptxAnimEffect;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  rotationDeg?: number;
  flipH?: boolean;
  flipV?: boolean;
  svgPath?: string;
  svgViewBox?: string;
  fillColor?: string;
  borderColor?: string;
  borderRadiusPct?: number;
  vAlign?: 'top' | 'middle' | 'bottom';
  isTitle?: boolean;
  paragraphs: PptxParagraph[];
}

export interface PptxImageElement {
  kind: 'image';
  id: string;
  spId?: string;
  animStep?: number;
  animEffect?: PptxAnimEffect;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  rotationDeg?: number;
  flipH?: boolean;
  flipV?: boolean;
  url: string;
}

export interface PptxMediaElement {
  kind: 'video' | 'audio';
  id: string;
  spId?: string;
  animStep?: number;
  animEffect?: PptxAnimEffect;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  url: string;
  posterUrl?: string;
}

export interface PptxTableCell {
  text: string;
  fillColor?: string;
  bold?: boolean;
  color?: string;
  colSpan?: number;
}

export interface PptxTableElement {
  kind: 'table';
  id: string;
  spId?: string;
  animStep?: number;
  animEffect?: PptxAnimEffect;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  rows: PptxTableCell[][];
}

export type PptxSlideElement =
  | PptxShapeElement
  | PptxImageElement
  | PptxMediaElement
  | PptxTableElement;

export interface ParsedPptxSlide {
  index: number;
  title: string;
  summary: string;
  notes: string;
  transition?: 'fade' | 'push' | 'wipe' | 'zoom' | 'slide';
  maxAnimSteps?: number;
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImageUrl?: string;
  elements: PptxSlideElement[];
}

export interface SlideOutlineItem {
  index: number;
  title: string;
  summary: string;
  notes?: string;
}

export interface ParsedPptxPresentation {
  aspectRatio: number;
  slides: ParsedPptxSlide[];
  outlines: SlideOutlineItem[];
  revokeUrls: () => void;
}

interface ZipEntry {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

function readZipCentralDirectory(bytes: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocdOffset = -1;
  const minOffset = Math.max(0, bytes.byteLength - 65557);
  for (let i = bytes.byteLength - 22; i >= minOffset; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) {
    throw new Error('Tệp không phải định dạng .pptx (ZIP) hợp lệ.');
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const entries = new Map<string, ZipEntry>();
  const decoder = new TextDecoder('utf-8');

  let ptr = cdOffset;
  for (let i = 0; i < totalEntries && ptr + 46 <= bytes.byteLength; i++) {
    if (view.getUint32(ptr, true) !== 0x02014b50) break;
    const compressionMethod = view.getUint16(ptr + 10, true);
    const compressedSize = view.getUint32(ptr + 20, true);
    const uncompressedSize = view.getUint32(ptr + 24, true);
    const fileNameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localHeaderOffset = view.getUint32(ptr + 42, true);

    const nameBytes = bytes.subarray(ptr + 46, ptr + 46 + fileNameLen);
    const name = decoder.decode(nameBytes).replace(/\\/g, '/');
    entries.set(name, {
      name,
      compressionMethod,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });

    ptr += 46 + fileNameLen + extraLen + commentLen;
  }

  return entries;
}

async function extractZipEntryBytes(
  archiveBytes: Uint8Array,
  entry: ZipEntry
): Promise<Uint8Array> {
  const view = new DataView(
    archiveBytes.buffer,
    archiveBytes.byteOffset,
    archiveBytes.byteLength
  );
  const lh = entry.localHeaderOffset;
  if (lh + 30 > archiveBytes.byteLength || view.getUint32(lh, true) !== 0x04034b50) {
    throw new Error(`Không đọc được dữ liệu nén: ${entry.name}`);
  }
  const fileNameLen = view.getUint16(lh + 26, true);
  const extraLen = view.getUint16(lh + 28, true);
  const dataStart = lh + 30 + fileNameLen + extraLen;
  const compressed = archiveBytes.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    return compressed;
  }
  if (entry.compressionMethod === 8) {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    void writer.write(compressed as unknown as BufferSource);
    void writer.close();

    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    let totalLen = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        totalLen += value.byteLength;
      }
    }
    const result = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return result;
  }

  throw new Error(`Phương thức nén chưa hỗ trợ (${entry.compressionMethod}).`);
}

async function extractZipText(
  archiveBytes: Uint8Array,
  entries: Map<string, ZipEntry>,
  path: string
): Promise<string | null> {
  const clean = path.replace(/^\/+/, '');
  const entry = entries.get(clean);
  if (!entry) return null;
  const bytes = await extractZipEntryBytes(archiveBytes, entry);
  return new TextDecoder('utf-8').decode(bytes);
}

function parseXml(xmlText: string): Document {
  return new DOMParser().parseFromString(xmlText, 'application/xml');
}

function resolveRelativePath(baseFilePath: string, target: string): string {
  if (target.startsWith('/')) return target.replace(/^\/+/, '');
  const baseParts = baseFilePath.split('/');
  baseParts.pop(); // remove filename
  for (const seg of target.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') {
      baseParts.pop();
    } else {
      baseParts.push(seg);
    }
  }
  return baseParts.join('/');
}

function getLocalTagChildren(parent: Element | Document, localName: string): Element[] {
  const result: Element[] = [];
  const children = parent.children;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.localName === localName) result.push(el);
  }
  return result;
}

function findFirstDescendant(parent: Element | Document, localName: string): Element | null {
  const all = parent.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    if (all[i].localName === localName) return all[i];
  }
  return null;
}

function findAllDescendants(parent: Element | Document, localName: string): Element[] {
  const result: Element[] = [];
  const all = parent.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    if (all[i].localName === localName) result.push(all[i]);
  }
  return result;
}

function parseRelsMap(relsXml: string | null, ownerPath: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!relsXml) return map;
  const doc = parseXml(relsXml);
  const rels = findAllDescendants(doc, 'Relationship');
  for (const rel of rels) {
    const id = rel.getAttribute('Id');
    const target = rel.getAttribute('Target');
    const mode = rel.getAttribute('TargetMode');
    if (id && target) {
      map.set(id, mode === 'External' ? target : resolveRelativePath(ownerPath, target));
    }
  }
  return map;
}

const DEFAULT_THEME_COLORS: Record<string, string> = {
  dk1: '#0f172a',
  lt1: '#ffffff',
  dk2: '#1e293b',
  lt2: '#f1f5f9',
  accent1: '#2563eb',
  accent2: '#ea580c',
  accent3: '#16a34a',
  accent4: '#d97706',
  accent5: '#7c3aed',
  accent6: '#0891b2',
  tx1: '#0f172a',
  tx2: '#334155',
  bg1: '#ffffff',
  bg2: '#f8fafc',
};

function parseThemeColors(themeXml: string | null): Record<string, string> {
  const colors = { ...DEFAULT_THEME_COLORS };
  if (!themeXml) return colors;
  const doc = parseXml(themeXml);
  const clrScheme = findFirstDescendant(doc, 'clrScheme');
  if (!clrScheme) return colors;

  for (const key of ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6']) {
    const node = findFirstDescendant(clrScheme, key);
    if (!node) continue;
    const srgb = findFirstDescendant(node, 'srgbClr')?.getAttribute('val');
    const sys = findFirstDescendant(node, 'sysClr')?.getAttribute('lastClr');
    const hex = srgb || sys;
    if (hex && /^[0-9a-fA-F]{6}$/.test(hex)) {
      colors[key] = `#${hex}`;
    }
  }
  colors.tx1 = colors.dk1;
  colors.tx2 = colors.dk2;
  colors.bg1 = colors.lt1;
  colors.bg2 = colors.lt2;
  return colors;
}

function applyColorModifiers(baseHex: string, clrNode: Element): string {
  let r = parseInt(baseHex.slice(1, 3), 16);
  let g = parseInt(baseHex.slice(3, 5), 16);
  let b = parseInt(baseHex.slice(5, 7), 16);
  let a = 1.0;

  const alpha = findFirstDescendant(clrNode, 'alpha')?.getAttribute('val');
  if (alpha) {
    a = Number(alpha) / 100000;
    if (a <= 0.02) return 'transparent';
  }

  const tint = findFirstDescendant(clrNode, 'tint')?.getAttribute('val');
  if (tint) {
    const t = Number(tint) / 100000;
    r = Math.round(r * t + 255 * (1 - t));
    g = Math.round(g * t + 255 * (1 - t));
    b = Math.round(b * t + 255 * (1 - t));
  }

  const shade = findFirstDescendant(clrNode, 'shade')?.getAttribute('val');
  if (shade) {
    const s = Number(shade) / 100000;
    r = Math.round(r * s);
    g = Math.round(g * s);
    b = Math.round(b * s);
  }

  const lumMod = findFirstDescendant(clrNode, 'lumMod')?.getAttribute('val');
  const lumOff = findFirstDescendant(clrNode, 'lumOff')?.getAttribute('val');
  if (lumMod || lumOff) {
    const mod = lumMod ? Number(lumMod) / 100000 : 1;
    const off = lumOff ? Number(lumOff) / 100000 : 0;
    r = Math.min(255, Math.max(0, Math.round(r * mod + 255 * off)));
    g = Math.min(255, Math.max(0, Math.round(g * mod + 255 * off)));
    b = Math.min(255, Math.max(0, Math.round(b * mod + 255 * off)));
  }

  if (a < 1.0) {
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function resolveColorNode(
  container: Element | null | undefined,
  themeColors: Record<string, string>
): string | undefined {
  if (!container) return undefined;
  const srgb = findFirstDescendant(container, 'srgbClr');
  if (srgb) {
    const val = srgb.getAttribute('val');
    if (val && /^[0-9a-fA-F]{6}$/.test(val)) {
      return applyColorModifiers(`#${val}`, srgb);
    }
  }
  const scheme = findFirstDescendant(container, 'schemeClr');
  if (scheme) {
    const val = scheme.getAttribute('val') || '';
    if (themeColors[val]) {
      return applyColorModifiers(themeColors[val], scheme);
    }
  }
  const prst = findFirstDescendant(container, 'prstClr');
  if (prst) {
    const val = prst.getAttribute('val');
    if (val === 'white') return '#ffffff';
    if (val === 'black') return '#0f172a';
  }
  return undefined;
}

interface ShapeSvgGeometry {
  pathData: string;
  viewBox: string;
}

function parseCustGeom(
  custGeom: Element,
  defaultW: number,
  defaultH: number
): ShapeSvgGeometry | null {
  const pathLst = findFirstDescendant(custGeom, 'pathLst');
  if (!pathLst) return null;
  const paths = findAllDescendants(pathLst, 'path');
  if (paths.length === 0) return null;

  let maxW = defaultW > 0 ? defaultW : 100;
  let maxH = defaultH > 0 ? defaultH : 100;
  const dParts: string[] = [];

  for (const pathEl of paths) {
    const pw = Number(pathEl.getAttribute('w')) || defaultW || 100;
    const ph = Number(pathEl.getAttribute('h')) || defaultH || 100;
    if (pw > maxW) maxW = pw;
    if (ph > maxH) maxH = ph;

    let curX = 0;
    let curY = 0;

    const children = pathEl.children;
    for (let i = 0; i < children.length; i++) {
      const cmdEl = children[i];
      const tag = cmdEl.localName;

      if (tag === 'moveTo') {
        const pt = findFirstDescendant(cmdEl, 'pt');
        if (pt) {
          curX = Number(pt.getAttribute('x')) || 0;
          curY = Number(pt.getAttribute('y')) || 0;
          dParts.push(`M ${curX} ${curY}`);
        }
      } else if (tag === 'lnTo') {
        const pt = findFirstDescendant(cmdEl, 'pt');
        if (pt) {
          curX = Number(pt.getAttribute('x')) || 0;
          curY = Number(pt.getAttribute('y')) || 0;
          dParts.push(`L ${curX} ${curY}`);
        }
      } else if (tag === 'cubicBezTo') {
        const pts = findAllDescendants(cmdEl, 'pt');
        if (pts.length >= 3) {
          const x1 = Number(pts[0].getAttribute('x')) || 0;
          const y1 = Number(pts[0].getAttribute('y')) || 0;
          const x2 = Number(pts[1].getAttribute('x')) || 0;
          const y2 = Number(pts[1].getAttribute('y')) || 0;
          const x3 = Number(pts[2].getAttribute('x')) || 0;
          const y3 = Number(pts[2].getAttribute('y')) || 0;
          curX = x3;
          curY = y3;
          dParts.push(`C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`);
        }
      } else if (tag === 'quadBezTo') {
        const pts = findAllDescendants(cmdEl, 'pt');
        if (pts.length >= 2) {
          const x1 = Number(pts[0].getAttribute('x')) || 0;
          const y1 = Number(pts[0].getAttribute('y')) || 0;
          const x2 = Number(pts[1].getAttribute('x')) || 0;
          const y2 = Number(pts[1].getAttribute('y')) || 0;
          curX = x2;
          curY = y2;
          dParts.push(`Q ${x1} ${y1}, ${x2} ${y2}`);
        }
      } else if (tag === 'arcTo') {
        const rx = Number(cmdEl.getAttribute('wR')) || 0;
        const ry = Number(cmdEl.getAttribute('hR')) || 0;
        const stAng = Number(cmdEl.getAttribute('stAng')) || 0;
        const swAng = Number(cmdEl.getAttribute('swAng')) || 0;
        if (rx > 0 && ry > 0) {
          const stRad = (stAng / 60000) * (Math.PI / 180);
          const endRad = ((stAng + swAng) / 60000) * (Math.PI / 180);
          const cx = curX - rx * Math.cos(stRad);
          const cy = curY - ry * Math.sin(stRad);
          const endX = cx + rx * Math.cos(endRad);
          const endY = cy + ry * Math.sin(endRad);
          const largeArc = Math.abs(swAng / 60000) >= 180 ? 1 : 0;
          const sweep = swAng >= 0 ? 1 : 0;
          curX = endX;
          curY = endY;
          dParts.push(`A ${rx} ${ry} 0 ${largeArc} ${sweep} ${endX.toFixed(2)} ${endY.toFixed(2)}`);
        }
      } else if (tag === 'close') {
        dParts.push('Z');
      }
    }
  }

  if (dParts.length === 0) return null;
  return {
    pathData: dParts.join(' '),
    viewBox: `0 0 ${maxW} ${maxH}`,
  };
}

function parsePrstGeom(prst: string): ShapeSvgGeometry | null {
  switch (prst) {
    case 'ellipse':
      return {
        pathData: 'M 50,0 A 50,50 0 1,0 50,100 A 50,50 0 1,0 50,0 Z',
        viewBox: '0 0 100 100',
      };
    case 'triangle':
    case 'isoscelesTriangle':
      return {
        pathData: 'M 50 0 L 100 100 L 0 100 Z',
        viewBox: '0 0 100 100',
      };
    case 'rtTriangle':
      return {
        pathData: 'M 0 0 L 100 100 L 0 100 Z',
        viewBox: '0 0 100 100',
      };
    case 'diamond':
      return {
        pathData: 'M 50 0 L 100 50 L 50 100 L 0 50 Z',
        viewBox: '0 0 100 100',
      };
    case 'parallelogram':
      return {
        pathData: 'M 25 0 L 100 0 L 75 100 L 0 100 Z',
        viewBox: '0 0 100 100',
      };
    case 'trapezoid':
      return {
        pathData: 'M 20 0 L 80 0 L 100 100 L 0 100 Z',
        viewBox: '0 0 100 100',
      };
    case 'hexagon':
      return {
        pathData: 'M 25 0 L 75 0 L 100 50 L 75 100 L 25 100 L 0 50 Z',
        viewBox: '0 0 100 100',
      };
    case 'cloud':
      return {
        pathData:
          'M 20 60 A 20 20 0 0 1 35 25 A 25 25 0 0 1 70 20 A 20 20 0 0 1 85 45 A 20 20 0 0 1 80 75 A 15 15 0 0 1 65 80 L 30 80 A 15 15 0 0 1 20 60 Z',
        viewBox: '0 0 100 100',
      };
    case 'star5':
      return {
        pathData:
          'M 50 0 L 63 38 L 100 38 L 69 59 L 81 95 L 50 72 L 19 95 L 31 59 L 0 38 L 37 38 Z',
        viewBox: '0 0 100 100',
      };
    case 'heart':
      return {
        pathData:
          'M 50 30 C 50 15, 30 0, 15 15 C 0 30, 15 50, 50 85 C 85 50, 100 30, 85 15 C 70 0, 50 15, 50 30 Z',
        viewBox: '0 0 100 100',
      };
    default:
      return null;
  }
}

function getBlipEmbedId(blip: Element | null | undefined): string | null {
  if (!blip) return null;
  const direct =
    blip.getAttribute('r:embed') ||
    blip.getAttribute('r:link') ||
    blip.getAttribute('embed') ||
    blip.getAttribute('link') ||
    blip.getAttributeNS(
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'embed'
    ) ||
    blip.getAttributeNS(
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'link'
    );
  if (direct) return direct;
  for (let i = 0; i < blip.attributes.length; i++) {
    const a = blip.attributes[i];
    if (a.localName === 'embed' || a.localName === 'link') return a.value;
  }
  return null;
}

function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
    case 'jpe':
    case 'jfif':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'bmp':
    case 'dib':
      return 'image/bmp';
    case 'ico':
      return 'image/x-icon';
    case 'tif':
    case 'tiff':
      return 'image/tiff';
    case 'mp4':
    case 'm4v':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'm4a':
      return 'audio/mp4';
    default:
      return 'image/png';
  }
}

interface PlaceholderBox {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

function extractLayoutPlaceholders(layoutXml: string | null): Map<string, PlaceholderBox> {
  const map = new Map<string, PlaceholderBox>();
  if (!layoutXml) return map;
  const doc = parseXml(layoutXml);
  const shapes = findAllDescendants(doc, 'sp');
  for (const sp of shapes) {
    const ph = findFirstDescendant(sp, 'ph');
    const xfrm = findFirstDescendant(sp, 'xfrm');
    if (!ph || !xfrm) continue;
    const off = findFirstDescendant(xfrm, 'off');
    const ext = findFirstDescendant(xfrm, 'ext');
    if (!off || !ext) continue;
    const x = Number(off.getAttribute('x'));
    const y = Number(off.getAttribute('y'));
    const cx = Number(ext.getAttribute('cx'));
    const cy = Number(ext.getAttribute('cy'));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !cx || !cy) continue;

    const phType = ph.getAttribute('type') || 'body';
    const phIdx = ph.getAttribute('idx') || '';
    if (phIdx) map.set(`idx:${phIdx}`, { x, y, cx, cy });
    if (!map.has(`type:${phType}`)) map.set(`type:${phType}`, { x, y, cx, cy });
  }
  return map;
}

export async function countPptxSlides(blob: Blob): Promise<number> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const entries = readZipCentralDirectory(bytes);
  const presXml = await extractZipText(bytes, entries, 'ppt/presentation.xml');
  if (presXml) {
    const doc = parseXml(presXml);
    const sldIds = findAllDescendants(doc, 'sldId');
    if (sldIds.length > 0) return sldIds.length;
  }
  let count = 0;
  for (const key of entries.keys()) {
    if (/^ppt\/slides\/slide\d+\.xml$/i.test(key)) count++;
  }
  if (count === 0) throw new Error('Không tìm thấy trang slide trong tệp .pptx.');
  return count;
}

export async function parsePptxPresentation(blob: Blob): Promise<ParsedPptxPresentation> {
  const archiveBytes = new Uint8Array(await blob.arrayBuffer());
  const entries = readZipCentralDirectory(archiveBytes);
  const lowerEntries = new Map<string, ZipEntry>();
  for (const [k, v] of entries) {
    lowerEntries.set(k.toLowerCase(), v);
  }

  const createdUrls: string[] = [];
  const mediaUrlCache = new Map<string, string>();

  const getMediaBlobUrl = async (mediaPath: string): Promise<string | null> => {
    const clean = mediaPath.replace(/^\/+/, '');
    if (mediaUrlCache.has(clean)) return mediaUrlCache.get(clean)!;

    let entry = entries.get(clean) || lowerEntries.get(clean.toLowerCase());
    if (!entry) {
      const filename = clean.split('/').pop()?.toLowerCase();
      if (filename) {
        entry =
          lowerEntries.get(`ppt/media/${filename}`) ||
          [...lowerEntries.entries()].find(([k]) => k.endsWith(`/${filename}`))?.[1];
      }
    }
    if (!entry) return null;

    try {
      const raw = await extractZipEntryBytes(archiveBytes, entry);
      const safeBytes =
        raw.byteOffset === 0 && raw.byteLength === raw.buffer.byteLength
          ? raw
          : raw.slice();
      const mime = getMimeType(clean);
      const url = URL.createObjectURL(
        new Blob([safeBytes as unknown as BlobPart], { type: mime })
      );
      createdUrls.push(url);
      mediaUrlCache.set(clean, url);
      return url;
    } catch {
      return null;
    }
  };

  const themeXml = await extractZipText(archiveBytes, entries, 'ppt/theme/theme1.xml');
  const themeColors = parseThemeColors(themeXml);

  const presXml = await extractZipText(archiveBytes, entries, 'ppt/presentation.xml');
  const presRelsXml = await extractZipText(
    archiveBytes,
    entries,
    'ppt/_rels/presentation.xml.rels'
  );
  const presRels = parseRelsMap(presRelsXml, 'ppt/presentation.xml');

  let slideWidth = 12192000;
  let slideHeight = 6858000;
  const slidePaths: string[] = [];

  if (presXml) {
    const presDoc = parseXml(presXml);
    const sldSz = findFirstDescendant(presDoc, 'sldSz');
    if (sldSz) {
      const cx = Number(sldSz.getAttribute('cx'));
      const cy = Number(sldSz.getAttribute('cy'));
      if (cx > 0 && cy > 0) {
        slideWidth = cx;
        slideHeight = cy;
      }
    }

    const sldIds = findAllDescendants(presDoc, 'sldId');
    for (const node of sldIds) {
      const rId =
        node.getAttribute('r:id') ||
        node.getAttributeNS(
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
          'id'
        );
      if (rId && presRels.has(rId)) {
        slidePaths.push(presRels.get(rId)!);
      }
    }
  }

  if (slidePaths.length === 0) {
    const fallbackSlides = [...entries.keys()]
      .filter(k => /^ppt\/slides\/slide\d+\.xml$/i.test(k))
      .sort((a, b) => {
        const nA = Number(a.match(/slide(\d+)\.xml/i)?.[1] || 0);
        const nB = Number(b.match(/slide(\d+)\.xml/i)?.[1] || 0);
        return nA - nB;
      });
    slidePaths.push(...fallbackSlides);
  }

  const slides: ParsedPptxSlide[] = [];
  const outlines: SlideOutlineItem[] = [];

  for (let idx = 0; idx < slidePaths.length; idx++) {
    const slidePath = slidePaths[idx];
    const slideXml = await extractZipText(archiveBytes, entries, slidePath);
    if (!slideXml) continue;

    const slideFileName = slidePath.split('/').pop() || '';
    const slideRelsPath = `ppt/slides/_rels/${slideFileName}.rels`;
    const slideRelsXml = await extractZipText(archiveBytes, entries, slideRelsPath);
    const slideRels = parseRelsMap(slideRelsXml, slidePath);

    // Find linked slideLayout and notesSlide
    let layoutPlaceholders = new Map<string, PlaceholderBox>();
    let layoutXml: string | null = null;
    let layoutRels = new Map<string, string>();
    let notesText = '';

    for (const [, target] of slideRels.entries()) {
      if (target.startsWith('ppt/slideLayouts/')) {
        layoutXml = await extractZipText(archiveBytes, entries, target);
        const layoutFile = target.split('/').pop() || '';
        const layoutRelsXml = await extractZipText(
          archiveBytes,
          entries,
          `ppt/slideLayouts/_rels/${layoutFile}.rels`
        );
        layoutRels = parseRelsMap(layoutRelsXml, target);
        layoutPlaceholders = extractLayoutPlaceholders(layoutXml);
      } else if (target.startsWith('ppt/notesSlides/')) {
        const notesXml = await extractZipText(archiveBytes, entries, target);
        if (notesXml) {
          const notesDoc = parseXml(notesXml);
          const noteShapes = findAllDescendants(notesDoc, 'sp');
          const parts: string[] = [];
          for (const sp of noteShapes) {
            const ph = findFirstDescendant(sp, 'ph');
            const phType = ph?.getAttribute('type');
            if (phType === 'sldNum' || phType === 'hdr' || phType === 'ftr') continue;
            const texts = findAllDescendants(sp, 't')
              .map(t => t.textContent || '')
              .join('');
            if (texts.trim()) parts.push(texts.trim());
          }
          notesText = parts.join('\n').trim();
        }
      }
    }

    const slideDoc = parseXml(slideXml);

    // Extract background (from slide or slideLayout)
    let backgroundColor: string | undefined;
    let backgroundGradient: string | undefined;
    let backgroundImageUrl: string | undefined;

    const parseBgFromDoc = async (
      docToInspect: Document,
      relsToUse: Map<string, string>
    ): Promise<void> => {
      const bg = findFirstDescendant(docToInspect, 'bg');
      if (!bg) return;
      const solidFill = getLocalTagChildren(
        findFirstDescendant(bg, 'bgPr') || bg,
        'solidFill'
      )[0];
      if (solidFill && !backgroundColor) {
        backgroundColor = resolveColorNode(solidFill, themeColors);
      }
      const gradFill = findFirstDescendant(bg, 'gradFill');
      if (gradFill && !backgroundGradient) {
        const gsLst = findAllDescendants(gradFill, 'gs');
        const stopColors = gsLst
          .map(gs => resolveColorNode(gs, themeColors))
          .filter((c): c is string => Boolean(c));
        if (stopColors.length >= 2) {
          backgroundGradient = `linear-gradient(135deg, ${stopColors.join(', ')})`;
        } else if (stopColors.length === 1 && !backgroundColor) {
          backgroundColor = stopColors[0];
        }
      }
      const blipFill = findFirstDescendant(bg, 'blipFill');
      if (blipFill && !backgroundImageUrl) {
        const blip = findFirstDescendant(blipFill, 'blip');
        const embedId = getBlipEmbedId(blip);
        if (embedId && relsToUse.has(embedId)) {
          const url = await getMediaBlobUrl(relsToUse.get(embedId)!);
          if (url) backgroundImageUrl = url;
        }
      }
    };

    await parseBgFromDoc(slideDoc, slideRels);
    if (!backgroundColor && !backgroundGradient && !backgroundImageUrl && layoutXml) {
      await parseBgFromDoc(parseXml(layoutXml), layoutRels);
    }

    // Parse slide transition
    let slideTransition: 'fade' | 'push' | 'wipe' | 'zoom' | 'slide' = 'slide';
    const transitionNode = findFirstDescendant(slideDoc, 'transition');
    if (transitionNode) {
      if (findFirstDescendant(transitionNode, 'fade')) slideTransition = 'fade';
      else if (findFirstDescendant(transitionNode, 'push')) slideTransition = 'push';
      else if (findFirstDescendant(transitionNode, 'wipe')) slideTransition = 'wipe';
      else if (findFirstDescendant(transitionNode, 'zoom')) slideTransition = 'zoom';
    }

    // Parse element animations from <p:timing>
    const animMap = new Map<string, { step: number; effect: PptxAnimEffect }>();
    const timingNode = findFirstDescendant(slideDoc, 'timing');
    let maxAnimSteps = 0;
    if (timingNode) {
      const cTns = findAllDescendants(timingNode, 'cTn');
      let currentClickStep = 0;
      for (const cTn of cTns) {
        const nodeType = cTn.getAttribute('nodeType');
        const isClick = nodeType === 'clickEffect' || nodeType === 'interactiveSeq';
        if (isClick) {
          currentClickStep++;
        }
        const spTgts = findAllDescendants(cTn, 'spTgt');
        for (const spTgt of spTgts) {
          const spid = spTgt.getAttribute('spid');
          if (!spid) continue;
          if (!animMap.has(spid)) {
            const effectNode =
              findFirstDescendant(cTn, 'animEffect') || findFirstDescendant(cTn, 'anim');
            const filter = effectNode?.getAttribute('filter');
            let effect: PptxAnimEffect = 'flyIn';
            if (filter?.includes('fade')) effect = 'fade';
            else if (filter?.includes('wipe')) effect = 'wipe';
            else if (filter?.includes('wheel') || filter?.includes('zoom')) effect = 'zoom';

            const step = isClick ? currentClickStep : 0;
            animMap.set(spid, { step, effect });
            if (isClick) {
              maxAnimSteps = Math.max(maxAnimSteps, currentClickStep);
            }
          }
        }
      }
    }

    const elements: PptxSlideElement[] = [];
    let slideTitle = '';
    const summaryParts: string[] = [];
    let autoBodyIndex = 0;

    const resolveBoxToPct = (
      xfrmNode: Element | null,
      phType: string | null,
      phIdx: string | null,
      groupMapping?: {
        gx: number;
        gy: number;
        gcx: number;
        gcy: number;
        chx: number;
        chy: number;
        chcx: number;
        chcy: number;
      }
    ): {
      xPct: number;
      yPct: number;
      wPct: number;
      hPct: number;
      rawW: number;
      rawH: number;
      rotationDeg?: number;
      flipH?: boolean;
      flipV?: boolean;
    } => {
      let x = NaN;
      let y = NaN;
      let cx = NaN;
      let cy = NaN;
      let rot: string | null = null;
      let flipHAttr: string | null = null;
      let flipVAttr: string | null = null;

      if (xfrmNode) {
        rot = xfrmNode.getAttribute('rot');
        flipHAttr = xfrmNode.getAttribute('flipH');
        flipVAttr = xfrmNode.getAttribute('flipV');
        const off = findFirstDescendant(xfrmNode, 'off');
        const ext = findFirstDescendant(xfrmNode, 'ext');
        if (off && ext) {
          x = Number(off.getAttribute('x'));
          y = Number(off.getAttribute('y'));
          cx = Number(ext.getAttribute('cx'));
          cy = Number(ext.getAttribute('cy'));
        }
      }

      if ((!Number.isFinite(x) || !cx || !cy) && (phIdx || phType)) {
        const inherited =
          (phIdx ? layoutPlaceholders.get(`idx:${phIdx}`) : undefined) ||
          (phType ? layoutPlaceholders.get(`type:${phType}`) : undefined);
        if (inherited) {
          x = inherited.x;
          y = inherited.y;
          cx = inherited.cx;
          cy = inherited.cy;
        }
      }

      const rotationDeg = rot ? Number(rot) / 60000 : undefined;
      const flipH = Boolean(flipHAttr === '1' || flipHAttr === 'true');
      const flipV = Boolean(flipVAttr === '1' || flipVAttr === 'true');

      if (!Number.isFinite(x) || !cx || !cy) {
        if (phType === 'title' || phType === 'ctrTitle') {
          return {
            xPct: 6,
            yPct: phType === 'ctrTitle' ? 24 : 7,
            wPct: 88,
            hPct: 20,
            rawW: 100,
            rawH: 100,
            rotationDeg,
            flipH,
            flipV,
          };
        }
        if (phType === 'subTitle') {
          return {
            xPct: 10,
            yPct: 48,
            wPct: 80,
            hPct: 22,
            rawW: 100,
            rawH: 100,
            rotationDeg,
            flipH,
            flipV,
          };
        }
        const topPct = Math.min(75, 26 + autoBodyIndex * 18);
        autoBodyIndex++;
        return {
          xPct: 7,
          yPct: topPct,
          wPct: 86,
          hPct: 62,
          rawW: 100,
          rawH: 100,
          rotationDeg,
          flipH,
          flipV,
        };
      }

      const rawW = cx;
      const rawH = cy;

      if (groupMapping && groupMapping.chcx > 0 && groupMapping.chcy > 0) {
        x = groupMapping.gx + ((x - groupMapping.chx) / groupMapping.chcx) * groupMapping.gcx;
        y = groupMapping.gy + ((y - groupMapping.chy) / groupMapping.chcy) * groupMapping.gcy;
        cx = (cx / groupMapping.chcx) * groupMapping.gcx;
        cy = (cy / groupMapping.chcy) * groupMapping.gcy;
      }

      const xPct = Math.max(0, Math.min(99.5, (x / slideWidth) * 100));
      const yPct = Math.max(0, Math.min(99.5, (y / slideHeight) * 100));
      const wPct = Math.max(0.05, Math.min(100 - xPct, (cx / slideWidth) * 100));
      const hPct = Math.max(0.05, Math.min(100 - yPct, (cy / slideHeight) * 100));
      return { xPct, yPct, wPct, hPct, rawW, rawH, rotationDeg, flipH, flipV };
    };

    const processShapeTree = async (
      treeEl: Element,
      groupMapping?: {
        gx: number;
        gy: number;
        gcx: number;
        gcy: number;
        chx: number;
        chy: number;
        chcx: number;
        chcy: number;
      }
    ): Promise<void> => {
      const children = treeEl.children;
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const tag = node.localName;

        if (tag === 'grpSp') {
          const grpSpPr = getLocalTagChildren(node, 'grpSpPr')[0];
          const xfrm = grpSpPr ? findFirstDescendant(grpSpPr, 'xfrm') : null;
          const off = xfrm ? getLocalTagChildren(xfrm, 'off')[0] : null;
          const ext = xfrm ? getLocalTagChildren(xfrm, 'ext')[0] : null;
          const chOff = xfrm ? getLocalTagChildren(xfrm, 'chOff')[0] : null;
          const chExt = xfrm ? getLocalTagChildren(xfrm, 'chExt')[0] : null;

          let nextGroup = groupMapping;
          if (off && ext && chOff && chExt) {
            let gx = Number(off.getAttribute('x')) || 0;
            let gy = Number(off.getAttribute('y')) || 0;
            let gcx = Number(ext.getAttribute('cx')) || slideWidth;
            let gcy = Number(ext.getAttribute('cy')) || slideHeight;
            if (groupMapping && groupMapping.chcx > 0 && groupMapping.chcy > 0) {
              gx =
                groupMapping.gx +
                ((gx - groupMapping.chx) / groupMapping.chcx) * groupMapping.gcx;
              gy =
                groupMapping.gy +
                ((gy - groupMapping.chy) / groupMapping.chcy) * groupMapping.gcy;
              gcx = (gcx / groupMapping.chcx) * groupMapping.gcx;
              gcy = (gcy / groupMapping.chcy) * groupMapping.gcy;
            }
            nextGroup = {
              gx,
              gy,
              gcx,
              gcy,
              chx: Number(chOff.getAttribute('x')) || 0,
              chy: Number(chOff.getAttribute('y')) || 0,
              chcx: Number(chExt.getAttribute('cx')) || gcx,
              chcy: Number(chExt.getAttribute('cy')) || gcy,
            };
          }
          await processShapeTree(node, nextGroup);
          continue;
        }

        if (tag === 'AlternateContent') {
          const choice = findFirstDescendant(node, 'Choice');
          const fallback = findFirstDescendant(node, 'Fallback');
          const targetNode = choice || fallback;
          if (targetNode) {
            await processShapeTree(targetNode, groupMapping);
          }
          continue;
        }

        if (tag === 'pic') {
          const cNvPr = findFirstDescendant(node, 'cNvPr');
          const spId = cNvPr?.getAttribute('id') || '';
          const animInfo = spId ? animMap.get(spId) : undefined;

          const xfrm = findFirstDescendant(node, 'xfrm');
          const box = resolveBoxToPct(xfrm, null, null, groupMapping);

          // Check if picture has attached video/audio media
          const nvPicPr = findFirstDescendant(node, 'nvPicPr');
          const videoFile = nvPicPr ? findFirstDescendant(nvPicPr, 'videoFile') : null;
          const audioFile = nvPicPr ? findFirstDescendant(nvPicPr, 'audioFile') : null;
          const mediaRelId = getBlipEmbedId(videoFile || audioFile);

          const blip = findFirstDescendant(node, 'blip');
          const embedId = getBlipEmbedId(blip);
          const imageTarget = embedId ? (slideRels.get(embedId) || layoutRels.get(embedId)) : undefined;
          const imgUrl = imageTarget ? await getMediaBlobUrl(imageTarget) : null;

          if (mediaRelId) {
            const mediaTarget = slideRels.get(mediaRelId) || layoutRels.get(mediaRelId);
            const mediaUrl = mediaTarget ? await getMediaBlobUrl(mediaTarget) : null;
            if (mediaUrl) {
              elements.push({
                kind: videoFile ? 'video' : 'audio',
                id: `media_${idx}_${elements.length}`,
                spId,
                animStep: animInfo?.step || 0,
                animEffect: animInfo?.effect || 'fade',
                ...box,
                url: mediaUrl,
                posterUrl: imgUrl || undefined,
              });
              continue;
            }
          }

          if (imgUrl) {
            elements.push({
              kind: 'image',
              id: `img_${idx}_${elements.length}`,
              spId,
              animStep: animInfo?.step || 0,
              animEffect: animInfo?.effect || 'flyIn',
              xPct: box.xPct,
              yPct: box.yPct,
              wPct: box.wPct,
              hPct: box.hPct,
              rotationDeg: box.rotationDeg,
              flipH: box.flipH,
              flipV: box.flipV,
              url: imgUrl,
            });
          }
          continue;
        }

        if (tag === 'graphicFrame') {
          const cNvPr = findFirstDescendant(node, 'cNvPr');
          const spId = cNvPr?.getAttribute('id') || '';
          const animInfo = spId ? animMap.get(spId) : undefined;

          const xfrm = findFirstDescendant(node, 'xfrm');
          const box = resolveBoxToPct(xfrm, null, null, groupMapping);

          const blip = findFirstDescendant(node, 'blip');
          const blipEmbedId = getBlipEmbedId(blip);
          if (blipEmbedId) {
            const imgTarget = slideRels.get(blipEmbedId) || layoutRels.get(blipEmbedId);
            const imgUrl = imgTarget ? await getMediaBlobUrl(imgTarget) : null;
            if (imgUrl) {
              elements.push({
                kind: 'image',
                id: `img_gf_${idx}_${elements.length}`,
                spId,
                animStep: animInfo?.step || 0,
                animEffect: animInfo?.effect || 'flyIn',
                xPct: box.xPct,
                yPct: box.yPct,
                wPct: box.wPct,
                hPct: box.hPct,
                rotationDeg: box.rotationDeg,
                flipH: box.flipH,
                flipV: box.flipV,
                url: imgUrl,
              });
              continue;
            }
          }

          const tbl = findFirstDescendant(node, 'tbl');
          if (tbl) {
            const trs = getLocalTagChildren(tbl, 'tr');
            const rows: PptxTableCell[][] = [];
            for (const tr of trs) {
              const tcs = getLocalTagChildren(tr, 'tc');
              const rowCells: PptxTableCell[] = [];
              for (const tc of tcs) {
                if (tc.getAttribute('hMerge') === '1' || tc.getAttribute('vMerge') === '1') {
                  continue;
                }
                const cellText = findAllDescendants(tc, 't')
                  .map(t => t.textContent || '')
                  .join(' ')
                  .trim();
                if (cellText) summaryParts.push(cellText);
                const tcPr = getLocalTagChildren(tc, 'tcPr')[0];
                const cellFill = resolveColorNode(
                  tcPr ? getLocalTagChildren(tcPr, 'solidFill')[0] : null,
                  themeColors
                );
                const firstRPr = findFirstDescendant(tc, 'rPr');
                const textColor = resolveColorNode(firstRPr, themeColors);
                const isBold = firstRPr?.getAttribute('b') === '1';
                const gridSpan = Number(tc.getAttribute('gridSpan')) || 1;
                rowCells.push({
                  text: cellText,
                  fillColor: cellFill,
                  color: textColor,
                  bold: isBold,
                  colSpan: gridSpan > 1 ? gridSpan : undefined,
                });
              }
              if (rowCells.length > 0) rows.push(rowCells);
            }
            if (rows.length > 0) {
              elements.push({
                kind: 'table',
                id: `tbl_${idx}_${elements.length}`,
                spId,
                animStep: animInfo?.step || 0,
                animEffect: animInfo?.effect || 'fade',
                xPct: box.xPct,
                yPct: box.yPct,
                wPct: box.wPct,
                hPct: box.hPct,
                rows,
              });
            }
          }
          continue;
        }

        if (tag === 'sp') {
          const nvSpPr = getLocalTagChildren(node, 'nvSpPr')[0];
          const ph = nvSpPr ? findFirstDescendant(nvSpPr, 'ph') : null;
          const phType = ph?.getAttribute('type') || null;
          const phIdx = ph?.getAttribute('idx') || null;
          if (phType === 'sldNum' || phType === 'dt' || phType === 'ftr') continue;

          const cNvPr = findFirstDescendant(node, 'cNvPr');
          const spId = cNvPr?.getAttribute('id') || '';
          const animInfo = spId ? animMap.get(spId) : undefined;

          const spPr = getLocalTagChildren(node, 'spPr')[0];
          const xfrm = findFirstDescendant(node, 'xfrm');
          const box = resolveBoxToPct(xfrm, phType, phIdx, groupMapping);

          // Check if shape has picture fill
          const shapeBlip = findFirstDescendant(node, 'blip');
          const shapeBlipEmbedId = getBlipEmbedId(shapeBlip);
          if (shapeBlipEmbedId) {
            const imgTarget = slideRels.get(shapeBlipEmbedId) || layoutRels.get(shapeBlipEmbedId);
            const imgUrl = imgTarget ? await getMediaBlobUrl(imgTarget) : null;
            if (imgUrl) {
              elements.push({
                kind: 'image',
                id: `img_sp_${idx}_${elements.length}`,
                spId,
                animStep: animInfo?.step || 0,
                animEffect: animInfo?.effect || 'flyIn',
                xPct: box.xPct,
                yPct: box.yPct,
                wPct: box.wPct,
                hPct: box.hPct,
                rotationDeg: box.rotationDeg,
                flipH: box.flipH,
                flipV: box.flipV,
                url: imgUrl,
              });
              continue;
            }
          }

          let fillColor: string | undefined;
          let borderColor: string | undefined;
          let borderRadiusPct: number | undefined;
          let svgGeometry: ShapeSvgGeometry | null = null;

          if (spPr) {
            const custGeom =
              getLocalTagChildren(spPr, 'custGeom')[0] || findFirstDescendant(spPr, 'custGeom');
            if (custGeom) {
              svgGeometry = parseCustGeom(custGeom, box.rawW, box.rawH);
            } else {
              const prstGeom =
                getLocalTagChildren(spPr, 'prstGeom')[0] || findFirstDescendant(spPr, 'prstGeom');
              const geom = prstGeom?.getAttribute('prst');
              if (geom) {
                if (geom === 'roundRect') borderRadiusPct = 16;
                else if (geom === 'ellipse') borderRadiusPct = 999;
                svgGeometry = parsePrstGeom(geom);
              }
            }

            const noFill = getLocalTagChildren(spPr, 'noFill')[0];
            if (!noFill) {
              const solidFill = getLocalTagChildren(spPr, 'solidFill')[0];
              fillColor = resolveColorNode(solidFill, themeColors);
            }
            const ln = getLocalTagChildren(spPr, 'ln')[0];
            if (ln && !getLocalTagChildren(ln, 'noFill')[0]) {
              borderColor = resolveColorNode(ln, themeColors);
            }
          }

          const txBody = getLocalTagChildren(node, 'txBody')[0];
          const bodyPr = txBody ? getLocalTagChildren(txBody, 'bodyPr')[0] : null;
          const anchor = bodyPr?.getAttribute('anchor');
          const vAlign: 'top' | 'middle' | 'bottom' =
            anchor === 'ctr' ? 'middle' : anchor === 'b' ? 'bottom' : 'top';

          const isTitle = phType === 'title' || phType === 'ctrTitle';
          const isSubtitle = phType === 'subTitle';
          const paragraphs: PptxParagraph[] = [];

          if (txBody) {
            const pNodes = getLocalTagChildren(txBody, 'p');
            for (const pNode of pNodes) {
              const pPr = getLocalTagChildren(pNode, 'pPr')[0];
              const algn = pPr?.getAttribute('algn');
              const align: PptxParagraph['align'] =
                algn === 'ctr'
                  ? 'center'
                  : algn === 'r'
                    ? 'right'
                    : algn === 'just'
                      ? 'justify'
                      : isTitle && phType === 'ctrTitle'
                        ? 'center'
                        : 'left';
              const level = Number(pPr?.getAttribute('lvl')) || 0;
              const hasBuNone = Boolean(pPr && findFirstDescendant(pPr, 'buNone'));
              const hasBulletNode = Boolean(
                pPr &&
                  (findFirstDescendant(pPr, 'buChar') ||
                    findFirstDescendant(pPr, 'buAutoNum') ||
                    findFirstDescendant(pPr, 'buBlip'))
              );
              const bullet =
                !hasBuNone &&
                (hasBulletNode || (!isTitle && !isSubtitle && phType === 'body' && level >= 0 && !fillColor));

              const runs: PptxTextRun[] = [];
              const pChildren = pNode.children;
              for (let cIdx = 0; cIdx < pChildren.length; cIdx++) {
                const child = pChildren[cIdx];
                if (child.localName === 'br') {
                  runs.push({ text: '\n' });
                  continue;
                }
                if (child.localName === 'r' || child.localName === 'fld') {
                  const rPr = getLocalTagChildren(child, 'rPr')[0];
                  const tNode = getLocalTagChildren(child, 't')[0];
                  const text = tNode?.textContent || '';
                  if (!text) continue;

                  const szAttr = Number(rPr?.getAttribute('sz'));
                  const fontSizePt =
                    szAttr > 0
                      ? Math.round(szAttr / 100)
                      : isTitle
                        ? 34
                        : isSubtitle
                          ? 22
                          : 20;
                  const bold =
                    rPr?.getAttribute('b') === '1' ||
                    (rPr?.getAttribute('b') !== '0' && isTitle);
                  const italic = rPr?.getAttribute('i') === '1';
                  const underline = Boolean(
                    rPr?.getAttribute('u') && rPr?.getAttribute('u') !== 'none'
                  );
                  const color = resolveColorNode(rPr, themeColors);

                  runs.push({
                    text,
                    bold,
                    italic,
                    underline,
                    color,
                    fontSizePt,
                  });
                }
              }

              const paragraphText = runs.map(r => r.text).join('').trim();
              if (paragraphText) {
                if (isTitle && !slideTitle) {
                  slideTitle = paragraphText;
                } else {
                  summaryParts.push(paragraphText);
                }
                paragraphs.push({ align, level, bullet, runs });
              }
            }
          }

          if (paragraphs.length > 0 || fillColor || borderColor || svgGeometry) {
            elements.push({
              kind: 'shape',
              id: `sp_${idx}_${elements.length}`,
              spId,
              animStep: animInfo?.step || 0,
              animEffect: animInfo?.effect || (isTitle ? 'fade' : 'flyIn'),
              xPct: box.xPct,
              yPct: box.yPct,
              wPct: box.wPct,
              hPct: box.hPct,
              rotationDeg: box.rotationDeg,
              flipH: box.flipH,
              flipV: box.flipV,
              svgPath: svgGeometry?.pathData,
              svgViewBox: svgGeometry?.viewBox,
              fillColor,
              borderColor,
              borderRadiusPct,
              vAlign,
              isTitle,
              paragraphs,
            });
          }
        }
      }
    };

    const cSld = findFirstDescendant(slideDoc, 'cSld');
    const spTree = cSld ? getLocalTagChildren(cSld, 'spTree')[0] : null;
    if (spTree) {
      await processShapeTree(spTree);
    }

    if (!slideTitle && summaryParts.length > 0) {
      slideTitle = summaryParts[0].slice(0, 90);
    }
    if (!slideTitle) {
      slideTitle = `Slide ${idx + 1}`;
    }

    const summary = summaryParts.join(' • ').slice(0, 320);

    slides.push({
      index: idx + 1,
      title: slideTitle,
      summary,
      notes: notesText,
      transition: slideTransition,
      maxAnimSteps,
      backgroundColor,
      backgroundGradient,
      backgroundImageUrl,
      elements,
    });

    outlines.push({
      index: idx + 1,
      title: slideTitle,
      summary,
      ...(notesText ? { notes: notesText } : {}),
    });
  }

  return {
    aspectRatio: slideWidth / slideHeight,
    slides,
    outlines,
    revokeUrls: () => {
      for (const u of createdUrls) {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // Ignore
        }
      }
    },
  };
}
