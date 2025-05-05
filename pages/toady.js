import Head from 'next/head';
import { gql } from '@urql/core';
import globalData from '../lib/globalData'
import ToadyComponent from '../components/Toady';
import strapi from '../utils/strapi';

export async function getStaticProps() {
  const appData = await globalData()

  let pageQuery = null;
  try {
    pageQuery = await strapi.query(
      gql`
        query Pages($slug: String) {
          pages(filters: {slug: {eq: $slug}}) {
            data {
              attributes {
                title
                metaTitle
                metaDescription
              }
            }
          }
        }
      `,
      {
        slug: 'toady',
      }
    );
  } catch (error) {
    console.error("Error fetching page data from Strapi:", error);
    // Handle error appropriately, maybe return default pageData
  }

  const pageData = pageQuery?.data?.pages?.data[0]?.attributes || {};

  return {
    props: {
      appData,
      pageData,
    },
  }
}

const ToadyPage = ({ pageData }) => {
  return (
    <>
      <Head>
        <title key="title">{pageData?.metaTitle}</title>
        <meta name="description" key="description" content={pageData?.metaDescription} />
      </Head>
      <ToadyComponent isActive={true} />
    </>
  );
};

export default ToadyPage;