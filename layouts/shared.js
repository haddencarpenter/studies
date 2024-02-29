import Script from 'next/script'
import Head from 'next/head'
import mixpanel from 'mixpanel-browser';

export default function SharedLayout({ pageProps }) {
  const googleAnalytics = process.env.NODE_ENV === 'production' ? (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
      <Script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `,
        }}
      />
    </>
  ) : <></>
  const mixPanel = process.env.NODE_ENV === 'production' ? (
    <Script id="mixpanel">
      {`
          mixpanel.init("743aa6797630eaf251e029aaed46382f", { debug: true, track_pageview: true, persistence: 'localStorage' });
      `}
    </Script>
  ) : <></>
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="canonical" href={pageProps.currentUrl} />
      </Head>
      {googleAnalytics}
      {mixPanel}
    </>
  )
}