/* confetti 이용: canvas-confetti를 CDN으로 불러왔습니다. */
/* 카카오 사용할 경우 Kakao.init("YOUR_JS_APP_KEY") 로 초기화하세요. */

const rewardBtn = document.getElementById("rewardBtn");
const loginBtn  = document.getElementById("loginBtn");
const giftWrap  = document.getElementById("giftWrap");
const giftClosed = document.getElementById("giftClosed");
const giftOpen = document.getElementById("giftOpen");
const rewardEl  = document.getElementById("reward");
const usageArea = document.getElementById("usageArea");
const msgEl     = document.getElementById("msg");
const pointsEl  = document.getElementById("points");

let animating = false;
let pendingReward = null;
let loggedIn = false;
let points = parseInt(localStorage.getItem("lucky_points") || "0", 10);
pointsEl.textContent = `포인트: ${points}`;

/* 보상 목록 */
const rewards = [
  { icon:"☕", name:"아메리카노 쿠폰", usage:"카운터에서 쿠폰 제시" },
  { icon:"🍖", name:"강아지 간식", usage:"현장에서 직원에게 수령" },
  { icon:"🎟️", name:"10% 할인권", usage:"결제 시 사용 가능" },
  { icon:"🐾", name:"무료 입장권", usage:"입장 시 제시" }
];

const TIMINGS = { pop:160, shake:740, openDelay:120, rewardPop:720 };

function delay(ms){ return new Promise(res => setTimeout(res, ms)); }
function pickReward(){ return rewards[Math.floor(Math.random()*rewards.length)]; }
function renderRewardInside(r){
  rewardEl.innerHTML = `<span class="icon">${r.icon}</span><div class="label">${r.name}</div>`;
  rewardEl.setAttribute("aria-hidden","false");
}

/* confetti burst helper */
function burstConfetti(){
  if (typeof confetti === "function") {
    // 몇 번의 작은 폭발을 섞어 자연스럽게
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

  // 1) 살짝 튀기기
  giftWrap.classList.add("pop");
  await delay(TIMINGS.pop);
  giftWrap.classList.remove("pop");

  // 2) 흔들기
  giftWrap.classList.add("shake");
  await delay(TIMINGS.shake);
  giftWrap.classList.remove("shake");

  // 3) 열기 -> 닫힌 이미지 사라지고 열린 이미지 보이도록
  giftWrap.classList.add("open");
  // 시각적 전환을 위해 이미지 opacity를 CSS로 제어 (이미 class open에 의해)
  await delay(TIMINGS.openDelay);

  // 4) 보상 내부에서 튀어나오기
  if(pendingReward){
    renderRewardInside(pendingReward);
    usageArea.textContent = pendingReward.usage;
    // 작은 delay 후 popUp 효과
    setTimeout(()=> {
      rewardEl.classList.add("popUp");
      // confetti
      burstConfetti();
    }, 60);
  }

  // 끝나면 animating 해제
  setTimeout(()=> { animating = false; }, TIMINGS.rewardPop + 80);
}

/* 보상 받기 클릭 */
rewardBtn.addEventListener("click", async () => {
  if(animating) return;
  pendingReward = pickReward();
  await playSequence();
  loginBtn.style.display = "inline-block";
  msgEl.textContent = `🎉 ${pendingReward.name} 당첨! (로그인하면 50P 적립됩니다.)`;
});

/* 로그인 처리(카카오 SDK 있으면 실제 로그인, 없으면 대체) */
loginBtn.addEventListener("click", () => {
  // 실제 Kakao 사용 가능 시
  if(window.Kakao && Kakao.Auth && typeof Kakao.Auth.login === "function"){
    Kakao.Auth.login({
      success: function(authObj){
        Kakao.API.request({
          url: "/v2/user/me",
          success: function(res){
            const name = res.kakao_account?.profile?.nickname || "회원";
            handlePostLogin("kakao_" + (res.id||""), name);
          },
          fail: function(err){ console.error("Kakao API fail:", err); alert("카카오 사용자 정보 조회 실패"); }
        });
      },
      fail: function(err){ console.error("Kakao login fail:", err); alert("카카오 로그인 실패"); }
    });
    return;
  }

  // 테스트/대체 로그인 (간단한 닉네임 프롬프트)
  const fake = prompt("테스트 로그인 — 닉네임을 입력하세요:");
  if(!fake) return;
  handlePostLogin("local_" + fake, fake);
});

function handlePostLogin(uid, nickname){
  if(!pendingReward){
    msgEl.textContent = "먼저 보상을 뽑아 주세요.";
    return;
  }
  if(loggedIn){
    msgEl.textContent = "이미 로그인되어 적립되었습니다.";
    return;
  }
  // 포인트 적립 50P
  points += 50;
  localStorage.setItem("lucky_points", String(points));
  pointsEl.textContent = `포인트: ${points}`;
  msgEl.textContent = `환영합니다, ${nickname}님! 50P 적립되었습니다.`;
  loggedIn = true;
  loginBtn.style.display = "none";

  // (확장) 서버/Firebase 전송 지점: sendToServer({uid, reward: pendingReward, points});
  pendingReward = null;
}
