import { useState } from "react";

const VIDEO_ID = "IviyiULyjzI";

type YouTubeEmbedProps = {
  title: string;
  className?: string;
};

export default function YouTubeEmbed({ title, className = "" }: YouTubeEmbedProps) {
  const [active, setActive] = useState(false);

  const thumb = `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`;
  const embedSrc = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div className={`landing-hero-youtube ${className}`.trim()}>
      {active ? (
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="landing-hero-youtube-iframe"
        />
      ) : (
        <button
          type="button"
          className="landing-youtube-facade"
          onClick={() => setActive(true)}
          aria-label={`Play video: ${title}`}>
          <img
            src={thumb}
            alt=""
            className="landing-youtube-facade-thumb"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`;
            }}
          />
          <span className="landing-youtube-facade-shade" aria-hidden />
          <span className="landing-youtube-play" aria-hidden>
            <i className="ti ti-player-play-filled" />
          </span>
          <span className="landing-youtube-facade-label">Watch how Bolo Bill works</span>
        </button>
      )}
    </div>
  );
}
