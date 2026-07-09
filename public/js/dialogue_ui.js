// Zenithia — Dialogue UI System
// Multi-step conversations with reputation, choices, quests

import { DIALOGUES } from './dialogues.js';

export class DialogueSystem {
  constructor(ws, playerState) {
    this.ws = ws;
    this.playerState = playerState;
    this.currentNPC = null;
    this.currentDialogue = null;
    this.reputation = {}; // npcId → rep level
    this.activeQuests = {};

    this.container = null;
    this.createUI();
  }

  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'dialogue-ui';
    this.container.style.cssText = `
      position:fixed; bottom:100px; left:50%; transform:translateX(-50%);
      background:rgba(10,10,20,0.95); color:white; padding:24px; border-radius:16px;
      border:2px solid #4CAF50; max-width:480px; width:90%; z-index:30;
      display:none; font-family:'Courier New',monospace;
    `;
    document.body.appendChild(this.container);
  }

  // Get reputation level string
  getRepLevel(npcId) {
    const rep = this.reputation[npcId] || 0;
    if (rep >= 51) return 'honored';
    if (rep >= 31) return 'respected';
    if (rep >= 16) return 'trusted';
    if (rep >= 6) return 'friendly';
    return 'stranger';
  }

  // Open dialogue with NPC
  open(npcId, npcName, npcTitle) {
    const dialogueData = DIALOGUES[npcId];
    if (!dialogueData) return;

    this.currentNPC = { id: npcId, name: npcName, title: npcTitle };
    const repLevel = this.getRepLevel(npcId);
    const greeting = dialogueData.greeting[repLevel] || dialogueData.greeting.stranger;

    // Replace {player_name}
    const playerName = this.playerState.name || 'Adventurer';
    const text = greeting.replace('{player_name}', playerName);

    this.showNode(text, this.getAvailableTopics(npcId, repLevel));
    this.container.style.display = 'block';
  }

  // Get available topics based on reputation
  getAvailableTopics(npcId, repLevel) {
    const dialogueData = DIALOGUES[npcId];
    if (!dialogueData || !dialogueData.topics) return [];

    return dialogueData.topics
      .filter(t => {
        const rep = this.reputation[npcId] || 0;
        return rep >= t.requiredRep;
      })
      .map(t => ({
        label: t.label,
        action: () => this.handleTopic(npcId, t, repLevel),
      }));
  }

  // Handle topic selection
  handleTopic(npcId, topic, repLevel) {
    const dialogueData = DIALOGUES[npcId];
    const response = topic.responses[repLevel] || topic.responses.stranger;
    if (!response) return;

    const playerName = this.playerState.name || 'Adventurer';
    const text = response.text.replace('{player_name}', playerName);

    const options = response.options.map(opt => ({
      label: opt.text,
      action: () => this.handleOption(npcId, opt),
    }));

    this.showNode(text, options);
  }

  // Handle option selection
  handleOption(npcId, option) {
    // Apply reputation change
    if (option.reputation) {
      this.reputation[npcId] = (this.reputation[npcId] || 0) + option.reputation;
    }

    // Start quest
    if (option.quest) {
      this.activeQuests[option.quest] = { status: 'active', npcId };
      this.ws.send(JSON.stringify({ type: 'quest_start', questId: option.quest }));
    }

    // Buy item
    if (option.buy) {
      this.ws.send(JSON.stringify({ type: 'buy_item', itemId: option.buy }));
    }

    // Navigate to sub-dialogue
    if (option.next) {
      const dialogueData = DIALOGUES[npcId];
      const sub = dialogueData.subDialogues?.[option.next];
      if (sub) {
        const playerName = this.playerState.name || 'Adventurer';
        const text = sub.text.replace('{player_name}', playerName);
        const options = sub.options.map(opt => ({
          label: opt.text,
          action: () => this.handleOption(npcId, opt),
        }));
        this.showNode(text, options);
        return;
      }
    }

    // Close dialogue
    this.close();
  }

  // Show dialogue node
  showNode(text, options = []) {
    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <span style="color:#4CAF50; font-weight:bold;">${this.currentNPC.name}</span>
          <span style="color:#888; font-size:0.75rem; margin-left:8px;">${this.currentNPC.title}</span>
        </div>
        <span style="color:#666; font-size:0.7rem;">Rep: ${this.getRepLevel(this.currentNPC.id)}</span>
      </div>
      <div style="margin-bottom:16px; line-height:1.6; color:#ddd;">${text}</div>
    `;

    if (options.length > 0) {
      html += '<div style="display:flex; flex-direction:column; gap:8px;">';
      options.forEach(opt => {
        html += `
          <button class="dialogue-option" style="
            padding:10px 16px; background:rgba(76,175,80,0.15); border:1px solid #4CAF50;
            color:#4CAF50; border-radius:8px; cursor:pointer; text-align:left;
            font-family:inherit; font-size:0.9rem; transition:background 0.2s;
          " onmouseover="this.style.background='rgba(76,175,80,0.3)'"
             onmouseout="this.style.background='rgba(76,175,80,0.15)'">
            ▸ ${opt.label}
          </button>
        `;
      });
      html += '</div>';
    }

    html += `
      <button onclick="document.getElementById('dialogue-ui').style.display='none'"
        style="margin-top:16px; padding:8px 20px; background:rgba(255,255,255,0.1);
        border:1px solid #555; color:#888; border-radius:6px; cursor:pointer;
        font-family:inherit; font-size:0.8rem;">
        Tutup
      </button>
    `;

    this.container.innerHTML = html;

    // Bind option buttons
    const buttons = this.container.querySelectorAll('.dialogue-option');
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => options[i].action());
    });
  }

  // Close dialogue
  close() {
    this.container.style.display = 'none';
    this.currentNPC = null;
    this.currentDialogue = null;
  }

  // Get all reputation data (for saving)
  getReputationData() {
    return { ...this.reputation };
  }

  // Load reputation data
  loadReputation(data) {
    if (data) this.reputation = { ...data };
  }
}
