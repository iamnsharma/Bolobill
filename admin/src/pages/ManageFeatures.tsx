import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";

export default function ManageFeatures() {
  return (
    <PageShell>
      <PageHeader
        title="Manage features"
        icon="ti-toggle-left"
        subtitle="Enable or disable app features and control visibility by version or plan."
      />
      <SectionPanel>
        <div className="text-center py-4">
          <span className="d-inline-flex align-items-center justify-content-center rounded-3 bg-light text-secondary mb-3 merchant-page-header__icon">
            <i className="ti ti-settings fs-4" aria-hidden />
          </span>
          <h3 className="h6 fw-bold mb-2">Feature flags &amp; toggles</h3>
          <p className="text-muted small mb-0 mx-auto" style={{ maxWidth: "28rem" }}>
            Feature flag management will appear here once it is available in your account.
          </p>
        </div>
      </SectionPanel>
    </PageShell>
  );
}
