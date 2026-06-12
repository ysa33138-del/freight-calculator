// ===== 分区 & 重量段辅助 =====

function getZone(zip) {
  if (!zip || zip.length < 1) return null;
  const first = zip[0];
  if ('89'.includes(first)) return 'west';
  if ('4567'.includes(first)) return 'central';
  if ('0123'.includes(first)) return 'east';
  return null;
}

function getZoneLabel(zone) {
  return { west: '美西', central: '美中', east: '美东' }[zone] || '';
}

function getZoneBadgeClass(zone) {
  return { west: 'west', central: 'central', east: 'east' }[zone] || '';
}

function getWeightTier(weight) {
  if (weight >= 100) return 100;
  if (weight >= 51)  return 51;
  return 21;
}

function getPrice(channel, zone, billable) {
  const tier     = getWeightTier(billable);
  const pickup   = pickupSelect.value;
  const priceSet = channel.prices[pickup] || channel.prices.shenzhen;
  if (!priceSet || !priceSet[zone]) return null;
  const price = priceSet[zone][tier];
  return Number.isFinite(price) ? price : null;
}

function parseFiniteNumber(value) {
  const number = parseFloat(value);
  return Number.isFinite(number) ? number : null;
}

function parseNumberInput(id, fallback) {
  const input = document.getElementById(id);
  const number = parseFiniteNumber(input?.value);
  return number === null ? fallback : number;
}

function getValidExchangeRate(input) {
  const rate = parseFiniteNumber(input?.value);
  return rate !== null && rate > 0 ? rate : null;
}

function isValidQuantity(qty) {
  return Number.isInteger(qty) && qty > 0;
}

function showCalcError(message) {
  resultsDiv.innerHTML = `<div class="error-msg">${message}</div>`;
  resultsDiv.classList.add('show');
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== 产品类型配置 =====

const PRODUCT_CONFIG = {
  normal: {
    perKg: 0,
    label: '普通货',
    surchargeLabel: null,
    hint: '',
    notice: null,
  },
  textile: {
    perKg: 1,
    label: '纺织/鞋包/帽子',
    surchargeLabel: 'A类附加费',
    hint: '📦 A类附加费 +1元/kg',
    notice: null,
  },
  toy: {
    perKg: 1,
    label: '玩具（6岁以下）',
    surchargeLabel: 'A类附加费',
    hint: '📦 A类附加费 +1元/kg · ⚠️ 需CPC认证',
    notice: '⚠️ 6岁以下玩具需要 CPC 认证，无 CPC 拒收',
  },
  battery: {
    perKg: 0,
    label: '电子产品-含电池',
    surchargeLabel: null,
    hint: '⚠️ 需提供 MSDS 及 UN38.3 测试报告',
    notice: '⚠️ 请提供 MSDS 报告和 UN38.3 测试报告，否则货代加收 100元/票',
  },
  nobattery: {
    perKg: 0,
    label: '电子产品-不含电池',
    surchargeLabel: null,
    hint: '💡 注意 FCC 认证要求',
    notice: '💡 美国海关对电子产品可能要求 FCC 认证，请准备好相关文件',
  },
  wood: {
    perKg: 0.5,
    label: '木制品/竹藤',
    surchargeLabel: '商检费',
    hint: '📦 商检费 +0.5元/kg',
    notice: '💡 木制品需做商检，请提前准备',
  },
  highvalue: {
    perKg: 1,
    label: '高价值',
    surchargeLabel: '高价值附加费',
    hint: '📦 高价值附加费 +1元/kg',
    notice: null,
  },
};

// ===== DOM 引用 =====

const zipInput       = document.getElementById('zip');
const productSelect  = document.getElementById('productType');
const productHint    = document.getElementById('productHint');
const addBoxBtn      = document.getElementById('addBoxBtn');
const calcBtn        = document.getElementById('calcBtn');
const resultsDiv     = document.getElementById('results');
const zipHint        = document.getElementById('zipHint');
const boxGroupsDiv   = document.getElementById('boxGroups');
const destTypeSelect   = document.getElementById('destType');
const isRemoteCheck    = document.getElementById('isRemote');
const needCustomsCheck  = document.getElementById('needCustoms');
const customsFeeInput   = document.getElementById('customsFee');
const exchangeRateInput = document.getElementById('exchangeRate');
const pickupSelect      = document.getElementById('pickupCity');
const regionSelect      = document.getElementById('regionSelect');
const usControls        = document.getElementById('usControls');
const euControls        = document.getElementById('euControls');
const euTaxTypeSelect   = document.getElementById('euTaxType');
const ukChannelSelect   = document.getElementById('ukChannel');
const euCountrySelect   = document.getElementById('euCountry');
const ukChannelGroup      = document.getElementById('ukChannelGroup');
const euCountryGroup      = document.getElementById('euCountryGroup');
const euSurchargeSection  = document.getElementById('euSurchargeSection');
const euSurchargeList     = document.getElementById('euSurchargeList');
const euExchangeRateInput = document.getElementById('euExchangeRate');

// ===== 箱型组管理 =====

let boxGroups = [];
let nextBoxId  = 1;

function createBoxGroupEl(id) {
  const div = document.createElement('div');
  div.className = 'box-group-card';
  div.id = `box-group-${id}`;
  div.innerHTML = `
    <div class="box-group-header">
      <span class="box-group-label">箱型 #1</span>
      <button class="btn-remove-box" type="button">× 删除</button>
    </div>
    <div class="box-inputs">
      <div class="box-input-item">
        <label>长 cm</label>
        <input type="number" class="box-l" min="1" step="0.1" placeholder="长" />
      </div>
      <div class="box-input-item">
        <label>宽 cm</label>
        <input type="number" class="box-w" min="1" step="0.1" placeholder="宽" />
      </div>
      <div class="box-input-item">
        <label>高 cm</label>
        <input type="number" class="box-h" min="1" step="0.1" placeholder="高" />
      </div>
      <div class="box-input-item">
        <label>实重 kg/箱</label>
        <input type="number" class="box-weight" min="0.1" step="0.1" placeholder="实重" />
      </div>
      <div class="box-input-item">
        <label>箱数</label>
        <input type="number" class="box-qty" min="1" step="1" value="1" placeholder="1" />
      </div>
    </div>
    <div class="box-preview"></div>
    <div class="box-msgs"></div>
  `;

  div.querySelector('.btn-remove-box').addEventListener('click', () => removeBoxGroup(id));

  div.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      updateBoxPreview(id);
      checkFormComplete();
      resultsDiv.classList.remove('show');
    });
  });

  return div;
}

function addBoxGroup() {
  const id = nextBoxId++;
  boxGroups.push(id);
  const el = createBoxGroupEl(id);
  boxGroupsDiv.appendChild(el);
  renumberBoxGroups();
  updateDeleteButtons();
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  el.querySelector('.box-l').focus();
}

function removeBoxGroup(id) {
  if (boxGroups.length <= 1) return;
  boxGroups = boxGroups.filter(g => g !== id);
  const el = document.getElementById(`box-group-${id}`);
  if (el) el.remove();
  renumberBoxGroups();
  updateDeleteButtons();
  checkFormComplete();
  resultsDiv.classList.remove('show');
}

function renumberBoxGroups() {
  boxGroups.forEach((id, idx) => {
    const el = document.getElementById(`box-group-${id}`);
    if (el) el.querySelector('.box-group-label').textContent = `箱型 #${idx + 1}`;
  });
}

function updateDeleteButtons() {
  const show = boxGroups.length > 1;
  boxGroups.forEach(id => {
    const el = document.getElementById(`box-group-${id}`);
    if (!el) return;
    const btn = el.querySelector('.btn-remove-box');
    if (btn) btn.style.display = show ? 'inline-flex' : 'none';
  });
}

function getBoxData(id) {
  const el = document.getElementById(`box-group-${id}`);
  if (!el) return null;
  return {
    l:      parseFloat(el.querySelector('.box-l').value),
    w:      parseFloat(el.querySelector('.box-w').value),
    h:      parseFloat(el.querySelector('.box-h').value),
    weight: parseFloat(el.querySelector('.box-weight').value),
    qty:    Number(el.querySelector('.box-qty').value),
  };
}

// ===== 常用箱型（localStorage）=====
const PRESET_KEY = 'cz_freight_box_presets';
function loadBoxPresets(){ try { return JSON.parse(localStorage.getItem(PRESET_KEY)) || []; } catch { return []; } }
function saveBoxPresets(list){ try { localStorage.setItem(PRESET_KEY, JSON.stringify(list)); } catch {} }
function renderBoxPresets(){
  const wrap = document.getElementById('boxPresetChips');
  if (!wrap) return;
  const list = loadBoxPresets();
  if (list.length === 0){ wrap.innerHTML = '<span class="box-preset-empty">还没有常用箱型，填好尺寸后点右边「保存当前箱型」</span>'; return; }
  wrap.innerHTML = '';
  list.forEach((p, i) => {
    const chip = document.createElement('span');
    chip.className = 'box-preset-chip';
    const text = document.createElement('span');
    text.className = 'chip-text'; text.title = '点击填入箱型';
    const nameEl = document.createElement('span'); nameEl.className = 'chip-name'; nameEl.textContent = p.name;
    const dimsEl = document.createElement('span'); dimsEl.className = 'chip-dims'; dimsEl.textContent = `${p.l}×${p.w}×${p.h} · ${p.weight}kg · ${p.qty}箱`;
    text.appendChild(nameEl); text.appendChild(dimsEl);
    text.addEventListener('click', () => applyBoxPreset(p));
    const editEl = document.createElement('span'); editEl.className = 'chip-edit'; editEl.title = '重命名'; editEl.textContent = '✎';
    editEl.addEventListener('click', (e) => { e.stopPropagation(); renameBoxPreset(i); });
    const delEl = document.createElement('span'); delEl.className = 'chip-del'; delEl.title = '删除'; delEl.textContent = '×';
    delEl.addEventListener('click', (e) => { e.stopPropagation(); deleteBoxPreset(i); });
    chip.appendChild(text); chip.appendChild(editEl); chip.appendChild(delEl);
    wrap.appendChild(chip);
  });
}
function applyBoxPreset(p){
  const id = boxGroups[0];
  const el = document.getElementById(`box-group-${id}`);
  if (!el) return;
  const set = (cls, val) => { const inp = el.querySelector(cls); inp.value = val; inp.dispatchEvent(new Event('input', { bubbles: true })); };
  set('.box-l', p.l); set('.box-w', p.w); set('.box-h', p.h); set('.box-weight', p.weight); set('.box-qty', p.qty);
}
function saveCurrentBoxPreset(){
  const d = getBoxData(boxGroups[0]);
  if (!d || isNaN(d.l) || isNaN(d.w) || isNaN(d.h) || isNaN(d.weight)){ alert('请先把第一个箱型的长、宽、高、实重填完整，再保存。'); return; }
  let name = (prompt('给这款产品起个名字（如：厨房秤5kg、珠宝秤、咖啡秤）', '') || '').trim();
  if (!name) name = `${d.l}×${d.w}×${d.h}·${d.weight}kg`;
  const list = loadBoxPresets();
  list.push({ name, l: d.l, w: d.w, h: d.h, weight: d.weight, qty: d.qty || 1 });
  saveBoxPresets(list); renderBoxPresets();
}
function deleteBoxPreset(i){ const list = loadBoxPresets(); list.splice(i, 1); saveBoxPresets(list); renderBoxPresets(); }
function renameBoxPreset(i){
  const list = loadBoxPresets();
  if (!list[i]) return;
  const name = (prompt('改个名字（如：厨房秤5kg）', list[i].name) || '').trim();
  if (!name) return;
  list[i].name = name;
  saveBoxPresets(list); renderBoxPresets();
}

// ===== 超限检查辅助 =====

function checkBoxLimits(l, w, h, weight) {
  const warnings = [];
  const errors   = [];

  if (!isNaN(weight) && weight > 0) {
    if (weight > 22.5) {
      errors.push(`❌ 单箱超 22.5kg 无法走海派，请拆箱或走超大件渠道`);
    } else if (weight > 22) {
      warnings.push(`⚠️ 单箱超重（${weight}kg > 22kg），加收 150元/箱`);
    }
  }

  if (!isNaN(l) && l > 0 && !isNaN(w) && w > 0 && !isNaN(h) && h > 0) {
    const dims   = [l, w, h].sort((a, b) => b - a);
    const longest = dims[0];
    const girth   = dims[0] + 2 * (dims[1] + dims[2]);

    if (longest > 165) {
      errors.push(`❌ 最长边 ${longest}cm 超限（> 165cm），超规拒收，无法走海派`);
    } else if (girth > 230) {
      errors.push(`❌ 围长 ${girth.toFixed(1)}cm 超限（> 230cm），超规拒收，无法走海派`);
    } else if (longest > 120) {
      warnings.push(`⚠️ 最长边 ${longest}cm 超长（> 120cm），加收 150元/箱`);
    }
  }

  return { warnings, errors };
}

function updateBoxPreview(id) {
  const el = document.getElementById(`box-group-${id}`);
  if (!el) return;

  const { l, w, h, weight, qty } = getBoxData(id);
  const previewEl = el.querySelector('.box-preview');
  const msgsEl    = el.querySelector('.box-msgs');

  const hasDims   = !isNaN(l) && l > 0 && !isNaN(w) && w > 0 && !isNaN(h) && h > 0;
  const hasWeight = !isNaN(weight) && weight > 0;
  const hasQty    = isValidQuantity(qty);

  msgsEl.innerHTML = '';

  if (!hasDims || !hasWeight || !hasQty) {
    previewEl.innerHTML = '';
    previewEl.classList.remove('show');
    return;
  }

  const volW          = (l * w * h) / 6000;
  const billablePerBox = Math.ceil(Math.max(weight, volW) * 10) / 10;
  const groupTotal    = Math.round(billablePerBox * qty * 10) / 10;

  previewEl.innerHTML =
    `计费重：<span>${billablePerBox} kg/箱 × ${qty} 箱 = ${groupTotal} kg</span>` +
    `&emsp;实重 ${weight} kg · 体积重 ${volW.toFixed(1)} kg`;
  previewEl.classList.add('show');

  if (regionSelect.value === 'us') {
    const { warnings, errors } = checkBoxLimits(l, w, h, weight);
    errors.forEach(msg => {
      msgsEl.innerHTML += `<div class="box-msg box-msg-error">${msg}</div>`;
    });
    warnings.forEach(msg => {
      msgsEl.innerHTML += `<div class="box-msg box-msg-warning">${msg}</div>`;
    });
  }
}

// ===== 偏远/住宅附加费 =====

function calcRemoteSurcharge(billable, boxCount) {
  const destType = destTypeSelect.value;
  const isRemote = isRemoteCheck.checked;
  const items    = [];
  let total      = 0;

  if (isRemote) {
    const rate   = destType === 'amazon' ? 2 : 3;
    const amount = Math.round(rate * billable * 10) / 10;
    const label  = destType === 'amazon' ? '亚马逊偏远费' : '非亚马逊偏远费';
    items.push({ label, detail: `+${rate}元/kg × ${billable} kg`, amount });
    total += amount;
  }

  if (destType === 'residential') {
    const amount = boxCount * 25;
    items.push({ label: '私人住宅附加费', detail: `${boxCount} 件 × 25元/件`, amount });
    total += amount;
  }

  return { total, items };
}

// ===== 实时输入处理 =====

function updateZoneHint() {
  const zip = zipInput.value.trim();
  if (!zip) { zipHint.textContent = ''; zipHint.className = 'input-hint'; return; }
  if (!/^\d+$/.test(zip)) {
    zipHint.textContent = '请输入数字邮编';
    zipHint.className = 'input-hint hint-red';
    return;
  }
  const zone = getZone(zip);
  if (!zone) {
    zipHint.textContent = '无法识别分区（请检查邮编）';
    zipHint.className = 'input-hint hint-red';
    return;
  }
  const labels  = { west: '📍 美西（邮编8/9开头）', central: '📍 美中（邮编4-7开头）', east: '📍 美东（邮编0-3开头）' };
  const classes = { west: 'input-hint zone-west', central: 'input-hint zone-central', east: 'input-hint zone-east' };
  zipHint.textContent = labels[zone];
  zipHint.className   = classes[zone];
}

function updateProductHint() {
  const cfg = PRODUCT_CONFIG[productSelect.value];
  if (!cfg || !cfg.hint) {
    productHint.textContent = '';
    productHint.className = 'input-hint';
    return;
  }
  productHint.textContent = cfg.hint;
  productHint.className = cfg.hint.startsWith('⚠️')
    ? 'input-hint hint-red'
    : 'input-hint hint-warn';
}

function checkFormComplete() {
  const region = regionSelect.value;

  if (region === 'us') {
    const zip = zipInput.value.trim();
    if (!/^\d{5}$/.test(zip) || !getZone(zip)) {
      calcBtn.disabled = true;
      return;
    }
  }

  let allComplete      = true;
  let hasBlockingError = false;

  for (const id of boxGroups) {
    const data = getBoxData(id);
    if (!data) { allComplete = false; break; }
    const { l, w, h, weight, qty } = data;

    if (isNaN(l) || l <= 0 || isNaN(w) || w <= 0 || isNaN(h) || h <= 0 ||
        isNaN(weight) || weight <= 0 || !isValidQuantity(qty)) {
      allComplete = false;
      break;
    }

    if (region === 'us') {
      if (weight > 22.5) { hasBlockingError = true; }

      const dims = [l, w, h].sort((a, b) => b - a);
      if (dims[0] > 165 || dims[0] + 2 * (dims[1] + dims[2]) > 230) {
        hasBlockingError = true;
      }
    }
  }

  calcBtn.disabled = !allComplete || hasBlockingError;
}

// ===== 大区切换 =====

function buildSurchargeList(region) {
  euSurchargeList.innerHTML = '';
  const items = EU_DATA.surcharges[region] || [];
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'surcharge-item';
    div.dataset.id = item.id;

    let valueHtml = '';
    let extraHtml = '';

    if (item.type === 'fixed') {
      valueHtml = `<div class="surcharge-val-wrap">
        <input type="number" class="surcharge-val-input" id="val_${item.id}" value="${item.value}" min="0" step="1" />
        <span class="surcharge-val-unit">元</span>
      </div>`;
    } else if (item.type === 'perkg') {
      valueHtml = `<div class="surcharge-val-wrap">
        <input type="number" class="surcharge-val-input" id="val_${item.id}" value="${item.value}" min="0" step="0.1" />
        <span class="surcharge-val-unit">元/kg</span>
      </div>`;
    } else if (item.type === 'perbox') {
      valueHtml = `<div class="surcharge-val-wrap">
        <input type="number" class="surcharge-val-input" id="val_${item.id}" value="${item.value}" min="0" step="1" />
        <span class="surcharge-val-unit">元/箱</span>
      </div>`;
    } else if (item.type === 'textile') {
      valueHtml = `<div class="surcharge-val-wrap">
        <input type="number" class="surcharge-val-input" id="val_${item.id}" value="2.5" min="0" step="0.1" />
        <span class="surcharge-val-unit">元/kg</span>
      </div>
      <span class="surcharge-rate-hint">税率12%→2.5 · 7%以上→1.5 · 7%以下→1</span>`;
    } else if (item.type === 'residential') {
      valueHtml = `<div class="surcharge-val-wrap">
        <input type="number" class="surcharge-val-input" id="val_${item.id}" value="0.5" min="0" step="0.1" />
        <span class="surcharge-val-unit">元/kg（最低 80 元）</span>
      </div>`;
    } else if (item.type === 'declare') {
      valueHtml = `<span class="surcharge-hint">350 元 + 续页数 × 50 元</span>`;
      extraHtml = `
        <div class="surcharge-extra" id="extra_${item.id}">
          <label>续页数：</label>
          <input type="number" id="inp_${item.id}" min="0" step="1" value="0" />
        </div>`;
    } else if (item.type === 'extrasku') {
      valueHtml = `<span class="surcharge-hint">超出项数 × 30 元</span>`;
      extraHtml = `
        <div class="surcharge-extra" id="extra_${item.id}">
          <label>超出项数：</label>
          <input type="number" id="inp_${item.id}" min="0" step="1" value="0" />
        </div>`;
    }

    div.innerHTML = `
      <label>
        <input type="checkbox" id="chk_${item.id}" />
        ${item.label}
      </label>
      ${valueHtml}
      ${extraHtml}
    `;

    const chk = div.querySelector(`#chk_${item.id}`);
    const extra = div.querySelector(`#extra_${item.id}`);
    if (chk && extra) {
      chk.addEventListener('change', () => {
        extra.classList.toggle('show', chk.checked);
        resultsDiv.classList.remove('show');
      });
    }
    if (chk) {
      chk.addEventListener('change', () => resultsDiv.classList.remove('show'));
    }
    div.querySelectorAll('select, input[type=number]').forEach(el => {
      el.addEventListener('change', () => resultsDiv.classList.remove('show'));
      el.addEventListener('input',  () => resultsDiv.classList.remove('show'));
    });

    euSurchargeList.appendChild(div);
  });
}

function updateRegionDisplay() {
  const region = regionSelect.value;
  usControls.style.display        = region === 'us' ? ''   : 'none';
  euControls.style.display        = region !== 'us' ? ''   : 'none';
  ukChannelGroup.style.display    = region === 'uk' ? ''   : 'none';
  euCountryGroup.style.display    = region === 'eu' ? ''   : 'none';
  euSurchargeSection.style.display = region !== 'us' ? ''  : 'none';
  if (region !== 'us') buildSurchargeList(region);
  resultsDiv.classList.remove('show');
  checkFormComplete();
}

// ===== 欧洲计算 =====

const CHECKLIST_HTML = `<div class="checklist-card">
  <strong>接单前检查清单</strong>
  · 电子产品必须有 CE 认证、并在货品上贴 CE 标，否则海关扣关货代不负责。<br>
  · 电池：纯电池一律不接；含电池可走「英国电池专线」；欧洲大陆含电池货物请先与货代确认能否承运。<br>
  · 计重规则：单票最低 25KG 起运（英国 26KG），单件计费重最低 13KG（工具已自动计入）。<br>
  · 超长超重：标准件为单件实重&lt;30KG 且材积重&lt;25KG、最长边&lt;120cm、第二/三边&lt;60cm、周长&lt;300cm；实重&gt;35KG 或周长&gt;300cm 时单件最长边须≤150cm；单件实重&gt;40KG 或最长边&gt;150cm 一律拒收。<br>
  · 不接货物：液体、粉末、仿牌/侵权/禁运品；反倾销不锈钢、陶瓷餐具、自行车、山地车、手机、纯电池；珠宝、动植物。<br>
  · 包装：只接纸箱（不接木箱/编织袋/两箱并一箱）；单件&gt;15KG 贴 Team Lift 标；外箱贴 MADE IN CHINA + 两张 FBA 标。<br>
  · 申报：品名、价值如实申报并带 HSCODE；瞒报或仿牌一律扣货并罚 80000€/柜。
</div>`;

const TERMS_TEXT = `【渠道重点说明】
1、接单独报关件350RMB/票，续页50RMB/页
2、非亚马逊地址附加费（海外仓、商业地址、私人地址)+100RMB/票；偏远地址和岛屿地址单询，需确认是否能接以及费用后再下单。如果因派送不成功产生第二次派送，重新派送费用如下：100RMB/箱。
3、单票货物不可超过5项品名，每增加一个品名加收人民币30元/个，单票一件加收100RMB一件。（货物品名和价值必须如实申报，不可用笼统品名，需带有HSCODE海关编码）
4、单票最低25KG起运，不足25KG按25KG计费，单件计费重不能低于13KG，不够13KG按13KG计费。
5、我司所有液体，粉末，仿牌等侵权或禁运类产品一律不接
6、装箱单明细一定要和实际产品数量相符合，如有瞒报导致的扣货或延误所产生的费用，我司不承担任何责任。如发现仿牌等侵权类产品，一律扣货并处80000€/柜罚款
7、如亚马逊仓库因包装问题产生拒收等原因，我司不承担任何责任，我司不再对包装做任何审核；
8、付款说明：此渠道需及时支付货款，否则货物到当地清关后不予派送服务.

【超长超重收费标准】
标准包裹：实重小于30KG/件且材积重小于25KG/件，箱子最长边小于120cm，第二边小于60cm，第三边小于60cm，周长小于300cm【（最长边+（宽+高）*2）<300cm】
单件材积重量超过25KG
实重＞35KG或周长（长+（宽+高）*2）＞300CM 单件最长边不超过150CM（不接单件实重超过40KG的货物）
拒收包裹：单件实重大于40KG或者最长边大于150cm拒收

【除外责任】
1、如因侵权问题，我司不承担任何责任并且保留追究发件人因此带来对我司的损失的赔偿
2、如因客户货物本身质量问题以及涉及到具体的认证问题等，均不受理赔偿
3、如遇战争，自然灾害等不可抗力因素除导致货物破坏或灭失，不受理赔偿
4、在运输过程中如遇到班列延误/清关延误等引起的总体时效延误，均不受理赔偿
5、对在运输途中遗失的整箱和整票货件作出赔偿，其余如货物延误、货物水湿、部分货物内容遗失指非整箱遗失、货物破损、不可抗力因素被偷/被盗等问题均不予赔偿
6、如因地址错误和亚马逊拒收、客户拒收等原因导致货物被退回，我们将会收取退回费用并加收400元/票的操作费。如需重发，将收取400元/票操作费，具体派送费根据地址请咨询我司业务员
7、如所申报的产品品名，种类，数量不符，所产生的任何问题，我司不承担任何责任。
8、货入我司系统后，且已出转单出货的；由于客户原因要求退件，需要加收100RMB/票的退件费。若货物已离开深圳仓库，不做扣件和退件。

【赔偿说明】
1：提取前丢失，赔偿20RMB/KG，且不退运费；尾程快递已提取后，确认丢失的件，按最高100美金/票赔偿（无论申报或者货值多少，发货即为默认我司赔偿条款）
2：货物在提取后未收到货在15天内提出申请查询处理，超期件不提供受理问题件。
3：请用正规、硬朗的箱子将货物包装好，如货物损坏、非整箱丢失的, 不予赔偿（高价值建议客户自行购买保险）
4：如因产品不合格导致海关扣货/销毁等，不予赔偿。

【拒收产品】如发现冲货不备注行为没收货物并罚款80000€/柜罚款
1、不接反倾销不锈钢产品、陶瓷餐具、自行车、山地车、手机，纯电池及任何仿牌产品
2、所有电子产品需要有CE认证，货品上也需要贴CE标.因此产生的扣关，我司不负责
3、拒收牌子,违禁品货物
4、珠宝类、动植物不接

【包装要求】
1、亚马逊单件货物重量限制30公斤以内（不含30KG）；如单件超过15公斤，请按照Amazon FBA的规定贴上《Team Lift》标签，所有货物外箱需贴《MADE IN CHINA》标签，请在每箱外箱上贴上一张MADEINCHINA和两张FBA标签，标签不要贴在封箱处；
2、不接所有不规则的货件/木箱及编织袋包装的货件/两箱并一箱包装货物，只接受纸箱包装，其他包装的均不接，我司不对包装做任何二次审核，如因客户包装问题导致的无法送仓或其他相关问题，我司不承担任何责任；

【查验可能产生的费用 / 需提供文件】
若货物查验会产生如下费用：
1.清关通知需提供以下文件（开箱查验）：
- test reports 商品检测报告
- certificates of compliance (declaration of conformity) 符合性声明。每个有CE认证的产品都有，由生产商开具，含欧盟代表联系方式及生产商、产品信息。
- 注意：文件报告必须为英文，包含商品的彩色照片、生产批号，显示符合欧盟检测标准。
- 进口人具体信息（姓名，地址，电话，邮箱）。
- 确认具体派送地址。
- 具体说明货物将在哪里销售（电商平台或商场，电商请给销售链接）。海关要求用 excel 表格列出商品及对应销售链接和彩色商品图片。
- 用 excel 表格列出每一箱具体包含的产品种类和件数（写明箱号和分单号）。

【特别声明】（以下情况不接受任何赔偿）
1）货物涉及 FDA、FCC、UL、CE、蓝牙、HDMI、LaceyAct、DOT 等认证或知识产权问题，或目的地海关认定为品牌货需授权文件的，须及时提供授权书/认证报告；未提供导致扣关甚至退运的，所有责任和费用由发件人承担；
2）货物未按实际申报、侵犯知识产权、当地禁止进口等导致海关扣货，不在赔偿范围，我司只协助提供清关文件；
3）货物本身质量问题及相关认证问题被海关查扣的，不受理赔偿；
4）战争、自然灾害等不可抗力导致破损或灭失，不受理赔偿；
5）清关延误等引起的总体时效延误，不受理赔偿；
6）产品数量缺少、损坏、包装盒破损不受理赔偿，易碎品不接受任何损失赔偿。

发货即为已经阅读以上条款并接受以上条款的约束！`;

const US_CHECKLIST_HTML = `<div class="checklist-card">
  <strong>接单前检查清单 · 美国海派</strong>
  · 拒收/违禁品：手机、笔记本、激光类、液体、粉末、U盘、打火机、太阳镜、化妆品、食品、药品、婴儿用品、易燃易爆、古董、货币、纯电池、移动电源、电子烟等 → 查出罚 2000–5000 元/票。<br>
  · 反倾销产品拒收：不锈钢、陶瓷餐具、自行车、太阳能板等（参考美国对华反倾销目录）。<br>
  · 认证要求：FDA 产品（太阳镜、陶瓷、接触人体类）需 FDA；玩具（6岁以下不接，12岁以下需 CPC + TESTING REPORT + tracking label）；蓝牙需蓝牙证书 + 授权码；带 UL/USB/HDMI/SD 需对应认证。<br>
  · 电子秤提示：行李秤(HS 8423820010)一般可走；含电池需 MSDS/UN38.3；带蓝牙需蓝牙证书。<br>
  · 包装：只接纸箱（航空箱/木箱/铁箱/不规则/非纸箱 拒收）。<br>
  · 申报：品名、价值如实并带 HSCODE；漏报关最高赔报关费 3 倍；敏感品查出罚 5000 元/票。<br>
  <br>
  【以下费用工具未自动计算，请按需另计】<br>
  · 中美增税补收：清关税率每涨 10% → 补收 0.5 元/kg 或 100 元/方。<br>
  · 超重：单箱实重&gt;22kg → +150 元/箱（&gt;22.5kg 无服务，走超大件）。<br>
  · 超长：最长边&gt;120cm，或次长边&gt;75cm，或(长+2×(宽+高))&gt;260cm → +150 元/箱。<br>
  · 地址修正费：最低 200 元/箱；打单后改地址/重贴标 USD10/件（最低 USD150/票）。<br>
  · 拦截扣件：$0.5/件×整柜件数（最低 $220/票）；到港前5日内 +$220，已到港 +$520。<br>
  · 运费结算：出仓后、到港前3工作日未结清 → 扣件 $1000/票。
</div>`;

const US_TERMS_TEXT = `【一、特殊产品附加费】（税率查询 https://hts.usitc.gov/）
· A类：帽子、箱包、鞋类、服装、袜子等全纺织类穿戴产品、圆珠笔类 —— 1元/KG 或 200RMB/CBM
· 玩具类：玩具和儿童用品（6岁以下玩具不接），需 CPC 认证、CPC report、Track label（permanent mark），无 CPC 认证不接！出货前请提供有效认证并保证符合美国进口要求；如遇查验以海关判断为准，我司不承担责任 —— 1元/KG 或 200RMB/CBM
· 额外声明：2025年3月4号以后如美国对华临时增税，清关税率平均每上涨10%，对在途未清关货物补收 0.5RMB/KG 或 100元/方，以此类推 —— 0.5元/KG 或 100RMB/CBM
· 拒收类：①手机、笔记本电脑、激光类、液体、粉末、U盘、光驱、内存条、打火机、活性植物、太阳眼镜、化妆品、食品、婴儿用品(含衣服)、药品、易燃易爆、古董、货币等国家禁止出口产品，如发现罚款 2000-5000元/票，情节严重上报公安局！②航空箱、超大件、变形软箱、无规则易破损纸箱、非纸箱包装、不可拆封产品、强烈气味产品。③反倾销产品 —— 拒收

【二、其它附加费用说明】
1、高价值产品（平均价值>1500$/100KG，>5000$/100KG 单询），建议购买跨境保险 —— 1元RMB/KG，不叠加
2、关于超重：单箱实重不得超过22KG，超22KG 加收 150RMB/箱，单箱超22.5KG 无服务（走超大件）。关于超长：最长边>120CM、或次长边>75CM、或 长+2×(宽+高)>260cm，满足一项加 150RMB/箱；超大尺寸不接：①单件实重>22.5KG ②最长边>230cm ③长+2×(宽+高)>300cm。关于偏远：亚马逊偏远+2RMB/KG，私人住宅+25RMB/件，非亚马逊(商业/私人)偏远+3RMB/KG，可发货后6个月内补收。关于地址修正费：发件人通知或 UPS/FEDEX 自动更正地址，发件人无条件支付，最低 200RMB/箱。关于包装额外处理费：绑带、保鲜膜、布料、圆形、木/金属包装等，按 UPS/FEDEX 账单实报实销。货物打单后改地址、重贴标签：USD10/件 最低 USD150/票；退回美国仓库 USD1.5/KG 最低 USD150/票，仓租另计 —— 叠加
3、单独报关：请对接报关专员提供授权码（未对接漏报不负责；单证申报不详产生的仓租柜租罚款由寄件人承担；10万美金以上单证不接），漏报关最高赔偿报关费3倍；海关查验报关单与实际不符产生罚款由寄件人承担100% —— 350RMB/票
4、商检费：竹木藤条等需商检报关产品，单独报关 350RMB/票；买单报关件木制品商检费 +0.5RMB/KG 或 800RMB/票（报关退税件客户可自行做商检）。需商检货物：木家私、木制工艺品、木架、竹制品、藤制品等 —— 叠加
5、拦截扣件：海运渠道如需在美国扣件请在船舶到港前5个工作日前通知，改派/扣件会产生手续费及仓库杂费；UPS 取件后申请退件不保证100%成功，并产生退件手续费和二次派送费 —— $0.5/件×该柜总件数（最低 $220/票）
6、扣件特别说明：到港前5工作日前通知按正常收取；5工作日内通知 +220$/票；已到港后通知 +520$/票，且不保证成功
7、运费结算：①收账单3天内核对并付款，否则留仓；②出仓后、柜到港前3工作日还未结清 → 海外仓扣件 $1000/票，由此造成的时效延误及费用由寄件人承担
特别声明：不得谎报漏报品名，拒收液体、粉末、仿牌、食品、医疗美容产品、纯电池、反倾销类、集运货、水烟壶及配件等敏感产品！查出罚款 5000RMB/票，并由发货方承担海关扣关罚款及连带责任

【三、拒接产品】
1、FDA产品（皮肤接触/食用类）：活性植物、口杯、牙刷头、温度计、眼镜、纹眉笔、剃毛器、按摩仪、医疗用品、化妆品、内衣、婴儿及儿童产品、儿童玩具、毛绒玩具等需 FDA 认证产品
2、侵权产品：蓝牙标及含蓝牙字样/标识产品、三叉戟数据线、CE/HDMI/FCC/LACEY ACT/DOT/RW 标识产品
3、违禁品：护照身份证私人物品、成人用品、打火机(含USB)、手机、对讲机、移动电源、电子烟、彩印、硒鼓、墨盒、血压计、安全锤、手推车、电动滑板车、钢钉、文具本、手表、铅笔、折叠金属桌椅、仿牌/冒牌/侵权、纯电池、危险品、液体、木箱/铁箱等难拆检货物、不规则货物、非纸箱货物
4、反倾销类产品：清单很长（不锈钢、陶瓷餐具、自行车、太阳能板、木制卧室家具、复合木地板、铝型材、彩电、手推车、钢钉等），完整目录以货代「美国对华反倾销产品目录」为准

【四、海运专线赔偿方案】
索赔程序：货件 UPS 未提取/未签收，请在7-10工作日内查 FBA 后台是否上架，10工作日后提供未上架截图(带屏幕右下角真实时间)，以书面形式向我司发起索赔，超过20工作日不予受理。
赔偿方案：①运输中丢失(整票 UPS 未提取)，按商业发票申报货值赔偿但最高不超 40RMB/KG，不退运费；②已交 UPS 后丢失，按 UPS 方案做申报价值赔偿，最高不超 100USD/票（高货值请自行购买运输保险）。
扣关赔偿：扣关达60个工作日以上（因发件人低申报、品名不符、反倾销、认证、侵权等情况责任自负），按申报货值赔偿最高不超 15元/KG，不退运费。
特别提示：客户一旦接受我司服务，即视为已详细阅读本价格表所有备注条款并接受约束。`;

function calcSurcharges(region, totalBillable, totalBoxCount) {
  const items  = EU_DATA.surcharges[region] || [];
  const result = [];
  items.forEach(item => {
    const chk = document.getElementById(`chk_${item.id}`);
    if (!chk || !chk.checked) return;
    let amount = 0;
    let detail = '';
    if (item.type === 'fixed') {
      const val = parseNumberInput(`val_${item.id}`, item.value);
      amount = val;
      detail = `固定 ${val} 元`;
    } else if (item.type === 'perkg') {
      const rate = parseNumberInput(`val_${item.id}`, item.value);
      amount = Math.round(rate * totalBillable * 10) / 10;
      detail = `${rate} 元/kg × ${totalBillable} kg`;
    } else if (item.type === 'perbox') {
      const rate = parseNumberInput(`val_${item.id}`, item.value);
      amount = rate * totalBoxCount;
      detail = `${rate} 元/箱 × ${totalBoxCount} 箱`;
    } else if (item.type === 'textile') {
      const rate = parseNumberInput(`val_${item.id}`, 2.5);
      amount = Math.round(rate * totalBillable * 10) / 10;
      detail = `${rate} 元/kg × ${totalBillable} kg`;
    } else if (item.type === 'declare') {
      const pages = parseInt(document.getElementById(`inp_${item.id}`)?.value || '0') || 0;
      amount = 350 + pages * 50;
      detail = pages > 0 ? `350 + ${pages} 页 × 50` : '350 元';
    } else if (item.type === 'residential') {
      const rate = parseNumberInput(`val_${item.id}`, 0.5);
      amount = Math.max(Math.round(rate * totalBillable * 10) / 10, 80);
      detail = `${rate} 元/kg × ${totalBillable} kg（最低 80 元）`;
    } else if (item.type === 'extrasku') {
      const extra = parseInt(document.getElementById(`inp_${item.id}`)?.value || '0') || 0;
      amount = extra * 30;
      detail = `${extra} 项 × 30 元`;
    }
    result.push({ label: item.label, detail, amount });
  });
  return result;
}

function calcEU() {
  const region   = regionSelect.value;
  const config   = region === 'uk' ? EU_DATA.uk : EU_DATA.eu;
  const taxType  = euTaxTypeSelect.value;
  const taxLabel = taxType === 'taxed' ? '包税' : '不包税';

  const selected = region === 'uk'
    ? EU_DATA.uk.channels.find(c => c.id === ukChannelSelect.value)
    : EU_DATA.eu.countries.find(c => c.id === euCountrySelect.value);

  if (!config || !selected || !['taxed', 'untaxed'].includes(taxType)) {
    showCalcError('当前渠道或报价类型数据缺失，请检查报价数据配置。');
    return;
  }

  const euRate = getValidExchangeRate(euExchangeRateInput);
  if (euRate === null) {
    showCalcError('汇率必须是大于 0 的有效数字。');
    return;
  }

  let totalBillable = 0;
  let totalBoxCount = 0;
  const groupCount  = boxGroups.length;

  for (const id of boxGroups) {
    const { l, w, h, weight, qty } = getBoxData(id);
    const volW           = (l * w * h) / EU_DATA.volumetricDivisor;
    const rawBillable    = Math.ceil(Math.max(weight, volW) * 10) / 10;
    const billablePerBox = Math.max(rawBillable, config.minPerPiece);
    totalBillable += billablePerBox * qty;
    totalBoxCount += qty;
  }

  const rawTotalBillable = Math.round(totalBillable * 10) / 10;
  const minApplied = rawTotalBillable < config.minWeight;
  totalBillable = Math.max(rawTotalBillable, config.minWeight);

  const tier = region === 'uk'
    ? (totalBillable >= 100 ? 100 : 26)
    : (totalBillable >= 100 ? 100 : totalBillable >= 50 ? 50 : 15);

  const tierLabel = tier === 100 ? '100KG+' : tier === 50 ? '50KG+' : (region === 'uk' ? '26KG+' : '15KG+');
  const unitPrice = selected.prices?.[taxType]?.[tier];
  if (!Number.isFinite(unitPrice)) {
    showCalcError('当前渠道缺少对应重量档位价格，请检查报价数据配置。');
    return;
  }
  const baseCost  = Math.round(totalBillable * unitPrice * 10) / 10;
  const destLabel = region === 'uk' ? EU_DATA.uk.label : selected.name;
  const roleLabel = region === 'uk' ? '选定渠道' : '目的国家';

  const surcharges     = calcSurcharges(region, totalBillable, totalBoxCount);
  const surchargeTotal = surcharges.reduce((s, x) => s + x.amount, 0);
  const grandTotal     = Math.round((baseCost + surchargeTotal) * 10) / 10;

  const toUSD  = rmb => '$' + (rmb / euRate).toFixed(1);

  let feeRows = `
    <div class="fee-row">
      <span class="fee-label">基础运费</span>
      <span class="fee-detail">${totalBillable} kg × ${unitPrice.toFixed(1)} 元/kg（${tierLabel} 档）${minApplied ? `<br><span style="opacity:.65;font-size:.85em;">实际计费重 ${rawTotalBillable} kg，不足最低起运 ${config.minWeight} kg，按 ${config.minWeight} kg 计费</span>` : ''}</span>
      <span class="fee-amount">¥${baseCost.toFixed(1)}</span>
    </div>`;

  surcharges.forEach(s => {
    feeRows += `
    <div class="fee-row">
      <span class="fee-label">${s.label}</span>
      <span class="fee-detail">${s.detail}</span>
      <span class="fee-amount">¥${s.amount.toFixed(1)}</span>
    </div>`;
  });

  feeRows += `
    <div class="fee-row fee-total">
      <span class="fee-label">合　计</span>
      <span class="fee-detail"></span>
      <span class="fee-amount">¥${grandTotal.toFixed(1)}（≈ ${toUSD(grandTotal)}）</span>
    </div>`;

  resultsDiv.innerHTML = `
    <div class="result-meta">
      总计费重 <strong>${totalBillable} kg</strong>（共 ${groupCount} 种箱型）&nbsp;·&nbsp;
      目的地：${destLabel}&nbsp;·&nbsp;
      报价类型：${taxLabel}&nbsp;·&nbsp;
      适用档位：<strong>${tierLabel}</strong>
    </div>

    <div class="result-best-card">
      <div class="result-best-header">
        <div>
          <div class="result-best-label">${roleLabel}</div>
          <div class="result-best-name">${selected.name}</div>
        </div>
        <div class="result-best-price-wrap">
          <div class="result-best-price-label">合计报价</div>
          <div class="result-best-price">¥${grandTotal.toFixed(1)}</div>
          <div style="font-size:.92rem;color:#16a34a;font-weight:600;margin-top:3px">≈ ${toUSD(grandTotal)}</div>
        </div>
      </div>
      <div class="fee-breakdown">${feeRows}</div>
    </div>

    ${CHECKLIST_HTML}

    <div class="terms-wrap">
      <button class="terms-toggle" id="termsToggleBtn" type="button">▶ 完整条款（货代原文，点击展开）</button>
      <div class="terms-body" id="termsBody">${TERMS_TEXT}</div>
    </div>
  `;

  document.getElementById('termsToggleBtn').addEventListener('click', function () {
    const body  = document.getElementById('termsBody');
    const open  = body.classList.toggle('show');
    this.textContent = (open ? '▼ ' : '▶ ') + '完整条款（货代原文，点击展开）';
  });

  resultsDiv.classList.add('show');
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== 事件绑定 =====

zipInput.addEventListener('input', () => {
  updateZoneHint();
  checkFormComplete();
  resultsDiv.classList.remove('show');
});

productSelect.addEventListener('change', () => {
  updateProductHint();
  resultsDiv.classList.remove('show');
});

pickupSelect.addEventListener('change',    () => resultsDiv.classList.remove('show'));
destTypeSelect.addEventListener('change',  () => resultsDiv.classList.remove('show'));
isRemoteCheck.addEventListener('change',   () => resultsDiv.classList.remove('show'));
needCustomsCheck.addEventListener('change', () => resultsDiv.classList.remove('show'));
customsFeeInput.addEventListener('input',   () => resultsDiv.classList.remove('show'));
exchangeRateInput.addEventListener('input', () => resultsDiv.classList.remove('show'));

addBoxBtn.addEventListener('click', addBoxGroup);
document.getElementById('savePresetBtn').addEventListener('click', saveCurrentBoxPreset);

regionSelect.addEventListener('change', updateRegionDisplay);
euTaxTypeSelect.addEventListener('change',    () => resultsDiv.classList.remove('show'));
ukChannelSelect.addEventListener('change',    () => resultsDiv.classList.remove('show'));
euCountrySelect.addEventListener('change',    () => resultsDiv.classList.remove('show'));
euExchangeRateInput.addEventListener('input', () => resultsDiv.classList.remove('show'));

// ===== 点击计算 =====

calcBtn.addEventListener('click', () => {
  if (regionSelect.value !== 'us') { calcEU(); return; }

  const zip         = zipInput.value.trim();
  const productType = productSelect.value;
  const zone        = getZone(zip);
  const productCfg  = PRODUCT_CONFIG[productType];
  if (!productCfg) {
    showCalcError('当前产品类型数据缺失，请检查报价数据配置。');
    return;
  }

  const rate = getValidExchangeRate(exchangeRateInput);
  if (rate === null) {
    showCalcError('汇率必须是大于 0 的有效数字。');
    return;
  }
  const toUSD       = rmb => '$' + (rmb / rate).toFixed(1);

  let totalBillable   = 0;
  let totalBoxCount   = 0;
  let overweightBoxes = 0;
  let oversizeBoxes   = 0;

  for (const id of boxGroups) {
    const { l, w, h, weight, qty } = getBoxData(id);
    const volW          = (l * w * h) / 6000;
    const billablePerBox = Math.ceil(Math.max(weight, volW) * 10) / 10;
    totalBillable += billablePerBox * qty;
    totalBoxCount += qty;

    if (weight > 22 && weight <= 22.5) overweightBoxes += qty;

    const dims    = [l, w, h].sort((a, b) => b - a);
    const longest = dims[0];
    const girth   = dims[0] + 2 * (dims[1] + dims[2]);
    if (longest > 120 && longest <= 165 && girth <= 230) oversizeBoxes += qty;
  }

  totalBillable = Math.round(totalBillable * 10) / 10;
  const rawTotalBillable = totalBillable;

  resultsDiv.innerHTML = '';
  resultsDiv.classList.add('show');

  const minApplied = totalBillable < 21;
  if (totalBillable < 21) totalBillable = 21;

  // 附加费计算
  const productSurcharge = Math.round(productCfg.perKg * totalBillable * 10) / 10;
  const overweightCharge = overweightBoxes * 150;
  const oversizeCharge   = oversizeBoxes * 150;
  const declarationFee   = needCustomsCheck.checked ? parseNumberInput('customsFee', 0) : 0;
  const remoteResult     = calcRemoteSurcharge(totalBillable, totalBoxCount);
  const totalSurcharge   = productSurcharge + overweightCharge + oversizeCharge + declarationFee + remoteResult.total;

  // 各渠道计算并排序（义乌交货时过滤掉 noYiwu 渠道）
  const rows = FREIGHT_DATA.channels
    .filter(ch => !(pickupSelect.value === 'yiwu' && ch.noYiwu))
    .reduce((acc, ch) => {
      const unitPrice = getPrice(ch, zone, totalBillable);
      if (!Number.isFinite(unitPrice)) return acc;
      const baseCost  = Math.round(totalBillable * unitPrice * 10) / 10;
      const total     = Math.round((baseCost + totalSurcharge) * 10) / 10;
      acc.push({ ch, unitPrice, baseCost, total });
      return acc;
    }, []);
  if (rows.length === 0) {
    showCalcError('当前邮编分区或重量档位缺少可用渠道价格，请检查报价数据配置。');
    return;
  }
  rows.sort((a, b) => a.total - b.total);

  const best      = rows[0];
  const tier      = getWeightTier(totalBillable);
  const tierLabel = tier === 100 ? '100KG+' : tier === 51 ? '51KG+' : '21KG+';
  const zoneBadge = `<span class="zone-badge ${getZoneBadgeClass(zone)}">${getZoneLabel(zone)}</span>`;
  const groupCount = boxGroups.length;

  // 费用明细行
  let feeRows = '';

  feeRows += `
    <div class="fee-row">
      <span class="fee-label">基础运费</span>
      <span class="fee-detail">${totalBillable} kg × ${best.unitPrice.toFixed(1)} 元/kg（${tierLabel} 档）${minApplied ? `<br><span style="opacity:.65;font-size:.85em;">实际计费重 ${rawTotalBillable} kg，不足最低起运 21 kg，按 21 kg 计费</span>` : ''}</span>
      <span class="fee-amount">¥${best.baseCost.toFixed(1)}</span>
    </div>`;

  if (declarationFee > 0) {
    feeRows += `
      <div class="fee-row">
        <span class="fee-label">报关费</span>
        <span class="fee-detail">单独报关</span>
        <span class="fee-amount">¥${declarationFee}</span>
      </div>`;
  }

  if (productSurcharge > 0 && productCfg.surchargeLabel) {
    const rateText = productCfg.perKg === 0.5 ? '0.5' : String(productCfg.perKg);
    feeRows += `
      <div class="fee-row">
        <span class="fee-label">${productCfg.surchargeLabel}</span>
        <span class="fee-detail">+${rateText}元/kg × ${totalBillable} kg</span>
        <span class="fee-amount">¥${productSurcharge.toFixed(1)}</span>
      </div>`;
  }

  if (overweightCharge > 0) {
    feeRows += `
      <div class="fee-row">
        <span class="fee-label">超重附加费</span>
        <span class="fee-detail">${overweightBoxes} 箱 × 150元/箱</span>
        <span class="fee-amount">¥${overweightCharge}</span>
      </div>`;
  }

  if (oversizeCharge > 0) {
    feeRows += `
      <div class="fee-row">
        <span class="fee-label">超长附加费</span>
        <span class="fee-detail">${oversizeBoxes} 箱 × 150元/箱</span>
        <span class="fee-amount">¥${oversizeCharge}</span>
      </div>`;
  }

  remoteResult.items.forEach(item => {
    feeRows += `
      <div class="fee-row">
        <span class="fee-label">${item.label}</span>
        <span class="fee-detail">${item.detail}</span>
        <span class="fee-amount">¥${item.amount.toFixed(1)}</span>
      </div>`;
  });

  feeRows += `
    <div class="fee-row fee-total">
      <span class="fee-label">合　计</span>
      <span class="fee-detail"></span>
      <span class="fee-amount">¥${best.total.toFixed(1)}（≈ ${toUSD(best.total)}）</span>
    </div>`;

  // 所有渠道表格
  let tableRows = '';
  rows.forEach(({ ch, unitPrice, baseCost, total }, idx) => {
    const isCheapest = idx === 0;
    tableRows += `
      <tr${isCheapest ? ' class="cheapest"' : ''}>
        <td data-label="渠道">
          <span class="channel-name">
            ${ch.name}
            ${isCheapest ? '<span class="cheapest-badge">最低价</span>' : ''}
          </span>
          <span class="channel-delivery">派送 ${ch.delivery[zone]}</span>
        </td>
        <td data-label="单价" class="price-unit">${unitPrice.toFixed(1)}</td>
        <td data-label="基础运费" class="price-unit">¥${baseCost.toFixed(1)}</td>
        <td data-label="总报价" class="total-price">¥${total.toFixed(1)} / ${toUSD(total)}</td>
        <td data-label="备注" class="remark">${ch.remark}</td>
      </tr>`;
  });

  // 产品注意事项
  let noticeHtml = '';
  if (productCfg.notice) {
    const isInfo = productCfg.notice.startsWith('💡');
    noticeHtml = `<div class="notice-card${isInfo ? ' notice-info' : ''}">${productCfg.notice}</div>`;
  }

  resultsDiv.innerHTML = `
    <div class="result-meta">
      总计费重 <strong>${totalBillable} kg</strong>（共 ${groupCount} 种箱型）&nbsp;·&nbsp;
      分区：${zoneBadge}&nbsp;·&nbsp;
      邮编 ${zip}&nbsp;·&nbsp;
      适用档位：<strong>${tierLabel}</strong>
    </div>

    <div class="result-best-card">
      <div class="result-best-header">
        <div>
          <div class="result-best-label">最低价渠道</div>
          <div class="result-best-name">${best.ch.name}</div>
          <div class="result-best-delivery">派送 ${best.ch.delivery[zone]}</div>
        </div>
        <div class="result-best-price-wrap">
          <div class="result-best-price-label">总报价</div>
          <div class="result-best-price">¥${best.total.toFixed(1)}</div>
          <div style="font-size:.92rem;color:#16a34a;font-weight:600;margin-top:3px">≈ ${toUSD(best.total)}</div>
        </div>
      </div>
      <div class="fee-breakdown">
        ${feeRows}
      </div>
    </div>

    <div class="all-channels-wrap">
      <button class="toggle-all-btn" id="toggleAllBtn" type="button">
        ▼ 查看所有 ${rows.length} 个渠道对比
      </button>
      <div class="all-channels-table" id="allChannelsTable" style="display:none">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>渠道</th>
                <th>单价（元/kg）</th>
                <th>基础运费</th>
                <th>总报价（元）</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
    </div>

    ${noticeHtml}

    ${US_CHECKLIST_HTML}

    <div class="terms-wrap">
      <button class="terms-toggle" id="usTermsToggleBtn" type="button">▶ 完整条款（货代原文，点击展开）</button>
      <div class="terms-body" id="usTermsBody">${US_TERMS_TEXT}</div>
    </div>
  `;

  document.getElementById('toggleAllBtn').addEventListener('click', function () {
    const tableDiv = document.getElementById('allChannelsTable');
    const isOpen   = tableDiv.style.display !== 'none';
    tableDiv.style.display = isOpen ? 'none' : 'block';
    this.textContent = isOpen
      ? `▼ 查看所有 ${rows.length} 个渠道对比`
      : `▲ 收起渠道对比`;
  });

  document.getElementById('usTermsToggleBtn').addEventListener('click', function () {
    const body = document.getElementById('usTermsBody');
    const open = body.classList.toggle('show');
    this.textContent = (open ? '▼ ' : '▶ ') + '完整条款（货代原文，点击展开）';
  });

  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ===== 初始化 =====
addBoxGroup();
renderBoxPresets();
updateRegionDisplay();
updateProductHint();
