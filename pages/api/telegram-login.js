import subMinutes from 'date-fns/subMinutes';
import crypto from 'crypto'

import prisma from '../../lib/prisma.mjs'

const TELEGRAM_BOT_PRIVAT_KEY = `
-----BEGIN RSA PRIVATE KEY-----
MIICWQIBAAKBgGz9Lejc1i0nIePsAvTRIUlKAko+voWdDOymN0V18Q0ofTslNljV
ZHo92RegaDaEo2zFqkIrvFrPqY+b+foZUsu/c12Zx2SLi1ZD+ITSgF/bTmBgiyyX
xfND7UGIJZ6VW0K6T/k35DwIbkMLdKgzohjdbXwNuYsN6FEXHcIdBrA9AgMBAAEC
f3Lyk3kFcN4uZ4/7WyLZbkHdzIyBoG9LNFZi9+hKe/Fkwq+ej7MhXNeQY2aHx2G4
gqQ11Vv0xLMCUdMkroEYNDlO/1vdQr4HGVu2NStfBJUwEkLzQS69SWW/N+CayUvc
2TCadHwWkW5RRnqX7mnfy5bmwpYYw3Ka/qncXD8W98kCQQCuuUdXhCpy11hgl/7e
Jsc+6uyiIfWPqiPjWWY46HT6zfrUma7tWFIyK6RosCO1a8DYvTWWQC1vTd+2XgAj
U9KfAkEAn6/4/04HkjdrGsf77JZSQL7/GeRZK7F820DGnkEMiz6I5CcJTVdF6nMr
Fg2ErWvy2qN8pZoI4nNQVGaHti1LowJBAIT5Qz9qubefBoa1BuZhUuAigKc/+xg0
X43GWxLSbzz1iIFG2SePQTcnmb+G1hZbhHAvR9oqy6la9fhf//Di+XcCQGtgRKpH
qcekBB0KBFhd7AklZRvf9CXxPuefcu7PBsRK1Hm11gdve8/eiUZW6LRENhTWgeZI
4ViD+awHFZJmeskCQANtI3ZUmS3tSB3IMAloxt4wQdefMTM9tlK6Er5xzWI2swtx
9c7ZeAQ1Rr1IDwQBTuO9sERAyO5dReMLt5fOWEI=
-----END RSA PRIVATE KEY-----
`

const handler = async (req, res) => {
  if (req.method !== 'GET' || !req.query.signature) {
    res.status(400).send("Bad request")
    return
  }
  const signature = req.query.signature
  const decryptedDataFromRsa = crypto.privateDecrypt(Buffer.from(TELEGRAM_BOT_PRIVAT_KEY, 'base64'), Buffer.from(signature, 'base64'))
  const decryptedData = decryptedDataFromRsa.toString('utf8')
  console.log(decryptedData)
  const [walletAddress, telegramId, telegramUserName, dateTime] = decryptedData.split(';')
  // TODO: There is a datetime in here as well. Make sure it's not too old (more than 10 minutes ago)
  if (new Date(dateTime).getTime() < subMinutes(new Date(), 10).getTime()) {
    res.status(400).send("Bad request")
    return
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      walletAddress
    }
  })
  if (existingUser) {
    if (existingUser.telegramId === telegramId) {
      // TODO: Set the cookies and redirect to the dashboard
      res.status(200).json({ ok: true })
      return
    } else {
      res.status(403).json({ ok: false })
      return
    }
  } else {
    const newUser = await prisma.user.create({
      data: {
        walletAddress,
        telegramId,
        telegramUserName
      }
    })
    // TODO: Set the cookies and redirect to the dashboard
    res.status(200).json({ ok: true })
    return
  }

  // TODO: Attempt to create a user in the db when walletconnect, unless a user exists already
  // Do some kind of login api for that
}

export default handler