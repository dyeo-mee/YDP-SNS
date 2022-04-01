// post에 해당하는 notice의 image를 클릭하면 해당 게시물을 modal 형태로 띄움
let postNotice = document.querySelectorAll('.post_notice_click');

if (postNotice.length != 0) {
    // 각 post modal에 이벤트 추가
    postNotice.forEach(post => {
        // 이미지가 있는 post
        if (post.className.includes('post_notice_img')) {
            post.addEventListener('click', function(){
                let noticeModal = $(post).parent().siblings('.notice_modal_background');
                console.log(noticeModal);
                noticeModal[0].style.display = 'block';
                document.querySelector(".body").className = "body scroll_hidden";
            });
        } else { // text만 있는 post
            post.addEventListener('click', function(){
                let noticeModal = $(post).parent().parent().siblings('.notice_modal_background');
                console.log(noticeModal);
                noticeModal[0].style.display = 'block';
                document.querySelector(".body").className = "body scroll_hidden";
            });
        };
    });
};