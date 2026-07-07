export default defineEventHandler((event) => {
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*');
    setResponseHeader(event, 'Content-Type', 'application/json');

    const host = getRequestHeader(event, 'host') || 'localhost';
    
    // Remove _stats field from output for the actual VPM index.json
    const rawData = getVpmData(host);
    
    const clone = JSON.parse(JSON.stringify(rawData));
    for (const pkgName in clone.packages) {
        for (const ver in clone.packages[pkgName].versions) {
            delete clone.packages[pkgName].versions[ver]._stats;
        }
    }

    return clone;
});
