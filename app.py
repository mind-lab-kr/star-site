from datetime import date

from flask import Flask, abort, render_template, request

app = Flask(__name__)

ZODIAC = {
    "aries": {
        "name": "양자리",
        "symbol": "♈",
        "date_range": "3/21 ~ 4/19",
        "start": (3, 21),
        "end": (4, 19),
        "traits": [
            "열정적이다", "리더십이 강하다", "승부욕이 강하다", "솔직하고 직설적이다",
            "행동이 빠르다", "도전을 두려워하지 않는다", "다혈질이지만 뒤끝이 없다",
            "독립심이 강하다", "에너지가 넘친다", "순수하고 단순하다",
        ],
        "stats": {"리더십": 95, "감수성": 40, "활동력": 95, "창의력": 65, "사교성": 75},
        "compat_top3": ["사자자리", "사수자리", "물병자리"],
        "compat_avoid": "게자리",
        "coupang": "https://link.coupang.com/a/fsgaGQCK0y",
    },
    "taurus": {
        "name": "황소자리",
        "symbol": "♉",
        "date_range": "4/20 ~ 5/20",
        "start": (4, 20),
        "end": (5, 20),
        "traits": [
            "인내심이 강하다", "현실적이다", "미식가다", "안정을 추구한다",
            "고집이 세다", "소유욕이 강하다", "감각이 예민하다", "근면성실하다",
            "느긋하고 여유롭다", "의리가 있다",
        ],
        "stats": {"리더십": 55, "감수성": 70, "활동력": 40, "창의력": 60, "사교성": 50},
        "compat_top3": ["처녀자리", "염소자리", "게자리"],
        "compat_avoid": "물병자리",
        "coupang": "https://link.coupang.com/a/fsgdfsgk44",
    },
    "gemini": {
        "name": "쌍둥이자리",
        "symbol": "♊",
        "date_range": "5/21 ~ 6/21",
        "start": (5, 21),
        "end": (6, 21),
        "traits": [
            "호기심이 많다", "말솜씨가 뛰어나다", "사교적이다", "다재다능하다",
            "변덕스럽다", "적응력이 빠르다", "정보에 밝다", "유머감각이 뛰어나다",
            "자유로운 영혼이다", "두뇌 회전이 빠르다",
        ],
        "stats": {"리더십": 60, "감수성": 55, "활동력": 75, "창의력": 85, "사교성": 90},
        "compat_top3": ["천칭자리", "물병자리", "양자리"],
        "compat_avoid": "처녀자리",
        "coupang": "https://link.coupang.com/a/fsgfxLHqq4",
    },
    "cancer": {
        "name": "게자리",
        "symbol": "♋",
        "date_range": "6/22 ~ 7/22",
        "start": (6, 22),
        "end": (7, 22),
        "traits": [
            "감수성이 풍부하다", "가족을 중시한다", "배려심이 깊다", "직관력이 뛰어나다",
            "소심한 면이 있다", "보호본능이 강하다", "감정 기복이 있다", "다정하고 따뜻하다",
            "기억력이 좋다", "헌신적이다",
        ],
        "stats": {"리더십": 45, "감수성": 95, "활동력": 50, "창의력": 70, "사교성": 60},
        "compat_top3": ["전갈자리", "물고기자리", "황소자리"],
        "compat_avoid": "양자리",
        "coupang": "https://link.coupang.com/a/fsghqON2PY",
    },
    "leo": {
        "name": "사자자리",
        "symbol": "♌",
        "date_range": "7/23 ~ 8/22",
        "start": (7, 23),
        "end": (8, 22),
        "traits": [
            "자신감이 넘친다", "리더십이 뛰어나다", "관대하다", "자존심이 강하다",
            "화려한 것을 좋아한다", "주목받는 것을 즐긴다", "충성심이 강하다", "열정적이다",
            "창의적이다", "당당하다",
        ],
        "stats": {"리더십": 98, "감수성": 55, "활동력": 85, "창의력": 80, "사교성": 88},
        "compat_top3": ["양자리", "사수자리", "쌍둥이자리"],
        "compat_avoid": "전갈자리",
        "coupang": "https://link.coupang.com/a/fsgiBOUtHg",
    },
    "virgo": {
        "name": "처녀자리",
        "symbol": "♍",
        "date_range": "8/23 ~ 9/22",
        "start": (8, 23),
        "end": (9, 22),
        "traits": [
            "완벽주의 성향이 있다", "분석력이 뛰어나다", "세심하고 꼼꼼하다", "성실하다",
            "실용적이다", "비판적 사고를 한다", "겸손하다", "정리정돈을 잘한다",
            "신중하다", "봉사정신이 강하다",
        ],
        "stats": {"리더십": 55, "감수성": 65, "활동력": 55, "창의력": 60, "사교성": 45},
        "compat_top3": ["황소자리", "염소자리", "게자리"],
        "compat_avoid": "쌍둥이자리",
        "coupang": "https://link.coupang.com/a/fsgjPFIaTA",
    },
    "libra": {
        "name": "천칭자리",
        "symbol": "♎",
        "date_range": "9/23 ~ 10/22",
        "start": (9, 23),
        "end": (10, 22),
        "traits": [
            "균형감각이 뛰어나다", "사교성이 좋다", "미적 감각이 뛰어나다", "공정함을 추구한다",
            "우유부단한 면이 있다", "평화를 사랑한다", "협력을 중시한다", "로맨틱하다",
            "매너가 좋다", "조화를 추구한다",
        ],
        "stats": {"리더십": 60, "감수성": 70, "활동력": 55, "창의력": 75, "사교성": 92},
        "compat_top3": ["쌍둥이자리", "물병자리", "사자자리"],
        "compat_avoid": "염소자리",
        "coupang": "https://link.coupang.com/a/fsglwEksvs",
    },
    "scorpio": {
        "name": "전갈자리",
        "symbol": "♏",
        "date_range": "10/23 ~ 11/21",
        "start": (10, 23),
        "end": (11, 21),
        "traits": [
            "통찰력이 뛰어나다", "집중력이 강하다", "비밀스럽다", "열정적이고 강렬하다",
            "의지가 강하다", "승부욕이 강하다", "신뢰를 중시한다", "직감이 발달했다",
            "카리스마가 있다", "한번 마음먹으면 끝까지 간다",
        ],
        "stats": {"리더십": 80, "감수성": 85, "활동력": 70, "창의력": 75, "사교성": 50},
        "compat_top3": ["게자리", "물고기자리", "처녀자리"],
        "compat_avoid": "사자자리",
        "coupang": "https://link.coupang.com/a/fsgnkDc7UW",
    },
    "sagittarius": {
        "name": "사수자리",
        "symbol": "♐",
        "date_range": "11/22 ~ 12/21",
        "start": (11, 22),
        "end": (12, 21),
        "traits": [
            "자유를 사랑한다", "낙천적이다", "모험심이 강하다", "솔직하다",
            "철학적 사고를 즐긴다", "유쾌하다", "배움을 좋아한다", "개방적이다",
            "성장 지향적이다", "호탕하다",
        ],
        "stats": {"리더십": 70, "감수성": 50, "활동력": 90, "창의력": 75, "사교성": 80},
        "compat_top3": ["양자리", "사자자리", "물병자리"],
        "compat_avoid": "처녀자리",
        "coupang": "https://link.coupang.com/a/fsgaGQCK0y",
    },
    "capricorn": {
        "name": "염소자리",
        "symbol": "♑",
        "date_range": "12/22 ~ 1/19",
        "start": (12, 22),
        "end": (1, 19),
        "traits": [
            "책임감이 강하다", "목표지향적이다", "인내심이 뛰어나다", "현실적이다",
            "근면성실하다", "신중하다", "야망이 크다", "절제력이 있다",
            "전통을 중시한다", "리더십이 있다",
        ],
        "stats": {"리더십": 85, "감수성": 45, "활동력": 65, "창의력": 55, "사교성": 50},
        "compat_top3": ["황소자리", "처녀자리", "물고기자리"],
        "compat_avoid": "양자리",
        "coupang": "https://link.coupang.com/a/fsgdfsgk44",
    },
    "aquarius": {
        "name": "물병자리",
        "symbol": "♒",
        "date_range": "1/20 ~ 2/18",
        "start": (1, 20),
        "end": (2, 18),
        "traits": [
            "독창적이다", "개성이 강하다", "인도주의적이다", "지적 호기심이 많다",
            "독립적이다", "미래지향적이다", "박애정신이 있다", "이성적이다",
            "자유분방하다", "혁신적이다",
        ],
        "stats": {"리더십": 65, "감수성": 55, "활동력": 70, "창의력": 95, "사교성": 75},
        "compat_top3": ["쌍둥이자리", "천칭자리", "양자리"],
        "compat_avoid": "황소자리",
        "coupang": "https://link.coupang.com/a/fsgfxLHqq4",
    },
    "pisces": {
        "name": "물고기자리",
        "symbol": "♓",
        "date_range": "2/19 ~ 3/20",
        "start": (2, 19),
        "end": (3, 20),
        "traits": [
            "상상력이 풍부하다", "감수성이 예민하다", "공감능력이 뛰어나다", "예술적 감각이 있다",
            "몽상적이다", "헌신적이다", "온화하다", "직관력이 강하다",
            "낭만적이다", "순응적이다",
        ],
        "stats": {"리더십": 40, "감수성": 98, "활동력": 45, "창의력": 90, "사교성": 65},
        "compat_top3": ["게자리", "전갈자리", "염소자리"],
        "compat_avoid": "쌍둥이자리",
        "coupang": "https://link.coupang.com/a/fsghqON2PY",
    },
}

# 정렬된 순서(연중 순서)로 별자리 아이콘 표시용
ZODIAC_ORDER = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]


def get_zodiac_key(month: int, day: int) -> str:
    for key, info in ZODIAC.items():
        s_month, s_day = info["start"]
        e_month, e_day = info["end"]
        if s_month <= e_month:
            if (month == s_month and day >= s_day) or (month == e_month and day <= e_day) or (s_month < month < e_month):
                return key
        else:
            # 염소자리처럼 연말/연초를 걸치는 경우 (12/22 ~ 1/19)
            if (month == s_month and day >= s_day) or (month == e_month and day <= e_day):
                return key
    abort(400)


def get_daily_fortune(zodiac_key: str, today: date) -> dict:
    """오늘 날짜 + 별자리를 시드로 하는 결정적(하루 동안 고정) 운세 별점."""
    seed = hash((zodiac_key, today.isoformat()))
    categories = ["애정", "금전", "건강", "직장"]
    fortune = {}
    for i, cat in enumerate(categories):
        score = (abs(seed >> (i * 8)) % 5) + 1
        fortune[cat] = score
    return fortune


@app.route("/")
def index():
    return render_template("index.html", zodiac_order=ZODIAC_ORDER, zodiac=ZODIAC)


@app.route("/result")
def result():
    try:
        month = int(request.args.get("month", ""))
        day = int(request.args.get("day", ""))
        date(2024, month, day)  # 유효한 월/일 조합인지 검증 (윤년 포함 연도 사용)
    except (TypeError, ValueError):
        abort(400)

    key = get_zodiac_key(month, day)
    info = ZODIAC[key]
    fortune = get_daily_fortune(key, date.today())

    return render_template(
        "result.html",
        key=key,
        info=info,
        fortune=fortune,
        month=month,
        day=day,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
