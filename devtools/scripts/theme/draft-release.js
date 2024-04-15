const fs = require('fs');
const chalk = require('chalk');
const { Octokit } = require("@octokit/rest");
const getChangelog = require('../../lib/get-changelog');
const getPackageInfo = require('../../lib/get-package-info');
require('dotenv').config()

const pluginRelease = async (opts) => {
    let env = process.env ;
    const { logger } = opts;

    const githubToken = env.GITHUB_TOKEN || null;
    const [githubOwner, githubRepo] = env.GITHUB_REPOSITORY.split('/');
    const githubRef = env.GITHUB_REF || null;

    const pkg = await getPackageInfo();

    const buildDir = 'build/';
    const localFileName = `${pkg.name}.zip`;
    const distFileName = `alps-wordpress-v${pkg.version}.zip`;

    // Extract git tag
    const match = githubRef.match(/^refs\/tags\/(?<tag>v\d+\.\d+\.\d+\.\d+)$/);
    if (!match) {
        throw new Error(`Invalid tag name for release: "${githubRef.replace('refs/tags/', '')}"`);
    }
    const tag = match.groups.tag;

    // Compose release description
    const changelog = await getChangelog();
    const currentVersion = changelog[0];
    const releaseDesc = [currentVersion.desc];
    for (const changeType of currentVersion.types) {
        releaseDesc.push(`## ${changeType.title}`);
        for (const changeTypeEntry of changeType.entries) {
            releaseDesc.push(`- ${changeTypeEntry}`);
        }
    }
    console.log("Check Tag: " + tag);

    // Create Release on GitHub
    const octokit = new Octokit({
        auth: githubToken,
    });

    try {
        const existingRelease = await octokit.repos.getReleaseByTag({
            owner: githubOwner,
            repo: githubRepo,
            tag,
        });
        await octokit.repos.deleteRelease({
            owner: githubOwner,
            repo: githubRepo,
            release_id: existingRelease.data.id,
        });
    } catch (e) {}

    const createReleaseResponse = await octokit.repos.createRelease({
        owner: githubOwner,
        repo: githubRepo,
        tag_name: tag,
        name: tag,
        draft: true,
        body: releaseDesc.join("\n"),
    });

    console.log("Checks before release!")

    await octokit.repos.uploadReleaseAsset({
        url: createReleaseResponse.data.upload_url,
        name: distFileName,
        data: await fs.promises.readFile(`${buildDir}${localFileName}`),
    });
    logger.info(`🍀 Release ${chalk.green(tag)} published on GitHub`);
};

module.exports = pluginRelease;
