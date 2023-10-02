import prisma from '../../lib/prisma.mjs'
import requestIp from 'request-ip'

const handler = async (req, res) => {
  if (req.body.salt !== '0xdeadbeef') {
    res.status(401).send("Unauthorized")
  } else if (req.method !== 'POST') {
    res.status(400).send("Bad request")
  } else {
    const ip = requestIp.getClientIp(req);

    const address = await prisma.WhiteListAddress.findFirst({
      where: {
        ip: ip
      }
    })

    if (address) {
      res.status(401).send("Unauthorized")
      return
    } else {
      await prisma.WhiteListAddress.create({
        data: {
          walletAddress: req.body.address,
          ip: ip
        }
      })
      res.status(200).json({})
    }
  }
}

export default handler