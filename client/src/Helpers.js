export function extractYoutubeMeta(url) {

    

    if (url.includes('list=')) {
        // Is a playlist

        return {
            id: url.match('[?&]list=([^#\&\?]+)')[1],
            playlist: true
        };
    }

    return {
        id: url.match('youtu(?:.*\/v\/|.*v\=|\.be\/)([A-Za-z0-9_\-]{11})')[1],
        playlist: false
    };

}