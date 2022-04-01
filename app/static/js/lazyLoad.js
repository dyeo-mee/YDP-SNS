document.addEventListener("DOMContentLoaded", function() {
    let lazyloadPost;    
    //IntersectionObserver를 지원하는 브라우저
    if ("IntersectionObserver" in window) {
        //모든 post를 불러옴
        lazyloadPost = document.querySelectorAll(".index_content");
        //post lazy loading
        let postObserver = new IntersectionObserver(function(entries, observer) {
            //entry => 관찰 대상
            entries.forEach(function(entry) {
                // console.log(entries.indexOf(entry) , "entries num")
                //상단 3개의 post는 lazy 효과없이 미리 보여줌
                if (entries.indexOf(entry) < 3) {
                    let loadedPost = entry.target;
                    //lazy load 적용을 쉽게 확인 할 "easyCheck" class
                    loadedPost.classList.remove("easyCheck");
                    //해당 post의 image
                    let image = $(loadedPost).children().children('.content_image_viewer').children().children('.img_album').children();
                    let src = image.data().src;
                    image.attr('src',`${src}`);
                };
                //entry가 뷰포트에 들어옴을 감지했을 때
                if (entry.isIntersecting) {
                    // console.log("isIntersecting", entry)
                    //해당 entry를 타겟으로 post 변수에 할당
                    let post = entry.target;
                    //해당 post의 images
                    let images = post.querySelectorAll('.content_image');
                    // console.log(images)

                    //모든 data-src 속성 값을 src 속성으로 이동
                    images.forEach(image => {
                        // console.log(image)
                        let src = $(image).data().src;
                        $(image).attr('src',`${src}`);
                        // console.log(image.src, "src")
                        //image lazy 클래스 제거
                        $(image).attr("class", "content_image");
                    });
                    //post easyCheck 클래스 제거
                    post.classList.remove("easyCheck");
                    //옵저버를 제거
                    postObserver.unobserve(post);
                }
            });
        },{
            // root: document.querySelector("body"),
            // rootMargin: "0px 0px 500px 0px"
        });
    
        lazyloadPost.forEach(function(post) {
            //lazy load할 post에 옵저버 부착
            postObserver.observe(post);
        });
    } else {  //IntersectionObserver를 지원하지 않는 브라우저
        let lazyloadThrottleTimeout;
        lazyloadPost = document.querySelectorAll(".index_content");
        
        function lazyload () {
            if(lazyloadThrottleTimeout) {
                clearTimeout(lazyloadThrottleTimeout);
            }; 
  
            lazyloadThrottleTimeout = setTimeout(function() {
                //윈도우 스크롤 높이
                let scrollTop = window.pageYOffset;
                //lazy 클래스가 있는 모든 이미지들
                lazyloadPost.forEach(function(post) {
                    //post top 위치가 윈도우 창의 높이+스크롤 높이보다 작으면
                    if(post.offsetTop < (window.innerHeight + scrollTop)) {
                        //해당 post 이미지의 data-src속성 값을 src 속성으로 바꿈
                        let images = $(loadedPost).children().children('.content_image_viewer').children().children('.img_album').children();
                        
                        images.forEach(image => {
                            // console.log(image)
                            let src = $(image).data().src;
                            $(image).attr('src',`${src}`);
                            //image lazy 클래스 제거
                            $(image).attr("class", "content_image");
                        });
                        //post easyCheck 클래스 제거
                        post.classList.remove("easyCheck");
                        console.log("lazy load")
                    }
                });

            //lazy 클래스를 가진 이미지가 더이상 없으면
            if(lazyloadPost.length == 0) { 
                //이벤트 리스너 제거
                document.removeEventListener("scroll", lazyload);
                window.removeEventListener("resize", lazyload);
                window.removeEventListener("orientationChange", lazyload);
            }
        //20밀리초 후 실행(스크롤 이벤트는 빠르고 자주 일어나므로)
        }, 20);
    }
    // 스크롤 이벤트
    document.addEventListener("scroll", lazyload);
    // 브라우저 사이즈 감지
    window.addEventListener("resize", lazyload);
    // 화면 모드 감지
    window.addEventListener("orientationChange", lazyload);
    }
});