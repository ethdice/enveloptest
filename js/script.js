var M = {
    walletAddr: ''
    , contracts: {}
    , path: 'https://blockchain.ijinshan.com/redpacket'
    , isLoadingRecord: false//是否还在请求
    , record :  null
    , timerToast: null
    , curLang: 'en'
    , lang: {}
    , iosNet: false

    , isInDapp: function(){
        return (navigator.userAgent.indexOf('inDapp')>-1);
    }
    , isInIosDapp: function(){
        return (navigator.userAgent.indexOf('inIosDapp')>-1);
    }
    , iosNetStatus: function(isReached){
        M.iosNet = isReached;
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
            return RedEnvelopeHost.getUserId();
        }else if(M.isInIosDapp()){
            return '';
        }
        return '';
    }
    , getEnvelopWord: function(){
        if(M.isInDapp()){
            return RedEnvelopeHost.getRedPacketPwd();
        }else if(M.isInIosDapp()){
            return '';
        }
        return '';

    }
    , isDownload: function(){
        if(!M.isInDapp() && !M.isInIosDapp()){
            var html = '<div class="dialog">'+
                        '<div class="title"></div>'+
                        '<div class="cnt"></div>'+
                        '<a href="https://www.cmcmbc.com/zh-cn/dapp-browser/" class="btn-ok"></a>'+
                        '<a href="javascript:void(0);" class="btn-cancel"></a></div>';

            $('body').append(html);

            $('body').on('.btn-cancel', 'click', function(){
                $('.dialog').hide();
            })
        }
    }
    , jumpUrl: function(url){
        
        if(M.isInDapp()){
            if(url.indexOf('back')>-1){
                RedEnvelopeHost.onBackToRedEnvelope();
            }else{
                if(!M.isHasNetwork()){
                    M.showToast(M.lang[M.curLang]['other']['noNetwork'])
                    return;
                }
                RedEnvelopeHost.jumpToEnvelope(url);
            }
        }else if(M.isInIosDapp()){
            if(url == 'back'){
                window.webkit.messageHandlers.sofaH5Callback.postMessage({indexName: url});
            }else{
                if(!M.isHasNetwork()){
                    M.showToast(M.lang[M.curLang]['other']['noNetwork'])
                    return;
                }
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
    , getEvelopSource: function(){
        if(M.isInDapp()){
            return RedEnvelopeHost.getRedPacketSource();
        }else if(M.isInIosDapp()) {
            return 0;
        }else{
            return 0;
        }
    }

    , iosPhoneLanguage: function(strLanguage){
        M.curLang = strLanguage;
        // alert(M.curLang);
    }
    , getLang: function(){
        if(M.isInDapp()){
            return RedEnvelopeHost.getMobileLanguage();
        }else if(M.isInIosDapp()){
            return M.curLang;
        }
        return 'zh';
    }
    //, loading: function(){
    //     //如果不是从chat进入的显示loading
    //     if(!$('body').hasClass('chat')){
    //         $('.toast').html('正在生成分享图，请稍等...').show();
    //     }
    // }
    , isHasNetwork: function(){
        if(M.isInDapp()){
            return RedEnvelopeHost.isMobileNetAvailable();
        }else if(M.isInIosDapp()){
            return M.iosNet;
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
            var btn = $(this)
                ;
            

            if(!M.isHasNetwork()){
                M.showToast(M.lang[M.curLang]['other']['noNetwork'])
                return;
            }

            if(btn.hasClass('disabled')){
                return;
            }
            btn.addClass('disabled')

            if($('textarea[name=command]').val().length < 6){
                $('#iptCommand').addClass('hasClicked error');
                M.showToast(M.lang[M.curLang]['send']['msg6']);     
            }else if($('textarea[name=command]').val() != ''){

                M.checkEnvelopStatus()
            }else{
                btn.removeClass('disabled')
            }
        })


        $('.pop-btn-open').click(function(){
            var account = M.walletAddr
                , word = $('.snatch textarea[name=command]').val()
                , btn = $(this)
                ;

            if(!M.isHasNetwork()){
                M.showToast(M.lang[M.curLang]['other']['noNetwork'])
                return;
            }

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
                            //是否从chat进入
                            if($('body').hasClass('chat')){
                                if(M.isInDapp()){
                                    RedEnvelopeHost.onBackToRedEnvelope();
                                }
                            }
                        }else if(data.ret == 10004){ //no such red packet

                            M.showToast(data.msg);

                        }else if(data.ret == 10005){//late
                            $('.pop-envelope .view-detail').attr('url', 'detail.html?word='+encodeURIComponent(word));
                            $('.pop-envelope').addClass('late').show();
                        }else if(data.ret == 10003){                            
                            M.jumpUrl('detail.html?word='+encodeURIComponent(word));
                            //是否从chat进入
                            if($('body').hasClass('chat')){
                                if(M.isInDapp()){
                                    RedEnvelopeHost.onBackToRedEnvelope();
                                }
                            }
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
                    , max = M.count
                    , str = ''
                    , isHasError = true
                    ;
                if(v == 0){
                    // str = '调皮，至少发一个，请重新填写';
                    str = '';
                // }else if((v+'').length > 3){
                    // str = '最多只能发500个红包哦'
                }else if(v > max){
                    
                    //M.count = 500; //红包最大数量 
                    str = M.lang[M.curLang]['send']['msg4']+M.count+M.lang[M.curLang]['send']['countUnit'];
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
                }else if(v > M.moneyMax){
                    str = M.lang[M.curLang]['send']['msg3']+M.moneyMax+'ETH';
                    isHasError = true;
                }else if(v.indexOf('-')>-1 || v.indexOf('+')>-1){
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

    , checkEnvelopStatus: function(){
        $('.loading').show();
        var word = $('.snatch textarea[name=command]').val()
            , btn = $('.btn')
            ;

        $.ajax({
            type: "POST",
            url: M.path + "/checkWord?word="+word+'&receiver='+M.walletAddr,
            dataType: "json",
            success: function(data){
                console.log(data)
                btn.removeClass('disabled')
                $('.loading').hide();

                //是否从chat进入
                if($('body').hasClass('chat')){
                    $('.pop-envelope .t .pop-word span').html(word);
                    if(data.ret == 0){

                    }else if(data.ret == 10004){ //no such red packet即过期
                        // $('.pop-envelope .view-detail').attr('url', 'detail.html?word='+encodeURIComponent(word));
                        $('.pop-envelope').addClass('expire').show();
                    }else if(data.ret == 10005){//late
                        $('.pop-envelope .view-detail').attr('url', 'detail.html?word='+encodeURIComponent(word));
                        $('.pop-envelope').addClass('late').show();
                    }else if(data.ret == 10003){                            
                        M.jumpUrl('detail.html?word='+encodeURIComponent(word));
                        RedEnvelopeHost.onBackToRedEnvelope();
                    }else {
                        M.showToast(data.msg)
                    }
                }else{
                    if(data.ret == 0){
                        $('.pop-envelope').show();
                        $('.pop-envelope .t  .pop-word span').html(word);
                        //$('.pop-envelope .pop-btn-open').attr('url', 'detail.html?word='+encodeURIComponent(word));

                    }else if(data.ret == 10008){ //blocked for 5 hours
                        M.showToast(M.lang[M.curLang]['snatch']['msg4']);
                    }else if(data.ret == 10004){ //no such red packet
                        M.showToast(M.lang[M.curLang]['snatch']['msg3']);
                        $('.toast').find('.errTimes').html(data.data.already_input_times)
                        $('.toast').find('.leftTimes').html(data.data.remain_times)
                    }else if(data.ret == 10005){//late
                        $('.pop-envelope .view-detail').attr('url', 'detail.html?word='+encodeURIComponent(word));
                        $('.pop-envelope').addClass('late').show();
                    }else if(data.ret == 10003){//已经抢过                            
                        M.jumpUrl('detail.html?word='+encodeURIComponent(word));
                    }else {
                        M.showToast(data.msg)
                    }

                }
                
            }
        });
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

            if(!M.isHasNetwork()){
                M.showToast(M.lang[M.curLang]['other']['noNetwork'])
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
                            // M.web3Provider = web3.currentProvider;
                            // try{
                            web3.eth.sendTransaction(
                                {
                                    from: M.walletAddr, 
                                    to: '0x9264f90fc14af5e2335bb4be65a617467ecd2af7'
                                    , value: web3.toWei(playMoney+'', 'ether')
                                }
                                , function(err, addr){
                                    console.log(addr)
                                    if(addr != undefined){
                                        
                                        if(!$('body').hasClass('chat')){
                                            $('.toast').html('正在生成分享图，请稍等...').show();
                                        }

                                        param.guid = web3.sha3( M.walletAddr+(new Date().getTime()));
                                        param.transaction_id = addr;
                                        param.sender = M.walletAddr;

                                        M.sendToBehide(param);
                                 
                                    }
                            });
                        // }catch(e){alert(e)}
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
                        if(ele.status == 13){//expire
                            status = M.lang[M.curLang]['record']['status3']
                        }else if(ele.status == 12){//已抢完
                            status = M.lang[M.curLang]['record']['status2']
                        }else if(ele.status == 11){//抢红包中
                            status = M.lang[M.curLang]['record']['status1']
                        }else if(ele.status == 10){
                            status = '打款中'
                        }else if(ele.status == 9){//确认失败
                            status = M.lang[M.curLang]['record']['status4']
                        }else if(ele.status == 0){
                            status = '无效'
                        }
                        html.push('<li>'+
                            '<a href="javascript:void(0)" url="detail.html?guid='+ ele.guid +'">'+
                            '<span class="mny">'+ M.lang[M.curLang]['record']['trstMny'] +'<i class="f-r">'+ ele.value + ' ETH</i></span>'+
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
                    html.push('<dt>'+ M.lang[M.curLang]['detail']['dt'] +'</dt>');
                    
                    $.each(data.data.records, function(i, ele){
                        if(data.data.records.length != 1 && ele.best_luck) {
                            bestLuck = '<i class="icon-crown">'+ M.lang[M.curLang]['detail']['lucky'] +'</i>';
                        }else{
                            bestLuck = ''
                        }
                        if(ele.receiver != M.walletAddr){
                            me = '';
                        }else{
                            me = '<i class="me">('+ M.lang[M.curLang]['detail']['me'] +')</i>';
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
                    $('.list dt .curMoney').html(curVal.toFixed(4))
                    $('.list dt .curCount').html(data.data.records.length)
                    $('.list dt .allCount').html(data.data.info.count)
                    $('.list dt .allMoney').html(data.data.info.total_value)
                    // html.push('<dt>已领取'+ data.data.records.length +'/'+ data.data.info.count +'个  共<span></span>/'+ data.data.info.total_value +'ETH</dt>');

                    if(isSender){
                        $('.head .ttl').html(M.lang[M.curLang]['detail']['titleSend']);
                        $('.wrap').addClass('detail-sender');
                    }else{
                        $('.head .ttl').html(M.lang[M.curLang]['detail']['title']);
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
        $('.return-box .ttl').html(M.lang[M.curLang]['send']['title']);
        
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
        var source;
        try{
            // var source = M.getEvelopSource();
        }catch(e){
            // alert(e)
        }
        //1表示单点，2表示群红包，0表示不是从chat进入的
        $('body').addClass('chat');
        if(source == 1){

        }else if(source == 2){
            $('#iptCount').val(1);
        }else if(source == 0){
            $('body').removeClass('chat');
        }else{

        }
    }

    , initIndex: function(){
        // M.curLang = 'zh';
        document.title = M.lang[M.curLang]['index']['title'];
        $('.title').html(M.lang[M.curLang]['index']['title']);
        $('.sub-des').html(M.lang[M.curLang]['index']['sub']);
        $('.btn-snatch').html(M.lang[M.curLang]['index']['btn1']);
        $('.btn-send').html(M.lang[M.curLang]['index']['btn2']);
        $('.btn-generate').text(M.lang[M.curLang]['index']['share']);
        $('.tip-try').html(M.lang[M.curLang]['index']['tryTip']);
        $('.tip-record').html(M.lang[M.curLang]['index']['recordTip']);
        $('.tip-share').html(M.lang[M.curLang]['index']['shareTip']);
        $('.method-box .ttl').html(M.lang[M.curLang]['index']['cardTitle']);
      
        $.each($('.method-box p'), function(i, ele){
            $(ele).html(M.lang[M.curLang]['index']['p'+(i+1)])
        })
    }
    , initSnatch: function(){
        // M.curLang = 'zh';
        document.title = M.lang[M.curLang]['snatch']['title'];
        $('.return-box .ttl').html(M.lang[M.curLang]['snatch']['title']);
        $('label').html(M.lang[M.curLang]['snatch']['lable']);
        $('.btn').html(M.lang[M.curLang]['snatch']['btn']);
        $('.pop-t').html(M.lang[M.curLang]['snatch']['popTtl']);
        $('.late-t').html(M.lang[M.curLang]['snatch']['late']);
        $('.expire-t').html(M.lang[M.curLang]['snatch']['expire']);
        $('.view-detail').text(M.lang[M.curLang]['snatch']['veiewDetail']);


        // alert(M.getUserId())
        var word = '';
        try{
            word = M.getEnvelopWord();
        }catch(e){
            // alert(e)
        }
        if(word != ''){
            $('#iptCommand').val(word).removeClass('error');
            $('.pop-envelope').show();
            M.checkEnvelopStatus();
            $('body').addClass('chat');
        }
    }

    , initRecord: function(){
        // M.curLang = 'zh';
        document.title = M.lang[M.curLang]['record']['title'];
        $('.return-box .ttl').html(M.lang[M.curLang]['record']['title']);
        
      
    }
    , initDetail: function(){
        document.title = M.lang[M.curLang]['detail']['title'];
        $('.return-box .ttl').html(M.lang[M.curLang]['detail']['title']);
        $('.head .des').html(M.lang[M.curLang]['detail']['des']);
        $('.bag-noreceive ').html(M.lang[M.curLang]['detail']['btm1']);
        $('.no-transition span').html(M.lang[M.curLang]['detail']['msg1']);
    }
    , init:function(){
        try{
            M.getWalletAddr();
            if(M.isInIosDapp()){
                //network
                window.webkit.messageHandlers.netStatus.postMessage({indexName:'net'});
                //lang
                window.webkit.messageHandlers.phoneLanguage.postMessage({indexName:'lan'});
            }

        }catch(e){ alert(e)}        


        if(M.isInDapp()){
            if(M.curLang.indexOf('zh_CN')>-1){
                M.curLang = 'zh';
            }else if(M.curLang.indexOf('zh_TW')>-1 || M.curLang.indexOf('zh_HK')>-1 ||　M.curLang.indexOf('zh_MO')>-1){
                M.curLang = 'tw';
            }else if(M.curLang.indexOf('en')>-1){
                M.curLang = 'en';
            }
        }
        

        $.ajax({
            url: 'js/lang.json'
            , dataType: 'json'
            , success: function(data){
                M.lang = data;
                // alert(M.walletAddr)

                if(M.curLang == '') {
                    M.curLang = M.getLang();
                }
                // alert('init:'+M.curLang)

                if(M.isInIosDapp()){
                    if(M.curLang == 'cn'){
                        M.curLang = 'zh';
                    }else if(M.curLang == 'cns'){
                        M.curLang = 'tw';
                    }else if(M.curLang.indexOf('en')>-1){
                        M.curLang = 'en';
                    }else{
                        M.curLang = 'en';//默认英文
                    }
                }
                
                // M.curLang = 'en';


                M.bind();

                if($('body').hasClass('send')){
                    // M.initWeb3(M.sendEvent);
                    $.ajax({
                        type: "POST",
                        url: M.path + "/info",
                        data: {} ,
                        dataType: "json",
                        success: function(data){
                            console.log(data)
                            if(data.ret == 0){
                                M.moneyMax = data.data.max;//红包金额最大
                                M.moneyMin = data.data.min;//红包金额最小
                                M.unit = data.data.unit; //红包最小单位 
                                M.count = 500; //红包最大数量 
                                M.initSend();
                                M.sendEvent();




                            }else{
                                M.showToast('info error');
                            }
                        }
                    });

                }else if($('body').hasClass('record')){
                    M.initRecord();
                    M.getRecord();
                }else if($('body').hasClass('snatch')){
                    M.initSnatch();
                }else if($('body').hasClass('detail')){
                    M.initDetail();
                    M.getDetail();
                }else if($('body').hasClass('index')){
                    M.initIndex();
                    M.getRecord();
                } 
            }
            , error: function(err){
                console.log(err.msg)
            }
        })
 



            
        
        
       
    }

}
$(function () {
    M.init();
});


function loading(){
    $('body').css('color', 'red')
    //如果不是从chat进入的显示loading
    if(!$('body').hasClass('chat')){
        $('.toast').html('正在生成分享图，请稍等...').show();
    }
}