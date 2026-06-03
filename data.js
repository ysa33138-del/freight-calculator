// 创展国际 欧美专线海派价格数据
// 数据来源：创展国际-欧美专线价格表6.3.xlsx（美国海派 sheet）
// 价格单位：人民币元/KG
// 价格结构：prices.shenzhen（深圳/广州交货）/ prices.yiwu（义乌交货）
// noYiwu: true 表示该渠道不支持义乌交货
// 更新日期：2026-06-03

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
          west:    { 21: 17.3, 51: 15.3, 100: 14.3 },
          central: { 21: 19.0, 51: 17.0, 100: 16.0 },
          east:    { 21: 20.0, 51: 18.0, 100: 17.0 }
        },
        yiwu: {
          west:    { 21: 16.9, 51: 14.9, 100: 13.9 },
          central: { 21: 18.6, 51: 16.6, 100: 15.6 },
          east:    { 21: 19.6, 51: 17.6, 100: 16.6 }
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
          west:    { 21: 14.5, 51: 12.5, 100: 11.5 },
          central: { 21: 16.2, 51: 14.2, 100: 13.2 },
          east:    { 21: 17.2, 51: 15.2, 100: 14.2 }
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
