(() => {
  "use strict";

  // Tết 2027: mùng 1 tháng Giêng âm lịch là ngày 06/02/2027 (dương lịch).
  const TET_DATE = new Date(2027, 1, 6, 0, 0, 0);
  const $ = (id) => document.getElementById(id);
  const pad2 = (n) => String(n).padStart(2, "0");
  const viDate = (date, options = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) =>
    new Intl.DateTimeFormat("vi-VN", options).format(date);
  const money = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

  // Countdown
  function updateCountdown() {
    const diff = TET_DATE.getTime() - Date.now();
    if (diff <= 0) {
      ["days", "hours", "minutes", "seconds"].forEach(id => $(id).textContent = "00");
      $("countdownNote").textContent = diff > -86400000 ? "Chúc mừng năm mới! Xuân đã về rồi 🌸" : "Tết 2027 đã qua — hẹn bạn mùa xuân tiếp theo!";
      return;
    }
    const seconds = Math.floor(diff / 1000);
    $("days").textContent = Math.floor(seconds / 86400).toLocaleString("vi-VN");
    $("hours").textContent = pad2(Math.floor((seconds % 86400) / 3600));
    $("minutes").textContent = pad2(Math.floor((seconds % 3600) / 60));
    $("seconds").textContent = pad2(seconds % 60);
    $("countdownNote").textContent = `Mùng 1 Tết còn ${Math.floor(seconds / 86400).toLocaleString("vi-VN")} ngày nữa.`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Vietnamese lunar calendar conversion (Ho Chi Minh City UTC+7), based on the
  // standard new-moon / solar-longitude algorithm. Intended for date lookup.
  const PI = Math.PI;
  function jdFromDate(dd, mm, yy) {
    const a = Math.floor((14 - mm) / 12);
    const y = yy + 4800 - a;
    const m = mm + 12 * a - 3;
    let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
    return jd;
  }
  function newMoon(k) {
    const T = k / 1236.85, T2 = T * T, T3 = T2 * T;
    const dr = PI / 180;
    let jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    jd += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
    C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
    C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
    C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
    C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
    C1 += 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
    let deltat;
    if (T < -11) deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    else deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    return jd + C1 - deltat;
  }
  function getNewMoonDay(k, timeZone = 7) { return Math.floor(newMoon(k) + 0.5 + timeZone / 24); }
  function getSunLongitude(dayNumber, timeZone = 7) {
    const T = (dayNumber - 2451545.5 - timeZone / 24) / 36525;
    const T2 = T * T, dr = PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(2 * dr * M) + 0.000290 * Math.sin(3 * dr * M);
    let L = (L0 + DL) * dr;
    L -= PI * 2 * Math.floor(L / (PI * 2));
    return Math.floor(L / PI * 6);
  }
  function getLunarMonth11(yy, timeZone = 7) {
    const off = jdFromDate(31, 12, yy) - 2415021;
    const k = Math.floor(off / 29.530588853);
    let nm = getNewMoonDay(k, timeZone);
    if (getSunLongitude(nm, timeZone) >= 9) nm = getNewMoonDay(k - 1, timeZone);
    return nm;
  }
  function getLeapMonthOffset(a11, timeZone = 7) {
    const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    let last = 0, i = 1, arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    do {
      last = arc; i++; arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
    } while (arc !== last && i < 14);
    return i - 1;
  }
  function solarToLunar(dd, mm, yy, timeZone = 7) {
    const dayNumber = jdFromDate(dd, mm, yy);
    const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
    let a11 = getLunarMonth11(yy, timeZone), b11 = a11, lunarYear;
    if (a11 >= monthStart) { lunarYear = yy; a11 = getLunarMonth11(yy - 1, timeZone); }
    else { lunarYear = yy + 1; b11 = getLunarMonth11(yy + 1, timeZone); }
    const lunarDay = dayNumber - monthStart + 1;
    const diff = Math.floor((monthStart - a11) / 29);
    let lunarLeap = 0, lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
      if (diff >= leapMonthDiff) { lunarMonth = diff + 10; if (diff === leapMonthDiff) lunarLeap = 1; }
    }
    if (lunarMonth > 12) lunarMonth -= 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap };
  }

  const today = new Date();
  let calendarYear = 2027, calendarMonth = 1, selectedISO = "";
  const lunarMilestones = {
    "2027-02-05": "29 tháng Chạp — ngày cuối năm âm lịch.",
    "2027-02-06": "Mùng 1 Tết Đinh Mùi — chúc mừng năm mới!",
    "2027-02-07": "Mùng 2 Tết — chúc năm mới an vui.",
    "2027-02-08": "Mùng 3 Tết — chúc vạn sự hanh thông."
  };
  function isoLocal(y, m, d) { return `${y}-${pad2(m + 1)}-${pad2(d)}`; }
  function renderCalendar() {
    const first = new Date(calendarYear, calendarMonth, 1);
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    $("calendarMonth").textContent = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(first);
    const firstLunar = solarToLunar(1, calendarMonth + 1, calendarYear);
    $("lunarMonthLabel").textContent = `Tháng ${firstLunar.month} âm lịch · ${firstLunar.year}`;
    const grid = $("calendarDays"); grid.innerHTML = "";
    for (let i = 0; i < first.getDay(); i++) {
      const blank = document.createElement("div"); blank.className = "calendar-day empty"; blank.setAttribute("aria-hidden", "true"); grid.appendChild(blank);
    }
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(calendarYear, calendarMonth, d), iso = isoLocal(calendarYear, calendarMonth, d);
      const lunar = solarToLunar(d, calendarMonth + 1, calendarYear);
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "calendar-day";
      if (date.getDay() === 0) btn.classList.add("sunday");
      if (iso === isoLocal(today.getFullYear(), today.getMonth(), today.getDate())) btn.classList.add("today");
      if (["2027-02-06", "2027-02-07", "2027-02-08"].includes(iso)) btn.classList.add("tet-day");
      if (iso === selectedISO) btn.classList.add("selected");
      btn.setAttribute("aria-label", `${d}/${calendarMonth + 1}/${calendarYear}, ngày âm ${lunar.day}/${lunar.month}/${lunar.year}`);
      btn.innerHTML = `<span class="solar">${d}</span><span class="lunar">${lunar.day === 1 ? `${lunar.month} AL` : lunar.day}</span>`;
      btn.addEventListener("click", () => { selectedISO = iso; renderCalendar(); showDateDetail(date, lunar); });
      grid.appendChild(btn);
    }
    if (!selectedISO || !selectedISO.startsWith(`${calendarYear}-${pad2(calendarMonth + 1)}-`)) {
      const d = Math.min(today.getDate(), lastDay);
      const date = new Date(calendarYear, calendarMonth, d);
      selectedISO = isoLocal(calendarYear, calendarMonth, d);
      showDateDetail(date, solarToLunar(d, calendarMonth + 1, calendarYear));
      // Mark selected without rerender recursion.
      const index = first.getDay() + d - 1;
      grid.children[index]?.classList.add("selected");
    } else {
      const parts = selectedISO.split("-").map(Number);
      showDateDetail(new Date(parts[0], parts[1] - 1, parts[2]), solarToLunar(parts[2], parts[1], parts[0]));
    }
  }
  function showDateDetail(date, lunar) {
    const iso = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    $("selectedDateLabel").textContent = viDate(date, { day: "numeric", month: "short" });
    const milestone = lunarMilestones[iso];
    $("dateDetail").innerHTML = `<strong>${viDate(date)}.</strong> Ngày âm: <strong>${lunar.day}/${lunar.month}/${lunar.year}${lunar.leap ? " (tháng nhuận)" : ""}</strong>. ${milestone ? `<span>${milestone}</span>` : ""}`;
  }
  $("prevMonth").addEventListener("click", () => { calendarMonth--; if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; } selectedISO = ""; renderCalendar(); });
  $("nextMonth").addEventListener("click", () => { calendarMonth++; if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; } selectedISO = ""; renderCalendar(); });
  // Open the calendar on the current month for immediate usefulness.
  calendarYear = today.getFullYear(); calendarMonth = today.getMonth(); renderCalendar();

  // Wishes
  const wishes = {
    family: [
      "Chúc gia đình mình năm mới bình an, mạnh khỏe, nhà luôn đầy ắp tiếng cười và mỗi ngày đều có điều đáng mong chờ.",
      "Năm mới chúc ông bà, cha mẹ luôn dồi dào sức khỏe, tâm an vui vẻ; cả nhà mình mãi là nơi ấm áp nhất để trở về.",
      "Mong năm mới mang đến cho gia đình thật nhiều sức khỏe, thuận hòa và những bữa cơm sum vầy trọn vẹn."
    ],
    friends: [
      "Chúc bạn năm mới nhiều năng lượng, gặp đúng cơ hội, làm điều mình thích và luôn có người tốt đồng hành.",
      "Năm mới chúc bạn tiền vào như nước, niềm vui đầy túi, kế hoạch nào cũng tiến triển và lúc nào cũng rạng rỡ!",
      "Chúc tình bạn mình vẫn bền lâu, năm mới thêm nhiều chuyến đi hay, câu chuyện vui và kỷ niệm đáng nhớ."
    ],
    work: [
      "Chúc bạn năm mới sức khỏe dồi dào, công việc hanh thông, nhiều ý tưởng hay và gặt hái thành quả xứng đáng.",
      "Chúc năm mới nhiều cơ hội tốt, dự án thuận lợi, đồng đội tuyệt vời và mỗi nỗ lực đều được ghi nhận.",
      "Kính chúc anh/chị cùng gia đình một năm mới an khang, hạnh phúc; công việc phát triển và vạn sự như ý."
    ],
    love: [
      "Năm mới mong chúng ta vẫn cùng nhau đi qua những ngày bình thường bằng thật nhiều yêu thương và kiên nhẫn.",
      "Chúc người thương một năm bình an, nhiều niềm vui và luôn nhớ rằng có người mong bạn hạnh phúc mỗi ngày.",
      "Điều ước đầu năm của mình giản dị thôi: cả hai đều khỏe mạnh, lòng nhẹ nhàng và có thêm thật nhiều ngày đẹp bên nhau."
    ]
  };
  let currentWish = "family", lastWishIndex = -1;
  function chooseWish(forceNew = false) {
    const options = wishes[currentWish];
    let index = Math.floor(Math.random() * options.length);
    if (forceNew && options.length > 1) while (index === lastWishIndex) index = Math.floor(Math.random() * options.length);
    lastWishIndex = index; $("wishText").textContent = options[index]; $("copyStatus").textContent = "";
  }
  document.querySelectorAll(".wish-tab").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".wish-tab").forEach(b => b.classList.toggle("active", b === button));
    currentWish = button.dataset.wish; lastWishIndex = -1; chooseWish();
  }));
  $("newWish").addEventListener("click", () => chooseWish(true));
  $("copyWish").addEventListener("click", async () => {
    const text = $("wishText").textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement("textarea"); area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
        document.body.appendChild(area); area.select(); const ok = document.execCommand("copy"); area.remove();
        if (!ok) throw new Error("Copy failed");
      }
      $("copyStatus").textContent = "Đã sao chép lời chúc — gửi yêu thương thôi! 🌸";
    } catch { $("copyStatus").textContent = "Không sao chép tự động được. Bạn hãy chọn và sao chép lời chúc thủ công nhé."; }
  });

  // Red-envelope budget calculator
  function calculateLixi(event) {
    if (event) event.preventDefault();
    const people = Math.max(0, Math.floor(Number($("recipientCount").value) || 0));
    const each = Math.max(0, Number($("amountPerPerson").value) || 0);
    const extra = Math.max(0, Number($("extraBudget").value) || 0);
    const subtotal = people * each, total = subtotal + extra;
    $("lixiTotal").textContent = money(total);
    $("lixiBreakdown").textContent = `${money(subtotal)} tiền lì xì (${people.toLocaleString("vi-VN")} người) + ${money(extra)} dự phòng`;
  }
  $("lixiForm").addEventListener("submit", calculateLixi);
  ["recipientCount", "amountPerPerson", "extraBudget"].forEach(id => $(id).addEventListener("input", calculateLixi));

  // Memory matching game
  const symbols = ["🌸", "🧧", "🍊", "🏮", "🐑", "✨"];
  let deck = [], firstCard = null, secondCard = null, locked = false, moves = 0, matches = 0, hideTimeout = null;
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; }
    return array;
  }
  function startGame() {
    if (hideTimeout) clearTimeout(hideTimeout);
    deck = shuffle([...symbols, ...symbols].map((symbol, index) => ({ symbol, key: `${symbol}-${index}`, revealed: false, matched: false })));
    firstCard = secondCard = null; locked = false; moves = matches = 0;
    $("moveCount").textContent = moves; $("matchCount").textContent = `${matches}/${symbols.length}`;
    $("gameMessage").textContent = "Lật hai thẻ để tìm cặp giống nhau!";
    const grid = $("memoryGrid"); grid.innerHTML = "";
    deck.forEach((card, index) => {
      const button = document.createElement("button"); button.type = "button"; button.className = "memory-card";
      button.setAttribute("aria-label", `Thẻ ${index + 1}, chưa lật`); button.textContent = "✿";
      button.addEventListener("click", () => flipCard(index, button)); grid.appendChild(button);
    });
  }
  function flipCard(index, button) {
    const card = deck[index];
    if (locked || card.revealed || card.matched) return;
    card.revealed = true; button.classList.add("revealed"); button.textContent = card.symbol; button.setAttribute("aria-label", `Thẻ ${index + 1}: ${card.symbol}`);
    if (!firstCard) { firstCard = { card, button }; return; }
    secondCard = { card, button }; moves++; $("moveCount").textContent = moves;
    if (firstCard.card.symbol === secondCard.card.symbol) {
      firstCard.card.matched = secondCard.card.matched = true;
      firstCard.button.classList.remove("revealed"); secondCard.button.classList.remove("revealed");
      firstCard.button.classList.add("matched"); secondCard.button.classList.add("matched");
      firstCard.button.disabled = secondCard.button.disabled = true;
      matches++; $("matchCount").textContent = `${matches}/${symbols.length}`;
      firstCard = secondCard = null;
      if (matches === symbols.length) $("gameMessage").textContent = `Xuân phát lộc! Bạn hoàn thành trong ${moves} lượt. 🎉`;
      else $("gameMessage").textContent = "Tìm được một cặp rồi! Tiếp tục nhé 🌸";
    } else {
      locked = true; $("gameMessage").textContent = "Chưa trùng rồi — thử cặp khác nhé!";
      hideTimeout = setTimeout(() => {
        [firstCard, secondCard].forEach(item => {
          item.card.revealed = false; item.button.classList.remove("revealed"); item.button.textContent = "✿";
          item.button.setAttribute("aria-label", "Thẻ chưa lật");
        });
        firstCard = secondCard = null; locked = false;
      }, 850);
    }
  }
  $("restartGame").addEventListener("click", startGame);
  startGame();


  // Bầu cua: virtual dice, no betting.
  const bauFaces={"bầu":"🍐","cua":"🦀","tôm":"🦐","cá":"🐟","gà":"🐓","nai":"🦌"};let chosenAnimal="bầu";
  $("bauCuaOptions").querySelectorAll(".bau-cua-choice").forEach(b=>b.addEventListener("click",()=>{chosenAnimal=b.dataset.animal;$("bauCuaOptions").querySelectorAll(".bau-cua-choice").forEach(x=>x.classList.toggle("selected",x===b));}));
  $("rollBauCua").addEventListener("click",()=>{const keys=Object.keys(bauFaces);const result=Array.from({length:3},()=>{const animal=keys[Math.floor(Math.random()*keys.length)];return {animal,emoji:bauFaces[animal]};});$("bauCuaResults").innerHTML=result.map(x=>`<span title="${x.animal}">${x.emoji}</span>`).join("");const hits=result.filter(x=>x.animal===chosenAnimal).length;$("bauCuaMessage").textContent=hits?`Hên quá! ${bauFaces[chosenAnimal]} ${chosenAnimal} xuất hiện ${hits} lần. 🌸`:`Lần này chưa có ${chosenAnimal}. Chúc bạn may mắn lượt sau!`;});
  // Kéo co speed challenge.
  let tugTimer=null,tugCount=0,tugSeconds=10,tugActive=false;function finishTug(msg){if(tugTimer)clearInterval(tugTimer);tugTimer=null;tugActive=false;$("startTug").textContent="Chơi lại";$("tugMessage").textContent=msg;}
  $("startTug").addEventListener("click",()=>{if(tugActive){tugCount++;$("tugCount").textContent=tugCount;$("tugProgress").style.width=`${Math.min(100,50+tugCount*2.5)}%`;if(tugCount>=20)finishTug("Thắng rồi! Đội bạn kéo co cực khỏe! 🎉");return;}if(tugTimer)clearInterval(tugTimer);tugCount=0;tugSeconds=10;tugActive=true;$("tugCount").textContent="0";$("tugTime").textContent="10";$("tugProgress").style.width="50%";$("tugMessage").textContent="Nhanh tay bấm nút để kéo dây về phía mình!";$("startTug").textContent="KÉO! KÉO! KÉO!";tugTimer=setInterval(()=>{tugSeconds--;$("tugTime").textContent=tugSeconds;if(tugSeconds<=0&&tugActive)finishTug("Hết giờ rồi! Bấm chơi lại để thử sức lần nữa.");},1000);});
  // Simplified Ô ăn quan-inspired stone collection mini-game.
  let quanScore=0,quanTurns=5,quanPits=[2,3,1,4,2];function renderQuan(){ $("quanBoard").querySelectorAll(".quan-pit").forEach(b=>{const i=Number(b.dataset.pit),n=quanPits[i];b.innerHTML=`${n?"🪨".repeat(n):"✨"}<span>Ô ${i+1}</span>`;b.disabled=!n||quanTurns===0||quanScore>=10;});$("quanScore").textContent=quanScore;$("quanTurns").textContent=quanTurns;}
  $("quanBoard").querySelectorAll(".quan-pit").forEach(b=>b.addEventListener("click",()=>{const i=Number(b.dataset.pit);if(!quanPits[i]||quanTurns<=0||quanScore>=10)return;const n=quanPits[i];quanPits[i]=0;quanScore+=n;quanTurns--;renderQuan();$("quanMessage").textContent=quanScore>=10?`Giỏi quá! Bạn nhặt được ${quanScore} viên sỏi. 🎉`:quanTurns===0?`Bạn nhặt được ${quanScore} viên. Bấm chơi lại để thử lần nữa!`:`Nhặt được ${n} viên sỏi! Chọn ô tiếp theo nào.`;}));
  $("resetQuan").addEventListener("click",()=>{quanScore=0;quanTurns=5;quanPits=[2,3,1,4,2];$("quanMessage").textContent="Chọn một ô để bắt đầu!";renderQuan();});renderQuan();
  // Lucky envelopes: pretend prizes only; no real money or payout.
  const prizeFormat=n=>`${Number(n).toLocaleString("vi-VN")} ₫`;let envelopeOpened=false;
  $("envelopePickGrid").querySelectorAll(".pick-envelope").forEach(b=>b.addEventListener("click",()=>{if(envelopeOpened)return;envelopeOpened=true;const prize=Number(b.dataset.prize);$("envelopePickGrid").querySelectorAll(".pick-envelope").forEach(x=>{x.disabled=true;x.classList.toggle("opened",x===b);});const jackpot=prize===1000000000;$("jackpotResult").innerHTML=`<div class="jackpot-result-icon">${jackpot?"🎉✨🧧":"🧧🌸"}</div><p>${jackpot?"ĐẠI PHÁT! BẠN ĐÃ TRÚNG JACKPOT ẢO!":"LỘC XUÂN CỦA BẠN"}</p><strong>${prizeFormat(prize)}</strong><span>${jackpot?"Trúng 1 tỷ may mắn trong trò chơi! Chúc mừng năm mới!":"Một chút lộc xuân, thật nhiều niềm vui. Chúc mừng năm mới!"}</span>`;b.querySelector("small").textContent=jackpot?"TRÚNG 1 TỶ!":"Đã bóc";}));
  $("resetEnvelopes").addEventListener("click",()=>{envelopeOpened=false;const buttons=Array.from($("envelopePickGrid").querySelectorAll(".pick-envelope"));const prizes=buttons.map(b=>Number(b.dataset.prize));shuffle(prizes);buttons.forEach((b,i)=>{b.dataset.prize=String(prizes[i]);b.disabled=false;b.classList.remove("opened");b.querySelector("small").textContent=i===7?"Phong bao bí ẩn":`Phong bao ${i+1}`;});$("jackpotResult").innerHTML='<div class="jackpot-result-icon">✨</div><p>Chọn một phong bao bất kỳ</p><strong>Biết đâu là 1.000.000.000 ₫!</strong><span>Chúc bạn năm mới nhiều niềm vui và may mắn.</span>';});


  // Decorative snow/blossom particles fall only along the two page edges.
  const particleSets = [
    { id: "fallingLeft", chars: ["❄", "✿", "✧", "❅"] },
    { id: "fallingRight", chars: ["❄", "✿", "❀", "✧"] }
  ];
  particleSets.forEach(set => {
    const host = $(set.id);
    if (!host) return;
    for (let i = 0; i < 14; i++) {
      const particle = document.createElement("span");
      particle.className = "fall-particle";
      particle.textContent = set.chars[Math.floor(Math.random() * set.chars.length)];
      particle.style.left = `${8 + Math.random() * 80}%`;
      particle.style.animationDuration = `${8 + Math.random() * 12}s`;
      particle.style.animationDelay = `${-Math.random() * 18}s`;
      particle.style.fontSize = `${10 + Math.random() * 13}px`;
      particle.style.setProperty("--drift", `${Math.round(Math.random() * 55 - 27)}px`);
      host.appendChild(particle);
    }
  });

  // Random lucky numbers for entertainment only; no prediction or betting advice.
  const drawLuckyNumber = $("drawLuckyNumber");
  const drawVietlottNumbers = $("drawVietlottNumbers");
  if (drawLuckyNumber && drawVietlottNumbers) {
    let revealTimer;
    const card = document.querySelector(".lucky-number-card");
    const display = $("luckyNumberDisplay");
    const vietlottDisplay = $("vietlottNumbersDisplay");
    const message = $("luckyNumberMessage");
    const label = $("luckyNumberLabel");
    const deities = $("fortuneDeity");
    const buttons = [drawLuckyNumber, drawVietlottNumbers];

    function runLuckyReveal(mode) {
      let numbers;
      if (mode === "vietlott") {
        const pool = Array.from({ length: 55 }, (_, i) => i + 1);
        numbers = [];
        while (numbers.length < 6) {
          const index = Math.floor(Math.random() * pool.length);
          numbers.push(pool.splice(index, 1)[0]);
        }
        numbers.sort((a, b) => a - b);
      } else {
        numbers = [Math.floor(Math.random() * 100).toString().padStart(2, "0")];
      }

      window.clearTimeout(revealTimer);
      card.classList.remove("charging", "reveal", "number-explosion");
      card.classList.add("charging");
      buttons.forEach(button => { button.disabled = true; });
      drawLuckyNumber.textContent = "✨ Thần Tài đang ban lộc...";
      drawVietlottNumbers.textContent = "✨ Đang chuẩn bị bộ số...";
      display.textContent = "??";
      display.hidden = mode === "vietlott";
      vietlottDisplay.hidden = mode !== "vietlott";
      vietlottDisplay.innerHTML = "";
      label.textContent = mode === "vietlott" ? "BỘ SỐ NGẪU NHIÊN 6/55" : "CON SỐ LẤY HÊN CỦA BẠN";
      display.setAttribute("aria-label", "Đang chuẩn bị tiết lộ con số may mắn");
      deities.setAttribute("aria-hidden", "true");
      message.textContent = "Ánh vàng hội tụ, Thần Tài sắp xuất hiện...";

      // Keep the golden flash over the card for five seconds before revealing the figures and numbers.
      revealTimer = window.setTimeout(() => {
        const blessings = [
          "Thần Tài gửi bạn một lời chúc bình an 🌸",
          "Lấy may đầu xuân — vui vẻ là lộc lớn nhất ✨",
          "Chúc năm mới đủ đầy, sức khỏe và thuận hòa 🧧",
          "Một bộ số ngẫu nhiên, một lời chúc thật lành 🌟",
          "Xuân mới rộn ràng, vạn sự hanh thông 🍀"
        ];
        card.classList.remove("charging");
        card.classList.add("reveal");
        deities.setAttribute("aria-hidden", "false");
        message.textContent = blessings[Math.floor(Math.random() * blessings.length)];
        if (mode === "vietlott") {
          vietlottDisplay.innerHTML = numbers.map(n => `<span class="vietlott-number-ball">${String(n).padStart(2, "0")}</span>`).join("");
          vietlottDisplay.setAttribute("aria-label", `Bộ sáu số ngẫu nhiên: ${numbers.join(", ")}`);
        } else {
          display.textContent = numbers[0];
          display.setAttribute("aria-label", `Con số may mắn: ${numbers[0]}`);
        }
        // Let the two Thần Tài figures appear first, then burst the selected result into view.
        window.setTimeout(() => card.classList.add("number-explosion"), 650);
        buttons.forEach(button => { button.disabled = false; });
        drawLuckyNumber.textContent = "✨ Xin số may mắn";
        drawVietlottNumbers.textContent = "🎟️ Tạo bộ số ngẫu nhiên 6/55";
      }, 5000);
    }

    drawLuckyNumber.addEventListener("click", () => runLuckyReveal("lucky"));
    drawVietlottNumbers.addEventListener("click", () => runLuckyReveal("vietlott"));
  }

  // Mobile navigation
  const menuToggle = $("menuToggle"), mainNav = $("mainNav");
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  });
  mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mainNav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
  }));
})();
