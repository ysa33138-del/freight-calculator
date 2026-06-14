// 创展国际 欧美专线海派价格数据
// 数据来源：创展国际-欧美专线价格表6.11.xlsx（美国海派 sheet）
// 价格单位：人民币元/KG
// 价格结构：prices.shenzhen（深圳/广州交货）/ prices.yiwu（义乌交货）
// noYiwu: true 表示该渠道不支持义乌交货
// 更新日期：2026-06-11

const FREIGHT_DATA = {
  // 分区规则：美国邮编首位
  zoneRules: {
    west:    ['8', '9'],
    central: ['4', '5', '6', '7'],
    east:    ['0', '1', '2', '3']
  },

  channels: [
    {
      id: 'maersk_regular',
      name: '美森正班',
      fullName: '美森正班海派',
      remark: '开船后15天内提取，超时赔1元/KG',
      delivery: { west: '1-2天', central: '3-4天', east: '4-5天' },
      prices: {
        shenzhen: {
          west:    { 21: 17.1, 51: 15.1, 100: 14.1 },
          central: { 21: 18.8, 51: 16.8, 100: 15.8 },
          east:    { 21: 19.8, 51: 17.8, 100: 16.8 }
        },
        yiwu: {
          west:    { 21: 16.7, 51: 14.7, 100: 13.7 },
          central: { 21: 18.4, 51: 16.4, 100: 15.4 },
          east:    { 21: 19.4, 51: 17.4, 100: 16.4 }
        }
      }
    },
    {
      id: 'maersk_max',
      name: '美森MAX',
      fullName: '美森MAX海派',
      remark: '开船后16天内提取，超时赔1元/KG',
      delivery: { west: '1-2天', central: '3-4天', east: '4-5天' },
      prices: {
        shenzhen: {
          west:    { 21: 16.6, 51: 14.6, 100: 13.6 },
          central: { 21: 18.3, 51: 16.3, 100: 15.3 },
          east:    { 21: 19.3, 51: 17.3, 100: 16.3 }
        },
        yiwu: {
          west:    { 21: 16.2, 51: 14.2, 100: 13.2 },
          central: { 21: 17.9, 51: 15.9, 100: 14.9 },
          east:    { 21: 18.9, 51: 16.9, 100: 15.9 }
        }
      }
    },
    {
      id: 'exx_express',
      name: '快船EXX',
      fullName: '快船EXX海派',
      remark: '开船后16天内提取，超时赔1元/KG',
      delivery: { west: '1-2天', central: '3-4天', east: '4-5天' },
      prices: {
        shenzhen: {
          west:    { 21: 16.1, 51: 14.1, 100: 13.1 },
          central: { 21: 17.6, 51: 15.6, 100: 14.6 },
          east:    { 21: 18.6, 51: 16.6, 100: 15.6 }
        },
        yiwu: {
          west:    { 21: 15.7, 51: 13.7, 100: 12.7 },
          central: { 21: 17.2, 51: 15.2, 100: 14.2 },
          east:    { 21: 18.2, 51: 16.2, 100: 15.2 }
        }
      }
    },
    {
      id: 'yantian_star',
      name: '盐田以星合德限时达',
      fullName: '盐田以星南沙合德限时达海派',
      remark: '开船后18天内提取，超时赔0.5元/KG',
      delivery: { west: '1-2天', central: '3-4天', east: '4-5天' },
      noYiwu: true,
      prices: {
        shenzhen: {
          west:    { 21: 14.2, 51: 12.2, 100: 11.2 },
          central: { 21: 15.9, 51: 13.9, 100: 12.9 },
          east:    { 21: 16.9, 51: 14.9, 100: 13.9 }
        }
      }
    },
    {
      id: 'yiwu_star',
      name: '义乌合德以星限时达',
      fullName: '义乌合德以星限时达海派',
      remark: '开船后18天内提取，超时赔0.5元/KG',
      delivery: { west: '1-2天', central: '3-4天', east: '4-5天' },
      prices: {
        shenzhen: {
          west:    { 21: 14.8, 51: 12.8, 100: 11.8 },
          central: { 21: 16.5, 51: 14.5, 100: 13.5 },
          east:    { 21: 17.5, 51: 15.5, 100: 14.5 }
        },
        yiwu: {
          west:    { 21: 14.5, 51: 12.5, 100: 11.5 },
          central: { 21: 16.2, 51: 14.2, 100: 13.2 },
          east:    { 21: 17.2, 51: 15.2, 100: 14.2 }
        }
      }
    },
    {
      id: 'la_regular',
      name: '普船洛杉矶',
      fullName: '普船洛杉矶海派',
      remark: '开船后约20-25天提取',
      delivery: { west: '1-2天', central: '3-4天', east: '4-5天' },
      prices: {
        shenzhen: {
          west:    { 21: 13.7, 51: 11.7, 100: 10.7 },
          central: { 21: 15.2, 51: 13.2, 100: 12.2 },
          east:    { 21: 16.2, 51: 14.2, 100: 13.2 }
        },
        yiwu: {
          west:    { 21: 13.7, 51: 11.7, 100: 10.7 },
          central: { 21: 15.2, 51: 13.2, 100: 12.2 },
          east:    { 21: 16.2, 51: 14.2, 100: 13.2 }
        }
      }
    }
  ]
};

// 欧洲海运数据（包税 taxed / 不包税 untaxed）
// 数据来源：创展国际-欧美专线价格表6.3.xlsx（欧洲海运 sheet）
// 价格单位：人民币元/KG
const EU_DATA = {
  volumetricDivisor: 6000,

  uk: {
    label: '英国',
    minWeight: 26,
    transit: '请与货代确认（英国海运时效）',
    minPerPiece: 13,
    tiers: [26, 100],
    channels: [
      { id: 'uk_dpd', name: '英国DPD（普通货）',
        prices: { taxed: { 26: 15.1, 100: 11.7 }, untaxed: { 26: 9.4, 100: 7.4 } } },
      { id: 'uk_battery', name: '英国电池专线（含电池）',
        prices: { taxed: { 26: 16.4, 100: 13.2 }, untaxed: { 26: 12.4, 100: 9.7 } } }
    ]
  },

  eu: {
    label: '欧洲大陆',
    minWeight: 25,
    transit: '开船约30-38天提取（不含塞港/海关查验/亚马逊排仓）',
    minPerPiece: 13,
    tiers: [15, 50, 100],
    countries: [
      { id: 'de', name: '德国',
        prices: { taxed: { 15: 10.6, 50: 9.6, 100: 8.6 }, untaxed: { 15: 9.6, 50: 8.6, 100: 7.6 } } },
      { id: 'nl_cz_pl', name: '荷兰 / 捷克 / 波兰',
        prices: { taxed: { 15: 13.9, 50: 12.9, 100: 11.9 }, untaxed: { 15: 12.9, 50: 11.9, 100: 10.9 } } },
      { id: 'lu_be_sk_hu_fr', name: '卢森堡 / 比利时 / 斯洛伐克 / 匈牙利 / 法国',
        prices: { taxed: { 15: 13.9, 50: 12.9, 100: 11.9 }, untaxed: { 15: 12.9, 50: 11.9, 100: 10.9 } } },
      { id: 'lt_at_dk_hr_es_it', name: '立陶宛 / 奥地利 / 丹麦 / 克罗地亚 / 西班牙 / 意大利',
        prices: { taxed: { 15: 15.7, 50: 14.7, 100: 13.7 }, untaxed: { 15: 14.7, 50: 13.7, 100: 12.7 } } },
      { id: 'pt_se_ee', name: '葡萄牙 / 瑞典 / 爱沙尼亚',
        prices: { taxed: { 15: 16.2, 50: 15.2, 100: 14.2 }, untaxed: { 15: 15.2, 50: 14.2, 100: 13.2 } } },
      { id: 'ro_bg_ie_fi_gr_si_lv', name: '罗马尼亚 / 保加利亚 / 爱尔兰 / 芬兰 / 希腊 / 斯洛文尼亚 / 拉脱维亚',
        prices: { taxed: { 15: 18.7, 50: 17.7, 100: 16.7 }, untaxed: { 15: 17.7, 50: 16.7, 100: 15.7 } } }
    ]
  },

  notes: {
    uk: '清关费 300元/票；纺织品按税率加收（税率12%→+2.5元/kg；7%以上→+1.5元/kg；7%以下→+1元/kg）；塑料/玻璃制品 +1元/kg；私人地址(非FBA) 80元/票；偏远地址请自行查询。',
    eu: '清关费（包税线随附，不含税400元/票）；单独报关 350元/票（续页 +50元/页）；非亚马逊地址(海外仓/商业/私人) +100元/票；私人地址 +0.5元/kg(最低80元/票)；单票限5个品名，超出 +30元/个；偏远/岛屿单询；超重超长另计。'
  },

  surcharges: {
    uk: [
      { id: 'uk_customs',    label: '清关费',            type: 'fixed',   value: 300 },
      { id: 'uk_residential',label: '私人地址（非FBA）', type: 'fixed',   value: 80  },
      { id: 'uk_textile',    label: '纺织品加收',         type: 'textile'              },
      { id: 'uk_plastic',    label: '塑料/玻璃制品',      type: 'perkg',   value: 1   },
      { id: 'uk_redeliver',  label: '二次派送（派送失败）',type: 'perbox',  value: 100 },
      { id: 'uk_return_op',  label: '退回/重发操作费',    type: 'fixed',   value: 400 },
      { id: 'uk_returnfee',  label: '退件费',             type: 'fixed',   value: 100 },
      { id: 'uk_single',     label: '单票一件加收',        type: 'fixed',   value: 100 }
    ],
    eu: [
      { id: 'eu_customs',    label: '清关费（不含税线）', type: 'fixed',   value: 400 },
      { id: 'eu_declare',    label: '单独报关',           type: 'declare'              },
      { id: 'eu_nonamazon',  label: '非亚马逊地址（海外仓/商业/私人）', type: 'fixed', value: 100 },
      { id: 'eu_residential',label: '私人地址',           type: 'residential'          },
      { id: 'eu_extrasku',   label: '品名超5项',          type: 'extrasku'             },
      { id: 'eu_redeliver',  label: '二次派送（派送失败）',type: 'perbox',  value: 100 },
      { id: 'eu_return_op',  label: '退回/重发操作费',    type: 'fixed',   value: 400 },
      { id: 'eu_returnfee',  label: '退件费',             type: 'fixed',   value: 100 },
      { id: 'eu_single',     label: '单票一件加收',        type: 'fixed',   value: 100 }
    ]
  }
};
