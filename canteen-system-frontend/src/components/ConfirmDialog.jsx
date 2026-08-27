import Modal from "./Modal";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", tone = "primary", loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={380}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={`btn btn-${tone}`} onClick={onConfirm} disabled={loading}>
            {loading && <span className="btn-spinner" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}
