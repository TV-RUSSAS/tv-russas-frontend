import { getYoutubeVideos, YoutubeVideo } from '@/services/youtube';

export async function VideosSection() {
    const videos = await getYoutubeVideos(12);

    if (videos.length === 0) return null;

    const isCast = (title: string) => title.toUpperCase().includes('TV RUSSAS CAST');

    const videosNormais = videos.filter((v) => !isCast(v.title)).slice(0, 4);
    const videosCast = videos.filter((v) => isCast(v.title)).slice(0, 4);

    const renderCard = (video: YoutubeVideo) => (
        <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card"
        >
            <div className="video-thumb-wrapper">
                <img src={video.thumbnailUrl} alt={video.title} className="video-thumb" />
                <span className="video-play-icon">
                    <i className="fas fa-play"></i>
                </span>
            </div>
            <h3 className="video-title">{video.title}</h3>
            <span className="video-date">
                {new Date(video.publishedAt).toLocaleDateString('pt-BR')}
            </span>
            <p className="video-description">{video.description}</p>
        </a >
    );

    return (
        <section className="videos-section">
            <h2 className="videos-section-title">Vídeos</h2>
            <div className="videos-grid">
                {videosNormais.map(renderCard)}
            </div>

            {videosCast.length > 0 && (
                <>
                    <div className="videos-subsection-divider" />
                    <h2 className="videos-section-title">TV Russas Cast</h2>
                    <div className="videos-grid">
                        {videosCast.map(renderCard)}
                    </div>
                </>
            )}
        </section>
    );
}