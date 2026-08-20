(function () {
  'use strict';
  const T = window.Tools, $ = id => document.getElementById(id);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clean = (s, n) => (String(s).replace(/[^01]/g, '') || '0').slice(-n).padStart(n, '0');
  const dec = b => parseInt(b, 2) || 0;
  const flip = b => [...b].map(c => c === '0' ? '1' : '0').join('');
  const addOne = b => {
    const n = b.length;
    const v = (dec(b) + 1) % Math.pow(2, n);
    return v.toString(2).padStart(n, '0');
  };
  const comp = b => addOne(flip(b));

  function bitline(box, str, cls) {
    $(box).innerHTML = [...str].map((c, i) =>
      '<div class="b' + (c === '1' ? ' on' : '') + (cls && cls[i] ? ' ' + cls[i] : '') + '">' + c + '</div>').join('');
  }

  /* ---------- STEP1 ---------- */
  let orig = '0110';
  function drawComp() {
    const n = orig.length;
    $('origBits').innerHTML = [...orig].map((c, i) =>
      '<div class="b click' + (c === '1' ? ' on' : '') + '" data-i="' + i + '">' + c + '</div>').join('');
    $('origBits').querySelectorAll('.b').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      orig = orig.slice(0, i) + (orig[i] === '0' ? '1' : '0') + orig.slice(i + 1);
      drawAll();
    }));
    const c = comp(orig);
    const sum = dec(orig) + dec(c);
    bitline('c1', orig);
    bitline('c2', c);
    bitline('c3', sum.toString(2).padStart(n + 1, '0'));
    const nt = $('compNote');
    nt.className = 'note ok';
    nt.innerHTML = '<span class="mono">' + orig + '</span>（10進法 ' + dec(orig) + '）の補数は <strong class="mono">' + c +
      '</strong>（' + dec(c) + '）。<br>足すと <span class="mono">' + sum.toString(2).padStart(n + 1, '0') +
      '</span> ＝ ' + sum + ' となり、<strong>' + n + '桁から' + (n + 1) + '桁にくり上がります</strong>。' +
      'これが「足すと桁が1つ増える最小の数」ということです。';
  }

  /* ---------- STEP2 ---------- */
  let fstep = 0;
  function drawFlip() {
    bitline('s1', orig);
    const f = flip(orig), c = comp(orig);
    if (fstep >= 1) bitline('s2', f, [...f].map(() => 'flip')); else $('s2').innerHTML = '';
    if (fstep >= 2) bitline('s3', c); else $('s3').innerHTML = '';
    const n = $('flipNote');
    n.className = 'note ' + (fstep >= 2 ? 'ok' : 'info');
    n.innerHTML = fstep === 0 ? 'ボタンを押して手順を進めてください。'
      : fstep === 1 ? '各桁の0と1をすべて反転しました（<span class="mono">' + orig + '</span> → <span class="mono">' + f + '</span>）。これを<strong>1の補数</strong>といいます。'
      : '1を足して <strong class="mono">' + c + '</strong> になりました。これが求める補数（<strong>2の補数</strong>）です。' +
        '<span class="mono">' + f + ' ＋ 1 ＝ ' + c + '</span>';
  }

  /* ---------- STEP3 ---------- */
  function drawSub() {
    const n = Math.max(clean($('subA').value, 8).replace(/^0+/, '').length,
      clean($('subB').value, 8).replace(/^0+/, '').length, 4);
    const a = clean($('subA').value, n), b = clean($('subB').value, n);
    const cb = comp(b);
    const sum = dec(a) + dec(cb);
    const full = sum.toString(2).padStart(n + 1, '0');
    const cut = full.slice(-n);
    bitline('t1', a);
    bitline('t2', cb);
    bitline('t3', full, full.split('').map((_, i) => i === 0 ? 'flip' : ''));
    bitline('t4', ('_' + cut), ['drop'].concat(cut.split('').map(() => '')));
    $('t4').innerHTML = '<div class="b drop">' + full[0] + '</div>' +
      [...cut].map(c => '<div class="b' + (c === '1' ? ' on' : '') + '">' + c + '</div>').join('');
    const nt = $('subNote');
    const carried = full.length > n && full[0] === '1';
    nt.className = 'note ' + (carried ? 'ok' : 'warn');
    nt.innerHTML = carried
      ? '<span class="mono">' + a + ' − ' + b + '</span> を <span class="mono">' + a + ' ＋ ' + cb +
        '</span> に置きかえました。結果は <span class="mono">' + full + '</span>。' +
        '<strong>いちばん上の桁上がり（1）を捨てる</strong>と <strong class="mono">' + cut + '</strong>。<br>' +
        '検算：' + dec(a) + ' − ' + dec(b) + ' ＝ ' + (dec(a) - dec(b)) + '、2進法で ' + cut + ' ＝ ' + dec(cut) + ' ✓'
      : '<strong>桁上がりが起きませんでした。</strong>これは A より B のほうが大きい（答えが負になる）ことを意味します。' +
        'このとき結果は負の数の表現になっています（' + cut + ' は −' + (Math.pow(2, n) - dec(cut)) + ' を表します）。';
  }

  /* ---------- STEP4 ---------- */
  function drawNeg() {
    const n = +$('nbits').value;
    $('nbitsV').textContent = n;
    const lo = -Math.pow(2, n - 1), hi = Math.pow(2, n - 1) - 1;
    const sl = $('negVal');
    sl.min = lo; sl.max = hi;
    let v = +sl.value;
    if (v < lo) { v = lo; sl.value = lo; }
    if (v > hi) { v = hi; sl.value = hi; }
    $('negValV').textContent = v;
    const abs = Math.abs(v).toString(2).padStart(n, '0');
    $('negStep1').textContent = v < 0 ? '絶対値 ' + Math.abs(v) + ' の2進法' : v + ' の2進法';
    bitline('n1', abs);
    const rep = v < 0 ? comp(abs) : abs;
    bitline('n2', rep, rep.split('').map((_, i) => i === 0 ? 'flip' : ''));
    $('rangeSigned').textContent = lo + ' 〜 ' + hi;
    $('rangeUnsigned').textContent = '0 〜 ' + (Math.pow(2, n) - 1);
    const nt = $('negNote');
    nt.className = 'note ' + (v < 0 ? 'ok' : 'info');
    nt.innerHTML = v < 0
      ? '−' + Math.abs(v) + ' は <strong class="mono">' + rep + '</strong> と表します。' +
        'いちばん上のビットが <strong>1</strong> なので負の数だとわかります。'
      : v + ' は <strong class="mono">' + rep + '</strong>。いちばん上のビットが <strong>0</strong> なので正の数です。';
    // 表
    let h = '<thead><tr><th>10進法</th><th>2進法（' + n + 'ビット）</th></tr></thead><tbody>';
    const list = [];
    for (let x = lo; x <= hi; x++) list.push(x);
    const show = list.length > 20 ? list.filter((_, i) => i % Math.ceil(list.length / 18) === 0 || list[i] === v) : list;
    show.forEach(x => {
      const b = x < 0 ? comp(Math.abs(x).toString(2).padStart(n, '0')) : x.toString(2).padStart(n, '0');
      h += '<tr' + (x === v ? ' style="background:var(--warn-bg);font-weight:700"' : '') + '><td>' + x + '</td><td>' + b + '</td></tr>';
    });
    $('rangeTable').innerHTML = h + '</tbody>';
  }

  /* ---------- STEP5 クイズ ---------- */
  const QUIZ = [
    { t: '2進法 0110(2) の補数はどれか。', choices: ['1010', '1001', '1000', '0101'], a: '1010',
      why: '0110 を反転すると 1001、これに1を足して <strong>1010</strong>。足すと 0110＋1010＝10000 で桁が1つ増えます。' },
    { t: '2進法の補数を求める方法はどれか。',
      choices: ['各桁の0と1を反転し、1を足す', '各桁の0と1を反転する',
                '各桁の0と1を反転し、1を引く', '各桁の0と1を反転し、10を足す'],
      a: '各桁の0と1を反転し、1を足す',
      why: '反転しただけのものは「1の補数」。それに1を足したものが、いま使っている「2の補数」です。' },
    { t: '1110(2) − 0110(2) を補数を使って計算するとどうなるか。',
      choices: ['1000', '0110', '1010', '11000'], a: '1000',
      why: '1110 ＋ 1010 ＝ 11000。<strong>いちばん上の桁上がりを捨てて 1000</strong>。検算：14 − 6 ＝ 8、1000(2)＝8 ✓' },
    { t: '10進法 −7 を4ビットの2進法で表すとどうなるか。',
      choices: ['1001', '0111', '1000', '1111'], a: '1001',
      why: '7 は 0111。反転して 1000、1を足して <strong>1001</strong>。いちばん上が1なので負の数です。' },
    { t: 'nビットで表せる整数の範囲（符号あり）はどれか。',
      choices: ['−2ⁿ⁻¹ 〜 2ⁿ⁻¹−1', '−2ⁿ 〜 2ⁿ−1', '0 〜 2ⁿ−1', '−2ⁿ⁻¹−1 〜 2ⁿ⁻¹'],
      a: '−2ⁿ⁻¹ 〜 2ⁿ⁻¹−1',
      why: '4ビットなら −8 〜 7。<strong>負のほうが1つ多い</strong>のは、0が正の側に入るためです。' },
    { t: 'コンピュータが引き算を補数による足し算に置きかえる理由はどれか。',
      choices: ['加算の回路だけで減算もできるようになるから', '計算が速くなるから',
                '桁数が減るから', '誤差が小さくなるから'],
      a: '加算の回路だけで減算もできるようになるから',
      why: '回路を減らせるのが最大の利点です。掛け算もシフトと加算の組み合わせで実現できます。' }
  ];
  let qList = [], qi = 0, qScore = 0;
  function startQuiz() { qList = shuffle(QUIZ); qi = 0; qScore = 0; renderQ(); }
  function renderQ() {
    if (qi >= qList.length) {
      $('qText').textContent = qScore + ' / ' + qList.length + ' 問正解';
      $('qChoices').innerHTML = ''; $('qFb').hidden = true; $('qNext').disabled = true;
      $('qProgress').textContent = qList.length + ' / ' + qList.length; return;
    }
    const it = qList[qi];
    $('qProgress').textContent = (qi + 1) + ' / ' + qList.length;
    $('qScore').textContent = qScore;
    $('qText').textContent = it.t;
    const box = $('qChoices'); box.className = 'choice4'; box.innerHTML = '';
    shuffle(it.choices).forEach(c => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = c; b.dataset.c = c; b.style.textAlign = 'center';
      b.addEventListener('click', () => answerQ(c));
      box.appendChild(b);
    });
    $('qFb').hidden = true; $('qNext').disabled = true;
    $('qNext').textContent = (qi === qList.length - 1) ? '結果を見る' : '次の問題';
  }
  function answerQ(c) {
    const it = qList[qi], ok = c === it.a, box = $('qChoices');
    box.classList.add('locked');
    [...box.children].forEach(b => {
      if (b.dataset.c === it.a) b.classList.add('correct');
      else if (b.dataset.c === c) b.classList.add('wrong');
    });
    if (ok) qScore++;
    const fb = $('qFb');
    fb.className = 'note ' + (ok ? 'ok' : 'ng');
    fb.innerHTML = (ok ? '正解。' : '正解は「<strong>' + it.a + '</strong>」。') + it.why;
    fb.hidden = false;
    $('qScore').textContent = qScore; $('qNext').disabled = false;
  }

  function drawAll() { drawComp(); drawFlip(); }

  function init() {
    document.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => {
      orig = b.dataset.set; fstep = 0; drawAll();
    }));
    $('randOrig').addEventListener('click', () => {
      orig = Array.from({ length: 4 }, () => Math.random() < .5 ? '1' : '0').join(''); fstep = 0; drawAll();
    });
    $('flipStep').addEventListener('click', () => { fstep = Math.min(2, fstep + 1); drawFlip(); });
    $('flipReset').addEventListener('click', () => { fstep = 0; drawFlip(); });
    ['subA', 'subB'].forEach(i => $(i).addEventListener('input', drawSub));
    ['nbits', 'negVal'].forEach(i => $(i).addEventListener('input', drawNeg));
    $('qNext').addEventListener('click', () => { qi++; renderQ(); });
    $('qReset').addEventListener('click', startQuiz);
    window.Terms.glossary($('glossBox'), ['補数', '2進法', '基数変換', 'デジタル', '演算誤差']);
    drawAll(); drawSub(); drawNeg(); startQuiz();
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
