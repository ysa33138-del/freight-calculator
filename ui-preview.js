const previewChannels = [
  {
    id: 'exx',
    name: '快船 EXX 海派',
    unitPrice: 15.7,
    billingWeight: 21,
    baseFreight: 329.7,
    customsFee: 350,
    remoteSurcharge: 42,
    total: 709.7,
    usd: 102.9,
    time: '派送 1-2 天',
    note: '开船后16天内提取，超时赔1元/KG。',
  },
  {
    id: 'max',
    name: '美森 MAX',
    unitPrice: 16.7,
    billingWeight: 21,
    baseFreight: 350.7,
    customsFee: 350,
    remoteSurcharge: 42,
    total: 730.7,
    usd: 105.9,
    time: '派送 1-2 天',
    note: '时效稳定，适合常规 FBA 补货。',
  },
  {
    id: 'matson',
    name: '美森正班',
    unitPrice: 16.9,
    billingWeight: 21,
    baseFreight: 354.9,
    customsFee: 350,
    remoteSurcharge: 42,
    total: 734.9,
    usd: 106.5,
    time: '派送 1-2 天',
    note: '开船后15天内提取，适合时效敏感货物。',
  },
  {
    id: 'yiwu',
    name: '义乌合德以星限时达',
    unitPrice: 14.5,
    billingWeight: 21,
    baseFreight: 304.5,
    customsFee: 350,
    remoteSurcharge: 42,
    total: 684.5,
    usd: 99.2,
    time: '派送 1-2 天',
    note: '含电池需提供 MSDS 及 UN38.3 测试报告。',
  },
];

const lowestChannel = previewChannels.reduce((lowest, channel) => (
  channel.total < lowest.total ? channel : lowest
), previewChannels[0]);

const sortedChannels = [...previewChannels].sort((a, b) => a.total - b.total);

function money(value) {
  return `¥${value.toFixed(1)}`;
}

function setQuoteField(name, value) {
  const element = document.querySelector(`[data-quote-field="${name}"]`);
  if (element) element.innerHTML = value;
}

function renderSelectedQuote(channel) {
  const minimumNote = '<br><span style="opacity:.65;font-size:.85em;">实际计费重 15.3 kg，不足最低起运 21 kg，按 21 kg 计费</span>';

  setQuoteField('name', channel.name);
  setQuoteField('roleLabel', channel.id === lowestChannel.id ? '最低价渠道' : '当前查看渠道');
  setQuoteField('time', channel.time);
  setQuoteField('total', money(channel.total));
  setQuoteField('usd', `≈ $${channel.usd.toFixed(1)}`);
  setQuoteField('baseDetail', `${channel.billingWeight} kg × ${channel.unitPrice.toFixed(1)} 元/kg（21KG+ 档）${minimumNote}`);
  setQuoteField('baseFreight', money(channel.baseFreight));
  setQuoteField('customsFee', `¥${channel.customsFee}`);
  setQuoteField('remoteSurcharge', money(channel.remoteSurcharge));
  setQuoteField('note', channel.note);
  setQuoteField('feeTotal', `${money(channel.total)}（≈ $${channel.usd.toFixed(1)}）`);
}

function syncRowStates(selectedId) {
  document.querySelectorAll('[data-channel-id]').forEach((row) => {
    const channel = previewChannels.find(item => item.id === row.dataset.channelId);
    const nameEl = row.querySelector('.channel-name');

    row.classList.toggle('selected', row.dataset.channelId === selectedId);
    row.classList.toggle('cheapest', row.dataset.channelId === lowestChannel.id);
    row.setAttribute('aria-selected', String(row.dataset.channelId === selectedId));

    if (!channel || !nameEl) return;
    nameEl.innerHTML = channel.name;

    if (channel.id === lowestChannel.id) {
      nameEl.insertAdjacentHTML('beforeend', ' <span class="cheapest-badge">最低价</span>');
    }

    if (channel.id === selectedId) {
      nameEl.insertAdjacentHTML('beforeend', ' <span class="selected-badge">查看中</span>');
    }
  });
}

function sortComparisonRows() {
  const tbody = document.querySelector('#allChannelsTable tbody');
  if (!tbody) return;

  sortedChannels.forEach((channel) => {
    const row = tbody.querySelector(`[data-channel-id="${channel.id}"]`);
    if (row) tbody.appendChild(row);
  });
}

function selectChannel(channelId) {
  const channel = previewChannels.find(item => item.id === channelId) || lowestChannel;
  renderSelectedQuote(channel);
  syncRowStates(channel.id);
}

const comparisonSection = document.getElementById('comparisonSection');
const comparisonToggle = document.getElementById('toggleAllBtn');
const comparisonTable = document.getElementById('allChannelsTable');

function setComparisonCollapsed(collapsed, animate = true) {
  if (!comparisonSection || !comparisonToggle || !comparisonTable) return;

  comparisonSection.classList.toggle('is-collapsed', collapsed);
  comparisonSection.classList.toggle('is-expanded', !collapsed);
  comparisonToggle.setAttribute('aria-expanded', String(!collapsed));
  comparisonTable.setAttribute('aria-hidden', String(collapsed));
  comparisonToggle.textContent = collapsed
    ? '▼ 渠道对比（点击展开查看所有渠道）'
    : '▲ 渠道对比（点击任一渠道行查看详情）';

  if (!animate) {
    comparisonTable.style.transition = 'none';
  }

  if (collapsed) {
    comparisonTable.style.maxHeight = `${comparisonTable.scrollHeight}px`;
    requestAnimationFrame(() => {
      comparisonTable.style.maxHeight = '0px';
      if (!animate) requestAnimationFrame(() => { comparisonTable.style.transition = ''; });
    });
  } else {
    comparisonTable.style.maxHeight = `${comparisonTable.scrollHeight}px`;
    if (!animate) requestAnimationFrame(() => { comparisonTable.style.transition = ''; });
  }
}

comparisonToggle?.addEventListener('click', () => {
  setComparisonCollapsed(!comparisonSection.classList.contains('is-collapsed'));
});

document.querySelectorAll('[data-channel-id]').forEach((row) => {
  row.addEventListener('click', () => selectChannel(row.dataset.channelId));
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectChannel(row.dataset.channelId);
    }
  });
});

sortComparisonRows();
selectChannel(lowestChannel.id);
setComparisonCollapsed(window.matchMedia('(max-width: 760px)').matches, false);
