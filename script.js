const app=document.querySelector('#app'),toast=document.querySelector('#toast');
const STORE_KEY='jaruromung_lucky_pack_v3',DEBUG_PRIZE=null;
const ASSETS={closed:'assets/halloween_pack_closed.png',open:'assets/halloween_pack_open.png',top:'assets/halloween_pack_top_piece.png',back:'assets/card_back.png',sparkles:'assets/sparkles.png',miss:'assets/card_lose.png',mbar:'ChatGPT 이미지 2026년 10월 4일 오후 07_34_20-1.png',drink:'ChatGPT 이미지 2026년 10월 4일 오후 07_34_23-2.png',pup:'ChatGPT 이미지 2026년 10월 4일 오후 07_34_27-3.png',tteok:'ChatGPT 이미지 2026년 10월 4일 오후 07_34_30-4.png',entry:'ChatGPT 이미지 2026년 10월 4일 오후 07_34_33-5.png',mbarProduct:'assets/product_mbar.png',drinkProduct:'assets/product_drink.png',pupProduct:'assets/product_pup.png',tteokProduct:'assets/product_tteok.png',entryProduct:'assets/product_entry.png',sadDog:'assets/product_sad_dog.png',thought:'assets/product_thought.png'};
const prizes=[{id:'miss',name:'꽝',weight:42,win:false,cardAsset:ASSETS.miss,productAsset:ASSETS.sadDog,title:'아쉽지만',subtitle:'다음 기회에 만나요!',detail:'다음에도 좋은 선물이 기다리고 있어요!\n내일 다시 도전해보세요 🐾'},{id:'mbar',name:'멍바 1개',weight:25,cardAsset:ASSETS.mbar,productAsset:ASSETS.mbarProduct,title:'축하합니다! 🎉',subtitle:'멍바 당첨',detail:'사랑하는 반려견을 위한 특별한 간식이에요.\n직원에게 이 화면을 보여주세요.\n\n※ 개별 포장된 반려견 간식 1개 제공'},{id:'drink',name:'음료 1잔',weight:15,cardAsset:ASSETS.drink,productAsset:ASSETS.drinkProduct,title:'축하합니다! 🎉',subtitle:'음료 1잔 당첨',detail:'이용 가능한 음료는 매장 운영 기준에 따라 제공됩니다.'},{id:'pup',name:'멍푸치노 1잔',weight:12,cardAsset:ASSETS.pup,productAsset:ASSETS.pupProduct,title:'축하합니다! 🎉',subtitle:'멍푸치노 당첨',detail:'우리 아이를 위한 특별한 음료예요.\n직원에게 이 화면을 보여주세요.'},{id:'tteok',name:'떡볶이 1인분',weight:2,cardAsset:ASSETS.tteok,productAsset:ASSETS.tteokProduct,title:'축하합니다! 🎉',subtitle:'떡볶이 당첨',detail:'직원 확인 후 이용할 수 있습니다.'},{id:'entry',name:'무료 입장권',weight:4,rare:true,cardAsset:ASSETS.entry,productAsset:ASSETS.entryProduct,title:'축하합니다! 🎉',subtitle:'무료 입장권 당첨',detail:'보호자 1인 + 반려견 1견 무료 입장권\n\n• 추가 보호자 및 반려견 정상요금\n• 당일 운영 상황에 따라 이용 제한 가능\n• 직원 확인 후 사용 가능'}];
let isOpening=false,activePhone='';const wait=ms=>new Promise(r=>setTimeout(r,ms));
function koreaDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}function phoneKey(phone){let h=2166136261;for(const c of phone){h=Math.imul(h^c.charCodeAt(0),16777619)}return(h>>>0).toString(36)}function today(phone){try{const d=JSON.parse(localStorage.getItem(STORE_KEY));return d?.date===koreaDate()?d.entries?.[phoneKey(phone)]||null:null}catch{return null}}function save(phone,p,c){let d;try{d=JSON.parse(localStorage.getItem(STORE_KEY))}catch{}if(d?.date!==koreaDate())d={date:koreaDate(),entries:{}};d.entries[phoneKey(phone)]={prizeId:p.id,code:c};localStorage.setItem(STORE_KEY,JSON.stringify(d))}function drawPrize(){const debugMap={mungbar:'mbar',drink:'drink',puppuccino:'pup',tteokbokki:'tteok','free-entry':'entry',lose:'miss'};if(DEBUG_PRIZE)return prizes.find(p=>p.id===(debugMap[DEBUG_PRIZE]||DEBUG_PRIZE));let n=Math.random()*100;return prizes.find(p=>(n-=p.weight)<0)||prizes[0]}function coupon(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return'JRM-'+Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join('')}
function screen(html,cls=''){app.className='app-shell '+cls;app.innerHTML=html;window.scrollTo(0,0);decorateHalloweenScreen()}function note(t){toast.textContent=t;toast.classList.add('is-visible');setTimeout(()=>toast.classList.remove('is-visible'),1800)}function brand(){return'<div class="brand">🐾 <b>자유로멍</b><small>반려견과 함께하는 행복한 시간</small></div>'}function preload(){Object.values(ASSETS).forEach(src=>{const i=new Image();i.src=src})}
function showHome(){
  screen(`<section class="screen home">${brand()}<div class="hero"><h1>오늘의 럭키팩</h1><p>하루에 한 번,<br>어떤 선물이 기다리고 있을까요?</p></div><img class="home-pack" src="${ASSETS.closed}" alt="자유로멍 럭키팩"><form class="home-phone" id="phoneForm"><label for="phone">휴대폰 번호</label><input id="phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="13" placeholder="010-1234-5678" aria-describedby="phoneError"><p id="phoneError" class="phone-error" role="status"></p><button class="button primary" id="open" type="submit">🎃 럭키팩 열기</button><p class="hint">하루 1회 참여할 수 있어요</p><small class="phone-privacy">번호 원문은 저장하지 않고,<br>오늘 참여 여부 확인에만 사용됩니다.</small></form></section>`);
  const input=document.querySelector('#phone'),form=document.querySelector('#phoneForm'),button=document.querySelector('#open'),error=document.querySelector('#phoneError');
  input.oninput=()=>{const digits=input.value.replace(/\D/g,'').slice(0,11);input.value=digits.replace(/(\d{3})(\d{0,4})(\d{0,4})/,(_,a,b,c)=>[a,b,c].filter(Boolean).join('-'));error.textContent='';input.removeAttribute('aria-invalid')};
  form.onsubmit=async event=>{event.preventDefault();if(isOpening||button.disabled)return;const phone=input.value.replace(/\D/g,'');if(!/^01[016789]\d{7,8}$/.test(phone)){error.textContent='휴대폰 번호를 확인해주세요.';input.setAttribute('aria-invalid','true');input.focus();return}activePhone=phone;if(today(phone)){showDone(phone);return}button.disabled=true;input.blur();try{await startPackOpening(phone)}catch(errorCause){isOpening=false;showHome();document.querySelector('#phoneError').textContent='팩을 열지 못했어요. 다시 시도해주세요.';console.error(errorCause)}};
}

function openingMarkup(){return `<section class="screen opening"><p class="opening-copy">두근두근...<small>오늘의 럭키팩을 열고 있어요!</small></p><div id="stage" class="pack-stage"><div class="beam"></div><div class="pack-glow"></div><img class="pack-img closed" src="${ASSETS.closed}" alt=""><img class="pack-img opened" src="${ASSETS.open}" alt=""><img class="top-piece" src="${ASSETS.top}" alt=""><img class="sparkles" src="${ASSETS.sparkles}" alt=""><div id="reward" class="reward-card"><div class="card-inner"><div class="card-face card-back-face"><img src="${ASSETS.back}" alt="럭키 카드 뒷면"></div><div class="card-face card-front-face"><img id="cardFront" alt="당첨 카드"></div></div></div></div></section>`}
async function startPackOpening(phone){if(isOpening)return;isOpening=true;const prize=drawPrize(),code=prize.win===false?null:coupon();if(!prize.cardAsset)throw new Error(`Missing cardAsset for prize: ${prize.id}`);preload();await HalloweenAudio.ready();await mountOpeningFromHome();const stage=document.querySelector('#stage'),front=document.querySelector('#cardFront');front.src=prize.cardAsset;try{await front.decode?.()}catch{throw new Error(`Unable to load cardAsset for prize: ${prize.id}`)}await playPackShake(stage);await playPackTear(stage);await playLightBurst(stage,prize);await playCardRise(stage);await wait(330);await playCardFlip(stage,prize);await wait(prize.rare?1450:1200);save(phone,prize,code);isOpening=false;renderResult(prize,code)}
async function playPackShake(s){HalloweenAudio.play('shake');s.classList.add('shaking');await wait(520);s.classList.remove('shaking')}async function playPackTear(s){HalloweenAudio.play('tear');s.classList.add('torn');await wait(300);spawnPackSmoke(s);HalloweenAudio.play('poof');await wait(100);HalloweenAudio.play('witch');await wait(160)}async function playLightBurst(s,p){HalloweenAudio.play('light');s.classList.add('lit');await wait(40)}async function playCardRise(s){HalloweenAudio.play('rise');s.classList.add('card-risen');await wait(760)}async function playCardFlip(s,p){HalloweenAudio.play('flip');s.classList.add('card-flipped');if(p.rare)s.classList.add('rare');await wait(640);if(p.win!==false)s.classList.add('reward-revealed');HalloweenAudio.play('reward',p)}
function renderResult(p,code){const win=p.win!==false,c=win?`<div class="coupon"><b>${code}</b><button id="copy">복사</button></div><button class="button primary" id="save">쿠폰 저장하기</button>`:'';const visual=p.id==='miss'?`<div class="lose-visual"><img class="thought" src="${ASSETS.thought}" alt=""><img src="${p.productAsset}" alt="슬픈 강아지"></div>`:`<img class="product-visual product-${p.id}" src="${p.productAsset}" alt="${p.name}">`;screen(`<section class="screen result ${p.rare?'rare-result':''} ${p.id==='miss'?'lose-result':''}"><p>${p.title}</p><h1>${p.subtitle}</h1>${visual}<article><h2>${p.name}</h2><p>${p.detail.replace(/\n/g,'<br>')}</p>${c}</article><button class="button secondary" id="confirm">확인</button></section>`);document.querySelector('#confirm').onclick=()=>showDone(activePhone);if(win){const copy=async()=>{try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(code);note('쿠폰번호를 복사했어요!')}catch{note('복사하지 못했어요. 쿠폰번호를 직접 복사해주세요.')}};document.querySelector('#copy').onclick=copy;document.querySelector('#save').onclick=()=>downloadCoupon(p,code)}}
function showDone(phone){const r=today(phone),p=r&&prizes.find(x=>x.id===r.prizeId);screen(`<section class="screen done">${brand()}<div><h1>오늘의 럭키팩을<br>이미 열어보셨어요! 🐾</h1><p>내일 새로운 선물과 함께<br>다시 만나요.</p></div>${p?`<article><small>오늘 받은 선물</small><h2>${p.name}</h2>${p.win!==false?`<b>${r.code}</b>`:''}</article>`:''}<button class="button secondary" id="home">처음으로</button></section>`);document.querySelector('#home').onclick=showHome}preload();showHome();
async function mountOpeningFromHome() {
  const home=document.querySelector('.home'),pack=home.querySelector('.home-pack');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  home.classList.add('home-collapsing');
  await wait(reduced?0:300);
  const before=pack.getBoundingClientRect();
  const template=document.createElement('template');template.innerHTML=openingMarkup();
  const opening=template.content.firstElementChild;
  home.querySelector('.hero').remove();home.querySelector('.brand').remove();home.querySelector('.home-phone').remove();
  home.classList.remove('home','home-collapsing');home.classList.add('opening');
  home.append(...opening.childNodes);
  const target=home.querySelector('.closed');pack.className=target.className;target.replaceWith(pack);
  HalloweenAudio.syncScreen();
  const after=pack.getBoundingClientRect();
  if(!reduced&&pack.animate){await pack.animate([{transform:`translateX(-50%) translate(${before.left-after.left}px,${before.top-after.top}px) scale(${before.width/after.width})`},{transform:'translateX(-50%)'}],{duration:380,easing:'cubic-bezier(.2,.8,.2,1)'}).finished}
}
async function downloadCoupon(prize, code) {
  const button=document.querySelector('#save');
  if(!button||button.disabled||prize.win===false)return;
  button.disabled=true;button.textContent='쿠폰 이미지 만드는 중...';
  try {
    const image=new Image();image.src=prize.productAsset;
    await image.decode();
    await document.fonts.ready;
    const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1500;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('Canvas unavailable');
    const gradient=ctx.createLinearGradient(0,0,0,1500);
    gradient.addColorStop(0,prize.rare?'#24213f':'#e8f6ff');gradient.addColorStop(1,prize.rare?'#423151':'#fff5e8');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,900,1500);
    const font='"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
    const text=(value,y,size,color='#42291f',weight=700)=>{ctx.font=`${weight} ${size}px ${font}`;ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(value,450,y)};
    text('자유로멍 · JAYURO HALLOWEEN',85,30,prize.rare?'#ffe1a4':'#765348');
    text('축하합니다!',152,34,prize.rare?'#fff0db':'#42291f');
    text(prize.subtitle,215,52,prize.rare?'#fff0db':'#42291f');
    const scale=Math.min(590/image.naturalWidth,330/image.naturalHeight);
    const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
    ctx.drawImage(image,(900-width)/2,255+(330-height)/2,width,height);
    ctx.fillStyle='#fffdf8';ctx.beginPath();ctx.roundRect(60,620,780,790,32);ctx.fill();
    text(prize.name,695,46);
    text('쿠폰 번호',755,25,'#806455',500);
    ctx.fillStyle='#fff0eb';ctx.beginPath();ctx.roundRect(115,780,670,94,18);ctx.fill();
    text(code,843,43,'#9f4057');
    // Wrap Korean text by character, keeping explicit line breaks and conditions.
    ctx.font=`500 26px ${font}`;
    let y=922;
    for(const paragraph of prize.detail.split('\n')){
      let row='';
      for(const char of paragraph){if(ctx.measureText(row+char).width>660){text(row,y,26,'#806455',500);y+=37;row=''}row+=char}
      if(row){text(row,y,26,'#806455',500);y+=37}else y+=17;
    }
    text('발급일 '+koreaDate()+' · 직원에게 이 쿠폰을 보여주세요.',1371,22,'#927668',500);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG encoding failed')),'image/png'));
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`JAYURO-${prize.id}-${code}.png`;
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    note('쿠폰 이미지 다운로드를 시작했어요!');
  } catch(error) { console.error('Coupon download failed:',error);note('쿠폰을 저장하지 못했어요. 다시 시도해주세요.'); }
  finally {button.disabled=false;button.textContent='쿠폰 저장하기';}
}
