import prisma from './prisma'

const globalData = async () => {
  const topCoins = await prisma.coin.findMany({
    orderBy: { marketCapRank: 'asc' },
    take: 5,
    select: {
      id: true,
      name: true
    }
  })
  const topCategories = [
    'DeFi',
    'NFT',
    'Metaverse',
    'Meme',
    'DAO'
  ]

  return {
    topCoins,
    topCategories
  }
};

export default globalData;