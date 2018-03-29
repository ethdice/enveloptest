var M = {
    walletAddr: ''
    , contracts: {}
    , path: 'http://blockchain.ijinshan.com/redpacket'
    , isLoadingRecord: false//是否还在请求
    , record :  null
    , timerToast: null
    , curLang: 'zh'
    , lang: {}
    , isInDapp: function(){
        return (navigator.userAgent.indexOf('inDapp')>-1);
    }
    , isInIosDapp: function(){
        return (navigator.userAgent.indexOf('inIosDapp')>-1);
    }
    , iosWalletAddress: function(str){
        M.walletAddr = str;
    }
    , getWalletAddr: function(){
        // M.walletAddr = '0x7fec28c6c1dd271830c8f2ba77dd15f987bbd329';
        // M.walletAddr = '0xf858f42b162bb1ef0c5d99b32b28f3b00b124170';
        if(M.isInDapp()){
            M.walletAddr = RedEnvelopeHost.getWalletAddress();
            $('html').addClass('android')
        }else if(M.isInIosDapp()){
            if($('body').hasClass('index')){
                window.webkit.messageHandlers.h5Callback.postMessage({indexName:'address'});
            }else{
                window.webkit.messageHandlers.sofaWalletAddress.postMessage({indexName:'address'});
            }
            $('html').addClass('ios')
        }
    }
    , getUserId: function(){
        if(M.isInDapp()){
            return RedEnvelope.getUserId();
        }else if(M.isInIosDapp()){
            return '';
        }
        return '';
    }
    , getEnvelopWord: function(){
        if(M.isInDapp()){
            return RedEnvelope.getRedPacketPwd();
        }else if(M.isInIosDapp()){
            return '';
        }
        return '';

    }
    , isDownload: function(){
        if(!M.isInDapp() && !M.isInIosDapp()){
            var r = confirm("是否下载Dapp");
            if(r){
                location.href = 'https://www.cmcmbc.com/zh-cn/dapp-browser/';
            }            
            return false;
        }
    }
    , jumpUrl: function(url){
        if(!M.isHasNetwork()){
        // alert(M.lang[M.curLang]['other']['noNetwork'])
            M.showToast(M.lang[M.curLang]['other']['noNetwork'])
            return;
        }
        if(M.isInDapp()){
            if(url.indexOf('back')>-1){
                RedEnvelopeHost.onBackToRedEnvelope();
            }else{
                RedEnvelopeHost.jumpToEnvelope(url);
            }
        }else if(M.isInIosDapp()){
            if(url == 'back'){
                window.webkit.messageHandlers.sofaH5Callback.postMessage({indexName: url});
            }else{
                window.webkit.messageHandlers.h5Callback.postMessage({indexName: url});
            }
        }
    }
    , shareImg: function(obj){
        if(!M.isHasNetwork()){
            M.showToast(M.lang[M.curLang]['other']['noNetwork'])
            return;
        }
        if(M.isInDapp()){
            if(obj != ''){
                RedEnvelopeHost.createEnvelopeShare(JSON.stringify(obj));
            }else{
                RedEnvelopeHost.createEnvelopeShare('');
            }
            
        }else if(M.isInIosDapp()){
            if(obj != ''){
                window.webkit.messageHandlers.shareHongbao.postMessage({
                    hongbaoCount:obj.count
                    , ethCount: obj.money
                    , word: obj.word
                    , invalidTime:obj.time
                });
            }else{
                window.webkit.messageHandlers.h5Callback.postMessage({indexName:'share'});
            }
        }
    }
    , getLang: function(){
         if(M.isInDapp()){
            return RedEnvelopeHost.getMobileLanguage();
        }else if(M.isInIosDapp()){
            return 'zh';
        }
        return 'zh';
    }
    , isHasNetwork: function(){
        if(M.isInDapp()){
            return RedEnvelopeHost.isMobileNetAvailable();
        }else if(M.isInIosDapp()){
            return true;
        }
        return true;
    }
    , bind: function(){

        $('.btn-send').click(function(){
            M.isDownload();
            M.jumpUrl('send.html');
        })
        $('.btn-snatch').click(function(){
            M.isDownload();
            M.jumpUrl('snatch.html');
        })

        $('.tip-record').click(function(){
            M.isDownload();
            M.jumpUrl('record.html');
        })

        $('.btn-generate').click(function(){
            M.isDownload();
            M.shareImg('');
        })

        $('.btn-return').click(function(){
            M.jumpUrl('back');
        })

        $('.btn-confirm-pw').click(function(){
            // alert('generate image');
            var account = M.walletAddr
                , word = $('.snatch textarea[name=command]').val()
                , btn = $(this)
                ;
            if(btn.hasClass('disabled')){
                return;
            }
            btn.addClass('disabled')

            if(!M.isHasNetwork()){
                M.showToast(M.lang[M.curLang]['other']['noNetwork'])
                return;
            }

            if($('textarea[name=command]').val() != ''){
                $('.loading').show();
                $.ajax({
                    type: "POST",
                    url: M.path + "/checkWord?word="+word+'&receiver='+account,
                    dataType: "json",
                    success: function(data){
                        console.log(data)
                        btn.removeClass('disabled')
                        $('.loading').hide();
                        if(data.ret == 0){
                            $('.pop-envelope').show();
                            $('.pop-envelope .t span').html(word);
                            // $('.pop-envelope .pop-btn-open').attr('url', 'detail.html?word='+encodeURIComponent(word));

                        }else if(data.ret == 10004){ //no such red packet
                            M.showToast(data.msg);
                        }else if(data.ret == 10005){//late
                            $('.pop-envelope .view-detail').attr('url', 'detail.html?word='+encodeURIComponent(word));
                            $('.pop-envelope').addClass('late').show();
                        }else if(data.ret == 10003){                            
                            M.jumpUrl('detail.html?word='+encodeURIComponent(word));
                        }else {
                            M.showToast(data.msg)
                        }

                    }
                });

                
            }else{
                btn.removeClass('disabled')

            }
        })


        $('.pop-btn-open').click(function(){
            var account = M.walletAddr
                , word = $('.snatch textarea[name=command]').val()
                , btn = $(this)
                ;
            btn.addClass('disabled')
            btn.addClass('anim')
            $.ajax({
                type: "POST",
                url: M.path + "/snatch?word="+word+'&receiver='+account,
                dataType: "json",
                success: function(data){

                    setTimeout(function(){
                        btn.removeClass('disabled')

                        if(data.ret == 0){
                            M.jumpUrl('detail.html?word='+encodeURIComponent(word));
                        }else if(data.ret == 10004){ //no such red packet
                            M.showToast(data.msg);
                        }else if(data.ret == 10005){//late
                            $('.pop-envelope .view-detail').attr('url', 'detail.html?word='+encodeURIComponent(word));
                            $('.pop-envelope').addClass('late').show();
                        }else if(data.ret == 10003){
                            // location.href = 'detail.html?word='+encodeURIComponent(word);
                            
                            M.jumpUrl('detail.html?word='+encodeURIComponent(word));
                            // RedEnvelopeHost.jumpToEnvelope('detail.html?word='+encodeURIComponent(word));
                        }else {
                            M.showToast(data.msg)
                        }
                        btn.removeClass('anim')
                    }, 1200)
                    
                    console.log(data)
                    

                }
            });
        })

        $('.view-detail').click(function(){
            M.jumpUrl($(this).attr('url'));
        })

        $('body').on('click', '.record-list a', function(){
            M.jumpUrl($(this).attr('url'));
        })
        

        $('.pop-close').click(function(){
            // alert('generate image');
            $('.pop-envelope').removeClass('late').hide();

        })
        if($('#iptCount').length > 0){
            // 1-500
            document.getElementById('iptCount').addEventListener('input', function(e){
                var v = e.target.value
                    , max = 500
                    , str = ''
                    , isHasError = true
                    ;
                if(v == 0){
                    // str = '调皮，至少发一个，请重新填写';
                    str = '';
                // }else if((v+'').length > 3){
                    // $(this).val((v+'').substr(0, 3))
                    // str = '最多只能发500个红包哦'
                }else if(v > max){
                    str = M.lang[M.curLang]['send']['msg4'];
                }else{
                    str = '';
                    isHasError = false;
                }      
                checkBtnStatus(str, isHasError, $(this));
                isClick(isHasError);
               
            })
        }
       
        if($('#iptMoney').length > 0){
            // 0.001 -1000
            document.getElementById('iptMoney').addEventListener('input', function(e){
                var v = $(this).val()
                    , str = ''
                    , isHasError = false
                    ;
                if(v == 0){
                    v = '0.0000';
                    isHasError = true;
                }else if(v > 1000){
                    str = M.lang[M.curLang]['send']['msg3'];
                    isHasError = true;
                }
                $('.money .big').html(v)
                checkBtnStatus(str, isHasError, $(this));
                isClick(isHasError);
            })
        }
        

        //6-20
        if($('#iptCommand').length > 0){
            document.getElementById('iptCommand').addEventListener('input', function(e){
                var str = ''
                if($(this).val()==''){
                    isHasError = true;
                }else if($(this).val().length > 20){
                    str = M.lang[M.curLang]['send']['msg7'];
                    isHasError = true;
                }else if($(this).val().length < 6){
                    if($(this).hasClass('hasClicked')){
                        isHasError = true;
                        // str = '最少输入6个字符'
                    }else{
                        isHasError = false;
                    }
                }else{
                    isHasError = false;
                }
                checkBtnStatus(str, isHasError, $(this));
                isClick(isHasError);

            })
        }
            

        function checkBtnStatus(str, isHasError, input){
            if(str != ''){
                M.showToast(str)
                $('.btn').addClass('disabled');
            }

            if(isHasError){//is error
                input.addClass('error');
                // if(str != ''){
                    input.parent().addClass('error');
                // }
            }else{
                input.removeClass('error');
                input.parent().removeClass('error');
            }

        }

        function isClick(isAdd){
            if(isAdd) {
                $('.btn').addClass('disabled');
            }else{
                if($('input.error').length == 0 && $('textarea.error').length == 0){
                    $('.btn').removeClass('disabled');
                }
            }
            
        }

        if($('body').hasClass('record')){
            $(window).scroll(function() {
                M.scrollLoad();
            });
        }
    }
    , bottomDistance: function() {
        var pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight);
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
        var scrollHeight = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        return pageHeight - viewportHeight - scrollHeight < 20;
    }
    , scrollLoad: function(){
        if (M.bottomDistance()) {
            if (!M.isLoadingRecord) {
                M.isLoadingRecord = true;
                M.getRecord(M.record.pagination.offset);
                console.log('load')
            }
        }
    }

    , showToast: function(str){
        if(str != ''){
            if(null == M.timerToast){
                $('.toast').html(str).show();
                M.timerToast = setTimeout(function(){
                    $('.toast').hide().html('');
                    clearTimeout(M.timerToast); 
                    M.timerToast = null;
                }, 2000)
            }
            
        }
        
    }
    , sendToBehide: function(param){
        $.ajax({
            type: "POST",
            url: M.path + "/send",
            data: param ,
            dataType: "json",
            success: function(data){
                console.log(data)
                if(data.ret == 0){
                    var expiresTime = data.expires_at*1000;
                    M.shareImg({
                        count: param.count //红包个数
                        , money: param.value //金额
                        , word: param.word //口令
                        , time: expiresTime
                    });  
                }else{
                    M.showToast('send error');
                }
            }
        });
    }
    , sendEvent: function(contract, account){
        $('.btn-send-envelution').click(function(){
            var param = {}
                , playMoney = $('.send input[name=eth]').val()
                , word = $('.send textarea').val()
                , count = $('.send input[name=number]').val()
                , gasLimit = 1
                , gasPrice = '0.0001'
                , checkParam = {}
                , btn = $(this)
                ;
            if(playMoney == '' || word == '' || count == ''){
                return;
            }
            if(word.length < 6){
                $('input[name="command"]').parent().addClass('error');
                $('input[name="command"]').addClass('hasClicked');
                M.showToast(M.lang[M.curLang]['send']['msg6'])
                return;
            }
            if(btn.hasClass('disabled')){
                return;
            }
            btn.addClass('disabled')
            checkParam = {
                value: playMoney
                , word: word
                , count: count
            }

            if(!M.isHasNetwork()){
                M.showToast(M.lang[M.curLang]['other']['noNetwork'])
                return;
            }

            // alert('send1')

            $.ajax({
                type: "POST",
                url: M.path + "/check",
                data: checkParam ,
                dataType: "json",
                success: function(data){
                    console.log(data)
                    if(data.ret == 0){
                        param = {
                            value: playMoney
                            , word: word
                            , count: count
                            , sender: account
                            , gasCount: gasLimit
                            , gasPrice: gasPrice
                        }
                        if (typeof web3 !== 'undefined') {
                            M.web3Provider = web3.currentProvider;
                            web3.eth.sendTransaction(
                                {
                                    from: M.walletAddr, 
                                    to: '0x9264f90fc14af5e2335bb4be65a617467ecd2af7'
                                    , value: web3.toWei(playMoney+'', 'ether')
                                }
                                , function(err, addr){
                                    console.log(addr)
                                    if(addr != undefined){
                                        
                                        $('.toast').html('正在生成分享图，请稍等...').show();

                                        param.guid = web3.sha3( M.walletAddr+(new Date().getTime()));
                                        param.transaction_id = addr;
                                        param.sender = M.walletAddr;

                                        M.sendToBehide(param);
                                 
                                    }
                            });
                        }
                        
                        

                       /* 
                        // console.log(web3)
                        // web3 = new Web3(M.web3Provider);
                        M.createPackage( contract, playMoney, function(r, data){
                            console.log(r);
                            console.log(data);

                            if(r == 1){

                                param.transaction_id = data.transactionHash;
                                param.guid = data.randomHash;
                                M.sendToBehide(param);
                                M.shareImg({
                                    count: count //红包个数
                                    , money: playMoney //金额
                                    , word: word //口令
                                    , time: new Date().getTime()
                                });                                
                                
                            }else if(r == 0){

                            }
                            btn.removeClass('disabled');
                        })*/
                    }else{
                        var msg = data.msg;
                        if(data.ret == 10002){
                            msg = M.lang[M.curLang]['send']['msg1'];
                        }else if(data.ret == 10003){
                            msg = M.lang[M.curLang]['send']['msg2'];
                        }
                        M.showToast(msg);
                        btn.removeClass('disabled');
                    }
                },
                error:function(e){
                    alert(e)
                }
            });            

        });

    }

    
    , initWeb3: function(callback){

        // alert('init')
        if (typeof web3 !== 'undefined') {
            M.web3Provider = web3.currentProvider;
        } else {
            // M.web3Provider = new Web3.providers.HttpProvider('http://testethapi.ksmobile.net:8545');
            M.web3Provider = new Web3.providers.HttpProvider('http://ropsten.infura.io/metamask');
        }
        web3 = new Web3(M.web3Provider);

        $.getJSON('js/RedEnvelope.json?v=5', function(data) {
           
            var randomHash = web3.sha3( M.walletAddr+(new Date().getTime()));
           
            var AdoptionArtifact = data;
            
            // alert(1)
            //ios
            M.Contract = web3.eth.contract(AdoptionArtifact.abi).at("0x45ee3442a5594fa14c072e3dce0792dec5b48006");
            // var MyContract = web3.eth.contract(AdoptionArtifact.abi).at("0xfb0b8970a3f51b6ba30993e876fc3c3dfe8f87f2");
            M.walletAddr = web3.eth.accounts[0];
            callback(M.Contract, M.walletAddr)
           


        });
            
    }
    , createPackage: function( contract, playMoney, callback ) {
        var randomHash = web3.sha3( M.walletAddr+(new Date().getTime()));
        // alert(33333333333)
        M.Contract.createPackage.sendTransaction(randomHash, {from: M.walletAddr,value:web3.toWei(playMoney+'', 'ether')}, function(r, data){
            // console.log(r);
            console.log(data);
                if(data != undefined){
                    callback(1, {
                        randomHash: randomHash
                        , transactionHash: data
                    });
                }else{
                    callback(0, {
                        randomHash: randomHash
                        , transactionHash: data
                    });
                }
                
               
        })
        // alert(M.walletAddr)
        // web3.eth.sendTransaction(
        //     {
        //         from: M.walletAddr
        //         , to: '0x9264f90fc14af5e2335bb4be65a617467ecd2af7'
        //         , value: web3.toWei(playMoney+'', 'ether')
        //         // , data: web3.toWei(playMoney+'', 'ether')
        //     }
        //     , function(err, addr){

        //         console.log(err)
        //         console.log(addr)
        //         callback(err,addr)
        // });
    }
    , sortList : function(list){
        list.sort(function(x, y){
            return (new Date(y.created_at)) - (new Date(x.created_at));
        })
        return list;

    }
    , getRecord: function(offset){
        if(offset == undefined){
            offset = 0;
        }
        var param = {
            offset: offset
            , count : 8
            , sender: M.walletAddr
        }
        // alert(M.walletAddr)

        //如果是第二次加载 
        if(offset != 0){
            $('.record-list').append('<div class="loading"><span></span></div>');
        }

        $.ajax({
            type: "get",
            url: M.path + "/list",
            data: param ,
            dataType: "json",
            success: function(data){
                console.log(data)
                if(data.ret == 0){
                    var html = [], status = '';
                    //判断首页是否显示查看记录
                    if(data.data.length > 0 && $('body').hasClass('index')){
                        $('.tip-box').addClass('show');
                        return;
                    }

                    $('.loading').remove();
                    var list = M.sortList(data.data);


                    $.each(data.data, function(i, ele){
                        if(ele.status == 13){
                            status = '过期'
                        }else if(ele.status == 12){
                            status = '已抢完'
                        }else if(ele.status == 11){
                            status = '抢红包中'
                        }else if(ele.status == 10){
                            status = '打款中'
                        }else if(ele.status == 9){
                            status = '确认失败'
                        }else if(ele.status == 0){
                            status = '无效'
                        }
                        html.push('<li>'+
                            '<a href="javascript:void(0)" url="detail.html?guid='+ ele.guid +'">'+
                            '<span class="mny">红包总金额<i class="f-r">'+ ele.value + ' ETH</i></span>'+
                            '<span class="time">'+ ele.created_at + '<i class="f-r">(包含交易费'+ ele.gasTotal.toFixed(5) +' ETH))</i></span>'+
                            '<span class="status">'+ status +'</span>'+
                            '</a>'+'</li>');
                    })
                    $('.record-list').append(html.join(''))
                    M.record = data;
                    if(data.pagination.hasMore){
                        M.isLoadingRecord = false;
                    }else{
                        M.isLoadingRecord = true;
                    }

                }else{
                }
            }
        });
    }
    
    , getDetail: function(){
        var param = {
            offset: 0
            , count : 50
            , word: M.getParameter('word')
            , guid: M.getParameter('guid')
        }
        $.ajax({
            type: "POST",
            url: M.path + "/history",
            data: param ,
            dataType: "json",
            success: function(data){
                console.log(data)
                if(data.ret == 0){
                    var html = []
                        , bestLuck = ''
                        , me = ''
                        , curVal = 0
                        , senderAddr = data.data.info.sender//发红包本人addr
                        , isSender = false//是否是发红包本人
                        , isOver = false//是否抢完
                        , isMe = false //抢红包中的人是否有我
                        , count = data.data.info.count
                        ;

                    $('.head .addr').html(M.formatAddr(senderAddr));
                    if(M.walletAddr == senderAddr){
                        isSender = true;
                    }
                    if(data.data.records.length == data.data.info.count){
                        isOver = true;
                    }
                    

                    $('.head .sub').html('“'+ data.data.info.word +'”');
                    html.push('<dt>已领取'+ data.data.records.length +'/'+ data.data.info.count +'个  共<span></span>/'+ data.data.info.total_value +'ETH</dt>');
                    
                    $.each(data.data.records, function(i, ele){
                        if(data.data.records.length != 1 && ele.best_luck) {
                            bestLuck = '<i class="icon-crown">手气最佳</i>';
                        }else{
                            bestLuck = ''
                        }
                        if(ele.receiver != M.walletAddr){
                            me = '';
                        }else{
                            me = '<i class="me">(我)</i>';
                            isMe = true;
                        }
                        if(ele.receiver == M.walletAddr){
                            if(isSender){
                                $('.head .money .big').html(data.data.info.total_value);
                            }else{
                                $('.head .money .big').html(ele.value.toFixed(4));
                            }
                        }
                        curVal += ele.value;
                        html.push('<dd>'+
                            '<img src="images/default.png ">'+
                            '<div class="info">'+
                            '<div class="addr">'+ me + M.formatAddr(ele.receiver) +'</div>'+
                            '<div class="time">'+ ele.created_at +'</div>'+
                            '</div>'+
                            '<div class="money">'+
                            '<span>'+ ele.value.toFixed(4) +' ETH</span>'+ bestLuck +
                            '</div>'+
                            '</dd>');
                    })
                    $('.list').html(html.join(''))
                    $('.list dt span').html(curVal.toFixed(4))


                    if(isSender){
                        $('.head .ttl').html('发红包详情');
                        $('.wrap').addClass('detail-sender');
                    }else{
                        $('.head .ttl').html('领取详情');
                        $('.wrap').removeClass('detail-sender');
                    }

                    //非自己发的红包，并且被别人抢完了，点击查看领取详情，头部应显示红包总额
                    if((!isSender && isOver && !isMe) || isSender){
                        $('.head .money .big').html(data.data.info.total_value);
                    }

                    if(isOver){
                        $('.btn-share').hide();
                        $('.bag-noreceive').hide();
                    }
                    if(isMe){
                        $('.head .des').show();
                    }
                    

                    $('.btn-share').click(function(){
                        M.shareImg({
                            count: count //红包个数
                            , money: data.data.info.total_value //金额
                            , word: data.data.info.word //口令
                            , time: data.expires_at*1000
                        })
                    })
                }else{
                    
                }
                
                //若无交易
                if($('.list dd').length == 0){
                    $('.list-box').addClass('list-notransation');
                    var listHeight = 0;
                    if($('dt').length>0){
                        listHeight = $('.list').height();
                    }
                    console.log(listHeight)
                    $('.no-transition').height($(window).height()-$('.head').height()-listHeight);
                    $('.no-transition').css('top', listHeight).show();
                }else{
                    $('.no-transition').hide();
                }
                
                
                
            }
        });
    }
    , formatAddr: function(addr){
        return addr.substr(0,8) + '...' + addr.substr(-8,8)

    }
    , getParameter: function(name) {  
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");  
        var r = window.location.search.substr(1).match(reg);  

        if (r != null)  
            // console.log(r[2]);
            return r[2];  
        return null;  
    }

    , initSend: function(){
        // M.curLang = 'tw';
        document.title = M.lang[M.curLang]['send']['title'];
        // console.log(document.title)
        $('.ttl').html(M.lang[M.curLang]['send']['title']);
        
        $('#iptMoney').siblings('.ipt-l').html(M.lang[M.curLang]['send']['money']);
        $('#iptMoney').parents('label').find('.ipt-tip').html(M.lang[M.curLang]['send']['countDes']);
        
        $('#iptCount').siblings('.ipt-l').html(M.lang[M.curLang]['send']['count']);
        $('#iptCount').siblings('.ipt-r').html(M.lang[M.curLang]['send']['countUnit']);
        $('#iptCount').attr('placeholder', M.lang[M.curLang]['send']['countPlh']);
        $('#iptCount').parents('label').find('.ipt-tip').html(M.lang[M.curLang]['send']['moneyDes']);
        
        $('#iptCommand').attr('placeholder', M.lang[M.curLang]['send']['commandPlh']);
        $('#iptCommand').parents('label').find('.ipt-tip').html(M.lang[M.curLang]['send']['commandDes']);
        $('.btn-send-envelution').html(M.lang[M.curLang]['send']['btn']);
        $('.after-tip').html(M.lang[M.curLang]['send']['tip']);
    }
    
    , init:function(){

        try{
            M.getWalletAddr();
        }catch(e){}


        M.curLang = M.getLang();
        if(M.curLang.indexOf('zh_CN')>-1){
            M.curLang = 'zh';
        }else if(M.curLang.indexOf('zh_TW')>-1 || M.curLang.indexOf('zh_HK')>-1 ||　M.curLang.indexOf('zh_MO')>-1){
            M.curLang = 'tw';
        }else if(M.curLang.indexOf('en')>-1){
            M.curLang = 'en';
        }

        $.getJSON('js/lang.json', function(data) {
            M.lang = data;
            // alert(M.getUserId())
            // alert(M.getEnvelopWord());
            // alert(M.walletAddr)

            M.bind();
            

            if($('body').hasClass('send')){
                // M.initWeb3(M.sendEvent);
                M.initSend();

                $.ajax({
                    type: "POST",
                    url: M.path + "/info",
                    data: {} ,
                    dataType: "json",
                    success: function(data){
                        console.log(data)
                        if(data.ret == 0){
                            var moneyMax = data.data.max//红包金额最大
                                , moneyMin = data.data.min//红包金额最小
                                , unit = data.data.unit //红包最小单位 
                                ;
                            
                            M.sendEvent();
                        }else{
                            M.showToast('info error');
                        }
                    }
                });

            }else if($('body').hasClass('record')){
                M.getRecord();
            }else if($('body').hasClass('snatch')){
                // M.getDetail();
            }else if($('body').hasClass('detail')){
                M.getDetail();
            }else if($('body').hasClass('index')){
                M.getRecord();
            }            
        })



            
        
        
       
    }

}
$(function () {

    M.init();
});
