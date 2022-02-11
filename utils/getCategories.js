import csv from 'csvtojson'

export default async function getCategories() {
  let categories = await csv().fromFile('lib/DropsTabCategories.csv');
  const mappedCategories = {}
  categories.map((category) => {
    (mappedCategories[category.Asset_Symbol.toLowerCase()] ||= []).push(category.Asset_Category)
  })
  return mappedCategories;
}