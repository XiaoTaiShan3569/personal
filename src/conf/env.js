let redirectURL
    , loginURL
    , baseURL
    , webConsoleURLPrefix
    , redirect_uri = encodeURIComponent(location.origin + '');

console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);

if (process.env.NODE_ENV === 'development') {
    redirectURL = 'http://localhost:8080/cm/login.html?redirectUrl=' + redirect_uri + '';
    loginURL = 'http://localhost:8080/cm/login.html?redirectUrl=';
    webConsoleURLPrefix = 'http://10.25.81.230';
    baseURL = 'http://localhost:8080/api'
} else {


    switch(process.env.srconfig){
        case 'pro'://生产环境
            redirectURL = 'http://bip.pab.com.cn/cm/login.html?redirectUrl=' + redirect_uri + '';
            loginURL = 'http://localhost:8080/cm/login.html?redirectUrl=';
            webConsoleURLPrefix = 'http://10.14.22.90';
            baseURL = 'http://10.25.83.76:8088/api'
            break;
        default:
            redirectURL = 'http://bip.pab.com.cn/cm/login.html?redirectUrl=' + redirect_uri + '';
            loginURL = 'http://localhost:8080/cm/login.html?redirectUrl=';
            webConsoleURLPrefix = 'http://10.14.22.90';// 测试
            baseURL = 'http://10.14.22.92:8088/api';
            break;
    }

}

export {redirectURL, loginURL, baseURL, webConsoleURLPrefix}
