// Concentration Converter — loaded by _pages/tools/concverter.html
// Wrapped in an IIFE so its names don't leak into the theme's global scope.
(function () {
'use strict';

const MOLAR_UNITS = [
  { label: 'M',  factor: 1 },
  { label: 'mM', factor: 1e-3 },
  { label: 'µM', factor: 1e-6 },
  { label: 'nM', factor: 1e-9 },
  { label: 'pM', factor: 1e-12 },
];

const MASS_UNITS = [
  { label: 'g/L',   factor: 1 },
  { label: 'mg/mL', factor: 1 },
  { label: 'µg/µL', factor: 1 },
  { label: 'mg/L',  factor: 1e-3 },
  { label: 'µg/mL', factor: 1e-3 },
  { label: 'ng/µL', factor: 1e-3 },
  { label: 'ng/mL', factor: 1e-6 },
  { label: 'pg/µL', factor: 1e-6 },
  { label: '% w/v (g/100 mL)', factor: 10 },
];

// Number density per volume — factor = particles/m³ per (1 of this unit).
// (Molarity → particles/m³ scales by N_A × 1000 since 1 L = 1e-3 m³.)
const NUMVOL_UNITS = [
  { label: 'particles/L',  factor: 1e3  },
  { label: 'particles/mL', factor: 1e6  },
  { label: 'particles/µL', factor: 1e9  },
  { label: 'particles/nL', factor: 1e12 },
];

// Areal (surface) density assuming uniform 3D distribution: σ = ρ^(2/3),
// equivalently σ = 1/d² where d is the mean inter-particle distance.
// factor = particles/m² per (1 of this unit).
const NUMAREA_UNITS = [
  { label: 'particles/m²',  factor: 1    },
  { label: 'particles/cm²', factor: 1e4  },
  { label: 'particles/mm²', factor: 1e6  },
  { label: 'particles/µm²', factor: 1e12 },
  { label: 'particles/nm²', factor: 1e18 },
];

// Mean inter-particle distance assuming uniform 3D distribution: d = ρ^(-1/3).
// factor = meters per (1 of this unit).
const DISTANCE_UNITS = [
  { label: 'mean dist (mm)', factor: 1e-3 },
  { label: 'mean dist (µm)', factor: 1e-6 },
  { label: 'mean dist (nm)', factor: 1e-9 },
];

const ALL_UNITS = [
  { group: 'Molar',                     units: MOLAR_UNITS   },
  { group: 'Mass / Volume',             units: MASS_UNITS    },
  { group: 'Number Density (per volume)', units: NUMVOL_UNITS  },
  { group: 'Areal Density (assumes uniform 3D)', units: NUMAREA_UNITS },
  { group: 'Mean Inter-particle Distance (assumes uniform 3D)', units: DISTANCE_UNITS },
];

const N_A = 6.02214076e23; // Avogadro's number, particles/mol

const BP_FORMULAS = {
  rule660: { toGmol: bp => 660 * bp,           toBp: mw => mw / 660 },
  qiagen:  { toGmol: bp => 617.96 * bp + 36.04, toBp: mw => (mw - 36.04) / 617.96 },
};

const VOLUME_UNITS = [
  { label: 'nL', factor: 1e-9 },
  { label: 'µL', factor: 1e-6 },
  { label: 'mL', factor: 1e-3 },
  { label: 'L',  factor: 1 },
];

function getVolUnit(label) {
  return VOLUME_UNITS.find(u => u.label === label) || null;
}

function populateVolumeSelect(sel, defaultLabel) {
  sel.innerHTML = '';
  for (const u of VOLUME_UNITS) {
    const opt = document.createElement('option');
    opt.value = u.label;
    opt.textContent = u.label;
    if (u.label === defaultLabel) opt.selected = true;
    sel.appendChild(opt);
  }
}

function getUnit(label) {
  for (const u of MOLAR_UNITS)   if (u.label === label) return { ...u, type: 'molar'    };
  for (const u of MASS_UNITS)    if (u.label === label) return { ...u, type: 'mass'     };
  for (const u of NUMVOL_UNITS)  if (u.label === label) return { ...u, type: 'numvol'   };
  for (const u of NUMAREA_UNITS) if (u.label === label) return { ...u, type: 'numarea'  };
  for (const u of DISTANCE_UNITS) if (u.label === label) return { ...u, type: 'distance' };
  return null;
}

// Convert a value with its unit to particles/m³ (canonical 3D number density).
// `mw` is the effective molar mass in g/mol — only required for mass units.
// Returns null when MW is missing for a mass unit, or when distance/areal value is 0.
function toParticlesPerM3(val, unit, mw) {
  switch (unit.type) {
    case 'molar':
      return val * unit.factor * N_A * 1000;
    case 'mass': {
      if (mw == null || mw <= 0) return null;
      return (val * unit.factor / mw) * N_A * 1000;
    }
    case 'numvol':
      return val * unit.factor;
    case 'numarea': {
      const sigma_m2 = val * unit.factor;
      if (sigma_m2 < 0) return null;
      return Math.pow(sigma_m2, 1.5);
    }
    case 'distance': {
      const d_m = val * unit.factor;
      if (d_m <= 0) return null;
      return 1 / Math.pow(d_m, 3);
    }
  }
  return null;
}

// Inverse of toParticlesPerM3.
function fromParticlesPerM3(rho, unit, mw) {
  if (!Number.isFinite(rho) || rho < 0) return null;
  switch (unit.type) {
    case 'molar':
      return (rho / (N_A * 1000)) / unit.factor;
    case 'mass': {
      if (mw == null || mw <= 0) return null;
      return ((rho / (N_A * 1000)) * mw) / unit.factor;
    }
    case 'numvol':
      return rho / unit.factor;
    case 'numarea':
      return Math.pow(rho, 2 / 3) / unit.factor;
    case 'distance': {
      if (rho <= 0) return null;
      return Math.pow(rho, -1 / 3) / unit.factor;
    }
  }
  return null;
}

function populateSelect(sel, defaultLabel) {
  sel.innerHTML = '';
  for (const g of ALL_UNITS) {
    const og = document.createElement('optgroup');
    og.label = g.group;
    for (const u of g.units) {
      const opt = document.createElement('option');
      opt.value = u.label;
      opt.textContent = u.label;
      if (u.label === defaultLabel) opt.selected = true;
      og.appendChild(opt);
    }
    sel.appendChild(og);
  }
}

const valA = document.getElementById('valA');
const valB = document.getElementById('valB');
const unitA = document.getElementById('unitA');
const unitB = document.getElementById('unitB');
const mwInput = document.getElementById('mwInput');
const errorMsg = document.getElementById('errorMsg');
const bpNote = document.getElementById('bpNote');
const bpOptions = document.getElementById('bpOptions');
const bpFormulaSel = document.getElementById('bpFormula');
const effectiveMWSpan = document.getElementById('effectiveMW');

populateSelect(unitA, 'ng/µL');
populateSelect(unitB, 'nM');

let mwUnit = 'bp';
let lastEdited = 'A';

function readNumber(input) {
  const s = input.value.trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function bpFormula() {
  return BP_FORMULAS[bpFormulaSel.value] || BP_FORMULAS.rule660;
}

function getMW() {
  const raw = readNumber(mwInput);
  if (raw == null || isNaN(raw) || raw <= 0) return null;
  return mwUnit === 'bp' ? bpFormula().toGmol(raw) : raw;
}

function formatMW(n) {
  if (!Number.isFinite(n)) return '';
  return parseFloat(n.toFixed(4)).toString();
}

function setMWUnit(unit) {
  if (unit !== mwUnit) {
    const raw = readNumber(mwInput);
    if (raw != null && !isNaN(raw) && raw > 0) {
      const f = bpFormula();
      if (mwUnit === 'gmol' && unit === 'bp')      mwInput.value = formatMW(f.toBp(raw));
      else if (mwUnit === 'bp' && unit === 'gmol') mwInput.value = formatMW(f.toGmol(raw));
    }
  }
  mwUnit = unit;
  document.getElementById('btnGmol').classList.toggle('active', unit === 'gmol');
  document.getElementById('btnBp').classList.toggle('active', unit === 'bp');
  bpOptions.classList.toggle('visible', unit === 'bp');
  bpNote.style.display = unit === 'bp' ? 'block' : 'none';
  mwInput.placeholder = unit === 'bp' ? 'Length in bp (dsDNA)' : 'Molar mass in g/mol';
  updateEffectiveMW();
  convert(lastEdited);
}

function updateEffectiveMW() {
  const mw = getMW();
  effectiveMWSpan.textContent = mw != null
    ? mw.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '—';
}

function convert(from) {
  lastEdited = from;
  errorMsg.textContent = '';

  const srcInput = from === 'A' ? valA : valB;
  const dstInput = from === 'A' ? valB : valA;
  const srcLabel = from === 'A' ? unitA.value : unitB.value;
  const dstLabel = from === 'A' ? unitB.value : unitA.value;

  const srcVal = readNumber(srcInput);
  if (srcVal == null) { dstInput.value = ''; return; }
  if (isNaN(srcVal)) {
    errorMsg.textContent = 'Concentration must be a number.';
    dstInput.value = '';
    return;
  }
  if (srcVal < 0) {
    errorMsg.textContent = 'Concentration must be zero or positive.';
    dstInput.value = '';
    return;
  }

  const src = getUnit(srcLabel);
  const dst = getUnit(dstLabel);

  // Same-type conversions are linear and don't need MW or the particle pipeline.
  // (Within numarea / distance groups, the factor is also a pure unit conversion.)
  if (src.type === dst.type) {
    dstInput.value = formatNum(srcVal * src.factor / dst.factor);
    return;
  }

  // Cross-type: route through particles/m³. MW is only required if either side
  // is a mass concentration; molar ↔ number/area/distance does not need MW.
  const needsMW = src.type === 'mass' || dst.type === 'mass';
  const mw = needsMW ? getMW() : null;
  if (needsMW && mw == null) {
    errorMsg.textContent = 'Enter a molecular weight to convert involving mass units.';
    dstInput.value = '';
    return;
  }

  const rho = toParticlesPerM3(srcVal, src, mw);
  if (rho == null || !Number.isFinite(rho)) { dstInput.value = ''; return; }
  const result = fromParticlesPerM3(rho, dst, mw);
  if (result == null || !Number.isFinite(result)) { dstInput.value = ''; return; }
  dstInput.value = formatNum(result);
}

function formatNum(n) {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 1e6) {
    return parseFloat(n.toPrecision(6)).toString();
  }
  return n.toExponential(4);
}

valA.addEventListener('input', () => { convert('A'); calculateDilution(); });
valB.addEventListener('input', () => { convert('B'); calculateDilution(); });
unitA.addEventListener('change', () => { convert(lastEdited); calculateDilution(); });
unitB.addEventListener('change', () => { convert(lastEdited); calculateDilution(); });
mwInput.addEventListener('input', () => { updateEffectiveMW(); convert(lastEdited); calculateDilution(); });
bpFormulaSel.addEventListener('change', () => { updateEffectiveMW(); convert(lastEdited); calculateDilution(); });

document.getElementById('btnGmol').addEventListener('click', () => setMWUnit('gmol'));
document.getElementById('btnBp').addEventListener('click', () => setMWUnit('bp'));
document.getElementById('searchBtn').addEventListener('click', searchChemical);

document.getElementById('swapBtn').addEventListener('click', () => {
  const tmpVal = valA.value;
  const tmpUnit = unitA.value;
  valA.value = valB.value;
  unitA.value = unitB.value;
  valB.value = tmpVal;
  unitB.value = tmpUnit;
  lastEdited = lastEdited === 'A' ? 'B' : 'A';
  convert(lastEdited);
  calculateDilution();
});

// --- Chemical Search via PubChem ---

const chemSearch = document.getElementById('chemSearch');
const searchBtn = document.getElementById('searchBtn');
const resultsList = document.getElementById('resultsList');

const propertyCache = new Map();

chemSearch.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchChemical();
});

document.addEventListener('click', e => {
  if (!resultsList.contains(e.target) && e.target !== searchBtn) {
    resultsList.classList.remove('visible');
  }
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function searchChemical() {
  const query = chemSearch.value.trim();
  if (!query) return;

  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching…';
  resultsList.innerHTML = '<div class="search-status">Searching PubChem…</div>';
  resultsList.classList.add('visible');

  try {
    const names = await autocomplete(query);
    if (names.length === 0) {
      resultsList.innerHTML = '<div class="search-status">No results found.</div>';
      return;
    }

    resultsList.innerHTML = '<div class="search-status">Loading molecular weights…</div>';
    const results = await fetchPropertiesByNames(names);
    if (results.length === 0) {
      resultsList.innerHTML = '<div class="search-status">No molecular weight data found.</div>';
      return;
    }

    resultsList.innerHTML = '';
    for (const r of results) {
      const div = document.createElement('div');
      div.className = 'result-item';
      const detail = [
        `<span class="result-mw">MW: ${r.mw} g/mol</span>`,
        r.formula ? esc(r.formula) : '',
        `<span class="result-cid">CID ${r.cid}</span>`,
      ].filter(Boolean).join(' &middot; ');
      const iupacLine = (r.iupac && r.iupac !== r.name)
        ? `<div class="result-details" style="margin-top:2px;">${esc(r.iupac)}</div>`
        : '';
      div.innerHTML =
        `<div class="result-name">${esc(r.name)}</div>` +
        `<div class="result-details">${detail}</div>` +
        iupacLine;
      div.addEventListener('click', () => selectResult(r));
      resultsList.appendChild(div);
    }
  } catch (err) {
    resultsList.innerHTML = `<div class="search-status">Error: ${esc(err.message)}</div>`;
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Search';
  }
}

async function autocomplete(query) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=8`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('PubChem autocomplete failed');
  const data = await resp.json();
  const dict = data.dictionary_terms;
  return dict && dict.compound ? dict.compound.slice(0, 8) : [];
}

async function fetchPropertiesByNames(names) {
  // Stay under PubChem's 5 req/sec guidance: serial requests with a 250 ms gap.
  // Autocomplete already used one request, so this caps the total at ~4/sec.
  const results = [];
  for (const name of names) {
    const r = await fetchOneByName(name);
    if (r) results.push(r);
    await sleep(250);
  }
  return results;
}

async function fetchOneByName(name) {
  if (propertyCache.has(name)) return propertyCache.get(name);
  try {
    const props = 'MolecularWeight,MolecularFormula,IUPACName';
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/${props}/JSON`;
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const data = await resp.json();
    const p = data.PropertyTable.Properties[0];
    if (!p || !p.MolecularWeight) return null;
    const result = {
      name,
      cid: p.CID,
      mw: p.MolecularWeight,
      formula: p.MolecularFormula || '',
      iupac: p.IUPACName || '',
    };
    propertyCache.set(name, result);
    return result;
  } catch { return null; }
}

function selectResult(r) {
  if (mwUnit === 'bp') setMWUnit('gmol');
  mwInput.value = r.mw;
  updateEffectiveMW();
  convert(lastEdited);
  calculateDilution();
  resultsList.classList.remove('visible');
  chemSearch.value = r.name;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// --- Dilution calculator (C1·V1 = C2·V2) ---

const targetConc     = document.getElementById('targetConc');
const targetConcUnit = document.getElementById('targetConcUnit');
const finalVol       = document.getElementById('finalVol');
const finalVolUnit   = document.getElementById('finalVolUnit');
const stockVolEl     = document.getElementById('stockVol');
const solventVolEl   = document.getElementById('solventVol');
const dilutionError  = document.getElementById('dilutionError');

populateSelect(targetConcUnit, 'ng/µL');
populateVolumeSelect(finalVolUnit, 'µL');

function calculateDilution() {
  stockVolEl.textContent = '—';
  solventVolEl.textContent = '—';
  dilutionError.textContent = '';

  const cA_raw = readNumber(valA);
  const cC_raw = readNumber(targetConc);
  const v_raw  = readNumber(finalVol);
  if (cA_raw == null || cC_raw == null || v_raw == null) return;
  if (isNaN(cA_raw) || isNaN(cC_raw) || isNaN(v_raw)) return;
  if (cA_raw <= 0 || v_raw <= 0) {
    dilutionError.textContent = 'Stock concentration and final volume must be greater than zero.';
    return;
  }
  if (cC_raw < 0) {
    dilutionError.textContent = 'Target concentration must be zero or positive.';
    return;
  }

  const a = getUnit(unitA.value);
  const c = getUnit(targetConcUnit.value);
  const v_unit = getVolUnit(finalVolUnit.value);

  if (cC_raw === 0) {
    const v_final_L = v_raw * v_unit.factor;
    stockVolEl.textContent = formatVolume(0, v_unit);
    solventVolEl.textContent = formatVolume(v_final_L, v_unit);
    return;
  }

  // Dilution is a physically volumetric operation, so we compare both A and C
  // on a true per-volume scale (particles/m³). Number/area and distance units
  // are non-linear in concentration; the pipeline handles that automatically.
  const needsMW = a.type === 'mass' || c.type === 'mass';
  const mw = needsMW ? getMW() : null;
  if (needsMW && mw == null) {
    dilutionError.textContent = 'Enter a molecular weight to mix molar and mass units.';
    return;
  }

  const aScalar = toParticlesPerM3(cA_raw, a, mw);
  const cScalar = toParticlesPerM3(cC_raw, c, mw);
  if (aScalar == null || cScalar == null || !Number.isFinite(aScalar) || !Number.isFinite(cScalar)) {
    dilutionError.textContent = 'Could not interpret concentrations.';
    return;
  }
  if (aScalar <= 0) {
    dilutionError.textContent = 'Stock concentration A is zero or undefined.';
    return;
  }

  if (cScalar > aScalar) {
    dilutionError.textContent = 'Target concentration C must be ≤ Concentration A (cannot dilute upward).';
    return;
  }

  const v_final_L = v_raw * v_unit.factor;
  const v_stock_L = (cScalar * v_final_L) / aScalar;
  const v_solvent_L = v_final_L - v_stock_L;

  stockVolEl.textContent   = formatVolume(v_stock_L,   v_unit);
  solventVolEl.textContent = formatVolume(v_solvent_L, v_unit);
}

function formatVolume(volumeInL, preferredUnit) {
  if (!Number.isFinite(volumeInL)) return '—';

  const units = VOLUME_UNITS; // nL, µL, mL, L
  let unit = preferredUnit;
  let value = volumeInL / unit.factor;

  const preferredIndex = units.findIndex(u => u.label === preferredUnit.label);

  // If the value is tiny in the selected unit, step down only as far as needed.
  if (Math.abs(value) > 0 && Math.abs(value) < 0.01 && preferredIndex > 0) {
    for (let i = preferredIndex - 1; i >= 0; i--) {
      const candidate = volumeInL / units[i].factor;
      if (Math.abs(candidate) >= 0.01) {
        unit = units[i];
        value = candidate;
        break;
      }
    }
  }

  if (Math.abs(value) < 1e-15) value = 0;
  return `${formatNum(value)} ${unit.label}`;
}

targetConc.addEventListener('input', calculateDilution);
targetConcUnit.addEventListener('change', calculateDilution);
finalVol.addEventListener('input', calculateDilution);
finalVolUnit.addEventListener('change', calculateDilution);

function copyToTarget(srcVal, srcUnitLabel) {
  if (!getUnit(srcUnitLabel)) return;
  targetConcUnit.value = srcUnitLabel;
  targetConc.value = (srcVal == null) ? '' : srcVal;
  calculateDilution();
}

document.getElementById('copyFromA').addEventListener('click', () => copyToTarget(valA.value, unitA.value));
document.getElementById('copyFromB').addEventListener('click', () => copyToTarget(valB.value, unitB.value));

// --- Default startup state: 100 ng/µL ↔ nM for 14383 bp dsDNA ---
valA.value = 100;
mwInput.value = 14383;
setMWUnit('bp');

// Sensible dilution defaults for the startup scenario.
targetConc.value = 5;
finalVol.value = 100;
calculateDilution();
})();
