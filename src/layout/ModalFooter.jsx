const T = "#0d9488";

/**
 * ModalFooter — shared action bar used across modals and onboarding forms.
 *
 * Props:
 *   onCancel        function   — called when Cancel / ← Cancel is pressed
 *   onSave          function   — called when the primary save button is pressed
 *   onSaveProfile   function   — called when "Save as Profile" is pressed (optional)
 *   saveLabel       string     — label for the primary button (default "Save")
 *   cancelLabel     string     — label for the cancel button (default "← Cancel")
 *   saveDisabled    bool       — disables + dims the primary button
 *   showProfile     bool       — show the "Save as Profile" secondary button
 *   variant         "modal"|"page"  — "page" uses ob-footer CSS; "modal" uses mf-footer CSS
 */
export default function ModalFooter({
  onCancel,
  onSave,
  onSaveProfile,
  saveLabel = "Save",
  cancelLabel = "← Cancel",
  saveDisabled = false,
  showProfile = false,
  variant = "modal",
}) {
  if (variant === "page") {
    return (
      <div className="ob-footer">
        <button className="ob-footer-cancel" onClick={onCancel}>
          {cancelLabel}
        </button>
        <div className="ob-footer-right">
          {showProfile && (
            <button className="ob-footer-profile" onClick={onSaveProfile}>
              Save as Profile
            </button>
          )}
          <button
            className="ob-footer-save"
            disabled={saveDisabled}
            onClick={onSave}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mf-footer">
      <button className="ob-footer-cancel" onClick={onCancel}>
        {cancelLabel}
      </button>
      <div className="mf-btn-row">
        {showProfile && (
          <button className="ob-footer-profile" onClick={onSaveProfile}>
            Save as Profile
          </button>
        )}
        <button
          className={`ob-footer-save${saveDisabled ? " mf-btn-disabled" : ""}`}
          disabled={saveDisabled}
          onClick={onSave}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
