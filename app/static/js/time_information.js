// upload time function
export default function indicate_time (time) {
    // jinja로 받아온 시간 
    let jinja = $(time).attr("value");
    let split_time = jinja.split('-');
    // Date 형식에 맞게 변환 (년,월,일,시,분,초 순서)
    let jinja_time = split_time[0]+"-"+split_time[1]+"-"+split_time[2]+" "+split_time[3]+":"+split_time[4]+":"+split_time[5];

    //현재 시간
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth()+1;// month는 0~11이기 때문에 +1 필요
    let date = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    // Date 형식에 맞게 변환
    let js_time = year+"-"+month+"-"+date+" "+hours+":"+minutes+":"+seconds;

    //업로드 시간 - 현재 시간
    let post_time = new Date(js_time) - new Date(jinja_time);

    //밀리초인 시간 차를 정수형으로 바꿈
    let day_seconds = 24*60*60*1000;
    let y = parseInt(post_time/(day_seconds*30*12));
    let m = parseInt(post_time/(day_seconds*30));
    let d = parseInt(post_time/day_seconds);
    let hr = Math.floor((post_time %(1000*60*60*24))/(1000*60*60));
    let min = Math.floor((post_time %(1000*60*60))/(1000*60));
    let sec = Math.floor((post_time %(1000*60))/1000);
    //최종 변환된 시간을 text로 입력
    //변환된 시간은 int 단위로 계속 변경되므로 누적 값인 밀리초로 조건 설정
    if (post_time < 60000) { //59초 까지만 초 단위
        $(time).text(sec+"초 전");
    }
    else if (post_time < 3600000) { //59분 까지만 분 단위
        $(time).text(min+"분 전");
    }
    else if (post_time < 86400000) { //23시 까지만 시간 단위
        $(time).text(hr+"시간 전");
    }
    else if (post_time < 604800000){ //6일 까지만 일 단위
        $(time).text(d+"일 전");
    }
    else if (y = 1){ //일주일 이후 부터 업로드 월,일 단위
        $(time).text(split_time[1]+"월 "+split_time[2]+"일");
    }
    else if (y > 1){ //해가 바뀌면 업로드 년,월,일 단위
        $(time).text(split_time[0]+"년 "+split_time[1]+"월 "+split_time[2]+"일");
    }
}