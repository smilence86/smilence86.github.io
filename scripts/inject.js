// https://github.com/kingdido999/zooming

hexo.extend.injector.register('head_end', '<script src="https://unpkg.com/zooming/build/zooming.min.js"></script>', 'post');

hexo.extend.injector.register('head_end', '<link rel="stylesheet" href="/css/zooming.css" />', 'post');

hexo.extend.injector.register('body_end', '<script>document.addEventListener("DOMContentLoaded", function () {new Zooming({customSize: "80%", "bgColor":"rgb(0, 0, 0)", "bgOpacity":0.6, "enableGrab": true}).listen(".img-zoomable")})</script>', 'post');

