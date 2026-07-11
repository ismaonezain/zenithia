// Zenithia — Party & Online Players UI

export class PartyUI {
  constructor(ws, playerState) {
    this.ws = ws;
    this.player = playerState;
    this.party = null; // { leader, members: [{id, name}] }
    this.onlinePlayers = [];
    this.isOpen = false;
    this.container = null;
    this.createUI();
  }

  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'party-ui';
    this.container.style.cssText = `
      position:fixed; top:50%; right:20px; transform:translateY(-50%);
      background:rgba(10,10,20,0.92); color:white; border-radius:12px;
      border:2px solid #2196F3; z-index:20; display:none;
      font-family:'Courier New',monospace; width:200px; padding:12px;
    `;
    document.body.appendChild(this.container);

    // Toggle with 'P' key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P') {
        if (e.target.tagName === 'INPUT') return;
        this.toggle();
      }
    });

    this.render();
    this.refreshOnline();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.container.style.display = this.isOpen ? 'block' : 'none';
  }

  refreshOnline() {
    if (this.ws?.readyState === 1) {
      this.ws.send(JSON.stringify({ type: 'get_online' }));
    }
  }

  updateParty(partyData) {
    this.party = partyData;
    this.render();
  }

  updateOnline(players) {
    this.onlinePlayers = players;
    this.render();
  }

  render() {
    const inParty = this.party && this.party.members?.length > 0;
    const isLeader = inParty && this.party.leader === this.player?.id;

    // Count includes self
    const totalCount = this.onlinePlayers.length + 1;

    let html = `
      <div style="color:#2196F3; font-weight:bold; margin-bottom:8px;">👥 Online (${totalCount})</div>
    `;

    // Show self
    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #333;">
        <span style="color:#FFD54F; font-size:0.8rem;">
          ${this.player?.name || 'You'} <span style="color:#888;">Lv.${this.player?.level || 1}</span> <span style="color:#4CAF50;">(you)</span>
        </span>
      </div>
    `;

    // Online players list (others)
    this.onlinePlayers.forEach(p => {
      const inPartyMember = inParty && this.party.members.some(m => m.id === p.id);
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid #333;">
          <span style="color:${inPartyMember ? '#4CAF50' : '#ddd'}; font-size:0.8rem;">
            ${p.name} <span style="color:#888;">Lv.${p.level || 1}</span>
          </span>
          ${!inParty && p.id !== this.player?.id ? `<button class="party-invite-btn" data-name="${p.name}" style="
            padding:2px 6px; font-size:0.6rem; background:#2196F3; border:none; color:white;
            border-radius:4px; cursor:pointer;">Invite</button>` : ''}
        </div>
      `;
    });

    // Party section
    if (inParty) {
      html += `<div style="margin-top:12px; padding-top:8px; border-top:1px solid #333;">`;
      html += `<div style="color:#4CAF50; font-weight:bold; margin-bottom:6px;">⚔️ Party</div>`;
      this.party.members.forEach(m => {
        const isLeaderMember = m.id === this.party.leader;
        html += `<div style="color:#ddd; font-size:0.8rem; padding:2px 0;">
          ${isLeaderMember ? '👑' : '•'} ${m.name}
        </div>`;
      });
      html += `<button id="party-leave" style="
        margin-top:8px; width:100%; padding:4px; font-size:0.7rem; background:#F44336; border:none;
        color:white; border-radius:4px; cursor:pointer;">Leave Party</button>`;
      html += `</div>`;
    }

    // Shortcut hint
    html += `
      <div style="margin-top:10px; padding-top:6px; border-top:1px solid #333; font-size:0.6rem; color:#555; text-align:center;">
        Press <b>P</b> to toggle
      </div>
    `;

    this.container.innerHTML = html;

    // Bind invite buttons
    this.container.querySelectorAll('.party-invite-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.ws.send(JSON.stringify({ type: 'party_invite', targetName: btn.dataset.name }));
      });
    });

    // Bind leave button
    const leaveBtn = this.container.querySelector('#party-leave');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        this.ws.send(JSON.stringify({ type: 'party_leave' }));
      });
    }
  }

  addChatMessage(name, message) {
    // Use HUD chat instead
    const el = document.getElementById('chat-messages');
    if (!el) return;
    const div = document.createElement('div');
    div.innerHTML = `<strong>${name}:</strong> ${message}`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }
}
