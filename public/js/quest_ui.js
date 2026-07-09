// Zenithia — Quest UI

export class QuestUI {
  constructor(ws, playerState) {
    this.ws = ws;
    this.player = playerState;
    this.quests = {}; // questId → quest data with progress
    this.activeQuests = []; // currently tracked
    this.completedQuests = [];
    this.isOpen = false;
    this.container = null;
    this.trackerEl = null;
    this.createUI();
    this.createTracker();
  }

  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'quest-ui';
    this.container.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:rgba(10,10,20,0.95); color:white; border-radius:16px;
      border:2px solid #FFD54F; z-index:25; display:none;
      font-family:'Courier New',monospace; width:520px; max-height:80vh; overflow-y:auto;
    `;
    document.body.appendChild(this.container);

    // Toggle with 'L' key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'l' || e.key === 'L') {
        if (e.target.tagName === 'INPUT') return;
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  createTracker() {
    this.trackerEl = document.createElement('div');
    this.trackerEl.id = 'quest-tracker';
    this.trackerEl.style.cssText = `
      position:fixed; top:100px; right:20px; width:250px;
      background:rgba(0,0,0,0.7); border-radius:10px; padding:12px;
      font-family:'Courier New',monospace; font-size:0.75rem; color:#ddd;
      z-index:15; pointer-events:none;
    `;
    document.body.appendChild(this.trackerEl);
    this.updateTracker();
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.render();
    this.container.style.display = 'block';
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
  }

  // Start a quest
  startQuest(questData) {
    if (this.quests[questData.id]) return; // already started
    this.quests[questData.id] = {
      ...questData,
      objectives: questData.objectives.map(o => ({ ...o, current: 0 })),
    };
    this.activeQuests.push(questData.id);
    this.updateTracker();
  }

  // Update objective progress
  updateObjective(questId, objectiveId, amount = 1) {
    const quest = this.quests[questId];
    if (!quest) return;
    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj) return;
    obj.current = Math.min(obj.current + amount, obj.required);
    this.updateTracker();

    // Check if quest is complete
    if (quest.objectives.every(o => o.current >= o.required)) {
      this.ws.send(JSON.stringify({ type: 'quest_complete', questId }));
    }
  }

  // Complete a quest
  completeQuest(questId) {
    const quest = this.quests[questId];
    if (!quest) return;
    this.activeQuests = this.activeQuests.filter(id => id !== questId);
    this.completedQuests.push(questId);
    delete this.quests[questId];
    this.updateTracker();
    this.render();
  }

  // Update tracker panel
  updateTracker() {
    if (this.activeQuests.length === 0) {
      this.trackerEl.innerHTML = '<div style="color:#888;">No active quests</div>';
      return;
    }

    let html = '<div style="color:#FFD54F; font-weight:bold; margin-bottom:8px;">📋 Quests</div>';
    this.activeQuests.forEach(qId => {
      const quest = this.quests[qId];
      if (!quest) return;
      html += `<div style="margin-bottom:8px;">`;
      html += `<div style="color:#fff; font-weight:bold;">${quest.name}</div>`;
      quest.objectives.forEach(obj => {
        const done = obj.current >= obj.required;
        const icon = done ? '✅' : '⬜';
        html += `<div style="color:${done ? '#4CAF50' : '#aaa'}; margin-left:8px;">
          ${icon} ${obj.text} (${obj.current}/${obj.required})
        </div>`;
      });
      html += '</div>';
    });
    this.trackerEl.innerHTML = html;
  }

  // Render full quest log
  render() {
    let html = `
      <div style="padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0; color:#FFD54F;">Quest Log</h3>
          <button onclick="document.getElementById('quest-ui').style.display='none'"
            style="padding:4px 12px; border:1px solid #F44336; background:transparent; color:#F44336;
            border-radius:6px; cursor:pointer; font-family:inherit;">✕</button>
        </div>
    `;

    // Active quests
    if (this.activeQuests.length > 0) {
      html += '<div style="margin-bottom:16px;"><div style="color:#FFD54F; font-weight:bold; margin-bottom:8px;">Active Quests</div>';
      this.activeQuests.forEach(qId => {
        const quest = this.quests[qId];
        if (!quest) return;
        html += `
          <div style="background:rgba(255,213,79,0.1); border:1px solid #FFD54F; border-radius:8px;
            padding:12px; margin-bottom:8px;">
            <div style="font-weight:bold; color:#FFD54F;">${quest.name}</div>
            <div style="color:#aaa; font-size:0.8rem; margin:4px 0;">${quest.description}</div>
            <div style="color:#888; font-size:0.7rem;">Type: ${quest.type} | Chapter: ${quest.chapter}</div>
            <div style="margin-top:8px;">
              ${quest.objectives.map(obj => {
                const done = obj.current >= obj.required;
                return `<div style="color:${done ? '#4CAF50' : '#ddd'}; font-size:0.8rem;">
                  ${done ? '✅' : '⬜'} ${obj.text} (${obj.current}/${obj.required})
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    // Completed quests
    if (this.completedQuests.length > 0) {
      html += '<div style="margin-bottom:16px;"><div style="color:#4CAF50; font-weight:bold; margin-bottom:8px;">Completed</div>';
      this.completedQuests.forEach(qId => {
        html += `<div style="color:#666; font-size:0.8rem; padding:4px 0;">✅ ${qId}</div>`;
      });
      html += '</div>';
    }

    if (this.activeQuests.length === 0 && this.completedQuests.length === 0) {
      html += '<div style="color:#888; text-align:center; padding:40px;">No quests yet. Talk to NPCs!</div>';
    }

    html += '</div>';
    this.container.innerHTML = html;
  }

  // Get quest data
  getQuests() {
    return { active: this.quests, completed: this.completedQuests };
  }

  loadQuests(data) {
    if (data.active) this.quests = data.active;
    if (data.completed) this.completedQuests = data.completed;
    this.activeQuests = Object.keys(this.quests);
    this.updateTracker();
  }
}
