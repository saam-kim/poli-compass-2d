/**
 * 폴리 컴패스 (Poli Compass)
 * 사회 수업용 정치·선거 시뮬레이터 핵심 로직 스크립트
 */

// ==========================================
// 1. 설정 및 기본 데이터 구조
// ==========================================

// 정책 카테고리별 이념 영향 벡터 (경제, 사회)
// X축: 경제 (-100 복지/세금확대 ~ +100 시장자유/세금인하)
// Y축: 사회 (+100 자유/다양성 ~ -100 질서/규제)
const POLICY_VECTORS = {
    youth: { x: -50, y: 30, name: "청년·일자리" },
    old: { x: -70, y: -30, name: "노인·복지" },
    estate: { x: 60, y: -10, name: "부동산·세금" },
    environment: { x: -40, y: 70, name: "환경·기후" },
    defense: { x: 10, y: -70, name: "국방·치안" }
};

// 유권자 그룹 설정 정의 (총합 100% 비율 기반)
const VOTER_GROUPS = [
    {
        id: 1,
        name: "사회연대·복지선호 그룹",
        pct: 15,
        issues: ["주거", "일자리", "등록금", "자유"],
        center: { x: -40, y: 40 },
        spread: 25
    },
    {
        id: 2,
        name: "균형생활·보육지원 그룹",
        pct: 15,
        issues: ["주거", "육아", "일자리", "세금"],
        center: { x: 0, y: 15 },
        spread: 30
    },
    {
        id: 3,
        name: "자유경쟁·성장선호 그룹",
        pct: 20,
        issues: ["세금", "규제 완화", "경기 활성화"],
        center: { x: 30, y: 10 },
        spread: 25
    },
    {
        id: 4,
        name: "공정가치·질서안정 그룹",
        pct: 20,
        issues: ["부동산", "세금", "자녀 교육", "사회 안정"],
        center: { x: 25, y: -30 },
        spread: 25
    },
    {
        id: 5,
        name: "기본노후·전통보장 그룹",
        pct: 20,
        issues: ["연금", "복지", "의료", "안정"],
        center: { x: -30, y: -45 },
        spread: 20
    },
    {
        id: 6,
        name: "생태환경·다양성 그룹",
        pct: 10,
        issues: ["환경", "기후", "다양성", "지속가능성"],
        center: { x: -50, y: 55 },
        spread: 20
    }
];

// 기본 정당 샘플 (빠른 시작용)
const SAMPLE_PARTIES = [
    { name: "민생정의당", color: "#3b82f6", slogan: "일하는 사람들의 든든한 버팀목", promise: "보편적 무상복지 및 청년 기본일자리 제공", initX: -60, initY: 10 },
    { name: "초록미래연대", color: "#10b981", slogan: "기후 위기 극복과 지구의 미래", promise: "탄소세 인상 및 재생에너지 100% 전환", initX: -40, initY: 60 },
    { name: "자유성장당", color: "#ef4444", slogan: "시장 자유 확대, 경제 활성화", promise: "법인세 인하 및 불필요한 부동산 규제 완화", initX: 65, initY: -20 },
    { name: "안전희망당", color: "#d946ef", slogan: "질서 있고 안전한 국민 안심 사회", promise: "경찰력 확충 및 흉악 범죄 엄벌주의 도입", initX: 10, initY: -60 }
];

// 단계별 교사용 힌트 발문 매칭
const TEACHER_HINTS = {
    1: "💡 <strong>정당 등록 단계:</strong><br>- 학생들이 모둠별로 정당명, 슬로건, 대표 공약, 그리고 당의 '기초 이념 성향(초기 좌표)'을 정하게 하세요.<br>- 좌표는 <strong>-100(진보/규제)에서 +100(보수/자유)</strong> 범위입니다. 이 위치는 당의 전통적 정체성을 규정합니다.",
    2: "💡 <strong>유권자 지형 공개 단계:</strong><br>- 2차원 좌표계에 100명의 유권자들이 흩어져 있습니다.<br>- <strong>대학생(좌상단), 은퇴자(좌하단), 자영업자(우상단)</strong> 등 이념 집단의 밀집도를 보며 세종국의 여론 지형이 어떠한지 학생들에게 파악하게 하세요.<br>- 유권자 점에 호버하면 직업과 세부 관심이슈를 실시간으로 확인할 수 있습니다.",
    3: "💡 <strong>예산 배분 단계:</strong><br>- 각 정당에게 100억 원의 예산안을 결정하게 하세요.<br>- 복지 확대, 시장 활성화, 국방 강화 등 어디에 돈을 쓰느냐에 따라 정당의 실제 좌표가 이동합니다.<br>- <strong>예산 합계가 정확히 100억 원</strong>이 되어야 저장 및 다음 단계로 진행이 가능합니다.",
    4: "💡 <strong>1차 여론조사 단계:</strong><br>- 예산 배분 후 정당 깃발이 이동하고, 유권자들은 본인에게 가장 가까운 정당을 지지하기 시작합니다.<br>- <strong>중위투표자 정리:</strong> 지나치게 극단에 머문 정당과 중도층을 공략한 정당 중 어느 당의 지지율이 더 높게 나왔는지 토론을 유도해 보세요.",
    5: "💡 <strong>정책 수정 단계:</strong><br>- 1차 여론조사 결과를 바탕으로 정책 예산을 조정하는 단계입니다.<br>- 지지층을 결집하기 위해 더 선명하게 이동할 것인가, 아니면 승리를 위해 중도로 수렴할 것인가? <strong>정체성 vs 득표 전략의 갈등</strong>을 체감하게 해 주세요.<br>- 이동한 궤적이 화면에 점선 화살표로 그려집니다.",
    6: "💡 <strong>단일화/합당 단계:</strong><br>- 1차 조사에서 참패한 정당들 간의 선거 단일화 협상을 주선해 보세요.<br>- <strong>핵심 포인트:</strong> 두 정당이 합쳐져도 표가 단순 합산되지 않습니다. 합당된 신당의 '새로운 평균 정책 위치'를 기준으로 유권자들은 지지 여부를 전면 재평가합니다. 정치공학의 한계와 중도층 이탈 현상을 관찰하세요.",
    7: "💡 <strong>최종 개표 단계:</strong><br>- 모든 전략 수정과 단일화가 반영된 최종 투표 결과가 개표 방송 컨셉으로 연출됩니다.<br>- 득표율을 기준으로 100석의 비례대표 의석을 나누어 최종 집권 정당(1위)을 결정합니다.",
    8: "💡 <strong>결과 분석 단계:</strong><br>- 최종 결과 데이터를 비교 분석합니다.<br>- '중도층에 가장 가까운 당이 항상 이기는가?', '극단에 선명한 당은 어떤 역할을 하는가?', '합당의 득실은 무엇이었는가?' 등 준비된 토론 발문을 보며 사회 수업을 정리하세요."
};

// ==========================================
// 2. 전역 상태 관리 객체 (State)
// ==========================================
let state = {
    stage: 1,           // 현재 진행 단계 (1~8)
    countryName: "세종국",
    parties: [],        // 정당 목록
    voters: [],         // 유권자 목록
    history: [],        // 단계 되돌리기 스냅샷
    activePartyIdForBudget: null, // 예산 입력 중인 활성 정당 ID
    
    // 설정 값
    config: {
        countryName: "세종국",
        voterCount: 100,
        voterMode: "standard",
        weightIdeology: 40,
        weightBudget: 60,
        useUndecided: true,
        undecidedDistance: 80,
        identityBonus: true,
        electoralSystem: "proportional", // "proportional" (비례대표) 또는 "majoritarian" (소선거구)
        animSpeed: "normal",
        soundEffects: true
    }
};

// ==========================================
// 3. 사운드 이펙트 모듈 (Web Audio API)
// ==========================================
const AudioSynth = {
    ctx: null,
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    playClick() {
        if (!state.config.soundEffects) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },
    
    playSuccess() {
        if (!state.config.soundEffects) return;
        this.init();
        const now = this.ctx.currentTime;
        const playTone = (freq, time, dur) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
            osc.start(time);
            osc.stop(time + dur);
        };
        
        playTone(523.25, now, 0.15); // C5
        playTone(659.25, now + 0.12, 0.15); // E5
        playTone(783.99, now + 0.24, 0.15); // G5
        playTone(1046.50, now + 0.36, 0.4); // C6
    },
    
    playDrumRoll() {
        if (!state.config.soundEffects) return;
        this.init();
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 150;
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 1.5);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.0);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        
        noise.start();
        noise.stop(this.ctx.currentTime + 2.0);
        
        // Final punch tone
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(80, this.ctx.currentTime + 1.8);
        oscGain.gain.setValueAtTime(0, this.ctx.currentTime);
        oscGain.gain.setValueAtTime(0.5, this.ctx.currentTime + 1.8);
        oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.3);
        osc.start(this.ctx.currentTime + 1.8);
        osc.stop(this.ctx.currentTime + 2.3);
    },
    
    playFanfare() {
        if (!state.config.soundEffects) return;
        this.init();
        const now = this.ctx.currentTime;
        const playBrass = (freq, time, dur) => {
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc1.type = "sawtooth";
            osc1.frequency.setValueAtTime(freq, time);
            
            osc2.type = "triangle";
            osc2.frequency.setValueAtTime(freq * 1.005, time); // detune
            
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.setValueAtTime(0.2, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + dur);
            osc2.stop(time + dur);
        };
        
        playBrass(261.63, now, 0.4); // C4
        playBrass(329.63, now, 0.4); // E4
        playBrass(392.00, now, 0.4); // G4
        
        playBrass(349.23, now + 0.4, 0.4); // F4
        playBrass(440.00, now + 0.4, 0.4); // A4
        playBrass(523.25, now + 0.4, 0.4); // C5
        
        playBrass(392.00, now + 0.8, 0.8); // G4
        playBrass(493.88, now + 0.8, 0.8); // B4
        playBrass(587.33, now + 0.8, 0.8); // D5
        
        playBrass(523.25, now + 1.6, 1.5); // C5
        playBrass(659.25, now + 1.6, 1.5); // E5
        playBrass(783.99, now + 1.6, 1.5); // G5
        playBrass(1046.50, now + 1.6, 1.5); // C6
    }
};

// ==========================================
// 4. 알고리즘 & 계산 엔진 (Calculations)
// ==========================================

/**
 * 5대 정책 예산 배분을 받아 이념 좌표를 구하는 함수
 * @param {Object} budget 5대 예산 객체 (합계 100)
 * @returns {Object} {x, y} 예산에 의한 이념 좌표 벡터 (-100 ~ 100)
 */
function calculateBudgetVector(budget) {
    let weightedX = 0;
    let weightedY = 0;
    let totalBudget = 0;
    
    for (const key in POLICY_VECTORS) {
        const allocated = budget[key] || 0;
        weightedX += allocated * POLICY_VECTORS[key].x;
        weightedY += allocated * POLICY_VECTORS[key].y;
        totalBudget += allocated;
    }
    
    // 예산이 배분되지 않았다면 중도(0,0) 리턴
    if (totalBudget === 0) {
        return { x: 0, y: 0 };
    }
    
    // 가중평균으로 최종 이념 좌표 산출
    return {
        x: weightedX / totalBudget,
        y: weightedY / totalBudget
    };
}

/**
 * 정당의 최종 좌표 산출 (초기 이념 가중치 + 예산 가중치)
 * @param {Object} party 정당 객체
 * @param {boolean} isRevision 2차 정책 수정안 사용 여부
 * @returns {Object} {x, y} 최종 결합 이념 좌표
 */
function calculateFinalPartyCoordinates(party, isRevision = false) {
    const budget = isRevision ? party.revisedBudget : party.budget;
    const budgetCoord = calculateBudgetVector(budget);
    
    const wIdeology = state.config.weightIdeology / 100;
    const wBudget = state.config.weightBudget / 100;
    
    // 최종 좌표 = 초기이념 * 반영비 + 예산좌표 * 반영비
    const finalX = (party.initX * wIdeology) + (budgetCoord.x * wBudget);
    const finalY = (party.initY * wIdeology) + (budgetCoord.y * wBudget);
    
    // [-100, 100] 범위를 초과하지 않도록 보정
    return {
        x: Math.max(-100, Math.min(100, finalX)),
        y: Math.max(-100, Math.min(100, finalY))
    };
}

/**
 * 유권자 이념 지형 생성기
 * @param {boolean} forceRandom true인 경우 설정 모드에 관계없이 강제로 무작위 난수 기반의 재배치를 수행합니다.
 */
function generateVoters(forceRandom = false) {
    const voters = [];
    const count = state.config.voterCount;
    const isRandom = forceRandom || state.config.voterMode === "random";
    
    let voterId = 1;
    
    VOTER_GROUPS.forEach(group => {
        // 그룹 비율에 맞추어 유권자 할당수 결정
        const groupCount = Math.round((group.pct / 100) * count);
        
        for (let i = 0; i < groupCount; i++) {
            let x, y;
            
            if (isRandom) {
                // 무작위 모드: 박스-뮬러 변환의 두 가지 성분(cos, sin)을 독립적으로 사용하여 x와 y의 상관관계를 끊고 2D 원형으로 자연스럽게 분포하게 만듭니다.
                const u1 = Math.random() || 0.0001;
                const u2 = Math.random() || 0.0001;
                const r = Math.sqrt(-2.0 * Math.log(u1));
                const randStdNormalX = r * Math.cos(2.0 * Math.PI * u2);
                const randStdNormalY = r * Math.sin(2.0 * Math.PI * u2);
                
                x = group.center.x + (randStdNormalX * group.spread * 0.95);
                y = group.center.y + (randStdNormalY * group.spread * 0.95);
            } else {
                // 기본 모드: 중심점 주변에 일정한 나선형태 또는 규칙적인 편차로 배치하여
                // 리셋 시 매번 동일한 배치로 교과서적 시뮬레이션이 가능하게 함
                const angle = (i * 0.95) * (2 * Math.PI / groupCount) + (group.id * 0.5);
                const radius = (i / groupCount) * group.spread * 1.1;
                x = group.center.x + Math.cos(angle) * radius;
                y = group.center.y + Math.sin(angle) * radius;
            }
            
            // [-100, 100] 바운딩 박스 제한
            x = Math.max(-100, Math.min(100, x));
            y = Math.max(-100, Math.min(100, y));
            
            // 관심 이슈 선정 (그룹 이슈에서 무작위 선택)
            const primaryIssue = group.issues[i % group.issues.length];
            
            // 연령대에 대한 고정관념/편견을 방지하기 위해, 정치 성향과 무관하게 연령을 골고루 랜덤 분배합니다.
            const randomAge = ["20대", "30대", "40대", "50대", "60대"][Math.floor(Math.random() * 5)];
            
            voters.push({
                id: voterId++,
                groupName: group.name,
                age: randomAge,
                job: getSampleJobForGroup(group.id, i),
                issue: primaryIssue,
                x: parseFloat(x.toFixed(1)),
                y: parseFloat(y.toFixed(1)),
                support1: null,
                support2: null
            });
        }
    });
    
    // 만약 반올림 오차로 인해 총원 수가 설정치와 미세하게 다를 경우 패딩 보정
    while (voters.length < count) {
        const randGroup = VOTER_GROUPS[Math.floor(Math.random() * VOTER_GROUPS.length)];
        const randomAge = ["20대", "30대", "40대", "50대", "60대"][Math.floor(Math.random() * 5)];
        voters.push({
            id: voterId++,
            groupName: randGroup.name,
            age: randomAge,
            job: "기타 시민",
            issue: randGroup.issues[0],
            x: randGroup.center.x,
            y: randGroup.center.y,
            support1: null,
            support2: null
        });
    }
    
    // 초과분 잘라내기
    if (voters.length > count) {
        voters.length = count;
    }
    
    state.voters = voters;
}

// 그룹별 직업 텍스트 헬퍼
function getSampleJobForGroup(groupId, index) {
    const jobs = {
        1: ["대학생", "취업준비생", "스타트업 인턴", "카페 아르바이트생", "프리랜서 디자이너"],
        2: ["IT회사 대리", "신혼 초등교사", "대기업 사원", "중소기업 연구원", "은행 행원"],
        3: ["음식점 운영자", "미용실 원장", "중형 택시기사", "의류 소매업자", "학원 강사"],
        4: ["대리점 지점장", "고등학교 교사", "제조업 공장장", "주부", "공인중개사"],
        5: ["은퇴 공무원", "연금 수급자", "전직 회사 임원", "아파트 보안요원", "자원봉사자"],
        6: ["환경운동가", "기후연구소 연구원", "협동조합 활동가", "다큐멘터리 감독", "원예가"]
    };
    const list = jobs[groupId] || ["시민"];
    return list[index % list.length];
}

/**
 * 지지 정당 계산 엔진 (여론조사 / 개표 공통)
 * @param {number} surveyRound 1차 여론조사(1) 또는 최종 개표(2)
 */
function runSupportMatching(surveyRound = 1) {
    const activeParties = state.parties.filter(p => p.active);
    
    state.voters.forEach(voter => {
        let bestPartyId = null;
        let minDistance = Infinity;
        
        activeParties.forEach(party => {
            // 해당 정당의 라운드별 좌표 결정
            const partyX = (surveyRound === 1) ? party.x1 : party.x2;
            const partyY = (surveyRound === 1) ? party.y1 : party.y2;
            
            // 1. 유클리드 거리 계산
            let dist = Math.sqrt(Math.pow(voter.x - partyX, 2) + Math.pow(voter.y - partyY, 2));
            
            // 2. [선택 적용] 정당 정체성(이념 선명성) 보너스 적용
            if (state.config.identityBonus) {
                // 원점(0,0)으로부터 정당이 멀리 떨어져 있을수록(극단적일수록) 가중치 증가
                const extremeness = Math.sqrt(partyX * partyX + partyY * partyY) / 141.4; // 0 ~ 1.0
                
                // 유권자의 이념 방향 벡터와 정당의 이념 방향 벡터가 유사한가 (내적 계산)
                const dotProduct = (voter.x * partyX) + (voter.y * partyY);
                
                // 정당의 이념이 유권자 성향과 같은 방향을 지향할 때, 강력한 이념 결집 보너스 제공
                if (dotProduct > 0 && extremeness > 0.3) {
                    // 극단 정당은 자기 진영의 외곽 유권자들을 세게 잡아끄는 메커니즘
                    // 거리 기준을 최대 22만큼 차감해 줌으로써 정서적 지지 효과 연출
                    const bonus = 22 * extremeness;
                    dist = Math.max(5, dist - bonus);
                }
            }
            
            if (dist < minDistance) {
                minDistance = dist;
                bestPartyId = party.id;
            }
        });
        
        // 3. [선택 적용] 무당층 처리
        if (state.config.useUndecided && minDistance > state.config.undecidedDistance) {
            // 모든 정당이 본인 이념에서 너무 멀다면 지지를 유보함 (무당층)
            if (surveyRound === 1) {
                voter.support1 = null;
            } else {
                voter.support2 = null;
            }
        } else {
            // 가장 가까운 정당 매칭
            if (surveyRound === 1) {
                voter.support1 = bestPartyId;
            } else {
                voter.support2 = bestPartyId;
            }
        }
    });
    
    // 정당별 지지 득표율 집계
    activeParties.forEach(party => {
        const supporters = state.voters.filter(v => {
            return (surveyRound === 1) ? (v.support1 === party.id) : (v.support2 === party.id);
        });
        
        const pct = (supporters.length / state.voters.length) * 100;
        
        if (surveyRound === 1) {
            party.votes1 = supporters.length;
            party.pct1 = pct;
        } else {
            party.votes2 = supporters.length;
            party.pct2 = pct;
        }
    });
    
    // 최종 라운드면 의석수 배분
    if (surveyRound === 2) {
        allocateSeats();
    }
}

/**
 * 의석 배분 및 사표 통계 분석 함수
 */
function allocateSeats() {
    const activeParties = state.parties.filter(p => p.active);
    const totalVoters = state.voters.length;
    
    // 의석수 초기화
    activeParties.forEach(p => p.seats = 0);
    
    let totalWastedVotes = 0;
    
    if (state.config.electoralSystem === "majoritarian") {
        // [소선거구 다수대표제 모드]
        // 100명의 유권자를 ID 순서대로 20명씩 5개 선거구(제1~5선거구)로 분할합니다.
        // 각 선거구별 1위 득표 정당이 해당 지역구 의석(20석)을 독식하고, 2위 이하 정당의 득표는 모두 사표가 됩니다.
        const districtCount = 5;
        const votersPerDistrict = Math.ceil(totalVoters / districtCount);
        const seatsPerDistrict = 20; // 5개 선거구 * 20석 = 100석
        
        for (let d = 0; d < districtCount; d++) {
            const startIdx = d * votersPerDistrict;
            const endIdx = Math.min(totalVoters, (d + 1) * votersPerDistrict);
            const districtVoters = state.voters.slice(startIdx, endIdx);
            
            // 선거구 내 정당별 득표 집계
            const districtVotes = {};
            activeParties.forEach(p => districtVotes[p.id] = 0);
            let undecidedInDistrict = 0;
            
            districtVoters.forEach(voter => {
                if (voter.support2) {
                    districtVotes[voter.support2] = (districtVotes[voter.support2] || 0) + 1;
                } else {
                    undecidedInDistrict++;
                }
            });
            
            // 선거구 내 1위 정당 결정
            let maxVotes = -1;
            let winners = [];
            
            activeParties.forEach(p => {
                const votes = districtVotes[p.id];
                if (votes > maxVotes) {
                    maxVotes = votes;
                    winners = [p];
                } else if (votes === maxVotes && votes > 0) {
                    winners.push(p);
                }
            });
            
            if (winners.length > 0 && maxVotes > 0) {
                // 공동 1위인 경우 해당 지역구의 20석을 균등하게 나눔
                const seatsPerWinner = Math.floor(seatsPerDistrict / winners.length);
                winners.forEach(w => {
                    w.seats += seatsPerWinner;
                });
                
                // 공동 당선 균등 분배 후 남는 잔여석이 있으면 득표순 1위에 추가(정수 맞춤)
                const distributedSum = seatsPerWinner * winners.length;
                const leftover = seatsPerDistrict - distributedSum;
                if (leftover > 0) {
                    winners[0].seats += leftover;
                }
                
                // 해당 선거구 사표(Wasted Votes) 누적: 당선인(들)이 획득한 표를 제외한 모든 표(낙선표) + 기권표
                activeParties.forEach(p => {
                    if (!winners.includes(p)) {
                        totalWastedVotes += districtVotes[p.id];
                    }
                });
                totalWastedVotes += undecidedInDistrict;
            } else {
                // 아무 정당도 선거구에서 득표하지 못한 경우 전원 기권(사표) 처리
                totalWastedVotes += districtVoters.length;
            }
        }
        
        state.electoralStats = {
            systemName: "소선거구 다수대표제",
            systemDesc: "유권자가 5개 지역구로 분할되며, 각 선거구별 1위 정당이 의석(20석씩 총 100석)을 독식합니다. 거대 정당에게 유리하여 양당제 수렴을 유도하나, 낙선자에게 던진 엄청난 양의 표가 버려지는 '사표(死票)' 문제를 직접 관찰할 수 있습니다.",
            wastedVotes: totalWastedVotes,
            wastedPercent: (totalWastedVotes / totalVoters) * 100
        };
        
    } else {
        // [비례대표제 모드]
        // 전체 유권자 대비 득표 비율로 정직하게 배분(전형적인 다당제 수렴 및 민의의 정직한 반영)
        let allocatedSum = 0;
        
        activeParties.forEach(party => {
            const share = (party.votes2 / totalVoters) * 100;
            party.seats = Math.round(share);
            allocatedSum += party.seats;
        });
        
        let diff = 100 - allocatedSum;
        if (diff !== 0 && activeParties.length > 0) {
            activeParties.sort((a, b) => b.votes2 - a.votes2);
            activeParties[0].seats += diff;
        }
        
        // 비례대표제 하에서의 사표: 의석을 전혀 얻지 못한 정당(0석)에 던져진 표 + 기권표
        activeParties.forEach(p => {
            if (p.seats === 0) {
                totalWastedVotes += p.votes2;
            }
        });
        const undecidedCount = state.voters.filter(v => !v.support2).length;
        totalWastedVotes += undecidedCount;
        
        state.electoralStats = {
            systemName: "비례대표제",
            systemDesc: "정당의 득표비율에 비례하여 100석의 의석을 정직하게 분배하는 제도입니다. 소수당의 의회 진출을 보장하고 사표율을 획기적으로 낮추어 다당제를 정착시키는 데 기여합니다.",
            wastedVotes: totalWastedVotes,
            wastedPercent: (totalWastedVotes / totalVoters) * 100
        };
    }
}

// ==========================================
// 5. 단계 제어 및 상태 머신 (State Machine)
// ==========================================

/**
 * 특정 스테이지로 진입할 때 실행되는 초기화/이벤트 라우터
 * @param {number} nextStage 이동할 스테이지 번호
 * @param {boolean} pushHistory 히스토리 스냅샷에 저장할지 여부
 */
function transitionToStage(nextStage, pushHistory = true) {
    if (pushHistory) {
        // 실행 취소(Undo)를 위해 딥카피 백업
        state.history.push({
            stage: state.stage,
            parties: JSON.parse(JSON.stringify(state.parties)),
            voters: JSON.parse(JSON.stringify(state.voters)),
            config: JSON.parse(JSON.stringify(state.config))
        });
        document.getElementById("btn-undo").disabled = false;
    }
    
    state.stage = nextStage;
    
    // 1. 헤더 타임라인 하이라이팅 제어
    for (let i = 1; i <= 8; i++) {
        const stepEl = document.getElementById(`step-nav-${i}`);
        if (stepEl) {
            stepEl.classList.remove("active", "completed");
            if (i < nextStage) {
                stepEl.classList.add("completed");
            } else if (i === nextStage) {
                stepEl.classList.add("active");
            }
        }
    }
    
    // 2. 하단 작업영역 탭 토글
    for (let i = 1; i <= 8; i++) {
        const tabEl = document.getElementById(`panel-stage-${i}`);
        if (tabEl) {
            tabEl.classList.add("hidden");
        }
    }
    const activeTab = document.getElementById(`panel-stage-${nextStage}`);
    if (activeTab) {
        activeTab.classList.remove("hidden");
    }
    
    // 3. 교사용 힌트 패널 안내 메시지 교체
    const hintContent = TEACHER_HINTS[nextStage] || "수업 진행 중입니다.";
    document.getElementById("teacher-hint-content").innerHTML = hintContent;
    
    // 4. 각 스테이지 진입 시 처리 로직 분기
    switch (nextStage) {
        case 1:
            setGuideText("각 정당의 이름과 초기 이념 위치를 등록하세요. 이 위치는 정당의 기본 정체성을 나타냅니다.");
            renderSetupParties();
            break;
            
        case 2:
            setGuideText(`${state.config.countryName}의 유권자 ${state.config.voterCount}명이 공개되었습니다. 점 하나가 한 명의 유권자입니다.`);
            // 유권자 재생성 (만약 비어있을 때만 새로 만듦)
            if (state.voters.length === 0 || state.voters.length !== parseInt(state.config.voterCount)) {
                generateVoters();
            }
            renderVotersOnMap();
            renderPartyFlagsOnMap();
            break;
            
        case 3:
            setGuideText("정당들은 100억 원의 예산을 어디에 쓸지 결정합니다. 예산 배분은 정당의 정책 위치를 이동시킵니다.");
            // 첫 번째 정당을 자동 선택하여 예산 입력 폼 활성화
            if (state.parties.length > 0) {
                initBudgetSelection(state.parties[0].id);
            }
            renderVotersOnMap(); // 회색 유권자 유지
            renderPartyFlagsOnMap();
            break;
            
        case 4:
            setGuideText("유권자는 자신과 가장 가까운 정당을 지지합니다. 어느 정당이 가장 넓은 지지를 얻었을까요?");
            renderVotersOnMap(1);
            renderPartyFlagsOnMap(1);
            showSurveyReportSummary(1);
            break;
            
        case 5:
            setGuideText("정당들은 지지층을 지킬지, 중도층으로 이동할지 선택해야 합니다.");
            // 2차 정책 예산 조정
            initRevisionSelection(state.parties.filter(p => p.active)[0].id);
            renderVotersOnMap(1); // 1차 지지 색 유지
            renderPartyFlagsOnMap(1);
            break;
            
        case 6:
            setGuideText("두 정당이 합쳐져도 표가 단순히 더해지지는 않습니다. 유권자는 새 정당의 위치를 다시 판단합니다.");
            initAllianceSelection();
            renderVotersOnMap(1); // 1차 지지 색 유지
            renderPartyFlagsOnMap(1);
            break;
            
        case 7:
            setGuideText("최종 선택의 결과를 확인합니다. 세종국의 집권 정당은 어디일까요?");
            renderVotersOnMap(2);
            renderPartyFlagsOnMap(2);
            showSurveyReportSummary(2);
            break;
            
        case 8:
            setGuideText("정당의 승패는 정책 위치, 유권자 분포, 단일화 전략이 함께 만든 결과입니다.");
            initAnalysisScreen();
            break;
    }
    
    // 5. 우측 실시간 패널 새로고침
    renderLeaderboard();
    
    // 6. 데이터 내보내기/복사 버튼 가시성
    const btnCopy = document.getElementById("btn-copy-summary");
    const btnExport = document.getElementById("btn-export-json");
    if (nextStage === 8) {
        btnCopy.style.display = "inline-flex";
        btnExport.style.display = "inline-flex";
    } else {
        btnCopy.style.display = "none";
        btnExport.style.display = "none";
    }
    
    // 세션 자동 저장 트리거
    saveSession();
}

/**
 * 실행 취소 (되돌리기) 기능
 */
function executeUndo() {
    if (state.history.length === 0) return;
    
    AudioSynth.playClick();
    const previousState = state.history.pop();
    
    // 상태 원상 복구
    state.stage = previousState.stage;
    state.parties = previousState.parties;
    state.voters = previousState.voters;
    state.config = previousState.config;
    
    if (state.history.length === 0) {
        document.getElementById("btn-undo").disabled = true;
    }
    
    // 다음 라우팅
    transitionToStage(state.stage, false);
    saveSession();
}

/**
 * 전체 데이터 초기화 및 정당 등록으로 리셋
 */
function resetGame(promptConfirm = true) {
    if (promptConfirm) {
        if (!confirm("모든 정당 정보와 시뮬레이션 결과가 초기화됩니다. 리셋하시겠습니까?")) {
            return;
        }
    }
    
    AudioSynth.playClick();
    state.stage = 1;
    state.parties = [];
    state.voters = [];
    state.history = [];
    state.activePartyIdForBudget = null;
    document.getElementById("btn-undo").disabled = true;
    
    // SVG 경로 등 청소
    const pathsLayer = document.getElementById("paths-layer");
    if (pathsLayer) pathsLayer.innerHTML = "";
    
    transitionToStage(1, false);
    saveSession();
}

// ==========================================
// 5.5 세션 상태 자동저장 및 복구 모듈
// ==========================================
function saveSession() {
    try {
        const sessionData = {
            stage: state.stage,
            parties: state.parties,
            voters: state.voters,
            config: state.config,
            history: state.history,
            activePartyIdForBudget: state.activePartyIdForBudget
        };
        localStorage.setItem("voter_spectrum_session", JSON.stringify(sessionData));
    } catch (e) {
        console.error("Session auto-save failed", e);
    }
}

function restoreSession() {
    const raw = localStorage.getItem("voter_spectrum_session");
    if (!raw) return false;
    try {
        const sessionData = JSON.parse(raw);
        state.stage = sessionData.stage;
        state.parties = sessionData.parties;
        state.voters = sessionData.voters;
        state.config = sessionData.config;
        state.history = sessionData.history || [];
        state.activePartyIdForBudget = sessionData.activePartyIdForBudget || null;
        
        // 설정 복구 연동
        document.getElementById("display-country-name").innerText = state.config.countryName;
        document.getElementById("btn-undo").disabled = state.history.length === 0;
        
        // 화면 전이 처리
        transitionToStage(state.stage, false);
        
        // 각 단계의 그래픽 상태 복원
        if (state.stage >= 2) {
            const round = state.stage >= 7 ? 2 : (state.stage >= 4 ? 1 : 0);
            renderVotersOnMap(round);
            renderPartyFlagsOnMap(round);
        }
        
        return true;
    } catch (e) {
        console.error("Session restore failed", e);
        return false;
    }
}

// 안내 배너 텍스트 헬퍼
function setGuideText(msg) {
    document.getElementById("guide-text").innerHTML = msg;
}

// ==========================================
// 6. UI 렌더링 & 뷰 제어 (Rendering Engine)
// ==========================================

/**
 * 이념 스펙트럼 좌표 환산 헬퍼 (X, Y -> Map %)
 */
function getMapPercent(coordX, coordY) {
    // X 이념 [-100, 100] -> [0, 100] % (왼쪽 세금확대, 오른쪽 세금인하)
    const leftPct = 50 + (coordX / 2);
    // Y 이념 [-100, 100] -> [0, 100] % (위쪽 자유, 아래쪽 질서)
    const topPct = 50 - (coordY / 2); 
    
    return { leftPct, topPct };
}

/**
 * 지도 상에 유권자 점을 그리는 함수
 * @param {number} surveyRound 지지율 색상을 채울 라운드 (0: 회색, 1: 1차여론조사, 2: 최종개표)
 */
function renderVotersOnMap(surveyRound = 0) {
    const container = document.getElementById("voters-layer");
    container.innerHTML = "";
    
    state.voters.forEach(voter => {
        const dot = document.createElement("div");
        dot.className = "voter-dot";
        
        // 위치 변환
        const { leftPct, topPct } = getMapPercent(voter.x, voter.y);
        dot.style.left = `${leftPct}%`;
        dot.style.top = `${topPct}%`;
        
        // 지지하는 정당 색상 결정
        let supportPartyId = null;
        if (surveyRound === 1) supportPartyId = voter.support1;
        else if (surveyRound === 2) supportPartyId = voter.support2;
        
        if (supportPartyId) {
            const party = state.parties.find(p => p.id === supportPartyId);
            if (party && party.active) {
                dot.style.backgroundColor = party.color;
                dot.style.boxShadow = `0 0 8px ${party.color}`;
            } else {
                // 지지당이 비활성화(합당 등)된 경우 회색
                dot.style.backgroundColor = "#475569";
                dot.style.boxShadow = "none";
                dot.classList.add("undecided");
            }
        } else {
            // 무당층이거나 매칭 전
            dot.style.backgroundColor = "#64748b";
            dot.style.boxShadow = "none";
            if (surveyRound > 0) {
                dot.classList.add("undecided");
            }
        }
        
        // 마우스 호버 시 툴팁 이벤트
        dot.addEventListener("mouseenter", (e) => {
            showTooltip(e, `
                <div class="tooltip-title">${voter.groupName}</div>
                <div class="tooltip-row"><span class="tooltip-label">직업:</span> ${voter.job}</div>
                <div class="tooltip-row"><span class="tooltip-label">관심:</span> 💎 ${voter.issue}</div>
                <div class="tooltip-row"><span class="tooltip-label">성향:</span> 경제 ${voter.x > 0 ? '우' : '좌'}(${Math.abs(voter.x)}), 사회 ${voter.y > 0 ? '자유' : '질서'}(${Math.abs(voter.y)})</div>
            `);
        });
        
        dot.addEventListener("mouseleave", hideTooltip);
        
        container.appendChild(dot);
    });
}

/**
 * 지도 상에 정당 깃발 그리기
 * @param {number} mode 0:초기이념, 1:1차여론조사, 2:최종개표
 */
function renderPartyFlagsOnMap(mode = 0) {
    const container = document.getElementById("parties-layer");
    container.innerHTML = "";
    
    // 화살표 그릴 SVG 캔버스 준비
    const pathsLayer = document.getElementById("paths-layer");
    pathsLayer.innerHTML = "";
    
    // 승자 구하기 (최종 개표 단계일 때만 왕관 제공)
    let winnerId = null;
    if (state.stage >= 7) {
        const activeParties = state.parties.filter(p => p.active);
        if (activeParties.length > 0) {
            const sorted = [...activeParties].sort((a,b) => (b.votes2 || 0) - (a.votes2 || 0));
            winnerId = sorted[0].id;
        }
    }
    
    state.parties.forEach(party => {
        if (!party.active) return; // 합당으로 은퇴한 정당은 제외
        
        let cx = party.initX;
        let cy = party.initY;
        
        if (mode === 1 && party.x1 !== undefined) {
            cx = party.x1;
            cy = party.y1;
        } else if (mode === 2 && party.x2 !== undefined) {
            cx = party.x2;
            cy = party.y2;
        }
        
        const flag = document.createElement("div");
        flag.className = "party-flag";
        if (party.id === winnerId) {
            flag.classList.add("winner");
        }
        
        const { leftPct, topPct } = getMapPercent(cx, cy);
        flag.style.left = `${leftPct}%`;
        flag.style.top = `${topPct}%`;
        
        // 내장 아이콘
        const iconEmoji = (party.id === winnerId) ? "👑" : "🚩";
        
        flag.innerHTML = `
            <div class="party-flag-icon" style="background-color: ${party.color};">
                ${iconEmoji}
            </div>
            <div class="party-flag-name">${party.name}</div>
        `;
        
        // 호버 시 정당 정책 요약 툴팁
        flag.addEventListener("mouseenter", (e) => {
            const budgetSrc = (mode === 2) ? party.revisedBudget : party.budget;
            let budgetSummary = "";
            for (const key in POLICY_VECTORS) {
                budgetSummary += `<br>• ${POLICY_VECTORS[key].name}: ${budgetSrc[key] || 0}억`;
            }
            
            showTooltip(e, `
                <div class="tooltip-title" style="color: ${party.color}">${party.name}</div>
                <div class="tooltip-row"><i>"${party.slogan}"</i></div>
                <div class="tooltip-row"><span class="tooltip-label">핵심:</span> ${party.promise}</div>
                <div class="tooltip-row"><span class="tooltip-label">이념 좌표:</span> (${cx.toFixed(1)}, ${cy.toFixed(1)})</div>
                <div class="tooltip-row"><span class="tooltip-label">예산 배분표:</span>${budgetSummary}</div>
            `);
        });
        flag.addEventListener("mouseleave", hideTooltip);
        
        container.appendChild(flag);
        
        // 5단계(정책수정) 혹은 6단계(단일화) 진입 시 정책 이동 점선 경로 그리기
        if ((state.stage === 5 || state.stage === 6) && party.x1 !== undefined && party.x2 !== undefined) {
            drawPathLine(party.x1, party.y1, party.x2, party.y2, party.color);
        }
    });
}

// 두 좌표 사이의 점선 화살표 드로잉 (SVG)
function drawPathLine(x1, y1, x2, y2, color) {
    const svg = document.getElementById("paths-layer");
    if (!svg) return;
    
    const p1 = getMapPercent(x1, y1);
    const p2 = getMapPercent(x2, y2);
    
    // 미세한 이동이면 화살표 패스 생략
    const dist = Math.sqrt(Math.pow(p1.leftPct - p2.leftPct, 2) + Math.pow(p1.topPct - p2.topPct, 2));
    if (dist < 2.0) return;
    
    // SVG 화살표 헤더 마커 추가 (최초 1회만 생성)
    if (!document.getElementById("arrow-marker")) {
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
            <marker id="arrow-marker" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L6,3 Z" fill="#ffffff" />
            </marker>
        `;
        svg.appendChild(defs);
    }
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", `${p1.leftPct}%`);
    line.setAttribute("y1", `${p1.topPct}%`);
    line.setAttribute("x2", `${p2.leftPct}%`);
    line.setAttribute("y2", `${p2.topPct}%`);
    line.setAttribute("stroke", color);
    line.setAttribute("class", "party-path-line");
    line.setAttribute("marker-end", "url(#arrow-marker)");
    
    svg.appendChild(line);
}

/**
 * 우측 정당 현황 카드 패널 그리기
 */
function renderLeaderboard() {
    const listContainer = document.getElementById("party-list");
    listContainer.innerHTML = "";
    
    // 득표 지수 기준 정렬
    const sortedParties = [...state.parties];
    
    if (state.stage >= 7) {
        // 최종 득표 순 정렬
        sortedParties.sort((a, b) => {
            if (!a.active && b.active) return 1;
            if (a.active && !b.active) return -1;
            return (b.votes2 || 0) - (a.votes2 || 0);
        });
    } else if (state.stage >= 4) {
        // 1차 여론조사 득표 순 정렬
        sortedParties.sort((a, b) => {
            if (!a.active && b.active) return 1;
            if (a.active && !b.active) return -1;
            return (b.votes1 || 0) - (a.votes1 || 0);
        });
    }
    
    if (sortedParties.length === 0) {
        document.getElementById("stats-summary").innerText = "등록된 정당이 없습니다.";
        return;
    }
    
    const activeCount = state.parties.filter(p => p.active).length;
    document.getElementById("stats-summary").innerText = `현재 ${activeCount}개 정당 경쟁 중`;
    
    sortedParties.forEach((party, idx) => {
        const card = document.createElement("div");
        card.className = "party-card";
        if (!party.active) {
            card.classList.add("inactive");
        }
        
        // 1위 하이라이트
        if (idx === 0 && party.active && state.stage >= 4) {
            card.classList.add("rank-1");
        }
        
        // 색상 띠
        const bar = document.createElement("div");
        bar.className = "party-card-accent-bar";
        bar.style.backgroundColor = party.color;
        card.appendChild(bar);
        
        // 내용 구성
        const rankTag = (state.stage >= 4 && party.active) ? `<span class="party-rank-badge">${idx + 1}위</span>` : "";
        
        // 좌표 구하기
        let currentX = party.initX;
        let currentY = party.initY;
        
        if (state.stage >= 7) {
            currentX = party.x2 !== undefined ? party.x2 : party.initX;
            currentY = party.y2 !== undefined ? party.y2 : party.initY;
        } else if (state.stage >= 4) {
            currentX = party.x1 !== undefined ? party.x1 : party.initX;
            currentY = party.y1 !== undefined ? party.y1 : party.initY;
        }
        
        // 지지율 정보
        let pctText = "-";
        let seatText = "-";
        let voteVal = 0;
        
        if (state.stage >= 7) {
            voteVal = party.pct2 || 0;
            pctText = `${voteVal.toFixed(1)}%`;
            seatText = `${party.seats || 0}석`;
        } else if (state.stage >= 4) {
            voteVal = party.pct1 || 0;
            pctText = `${voteVal.toFixed(1)}%`;
        }
        
        card.innerHTML += `
            <div class="party-card-header">
                <div class="party-card-title-block">
                    <span class="party-card-name">
                        ${party.name} ${party.id.startsWith("merged_") ? "🤝" : ""}
                    </span>
                    <span class="party-card-slogan">${party.slogan}</span>
                </div>
                ${rankTag}
            </div>
            <div class="party-stats-grid">
                <div class="party-stat-item">
                    <span class="party-stat-lbl">현재 좌표</span>
                    <span class="party-stat-val">(${currentX.toFixed(0)}, ${currentY.toFixed(0)})</span>
                </div>
                <div class="party-stat-item">
                    <span class="party-stat-lbl">예상 지지율</span>
                    <span class="party-stat-val" style="color: ${party.color};">${pctText}</span>
                </div>
                ${state.stage >= 7 ? `
                <div class="party-stat-item" style="grid-column: span 2; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px; margin-top: 4px;">
                    <span class="party-stat-lbl">확보 의석 수 (100석 비례)</span>
                    <span class="party-stat-val" style="color: var(--color-gold); font-size: 15px;">${seatText}</span>
                </div>` : ""}
            </div>
        `;
        
        // 지지율 미니 게이지 바 추가
        if (state.stage >= 4 && party.active) {
            const barBg = document.createElement("div");
            barBg.className = "party-progress-bar-bg";
            const barFill = document.createElement("div");
            barFill.className = "party-progress-bar-fill";
            barFill.style.backgroundColor = party.color;
            barFill.style.width = `${voteVal}%`;
            barBg.appendChild(barFill);
            card.appendChild(barBg);
        }
        
        listContainer.appendChild(card);
    });
    
    // 무당층 수치 갱신
    updateSystemStatsBar();
}

// 실시간 무당층 비율 산출 및 하단 수치 동기화
function updateSystemStatsBar() {
    document.getElementById("val-voter-count").innerText = `${state.voters.length}명`;
    document.getElementById("val-seat-count").innerText = `100석`;
    
    if (state.stage >= 4) {
        const emptySupportCount = state.voters.filter(v => {
            return (state.stage >= 7) ? (v.support2 === null) : (v.support1 === null);
        }).length;
        const pct = ((emptySupportCount / state.voters.length) * 100).toFixed(0);
        document.getElementById("val-undecided-pct").innerText = `${pct}%`;
    } else {
        document.getElementById("val-undecided-pct").innerText = `0%`;
    }
}

// ==========================================
// 7. 정당 등록 컨트롤러 (Stage 1)
// ==========================================

/**
 * 정당 등록 폼 렌더링
 */
function renderSetupParties() {
    const list = document.getElementById("parties-setup-list");
    list.innerHTML = "";
    
    state.parties.forEach((party, index) => {
        const card = document.createElement("div");
        card.className = "party-setup-card";
        
        card.innerHTML = `
            <button class="btn-remove-setup-party" onclick="removeParty(${index})">&times;</button>
            <div class="setup-form-row">
                <input type="color" class="color-picker" value="${party.color}" onchange="updatePartyProp(${index}, 'color', this.value)">
                <input type="text" class="form-control" placeholder="정당명 입력" value="${party.name}" onchange="updatePartyProp(${index}, 'name', this.value)">
            </div>
            <div class="setup-form-row">
                <input type="text" class="form-control" placeholder="정당 슬로건" value="${party.slogan}" onchange="updatePartyProp(${index}, 'slogan', this.value)">
            </div>
            <div class="setup-form-row">
                <input type="text" class="form-control" placeholder="대표 공약" value="${party.promise}" onchange="updatePartyProp(${index}, 'promise', this.value)">
            </div>
            
            <div class="setup-coordinates-slider">
                <div class="coord-label">
                    <span>💵 경제 (세금/복지)</span>
                    <span id="lbl-coord-x-${index}" style="font-weight: 800; color: var(--color-gold);">${party.initX > 0 ? '+' : ''}${party.initX} <span style="font-size: 11.5px; font-weight: normal; color: var(--text-muted); margin-left: 4px;">(${getXMeaning(party.initX)})</span></span>
                </div>
                <input type="range" class="slider" min="-100" max="100" value="${party.initX}" oninput="updatePartyCoord(${index}, 'initX', this.value)">
                
                <div class="coord-label" style="margin-top: 8px;">
                    <span>🕊️ 사회 (자유/질서)</span>
                    <span id="lbl-coord-y-${index}" style="font-weight: 800; color: var(--color-gold);">${party.initY > 0 ? '+' : ''}${party.initY} <span style="font-size: 11.5px; font-weight: normal; color: var(--text-muted); margin-left: 4px;">(${getYMeaning(party.initY)})</span></span>
                </div>
                <input type="range" class="slider" min="-100" max="100" value="${party.initY}" oninput="updatePartyCoord(${index}, 'initY', this.value)">
            </div>
        `;
        list.appendChild(card);
    });
    
    // 최대 정당 수 제어 (2~6개)
    const btnAdd = document.getElementById("btn-add-party");
    if (state.parties.length >= 6) {
        btnAdd.disabled = true;
    } else {
        btnAdd.disabled = false;
    }
}

/**
 * 새 정당 오브젝트 추가
 */
function addNewParty() {
    AudioSynth.playClick();
    if (state.parties.length >= 6) return;
    
    const palette = ["#3b82f6", "#10b981", "#ef4444", "#d946ef", "#f59e0b", "#6366f1"];
    const usedColors = state.parties.map(p => p.color);
    const nextColor = palette.find(c => !usedColors.includes(c)) || "#94a3b8";
    
    const index = state.parties.length + 1;
    
    state.parties.push({
        id: `party_${Date.now()}_${index}`,
        name: `정당 ${index}`,
        color: nextColor,
        slogan: "정의롭고 따뜻한 국가 실현",
        promise: "민생을 풍요롭게 하는 핵심 공약",
        initX: 0,
        initY: 0,
        budget: { youth: 20, old: 20, estate: 20, environment: 20, defense: 20 },
        revisedBudget: { youth: 20, old: 20, estate: 20, environment: 20, defense: 20 },
        active: true
    });
    
    renderSetupParties();
    renderLeaderboard();
    saveSession();
}

/**
 * 정당 삭제
 */
window.removeParty = function(idx) {
    AudioSynth.playClick();
    if (state.parties.length <= 2) {
        alert("최소 2개 이상의 정당이 필요합니다.");
        return;
    }
    state.parties.splice(idx, 1);
    renderSetupParties();
    renderLeaderboard();
    saveSession();
};

/**
 * 정당 속성 값 동기화
 */
window.updatePartyProp = function(idx, prop, val) {
    if (state.parties[idx]) {
        state.parties[idx][prop] = val;
        renderLeaderboard();
        saveSession();
    }
};

/**
 * 정당 실시간 슬라이더 동기화
 */
window.updatePartyCoord = function(idx, axis, val) {
    const valueNum = parseInt(val);
    if (state.parties[idx]) {
        state.parties[idx][axis] = valueNum;
        
        // 라벨 갱신
        const labelId = axis === "initX" ? `lbl-coord-x-${idx}` : `lbl-coord-y-${idx}`;
        const lblEl = document.getElementById(labelId);
        if (lblEl) {
            const desc = axis === "initX" ? getXMeaning(valueNum) : getYMeaning(valueNum);
            lblEl.innerHTML = `${valueNum > 0 ? '+' : ''}${valueNum} <span style="font-size: 11.5px; font-weight: normal; color: var(--text-muted); margin-left: 4px;">(${desc})</span>`;
        }
        saveSession();
    }
};

/**
 * 빠른 시작 (샘플 4개 자동 입력)
 */
function applyQuickStart() {
    AudioSynth.playClick();
    state.parties = SAMPLE_PARTIES.map((p, i) => ({
        id: `party_sample_${i + 1}`,
        name: p.name,
        color: p.color,
        slogan: p.slogan,
        promise: p.promise,
        initX: p.initX,
        initY: p.initY,
        budget: { youth: 20, old: 20, estate: 20, environment: 20, defense: 20 },
        revisedBudget: { youth: 20, old: 20, estate: 20, environment: 20, defense: 20 },
        active: true
    }));
    
    renderSetupParties();
    renderLeaderboard();
    
    // 정당 등록 완료하고 바로 2단계 유권자 공개로 전이
    submitRegistration();
}

/**
 * 정당 설정 저장 완료
 */
function submitRegistration() {
    if (state.parties.length < 2) {
        alert("최소 2개 정당을 등록해야 게임 진행이 가능합니다.");
        return;
    }
    
    // 공백 이름 체크
    const blankParty = state.parties.find(p => p.name.trim() === "");
    if (blankParty) {
        alert("정당 이름을 공백 없이 작성해 주세요.");
        return;
    }
    
    AudioSynth.playSuccess();
    transitionToStage(2);
}

// ==========================================
// 8. 예산 입력 컨트롤러 (Stage 3 & 5)
// ==========================================

/**
 * 예산 입력 정당 셀렉터 렌더링
 * @param {string} containerId 칩들이 담길 엘리먼트 ID
 * @param {string} selectedId 선택된 정당 ID
 * @param {boolean} isRevision 2차 정책수정용인지 여부
 */
function renderBudgetSelectorChips(containerId, selectedId, isRevision = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    
    const activeParties = state.parties.filter(p => p.active);
    
    activeParties.forEach(party => {
        const chip = document.createElement("div");
        chip.className = "party-select-chip";
        if (party.id === selectedId) {
            chip.classList.add("active");
        }
        
        // 예산 합계 검증
        const budgetSrc = isRevision ? party.revisedBudget : party.budget;
        const total = Object.values(budgetSrc).reduce((sum, v) => sum + v, 0);
        const isDone = (total === 100);
        
        if (isDone) {
            chip.classList.add("completed");
        }
        
        chip.innerHTML = `
            <span class="party-chip-color" style="width: 12px; height: 12px; border-radius: 50%; background-color: ${party.color}; display: inline-block;"></span>
            <span>${party.name}</span>
            <span class="party-chip-status" style="color: ${isDone ? '#10b981' : '#f59e0b'};">
                ${total}억 ${isDone ? '✓' : '⚠️'}
            </span>
        `;
        
        chip.addEventListener("click", () => {
            AudioSynth.playClick();
            if (isRevision) {
                initRevisionSelection(party.id);
            } else {
                initBudgetSelection(party.id);
            }
        });
        
        container.appendChild(chip);
    });
}

/**
 * 3단계 예산 입력 활성화
 */
function initBudgetSelection(partyId) {
    state.activePartyIdForBudget = partyId;
    renderBudgetSelectorChips("budget-party-selector-container", partyId, false);
    renderBudgetInputForm("budget-input-form-area", partyId, false);
    updateBudgetSumBar(partyId, false);
}

/**
 * 5단계 정책 수정 입력 활성화
 */
function initRevisionSelection(partyId) {
    state.activePartyIdForBudget = partyId;
    renderBudgetSelectorChips("revise-party-selector-container", partyId, true);
    renderBudgetInputForm("revise-input-form-area", partyId, true);
    updateBudgetSumBar(partyId, true);
}

/**
 * 슬라이더 형태의 예산 입력 폼 구성
 */
function renderBudgetInputForm(formAreaId, partyId, isRevision = false) {
    const area = document.getElementById(formAreaId);
    area.innerHTML = "";
    
    const party = state.parties.find(p => p.id === partyId);
    if (!party) return;
    
    const budgetSrc = isRevision ? party.revisedBudget : party.budget;
    
    for (const key in POLICY_VECTORS) {
        const category = POLICY_VECTORS[key];
        const val = budgetSrc[key] || 0;
        
        // 설명 라벨 구성
        let vectorDesc = "";
        if (category.x !== 0) vectorDesc += `경제:${category.x > 0 ? '우측' : '좌측'}(${Math.abs(category.x)}) `;
        if (category.y !== 0) vectorDesc += `사회:${category.y > 0 ? '자유' : '질서'}(${Math.abs(category.y)})`;
        
        const box = document.createElement("div");
        box.className = "budget-field-box";
        box.style.borderTop = `3px solid ${party.color}`;
        
        box.innerHTML = `
            <h4>${category.name}</h4>
            <div class="budget-field-desc">${vectorDesc}</div>
            <div class="budget-input-wrapper">
                <input type="range" class="slider" min="0" max="100" value="${val}" 
                       oninput="syncBudgetVal('${partyId}', '${key}', this.value, ${isRevision}, '${formAreaId}')">
                <input type="number" class="form-control" style="width: 60px; padding: 4px;" min="0" max="100" value="${val}"
                       onchange="syncBudgetVal('${partyId}', '${key}', this.value, ${isRevision}, '${formAreaId}')" id="num-budget-${key}">
                <span class="budget-unit">억</span>
            </div>
        `;
        
        area.appendChild(box);
    }
}

/**
 * 슬라이더와 입력상자 간 값 동기화 및 실시간 검증
 */
window.syncBudgetVal = function(partyId, categoryKey, val, isRevision, formAreaId) {
    const num = parseInt(val) || 0;
    const clamped = Math.max(0, Math.min(100, num));
    
    const party = state.parties.find(p => p.id === partyId);
    if (party) {
        if (isRevision) {
            party.revisedBudget[categoryKey] = clamped;
        } else {
            party.budget[categoryKey] = clamped;
        }
        
        // 숫자 텍스트 상자 실시간 동기화
        const inputNum = document.querySelector(`#${formAreaId} [id="num-budget-${categoryKey}"]`);
        if (inputNum) {
            inputNum.value = clamped;
        }
        
        // 슬라이더 동기화
        const slider = document.querySelector(`#${formAreaId} input[type="range"][oninput*="${categoryKey}"]`);
        if (slider) {
            slider.value = clamped;
        }
        
        // 총합 게이지바 갱신
        updateBudgetSumBar(partyId, isRevision);
    }
};

/**
 * 예산 실시간 합계 바 업데이트
 */
function updateBudgetSumBar(partyId, isRevision = false) {
    const party = state.parties.find(p => p.id === partyId);
    if (!party) return;
    
    const budgetSrc = isRevision ? party.revisedBudget : party.budget;
    const sum = Object.values(budgetSrc).reduce((total, val) => total + val, 0);
    
    const fillEl = document.getElementById(isRevision ? "revise-progress-fill" : "budget-progress-fill");
    const textEl = document.getElementById(isRevision ? "revise-progress-text" : "budget-progress-text");
    
    if (fillEl && textEl) {
        // 백분율 가로크기 지정 (100 초과 시 100%)
        const pct = Math.min(100, sum);
        fillEl.style.width = `${pct}%`;
        
        let guideMsg = "";
        if (sum < 100) {
            guideMsg = ` (⚠️ ${100 - sum}억 원 부족합니다)`;
        } else if (sum > 100) {
            guideMsg = ` (❌ ${sum - 100}억 원 초과했습니다)`;
        } else {
            guideMsg = ` (🎉 100억 원 배분 완료!)`;
        }
        
        textEl.innerText = `${sum}억 / 100억${guideMsg}`;
        
        if (sum === 100) {
            fillEl.className = "budget-progress-bar-fill valid";
            textEl.style.color = "var(--color-success)";
        } else {
            fillEl.className = "budget-progress-bar-fill";
            textEl.style.color = sum > 100 ? "var(--color-danger)" : "var(--color-warning)";
        }
    }
    
    // 전체 정당의 예산 입력이 모두 완료(정확히 100억 배분)되었는지 체크하여 메인 진행 버튼 활성화
    checkAllBudgetsCompleted(isRevision);
}

function checkAllBudgetsCompleted(isRevision = false) {
    const activeParties = state.parties.filter(p => p.active);
    const allDone = activeParties.every(party => {
        const budgetSrc = isRevision ? party.revisedBudget : party.budget;
        const total = Object.values(budgetSrc).reduce((sum, v) => sum + v, 0);
        return total === 100;
    });
    
    if (isRevision) {
        // 5단계: 완료 시 단일화 단계 이동 버튼 활성화
        document.getElementById("btn-to-stage6").disabled = !allDone;
    } else {
        // 3단계: 완료 시 여론조사 시작 버튼 활성화
        document.getElementById("btn-run-survey").disabled = !allDone;
    }
}

/**
 * 3단계 예산 개별 저장
 */
function saveSingleBudget() {
    const activeParties = state.parties.filter(p => p.active);
    const currPartyIdx = activeParties.findIndex(p => p.id === state.activePartyIdForBudget);
    
    // 저장 성공음
    AudioSynth.playSuccess();
    
    // 다음 정당으로 칩 자동이동 편의성
    if (currPartyIdx !== -1 && currPartyIdx < activeParties.length - 1) {
        initBudgetSelection(activeParties[currPartyIdx + 1].id);
    } else {
        // 마지막 정당이면 첫 번째로 복귀하되 완료여부 갱신
        initBudgetSelection(activeParties[0].id);
    }
    saveSession();
}

/**
 * 5단계 예산 수정안 저장 및 실시간 경로 드로잉
 */
function saveSingleRevision() {
    AudioSynth.playSuccess();
    
    const activeParties = state.parties.filter(p => p.active);
    
    // 현재 수정 중인 정당의 신규 좌표 연산하여 x2, y2에 보관
    const party = state.parties.find(p => p.id === state.activePartyIdForBudget);
    if (party) {
        const nextCoord = calculateFinalPartyCoordinates(party, true);
        party.x2 = nextCoord.x;
        party.y2 = nextCoord.y;
        
        // 지도 새로 그리기 (경로 실시간 투영)
        renderPartyFlagsOnMap(1);
    }
    
    const currPartyIdx = activeParties.findIndex(p => p.id === state.activePartyIdForBudget);
    if (currPartyIdx !== -1 && currPartyIdx < activeParties.length - 1) {
        initRevisionSelection(activeParties[currPartyIdx + 1].id);
    } else {
        initRevisionSelection(activeParties[0].id);
    }
    saveSession();
}

// ==========================================
// 9. 개표 및 여론조사 긴장감 연출 모듈 (Stage 4 & 7)
// ==========================================

/**
 * 애니메이션 딜레이 스피드 역산
 */
function getAnimDuration() {
    switch (state.config.animSpeed) {
        case "slow": return { count: 1000, drawInterval: 25 };
        case "fast": return { count: 300, drawInterval: 8 };
        default: return { count: 600, drawInterval: 14 };
    }
}

/**
 * 1차 여론조사 애니메이션 및 로직 구동
 */
function runSurveyLogicAndAnimation() {
    // 1. 각 정당의 1차 이념 좌표 최종 연산 적용
    state.parties.forEach(party => {
        const coord = calculateFinalPartyCoordinates(party, false);
        party.x1 = coord.x;
        party.y1 = coord.y;
        
        // 2차 좌표 초기값도 우선 동일하게 설정
        party.x2 = coord.x;
        party.y2 = coord.y;
    });
    
    // 2. 유권자 지지 계산
    runSupportMatching(1);
    
    // 3. 1차 여론조사 결과 화면(Stage 4)으로 이동
    transitionToStage(4);
    
    // 4. 성공 효과음 출력
    AudioSynth.playSuccess();
    
    // 5. 세션 저장
    saveSession();
}

/**
 * 최종 개표 애니메이션 및 로직 구동
 */
function runFinalVoteLogicAndAnimation() {
    AudioSynth.playDrumRoll();
    
    // 단일화나 수정으로 누락된 정당이 있을 경우 좌표 최종 확인
    state.parties.forEach(party => {
        if (party.x2 === undefined) {
            const coord = calculateFinalPartyCoordinates(party, true);
            party.x2 = coord.x;
            party.y2 = coord.y;
        }
    });
    
    // 유권자 최종 지지 매칭
    runSupportMatching(2);
    
    showBroadcastScreen("🏆 제1대 가상 의회 최종 개표 방송", () => {
        transitionToStage(7);
        
        // 승리 팡파르
        AudioSynth.playFanfare();
    });
}

/**
 * 방송 연출용 시네마 스크린 구현
 */
function showBroadcastScreen(titleText, onComplete) {
    const overlay = document.getElementById("broadcast-overlay");
    const titleEl = document.getElementById("broadcast-main-title");
    const countEl = document.getElementById("broadcast-countdown");
    const chartWrapper = document.getElementById("broadcast-chart-wrapper");
    const statusMsg = document.getElementById("broadcast-status-msg");
    const btnSkip = document.getElementById("btn-skip-broadcast");
    
    titleEl.innerText = titleText;
    overlay.classList.remove("hidden");
    countEl.style.display = "flex";
    chartWrapper.innerHTML = "";
    statusMsg.innerText = "전국 선거구별 여론 지형 분석망 가동 중...";
    
    let countdownVal = 3; // 3초 카운트다운
    countEl.innerText = countdownVal;
    
    let countdownTimer = null;
    let mainAnimationTimer = null;
    let barAnimationTimer = null;
    
    // 건너뛰기 기능 연결
    btnSkip.onclick = () => {
        clearInterval(countdownTimer);
        clearTimeout(mainAnimationTimer);
        clearTimeout(barAnimationTimer);
        overlay.classList.add("hidden");
        onComplete();
    };
    
    // 1단계: 초읽기 카운트다운
    countdownTimer = setInterval(() => {
        countdownVal--;
        if (countdownVal > 0) {
            countEl.innerText = countdownVal;
            AudioSynth.playClick();
        } else {
            clearInterval(countdownTimer);
            countEl.style.display = "none";
            AudioSynth.playSuccess();
            
            // 2단계: 실시간 표 집계 및 바 차오름 연출 시작
            statusMsg.innerText = `${state.countryName} 유권자 투표 개표를 시작합니다!`;
            renderBroadcastLiveChart(chartWrapper);
        }
    }, 1000);
    
    // 3단계: 총 개표 방송 완료 시점 처리 (5초 후)
    mainAnimationTimer = setTimeout(() => {
        overlay.classList.add("hidden");
        onComplete();
    }, 5500);
}

// 개표 방송 화면에 각 정당 실시간 그래프 렌더링
function renderBroadcastLiveChart(container) {
    container.innerHTML = "";
    
    const activeParties = state.parties.filter(p => p.active);
    const round = (state.stage >= 6) ? 2 : 1;
    
    activeParties.forEach(party => {
        const targetPct = (round === 1) ? (party.pct1 || 0) : (party.pct2 || 0);
        
        const row = document.createElement("div");
        row.className = "broadcast-chart-bar-row";
        
        row.innerHTML = `
            <div class="broadcast-bar-name" style="color: ${party.color}">${party.name}</div>
            <div class="broadcast-bar-bg">
                <div class="broadcast-bar-fill" id="b-fill-${party.id}" style="background-color: ${party.color}; width: 0%"></div>
            </div>
            <div class="broadcast-bar-val" id="b-val-${party.id}">0%</div>
        `;
        
        container.appendChild(row);
        
        // 지지율 막대 서서히 충전 애니메이션 효과 호출
        setTimeout(() => {
            const fill = document.getElementById(`b-fill-${party.id}`);
            const valEl = document.getElementById(`b-val-${party.id}`);
            if (fill) fill.style.width = `${targetPct}%`;
            
            // 숫자 카운트업
            let currentNum = 0;
            const interval = setInterval(() => {
                if (currentNum >= targetPct) {
                    clearInterval(interval);
                    valEl.innerText = `${targetPct.toFixed(1)}%`;
                } else {
                    currentNum += 0.5;
                    valEl.innerText = `${currentNum.toFixed(1)}%`;
                }
            }, 15);
        }, 100);
    });
}

/**
 * 1차 및 최종 결과 분석 리포트 요약문 매칭 생성
 */
function showSurveyReportSummary(round = 1) {
    const summaryText = document.getElementById(round === 1 ? "survey-summary-text" : "final-summary-text");
    const marquee = document.getElementById(round === 1 ? "survey-result-marquee" : "final-result-marquee");
    
    const activeParties = state.parties.filter(p => p.active);
    // 내림차순 정렬
    const sorted = [...activeParties].sort((a,b) => {
        return (round === 1) ? (b.votes1 - a.votes1) : (b.votes2 - a.votes2);
    });
    
    if (sorted.length === 0) return;
    
    const winner = sorted[0];
    const runnerUp = sorted[1];
    
    const winnerPct = round === 1 ? winner.pct1 : winner.pct2;
    
    if (round === 1) {
        marquee.innerText = `📢 1차 여론조사 1위: ${winner.name}!`;
        
        let report = `국민 지지도 성향 조사 결과, <strong>${winner.name}</strong>이(가) 지지율 <strong>${winnerPct.toFixed(1)}%</strong>로 선두를 달렸습니다. `;
        
        if (runnerUp) {
            report += `이어 <strong>${runnerUp.name}</strong>(이)가 ${runnerUp.pct1.toFixed(1)}%로 바짝 뒤쫓고 있습니다. `;
        }
        
        // 이념적 딜레마 피드백 문구 생성
        const winnerVector = calculateBudgetVector(winner.budget);
        const winExtremeness = Math.sqrt(winnerVector.x * winnerVector.x + winnerVector.y * winnerVector.y);
        
        if (winExtremeness < 30) {
            report += `<br><br>💡 <strong>분석 의견:</strong> 현재 중도 실용 정책을 고르게 융합한 정당이 부유층과 진보 청년층을 두루 아우르며 지지를 확보했습니다.`;
        } else {
            report += `<br><br>💡 <strong>분석 의견:</strong> 특정 이념 가치를 선명하게 부각시킨 정당이 해당 분야(예: 환경 또는 안보) 핵심 지지자들의 표심을 강하게 끌어 모았습니다.`;
        }
        
        summaryText.innerHTML = report;
        
    } else {
        marquee.innerText = `👑 ${winner.name} 의회 집권 승리!`;
        
        let report = `개표 완료 결과, <strong>${winner.name}</strong>이(가) <strong>${winner.seats}석</strong>을 차지하며 제1당이자 집권 정당의 영예를 안았습니다! `;
        if (runnerUp) {
            report += `2위인 <strong>${runnerUp.name}</strong>은(는) ${runnerUp.seats}석을 확보했습니다. `;
        }
        
        // 1차 여론조사 대비 성장/하락폭 추적
        let changeList = "";
        activeParties.forEach(p => {
            if (p.votes1 !== undefined && p.votes2 !== undefined) {
                const diffPct = (p.pct2 - p.pct1);
                const diffStr = diffPct >= 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`;
                changeList += `<li><strong>${p.name}:</strong> 1차 조사 대비 득표율 ${diffStr} (${p.seats}석 확보)</li>`;
            }
        });
        
        report += `<br><br><strong>📊 정당별 성적 결산:</strong><ul>${changeList}</ul>`;
        summaryText.innerHTML = report;
    }
}

// ==========================================
// 10. 단일화 및 합당 메커니즘 (Stage 6)
// ==========================================

function initAllianceSelection() {
    const select1 = document.getElementById("alliance-party-1");
    const select2 = document.getElementById("alliance-party-2");
    
    select1.innerHTML = "";
    select2.innerHTML = "";
    
    const activeParties = state.parties.filter(p => p.active);
    
    if (activeParties.length < 3) {
        // 정당이 2개 이하일 경우 단일화가 사실상 무의미하므로 경고 안내 및 건너뛰기 유도
        const box = document.querySelector(".alliance-selector-grid");
        box.style.opacity = "0.5";
        box.style.pointerEvents = "none";
        document.getElementById("btn-run-alliance").disabled = true;
        setGuideText("현재 남아있는 정당이 2개뿐이므로 단일화/합당 협상을 진행할 수 없습니다. 개표 단계로 진행하세요.");
        return;
    } else {
        const box = document.querySelector(".alliance-selector-grid");
        box.style.opacity = "1";
        box.style.pointerEvents = "auto";
        document.getElementById("btn-run-alliance").disabled = false;
    }
    
    // 옵션 세팅
    activeParties.forEach(party => {
        const opt1 = document.createElement("option");
        opt1.value = party.id;
        opt1.innerText = party.name;
        select1.appendChild(opt1);
        
        const opt2 = document.createElement("option");
        opt2.value = party.id;
        opt2.innerText = party.name;
        select2.appendChild(opt2);
    });
    
    // 동일한 정당을 고를 수 없게 기본 조절
    if (select2.options.length > 1) {
        select2.selectedIndex = 1;
    }
}

/**
 * 단일화/합당 연산 프로세스 실행
 */
function executePartyMerger() {
    const id1 = document.getElementById("alliance-party-1").value;
    const id2 = document.getElementById("alliance-party-2").value;
    const newName = document.getElementById("alliance-new-name").value.trim();
    const newColor = document.getElementById("alliance-new-color").value;
    
    if (id1 === id2) {
        alert("서로 다른 두 정당을 선택해야 합당이 가능합니다.");
        return;
    }
    
    if (newName === "") {
        alert("합당 후 새로 사용할 정당 이름을 입력해 주세요.");
        return;
    }
    
    const p1 = state.parties.find(p => p.id === id1);
    const p2 = state.parties.find(p => p.id === id2);
    
    if (!p1 || !p2) return;
    
    AudioSynth.playSuccess();
    
    // 1. 두 정당의 예산안(수정안 기준)의 평균값 계산
    const mergedBudget = {};
    for (const key in POLICY_VECTORS) {
        const avg = (p1.revisedBudget[key] + p2.revisedBudget[key]) / 2;
        mergedBudget[key] = Math.round(avg);
    }
    
    // 만약 반올림해서 100억이 안 될 경우 1억씩 가감하여 100억으로 강제 교정
    let sum = Object.values(mergedBudget).reduce((t, v) => t + v, 0);
    let diff = 100 - sum;
    if (diff !== 0) {
        mergedBudget.youth += diff; // 청년 분야에 보정치를 합산
    }
    
    // 2. 초기 이념 좌표도 평균 산출
    const mergedInitX = (p1.initX + p2.initX) / 2;
    const mergedInitY = (p1.initY + p2.initY) / 2;
    
    // 3. 기존 두 정당 비활성화 처리 (은퇴 및 흡수마킹)
    p1.active = false;
    p2.active = false;
    p1.mergedInto = `merged_${Date.now()}`;
    p2.mergedInto = `merged_${Date.now()}`;
    
    // 4. 새로운 합당 신당 창당
    const mergedParty = {
        id: `merged_${Date.now()}`,
        name: newName,
        color: newColor,
        slogan: `${p1.name}와 ${p2.name}의 가치 대통합`,
        promise: `단일화 공동 정책 합의안 실행`,
        initX: mergedInitX,
        initY: mergedInitY,
        budget: mergedBudget,
        revisedBudget: mergedBudget,
        active: true,
        // 1차 여론조사 득표수를 단순 합계해두어 결과 비교시 사용
        votes1: (p1.votes1 || 0) + (p2.votes1 || 0),
        pct1: (p1.pct1 || 0) + (p2.pct1 || 0)
    };
    
    // 5. 합당당의 좌표 연산
    const finalCoord = calculateFinalPartyCoordinates(mergedParty, false);
    mergedParty.x1 = finalCoord.x; // 시각화 점선 출발점용 가상 할당
    mergedParty.y1 = finalCoord.y;
    mergedParty.x2 = finalCoord.x;
    mergedParty.y2 = finalCoord.y;
    
    state.parties.push(mergedParty);
    
    // 6. 결과 메시지 브리핑 오버레이
    alert(`📢 [합당 선언]\n\n"${p1.name}"와 "${p2.name}"가 "${newName}"(으)로 합치기로 합의했습니다.\n정책 조율에 따라 새로운 정당 좌표는 (${finalCoord.x.toFixed(0)}, ${finalCoord.y.toFixed(0)})로 조정됩니다. 유권자들의 지지도 재분배됩니다.`);
    
    // 7. UI 리프레시 및 개표 진행
    initAllianceSelection();
    renderPartyFlagsOnMap(1);
    renderLeaderboard();
    saveSession();
}

// ==========================================
// 11. 결과 종합 분석 탭 (Stage 8)
// ==========================================

function initAnalysisScreen() {
    // 1. 연령대별 지지 정당 누적 막대차트 드로잉
    renderAgeSupportChart();
    
    // 2. 특이 지표 정리 렌더링
    renderStatsHighlights();
    
    // 3. 선거 제도 및 사표 분석 통계 렌더링
    renderElectoralAnalysisReport();
}

/**
 * 선거 제도 및 사표(死票) 정량 리포트 렌더링
 */
function renderElectoralAnalysisReport() {
    const stats = state.electoralStats || {
        systemName: "비례대표제",
        systemDesc: "정당의 득표비율에 비례하여 100석의 의석을 정직하게 분배하는 제도입니다. 소수당의 의회 진출을 보장하고 사표율을 획기적으로 낮추어 다당제를 정착시키는 데 기여합니다.",
        wastedVotes: 0,
        wastedPercent: 0
    };
    
    document.getElementById("lbl-elect-system-name").innerText = stats.systemName;
    document.getElementById("lbl-elect-system-desc").innerText = stats.systemDesc;
    document.getElementById("lbl-wasted-votes-pct").innerText = `${stats.wastedPercent.toFixed(1)}%`;
    document.getElementById("lbl-wasted-votes-count").innerText = `(${stats.wastedVotes}명 / ${state.voters.length}명)`;
}

/**
 * 분석용 연령대별 지지율 막대 렌더링
 */
function renderAgeSupportChart() {
    const container = document.getElementById("age-support-chart");
    container.innerHTML = "";
    
    const ages = ["20대", "30대", "40대", "50대", "60대"];
    const activeParties = state.parties.filter(p => p.active);
    
    ages.forEach(age => {
        const row = document.createElement("div");
        row.className = "age-chart-row";
        
        const label = document.createElement("div");
        label.className = "age-lbl";
        label.innerText = age;
        row.appendChild(label);
        
        const barsContainer = document.createElement("div");
        barsContainer.className = "age-bars-container";
        
        // 특정 연령대의 유권자 그룹 필터링
        const ageVoters = state.voters.filter(v => v.age === age);
        const totalInAge = ageVoters.length;
        
        if (totalInAge > 0) {
            activeParties.forEach(party => {
                const supporters = ageVoters.filter(v => v.support2 === party.id).length;
                const pct = (supporters / totalInAge) * 100;
                
                if (pct > 0) {
                    const segment = document.createElement("div");
                    segment.className = "age-bar-segment";
                    segment.style.backgroundColor = party.color;
                    segment.style.width = `${pct}%`;
                    
                    segment.addEventListener("mouseenter", (e) => {
                        showTooltip(e, `${party.name}: ${supporters}명 (${pct.toFixed(0)}%)`);
                    });
                    segment.addEventListener("mouseleave", hideTooltip);
                    
                    barsContainer.appendChild(segment);
                }
            });
            
            // 무당층 영역
            const undecidedCount = ageVoters.filter(v => v.support2 === null).length;
            const undecidedPct = (undecidedCount / totalInAge) * 100;
            if (undecidedPct > 0) {
                const segment = document.createElement("div");
                segment.className = "age-bar-segment";
                segment.style.backgroundColor = "#475569";
                segment.style.width = `${undecidedPct}%`;
                
                segment.addEventListener("mouseenter", (e) => {
                    showTooltip(e, `무당층/기권: ${undecidedCount}명 (${undecidedPct.toFixed(0)}%)`);
                });
                segment.addEventListener("mouseleave", hideTooltip);
                
                barsContainer.appendChild(segment);
            }
        }
        
        row.appendChild(barsContainer);
        container.appendChild(row);
    });
}

/**
 * 선거 결과 특이사항 정리 통계
 */
function renderStatsHighlights() {
    const list = document.getElementById("stats-highlights");
    list.innerHTML = "";
    
    const activeParties = state.parties.filter(p => p.active);
    if (activeParties.length === 0) return;
    
    // 1. 성장률 1위 및 하락율 1위 정당 산출
    let maxGrowth = -Infinity;
    let maxLoss = Infinity;
    let grower = null;
    let loser = null;
    
    activeParties.forEach(p => {
        if (p.pct1 !== undefined && p.pct2 !== undefined) {
            const diff = p.pct2 - p.pct1;
            if (diff > maxGrowth) {
                maxGrowth = diff;
                grower = p;
            }
            if (diff < maxLoss) {
                maxLoss = diff;
                loser = p;
            }
        }
    });
    
    // 성장율 1위
    if (grower && maxGrowth > 1) {
        list.innerHTML += `
            <li>
                <span class="highlight-emoji">📈</span>
                <div>
                    <strong>최다 성장 정당:</strong> 
                    <span style="color:${grower.color}">${grower.name}</span> (${maxGrowth >= 0 ? '+' : ''}${maxGrowth.toFixed(1)}% 상승)
                </div>
            </li>
        `;
    }
    
    // 낙폭 1위
    if (loser && maxLoss < -1) {
        list.innerHTML += `
            <li>
                <span class="highlight-emoji">📉</span>
                <div>
                    <strong>최다 지지율 감소:</strong> 
                    <span style="color:${loser.color}">${loser.name}</span> (${maxLoss.toFixed(1)}% 하락)
                </div>
            </li>
        `;
    }
    
    // 2. 최강 세력층 (가장 많은 연령대 득표율)
    let bestAgeParty = null;
    let bestAgeName = "";
    let maxAgePct = 0;
    
    const ages = ["20대", "30대", "40대", "50대", "60대"];
    activeParties.forEach(party => {
        ages.forEach(age => {
            const ageVoters = state.voters.filter(v => v.age === age);
            const supporters = ageVoters.filter(v => v.support2 === party.id).length;
            if (ageVoters.length > 0) {
                const pct = (supporters / ageVoters.length) * 100;
                if (pct > maxAgePct) {
                    maxAgePct = pct;
                    bestAgeParty = party;
                    bestAgeName = age;
                }
            }
        });
    });
    
    if (bestAgeParty && maxAgePct > 50) {
        list.innerHTML += `
            <li>
                <span class="highlight-emoji">🔥</span>
                <div>
                    <strong>세대 결집도 최고:</strong> 
                    <span style="color:${bestAgeParty.color}">${bestAgeParty.name}</span> (${bestAgeName} 유권자의 ${maxAgePct.toFixed(0)}% 지지 확보)
                </div>
            </li>
        `;
    }
    
    // 3. 무당층(기권) 비율 하이라이트
    const totalVoters = state.voters.length;
    const undecidedCount = state.voters.filter(v => v.support2 === null).length;
    const undecidedPct = (undecidedCount / totalVoters) * 100;
    
    if (undecidedPct > 15) {
        list.innerHTML += `
            <li>
                <span class="highlight-emoji">⚠️</span>
                <div>
                    <strong>선거 피로감 고조:</strong> 전체 유권자의 <strong>${undecidedPct.toFixed(0)}%</strong>가 투표를 포기했습니다. (정당들이 이념적으로 너무 극단화되었거나 멀리 있음을 시사)
                </div>
            </li>
        `;
    } else {
        list.innerHTML += `
            <li>
                <span class="highlight-emoji">⚡</span>
                <div>
                    <strong>높은 선거 참여도:</strong> 유권자의 <strong>${(100 - undecidedPct).toFixed(0)}%</strong>가 지지 정당을 선택하여 활발한 대리전 정치가 형성되었습니다.
                </div>
            </li>
        `;
    }
}

// ==========================================
// 12. 수업 분석 텍스트 내보내기 & 캡처 복사
// ==========================================

function copySummaryText() {
    AudioSynth.playSuccess();
    
    const activeParties = state.parties.filter(p => p.active);
    const sorted = [...activeParties].sort((a,b) => (b.seats || 0) - (a.seats || 0));
    
    let text = `=== [폴리 컴패스 (Poli Compass)] 최종 선거 종합 리포트 ===\n`;
    text += `가상 국가명: ${state.countryName}\n`;
    text += `참여 유권자: ${state.voters.length}명 | 총 의석: 100석\n\n`;
    text += `[정당별 의석수 및 최종 지지율 결과]\n`;
    
    sorted.forEach((p, idx) => {
        text += `${idx + 1}위: ${p.name} - ${p.seats}석 확보 (최종 지지율: ${(p.pct2 || 0).toFixed(1)}%)\n`;
        text += `   - 초기이념: (${p.initX}, ${p.initY})\n`;
        text += `   - 최종좌표: (${p.x2.toFixed(1)}, ${p.y2.toFixed(1)})\n`;
        text += `   - 대표공약: ${p.promise}\n`;
    });
    
    const 기권 = state.voters.filter(v => v.support2 === null).length;
    text += `\n무당층/기권: ${((기권/state.voters.length)*100).toFixed(0)}% (${기권}명)\n`;
    text += `========================================================`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert("결과 텍스트 요약본이 클립보드에 복사되었습니다! 문서나 칠판에 붙여넣기 하여 사용하세요.");
    }).catch(err => {
        console.error("복사 실패", err);
    });
}

function exportDataJSON() {
    AudioSynth.playSuccess();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `political_sim_results_${state.countryName}.json`);
    dlAnchorElem.click();
}

// ==========================================
// 13. 교사용 설정 모달 연동
// ==========================================

function openSettingsModal() {
    AudioSynth.playClick();
    
    // 설정값 바인딩
    document.getElementById("cfg-country-name").value = state.config.countryName;
    document.getElementById("cfg-voter-count").value = state.config.voterCount;
    document.getElementById("cfg-voter-mode").value = state.config.voterMode;
    document.getElementById("cfg-weight-ideology").value = state.config.weightIdeology;
    document.getElementById("cfg-weight-budget").value = state.config.weightBudget;
    document.getElementById("cfg-use-undecided").checked = state.config.useUndecided;
    document.getElementById("cfg-undecided-distance").value = state.config.undecidedDistance;
    document.getElementById("val-cfg-undecided-distance").innerText = state.config.undecidedDistance;
    document.getElementById("cfg-identity-bonus").checked = state.config.identityBonus;
    document.getElementById("cfg-electoral-system").value = state.config.electoralSystem || "proportional";
    document.getElementById("cfg-anim-speed").value = state.config.animSpeed;
    document.getElementById("cfg-sound-effects").checked = state.config.soundEffects;
    
    toggleUndecidedSettingRange(state.config.useUndecided);
    
    document.getElementById("settings-modal").classList.remove("hidden");
}

function closeSettingsModal() {
    AudioSynth.playClick();
    document.getElementById("settings-modal").classList.add("hidden");
}

function toggleUndecidedSettingRange(visible) {
    const grp = document.getElementById("cfg-undecided-distance-group");
    if (visible) {
        grp.style.display = "flex";
    } else {
        grp.style.display = "none";
    }
}

function applySettings() {
    AudioSynth.playSuccess();
    
    const country = document.getElementById("cfg-country-name").value.trim();
    const voterCnt = parseInt(document.getElementById("cfg-voter-count").value);
    const mode = document.getElementById("cfg-voter-mode").value;
    const wIdeology = parseInt(document.getElementById("cfg-weight-ideology").value);
    const wBudget = parseInt(document.getElementById("cfg-weight-budget").value);
    
    // 이념 + 예산 합계가 100이 안 되면 자동 맞춤
    if (wIdeology + wBudget !== 100) {
        alert("이념 반영비와 예산 반영비의 합은 반드시 100이어야 합니다. 자동으로 보정합니다.");
        const budgetCorrect = 100 - wIdeology;
        state.config.weightIdeology = wIdeology;
        state.config.weightBudget = budgetCorrect;
    } else {
        state.config.weightIdeology = wIdeology;
        state.config.weightBudget = wBudget;
    }
    
    state.config.countryName = country || "세종국";
    state.config.voterCount = voterCnt;
    state.config.voterMode = mode;
    state.config.useUndecided = document.getElementById("cfg-use-undecided").checked;
    state.config.undecidedDistance = parseInt(document.getElementById("cfg-undecided-distance").value);
    state.config.identityBonus = document.getElementById("cfg-identity-bonus").checked;
    state.config.electoralSystem = document.getElementById("cfg-electoral-system").value;
    state.config.animSpeed = document.getElementById("cfg-anim-speed").value;
    state.config.soundEffects = document.getElementById("cfg-sound-effects").checked;
    
    // 국가 배지 이름 갱신
    document.getElementById("display-country-name").innerText = state.config.countryName;
    
    // 설정을 LocalStorage에 동기화 백업
    localStorage.setItem("pol_sim_config", JSON.stringify(state.config));
    
    closeSettingsModal();
    
    // 중요 설정이 바뀌었으므로 깔끔하게 정당 등록 단계로 돌아가 리셋
    resetGame(false);
}

// LocalStorage 설정 복구
function loadStoredConfig() {
    const raw = localStorage.getItem("pol_sim_config");
    if (raw) {
        try {
            state.config = JSON.parse(raw);
            document.getElementById("display-country-name").innerText = state.config.countryName;
        } catch (e) {
            console.error("Config restore failed", e);
        }
    }
}

// ==========================================
// 14. 툴팁 & 화면 제어 인터페이스 (Tooltip UI)
// ==========================================

let tooltipEl = null;

function showTooltip(event, htmlContent) {
    if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.className = "custom-tooltip";
        document.body.appendChild(tooltipEl);
    }
    
    tooltipEl.innerHTML = htmlContent;
    tooltipEl.style.display = "block";
    
    // 툴팁 위치 조율
    const mapBounds = document.getElementById("spectrum-map").getBoundingClientRect();
    const tooltipBounds = tooltipEl.getBoundingClientRect();
    
    // 마우스 커서 약간 위에 툴팁 렌더링
    let left = event.pageX;
    let top = event.pageY - 15;
    
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
}

function hideTooltip() {
    if (tooltipEl) {
        tooltipEl.style.display = "none";
    }
}

// F11 및 자체 전체화면 API 토글
function toggleFullscreen() {
    AudioSynth.playClick();
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`전체화면 전환 실패: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// ==========================================
// 15. DOM 생명주기 및 이벤트 리스너 바인딩 (Initialization)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. 저장된 설정 복원
    loadStoredConfig();
    
    // 2. 정당 등록 단계로 앱 시동
    transitionToStage(1, false);
    
    // 2.5 로컬 세션 자동 감지 및 불러오기 프롬프트
    const hasExistingSession = !!localStorage.getItem("voter_spectrum_session");
    if (hasExistingSession) {
        setTimeout(() => {
            const confirmRestore = confirm("이전 수업의 진행 데이터가 감지되었습니다. 복구하여 이어 진행하시겠습니까?\n\n('취소'를 누르시면 완전히 새로운 수업 세션으로 초기화되어 시작합니다.)");
            if (confirmRestore) {
                const success = restoreSession();
                if (success) {
                    AudioSynth.playSuccess();
                } else {
                    alert("이전 세션을 불러오지 못했습니다. 새 수업으로 시작합니다.");
                    localStorage.removeItem("voter_spectrum_session");
                    resetGame(false);
                }
            } else {
                localStorage.removeItem("voter_spectrum_session");
                resetGame(false);
            }
        }, 100);
    } else {
        resetGame(false);
    }

    // 2.6 설정 모달 내 교사용 PIN 인증 로직 초기화
    const settingsModal = document.getElementById("settings-modal");
    const settingsAuthArea = document.getElementById("settings-auth-area");
    const settingsContentArea = document.getElementById("settings-content-area");
    const settingsFooterArea = document.getElementById("settings-footer-area");
    const settingsPinInput = document.getElementById("settings-pin-input");
    const settingsPinError = document.getElementById("settings-pin-error");
    const btnSettingsAuthSubmit = document.getElementById("btn-settings-auth-submit");

    // 설정 열기 버튼 이벤트 바인딩 (설정 모달이 열릴 때 PIN 필드로 리셋)
    document.getElementById("btn-settings").addEventListener("click", () => {
        AudioSynth.playClick();
        
        // 인증 필드 초기화 및 잠금 상태로 셋업
        settingsPinInput.value = "";
        settingsPinError.classList.add("hidden");
        
        settingsAuthArea.classList.remove("hidden");
        settingsContentArea.classList.add("hidden");
        settingsFooterArea.classList.add("hidden");
        
        settingsModal.classList.remove("hidden");
        setTimeout(() => settingsPinInput.focus(), 150);
    });

    // PIN 에러 실시간 감추기
    settingsPinInput.addEventListener("input", () => {
        settingsPinError.classList.add("hidden");
    });

    // PIN 검증 실행기
    const verifySettingsPin = () => {
        const pin = settingsPinInput.value.trim();
        if (pin === "1234") {
            AudioSynth.playSuccess();
            // 잠금 해제: 설정 폼 노출
            settingsAuthArea.classList.add("hidden");
            settingsContentArea.classList.remove("hidden");
            settingsFooterArea.classList.remove("hidden");
        } else {
            AudioSynth.playClick();
            settingsPinError.classList.remove("hidden");
            settingsPinInput.value = "";
            settingsPinInput.focus();
        }
    };

    // 버튼 클릭 및 엔터 키 검증 연동
    btnSettingsAuthSubmit.addEventListener("click", verifySettingsPin);
    settingsPinInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            verifySettingsPin();
        }
    });
    
    // 3. 버튼 이벤트 핸들러 바인딩
    document.getElementById("btn-add-party").addEventListener("click", addNewParty);
    document.getElementById("btn-quick-start").addEventListener("click", applyQuickStart);
    document.getElementById("btn-submit-parties").addEventListener("click", submitRegistration);
    
    document.getElementById("btn-generate-voters").addEventListener("click", () => {
        AudioSynth.playClick();
        generateVoters(true); // 버튼을 직접 클릭한 경우 무작위 셔플을 강제하여 매번 눈에 띄는 변화를 줍니다.
        renderVotersOnMap(0);
        saveSession(); // 재배치된 유권자 세션 저장
    });
    
    document.getElementById("btn-to-stage3").addEventListener("click", () => {
        AudioSynth.playClick();
        transitionToStage(3);
    });
    
    document.getElementById("btn-save-budget").addEventListener("click", saveSingleBudget);
    
    document.getElementById("btn-run-survey").addEventListener("click", () => {
        AudioSynth.playClick();
        runSurveyLogicAndAnimation();
    });
    
    document.getElementById("btn-to-stage5").addEventListener("click", () => {
        AudioSynth.playClick();
        transitionToStage(5);
    });
    
    document.getElementById("btn-save-revision").addEventListener("click", saveSingleRevision);
    
    document.getElementById("btn-to-stage6").addEventListener("click", () => {
        AudioSynth.playClick();
        transitionToStage(6);
    });
    
    document.getElementById("btn-run-alliance").addEventListener("click", executePartyMerger);
    
    document.getElementById("btn-skip-alliance").addEventListener("click", () => {
        AudioSynth.playClick();
        // 단일화 건너뜀 경고
        alert("정당 간의 단일화 없이 기존 체제를 유지한 채 최종 투표 및 개표를 개시합니다.");
        runFinalVoteLogicAndAnimation();
    });
    
    document.getElementById("btn-run-final").addEventListener("click", () => {
        AudioSynth.playClick();
        runFinalVoteLogicAndAnimation();
    });
    
    document.getElementById("btn-to-stage8").addEventListener("click", () => {
        AudioSynth.playClick();
        transitionToStage(8);
    });
    
    // 결과 분석 탭 전환
    const analysisTabs = document.querySelectorAll(".analysis-tab-btn");
    analysisTabs.forEach(btn => {
        btn.addEventListener("click", (e) => {
            AudioSynth.playClick();
            
            analysisTabs.forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
            
            const targetTab = btn.getAttribute("data-tab");
            const contents = document.querySelectorAll(".analysis-tab-content");
            contents.forEach(c => {
                c.classList.add("hidden");
                c.classList.remove("active");
            });
            
            const targetEl = document.getElementById(targetTab);
            if (targetEl) {
                targetEl.classList.remove("hidden");
                targetEl.classList.add("active");
            }
        });
    });
    
    // 교사용 툴바 제어
    document.getElementById("btn-undo").addEventListener("click", executeUndo);
    document.getElementById("btn-copy-summary").addEventListener("click", copySummaryText);
    document.getElementById("btn-export-json").addEventListener("click", exportDataJSON);
    document.getElementById("btn-reset-game").addEventListener("click", () => resetGame(true));
    
    // 교사 힌트 패널 접기/피기
    const hintPanel = document.getElementById("teacher-hint-panel");
    const hintToggleBtn = document.getElementById("btn-toggle-teacher-hint");
    
    hintToggleBtn.addEventListener("click", () => {
        AudioSynth.playClick();
        if (hintPanel.classList.contains("hidden")) {
            hintPanel.classList.remove("hidden");
            hintToggleBtn.innerHTML = "💡 <span>교사용 수업 힌트 패널 닫기</span>";
        } else {
            hintPanel.classList.add("hidden");
            hintToggleBtn.innerHTML = "💡 <span>교사용 수업 힌트 패널 열기</span>";
        }
    });
    
    document.getElementById("btn-close-hint").addEventListener("click", () => {
        AudioSynth.playClick();
        hintPanel.classList.add("hidden");
        hintToggleBtn.innerHTML = "💡 <span>교사용 수업 힌트 패널 열기</span>";
    });
    
    // 전체화면 & 설정 모달
    document.getElementById("btn-fullscreen").addEventListener("click", toggleFullscreen);
    document.getElementById("btn-settings").addEventListener("click", openSettingsModal);
    document.getElementById("btn-close-settings").addEventListener("click", closeSettingsModal);
    document.getElementById("btn-cancel-settings").addEventListener("click", closeSettingsModal);
    document.getElementById("btn-save-settings").addEventListener("click", applySettings);
    
    // 설정 모달 내 무당층 여부 토글 바인딩
    const undecidedCheck = document.getElementById("cfg-use-undecided");
    undecidedCheck.addEventListener("change", (e) => {
        toggleUndecidedSettingRange(e.target.checked);
    });
    
    const undecidedRange = document.getElementById("cfg-undecided-distance");
    undecidedRange.addEventListener("input", (e) => {
        document.getElementById("val-cfg-undecided-distance").innerText = e.target.value;
    });

    // 활동 규칙 모달 이벤트 바인딩
    const rulesModal = document.getElementById("rules-modal");
    document.getElementById("btn-rules").addEventListener("click", () => {
        AudioSynth.playClick();
        rulesModal.classList.remove("hidden");
    });
    document.getElementById("btn-close-rules").addEventListener("click", () => {
        AudioSynth.playClick();
        rulesModal.classList.add("hidden");
    });
    document.getElementById("btn-start-rules").addEventListener("click", () => {
        AudioSynth.playSuccess();
        rulesModal.classList.add("hidden");
    });

    // 수업 마무리 모달 이벤트 바인딩
    const wrapupModal = document.getElementById("wrapup-modal");
    document.getElementById("btn-wrapup").addEventListener("click", () => {
        AudioSynth.playClick();
        wrapupModal.style.display = "flex";
        wrapupModal.classList.remove("hidden");
    });
    
    const closeWrapup = () => {
        AudioSynth.playClick();
        wrapupModal.style.display = "none";
        wrapupModal.classList.add("hidden");
    };
    document.getElementById("btn-close-wrapup").addEventListener("click", closeWrapup);

    // 이념 성향 가이드 모달 이벤트 바인딩
    const policyModal = document.getElementById("policy-info-modal");
    document.getElementById("btn-policy-guide").addEventListener("click", () => {
        if (window.showAllQuadrantInfo) {
            window.showAllQuadrantInfo();
        }
    });
    
    document.getElementById("btn-close-policy-modal").addEventListener("click", () => {
        AudioSynth.playClick();
        policyModal.classList.add("hidden");
    });
    document.getElementById("btn-confirm-policy").addEventListener("click", () => {
        AudioSynth.playSuccess();
        policyModal.classList.add("hidden");
    });

    // 교사용 세션 완전 포맷 및 새 수업 시작 버튼 이벤트 바인딩
    const resetBtn = document.getElementById("btn-reset-session");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (confirm("정말로 모든 수업 진행 데이터를 초기화하고 처음 단계(정당 등록)부터 완전히 새롭게 시작하시겠습니까?\n(저장되어 있던 세션 데이터도 모두 사라집니다.)")) {
                AudioSynth.playClick();
                localStorage.removeItem("voter_spectrum_session");
                localStorage.removeItem("pol_sim_config");
                window.location.reload();
            }
        });
    }
});

// ==========================================
// 12. 이념 성향 가이드 및 4분점 현실화 헬퍼
// ==========================================

const QUADRANT_EXPLANATIONS = {
    1: {
        title: "💡 우상단 (1사분면): 자유지상주의 & 신자유주의",
        meaning: "개인의 자유로운 행동을 극대화하는 동시에 시장의 완전한 자율 경쟁을 신뢰하는 입장입니다. 정부는 안보와 기초 질서만 유지하고 세금과 기업 규제를 철폐해야 한다고 봅니다.",
        reality: `<ul>
            <li><strong>💵 경제 분야 (세금 인하 / 복지 축소):</strong> 소득세·법인세 감면, 노동 시장 규제 완화, 철도·의료 등 공공재의 민영화, 민간 경쟁 체제 도입.</li>
            <li><strong>🕊️ 사회 분야 (개인 다양성 / 규제 철폐):</strong> 표현 및 종교의 자유 절대적 보장, 규제 없는 창업 및 혁신 생태계, 징병제 폐지 및 자발적 모병제 권장.</li>
            <li><strong>🏛️ 현실 정치 예시:</strong> 미국의 리버테리언당(Libertarian Party), 시장 만능주의적 경제학파 및 기술 스타트업 진흥파 등.</li>
        </ul>`
    },
    2: {
        title: "💡 좌상단 (2사분면): 사회적 진보주의 & 민주사회주의",
        meaning: "대기업 독과점을 견제하고 복지 제도를 대폭 늘려 실질적 기회의 평등을 구축하되, 개인의 다양한 삶의 방식과 가치관을 존중하고 편견으로부터 보호하는 성향입니다.",
        reality: `<ul>
            <li><strong>💵 경제 분야 (세금 확대 / 복지 강화):</strong> 부유세·상속세 강화, 대기업 규제 신설, 전 국민 보편 복지 확대(기본소득, 무상교육/의료), 최저임금 대폭 인상.</li>
            <li><strong>🕊️ 사회 분야 (개인 다양성 / 인권 존중):</strong> 포괄적 차별금지법 제정, 양성평등 및 다문화 수용, 대체 복무 전면 보장, 사형제 폐지, 환경 규제 강화.</li>
            <li><strong>🏛️ 현실 정치 예시:</strong> 북유럽 국가의 사민당 계열, 대다수 현대 서구식 진보 정당 및 녹색당 성향.</li>
        </ul>`
    },
    3: {
        title: "💡 좌하단 (3사분면): 공동체주의 & 복지 국가주의",
        meaning: "사회적 빈부격차 해소와 공익 증진을 위해 정부의 경제적 분배·기획 능력을 믿는 동시에, 공동체 질서의 붕괴나 가치관의 극단적 다양화보다는 사회 통합과 윤리 규범을 강조하는 경향입니다.",
        reality: `<ul>
            <li><strong>💵 경제 분야 (세금 확대 / 국가 주도 분배):</strong> 기간 산업(철도, 전력, 수도)의 공공화, 노동 기본권 보장, 정부 주도 대규모 사회 인프라 투자 및 분배 정책.</li>
            <li><strong>🕊️ 사회 분야 (질서 수호 / 전통적 통합):</strong> 사회적 무질서 예방을 위한 엄격한 집회 및 음란 규제, 국가 중심 통합 교육, 법과 질서 기강 강화.</li>
            <li><strong>🏛️ 현실 정치 예시:</strong> 국가 주도 성장을 추구하며 공공 분배를 추구하는 공화주의 또는 통제형 복지 모델(예: 싱가포르의 관리형 체제 등).</li>
        </ul>`
    },
    4: {
        title: "💡 우하단 (4사분면): 전통적 보수주의 & 신자유주의",
        meaning: "자유시장 경제에서의 능력 중심 자율 경쟁과 효율성을 극대화하여 성장을 자극하는 동시에, 공권력 집행을 통한 사회 안보와 국가 치안 질서 수호, 전통적 도덕 가치를 견고히 하는 이념입니다.",
        reality: `<ul>
            <li><strong>💵 경제 분야 (세금 인하 / 기업 성장론):</strong> 법인세 및 재산세 인하, 민간 기업 투자 활성화 촉진, 복지 구조조정 및 재정 건전성 확보 정책.</li>
            <li><strong>🕊️ 사회 분야 (질서 수호 / 국가 안보론):</strong> 강력 범죄 엄단 및 치안 예산 증대, 강력한 안보 정책 수립, 애국심 교육 및 전통 가족적 가치 장려.</li>
            <li><strong>🏛️ 현실 정치 예시:</strong> 미국의 레이거노믹스, 영국의 대처 수상 정책, 대다수 서구권 및 아시아권의 주류 보수 정당 등.</li>
        </ul>`
    }
};

window.showQuadrantInfo = function(quadrant) {
    AudioSynth.playClick();
    const info = QUADRANT_EXPLANATIONS[quadrant];
    if (!info) return;
    
    document.getElementById("policy-modal-title").innerHTML = info.title;
    document.getElementById("policy-modal-content").innerHTML = `
        <div style="background-color: rgba(255,255,255,0.04); padding: 24px; border-radius: 10px; border-left: 6px solid var(--color-primary); margin-bottom: 24px;">
            <p style="font-weight: 800; font-size: 18px; color: var(--text-main); margin: 0;">성향 정의</p>
            <p style="margin-top: 10px; font-size: 16.5px; color: var(--text-muted); line-height: 1.7;">${info.meaning}</p>
        </div>
        <div>
            <p style="font-weight: 800; font-size: 18px; color: var(--text-main); margin-bottom: 14px;">🛠️ 현실에서의 구체적 구현 예시</p>
            <div style="font-size: 15.5px; color: var(--text-muted); line-height: 1.9; padding-left: 5px;">
                ${info.reality}
            </div>
            <button onclick="window.showAllQuadrantInfo()" class="btn btn-secondary" style="margin-top: 28px; width: 100%; height: 50px; font-weight: 800; font-size: 15px; border-radius: var(--radius-md);">← 종합 가이드 목록으로 돌아가기</button>
        </div>
    `;
    
    document.getElementById("policy-info-modal").classList.remove("hidden");
};

window.showAllQuadrantInfo = function() {
    AudioSynth.playClick();
    document.getElementById("policy-modal-title").innerHTML = "💡 전체 이념 성향 (사분면) 종합 가이드";
    
    let html = `
        <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.7;">
            2D 정치 이념 스펙트럼 지도는 <strong>💵 가로축(경제: 세금/복지)</strong>과 <strong>🕊️ 세로축(사회: 자유/질서)</strong>을 기준으로 성향을 사분면으로 분류합니다. 각 영역을 클릭하면 현실 세계의 상세 정책 예시를 볼 수 있습니다.
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 12px;">
    `;
    
    // 1사분면과 2사분면 패널의 위치를 스펙트럼 좌표 구조(왼쪽: 2사분면, 오른쪽: 1사분면)에 맞춰 순서를 바꿉니다.
    [2, 1, 3, 4].forEach(qNum => {
        const info = QUADRANT_EXPLANATIONS[qNum];
        // 사분면 번호별 색상 부여
        const accentColor = qNum === 2 ? '#3b82f6' : qNum === 1 ? '#a855f7' : qNum === 3 ? '#ef4444' : '#10b981';
        html += `
            <div onclick="window.showQuadrantInfo(${qNum})" style="background-color: rgba(255,255,255,0.03); border: 2px solid var(--border-color); padding: 24px; border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s ease-in-out; text-align: left; min-height: 160px; display: flex; flex-direction: column; justify-content: space-between;" onmouseover="this.style.borderColor='${accentColor}'; this.style.backgroundColor='rgba(255,255,255,0.07)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.backgroundColor='rgba(255,255,255,0.03)';">
                <div>
                    <h4 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 900; color: ${accentColor};">${info.title.split(":")[0]}</h4>
                    <p style="margin: 0; font-size: 15px; color: var(--text-muted); line-height: 1.6; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${info.meaning}</p>
                </div>
                <span style="font-size: 13.5px; color: ${accentColor}; display: block; margin-top: 16px; font-weight: 800; text-align: right;">상세 정책 사례 보기 &rarr;</span>
            </div>
        `;
    });
    
    html += `</div>`;
    
    document.getElementById("policy-modal-content").innerHTML = html;
    document.getElementById("policy-info-modal").classList.remove("hidden");
};

// X축(경제) 의미 상세 해석 헬퍼
function getXMeaning(x) {
    const val = parseInt(x);
    if (val < -60) return "강한 세금 확대 / 공공 복지 강화 성향";
    if (val < -20) return "세금 확대 / 복지 확대 성향";
    if (val <= 20) return "중도 (시장 자율과 적절한 분배의 조화)";
    if (val <= 60) return "세금 인하 / 기업 자유 / 규제 완화";
    return "강한 세금 인하 / 극대화된 시장 자율 성향";
}

// Y축(사회) 의미 상세 해석 헬퍼
function getYMeaning(y) {
    const val = parseInt(y);
    if (val < -60) return "강한 법치 / 국가 안보 / 질서 수호 중심";
    if (val < -20) return "전통 가치 수호 / 법과 질서 중시";
    if (val <= 20) return "중도 (전통과 개인 자유의 균형적 접근)";
    if (val <= 60) return "개인 자유 확대 / 다양성 / 소수자 인권 존중";
    return "강한 개인 자유 / 다양성 / 규제 철폐 성향";
}
