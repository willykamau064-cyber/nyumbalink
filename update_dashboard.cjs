const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Add Refer & Earn to Sidebar
const oldSidebarNav = `<button class="n-item" onclick="showPanel('profile')" id="nav-profile"><i class="fas fa-user-circle"></i><span>Profile Settings</span></button>
  <button class="n-item" onclick="showPanel('notifications')" id="nav-notifications"><i class="fas fa-bell"></i><span>Notifications</span></button>`;
const newSidebarNav = `<button class="n-item" onclick="showPanel('profile')" id="nav-profile"><i class="fas fa-user-circle"></i><span>Profile Settings</span></button>
  <button class="n-item" onclick="showPanel('notifications')" id="nav-notifications"><i class="fas fa-bell"></i><span>Notifications</span></button>
  <button class="n-item" onclick="showPanel('refer')" id="nav-refer"><i class="fas fa-gift"></i><span>Refer & Earn</span></button>`;

if (html.includes(oldSidebarNav)) html = html.replace(oldSidebarNav, newSidebarNav);

// 2. Add My Landlord to Home Panel (under Stats)
const oldHomeContent = `      <h3 class="sec-title"><i class="fas fa-star"></i> Recommended For You</h3>`;
const newHomeContent = `      <!-- MY LANDLORD SECTION -->
      <h3 class="sec-title"><i class="fas fa-key"></i> My Current Lease & Landlord</h3>
      <div class="profile-card" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold;">J</div>
            <div>
                <h4 style="font-size: 1.1rem; font-weight: 700;">James Kamau</h4>
                <p style="color: var(--muted); font-size: 0.85rem;">Landlord • Joined LinkPoint: March 2023</p>
            </div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
            <button class="bk-btn primary" onclick="showToast('success','WhatsApp opened for Landlord')"><i class="fab fa-whatsapp"></i> Chat</button>
            <button class="bk-btn" onclick="showToast('success','Payment portal opened')"><i class="fas fa-file-invoice-dollar"></i> Pay Rent</button>
        </div>
      </div>

      <h3 class="sec-title"><i class="fas fa-star"></i> Recommended For You</h3>`;
if (html.includes(oldHomeContent)) html = html.replace(oldHomeContent, newHomeContent);


// 3. Add Refer & Earn Panel
const newReferPanel = `
    <!-- ===== REFER & EARN PANEL ===== -->
    <div class="panel" id="panel-refer">
      <div class="page-header">
        <h1>Refer & Earn 🎁</h1>
        <p>Invite friends to LinkPoint and earn rewards towards your rent.</p>
      </div>

      <div class="profile-grid">
        <div class="profile-card full">
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="width: 80px; height: 80px; background: rgba(255,107,53,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 2rem; margin-bottom: 1rem;">
              <i class="fas fa-gift"></i>
            </div>
            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Earn KSh 1,000 for every friend</h3>
            <p style="color: var(--muted); max-width: 400px; line-height: 1.6; margin-bottom: 1.5rem;">Share your code, they sign up, and you both earn KSh 1,000 after they book a property under LinkPoint.</p>
            
            <div style="background: rgba(255,255,255,0.05); border: 1px dashed var(--primary); border-radius: 12px; padding: 1rem 2rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                <span style="font-family: monospace; font-size: 1.5rem; font-weight: bold; letter-spacing: 2px;">LP-WILSON99</span>
                <button class="btn btn-primary" onclick="showToast('success','Code copied to clipboard!')"><i class="fas fa-copy"></i> Copy</button>
            </div>
          </div>
        </div>

        <div class="profile-card">
          <h3 class="sec-title" style="margin-bottom:1.2rem"><i class="fas fa-wallet"></i> My Rewards</h3>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; background: rgba(16,185,129,.15); padding: 1.5rem; border-radius: 12px;">
            <div>
              <p style="color: #34d399; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">Available Balance</p>
              <h2 style="font-size: 2rem; font-weight: 800; color: #fff;">KSh 3,000</h2>
            </div>
            <i class="fas fa-coins" style="font-size: 2.5rem; color: #34d399; opacity: 0.5;"></i>
          </div>
          <button class="save-btn" style="width: 100%; justify-content: center;" onclick="showToast('success','KSh 3,000 applied to your next house payment!')"><i class="fas fa-hand-holding-usd"></i> Claim House Payment</button>
        </div>

        <div class="profile-card">
          <h3 class="sec-title" style="margin-bottom:1.2rem"><i class="fas fa-info-circle"></i> How it Works</h3>
          <ul style="list-style: none; color: var(--muted); line-height: 1.8; font-size: 0.9rem;">
            <li style="display: flex; gap: 0.8rem; margin-bottom: 1rem;"><div style="color: var(--primary); font-weight: bold;">1.</div> <div><strong>Share your code</strong> with friends who are looking to rent or buy.</div></li>
            <li style="display: flex; gap: 0.8rem; margin-bottom: 1rem;"><div style="color: var(--primary); font-weight: bold;">2.</div> <div><strong>They sign up</strong> using your referral code during account creation.</div></li>
            <li style="display: flex; gap: 0.8rem; margin-bottom: 1rem;"><div style="color: var(--primary); font-weight: bold;">3.</div> <div><strong>They book a property</strong> through LinkPoint.</div></li>
            <li style="display: flex; gap: 0.8rem;"><div style="color: var(--primary); font-weight: bold;">4.</div> <div><strong>You both earn KSh 1,000</strong> credited to your LinkPoint wallets!</div></li>
          </ul>
        </div>
      </div>
    </div>
`;
const oldNotificationsEnd = `      </div>
    </div>

  </div><!-- /content -->`;
if (html.includes(oldNotificationsEnd)) html = html.replace(oldNotificationsEnd, newReferPanel + '\n' + oldNotificationsEnd);


// 4. Update Profile Page (Tenant Email, Member Since, Status, DOB)
const oldProfileTop = `<div class="profile-avatar-info">
              <h3 id="profile-display-name">Loading...</h3>
              <p id="profile-display-email">Loading...</p>
              <button class="change-photo-btn" onclick="document.getElementById('avatar-upload').click()"><i class="fas fa-camera"></i> Change Photo</button>`;

const newProfileTop = `<div class="profile-avatar-info" style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                  <div>
                      <h3 id="profile-display-name">Loading...</h3>
                      <p id="profile-display-email" style="color: var(--primary); font-weight: 500;">Loading...</p>
                      <button class="change-photo-btn" onclick="document.getElementById('avatar-upload').click()"><i class="fas fa-camera"></i> Change Photo</button>
                  </div>
                  <div style="text-align: right; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px solid var(--gb);">
                      <p style="font-size: 0.8rem; color: var(--muted); margin-bottom: 0.3rem;">Account Status</p>
                      <div style="display: inline-block; padding: 0.2rem 0.8rem; background: rgba(16,185,129,.15); color: #34d399; border-radius: 100px; font-size: 0.75rem; font-weight: bold; margin-bottom: 0.5rem;">Active Tenant</div>
                      <p style="font-size: 0.75rem; color: var(--dim);">Member Since: <strong style="color: #fff;">Jan 2024</strong></p>
                  </div>
              </div>`;

if (html.includes(oldProfileTop)) html = html.replace(oldProfileTop, newProfileTop);

const oldPersonalInfo = `<div class="form-group">
            <label>Location</label>
            <input type="text" class="form-input" id="pf-location" placeholder="e.g. Nairobi, Kenya">
          </div>
          <button class="save-btn" onclick="saveProfile()"><i class="fas fa-save"></i> Save Changes</button>`;

const newPersonalInfo = `<div class="form-group">
            <label>Location</label>
            <input type="text" class="form-input" id="pf-location" placeholder="e.g. Nairobi, Kenya">
          </div>
          <div class="form-group">
            <label>Date of Birth</label>
            <input type="date" class="form-input" id="pf-dob">
          </div>
          <button class="save-btn" onclick="saveProfile()"><i class="fas fa-save"></i> Save Changes</button>`;

if (html.includes(oldPersonalInfo)) html = html.replace(oldPersonalInfo, newPersonalInfo);


fs.writeFileSync('user-dashboard.html', html);
console.log('Successfully updated user-dashboard.html');
