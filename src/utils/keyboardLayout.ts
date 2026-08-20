export interface KeyInfo {
  id: string;
  code: string;
  label: string;
  subLabel?: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  row: number;
  col: number;
  type: 'alpha' | 'modifier' | 'accent' | 'space' | 'special' | 'knob';
}

interface RawKeyDef {
  label: string;
  subLabel?: string;
  code: string;
  width: number;
  type?: 'alpha' | 'modifier' | 'accent' | 'space' | 'special' | 'knob';
  gapAfter?: number;
}

export function generateKeyboardLayout(): { keys: KeyInfo[]; knob: KeyInfo } {
  const keys: KeyInfo[] = [];
  const unit = 1.0;
  const gap = 0.05;
  const pitch = unit + gap;

  // Perfect 75% Mechanical Layout (Standard 16.0u total width per row)
  const rowDefinitions: RawKeyDef[][] = [
    // Row 0: Function Row (Esc, F1-F12) - 15u total before knob
    [
      { label: 'ESC', code: 'Escape', width: 1, type: 'modifier', gapAfter: 0.5 },
      { label: 'F1', code: 'F1', width: 1, type: 'modifier' },
      { label: 'F2', code: 'F2', width: 1, type: 'modifier' },
      { label: 'F3', code: 'F3', width: 1, type: 'modifier' },
      { label: 'F4', code: 'F4', width: 1, type: 'modifier', gapAfter: 0.5 },
      { label: 'F5', code: 'F5', width: 1, type: 'modifier' },
      { label: 'F6', code: 'F6', width: 1, type: 'modifier' },
      { label: 'F7', code: 'F7', width: 1, type: 'modifier' },
      { label: 'F8', code: 'F8', width: 1, type: 'modifier', gapAfter: 0.5 },
      { label: 'F9', code: 'F9', width: 1, type: 'modifier' },
      { label: 'F10', code: 'F10', width: 1, type: 'modifier' },
      { label: 'F11', code: 'F11', width: 1, type: 'modifier' },
      { label: 'F12', code: 'F12', width: 1, type: 'modifier' },
    ],
    // Row 1: Numbers (13x 1u + 2u Backspace + 1u Del = 16u)
    [
      { label: '`', subLabel: '~', code: 'Backquote', width: 1, type: 'alpha' },
      { label: '1', subLabel: '!', code: 'Digit1', width: 1, type: 'alpha' },
      { label: '2', subLabel: '@', code: 'Digit2', width: 1, type: 'alpha' },
      { label: '3', subLabel: '#', code: 'Digit3', width: 1, type: 'alpha' },
      { label: '4', subLabel: '$', code: 'Digit4', width: 1, type: 'alpha' },
      { label: '5', subLabel: '%', code: 'Digit5', width: 1, type: 'alpha' },
      { label: '6', subLabel: '^', code: 'Digit6', width: 1, type: 'alpha' },
      { label: '7', subLabel: '&', code: 'Digit7', width: 1, type: 'alpha' },
      { label: '8', subLabel: '*', code: 'Digit8', width: 1, type: 'alpha' },
      { label: '9', subLabel: '(', code: 'Digit9', width: 1, type: 'alpha' },
      { label: '0', subLabel: ')', code: 'Digit0', width: 1, type: 'alpha' },
      { label: '-', subLabel: '_', code: 'Minus', width: 1, type: 'alpha' },
      { label: '=', subLabel: '+', code: 'Equal', width: 1, type: 'alpha' },
      { label: 'BACK', code: 'Backspace', width: 2, type: 'modifier' },
      { label: 'DEL', code: 'Delete', width: 1, type: 'modifier' },
    ],
    // Row 2: QWERTY (1.5u Tab + 12x 1u + 1.5u Backslash + 1u Home = 16u)
    [
      { label: 'TAB', code: 'Tab', width: 1.5, type: 'modifier' },
      { label: 'Q', code: 'KeyQ', width: 1, type: 'alpha' },
      { label: 'W', code: 'KeyW', width: 1, type: 'alpha' },
      { label: 'E', code: 'KeyE', width: 1, type: 'alpha' },
      { label: 'R', code: 'KeyR', width: 1, type: 'alpha' },
      { label: 'T', code: 'KeyT', width: 1, type: 'alpha' },
      { label: 'Y', code: 'KeyY', width: 1, type: 'alpha' },
      { label: 'U', code: 'KeyU', width: 1, type: 'alpha' },
      { label: 'I', code: 'KeyI', width: 1, type: 'alpha' },
      { label: 'O', code: 'KeyO', width: 1, type: 'alpha' },
      { label: 'P', code: 'KeyP', width: 1, type: 'alpha' },
      { label: '[', subLabel: '{', code: 'BracketLeft', width: 1, type: 'alpha' },
      { label: ']', subLabel: '}', code: 'BracketRight', width: 1, type: 'alpha' },
      { label: '\\', subLabel: '|', code: 'Backslash', width: 1.5, type: 'modifier' },
      { label: 'HOME', code: 'Home', width: 1, type: 'modifier' },
    ],
    // Row 3: Home Row (1.75u Caps + 11x 1u + 2.25u Enter + 1u PgUp = 16u)
    [
      { label: 'CAPS', code: 'CapsLock', width: 1.75, type: 'modifier' },
      { label: 'A', code: 'KeyA', width: 1, type: 'alpha' },
      { label: 'S', code: 'KeyS', width: 1, type: 'alpha' },
      { label: 'D', code: 'KeyD', width: 1, type: 'alpha' },
      { label: 'F', code: 'KeyF', width: 1, type: 'alpha' },
      { label: 'G', code: 'KeyG', width: 1, type: 'alpha' },
      { label: 'H', code: 'KeyH', width: 1, type: 'alpha' },
      { label: 'J', code: 'KeyJ', width: 1, type: 'alpha' },
      { label: 'K', code: 'KeyK', width: 1, type: 'alpha' },
      { label: 'L', code: 'KeyL', width: 1, type: 'alpha' },
      { label: ';', subLabel: ':', code: 'Semicolon', width: 1, type: 'alpha' },
      { label: "'", subLabel: '"', code: 'Quote', width: 1, type: 'alpha' },
      { label: 'ENTER', code: 'Enter', width: 2.25, type: 'modifier' },
      { label: 'PGUP', code: 'PageUp', width: 1, type: 'modifier' },
    ],
    // Row 4: Shift Row (2.25u LShift + 10x 1u + 1.75u RShift + 1u Up + 1u PgDn = 16u)
    [
      { label: 'SHIFT', code: 'ShiftLeft', width: 2.25, type: 'modifier' },
      { label: 'Z', code: 'KeyZ', width: 1, type: 'alpha' },
      { label: 'X', code: 'KeyX', width: 1, type: 'alpha' },
      { label: 'C', code: 'KeyC', width: 1, type: 'alpha' },
      { label: 'V', code: 'KeyV', width: 1, type: 'alpha' },
      { label: 'B', code: 'KeyB', width: 1, type: 'alpha' },
      { label: 'N', code: 'KeyN', width: 1, type: 'alpha' },
      { label: 'M', code: 'KeyM', width: 1, type: 'alpha' },
      { label: ',', subLabel: '<', code: 'Comma', width: 1, type: 'alpha' },
      { label: '.', subLabel: '>', code: 'Period', width: 1, type: 'alpha' },
      { label: '/', subLabel: '?', code: 'Slash', width: 1, type: 'alpha' },
      { label: 'SHIFT', code: 'ShiftRight', width: 1.75, type: 'modifier' },
      { label: '▲', code: 'ArrowUp', width: 1, type: 'modifier' },
      { label: 'PGDN', code: 'PageDown', width: 1, type: 'modifier' },
    ],
    // Row 5: Bottom Row (3x 1.25u + 6.25u Space + 3x 1u Mods + 3x 1u Arrows/End = 16u)
    [
      { label: 'CTRL', code: 'ControlLeft', width: 1.25, type: 'modifier' },
      { label: 'WIN', code: 'MetaLeft', width: 1.25, type: 'modifier' },
      { label: 'ALT', code: 'AltLeft', width: 1.25, type: 'modifier' },
      { label: '', code: 'Space', width: 6.25, type: 'space' },
      { label: 'ALT', code: 'AltRight', width: 1, type: 'modifier' },
      { label: 'FN', code: 'ContextMenu', width: 1, type: 'modifier' },
      { label: 'CTRL', code: 'ControlRight', width: 1, type: 'modifier' },
      { label: '◄', code: 'ArrowLeft', width: 1, type: 'modifier' },
      { label: '▼', code: 'ArrowDown', width: 1, type: 'modifier' },
      { label: '►', code: 'ArrowRight', width: 1, type: 'modifier' },
    ],
  ];

  const totalWidth = 16 * pitch;
  const totalDepth = 6 * pitch;
  const offsetX = -totalWidth / 2;
  const offsetZ = -totalDepth / 2 + unit / 2;

  let currentZ = 0;

  rowDefinitions.forEach((row, rowIndex) => {
    let currentX = 0;
    row.forEach((def, colIndex) => {
      const keyWidth = def.width * unit + (def.width - 1) * gap;
      const centerX = currentX + keyWidth / 2;

      keys.push({
        id: `r${rowIndex}-c${colIndex}`,
        code: def.code,
        label: def.label,
        subLabel: def.subLabel,
        x: centerX + offsetX,
        z: currentZ + offsetZ,
        width: keyWidth,
        depth: unit,
        row: rowIndex,
        col: colIndex,
        type: def.type || 'alpha',
      });

      currentX += keyWidth + gap + (def.gapAfter ? def.gapAfter * pitch : 0);
    });
    currentZ += pitch + (rowIndex === 0 ? 0.12 : 0);
  });

  // Rotary Knob at top right corner of Row 0 (aligned with right edge at 16u)
  const knob: KeyInfo = {
    id: 'rotary-knob',
    code: 'Knob',
    label: 'VOL',
    x: totalWidth / 2 - unit / 2,
    z: offsetZ,
    width: 1.1,
    depth: 1.1,
    row: 0,
    col: 15,
    type: 'knob',
  };

  return { keys, knob };
}
