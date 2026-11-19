import { useState } from 'react';

/**
 * Reusable card for Admin Panel visual sections (Destinations, Packages, Treks, etc.).
 */
export default function AdminCard({
  image,
  title,
  subtitle,
  description,
  topLeftBadges = [],
  topRightBadge,
  bannerBottomLeft,
  bannerBottomRight,
  tags = [],
  tagsLabel = 'Highlights',
  onEdit,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleTags = expanded ? tags : tags.slice(0, 4);
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:border-sky-400/50 transition-all">
      {/* Visual Banner */}
      <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {image ? (
          <img src={image} alt={title || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <span className="material-icons text-4xl">landscape</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/25 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {topLeftBadges.map((badge, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${badge.className}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          {topRightBadge && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 shrink-0 max-w-[50%] truncate">
              {topRightBadge}
            </span>
          )}
        </div>

        {/* Bottom Banner Meta */}
        {(bannerBottomLeft || bannerBottomRight) && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-xs font-medium text-white">
            {bannerBottomLeft ? (
              <span className="bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-lg truncate min-w-0">
                {bannerBottomLeft}
              </span>
            ) : <span />}
            {bannerBottomRight && (
              <span className="bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-lg font-mono truncate max-w-[55%]">
                {bannerBottomRight}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 min-w-0 flex flex-col gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-100 leading-snug break-words">{title}</h3>
          {subtitle && (
            <p className="text-sm font-semibold text-orange-400 mt-0.5 break-words">{subtitle}</p>
          )}
          {description && (
            <p className="text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2 break-words">
              {description}
            </p>
          )}
        </div>

        {tags.length > 0 && (
          <div className="pt-1 mt-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {tagsLabel} ({tags.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 break-words max-w-full"
                >
                  {tag}
                </span>
              ))}
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-colors"
                >
                  +{hiddenCount} more
                </button>
              )}
              {expanded && tags.length > 4 && (
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700 hover:text-white text-sm font-semibold text-slate-100 transition-colors"
        >
          <span className="material-icons text-[17px]">edit</span>
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-sm font-semibold text-red-400 transition-colors"
        >
          <span className="material-icons text-[17px]">delete</span>
          Delete
        </button>
      </div>
    </div>
  );
}
