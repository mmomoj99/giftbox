/* confetti 이용: canvas-confetti를 CDN으로 불러왔습니다. */
/* 카카오 사용할 경우 Kakao.init("YOUR_JS_APP_KEY") 로 초기화하세요. */

const rewardBtn = document.getElementById("rewardBtn");
// const loginBtn  = document.getElementById("loginBtn"); // 주석 처리
const giftWrap  = document.getElementById("giftWrap");
const giftClosed = document.getElementById("giftClosed");
const giftOpen = document.getElementById("giftOpen");
const rewardEl  = document.getElementById("reward");
const usageArea = document.getElementById("usageArea");
const msgEl     = document.getElementById("msg");
// const pointsEl  = document.getElementById("points"); // 주석 처리

let animating = false;
let pendingReward = null;
/*
// 포인트 및 로그인 관련 변수 모두 주석 처리
let loggedIn = false;
let points = parseInt(localStorage.getItem("lucky_points") || "0", 10);
pointsEl.textContent = `포인트: ${points}`;
*/

/* 보상 목록 및 확률 (weight 기반) */
const rewards = [
    // weight가 높을수록 당첨 확률이 높습니다.
  { icon:"☕", name:"아메리카노 쿠폰", usage:"카운터에서 쿠폰 제시", weight: 25 }, // 25% 비율
  { icon:"🍖", name:"강아지 간식", usage:"현장에서 직원에게 수령", weight: 15 },  // 10% 비율 (가장 낮은 확률)
  { icon:"🎟️", name:"떡볶이 단품 쿠폰", usage:"카운터에서 쿠폰 제시", weight: 5 },  // 40% 비율 (가장 높은 확률)
  { icon:"⛺", name:"글램핑 2시간", usage:"사전 예약 필수 ", weight: 2 },  
  { icon:"🐾", name:"반려견 무료 입장권", usage:"입장 시 제시", weight: 55 }  // 25% 비율
];
// 이 예시에서 전체 weight 합은 25 + 10 + 40 + 25 = 100 이므로,
// 각각 아메리카노 25%, 간식 10%, 할인권 40%, 입장권 25% 확률로 뽑힙니다.
// 합이 100이 아니어도 상대적인 가중치로 작동합니다.

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

/**
 * 가중치(weight)에 따라 보상을 선택하는 함수
 * @returns {Object} 선택된 보상 객체와 고유 쿠폰 번호
 */
function pickReward(){
    const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
    let randomNum = Math.random() * totalWeight; // 0과 totalWeight 사이의 난수 생성
    
    let chosenReward = null;
    
    // 난수가 어느 weight 구간에 속하는지 확인
    for (const reward of rewards) {
        if (randomNum < reward.weight) {
            chosenReward = reward;
            break;
        }
        randomNum -= reward.weight;
    }

    // 안전장치 (혹시라도 선택이 안 되었을 경우 첫 번째 보상 선택)
    if (!chosenReward) {
        chosenReward = rewards[0];
    }
    
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

  if (lastParticipation === today) {
    msgEl.textContent = "오늘은 이미 참여했습니다. 내일 다시 시도해주세요!";
    return;
  }
  
  pendingReward = pickReward();
  await playSequence();
  
 // msgEl.textContent = `🎉 ${pendingReward.name} 당첨! 쿠폰번호: ${pendingReward.couponCode}`; // 메시지에 쿠폰번호 포함
  msgEl.textContent = `🎉 ${pendingReward.name} 당첨!`; // 메시지에 쿠폰번호 포함
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

