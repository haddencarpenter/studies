import isEmpty from 'lodash/isEmpty'

import prisma from '../../lib/prisma'

const handler = async (req, res) => {
  let requestedCoins = req.query['coins[]']
  if (isEmpty(requestedCoins)) {
    requestedCoins = ['thisisneverevereverevergonnabeavalidcoinid']
  }
  if (req.method !== 'GET' || !requestedCoins instanceof Array) {
    res.status(400)
  } else {
    const coins = await prisma.coin.findMany({
      where: {
        id: {
          in: requestedCoins
        }
      },
      select: {
        id: true,
        name: true,
        images: true,
        symbol: true
      }
    })
    res.status(200).json({ coins })
  }
}

export default handler