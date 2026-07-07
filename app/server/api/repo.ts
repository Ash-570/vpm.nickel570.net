export default defineEventHandler((event) => {
    const host = getRequestHeader(event, 'host') || 'localhost';
    return getVpmData(host);
});
