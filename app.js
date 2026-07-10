(function(){
"use strict";

/* ============================================================
   Language handling
   ============================================================ */
let lang = localStorage.getItem('cb_lang') || (navigator.language || 'en').slice(0,2);
if(!I18N[lang]) lang = 'en';

function t(key, vars){
  let str = (I18N[lang] && I18N[lang][key]) || (I18N.en[key]) || key;
  if(vars){
    Object.keys(vars).forEach(k=>{ str = str.replace(`{${k}}`, vars[k]); });
  }
  return str;
}

function applyTranslations(){
  const cfg = LANGUAGES.find(l=>l.code===lang) || LANGUAGES[0];
  document.getElementById('htmlRoot').setAttribute('lang', lang);
  document.getElementById('htmlRoot').setAttribute('dir', cfg.dir);

  document.querySelectorAll('[data-i18n]').forEach(elx=>{
    elx.textContent = t(elx.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(elx=>{
    elx.setAttribute('placeholder', t(elx.getAttribute('data-i18n-ph')));
  });
  document.querySelectorAll('[data-i18n-opt]').forEach(elx=>{
    elx.textContent = t(elx.getAttribute('data-i18n-opt'));
  });
  document.querySelectorAll('[data-empty-i18n]').forEach(elx=>{
    if(elx.dataset.filled !== '1') elx.textContent = t(elx.getAttribute('data-empty-i18n'));
  });
  document.getElementById('entryTitle').textContent = entryMode === 'create' ? t('createRoom') : t('joinRoom');
  renderLangSelect();
  if(lastState) render(lastState);
}

function renderLangSelect(){
  const sel = document.getElementById('langSelect');
  sel.innerHTML = '';
  LANGUAGES.forEach(l=>{
    const opt = document.createElement('option');
    opt.value = l.code; opt.textContent = l.label;
    if(l.code===lang) opt.selected = true;
    sel.appendChild(opt);
  });
}

/* ============================================================
   Loading screen
   ============================================================ */
function runLoadingScreen(cb){
  const msgs = t('loading');
  const msgEl = document.getElementById('loadingMsg');
  const fill = document.getElementById('loadingFill');
  let i = 0;
  msgEl.textContent = Array.isArray(msgs) ? msgs[0] : 'Loading…';
  const msgTimer = setInterval(()=>{
    i = (i+1) % (Array.isArray(msgs) ? msgs.length : 1);
    if(Array.isArray(msgs)) msgEl.textContent = msgs[i];
  }, 650);

  let pct = 0;
  const barTimer = setInterval(()=>{
    pct += Math.random()*18 + 6;
    if(pct >= 100){
      pct = 100;
      fill.style.width = '100%';
      clearInterval(barTimer);
      clearInterval(msgTimer);
      setTimeout(()=>{
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(()=>{
          document.getElementById('loadingScreen').classList.add('hidden');
          cb();
        }, 450);
      }, 300);
    } else {
      fill.style.width = pct + '%';
    }
  }, 260);
}

/* ============================================================
   Screen management
   ============================================================ */
function showScreen(id){
  ['menuScreen','lobbyScreen','gameScreen'].forEach(s=>{
    document.getElementById(s).classList.toggle('hidden', s!==id);
  });
}

/* ============================================================
   Socket.io connection
   ============================================================ */
const socket = io();
let lastState = null;
let entryMode = 'create'; // 'create' | 'join'
let pendingJoinCode = null;

socket.on('state', (state)=>{
  lastState = state;
  render(state);
});

socket.on('errorMsg', (code)=>{
  const errEl = document.getElementById('entryError');
  errEl.textContent = t('error' + code.charAt(0).toUpperCase() + code.slice(1));
  errEl.classList.remove('hidden');
});

/* ============================================================
   Entry flow (menu -> name/code modal)
   ============================================================ */
function openEntry(mode){
  entryMode = mode;
  document.getElementById('entryTitle').textContent = mode==='create' ? t('createRoom') : t('joinRoom');
  document.getElementById('codeField').classList.toggle('hidden', mode!=='join');
  document.getElementById('entryError').classList.add('hidden');
  if(pendingJoinCode){
    document.getElementById('codeInput').value = pendingJoinCode;
  }
  document.getElementById('entryOverlay').classList.add('show');
  document.getElementById('nameInput').focus();
}

document.getElementById('btnCreate').addEventListener('click', ()=>openEntry('create'));
document.getElementById('btnJoin').addEventListener('click', ()=>openEntry('join'));
document.getElementById('entryBack').addEventListener('click', ()=>{
  document.getElementById('entryOverlay').classList.remove('show');
});
document.getElementById('entryGo').addEventListener('click', submitEntry);
document.getElementById('nameInput').addEventListener('keydown', e=>{ if(e.key==='Enter') submitEntry(); });
document.getElementById('codeInput').addEventListener('keydown', e=>{ if(e.key==='Enter') submitEntry(); });

function submitEntry(){
  const name = document.getElementById('nameInput').value.trim() || 'Player';
  document.getElementById('entryError').classList.add('hidden');
  if(entryMode === 'create'){
    socket.emit('createRoom', { name, lang });
  } else {
    const code = document.getElementById('codeInput').value.trim().toUpperCase();
    if(!code) return;
    socket.emit('joinRoom', { code, name });
  }
  document.getElementById('entryOverlay').classList.remove('show');
}

/* ============================================================
   Settings / language modal
   ============================================================ */
function openSettings(){ document.getElementById('settingsOverlay').classList.add('show'); }
document.getElementById('gearBtn').addEventListener('click', openSettings);
document.getElementById('gearBtnLobby').addEventListener('click', openSettings);
document.getElementById('gearBtnGame').addEventListener('click', openSettings);
document.getElementById('closeSettingsBtn').addEventListener('click', ()=>{
  document.getElementById('settingsOverlay').classList.remove('show');
});
document.getElementById('langSelect').addEventListener('change', (e)=>{
  lang = e.target.value;
  localStorage.setItem('cb_lang', lang);
  applyTranslations();
  if(lastState){
    socket.emit('setLang', { lang });
  }
});

/* ============================================================
   Lobby rendering
   ============================================================ */
function renderLobby(state){
  showScreen('lobbyScreen');
  const link = location.origin + '/room/' + state.code;
  document.getElementById('shareLinkInput').value = link;

  const slotMap = {};
  state.players.forEach(p=>{ if(p.slot) slotMap[p.slot] = p; });

  document.querySelectorAll('.seat').forEach(seatEl=>{
    const slot = seatEl.getAttribute('data-slot');
    const nameEl = seatEl.querySelector('.seat-name');
    const p = slotMap[slot];
    seatEl.classList.toggle('filled', !!p);
    seatEl.classList.toggle('me', !!p && p.id === socket.id);
    if(p){
      nameEl.dataset.filled = '1';
      nameEl.textContent = p.name + (p.id===socket.id ? ` (${t('you')})` : '');
    } else {
      nameEl.dataset.filled = '0';
      nameEl.textContent = t('empty');
    }
  });

  const filledCount = Object.keys(slotMap).length;
  const allFilled = ['red-spymaster','red-operative','blue-spymaster','blue-operative'].every(s=>slotMap[s]);
  document.getElementById('startGameBtn').disabled = !allFilled;
  document.getElementById('lobbyWaitingMsg').classList.toggle('hidden', allFilled);
}

document.querySelectorAll('.seat').forEach(seatEl=>{
  seatEl.addEventListener('click', ()=>{
    if(!lastState || lastState.phase!=='lobby') return;
    const slot = seatEl.getAttribute('data-slot');
    if(lastState.mySlot === slot){
      socket.emit('leaveSlot');
    } else if(!seatEl.classList.contains('filled')){
      socket.emit('takeSlot', { slot });
    }
  });
});

document.getElementById('startGameBtn').addEventListener('click', ()=>{
  socket.emit('startGame');
});

document.getElementById('copyLinkBtn').addEventListener('click', ()=>{
  const input = document.getElementById('shareLinkInput');
  input.select();
  navigator.clipboard && navigator.clipboard.writeText(input.value).catch(()=>{});
  showToast(t('copied'));
});

function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> el.classList.add('hidden'), 1800);
}

/* ============================================================
   Game rendering
   ============================================================ */
function renderGame(state){
  showScreen('gameScreen');

  document.getElementById('redCount').textContent = state.redRemaining;
  document.getElementById('blueCount').textContent = state.blueRemaining;
  document.getElementById('redCard').classList.toggle('active', state.currentTeam==='red' && state.phase==='playing');
  document.getElementById('blueCard').classList.toggle('active', state.currentTeam==='blue' && state.phase==='playing');

  // ✨ نظام إظهار اللاعبين المسجلين وأدوارهم بجانب كل فريق داخل الجيم
  let redRoster = document.getElementById('redRosterInGame');
  if(!redRoster) {
    redRoster = document.createElement('div');
    redRoster.id = 'redRosterInGame';
    redRoster.style.cssText = "margin-top: 8px; font-size: 11px; text-align: center; opacity: 0.85; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;";
    document.getElementById('redCard').appendChild(redRoster);
  }
  redRoster.innerHTML = '';

  let blueRoster = document.getElementById('blueRosterInGame');
  if(!blueRoster) {
    blueRoster = document.createElement('div');
    blueRoster.id = 'blueRosterInGame';
    blueRoster.style.cssText = "margin-top: 8px; font-size: 11px; text-align: center; opacity: 0.85; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;";
    document.getElementById('blueCard').appendChild(blueRoster);
  }
  blueRoster.innerHTML = '';

  state.players.forEach(p => {
    if(!p.slot) return;
    const isRed = p.slot.startsWith('red');
    const roleKey = p.slot.endsWith('spymaster') ? 'spymaster' : 'operative';
    const tag = document.createElement('div');
    tag.style.margin = '2px 0';
    tag.textContent = `${p.name} (${t(roleKey)})`;
    if(isRed) redRoster.appendChild(tag);
    else blueRoster.appendChild(tag);
  });

  document.getElementById('clueWordDisp').textContent = state.clue ? state.clue.word : '—';
  document.getElementById('clueNumDisp').textContent = state.clue
    ? (state.clue.number===0 ? t('unlimitedShort') : `${t('numberLabel')}: ${state.clue.number}`)
    : t('noClueYet');

  const isSpymaster = state.mySlot === 'red-spymaster' || state.mySlot === 'blue-spymaster';
  const myTeam = state.mySlot ? state.mySlot.split('-')[0] : null;
  const isMyTeamTurn = myTeam === state.currentTeam;
  const guessingActive = state.clueSubmitted && (state.guessesLeft === -1 || state.guessesLeft > 0);

  // board
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  state.board.forEach((cell, idx)=>{
    const div = document.createElement('div');
    div.className = 'cell';
    if(cell.revealed){
      div.classList.add('revealed', cell.color);
    } else if(cell.color){ // spymaster peek
      div.classList.add('peek-'+cell.color);
    }
    const canClick = state.phase==='playing' && !cell.revealed && isMyTeamTurn && state.mySlot === `${state.currentTeam}-operative` && guessingActive;
    if(!canClick) div.classList.add('locked');

    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    // ✨ التحويل الديناميكي للغة الكلمات بالكامل فور تغيير اللغة
    wordSpan.textContent = lang === 'ar' ? cell.wordAr : cell.wordEn;
    div.appendChild(wordSpan);

    div.addEventListener('click', ()=>{
      if(canClick) socket.emit('guessCell', { index: idx });
    });
    boardEl.appendChild(div);
  });

  // log
  const logEl = document.getElementById('log');
  logEl.innerHTML = '';
  state.log.forEach(entry=>{
    const div = document.createElement('div');
    div.className = 'log-entry ' + (entry.team==='sys' ? 'sys' : entry.team);
    div.textContent = formatLogEntry(entry);
    logEl.appendChild(div);
  });
  logEl.scrollTop = logEl.scrollHeight;

  // controls
  const clueForm = document.getElementById('clueForm');
  const endTurnBtn = document.getElementById('endTurnBtn');
  const roleMsg = document.getElementById('myRoleMsg');

  const iAmCurrentSpymaster = state.mySlot === `${state.currentTeam}-spymaster`;
  const iAmCurrentOperative = state.mySlot === `${state.currentTeam}-operative`;

  clueForm.classList.toggle('hidden', !(state.phase==='playing' && iAmCurrentSpymaster && !state.clueSubmitted));
  endTurnBtn.classList.toggle('hidden', !(state.phase==='playing' && isMyTeamTurn && state.clueSubmitted));

  if(state.phase==='playing'){
    if(iAmCurrentSpymaster && !state.clueSubmitted) roleMsg.textContent = t('spymasterWaiting');
    else if(iAmCurrentOperative && !state.clueSubmitted) roleMsg.textContent = t('operativeWaiting');
    else if(!isMyTeamTurn) roleMsg.textContent = `${t(state.currentTeam)} ${t('waitingTurn')}`;
    else roleMsg.textContent = '';
  } else {
    roleMsg.textContent = '';
  }

  // end game
  if(state.phase === 'ended'){
    document.getElementById('endTitle').textContent = `${t(state.winner)} ${t('winsSuffix')}`;
    document.getElementById('endText').textContent = state.winReason === 'assassin' ? t('reasonAssassin') : `${t(state.winner)} ${t('reasonComplete')}`;
    document.getElementById('endOverlay').classList.add('show');
  } else {
    document.getElementById('endOverlay').classList.remove('show');
  }
}

function formatLogEntry(entry){
  const parts = entry.text.split(':');
  const action = parts[0];
  const rest = parts.slice(1).join(':');
  const teamLabel = entry.team === 'sys' ? '' : t(entry.team);
  switch(action){
    case 'clue': {
      const [word, n] = rest.split(/:(?=[^:]*$)/);
      return t('log_clue', { team: teamLabel, word, n: n==='0' ? t('unlimitedShort') : n });
    }
    case 'hit': return t('log_hit', { team: teamLabel, word: rest });
    case 'neutral': return t('log_neutral', { team: teamLabel, word: rest });
    case 'wrong_team': return t('log_wrong_team', { team: teamLabel, word: rest });
    case 'assassin': return t('log_assassin', { team: teamLabel, word: rest });
    case 'game_started': return t('log_game_started', { team: t(rest) });
    case 'turn_ended_voluntarily': return t('log_turn_ended_voluntarily');
    case 'guesses_exhausted': return t('log_guesses_exhausted');
    default: return entry.text;
  }
}

document.getElementById('submitClueBtn').addEventListener('click', submitClue);
document.getElementById('clueInput').addEventListener('keydown', e=>{ if(e.key==='Enter') submitClue(); });
function submitClue(){
  const word = document.getElementById('clueInput').value.trim();
  const number = parseInt(document.getElementById('clueNumSelect').value, 10);
  if(!word) return;
  socket.emit('submitClue', { word, number });
  document.getElementById('clueInput').value = '';
}

document.getElementById('endTurnBtn').addEventListener('click', ()=>{
  socket.emit('endTurn');
});

document.getElementById('playAgainBtn').addEventListener('click', ()=>{
  socket.emit('rematch');
  document.getElementById('endOverlay').classList.remove('show');
});
document.getElementById('backMenuBtn').addEventListener('click', ()=>{
  location.href = location.origin;
});

/* ============================================================
   Master render dispatcher
   ============================================================ */
function render(state){
  if(state.phase === 'lobby') renderLobby(state);
  else renderGame(state);
}

/* ============================================================
   Boot
   ============================================================ */
function boot(){
  applyTranslations();
  const m = location.pathname.match(/\/room\/([A-Za-z0-9]+)/);
  runLoadingScreen(()=>{
    if(m){
      pendingJoinCode = m[1].toUpperCase();
      showScreen('menuScreen'); // rendered underneath the modal
      openEntry('join');
    } else {
      showScreen('menuScreen');
    }
  });
}
boot();

})();
