import Head from 'next/head'
import { Layout } from 'antd'

import SharedLayout from "../layouts/shared"
import baseStyles from "../styles/base.module.less"

export default function PageLayout(page, pageProps) {
  return (
    <Layout className={baseStyles.innerLayout}>
      <Head>
        <title key="title">{pageProps.title}</title>
        <meta name="description" key="description" content={pageProps.metaDescription} />
        <meta key="noindex" name="robots" content="noindex"/>
        <meta key="nofollow" name="robots" content="nofollow"/>
      </Head>
      <SharedLayout pageProps={pageProps} />
      {page}
    </Layout>
  )
}