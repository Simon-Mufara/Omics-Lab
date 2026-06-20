/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Competitive Leaderboard + Global Cohort Map (Prompt 10)
   Reads scores from localStorage, seeds a global synthetic cohort,
   renders ranked table + interactive SVG world map of learner locations.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Leaderboard = (function () {

  const STORE_KEY = 'omicslab_leaderboard_v1';
  const MY_KEY    = 'omicslab_user_profile';

  /* ─── Synthetic global cohort (80 entries) ─── */
  const SEED_COHORT = [
    /* Africa */
    {name:'Amara Osei-Bonsu',    country:'Ghana',          city:'Accra',           score:98, streak:22, badge:'', domain:'WGS',         lat:5.6037,   lng:-0.1870},
    {name:'Sipho Dlamini',       country:'South Africa',   city:'Cape Town',       score:96, streak:18, badge:'', domain:'RNA-seq',      lat:-33.9249, lng:18.4241},
    {name:'Fatima Al-Rashidi',   country:'Uganda',         city:'Entebbe',         score:95, streak:15, badge:'', domain:'Metagenomics', lat:0.0553,   lng:32.4633},
    {name:'Kwame Asante',        country:'Ghana',          city:'Kumasi',          score:93, streak:14, badge:'', domain:'ATAC-seq',     lat:6.6880,   lng:-1.6244},
    {name:'Ngozi Okonkwo',       country:'Nigeria',        city:'Lagos',           score:92, streak:13, badge:'', domain:'scRNA-seq',    lat:6.5244,   lng:3.3792},
    {name:'Tamirat Bekele',      country:'Ethiopia',       city:'Addis Ababa',     score:91, streak:12, badge:'', domain:'WGS',         lat:9.0320,   lng:38.7469},
    {name:'Ayo Abiodun',         country:'Nigeria',        city:'Abuja',           score:90, streak:11, badge:'', domain:'Proteomics',   lat:9.0579,   lng:7.4951},
    {name:'Mariam Diallo',       country:'Senegal',        city:'Dakar',           score:89, streak:10, badge:'', domain:'WGS',         lat:14.7167,  lng:-17.4677},
    {name:'Chidi Eze',           country:'Nigeria',        city:'Ibadan',          score:88, streak:9,  badge:'', domain:'ChIP-seq',     lat:7.3775,   lng:3.9470},
    {name:'Aisha Hassan',        country:'Kenya',          city:'Nairobi',         score:87, streak:9,  badge:'', domain:'RNA-seq',      lat:-1.2921,  lng:36.8219},
    {name:'Nomvula Mokoena',     country:'South Africa',   city:'Johannesburg',    score:86, streak:8,  badge:'', domain:'Metabolomics', lat:-26.2041, lng:28.0473},
    {name:'Patrick Mugisha',     country:'Uganda',         city:'Kampala',         score:85, streak:8,  badge:'', domain:'Metagenomics', lat:0.3476,   lng:32.5825},
    {name:'Aicha Koné',          country:'Côte d\'Ivoire', city:'Abidjan',         score:84, streak:7,  badge:'',   domain:'WGS',         lat:5.3600,   lng:-4.0083},
    {name:'Festus Kamau',        country:'Kenya',          city:'Mombasa',         score:83, streak:7,  badge:'',   domain:'scRNA-seq',    lat:-4.0435,  lng:39.6682},
    {name:'Blessing Okafor',     country:'Nigeria',        city:'Port Harcourt',   score:82, streak:6,  badge:'',   domain:'ATAC-seq',     lat:4.8156,   lng:7.0498},
    {name:'Grace Mwangi',        country:'Kenya',          city:'Kisumu',          score:81, streak:6,  badge:'',   domain:'RNA-seq',      lat:-0.1022,  lng:34.7617},
    {name:'Seun Adekunle',       country:'Nigeria',        city:'Kano',            score:80, streak:5,  badge:'',   domain:'WGS',         lat:12.0022,  lng:8.5920},
    {name:'Léa Razafindrakoto',  country:'Madagascar',     city:'Antananarivo',    score:79, streak:5,  badge:'',   domain:'Metagenomics', lat:-18.8792, lng:47.5079},
    {name:'Darius Nyeko',        country:'Uganda',         city:'Gulu',            score:78, streak:4,  badge:'',   domain:'ChIP-seq',     lat:2.7747,   lng:32.2990},
    {name:'Amina Osei',          country:'Ghana',          city:'Tamale',          score:77, streak:4,  badge:'',   domain:'Proteomics',   lat:9.4008,   lng:-0.8393},
    {name:'Youssef Ben Ali',     country:'Tunisia',        city:'Tunis',           score:76, streak:4,  badge:'',   domain:'WGS',         lat:36.8190,  lng:10.1658},
    {name:'Rahel Tesfaye',       country:'Ethiopia',       city:'Dire Dawa',       score:75, streak:3,  badge:'',   domain:'RNA-seq',      lat:9.5931,   lng:41.8661},
    {name:'Kofi Mensah',         country:'Ghana',          city:'Accra',           score:74, streak:3,  badge:'',   domain:'Metabolomics', lat:5.6037,   lng:-0.1870},
    {name:'Diane Mutombo',       country:'DRC',            city:'Kinshasa',        score:73, streak:3,  badge:'',   domain:'Metagenomics', lat:-4.3317,  lng:15.3314},
    {name:'Ibrahima Diop',       country:'Senegal',        city:'Saint-Louis',     score:72, streak:2,  badge:'',   domain:'WGS',         lat:16.0179,  lng:-16.4896},
    {name:'Chiamaka Ibe',        country:'Nigeria',        city:'Enugu',           score:71, streak:2,  badge:'',   domain:'scRNA-seq',    lat:6.4584,   lng:7.5464},
    /* East Africa */
    {name:'David Mutua',         country:'Kenya',          city:'Nakuru',          score:70, streak:2,  badge:'',   domain:'ATAC-seq',     lat:-0.3031,  lng:36.0800},
    {name:'Agnes Nansubuga',     country:'Uganda',         city:'Jinja',           score:69, streak:1,  badge:'',   domain:'RNA-seq',      lat:0.4244,   lng:33.2041},
    {name:'Ramadhani Salim',     country:'Tanzania',       city:'Dar es Salaam',   score:68, streak:1,  badge:'',   domain:'WGS',         lat:-6.7924,  lng:39.2083},
    {name:'Amani Mwamba',        country:'Tanzania',       city:'Mwanza',          score:67, streak:1,  badge:'',   domain:'Proteomics',   lat:-2.5164,  lng:32.9175},
    /* Southern Africa */
    {name:'Lindiwe Dube',        country:'Zimbabwe',       city:'Harare',          score:66, streak:1,  badge:'',   domain:'Metabolomics', lat:-17.8252, lng:31.0335},
    {name:'Tendai Moyo',         country:'Zimbabwe',       city:'Bulawayo',        score:65, streak:1,  badge:'',   domain:'ChIP-seq',     lat:-20.1325, lng:28.6264},
    {name:'Keitumetse Segoe',    country:'Botswana',       city:'Gaborone',        score:64, streak:0,  badge:'',   domain:'WGS',         lat:-24.6540, lng:25.9086},
    {name:'Zanele Nkosi',        country:'Eswatini',       city:'Mbabane',         score:63, streak:0,  badge:'',   domain:'RNA-seq',      lat:-26.3054, lng:31.1367},
    {name:'Mercy Phiri',         country:'Malawi',         city:'Lilongwe',        score:62, streak:0,  badge:'',   domain:'Metagenomics', lat:-13.9626, lng:33.7741},
    /* West Africa additional */
    {name:'Moustapha Ba',        country:'Senegal',        city:'Thiès',           score:61, streak:0,  badge:'',   domain:'WGS',         lat:14.7886,  lng:-16.9260},
    {name:'Josephine Acheampong',country:'Ghana',          city:'Cape Coast',      score:60, streak:0,  badge:'',   domain:'ATAC-seq',     lat:5.1053,   lng:-1.2466},
    /* North Africa */
    {name:'Rana El-Masry',       country:'Egypt',          city:'Cairo',           score:59, streak:0,  badge:'',   domain:'scRNA-seq',    lat:30.0444,  lng:31.2357},
    {name:'Hamid Benali',        country:'Morocco',        city:'Casablanca',      score:58, streak:0,  badge:'',   domain:'RNA-seq',      lat:33.5731,  lng:-7.5898},
    {name:'Safia Ouedraogo',     country:'Burkina Faso',   city:'Ouagadougou',     score:57, streak:0,  badge:'',   domain:'WGS',         lat:12.3641,  lng:-1.5337},
    /* International participants */
    {name:'Maya Krishnamurthy',  country:'India',          city:'Bangalore',       score:56, streak:0,  badge:'',   domain:'Proteomics',   lat:12.9716,  lng:77.5946},
    {name:'Carlos Mendez',       country:'Brazil',         city:'São Paulo',       score:55, streak:0,  badge:'',   domain:'Metagenomics', lat:-23.5505, lng:-46.6333},
    {name:'Linh Nguyen',         country:'Vietnam',        city:'Hanoi',           score:54, streak:0,  badge:'',   domain:'RNA-seq',      lat:21.0285,  lng:105.8542},
    {name:'James O\'Brien',      country:'Ireland',        city:'Dublin',          score:53, streak:0,  badge:'',   domain:'ATAC-seq',     lat:53.3498,  lng:-6.2603},
    {name:'Priya Patel',         country:'United Kingdom', city:'London',          score:52, streak:0,  badge:'',   domain:'ChIP-seq',     lat:51.5074,  lng:-0.1278},
    {name:'Hana Nakamura',       country:'Japan',          city:'Tokyo',           score:51, streak:0,  badge:'',   domain:'scRNA-seq',    lat:35.6762,  lng:139.6503},
    {name:'Ali Hassan',          country:'Pakistan',       city:'Lahore',          score:50, streak:0,  badge:'',   domain:'WGS',         lat:31.5497,  lng:74.3436},
    {name:'Sofia Rossi',         country:'Italy',          city:'Rome',            score:49, streak:0,  badge:'',   domain:'Metabolomics', lat:41.9028,  lng:12.4964},
    {name:'Ana Lima',            country:'Portugal',       city:'Lisbon',          score:48, streak:0,  badge:'',   domain:'RNA-seq',      lat:38.7169,  lng:-9.1399},
    {name:'Ahmad Al-Zahrani',    country:'Saudi Arabia',   city:'Riyadh',          score:47, streak:0,  badge:'',   domain:'WGS',         lat:24.7136,  lng:46.6753},
    {name:'Yetunde Adeyemi',     country:'Nigeria',        city:'Abeokuta',        score:46, streak:0,  badge:'',   domain:'Proteomics',   lat:7.1476,   lng:3.3484},
    {name:'Benjamin Adu',        country:'Ghana',          city:'Ho',              score:45, streak:0,  badge:'',   domain:'Metagenomics', lat:6.6011,   lng:0.4703},
    {name:'Celestine Nkemdirim', country:'Nigeria',        city:'Onitsha',         score:44, streak:0,  badge:'',   domain:'ATAC-seq',     lat:6.1417,   lng:6.7867},
    {name:'Florence Wanjiku',    country:'Kenya',          city:'Nyeri',           score:43, streak:0,  badge:'',   domain:'RNA-seq',      lat:-0.4167,  lng:36.9500},
    {name:'Ibra Coulibaly',      country:'Mali',           city:'Bamako',          score:42, streak:0,  badge:'',   domain:'WGS',         lat:12.6392,  lng:-8.0029},
    {name:'John Mwangi',         country:'Kenya',          city:'Eldoret',         score:41, streak:0,  badge:'',   domain:'ChIP-seq',     lat:0.5143,   lng:35.2698},
    {name:'Viviane Ndiaye',      country:'Senegal',        city:'Ziguinchor',      score:40, streak:0,  badge:'',   domain:'scRNA-seq',    lat:12.5681,  lng:-16.2720},
    {name:'Emeka Nwosu',         country:'Nigeria',        city:'Owerri',          score:39, streak:0,  badge:'',   domain:'Metabolomics', lat:5.4836,   lng:7.0339},
    {name:'Zainab Garba',        country:'Nigeria',        city:'Maiduguri',       score:38, streak:0,  badge:'',   domain:'WGS',         lat:11.8311,  lng:13.1520},
    {name:'Ruth Waweru',         country:'Kenya',          city:'Thika',           score:37, streak:0,  badge:'',   domain:'RNA-seq',      lat:-1.0332,  lng:37.0693},
    {name:'Daniel Tetteh',       country:'Ghana',          city:'Tema',            score:36, streak:0,  badge:'',   domain:'Proteomics',   lat:5.6698,   lng:-0.0166},
    {name:'Halimatou Diallo',    country:'Guinea',         city:'Conakry',         score:35, streak:0,  badge:'',   domain:'Metagenomics', lat:9.5370,   lng:-13.6773},
    {name:'Sekou Toure',         country:'Guinea',         city:'Nzérékoré',       score:34, streak:0,  badge:'',   domain:'ATAC-seq',     lat:7.7562,   lng:-8.8177},
    {name:'Madeleine Kamara',    country:'Sierra Leone',   city:'Freetown',        score:33, streak:0,  badge:'',   domain:'ChIP-seq',     lat:8.4655,   lng:-13.2317},
    {name:'Aboubacar Bah',       country:'Mauritania',     city:'Nouakchott',      score:32, streak:0,  badge:'',   domain:'WGS',         lat:18.0735,  lng:-15.9582},
    {name:'Florentin Razaka',    country:'Madagascar',     city:'Toamasina',       score:31, streak:0,  badge:'',   domain:'RNA-seq',      lat:-18.1492, lng:49.4022},
    {name:'Sophie Rakoto',       country:'Madagascar',     city:'Fianarantsoa',    score:30, streak:0,  badge:'',   domain:'Metabolomics', lat:-21.4500, lng:47.0833},
    {name:'Christian Nkurunziza',country:'Burundi',        city:'Bujumbura',       score:29, streak:0,  badge:'',   domain:'Metagenomics', lat:-3.3822,  lng:29.3614},
    {name:'Adama Traoré',        country:'Burkina Faso',   city:'Bobo-Dioulasso',  score:28, streak:0,  badge:'',   domain:'WGS',         lat:11.1777,  lng:-4.2979},
    {name:'Eunice Adhiambo',     country:'Kenya',          city:'Kisii',           score:27, streak:0,  badge:'',   domain:'scRNA-seq',    lat:-0.6817,  lng:34.7667},
    {name:'Nadia Benkhalil',     country:'Algeria',        city:'Algiers',         score:26, streak:0,  badge:'',   domain:'ATAC-seq',     lat:36.7372,  lng:3.0865},
    {name:'Moussa Dembele',      country:'Côte d\'Ivoire', city:'Bouaké',          score:25, streak:0,  badge:'',   domain:'ChIP-seq',     lat:7.6939,   lng:-5.0300},
    {name:'Pauline Mwombeki',    country:'Tanzania',       city:'Dodoma',          score:24, streak:0,  badge:'',   domain:'RNA-seq',      lat:-6.1722,  lng:35.7395},
    {name:'Ahmed Abdi',          country:'Somalia',        city:'Mogadishu',       score:23, streak:0,  badge:'',   domain:'WGS',         lat:2.0469,   lng:45.3182},
    {name:'Mariama Balde',       country:'Guinea-Bissau',  city:'Bissau',          score:22, streak:0,  badge:'',   domain:'Metagenomics', lat:11.8636,  lng:-15.5977},
    {name:'Theo Nnadi',          country:'Nigeria',        city:'Umuahia',         score:21, streak:0,  badge:'',   domain:'Proteomics',   lat:5.5321,   lng:7.4863},
    {name:'Prudence Kavira',     country:'DRC',            city:'Goma',            score:20, streak:0,  badge:'',   domain:'ATAC-seq',     lat:-1.6747,  lng:29.2285},
  ];

  /* ─── Load state ─── */
  function _loadBoard() {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (stored) return stored;
    /* Initialise from seed */
    localStorage.setItem(STORE_KEY, JSON.stringify(SEED_COHORT));
    return SEED_COHORT;
  }

  function _getMyEntry() {
    const profile = JSON.parse(localStorage.getItem(MY_KEY) || '{}');
    const sessions = JSON.parse(localStorage.getItem('omicslab_sessions') || '[]');
    const best = sessions.reduce((max, s) => s.score > max ? s.score : max, 0);
    const streak = sessions.length;
    const city = profile.city || 'Your City';
    const country = profile.country || 'Africa';
    const name = profile.name || 'You';
    return {
      name, country, city,
      score: best || 0,
      streak,
      badge: '',
      domain: sessions[sessions.length - 1]?.domain || '—',
      isMe: true,
      lat: profile.lat || -1.2921,
      lng: profile.lng || 36.8219,
    };
  }

  /* ─── Merge my entry with cohort ─── */
  function _buildRanked() {
    const board = _loadBoard().slice();
    const me = _getMyEntry();
    /* Insert "me" if score > 0 */
    if (me.score > 0) {
      board.unshift(me);
      board.sort((a, b) => b.score - a.score);
    }
    return board.map((e, i) => ({ ...e, rank: i + 1 }));
  }

  /* ─── Render leaderboard table ─── */
  function _renderTable(ranked, filter) {
    const me = ranked.find(e => e.isMe);
    const filtered = filter ? ranked.filter(e => e.domain === filter) : ranked;
    const myRank = me ? ranked.indexOf(me) + 1 : null;

    return `
      ${me && me.score > 0 ? `
      <div class="lb-my-rank">
        <div class="lb-my-rank-label">Your Global Ranking</div>
        <div class="lb-my-rank-val">#${myRank}</div>
        <div class="lb-my-rank-of">of ${ranked.length} learners worldwide</div>
        <div class="lb-my-score">Best score: ${me.score}/100 · ${me.badge || 'Keep going!'}</div>
      </div>` : `
      <div class="lb-my-rank lb-my-rank-empty">
        <div class="lb-my-rank-label">Complete a lab experiment to enter the leaderboard</div>
        <div style="font-size:.8rem;color:#8b949e;margin-top:.35rem">Your best score will appear here automatically</div>
      </div>`}

      <div class="lb-table-wrap">
        <table class="lb-table">
          <thead>
            <tr>
              <th class="lb-th-rank">Rank</th>
              <th class="lb-th-name">Researcher</th>
              <th class="lb-th-loc">Location</th>
              <th class="lb-th-domain">Speciality</th>
              <th class="lb-th-score">Best Score</th>
              <th class="lb-th-streak">Streak</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.slice(0, 50).map(e => `
              <tr class="lb-row${e.isMe ? ' lb-row-me' : ''}${e.rank <= 3 ? ' lb-row-top' : ''}">
                <td class="lb-td-rank">
                  <span class="lb-rank-num${e.rank <= 3 ? ' lb-rank-medal' : ''}">${e.badge || '#' + e.rank}</span>
                </td>
                <td class="lb-td-name">
                  <div class="lb-avatar">${(e.name.split(' ')[0][0] + (e.name.split(' ')[1]?.[0] || '')).toUpperCase()}</div>
                  <span class="lb-name">${e.name}${e.isMe ? ' <span class="lb-you">YOU</span>' : ''}</span>
                </td>
                <td class="lb-td-loc">${e.city}, ${e.country}</td>
                <td class="lb-td-domain"><span class="lb-domain-tag">${e.domain}</span></td>
                <td class="lb-td-score">
                  <div class="lb-score-bar-wrap">
                    <div class="lb-score-bar" style="width:${e.score}%"></div>
                    <span class="lb-score-num">${e.score}</span>
                  </div>
                </td>
                <td class="lb-td-streak">${e.streak > 0 ? `${OmicsLab.Icons?.svg('flame',12)||''} ${e.streak}d` : '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  /* ─── Render SVG world map with dots ─── */
  function _renderMap(ranked) {
    /* Equirectangular projection: lat/lng → SVG x/y */
    const W = 800, H = 400;
    const toX = lng => ((lng + 180) / 360) * W;
    const toY = lat => ((90 - lat) / 180) * H;

    const dots = ranked.map(e => {
      const x = toX(e.lng).toFixed(1);
      const y = toY(e.lat).toFixed(1);
      const r = e.isMe ? 7 : e.rank <= 3 ? 6 : 4;
      const fill = e.isMe ? '#e3b341' : e.rank <= 10 ? '#3fb950' : '#58a6ff';
      const opacity = e.isMe ? 1 : Math.max(0.4, 1 - (e.rank - 1) / 80);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${opacity}" stroke="#0d1117" stroke-width="1">
        <title>${e.name} — ${e.city}, ${e.country} · Score: ${e.score}</title>
      </circle>`;
    }).join('');

    /* Country count */
    const countries = [...new Set(ranked.map(e => e.country))].length;
    const afCount   = ranked.filter(e => [
      'Nigeria','Kenya','South Africa','Ghana','Ethiopia','Uganda','Tanzania',
      'Senegal','DRC','Cameroon','Zimbabwe','Malawi','Botswana','Eswatini',
      'Madagascar','Côte d\'Ivoire','Burkina Faso','Mali','Guinea',
      'Sierra Leone','Mauritania','Burundi','Algeria','Morocco','Tunisia',
      'Egypt','Somalia','Guinea-Bissau',
    ].includes(e.country)).length;

    return `
      <div class="lb-map-wrap">
        <div class="lb-map-header">
          <div class="lb-map-title">Global Cohort Map</div>
          <div class="lb-map-stats">
            <span class="lb-map-stat"><span class="lb-map-stat-num">${ranked.length}</span> learners</span>
            <span class="lb-map-stat"><span class="lb-map-stat-num">${countries}</span> countries</span>
            <span class="lb-map-stat"><span class="lb-map-stat-num">${afCount}</span> from Africa</span>
          </div>
        </div>
        <div class="lb-map-legend">
          <span class="lb-legend-item"><span class="lb-legend-dot" style="background:#e3b341"></span>You</span>
          <span class="lb-legend-item"><span class="lb-legend-dot" style="background:#3fb950"></span>Top 10</span>
          <span class="lb-legend-item"><span class="lb-legend-dot" style="background:#58a6ff"></span>Others</span>
        </div>
        <div class="lb-map-container">
          <svg viewBox="0 0 ${W} ${H}" class="lb-map-svg" xmlns="http://www.w3.org/2000/svg" aria-label="Global learner map">
            <!-- Simple land background using rectangles (offline, no tile server) -->
            <rect width="${W}" height="${H}" fill="#0d1117"/>
            <!-- Simplified continent outlines as background -->
            <text x="${toX(20)}" y="${toY(10)}" class="lb-map-label" fill="rgba(255,255,255,.12)" font-size="10" text-anchor="middle">AFRICA</text>
            <text x="${toX(80)}" y="${toY(40)}" class="lb-map-label" fill="rgba(255,255,255,.10)" font-size="9" text-anchor="middle">ASIA</text>
            <text x="${toX(-100)}" y="${toY(40)}" class="lb-map-label" fill="rgba(255,255,255,.10)" font-size="9" text-anchor="middle">N. AMERICA</text>
            <text x="${toX(-60)}" y="${toY(-15)}" class="lb-map-label" fill="rgba(255,255,255,.10)" font-size="9" text-anchor="middle">S. AMERICA</text>
            <text x="${toX(10)}" y="${toY(55)}" class="lb-map-label" fill="rgba(255,255,255,.10)" font-size="9" text-anchor="middle">EUROPE</text>
            <text x="${toX(135)}" y="${toY(-25)}" class="lb-map-label" fill="rgba(255,255,255,.10)" font-size="9" text-anchor="middle">OCEANIA</text>
            <!-- Equator -->
            <line x1="0" y1="${toY(0)}" x2="${W}" y2="${toY(0)}" stroke="rgba(255,255,255,.06)" stroke-width="1" stroke-dasharray="4 4"/>
            <!-- Tropics (23.5°) -->
            <line x1="0" y1="${toY(23.5)}" x2="${W}" y2="${toY(23.5)}" stroke="rgba(249,115,22,.07)" stroke-width="1" stroke-dasharray="3 6"/>
            <line x1="0" y1="${toY(-23.5)}" x2="${W}" y2="${toY(-23.5)}" stroke="rgba(249,115,22,.07)" stroke-width="1" stroke-dasharray="3 6"/>
            <!-- Dots -->
            ${dots}
          </svg>
        </div>
        <div class="lb-map-note">Dots represent approximate learner locations based on self-reported profiles. Hover any dot to see name and score.</div>
      </div>`;
  }

  /* ─── Domain filter ─── */
  let _activeFilter = null;
  const DOMAINS = ['WGS','RNA-seq','ATAC-seq','ChIP-seq','Metagenomics','scRNA-seq','Proteomics','Metabolomics'];

  function _setFilter(domain) {
    _activeFilter = _activeFilter === domain ? null : domain;
    _refreshTable();
  }

  function _refreshTable() {
    const ranked = _buildRanked();
    const tableEl = document.getElementById('lb-table-area');
    if (tableEl) tableEl.innerHTML = _renderTable(ranked, _activeFilter);
    /* Update filter button states */
    document.querySelectorAll('.lb-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.domain === _activeFilter);
    });
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('leaderboard-section');
    if (!section || section.dataset.lbReady) return;
    section.dataset.lbReady = '1';

    const ranked = _buildRanked();

    section.innerHTML = `
      <div class="lb-wrap">
        <div class="lb-header">
          <div>
            <div class="lb-badge">GLOBAL RANKINGS</div>
            <h2 class="lb-title">Competitive Leaderboard</h2>
            <p class="lb-subtitle">Compete with ${ranked.length} omics researchers across ${[...new Set(ranked.map(e=>e.country))].length} countries. Complete lab experiments to earn your rank. The top 3 earn gold, silver, and bronze.</p>
          </div>
          <div class="lb-filters">
            <div class="lb-filter-label">Filter by domain</div>
            <div class="lb-filter-row">
              <button class="lb-filter-btn${!_activeFilter ? ' active' : ''}" data-domain="" onclick="OmicsLab.Leaderboard._setFilter(null)">All</button>
              ${DOMAINS.map(d => `<button class="lb-filter-btn" data-domain="${d}" onclick="OmicsLab.Leaderboard._setFilter('${d}')">${d}</button>`).join('')}
            </div>
          </div>
        </div>

        ${_renderMap(ranked)}

        <div id="lb-table-area">
          ${_renderTable(ranked, null)}
        </div>

        <!-- How to rank up -->
        <div class="lb-howto">
          <div class="lb-howto-title">How to climb the leaderboard</div>
          <div class="lb-howto-grid">
            <div class="lb-howto-step"><div class="lb-howto-num">1</div><div class="lb-howto-text">Complete any lab experiment in the <strong>Lab Simulations</strong> page</div></div>
            <div class="lb-howto-step"><div class="lb-howto-num">2</div><div class="lb-howto-text">Achieve a high score — perfect QC decisions = 100/100</div></div>
            <div class="lb-howto-step"><div class="lb-howto-num">3</div><div class="lb-howto-text">Add your <strong>city and country</strong> in your Profile to appear on the map</div></div>
            <div class="lb-howto-step"><div class="lb-howto-num">4</div><div class="lb-howto-text">Maintain a <strong>daily streak</strong> to appear in the top-right streak column</div></div>
          </div>
        </div>
      </div>`;
  }

  return { init, _setFilter };
})();
