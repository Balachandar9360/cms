import { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext";

export default function ProfileModal({ open, onClose }) {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || user.studentId || "");
      setAvatar(user.avatar || null);
    }
    setSavedSuccess(false);
  }, [user, open]);

  if (!open) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setAvatar(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name: name.trim() || user?.name || user?.username,
      username: username.trim() || user?.username,
      studentId: username.trim() || user?.studentId,
      avatar: avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const initials = (name || username || "User").slice(0, 2).toUpperCase();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Profile"
      width={440}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-brass" onClick={handleSubmit}>
            Save Changes
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="profile-modal-form">
        {savedSuccess && (
          <div className="profile-save-banner">✓ Profile updated successfully!</div>
        )}

        <div className="profile-avatar-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <div
            className="profile-modal-avatar"
            onClick={() => fileInputRef.current?.click()}
            title="Click to select new photo"
          >
            {avatar ? (
              <img src={avatar} alt="Profile preview" className="profile-modal-avatar-img" />
            ) : (
              <div className="profile-modal-avatar-initials">{initials}</div>
            )}
            <span className="profile-modal-avatar-badge">📷</span>
          </div>

          <div className="profile-avatar-actions">
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </button>
            {avatar && (
              <button
                type="button"
                className="btn btn-sm btn-danger-ghost"
                onClick={handleRemoveAvatar}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="form-field full">
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-field full">
          <label>Username / Student ID</label>
          <input
            type="text"
            value={username}
            disabled
            style={{ opacity: 0.7, background: "var(--paper-dim)", cursor: "not-allowed" }}
          />
        </div>

        <div className="form-field full">
          <label>Account Role</label>
          <input
            type="text"
            value={user?.role || "STUDENT"}
            disabled
            style={{ opacity: 0.7, background: "var(--paper-dim)", cursor: "not-allowed" }}
          />
        </div>
      </form>
    </Modal>
  );
}
