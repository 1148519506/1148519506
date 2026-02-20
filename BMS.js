/**
 *  - 智能防封雷达版 v11.0
 * 核心升级：
 * 1. 新增【402频繁熔断】机制：检测到频繁报错立即停止
 * 2. 保持 v10 的精准匹配和无缝连招
 */

var body = $response.body;
var url = $request.url;
var cType = $response.headers['Content-Type'] || '';

// === 1. API 层：雷达专属通道 ===
if (body && url.indexOf('timeReserveList') !== -1) {
    if (url.indexOf('ls_radar=1') !== -1) {
        // 雷达请求，放行真实数据（包含报错信息）
        $done({}); 
    } else {
        // 网页请求，伪造为100点亮按钮
        try {
            var json = JSON.parse(body);
            // 只有成功状态才伪造，如果是错误状态(402)直接透传显示给网页看
            if (json.status === 200 && json.data && Array.isArray(json.data)) {
                for (var i = 0; i < json.data.length; i++) {
                    json.data[i].num = 100; 
                    json.data[i].fsStatus = "T";
                }
                body = JSON.stringify(json);
            }
        } catch (e) {}
        $done({ body: body });
    }
}

// 规则放行
else if (body && body.indexOf('saleRuleDto') !== -1) {
    try {
        body = body.replace(/"buyDateAllow":\s*false/g, '"buyDateAllow":true')
                   .replace(/"stockAllow":\s*false/g, '"stockAllow":true')
                   .replace(/"buyTimeAllow":\s*false/g, '"buyTimeAllow":true');
        $done({ body: body });
    } catch(e) { $done({}); }
}

// === 2. 网页层：注入监控 UI 与 防封逻辑 ===
else if (body && cType.indexOf('text/html') !== -1) {
    var injectionCode = `
    <script>
    (function() {
        if (document.getElementById('ls-radar-root')) return;

        window.RADAR = {
            url: "",        
            body: "",       
            targetDate: "等待选择", 
            checkedTimes: [],       
            isRunning: false,
            scanTimer: null, 
            clickTimer: null 
        };

        function playAlarm() {
            try {
                if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
                var ctx = new (window.AudioContext || window.webkitAudioContext)();
                var osc = ctx.createOscillator();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 1.5);
            } catch(e) {}
        }

        var style = document.createElement('style');
        style.innerHTML = \`
            #ls-radar-root { position: fixed; top: 120px; right: 0; z-index: 999999; font-family: sans-serif; }
            #ls-ball { width: 45px; height: 45px; background: rgba(0, 0, 0, 0.8); border: 2px solid #00ff00; border-right: 0; border-radius: 25px 0 0 25px; color: #00ff00; line-height: 45px; text-align: center; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: -2px 2px 8px rgba(0,0,0,0.5); transition: all 0.3s; }
            #ls-ball.running { background: rgba(0, 200, 0, 0.9); color: #fff; border-color: #fff; animation: pulse 1.5s infinite; }
            #ls-ball.error { background: rgba(255, 0, 0, 0.9); color: #fff; border-color: #fff; } /* 错误状态样式 */
            #ls-panel { display: none; width: 260px; background: rgba(0, 0, 0, 0.95); border-radius: 8px 0 0 8px; border: 1px solid #444; border-right: 0; padding: 12px; color: white; box-shadow: -5px 5px 15px rgba(0,0,0,0.5); }
            .ls-title { font-weight: bold; color: #00ff00; border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 8px; display:flex; justify-content:space-between;}
            .ls-btn { width: 100%; padding: 10px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top:8px;}
            .ls-start { background: #28a745; color: white; }
            .ls-stop { background: #dc3545; color: white; }
            #ls-log { height: 100px; overflow-y: auto; background: #111; margin-top: 8px; font-size: 10px; color: #aaa; padding: 4px; border: 1px solid #333; line-height:1.4; word-break: break-all;}
            .ls-cb-group { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; font-size:11px;}
            .ls-cb-group label { background: #333; padding: 4px 6px; border-radius: 4px; border: 1px solid #555; display:flex; align-items:center; gap:3px; width:45%; box-sizing:border-box;}
            .ls-cb-group input { margin:0; }
            .date-display { color: #ffeb3b; font-weight: bold; font-size: 12px; margin-bottom: 8px; }
            .ls-input-freq { background:#222; border:1px solid #555; color:#fff; width:60px; padding:3px; border-radius:4px; text-align:center;}
            @keyframes pulse { 0% {box-shadow: 0 0 0 0 rgba(0,255,0,0.7);} 70% {box-shadow: 0 0 0 10px rgba(0,255,0,0);} 100% {box-shadow: 0 0 0 0 rgba(0,255,0,0);} }
        \`;
        document.head.appendChild(style);

        var savedFreq = localStorage.getItem('ls_scan_freq') || "800";

        var root = document.createElement('div');
        root.id = 'ls-radar-root';
        root.innerHTML = \`
            <div id="ls-ball" onclick="window.lsToggle()">监控</div>
            <div id="ls-panel">
                <div class="ls-title">
                    <span>🛡️ 防封雷达 v11.0</span>
                    <span onclick="window.lsToggle()" style="cursor:pointer; font-size:16px;">×</span>
                </div>
                <div class="date-display">锁定日期: <span id="ls-date-val">等待捕获...</span></div>
                
                <div style="font-size:12px; color:#aaa; margin-bottom:4px;">1. 勾选时段:</div>
                <div class="ls-cb-group">
                    <label><input type="checkbox" class="ls-time-cb" value="08:00-10:00" checked> 08:00-10:00</label>
                    <label><input type="checkbox" class="ls-time-cb" value="10:00-12:00" checked> 10:00-12:00</label>
                    <label><input type="checkbox" class="ls-time-cb" value="12:00-14:00"> 12:00-14:00</label>
                    <label><input type="checkbox" class="ls-time-cb" value="14:00-16:00"> 14:00-16:00</label>
                    <label><input type="checkbox" class="ls-time-cb" value="16:00-17:00"> 16:00-17:00</label>
                </div>

                <div style="font-size:12px; color:#aaa; margin-bottom:4px; display:flex; align-items:center; justify-content:space-between;">
                    <span>2. 刷新频率(ms):</span>
                    <input type="number" id="ls-freq" class="ls-input-freq" value="\${savedFreq}">
                </div>
                
                <button id="ls-btn" class="ls-btn ls-start" onclick="window.lsRun()">🚀 启动雷达</button>
                <div id="ls-log">请先点击日历上的目标日期...</div>
            </div>
        \`;
        document.body.appendChild(root);

        window.lsLog = function(msg) {
            var logDiv = document.getElementById('ls-log');
            var t = new Date().toTimeString().split(' ')[0];
            var currentLogs = logDiv.innerHTML.split('<br>');
            if (currentLogs.length > 30) currentLogs = currentLogs.slice(0, 30);
            logDiv.innerHTML = \`[\${t}] \${msg}<br>\` + currentLogs.join('<br>');
        }

        window.lsToggle = function() {
            var ball = document.getElementById('ls-ball');
            var panel = document.getElementById('ls-panel');
            if (panel.style.display === 'none' || panel.style.display === '') {
                panel.style.display = 'block'; ball.style.display = 'none';
            } else {
                panel.style.display = 'none'; ball.style.display = 'block';
            }
        }

        // 1. Hook XHR
        var originalOpen = XMLHttpRequest.prototype.open;
        var originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            return originalOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function(body) {
            if (this._url && this._url.indexOf('timeReserveList') !== -1 && this._url.indexOf('ls_radar') === -1) {
                window.RADAR.url = this._url;
                window.RADAR.body = body;
                try {
                    var payload = JSON.parse(body);
                    var dateStr = payload.occDate || payload.startTime || "未知日期";
                    if(dateStr && dateStr.indexOf('-') > 0) {
                        window.RADAR.targetDate = dateStr;
                        document.getElementById('ls-date-val').innerText = dateStr;
                    }
                } catch(e){}
                if(!window.RADAR.isRunning) window.lsLog("<span style='color:#0f0'>✅ 日期已捕获，可启动</span>");
            }
            return originalSend.apply(this, arguments);
        };

        // 2. 启动/停止
        window.lsRun = function() {
            var btn = document.getElementById('ls-btn');
            var ball = document.getElementById('ls-ball');

            if (window.RADAR.isRunning) {
                window.RADAR.isRunning = false;
                clearInterval(window.RADAR.scanTimer);
                clearInterval(window.RADAR.clickTimer);
                btn.innerText = "🚀 启动雷达";
                btn.className = "ls-btn ls-start";
                ball.className = ""; ball.innerText = "监控";
                // 移除错误样式
                ball.classList.remove('error');
                window.lsLog("⛔ 已手动停止");
            } else {
                if (!window.RADAR.url) return alert("请先在网页日历上点一下你要抢的日期！");

                var cbs = document.querySelectorAll('.ls-time-cb:checked');
                window.RADAR.checkedTimes = Array.from(cbs).map(cb => cb.value);
                if(window.RADAR.checkedTimes.length === 0) return alert("请至少勾选一个监控时间！");

                var freq = parseInt(document.getElementById('ls-freq').value);
                if(isNaN(freq) || freq < 200) freq = 200;
                localStorage.setItem('ls_scan_freq', freq);

                window.RADAR.isRunning = true;
                btn.innerText = "⛔ 停止雷达";
                btn.className = "ls-btn ls-stop";
                ball.className = "running"; ball.innerText = "运行";
                // 移除错误样式
                ball.classList.remove('error');
                
                window.lsToggle(); 
                try { var ctx = new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch(e){}

                window.lsLog("启动! 频率:" + freq + "ms");
                window.RADAR.scanTimer = setInterval(doScan, freq); 
            }
        };

        // 3. 后台真实扫描 (带防封检测)
        async function doScan() {
            if(!window.RADAR.isRunning) return;
            try {
                var fetchUrl = window.RADAR.url;
                fetchUrl += (fetchUrl.indexOf('?') === -1 ? '?' : '&') + 'ls_radar=1';

                var res = await fetch(fetchUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
                    body: window.RADAR.body
                });
                var json = await res.json();
                
                // === 【核心修复】防封检测 ===
                if (json.status === 402 || (json.message && json.message.indexOf("频繁") !== -1)) {
                    window.lsLog("<span style='color:red;font-weight:bold'>❌ " + (json.message || "操作频繁") + "</span>");
                    window.lsLog("<span style='color:red'>🛑 监控已紧急自动暂停！请休息一会</span>");
                    
                    // 强制停止
                    if(window.RADAR.isRunning) {
                        window.lsRun(); // 调用停止逻辑
                        // 视觉警告
                        var ball = document.getElementById('ls-ball');
                        ball.className = "error"; 
                        ball.innerText = "频繁";
                        window.lsToggle(); // 弹窗提示
                    }
                    return;
                }
                // ==========================

                var foundFullTimeStr = null;
                var foundStock = 0;

                if (json.data && Array.isArray(json.data)) {
                    for(var i=0; i<json.data.length; i++) {
                        var item = json.data[i];
                        // 精准匹配开始-结束时间
                        var fullTimeStr = item.startTime + "-" + item.endTime;
                        
                        if (window.RADAR.checkedTimes.includes(fullTimeStr) && item.num > 0) {
                            foundFullTimeStr = fullTimeStr;
                            foundStock = item.num;
                            break; 
                        }
                    }
                }

                if (foundFullTimeStr) {
                    executeCombo(foundFullTimeStr, foundStock); 
                } else {
                    window.lsLog("扫描中... | 无票");
                }
            } catch (e) {
                window.lsLog("请求异常，保持继续...");
            }
        }

        // === 4. 精准连招 ===
        function executeCombo(timeStr, stockNum) {
            clearInterval(window.RADAR.scanTimer); 
            
            playAlarm();
            var ball = document.getElementById('ls-ball');
            ball.innerText = "出票!"; ball.style.background = "red";
            window.lsLog("<span style='color:red;font-size:12px;font-weight:bold'>🎉 发现 " + timeStr + " 余票: " + stockNum + "张！</span>");

            var timeClicked = false;
            var allEls = document.querySelectorAll('div, span, li, .van-tag');
            for(var i=0; i<allEls.length; i++) {
                var el = allEls[i];
                if(el.offsetParent === null) continue;
                
                var txt = el.innerText || "";
                if(txt.indexOf(timeStr) !== -1 && txt.length < 30) {
                    el.click();
                    if(el.parentElement) el.parentElement.click();
                    el.style.border = "3px solid #00ff00"; 
                    window.lsLog("✅ 精准选中: " + timeStr);
                    timeClicked = true;
                    break;
                }
            }

            if(!timeClicked) window.lsLog("⚠️ 未找到时间块，尝试直接支付");

            window.lsLog("⏳ 等待页面...");
            
            setTimeout(function() {
                window.lsLog("🔥 激活极速支付...");
                
                window.RADAR.clickTimer = setInterval(function() {
                    if(!window.RADAR.isRunning) {
                        clearInterval(window.RADAR.clickTimer);
                        return;
                    }
                    
                    var keywords = ["提交订单", "立即支付", "确认", "确定", "去支付", "立即预订"];
                    var btns = document.querySelectorAll('div, span, button, a');
                    
                    for(var i=0; i<btns.length; i++) {
                        var el = btns[i];
                        if(el.offsetParent === null) continue; 
                        
                        var txt = el.innerText || el.textContent || "";
                        txt = txt.trim();
                        
                        if(keywords.some(key => txt.includes(key)) && txt.length < 15) {
                            el.style.border = "3px solid red"; 
                            el.click();
                            console.log("【点击支付】: " + txt);
                        }
                    }
                }, 200);

                setTimeout(function() { 
                    clearInterval(window.RADAR.clickTimer); 
                    if(window.RADAR.isRunning) window.lsRun();
                }, 15000);

            }, 600); 
        }

    })();
    </script>
    `;
    $done({ body: body.replace('</body>', injectionCode + '</body>') });
} else {
    $done({});
}
