type SettingsHubTileProps = {
  icon: string;
  title: string;
  description: string;
  active?: boolean;
  onClick: () => void;
};

export default function SettingsHubTile({
  icon,
  title,
  description,
  active = false,
  onClick,
}: SettingsHubTileProps) {
  return (
    <button
      type="button"
      className={`settings-hub-tile${active ? " settings-hub-tile--active" : ""}`}
      onClick={onClick}
    >
      <span className="settings-hub-tile__icon" aria-hidden>
        <i className={`ti ${icon}`} />
      </span>
      <span className="settings-hub-tile__text">
        <span className="settings-hub-tile__title">{title}</span>
        <span className="settings-hub-tile__desc">{description}</span>
      </span>
      <i className="ti ti-chevron-right settings-hub-tile__chevron" aria-hidden />
    </button>
  );
}
