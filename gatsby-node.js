/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require(`path`);

exports.onCreateWebpackConfig = ({ getConfig, stage }) => {
  const config = getConfig();
  if (stage.startsWith('develop') && config.resolve) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-dom': '@hot-loader/react-dom',
    };
  }
};

exports.createPages = async ({ graphql, actions }) => {
  // **Note:** The graphql function call returns a Promise
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise for more info
  const { createPage } = actions;
  const result = await graphql(`
    query {
      craft {
        entries(site: "*") {
          ... on CraftGraphQL_glossary_glossary_Entry {
            id
            color
            siteId
            slug
          }
        }
      }
      craftql {
        sites {
          id
          language
          primary
          name
        }
      }
    }
  `);

  const sites = {};
  result.data.craftql.sites.forEach(site => {
    sites[site.id] = site;
  });

  result.data.craft.entries.forEach(entry => {
    const { id, siteId } = entry;
    const { primary, language } = sites[siteId];
    const langBase = primary ? '/' : `/${language}/`;
    createPage({
      path: `${langBase}glossary/${entry.slug}`,
      component: path.resolve(`./src/containers/GlossaryItemContainer.jsx`),
      context: {
        id: +id,
        site: '' + siteId,
        language,
      },
    });
  });
};
