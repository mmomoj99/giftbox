/* Server drawing will replace drawPrize() later. The present version is deliberately local-only. */
const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const STORE_KEY = 'jaruromung_lucky_pack_v2';
const asset = (name) => encodeURI(name);
const ASSETS = {
  packSheet: asset('ChatGPT 이미지 2026년 10월 4일 오후 07_31_20-1.png'),
  cardSheet: asset('ChatGPT 이미지 2026년 10월 4일 오후 07_31_25-2.png'),
  sadSheet: asset('ChatGPT 이미지 2026년 10월 4일 오후 07_31_31-4.png'),
  mbar: asset('ChatGPT 이미지 2026년 10월 4일 오후 07_34_20-1.png'),
  drink: asset('ChatGPT 이미지 2026년 10월 4일 오후 07_34_23-2.png'),
  pup: asset('ChatGPT 이미지 2026년 10월 4일 오후 07_34_27-3.png'),
  tteok: asset('ChatGPT 이미지 2026년 10월 4일 오후 07_34_30-4.png'),
  entry: asset('ChatGPT 이미지 2026년 10월 4일 오후 07_34_33-5.png'),
};
const prizes = [
  { id:'miss', name:'꽝', weight:42, win:false, asset:ASSETS.sadSheet, title:'아쉽지만', subtitle:'다음 기회에 만나요!', detail:'다음에도 좋은 선물이 기다리고 있어요!\n내일 다시 도전해보세요 🐾' },
  { id:'mbar', name:'멍바 1개', weight:25, asset:ASSETS.mbar, title:'축하합니다!', subtitle:'🐾 멍바 당첨!', detail:'사랑하는 반려견을 위한 특별한 간식!\n직원에게 이 화면을 보여주세요.\n\n※ 개별 포장된 스틱형 반려견 간식 1개 제공' },
  { id:'drink', name:'음료 1잔', weight:15, asset:ASSETS.drink, title:'축하합니다!', subtitle:'음료 1잔 당첨!', detail:'이용 가능한 음료는\n매장 운영 기준에 따라 제공됩니다.' },
  { id:'pup', name:'멍푸치노 1잔', weight:12, asset:ASSETS.pup, title:'축하합니다!', subtitle:'🐾 멍푸치노 당첨!', detail:'우리 아이를 위한 특별한 음료!\n직원에게 이 화면을 보여주세요.' },
  { id:'tteok', name:'떡볶이 1인분', weight:2, asset:ASSETS.tteok, title:'축하합니다!', subtitle:'떡볶이 1인분 당첨!', detail:'직원 확인 후 이용할 수 있습니다.' },
  { id:'entry', name:'무료 입장권', weight:4, rare:true, asset:ASSETS.entry, title:'축하합니다!', subtitle:'🎉 무료 입장권 당첨!', detail:'보호자 1인 + 반려견 1견 무료 입장권\n\n• 보호자 1인 + 반려견 1견 기준입니다.\n• 추가 보호자 및 반려견은 정상요금이 적용됩니다.\n• 당일 운영 상황에 따라 이용이 제한될 수 있습니다.\n• 직원 확인 후 사용 가능합니다.' },
];
let busy = false;
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function getKoreaDateKey(){ return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
function getPhoneKey(phone){ let hash=2166136261; for(const char of phone){ hash^=char.charCodeAt(0); hash=Math.imul(hash,16777619); } return (hash>>>0).toString(36); }
function getTodayResult(phone){ try { const data=JSON.parse(localStorage.getItem(STORE_KEY)); return data?.date===getKoreaDateKey()&&phone ? data.entries?.[getPhoneKey(phone)]||null : null; } catch { return null; } }
function hasDrawnToday(phone){ return Boolean(getTodayResult(phone)); }
function saveTodayResult(phone,prize,code){ const date=getKoreaDateKey(); let data; try { data=JSON.parse(localStorage.getItem(STORE_KEY)); } catch { data=null; } if(data?.date!==date) data={date,entries:{}}; data.entries[getPhoneKey(phone)]={prizeId:prize.id,code}; localStorage.setItem(STORE_KEY,JSON.stringify(data)); }
function generateCouponCode(){ const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return `JRM-${Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}`; }
function drawPrize(){ let roll=Math.random()*prizes.reduce((sum,prize)=>sum+prize.weight,0); return prizes.find(prize=>(roll-=prize.weight)<0)||prizes[0]; }
function getPrizeCardAsset(prize){ return prize.asset; }
function findPrize(id){ return prizes.find(prize=>prize.id===id); }
function showToast(message){ toast.textContent=message; toast.classList.add('is-visible'); setTimeout(()=>toast.classList.remove('is-visible'),1800); }
function screen(content,className=''){ app.className=`app-shell ${className}`; app.innerHTML=content; window.scrollTo(0,0); }
function brand(){ return '<div class="brand"><span class="brand-paw">🐾</span><strong>자유로멍</strong><small>반려견과 함께하는 행복한 시간</small></div>'; }
let activePhone='';
function initApp(){ showHome(); }
function showHome(){ screen(`<section class="screen home-screen">${brand()}<div class="home-copy"><h1>오늘의 럭키팩</h1><p>하루에 한 번,<br>어떤 선물이 기다리고 있을까요?</p></div><div class="pack-crop home-pack" aria-label="자유로멍 럭키팩"></div><button class="button button-primary" id="openPack">🐾 카드팩 열기</button><p class="hint">하루 1회 참여할 수 있어요</p></section>`); document.querySelector('#openPack').addEventListener('click',showVerification); }
function showVerification(){ screen(`<section class="screen verify-screen"><header class="nav"><button id="goHome" aria-label="뒤로 가기">←</button><strong>🐾 자유로멍</strong><span></span></header><div class="verify-content"><h1>지금, 럭키팩을<br>열어볼까요?</h1><p>하루 1회 참여를 위해<br>휴대폰 번호를 입력해주세요.</p><label>휴대폰 번호<input id="phone" inputmode="numeric" maxlength="17" placeholder="010 - 1234 - 5678"></label><button class="button button-primary" id="startOpening">럭키팩 열기</button><small class="privacy">🔒 번호는 오늘 참여 여부 확인에만 사용되며, 이 기기에는 번호 원문을 저장하지 않습니다.</small></div></section>`); document.querySelector('#goHome').onclick=showHome; const phone=document.querySelector('#phone'); phone.addEventListener('input',()=>{const digits=phone.value.replace(/\D/g,'').slice(0,11);phone.value=digits.replace(/(\d{3})(\d{0,4})(\d{0,4})/,(_,a,b,c)=>[a,b,c].filter(Boolean).join(' - '));}); document.querySelector('#startOpening').onclick=()=>{const digits=phone.value.replace(/\D/g,'');if(digits.length!==11)return showToast('휴대폰 번호 11자리를 입력해주세요.');activePhone=digits;if(hasDrawnToday(activePhone))return showDone(activePhone);startPackOpening(activePhone);}; }
async function startPackOpening(phone){if(busy)return;busy=true;const prize=drawPrize();const code=prize.win===false?null:generateCouponCode();playPackShake();await wait(700);playPackTear();await wait(700);playPackLightBurst();await wait(550);playCardRise(prize);await wait(700);playCardFlip(prize);await wait(1450);saveTodayResult(phone,prize,code);busy=false;renderPrizeResult(prize,code);}
function openingShell(copy,extra=''){screen(`<section class="screen opening-screen ${extra}"><div class="opening-copy">${copy}</div><div class="pack-crop opening-pack"></div><div class="burst"></div><div class="sparkles" aria-hidden="true">✦ ✧ ✦ ✧ ✦</div><div id="revealCard" class="reveal-card"><div class="card-face card-back"><span>🐾</span><small>JARUROMUNG</small></div></div></section>`);}
function playPackShake(){openingShell('<strong>두근두근...</strong><span>오늘의 럭키팩을<br>열고 있어요!</span>','shake-step');}
function playPackTear(){const opening=document.querySelector('.opening-screen');opening.classList.remove('shake-step');opening.classList.add('tear-step');document.querySelector('.opening-copy').innerHTML='<strong>조금만 기다려주세요!</strong><span>행운을 꺼내고 있어요</span>';}
function playPackLightBurst(){const opening=document.querySelector('.opening-screen');opening.classList.remove('tear-step');opening.classList.add('light-step');document.querySelector('.opening-copy').innerHTML='<strong>오늘의 선물이 도착했어요!</strong>';}
function playCardRise(prize){document.querySelector('.opening-screen').classList.add('rise-step');const reveal=document.querySelector('#revealCard');reveal.innerHTML='<div class="card-face card-back"><span>🐾</span><small>JARUROMUNG<br>LUCKY CARD</small></div>';reveal.dataset.prize=prize.id;}
function playCardFlip(prize){const reveal=document.querySelector('#revealCard');reveal.innerHTML=`<div class="card-inner"><div class="card-face card-back"><span>🐾</span><small>JARUROMUNG<br>LUCKY CARD</small></div><div class="card-face card-front"><img src="${getPrizeCardAsset(prize)}" alt="${prize.name} 결과 카드"></div></div>`;requestAnimationFrame(()=>reveal.classList.add('flipped'));}
function renderPrizeCardReveal(prize){return `<img class="result-art" src="${getPrizeCardAsset(prize)}" alt="${prize.name} 당첨 카드">`;}
function renderPrizeResult(prize,code){const win=prize.win!==false;const coupon=win?`<div class="coupon"><span>쿠폰 번호</span><strong id="couponCode">${code}</strong><button id="copyCoupon">복사</button></div><button class="button button-primary" id="saveCoupon">▣ 쿠폰 저장하기</button>`:'';screen(`<section class="screen result-screen ${prize.rare?'rare-result':''} ${win?'winner':'not-winner'}"><div class="result-head"><p>${prize.title}</p><h1>${prize.subtitle}</h1></div><div class="result-art-wrap">${renderPrizeCardReveal(prize)}</div><article class="result-card"><h2>${prize.name}</h2><p>${prize.detail.replace(/\n/g,'<br>')}</p>${coupon}</article><button class="button button-plain" id="confirm">확인</button></section>`);document.querySelector('#confirm').onclick=()=>showDone(activePhone);if(win){document.querySelector('#copyCoupon').onclick=()=>copyCouponCode(code);document.querySelector('#saveCoupon').onclick=()=>{copyCouponCode(code);showToast('쿠폰번호를 복사해 저장했어요!');};}}
async function copyCouponCode(code){try{await navigator.clipboard.writeText(code);}catch{const input=document.createElement('input');input.value=code;document.body.append(input);input.select();document.execCommand('copy');input.remove();}showToast('쿠폰번호를 복사했어요!');}
function showDone(phone){const stored=getTodayResult(phone);const prize=stored&&findPrize(stored.prizeId);screen(`<section class="screen done-screen">${brand()}<div class="done-copy"><h1>오늘의 럭키팩을<br>이미 열어보셨어요! 🐾</h1><p>내일 새로운 선물과 함께<br>다시 만나요.</p></div>${prize?`<div class="today-gift"><span>오늘 받은 선물</span><strong>${prize.name}</strong>${prize.win!==false?`<small>${stored.code}</small>`:''}</div>`:''}<button class="button button-plain" id="backHome">처음으로</button><div class="dogs">🐶 🐾 🐶</div></section>`);document.querySelector('#backHome').onclick=showHome;}
initApp();
