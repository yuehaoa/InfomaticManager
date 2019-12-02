<template>
    <div class="main">
        <div class="choose_year">
            <div class="icon" @click="chooseYears(-1)"><i class="fa fa-angle-double-left"></i></div>
            <div class="icon" @click="chooseMonth(-1)"><i class="fa fa-angle-left"></i></div>
            <div class="date">{{year}}年{{month.toString().padStart(2, '0')}}月</div>
            <div class="icon" @click="chooseMonth(1)"><i class="fa fa-angle-right"></i></div>
            <div class="icon" @click="chooseYears(1)"><i class="fa fa-angle-double-right"></i></div>
        </div>
        <div class="days_area">
            <div class="day week" v-for="week in weeks" :key="week">{{week}}</div>
            <div class="day" @click="chooseThisDay(day.gregorian)" v-for="(day, index) in days" :key="index" :class="day.gregorian === today ? 'choose_day' : ''">
                <p>{{day.gregorian}}</p>
                <span>{{day.lunar}}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "BigCalendar",
    methods: {
        getDays () { // 获取当前月份所有公历日期及其农历日期
            this.days = []
            const time = new Date()
            time.setFullYear(this.year, this.month, 0)
            for (let i = 0; i < time.getDay(); i++) {
                this.days.push({gregorian: '', lunar: ''})
            }
            for (let i = 1; i <= time.getDate(); i++) {
                this.days.push({gregorian: i, lunar: this.getLunarDay(this.year, this.month, i)})
            }
            this.$emit("input", `${this.year}-${this.month}-${this.today}`);
        },
        chooseYears (state) { // 改变年份
            this.year += state
            this.today = 1
            this.getDays()
        },
        chooseMonth (state) { // 改变月份
            this.month += state
            this.today = 1
            if (this.month < 1) {
                this.month = 12
                this.chooseYears(-1)
            } else if (this.month > 12) {
                this.month = 1
                this.chooseYears(1)
            } else {
                this.getDays()
            }
        },
        chooseThisDay (day) { // 选择某天，主要是考虑可以当时间选择器用
            if (day > 0) {
                this.today = day
                this.$emit("input", `${this.year}-${this.month}-${this.today}`);
            }
        },
        getLunarDay (solarYear, solarMonth, solarDay) { // 拷贝别人又自己调整过的获取农历日期的代码，想要原来的代码估计百度一下就有了
            const madd = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
            // const tgString = '甲乙丙丁戊己庚辛壬癸'
            // const dzString = '子丑寅卯辰巳午未申酉戌亥'
            const numString = '一二三四五六七八九十'
            const monString = '正二三四五六七八九十冬腊'
            const CalendarData = [0xA4B, 0x5164B, 0x6A5, 0x6D4, 0x415B5, 0x2B6, 0x957, 0x2092F, 0x497, 0x60C96, 0xD4A, 0xEA5, 0x50DA9, 0x5AD, 0x2B6, 0x3126E, 0x92E, 0x7192D, 0xC95, 0xD4A, 0x61B4A, 0xB55, 0x56A, 0x4155B, 0x25D, 0x92D, 0x2192B, 0xA95, 0x71695, 0x6CA, 0xB55, 0x50AB5, 0x4DA, 0xA5B, 0x30A57, 0x52B, 0x8152A, 0xE95, 0x6AA, 0x615AA, 0xAB5, 0x4B6, 0x414AE, 0xA57, 0x526, 0x31D26, 0xD95, 0x70B55, 0x56A, 0x96D, 0x5095D, 0x4AD, 0xA4D, 0x41A4D, 0xD25, 0x81AA5, 0xB54, 0xB6A, 0x612DA, 0x95B, 0x49B, 0x41497, 0xA4B, 0xA164B, 0x6A5, 0x6D4, 0x615B4, 0xAB6, 0x957, 0x5092F, 0x497, 0x64B, 0x30D4A, 0xEA5, 0x80D65, 0x5AC, 0xAB6, 0x5126D, 0x92E, 0xC96, 0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, 0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95]
            if (!(solarYear < 1921 || solarYear > 2020)) {
                solarMonth = (parseInt(solarMonth) > 0) ? (solarMonth - 1) : 11
                const timeArr = [solarYear, solarMonth, solarDay]
                let TheDate = (timeArr.length !== 3) ? new Date() : new Date(timeArr[0], timeArr[1], timeArr[2])
                let total, m, n, k
                let isEnd = false
                let theDateYear = TheDate.getFullYear()
                total = (theDateYear - 1921) * 365 + Math.floor((theDateYear - 1921) / 4) + madd[TheDate.getMonth()] + TheDate.getDate() - 38
                if (theDateYear % 4 === 0 && TheDate.getMonth() > 1) {
                    total++
                }
                for (m = 0; ; m++) {
                    k = (CalendarData[m] < 0xfff) ? 11 : 12
                    for (n = k; n >= 0; n--) {
                    if (total <= this.getBit(CalendarData[m], n)) {
                        isEnd = true
                        break
                    }
                    total = total - this.getBit(CalendarData[m], n)
                    }
                    if (isEnd) {
                    break
                    }
                }
                let cMonth, cDay // cYear,
                // cYear = 1921 + m
                cMonth = k - n + 1
                cDay = total
                if (k === 12) {
                    if (cMonth === Math.floor(CalendarData[m] / 0x10000) + 1) {
                        cMonth = 1 - cMonth
                    }
                    if (cMonth > Math.floor(CalendarData[m] / 0x10000) + 1) {
                        cMonth--
                    }
                }
                // let run = ''
                let cDayStr = numString.charAt(cDay - 1)
                /* if (cMonth < 1) {
                    run = '(闰)'
                } */
                if (cDay % 10 !== 0 || cDay === 10) {
                    cDayStr = numString.charAt((cDay - 1) % 10)
                }
                return cDay === 1 ? monString.charAt(cMonth - 1) + '月' : (cDay < 11 ? '初' : (cDay < 20 ? '十' : (cDay < 30 ? '廿' : '三十'))) + cDayStr // tgString.charAt((cYear - 4) % 10) + dzString.charAt((cYear - 4) % 12) + '年 ' + run + monString.charAt(cMonth - 1) + '月' +
            }
        },
        getBit (m, n) { // 也是拷贝的，不是很明白这段代码干嘛的，不过很明显是处理二进制数据的
            return 29 + ((m >> n) & 1)
        }
    },
    data () {
        return {
            year: 0,
            month: 0,
            today: 0,
            days: [],
            weeks: ['一', '二', '三', '四', '五', '六', '日']
        }
    },
    mounted () {
        const now = new Date()
        this.year = now.getFullYear()
        this.month = now.getMonth() + 1
        this.today = now.getDate()
        this.getDays()
    }
}
</script>

<style lang="less">
.main {
    .choose_year {
        display: flex;
        .icon {
            width: 10%;
            height: 8vh;
            line-height: 8vh;
            text-align: center;
        }
        .date {
            width: 60%;
            text-align: center;
            height: 8vh;
            line-height: 8vh;
            font-size: 1.2rem;
        }
    }
    .days_area {
        display: flex;
        flex-wrap: wrap;
        .day {
            width: 14.28%;
            text-align: center;
            padding: 1vh 0;
            margin-top: 1vh;
            p {
                margin: 0;
                font-size: 16px;
            }
            span {
                font-size: 8px;
            }
        }
        .week{
            background-color: dodgerblue;
            color: #fff;
            font-weight: bold;
            height: 6vh;
            line-height: 4vh;
            margin: 0;
        }
        .choose_day{
            background-color: dodgerblue;
            color: #fff;
            font-weight: bold;
        }
    }
}
</style>
