import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeCx } from '../../lib/cx';
import * as store from '../../lib/store';
import { BARANGAYS } from '../../lib/constants';
import ordersStyles from '../../styles/customerOrders.module.css';
import accountStyles from '../../styles/customerAccount.module.css';
import { useToast } from '../common/Toast';
import CustomerShell from './CustomerShell';

const cx = makeCx(ordersStyles, accountStyles);
const AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%233b82f6'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16'%3EJD%3C/text%3E%3C/svg%3E";

function Modal({ open, onClose, title, footer, children, style }) {
  if (!open) return null;
  return (
    <div className={cx('modal-overlay')} style={{ display: 'flex' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx('modal-dialog')} style={style}>
        {title && (
          <div className={cx('modal-dialog-header')}>
            <h3>{title}</h3>
            <button type="button" className={cx('modal-close')} onClick={onClose}><i className={cx('fas fa-times')}></i></button>
          </div>
        )}
        {children}
        {footer && <div className={cx('modal-dialog-footer')}>{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div className={cx('form-group')}>
      <label>{label}</label>
      <div className={cx('input-group')}>
        <i className={cx('fas', icon)}></i>
        {children}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className={cx('detail-row')}>
      <span className={cx('detail-label')}>{label}</span>
      <span className={cx('detail-value')}>{value || '—'}</span>
    </div>
  );
}

/** Read-only profile with modal editors (converted from customer/profile.html). */
export default function SimpleProfilePage() {
  const navigate = useNavigate();
  const showToast = useToast();
  const user = store.useStoreData(store.getCurrentUser);
  const [modal, setModal] = useState(null);
  const [edit, setEdit] = useState({});
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  if (!user) return null;
  const initials = user.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const close = () => setModal(null);

  function openEdit() {
    setEdit({ name: user.name, email: user.email, phone: user.phone || '', barangay: user.barangay || '', address: user.address || '' });
    setModal('edit');
  }

  function saveProfile() {
    const values = {
      name: edit.name.trim(),
      email: edit.email.trim().toLowerCase(),
      phone: edit.phone.trim(),
      barangay: edit.barangay,
      address: edit.address.trim(),
    };
    if (Object.values(values).some((v) => !v)) {
      showToast('Complete all profile fields before saving.', 'error');
      return;
    }
    try {
      store.updateCurrentUser(values);
      close();
      showToast('Profile updated.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  function changePassword() {
    if (pw.current !== user.password) {
      showToast('Current password is incorrect.', 'error');
      return;
    }
    if (pw.next.length < 8 || pw.next !== pw.confirm) {
      showToast(pw.next.length < 8 ? 'Password must be at least 8 characters.' : 'New passwords do not match.', 'error');
      return;
    }
    store.updateCurrentUser({ password: pw.next });
    setPw({ current: '', next: '', confirm: '' });
    close();
    showToast('Password updated in this browser.', 'success');
  }

  const setEditField = (key) => (e) => setEdit((v) => ({ ...v, [key]: e.target.value }));
  const setPwField = (key) => (e) => setPw((v) => ({ ...v, [key]: e.target.value }));

  return (
    <CustomerShell cx={cx} active="/profile">
      <main className={cx('main-content')}>
        <header className={cx('dashboard-header')}>
          <div className={cx('header-left')}>
            <h1>My Profile</h1>
            <p>Manage your personal information and account settings</p>
          </div>
          <div className={cx('header-right')}>
            <div className={cx('notification-bell')}>
              <i className={cx('fas fa-bell')}></i>
              <span className={cx('notification-badge')}>1</span>
            </div>
            <div className={cx('user-avatar')}>
              <img src={AVATAR} alt="User" />
            </div>
          </div>
        </header>

        <div className={cx('profile-container')}>
          {/* Profile Header */}
          <div className={cx('profile-header-card')}>
            <div className={cx('profile-avatar-large')}>{initials}</div>
            <div className={cx('profile-info')}>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p>{user.phone || '—'}</p>
              <span className={cx('status-badge status-confirmed')}>Verified Customer</span>
            </div>
          </div>

          {/* Profile Details */}
          <div className={cx('card profile-details-card')}>
            <div className={cx('card-body')}>
              <div className={cx('detail-section')}>
                <h3><i className={cx('fas fa-id-card')}></i> Personal Information</h3>
                <DetailRow label="Full Name" value={user.name} />
                <DetailRow label="Email Address" value={user.email} />
                <DetailRow label="Phone Number" value={user.phone} />
                <DetailRow
                  label="Member Since"
                  value={new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                />
              </div>
              <div className={cx('detail-section')}>
                <h3><i className={cx('fas fa-map-marker-alt')}></i> Delivery Address</h3>
                <DetailRow label="Barangay" value={user.barangay} />
                <DetailRow label="Complete Address" value={user.address} />
              </div>
              <div className={cx('detail-section')}>
                <h3><i className={cx('fas fa-cog')}></i> Account Settings</h3>
                <DetailRow label="Password" value="••••••••••" />
                <div className={cx('detail-row')}>
                  <span className={cx('detail-label')}>Notifications</span>
                  <span className={cx('detail-value')}>
                    <label className={cx('switch')}>
                      <input
                        type="checkbox"
                        checked={user.notificationsEnabled !== false}
                        onChange={(e) => store.updateCurrentUser({ notificationsEnabled: e.target.checked })}
                      />
                      <span className={cx('slider')}></span>
                    </label>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={cx('profile-actions')}>
            <button type="button" className={cx('btn btn-primary')} onClick={openEdit}>
              <i className={cx('fas fa-edit')}></i> Edit Profile
            </button>
            <button type="button" className={cx('btn btn-outline')} onClick={() => setModal('password')}>
              <i className={cx('fas fa-lock')}></i> Change Password
            </button>
            <button type="button" className={cx('btn btn-danger')} onClick={() => setModal('logout')}>
              <i className={cx('fas fa-sign-out-alt')}></i> Logout
            </button>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <Modal
        open={modal === 'edit'}
        onClose={close}
        title="Edit Profile"
        footer={
          <>
            <button type="button" className={cx('btn btn-outline')} onClick={close}>Cancel</button>
            <button type="button" className={cx('btn btn-primary')} onClick={saveProfile}><i className={cx('fas fa-save')}></i> Save Changes</button>
          </>
        }
      >
        <div className={cx('modal-dialog-body')}>
          <Field label="Full Name" icon="fa-user"><input type="text" value={edit.name || ''} onChange={setEditField('name')} /></Field>
          <Field label="Email Address" icon="fa-envelope"><input type="email" value={edit.email || ''} onChange={setEditField('email')} /></Field>
          <Field label="Phone Number" icon="fa-phone"><input type="tel" value={edit.phone || ''} onChange={setEditField('phone')} /></Field>
          <Field label="Barangay" icon="fa-map-marker-alt">
            <select value={edit.barangay || ''} onChange={setEditField('barangay')}>
              <option value="">Select barangay</option>
              {BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Complete Address" icon="fa-home"><input type="text" value={edit.address || ''} onChange={setEditField('address')} /></Field>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={modal === 'password'}
        onClose={close}
        title="Change Password"
        footer={
          <>
            <button type="button" className={cx('btn btn-outline')} onClick={close}>Cancel</button>
            <button type="button" className={cx('btn btn-primary')} onClick={changePassword}><i className={cx('fas fa-key')}></i> Update Password</button>
          </>
        }
      >
        <div className={cx('modal-dialog-body')}>
          <Field label="Current Password" icon="fa-lock"><input type="password" placeholder="Enter current password" value={pw.current} onChange={setPwField('current')} /></Field>
          <Field label="New Password" icon="fa-lock"><input type="password" placeholder="At least 8 characters" value={pw.next} onChange={setPwField('next')} /></Field>
          <Field label="Confirm New Password" icon="fa-lock"><input type="password" placeholder="Re-enter new password" value={pw.confirm} onChange={setPwField('confirm')} /></Field>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal open={modal === 'logout'} onClose={close} style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className={cx('modal-dialog-body')} style={{ padding: '40px 30px' }}>
          <i className={cx('fas fa-sign-out-alt')} style={{ fontSize: '48px', color: 'var(--danger)', marginBottom: '16px' }}></i>
          <h3 style={{ marginBottom: '8px' }}>Confirm Logout</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>Are you sure you want to log out of your AquaPro account?</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button type="button" className={cx('btn btn-outline')} onClick={close}>Cancel</button>
            <button type="button" className={cx('btn btn-danger')} onClick={() => { store.logout(); navigate('/login'); }}>
              <i className={cx('fas fa-sign-out-alt')}></i> Logout
            </button>
          </div>
        </div>
      </Modal>
    </CustomerShell>
  );
}
