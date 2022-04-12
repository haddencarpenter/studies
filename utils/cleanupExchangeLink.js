const cleanupExchangeLink = (link, baseSymbol) => {
  let cleanLink = link;

  try {
    const url = new URL(link)
    if (url.host.includes('binance')) {
      cleanLink = `${url.origin}${url.pathname}`
    } else if (url.host.includes('tokocrypto')) {
      cleanLink = link.replace(baseSymbol, `${baseSymbol}_`)
    }
  } catch(e) {}

  return cleanLink
}

export default cleanupExchangeLink;