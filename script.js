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
  const tier = getWeightTier(billable);
  return channel.prices[zone][tier];
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

const zipInput      = document.getElementById('zip');
const productSelect = document.getElementById('productType');
const productHint   = document.getElementById('productHint');
const addBoxBtn     = document.getElementById('addBoxBtn');
const calcBtn       = document.getElementById('calcBtn');
const resultsDiv    = document.getElementById('results');
const zipHint       = document.getElementById('zipHint');
const boxGroupsDiv  = document.getElementById('boxGroups');

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
    qty:    Math.max(1, parseInt(el.querySelector('.box-qty').value) || 1),
  };
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

  msgsEl.innerHTML = '';

  if (!hasDims || !hasWeight) {
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

  const { warnings, errors } = checkBoxLimits(l, w, h, weight);
  errors.forEach(msg => {
    msgsEl.innerHTML += `<div class="box-msg box-msg-error">${msg}</div>`;
  });
  warnings.forEach(msg => {
    msgsEl.innerHTML += `<div class="box-msg box-msg-warning">${msg}</div>`;
  });
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
  const zip = zipInput.value.trim();
  if (!/^\d{5}$/.test(zip) || !getZone(zip)) {
    calcBtn.disabled = true;
    return;
  }

  let allComplete     = true;
  let hasBlockingError = false;

  for (const id of boxGroups) {
    const data = getBoxData(id);
    if (!data) { allComplete = false; break; }
    const { l, w, h, weight } = data;

    if (isNaN(l) || l <= 0 || isNaN(w) || w <= 0 || isNaN(h) || h <= 0 ||
        isNaN(weight) || weight <= 0) {
      allComplete = false;
      break;
    }

    if (weight > 22.5) { hasBlockingError = true; }

    const dims = [l, w, h].sort((a, b) => b - a);
    if (dims[0] > 165 || dims[0] + 2 * (dims[1] + dims[2]) > 230) {
      hasBlockingError = true;
    }
  }

  calcBtn.disabled = !allComplete || hasBlockingError;
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

addBoxBtn.addEventListener('click', addBoxGroup);

// ===== 点击计算 =====

calcBtn.addEventListener('click', () => {
  const zip         = zipInput.value.trim();
  const productType = productSelect.value;
  const zone        = getZone(zip);
  const productCfg  = PRODUCT_CONFIG[productType];

  let totalBillable  = 0;
  let overweightBoxes = 0;
  let oversizeBoxes   = 0;

  for (const id of boxGroups) {
    const { l, w, h, weight, qty } = getBoxData(id);
    const volW          = (l * w * h) / 6000;
    const billablePerBox = Math.ceil(Math.max(weight, volW) * 10) / 10;
    totalBillable += billablePerBox * qty;

    if (weight > 22 && weight <= 22.5) overweightBoxes += qty;

    const dims    = [l, w, h].sort((a, b) => b - a);
    const longest = dims[0];
    const girth   = dims[0] + 2 * (dims[1] + dims[2]);
    if (longest > 120 && longest <= 165 && girth <= 230) oversizeBoxes += qty;
  }

  totalBillable = Math.round(totalBillable * 10) / 10;

  resultsDiv.innerHTML = '';
  resultsDiv.classList.add('show');

  if (totalBillable < 21) {
    resultsDiv.innerHTML = `
      <div class="error-msg">
        ⚠️ 总计费重 ${totalBillable} kg，不足 21 kg 起运量，无法走海派渠道。
      </div>`;
    return;
  }

  // 附加费计算
  const productSurcharge = Math.round(productCfg.perKg * totalBillable * 10) / 10;
  const overweightCharge = overweightBoxes * 150;
  const oversizeCharge   = oversizeBoxes * 150;
  const declarationFee   = 200;
  const totalSurcharge   = productSurcharge + overweightCharge + oversizeCharge + declarationFee;

  // 各渠道计算并排序
  const rows = FREIGHT_DATA.channels.map(ch => {
    const unitPrice = getPrice(ch, zone, totalBillable);
    const baseCost  = Math.round(totalBillable * unitPrice * 10) / 10;
    const total     = Math.round((baseCost + totalSurcharge) * 10) / 10;
    return { ch, unitPrice, baseCost, total };
  });
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
      <span class="fee-detail">${totalBillable} kg × ${best.unitPrice.toFixed(1)} 元/kg（${tierLabel} 档）</span>
      <span class="fee-amount">¥${best.baseCost.toFixed(1)}</span>
    </div>`;

  feeRows += `
    <div class="fee-row">
      <span class="fee-label">报关费</span>
      <span class="fee-detail">固定每票</span>
      <span class="fee-amount">¥${declarationFee}</span>
    </div>`;

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

  feeRows += `
    <div class="fee-row fee-total">
      <span class="fee-label">合　计</span>
      <span class="fee-detail"></span>
      <span class="fee-amount">¥${best.total.toFixed(1)}</span>
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
        <td data-label="总报价" class="total-price">¥${total.toFixed(1)}</td>
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
  `;

  document.getElementById('toggleAllBtn').addEventListener('click', function () {
    const tableDiv = document.getElementById('allChannelsTable');
    const isOpen   = tableDiv.style.display !== 'none';
    tableDiv.style.display = isOpen ? 'none' : 'block';
    this.textContent = isOpen
      ? `▼ 查看所有 ${rows.length} 个渠道对比`
      : `▲ 收起渠道对比`;
  });

  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ===== 初始化 =====
addBoxGroup();
checkFormComplete();
updateProductHint();
