import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create event
  const event = await prisma.event.create({
    data: {
      name: '114年度師資班分組報告票選',
      description: '請選出您心目中的三位最佳報告者',
      isActive: true,
      maxVotes: 3,
    },
  })

  // A組─郭亮增主任、吳易澄主任 (國際會議廳)
  await prisma.group.create({
    data: {
      eventId: event.id,
      name: 'A組',
      candidates: {
        create: [
          { name: '丁楹', description: '臺北市立聯合醫院和平院區 胸腔內科 專科護理師' },
          { name: '王承恩', description: '三軍總醫院 神經科部 住院醫師' },
          { name: '周乃欣', description: '三軍總醫院 臨床藥學部 藥師' },
          { name: '林昀芊', description: '花蓮慈濟醫院 重症加護內科 專科護理師' },
          { name: '施品如', description: '衛生福利部雙和醫院 210精神科急性病房 副護理長' },
          { name: '范程羿', description: '國立臺灣大學醫學院附設醫院新竹臺大分院 急診醫學部 主治醫師' },
          { name: '曾微娟', description: '大林慈濟醫院 護理部內科組 專科護理師' },
          { name: '楊文吾', description: '國防醫學大學 醫學系 實習醫學生' },
          { name: '管珮如', description: '新竹市立馬偕兒童醫院 6A病房 護理長' },
          { name: '謝珮琦', description: '三軍總醫院 神經內科急性病房 護理長' },
          { name: '鍾佩婷', description: '高雄醫學大學附設醫院 負壓隔離病房 護理師' },
        ],
      },
    },
  })

  // B組─邵時傑助理教授、劉俞旻主任 (陽光會議室)
  await prisma.group.create({
    data: {
      eventId: event.id,
      name: 'B組',
      candidates: {
        create: [
          { name: '古念庭', description: '衛生福利部雙和醫院 精神科 職能治療師' },
          { name: '朱羽群', description: '花蓮慈濟醫院 醫務部 PGY' },
          { name: '林新中', description: '三軍總醫院 臨床藥學部 上尉藥劑學官' },
          { name: '胡雅嵐', description: '桃園長庚紀念醫院 美容醫學中心手術室 護理師' },
          { name: '翁沛緹', description: '國防醫學大學 醫學系 學生' },
          { name: '陳昀', description: '臺北市立聯合醫院忠孝院區 藥劑科 藥師' },
          { name: '游佩珊', description: '三軍總醫院 護理部 副護理長' },
          { name: '黃意忠', description: '仁慈醫院 心臟內科 主治醫師' },
          { name: '劉秀珠', description: '高雄市立凱旋醫院 臨床試驗中心/護理科 護理師' },
          { name: '戴佳惠', description: '大林慈濟醫院 護理部 督導' },
          { name: '謝惠琪', description: '新竹馬偕紀念醫院 七樓病房 護理長' },
          { name: '魏睿平', description: '三軍總醫院 一般醫學科 不分科住院醫師' },
        ],
      },
    },
  })

  // C組─翁紹恩主任、許晉譯醫師 (圖書館)
  await prisma.group.create({
    data: {
      eventId: event.id,
      name: 'C組',
      candidates: {
        create: [
          { name: '方怡今', description: '亞東紀念醫院 護理部12G病房 護理長' },
          { name: '周家欣', description: '基隆長庚紀念醫院 外科加護病房 專科護理師' },
          { name: '林育正', description: '三軍總醫院 教學部 實習醫學生' },
          { name: '金芳瑜', description: '門諾醫院 檢驗科 醫檢師' },
          { name: '唐知行', description: '新竹台大分院生醫醫院 影像醫學部 醫事放射師' },
          { name: '徐乃婷', description: '台東馬偕紀念醫院 藥劑科 藥師' },
          { name: '翁楷婷', description: '高雄醫學大學附設中和紀念醫院 護理部 中級護理師' },
          { name: '高肇亨', description: '三軍總醫院 急診部 醫師' },
          { name: '陳信豪', description: '新竹馬偕紀念醫院 家庭醫學科 主治醫師' },
          { name: '萬義康', description: '三軍總醫院 W20精神科急性病房 副護理長' },
          { name: '廖晨瑾', description: '' },
          { name: '潘婉琳', description: '國立臺北護理健康大學 護理系 副教授' },
        ],
      },
    },
  })

  // D組─李坤峰主任、蘇柔如組長 (圖書館電腦教室)
  await prisma.group.create({
    data: {
      eventId: event.id,
      name: 'D組',
      candidates: {
        create: [
          { name: '李玟萱', description: '高雄醫學大學附設中和紀念醫院 護理部 護理師' },
          { name: '林昭旭', description: '新竹馬偕紀念醫院 醫學教育科 主任' },
          { name: '郭子瑄', description: '林口長庚紀念醫院 藥劑科 藥師' },
          { name: '陳婷琬', description: '新竹馬偕紀念醫院 護理部 護理長' },
          { name: '廖翎均', description: '國立臺灣大學醫學院附設醫院新竹臺大分院 藥劑部 藥師' },
          { name: '劉芳辰', description: '三軍總醫院 胃腸肝膽科 主治醫師' },
          { name: '劉澄杰', description: '三軍總醫院 營養部 營養師' },
          { name: '蔡汶典', description: '大林慈濟醫院 圖書館學習資源組 組員' },
          { name: '黎昱暄', description: '三軍總醫院 外科/神經加護中心 護理師' },
          { name: '戴妙華', description: '花蓮慈濟醫院 麻醉科 專科護理師' },
          { name: '羅翊賓', description: '中國醫藥大學附設醫院 內科部心臟血管系 主治醫師' },
          { name: '蘇俐婷', description: '基隆長庚紀念醫院 護理部 護理師' },
        ],
      },
    },
  })

  console.log('Seed data created!')
  console.log('Event ID:', event.id)
  console.log('A組: 11人, B組: 12人, C組: 12人, D組: 12人')
  console.log('直接前往首頁選擇身份投票')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
