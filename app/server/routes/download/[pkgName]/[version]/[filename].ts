import fs from 'node:fs';
import path from 'node:path';

export default defineEventHandler((event) => {
    const pkgName = getRouterParam(event, 'pkgName');
    const version = getRouterParam(event, 'version');
    const filename = getRouterParam(event, 'filename');

    const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '../data');
    const versionDir = path.join(DATA_DIR, 'packages', pkgName as string, 'Versions', version as string);
    const filePath = path.join(versionDir, filename as string);

    if (fs.existsSync(filePath)) {
        // Increment download count
        const statsPath = path.join(versionDir, 'stats.json');
        let stats = { downloads: 0 };
        try {
            if (fs.existsSync(statsPath)) {
                stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
            }
            stats.downloads = (stats.downloads || 0) + 1;
            fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
        } catch (err) {
            console.error(`Error updating stats for ${pkgName} v${version}:`, err);
        }

        return sendStream(event, fs.createReadStream(filePath));
    } else {
        throw createError({
            statusCode: 404,
            statusMessage: 'File not found'
        });
    }
});
