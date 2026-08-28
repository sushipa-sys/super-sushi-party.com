// ダークモード切り替え機能
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    
    // 保存されている設定を読み込む
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // デフォルト設定（保存値があればそれを使用、なければシステム設定に従う）
    const defaultDarkMode = savedDarkMode ? savedDarkMode === 'true' : prefersDarkMode;
    
    // 初期状態を設定
    if (defaultDarkMode) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = true;
        if (darkModeToggleMobile) darkModeToggleMobile.checked = true;
    }
    
    // ダークモード切り替え関数
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // チェックボックスの同期
        if (darkModeToggle) darkModeToggle.checked = isDarkMode;
        if (darkModeToggleMobile) darkModeToggleMobile.checked = isDarkMode;
        
        // 設定を保存
        localStorage.setItem('darkMode', isDarkMode);
    }
    
    // イベントリスナーを設定
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    if (darkModeToggleMobile) {
        darkModeToggleMobile.addEventListener('change', toggleDarkMode);
    }
}

// スムーススクロール機能
function initSmoothScroll() {
    // すべてのアンカーリンクをセレクト
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    // 各リンクにクリックイベントリスナーを追加
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // デフォルトの動作をキャンセル
            e.preventDefault();
            
            // ターゲット要素のIDを取得
            const targetId = this.getAttribute('href');
            
            // ターゲット要素を取得
            const targetElement = document.querySelector(targetId);
            
            // モバイルメニューが開いている場合は閉じる
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            }
            
            if (targetElement) {
                // ヘッダーの高さを取得（オフセット用）
                const headerHeight = document.querySelector('header').offsetHeight;
                
                // ターゲット要素の位置を取得し、ヘッダーの高さを考慮
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                // スムーススクロールを実行
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// スクロールスパイ機能 - 現在のセクションに基づいてナビゲーションをハイライト
function initScrollSpy() {
    // セクションと対応するナビゲーションリンクを取得
    const sections = document.querySelectorAll('.parallax-container[id], #CONTACT');
    const navLinks = document.querySelectorAll('header nav ul li a, .mobile-menu ul li a');
    
    // スクロール位置に基づいてアクティブなリンクを更新する関数
    function updateActiveLink() {
        // 現在のスクロール位置
        const scrollPosition = window.scrollY;
        
        // ヘッダーの高さ（オフセット用）
        const headerHeight = document.querySelector('header').offsetHeight;
        
        // 各セクションをチェック
        sections.forEach(section => {
            // セクションの位置と高さを取得
            const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - headerHeight - 50; // 少しオフセットを追加
            const sectionBottom = sectionTop + section.offsetHeight;
            
            // 現在のスクロール位置がセクション内にあるか確認
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                // 対応するIDを持つリンクを探してアクティブに
                const targetId = '#' + section.id;
                
                // すべてのリンクからアクティブクラスを削除
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // 現在のセクションに対応するリンクにアクティブクラスを追加
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === targetId) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // トップページの特別処理（最初のセクションより上）
        const firstSection = sections[0];
        const firstSectionTop = firstSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 50;
        
        if (scrollPosition < firstSectionTop) {
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
        }
    }
    
    // スクロールイベントとページロード時にアクティブリンクを更新
    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', updateActiveLink);
}

// モバイルメニューの改善された制御機能
// モバイルメニュー操作の完全な修正
// script.js内のenhanceMenuAnimation関数を置き換えてください

function enhanceMenuAnimation() {
    const mobileMenuOpenBtn = document.getElementById('mobileMenuOpen');
    const mobileMenuCloseBtn = document.getElementById('mobileMenuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!mobileMenuOpenBtn || !mobileMenuCloseBtn || !mobileMenu) {
        console.warn('モバイルメニュー要素が見つかりません');
        return;
    }
    
    // メニューを開く
    mobileMenuOpenBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // スクロール防止
    });
    
    // メニューを閉じる
    mobileMenuCloseBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = ''; // スクロール再開
    });
    
    // モバイルメニュー内のリンクをクリックしたときにメニューを閉じる
    const mobileMenuLinks = mobileMenu.querySelectorAll('ul li a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = ''; // スクロール再開
        });
    });
    
    // 画面サイズが変更されたときに、768px以上になったらメニューを閉じる
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ページ読み込み時に実行されるメインコード
document.addEventListener('DOMContentLoaded', function() {
    // 初期表示時はbodyにinitialクラスを追加
    document.body.classList.add('initial');

    // プロジェクト画像のロード時のアニメーション
    const projects = document.querySelectorAll('.project');
    projects.forEach(project => {
        const img = project.querySelector('img');
        
        // デフォルトで表示する（念のため）
        project.style.opacity = 1;
        
        if (img) {
            // 画像が既に読み込まれているか、まだ読み込み中かをチェック
            if (img.complete) {
                // 既に読み込まれている場合は直接表示
                project.style.opacity = 1;
            } else {
                // まだ読み込まれていない場合のみ一度透明にしてからフェードイン
                project.style.opacity = 0;
                project.style.transition = 'opacity 0.5s ease';
                
                img.addEventListener('load', () => {
                    project.style.opacity = 1;
                });
            }
        }
    });

    // スクロールアニメーション - ヘッダースタイル変更
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        
        if (window.scrollY > 50) {
            // スクロールした状態
            header.classList.add('scrolled');
            document.body.classList.remove('initial');
        } else {
            // 初期状態
            header.classList.remove('scrolled');
            document.body.classList.add('initial');
        }
    });

    // パララックスタイトルの動きをスクロールに合わせたフェードイン+上昇アニメーションに変更
    function initParallaxTitles() {
        const parallaxTitles = document.querySelectorAll('.parallax-title');
        
        // 初期状態を設定（非表示、下から上に移動するための準備）
        parallaxTitles.forEach(title => {
            title.style.opacity = '0';
            title.style.transform = 'translateY(50px)';
            title.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        });
        
        // スクロール監視の関数
        function checkScroll() {
            parallaxTitles.forEach(title => {
                const container = title.closest('.parallax-container');
                if (!container) return;
                
                const containerPosition = container.getBoundingClientRect();
                
                // 要素が画面内に入ったかどうかをチェック（少し手前から表示開始）
                if (containerPosition.top < window.innerHeight * 0.85) {
                    // 画面内に入ったらアニメーション適用
                    title.style.opacity = '1';
                    title.style.transform = 'translateY(0)';
                } else {
                    // 画面外に出たら再度非表示にする（上にスクロールして戻ってきたとき用）
                    title.style.opacity = '0';
                    title.style.transform = 'translateY(50px)';
                }
            });
        }
        
        // スクロールイベントのリスナー
        window.addEventListener('scroll', checkScroll);
        
        // 初期チェック（ページロード時に表示領域内にある場合）
        checkScroll();
    }

    // スライダーの自動切り替え機能
    function initSlider() {
        const sliderItems = document.querySelectorAll('.slider-item');
        if (sliderItems.length <= 1) return; // スライダーアイテムが1つ以下なら実行しない
        
        let currentIndex = 0;
        
        function showSlide(index) {
            // すべてのスライドからactiveクラスを削除
            sliderItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // 指定したインデックスのスライドにactiveクラスを追加
            sliderItems[index].classList.add('active');
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % sliderItems.length;
            showSlide(currentIndex);
        }
        
        // 5秒ごとにスライドを切り替え
        setInterval(nextSlide, 5000);
    }

    // パララックス背景のスクロールエフェクト
    function initParallaxBg() {
        const parallaxBg = document.querySelector('.parallax-bg');
        if (!parallaxBg) return;
        
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            const section = parallaxBg.closest('.parallax-bg-section');
            
            if (!section) return;
            
            const sectionPosition = section.offsetTop;
            const relativeScroll = scrollPosition - sectionPosition;
            
            // スクロール位置に応じて背景画像の位置を調整
            // セクションが表示範囲に入っているときだけ計算する
            const windowHeight = window.innerHeight;
            const sectionRect = section.getBoundingClientRect();
            const sectionTop = sectionRect.top;
            const sectionBottom = sectionRect.bottom;
            
            if (sectionTop < windowHeight && sectionBottom > 0) {
                // セクションが表示範囲内にある場合
                const translateY = relativeScroll * 0.4; // 移動速度の調整（小さいほど遅く動く）
                parallaxBg.style.transform = `translateY(${translateY}px)`;
            }
        });
    }

    // 各機能を初期化
    initSlider();
    initParallaxTitles();
    initParallaxBg();
    initDarkModeToggle(); // ダークモード切り替え機能を初期化
    initSmoothScroll(); // スムーススクロールを初期化
    initScrollSpy(); // スクロールスパイを初期化
    enhanceMenuAnimation(); // メニューアニメーションを強化
    initVideoGrid(); // 動画グリッドを初期化
    initNewsModal(); // ニュースモーダルを初期化
    
    // 初期表示時にもヘッダースタイルを適用
    window.dispatchEvent(new Event('scroll'));
});

// 動画グリッド初期化機能
function initVideoGrid() {
    const videoGrid = document.querySelector('.video-grid');
    if (!videoGrid) return; // 動画グリッドが存在しない場合は終了
    
    const videos = videoGrid.querySelectorAll('video');
    
    // 各動画の自動再生を確実にする
    videos.forEach((video, index) => {
        // 動画の読み込みが完了したら再生
        video.addEventListener('loadeddata', function() {
            // 自動再生を試みる
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // 自動再生が失敗した場合（ブラウザのポリシーによる）
                    console.log(`動画${index + 1}の自動再生がブロックされました:`, error);
                    
                    // ユーザーの最初のインタラクション後に再生
                    document.addEventListener('click', function playOnClick() {
                        video.play();
                        document.removeEventListener('click', playOnClick);
                    }, { once: true });
                });
            }
        });
        
        // 動画が一時停止された場合、再度再生を試みる
        video.addEventListener('pause', function() {
            setTimeout(() => {
                if (!video.ended) {
                    video.play().catch(e => console.log('再生エラー:', e));
                }
            }, 100);
        });
        
        // 動画の再生エラーをハンドリング
        video.addEventListener('error', function(e) {
            console.error(`動画${index + 1}の読み込みエラー:`, e);
        });
    });
    
    // ページが表示された時に動画を再生（ページ遷移後の対応）
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            videos.forEach(video => {
                if (video.paused) {
                    video.play().catch(e => console.log('再生エラー:', e));
                }
            });
        }
    });
    
    // 6個または9個の切り替え機能（オプション）
    // data-grid-size属性を変更することで切り替え可能
    window.setVideoGridSize = function(size) {
        if (size === 6 || size === 9) {
            videoGrid.setAttribute('data-grid-size', size);
        }
    };
}

// ニュースモーダル機能
function initNewsModal() {
    const modal = document.getElementById('newsModal');
    if (!modal) return; // モーダルが存在しない場合は終了
    
    const modalClose = modal.querySelector('.modal-close');
    const newsCards = document.querySelectorAll('.news-card, .info-grid-card');
    
    // ニュースデータ（実際のプロジェクトではAPIから取得することを推奨）
    const newsData = {
        '1': {
            date: '2026.01.17',
            title: '"TOKYO CITY POP" gallery project Vol7,参加のお知らせ',
            image: '../image/info_01_20260117.jpg',
            description: `
                <p>1月23日（金）〜1月30日（金）アートプロジェクト「"TOKYO CITY POP" gallery project Vol.7,「HOT DOGS」に@iyomtmtが参加します。</p>
                <p>会場では作品の展示とグッズ販売を行います。ぜひお越しください。</p>
                <p><strong>開催期間：</strong>2026年1月23日（金）〜 1月30日（金）<br>
                <strong>参加アーティスト：</strong>@iyomtmt</p>
            `
        },
        '2': {
            date: '2025.09.03',
            title: 'NICE ZINE ! 展 開催のお知らせ',
            image: '../image/info_01_0903.jpg',
            description: `
                <p>2025年9月3日（水）〜 9月14日（日）に、横浜の<a href="https://hfg-art.com/exhibition/nice-zine-%e5%b1%95/" target="_blank">FEI ART MUSEUM YOKOHAMA</a>にて「NICE ZINE ! 展」を開催いたします。</p>
                <p>入場無料となっておりますので、お気軽にお越しください。</p>
                <p>※月曜日は休廊日となります。</p>
                <p><strong>開催期間：</strong>2025年9月3日（水）〜 9月14日（日）<br>
                <strong>会場：</strong>FEI ART MUSEUM YOKOHAMA<br>
                <strong>入場料：</strong>無料<br>
                <strong>休廊日：</strong>月曜日</p>
            `
        },
        '3': {
            date: '2025.04.01',
            title: '2025.4.29（木）〜5.4（日）に1st EXHIBITION -HEY! OMACHI- 開催決定！',
            image: '../image/info_01.jpg',
            description: `
                <p>スーパースシパーティー初の個展開催！</p>
                <p>来場者プレゼントもあるよ！ぜひお越しください。</p>
                <p><strong>開催期間：</strong>2025年4月29日（木）〜 5月4日（日）<br>
                <strong>タイトル：</strong>1st EXHIBITION -HEY! OMACHI-</p>
            `
        },
        '4': {
            date: '2025.07.20',
            title: 'コラボレーション企画始動',
            image: '../image/info_02_0903.jpg',
            description: `
                <p>新たなクリエイターとのコラボレーション企画がスタートしました。</p>
                <p>異なるジャンルのアーティストと協力し、これまでにない作品を制作予定です。</p>
                <p>続報をお楽しみに。</p>
            `
        },
        '5': {
            date: '2025.06.10',
            title: '新作アニメーション制作中',
            image: '../image/info_01_0903.jpg',
            description: `
                <p>現在、新作アニメーションを制作中です。</p>
                <p>これまでの作品とは一味違った、新しい試みを盛り込んでいます。</p>
                <p>完成をお楽しみに。</p>
            `
        },
        '6': {
            date: '2025.05.01',
            title: 'ウェブサイトリニューアル',
            image: '../image/info_02_0903.jpg',
            description: `
                <p>公式ウェブサイトをリニューアルいたしました。</p>
                <p>より使いやすく、見やすいデザインになっております。</p>
                <p>今後とも、Super Sushi Partyをよろしくお願いいたします。</p>
            `
        },
        '7': {
            date: '2026.04.17',
            title: '「文学フリマ東京42」出店のお知らせ',
            image: '../image/info_img_event_20260504.jpg',
            description: `
                <p>5/4(月祝)GWに、文学フリマ東京42に出店いたします！🐟<br>スーパーな寿司本を鋭意制作中です。</p>
                <p>お品書きなど、続報をお待ちください！</p>
                <p>
                    <strong>🌟2026/5/4(月祝)</strong><br>
                    ・場所：東京ビッグサイト 南1-4ホール<br>
                    ・ブース：お-32 "HOME PARTY"<br>
                    ・入場料：¥1,000(前売) / ¥1,350(当日スマチケ) / ¥1,500(当日窓口)<br>
                    ※18歳以下入場無料
                </p>
                <p><a href="https://bunfree.net/event/tokyo42/" target="_blank">▶ 文学フリマ東京42 詳細はこちら</a></p>
            `
        },
        '8': {
            date: '2026.04.18',
            title: '馬橋稲荷神社の奉納舞踊イベント参加のお知らせ',
            image: '../image/info_img_event_20260510.jpg',
            description: `
                <p>GWは文フリ出店につづき、馬橋稲荷神社の奉納舞踊イベントでも出店させていただけることになりました！🐟</p>
                <p>舞香さん( @maika_fujii )の奉納舞踊にあわせて、雑貨などを販売させていただきます🍃</p>
                <p>スーパーな寿司雑貨を鋭意制作中です。</p>
                <p>食べ物やビールのお店もでるみたいなので、お散歩ついでにぜひとも🚶✨</p>
                <p>お品書きなど、続報をお待ちください！</p>
                <p>
                    <strong>🌟2026/5/10(日)</strong><br>
                    ・時間：16:30〜20:00<br>
                    ・場所：馬橋稲荷神社（阿佐ヶ谷駅、高円寺駅から10分くらい🚶）<br>
                    　杉並区阿佐谷南２丁目４−４
                </p>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
                    <img src="../image/info_img_event_20260510_02.png" alt="馬橋稲荷神社イベント" style="width:calc(50% - 5px);border-radius:8px;object-fit:cover;">
                    <img src="../image/info_img_event_20260510_03.png" alt="馬橋稲荷神社イベント" style="width:calc(50% - 5px);border-radius:8px;object-fit:cover;">
                </div>
            `
        }
    };
    
    // カードクリック時の処理
    newsCards.forEach(card => {
        card.addEventListener('click', function() {
            const newsId = this.getAttribute('data-news-id');

            // newsData にIDがあればそれを使い、なければカードHTMLから読む
            let news = newsData[newsId];
            if (!news) {
                const hiddenDesc = this.querySelector('.card-modal-description');
                news = {
                    date:        (this.querySelector('.info-grid-date, .news-date') || {}).textContent || '',
                    title:       (this.querySelector('.info-grid-title, .news-title') || {}).textContent || '',
                    image:       (this.querySelector('img') || {}).getAttribute ? this.querySelector('img').getAttribute('src') : '',
                    description: hiddenDesc ? hiddenDesc.innerHTML
                                           : '<p>' + ((this.querySelector('.info-grid-caption, .news-caption') || {}).innerHTML || '') + '</p>'
                };
            }

            if (news) {
                // モーダルに情報を設定
                modal.querySelector('.modal-date').textContent = news.date;
                modal.querySelector('.modal-title').textContent = news.title;
                modal.querySelector('.modal-image img').src = news.image;
                modal.querySelector('.modal-image img').alt = news.title;
                modal.querySelector('.modal-description').innerHTML = news.description;

                // モーダルを表示
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // スクロール防止
            }
        });
    });
    
    // 閉じるボタンのクリック処理
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // モーダル外クリックで閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESCキーで閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // モーダルを閉じる関数
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // スクロール再開
    }
}