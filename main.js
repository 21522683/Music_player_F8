// *************************************
// Các công việc cần làm: 
//     1. Render song
//     2. Scroll top
//     3. Play / pause / seek
//     4. CD routate
//     5. Next / prev
//     6. Random
//     7. Next / repeat when ended
//     8. Active song
//     9. Scroll active song into view 
//     10. play song when click 
// ***************************************

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'TinhPhan'

const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Phố Đã Lên Đèn',
            singer: 'MASEW - Huyệt Tâm Môn',
            path: './assets/musics/song_1.mp3',
            image: './assets/images/image_1.jpg',
        },
	    {
            name: 'Cứ Chill Thôi',
            singer: 'Chilies - Suni Hạ Linh',
            path: './assets/musics/song_2.mp3',
            image: './assets/images/image_2.jpg',
        },
	    {
            name: 'Ta Còn Đây',
            singer: 'JustaTee - Rhymastic - SlimV',
            path: './assets/musics/song_3.mp3',
            image: './assets/images/image_3.jpg',
        },
	    {
            name: 'Ngày Mai Em Đi',
            singer: 'Soobin Hoàng Sơn - Lê HiếU',
            path: './assets/musics/song_4.mp3',
            image: './assets/images/image_4.jpg',
        },
	    {
            name: 'Nấu Cho Em Ăn',
            singer: 'Đen Vâu - PiaLinh',
            path: './assets/musics/song_5.mp3',
            image: './assets/images/image_5.jpg',
        },
	    {
            name: 'Người Gieo Mầm Xanh',
            singer: 'Hoàng Dũng - Hứa Kim Tuyền',
            path: './assets/musics/song_6.mp3',
            image: './assets/images/image_6.jpg',
        },
	    {
            name: 'Tìm Được Nhau Khó Thế Nào',
            singer: 'Anh Tú',
            path: './assets/musics/song_7.mp3',
            image: './assets/images/image_7.jpg',
        },
	    {
            name: 'Ngày đầu tiên',
            singer: 'Đức Phúc',
            path: './assets/musics/song_8.mp3',
            image: './assets/images/image_8.jpg',
        },
	    {
            name: 'Ta Còn Yêu Nhau',
            singer: 'Đức Phúc',
            path: './assets/musics/song_9.mp3',
            image: './assets/images/image_9.jpg',
        },
	    {
            name: 'Ánh Nắng Của Anh',
            singer: 'Đức Phúc',
            path: './assets/musics/song_10.mp3',
            image: './assets/images/image_10.jpg',
        }
    ],
    setConfig: function (key, value)
    {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        })
        playlist.innerHTML = htmls.join('');
    },
    definePropertys: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function()
    {
        const _this = this
        const cdWidth = cd.offsetWidth;
        // Xử lý phóng ta - thu nhỏ - trượt - lăn CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth - scrollTop

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth
        }
        // Xử lý click vào nút play bài hát
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }     
        }
        //Xử lý quay / dừng CD
        const cd_thumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 90000,
            interations: Infinity
        })

        cd_thumbAnimate.pause()
        // Khi bài hát đc play 
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cd_thumbAnimate.play()
        }
        // Khi bài hát đc pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cd_thumbAnimate.pause()
        }
        // Xử lý khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100)
                progress.value = progressPercent
            }
        }
        // Xử lý tua bài hát 
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime
        }


        // Xử lý click vào nút next bài hát
        nextBtn.onclick = function () {
            if (_this.isRandom)
            {
                _this.playRandomSong()
            }
            else {
                _this.nextSong()
            } 
            audio.play() 
            _this.render()  
            _this.scrollToActiveSong()
        }
        // Xử lý click vào nút prev bài hát
        prevBtn.onclick = function () {
            if (_this.isRandom)
            {
                _this.playRandomSong()
            }
            else {
                _this.prevSong()
            } 
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        // // Xử lý click vào nút random
        randomBtn.onclick = function () {
            _this.isRandom =!_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        // Khi bài hát phát đến cuối và xong
        // thì cho chuyển sag bài tiếp theo
        audio.onended = function () {
            if (_this.isRepeat)
            {
                audio.play();
            }
            else
            {
                nextBtn.click()
            }
        }

        // Xử lý khi click vào nút reapeat
        repeatBtn.onclick = function () {
            _this.isRepeat =!_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
                if (e.target.closest('.option'))
                {

                }
            }
        }

    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'center'
            })
        }, 300)
    },
    start: function () 
    {
        // Gán cấu hình từ config vào ứng dụng 
        this.loadConfig()
        // Định nghĩa ra các thuộc tính cho object
        this.definePropertys()
        // Lắng nghe và xử lý các sự kiện DOM Events
        this.handleEvents()
        // Tải thông tin bài hát đầu tiên khi chạy ứng dụng
        this.loadCurrentSong()
        // Render playlist song     
        this.render()
        // Hiển thị trạng thái ban đầu của btn repeat và random
        repeatBtn.classList.toggle('active', _this.isRepeat)
        randomBtn.classList.toggle('active', _this.isRandom)
    }
}

app.start();
