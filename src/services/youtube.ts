export interface YoutubeVideo {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnailUrl: string;
    url: string;
}

const CHANNEL_ID = 'UCAex-Nya9xpav80oVLDa_Lw'; // Canal da TV Russas
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function decodeXmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}
function truncateAtWord(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

export async function getYoutubeVideos(limit: number = 8): Promise<YoutubeVideo[]> {
    try {
        const res = await fetch(FEED_URL, {
            next: { revalidate: 3600 }, // Atualiza a lista a cada 1 hora
        });

        if (!res.ok) return [];

        const xml = await res.text();
        const entries = xml.split('<entry>').slice(1);

        return entries.slice(0, limit).map((entry) => {
            const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? '';
            const title = entry.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
            const published = entry.match(/<published>(.*?)<\/published>/)?.[1] ?? '';
            const description = entry.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? '';

            return {
                id: videoId,
                title: decodeXmlEntities(title),
                description: truncateAtWord(decodeXmlEntities(description), 140),
                publishedAt: published,
                thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                url: `https://www.youtube.com/watch?v=${videoId}`,
            };
        });
    } catch (error) {
        console.error('Erro ao buscar vídeos do YouTube:', error);
        return [];
    }
}