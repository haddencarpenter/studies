import prisma from '../../lib/prisma'

export default function Coin(params) {
  return <>{params.name}</>
}

export async function getStaticPaths() {
  const coinsData = await prisma.coin.findMany({
    orderBy: { marketCapRank: 'asc' },
    take: 1000,
    select: { id: true }
  })

  return {
    paths: coinsData.map(coin => ({ params: { ...coin }}) ),
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const coinData = await prisma.coin.findUnique({
    where: {
      id: params.id,
    }
  })
  return {
    props: {
      ...coinData,
      currentPriceUsd: Number(coinData.currentPriceUsd),
      ath: Number(coinData.ath),
      atl: Number(coinData.atl),
      fullyDilutedValuation: Number(coinData.fullyDilutedValuation),
      circulatingSupply: Number(coinData.circulatingSupply),
    }
  }
}