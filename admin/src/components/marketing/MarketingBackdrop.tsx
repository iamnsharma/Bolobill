import { lazy, Suspense } from "react";
import LandingHeroAmbience from "../landing/LandingHeroAmbience";
import MarketingSceneErrorBoundary from "./MarketingSceneErrorBoundary";

const MarketingWebGLScene = lazy(() => import("./MarketingWebGLScene"));

type MarketingBackdropProps = {
  intensity?: "hero" | "subtle";
  className?: string;
};

export default function MarketingBackdrop({
  intensity = "hero",
  className = "",
}: MarketingBackdropProps) {
  const fallback = <LandingHeroAmbience />;

  return (
    <div className={`marketing-backdrop ${className}`.trim()} aria-hidden>
      <MarketingSceneErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <MarketingWebGLScene intensity={intensity} />
        </Suspense>
      </MarketingSceneErrorBoundary>
      <div className="marketing-backdrop-vignette" />
    </div>
  );
}
