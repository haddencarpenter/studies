const cleanupExchangeLink = (link) => {
  let cleanLink = link;

  try {
    const url = new URL(link)
    if (url.host.includes('binance')) {
      cleanLink = `${url.origin}${url.pathname}`
    }
  } catch(e) {}

  return cleanLink
}

export default cleanupExchangeLink;