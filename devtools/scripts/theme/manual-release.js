const FormData = require("form-data");
const fs = require("fs");
const got = require("got");
const chalk = require("chalk");
const { Octokit } = require("@octokit/rest");
const getPackageInfo = require("../../lib/get-package-info");
require('dotenv').config()

const R2_BUCKET_NAME = 'alps';

const manualRelease = async (opts) => {
  let env = process.env ;
  const { logger } = opts;

  const pkg = await getPackageInfo();

  const buildDir = 'build/';
  const localFileName = `${pkg.name}.zip`;
  const distFileName = `alps-wordpress-v${pkg.version}.zip`;
  const metadataFileName = `alps-wordpress-v3.json`;

  const formDataZip = new FormData();
  formDataZip.append('bucket', R2_BUCKET_NAME);
  formDataZip.append('path', `/wordpress/themes/alps/alps-wordpress-v${pkg.version}.zip`);
  formDataZip.append('data', fs.createReadStream(`${buildDir}${localFileName}`));

  await got('https://alps-r2.adventist.workers.dev/upload', {
    method: 'POST',
    body: formDataZip,
    headers: {
      'Authorization': `Bearer ${env.CLOUDFLARE_R2_ACCESS_TOKEN}`
    }
  })
  logger.info(`🔼 ${chalk.yellow(distFileName)} pushed to R2.`);

  const formDataJson = new FormData();
  formDataJson.append('bucket', R2_BUCKET_NAME);
  formDataJson.append('path', '/wordpress/themes/alps/' + metadataFileName);
  formDataJson.append('data', fs.createReadStream(`${buildDir}${metadataFileName}`));

  await got('https://alps-r2.adventist.workers.dev/upload', {
    method: 'POST',
    body: formDataJson,
    headers: {
      'Authorization': `Bearer ${env.CLOUDFLARE_R2_ACCESS_TOKEN}`
    }
  })
  logger.info(`🔼 ${chalk.yellow(metadataFileName)} pushed to R2.`);

  logger.info('Updating latest release...')

  const githubToken = env.GITHUB_TOKEN || null;
  const githubRef = env.GITHUB_REF || null;
  const [githubOwner, githubRepo] = env.GITHUB_REPOSITORY.split('/');

  const octokit = new Octokit({
    auth: githubToken,
  });

  // Extract git tag
  const match = githubRef.match(/^refs\/tags\/(?<tag>v\d+\.\d+\.\d+\.\d+)$/);
  if (!match) {
    throw new Error(`Invalid tag name for release: "${githubRef.replace('refs/tags/', '')}"`);
  }
  const tag = match.groups.tag;

  try {
    const existingRelease = await octokit.repos.getReleaseByTag({
      owner: githubOwner,
      repo: githubRepo,
      tag,
    });

    await octokit.repos.updateRelease({
      owner: githubOwner,
      repo: githubRepo,
      release_id: existingRelease.data.id,
      draft: false
    });
  } catch (e) {}

  logger.info(`🍀 Release ${chalk.green(tag)} published on GitHub`);
}

module.exports = manualRelease;
