/* confetti 이용: canvas-confetti를 CDN으로 불러왔습니다. */
/* 카카오 사용할 경우 Kakao.init("YOUR_JS_APP_KEY") 로 초기화하세요. */

const rewardBtn = document.getElementById("rewardBtn");
// const loginBtn  = document.getElementById("loginBtn"); // 주석 처리
const giftWrap  = document.getElementById("giftWrap");
const giftClosed = document.getElementById("giftClosed");
const giftOpen = document.getElementById("giftOpen");
const rewardEl  = document.getElementById("reward");
const usageArea = document.getElementById("usageArea");
const msgEl     = document.getElementById("msg");
// const pointsEl  = document.getElementById("points"); // 주석 처리

let animating = false;
let pendingReward = null;
/*
// 포인트 및 로그인 관련 변수 모두 주석 처리
let loggedIn = false;
let points = parseInt(localStorage.getItem("lucky_points") || "0", 10);
pointsEl.textContent = `포인트: ${points}`;
*/

/* 보상 목록 */
const rewards = [
  { icon:"☕", name:"아메리카노 쿠폰", usage:"카운터에서 쿠폰 제시" },
  { icon:"🍖", name:"강아지 간식", usage:"현장에서 직원에게 수령" },
  { icon:"🎟️", name:"10% 할인권", usage:"결제 시 사용 가능" },
  { icon:"🐾", name:"무료 입장권", usage:"입장 시 제시" }
];

const TIMINGS = { pop:160, shake:740, openDelay:120, rewardPop:720 };

function delay(ms){ return new Promise(res => setTimeout(res, ms)); }

// === 고유 쿠폰 번호 생성 함수 추가 ===
function generateCouponCode(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
// ===================================

function pickReward(){
  const chosenReward = rewards[Math.floor(Math.random()*rewards.length)];
  // 선택된 보상에 고유 쿠폰 번호 추가
  return { ...chosenReward, couponCode: generateCouponCode() }; // 쿠폰 코드 추가
}

function renderRewardInside(r){
  // 쿠폰 코드를 포함하여 렌더링하도록 수정
  rewardEl.innerHTML = `
    <span class="icon">${r.icon}</span>
    <div class="label">${r.name}</div>
    <div class="coupon-code">${r.couponCode}</div> `;
  rewardEl.setAttribute("aria-hidden","false");
}

/* confetti burst helper */
function burstConfetti(){
  if (typeof confetti === "function") {
    confetti({ particleCount: 40, spread: 60, origin: { x: 0.5, y: 0.4 }});
    setTimeout(()=> confetti({ particleCount: 30, spread: 80, origin: { x: 0.3, y: 0.2 }}), 160);
    setTimeout(()=> confetti({ particleCount: 30, spread: 80, origin: { x: 0.7, y: 0.2 }}), 260);
  }
}

/* 전체 연출 시퀀스 */
async function playSequence(){
  if(animating) return;
  animating = true;
  msgEl.textContent = "";
  usageArea.textContent = "";
  rewardEl.classList.remove("popUp");
  giftWrap.classList.remove("open");

  giftWrap.classList.add("pop");
  await delay(TIMINGS.pop);
  giftWrap.classList.remove("pop");

  giftWrap.classList.add("shake");
  await delay(TIMINGS.shake);
  giftWrap.classList.remove("shake");

  giftWrap.classList.add("open");
  await delay(TIMINGS.openDelay);

  if(pendingReward){
    renderRewardInside(pendingReward);
    usageArea.textContent = pendingReward.usage;
    setTimeout(()=> {
      rewardEl.classList.add("popUp");
      burstConfetti();
    }, 60);
  }
  
  setTimeout(()=> { animating = false; }, TIMINGS.rewardPop + 80);
}

/* 보상 받기 클릭 */
rewardBtn.addEventListener("click", async () => {
  if(animating) return;

  const today = new Date().toISOString().split('T')[0];
  const lastParticipation = localStorage.getItem("lucky_box_last_date");

  /*if (lastParticipation === today) {
    msgEl.textContent = "견주님은 욕심쟁이!";
    return;
  }*/
  
  pendingReward = pickReward();
  await playSequence();
  
 // msgEl.textContent = `🎉 ${pendingReward.name} 당첨!쿠폰번호: ${pendingReward.couponCode}`; // 메시지에 쿠폰번호 포함
  msgEl.textContent = `🎉 ${pendingReward.name}`;
 localStorage.setItem("lucky_box_last_date", today);
});

/* 로그인 처리(카카오 SDK 있으면 실제 로그인, 없으면 대체) - 전체 주석 처리
loginBtn.addEventListener("click", () => {
  // ... (생략된 기존 로그인 관련 주석 처리 코드) ...
});

function handlePostLogin(uid, nickname){
  // ... (생략된 기존 로그인 관련 주석 처리 코드) ...
}
*/
