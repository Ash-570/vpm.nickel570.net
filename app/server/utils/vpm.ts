import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function getVpmData(hostHeader: string) {
    const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '../data');
    const PACKAGES_DIR = path.join(DATA_DIR, 'packages');
    const REPO_INFO_PATH = path.join(DATA_DIR, 'repo_info.json');

    let repoInfo: any = {};
    if (fs.existsSync(REPO_INFO_PATH)) {
        repoInfo = JSON.parse(fs.readFileSync(REPO_INFO_PATH, 'utf8'));
    }

    const index = {
        name: repoInfo.name || "My VPM Repo",
        author: repoInfo.author || "Author",
        id: repoInfo.id || "com.example.repo",
        url: repoInfo.url || `https://${hostHeader}/index.json`,
        packages: {} as any
    };

    if (fs.existsSync(PACKAGES_DIR)) {
        const packages = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const pkgName of packages) {
            if (pkgName === 'com.example.sample') {
                continue;
            }
            const pkgDir = path.join(PACKAGES_DIR, pkgName);
            const infoPath = path.join(pkgDir, 'info.json');
            
            let pkgInfo: any = {};
            if (fs.existsSync(infoPath)) {
                pkgInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
            }

            const versionsDir = path.join(pkgDir, 'Versions');
            if (fs.existsSync(versionsDir)) {
                const versions = fs.readdirSync(versionsDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                if (versions.length > 0) {
                    index.packages[pkgInfo.name || pkgName] = { versions: {} };

                    for (const version of versions) {
                        const versionDir = path.join(versionsDir, version);
                        const files = fs.readdirSync(versionDir);
                        const zipFile = files.find(f => f.endsWith('.zip') || f.endsWith('.unitypackage'));
                        
                        if (zipFile) {
                            let stats: any = { downloads: 0 };
                            const statsPath = path.join(versionDir, 'stats.json');
                            if (fs.existsSync(statsPath)) {
                                stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
                            }

                            const zipPath = path.join(versionDir, zipFile);
                            const fileBuffer = fs.readFileSync(zipPath);
                            const zipSHA256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

                            index.packages[pkgInfo.name || pkgName].versions[version] = {
                                ...pkgInfo,
                                name: pkgInfo.name || pkgName,
                                version: version,
                                displayName: pkgInfo.displayName || pkgName,
                                description: pkgInfo.description || "",
                                author: pkgInfo.author || index.author,
                                url: `${repoInfo.baseUrl || `https://${hostHeader}`}/download/${pkgName}/${version}/${zipFile}`,
                                zipSHA256: zipSHA256,
                                _stats: stats
                            };
                        }
                    }
                }
            }
        }
    }
    return index;
}
