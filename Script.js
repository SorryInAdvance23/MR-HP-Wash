// ==== MIN MP FORMULAS ====
// Beginner = 10 * level + 2
// Spearman = 4 * level + 156
// Fighter  = 4 * level + 56
// Bowman   = 14 * level + 148
// Thief    = 14 * level + 148
// Corsair  = 18 * level + 111  (Pirate base)
// Buccaneer= 18 * level + 111  (Pirate base)
function getMinMpForClass(cls, lvl) {
  lvl = Number(lvl);
  const table = {
    Beginner: 10 * lvl + 2,
    Spearman: 4 * lvl + 156,
    Fighter:  4 * lvl + 56,
    Bowman:   14 * lvl + 148,
    Thief:    14 * lvl + 148,
    Corsair:  18 * lvl + 111,
    Buccaneer:18 * lvl + 111
  };
  return table[cls];
}

// ==== WASH RATES ====
// Beginner:  +8~12 HP,  -8 MP
// Warrior:   +50~54 HP, -4 MP
// Thief:     +20~24 HP, -12 MP
// Bowman:    +16~20 HP, -12 MP
// Corsair:   +16~20 HP, -16 MP
// Buccaneer: +36~40 HP, -16 MP
function getWashRate(cls) {
  const table = {
    Beginner:  { hpMin: 8,  hpMax: 12, mpPerWash: 8 },
    Warrior:   { hpMin: 50, hpMax: 54, mpPerWash: 4 },
    Thief:     { hpMin: 20, hpMax: 24, mpPerWash: 12 },
    Bowman:    { hpMin: 16, hpMax: 20, mpPerWash: 12 },
    Corsair:   { hpMin: 16, hpMax: 20, mpPerWash: 16 },
    Buccaneer: { hpMin: 36, hpMax: 40, mpPerWash: 16 }
  };
  return table[cls];
}

// ==== QUICK-SELECT BUTTON HANDLERS ====
document.querySelectorAll(".class-icons").forEach(group => {
  const select = document.getElementById(group.dataset.select);
  group.querySelectorAll(".class-icon").forEach(btn => {
    btn.addEventListener("click", () => {
      const cls = btn.dataset.class;
      if (select) select.value = cls;
    });
  });
});

// ==== MIN MP CALCULATOR ====
const minBtn = document.getElementById("calcMinMpBtn");
const minResult = document.getElementById("minMpResult");

minBtn.addEventListener("click", () => {
  const cls = document.getElementById("minClass").value;
  const lvl = document.getElementById("minLevel").value || 1;
  const minMp = getMinMpForClass(cls, lvl);

  if (minMp == null) {
    minResult.textContent = "No minimum MP formula defined for this class.";
    return;
  }

  minResult.textContent = `${cls} (Lv ${lvl}) → Min MP: ${minMp}`;
});

// ==== WASH PLANNER CALCULATOR ====
const washBtn = document.getElementById("calcWashBtn");
const washResult = document.getElementById("washResult");
const soundSuccess = document.getElementById("soundSuccess");
const soundError = document.getElementById("soundError");

washBtn.addEventListener("click", () => {
  const cls = document.getElementById("washClass").value;
  const lvl = Number(document.getElementById("washLevel").value || 1);
  const currentMp = Number(document.getElementById("washCurrentMp").value || 0);
  const goalVal = document.getElementById("washTargetExtraHp").value;
  const goalHp = goalVal === "" ? null : Number(goalVal);

  const rate = getWashRate(cls);
  if (!rate) {
    washResult.textContent = "No wash rate defined for this class.";
    if (soundError) soundError.play();
    return;
  }

  // For Warrior we still use Spearman min MP as safety baseline
  const minKey = cls === "Warrior" ? "Spearman" : cls;
  const minMp = getMinMpForClass(minKey, lvl);

  if (minMp == null) {
    washResult.textContent = "No minimum MP formula available for this class.";
    if (soundError) soundError.play();
    return;
  }

  if (currentMp < minMp) {
    washResult.textContent = "Not enough MP to wash safely!";
    if (soundError) soundError.play();
    return;
  }

  const washableMp = Math.max(0, currentMp - minMp);
  const washes = Math.floor(washableMp / rate.mpPerWash);

  if (soundSuccess) soundSuccess.play();

  let text = `${cls} (Lv ${lvl})\n`;
  text += `Current MP: ${currentMp}\n`;
  text += `Min safe MP: ${minMp}\n`;
  text += `Washable MP: ${washableMp}\n`;
  text += `MP per wash: ${rate.mpPerWash}\n`;
  text += `Max washes: ${washes}\n`;
  text += `Estimated HP gain: ${washes * rate.hpMin} ~ ${washes * rate.hpMax}`;

  if (goalHp && goalHp > 0) {
    const best = Math.ceil(goalHp / rate.hpMax);
    const worst = Math.ceil(goalHp / rate.hpMin);
    text += `\n\nHP Goal: ${goalHp}`;
    text += `\nWashes needed: ${best} ~ ${worst}`;
  }

  washResult.textContent = text;
});
