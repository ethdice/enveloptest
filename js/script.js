var M = {
    walletAddr: ''
    , contracts: {}
    , path: 'https://blockchain.ijinshan.com/redpacket'
    , isLoadingRecord: false//是否还在请求
    , record :  null
    , isInDapp: function(){
        return (navigator.userAgent.indexOf('inDapp')>-1);
    }
    , isInIosDapp: function(){
        return (navigator.userAgent.indexOf('inIosDapp')>-1);
    }
    , iosWalletAddress: function(str){
        M.walletAddr = str;
        // alert(M.walletAddr)
    }
    , getWalletAddr: function(){
        // alert('getWalletAddress')
        M.walletAddr = '0xf17f52151ebef6c7334fad080c5704d77216b732';
        if(M.isInDapp()){
            M.walletAddr = RedEnvelopeHost.getWalletAddress();
        }else if(M.isInIosDapp()){
            if($('body').hasClass('index')){
                window.webkit.messageHandlers.h5Callback.postMessage({indexName:'address'});
            }else{
                window.webkit.messageHandlers.sofaWalletAddress.postMessage({indexName:'address'});
            }
        }
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
        if(M.isInDapp()){
            if(obj != ''){
                alert('shareImg'+ JSON.stringify(obj))
                RedEnvelopeHost.createEnvelopeShare(JSON.stringify(obj));
            }else{
                RedEnvelopeHost.createEnvelopeShare('');
            }
            
        }else if(M.isInIosDapp()){
            if(obj != ''){
                alert('ios share')
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
                , word = $('.snatch input[name=command]').val()
                , btn = $(this)
                ;
            if(btn.hasClass('disabled')){
                return;
            }
            btn.addClass('disabled')

            if($('input[name=command]').val() != ''){
                $.ajax({
                    type: "POST",
                    url: M.path + "/snatch?word="+word+'&receiver='+account,
                    dataType: "json",
                    success: function(data){
                        console.log(data)
                        btn.removeClass('disabled')
                        if(data.ret == 0){
                            console.log('success')
                            $('.pop-envelope').show();
                            $('.pop-envelope .t span').html(word);
                            $('.pop-envelope .pop-btn-open').attr('url', 'detail.html?word='+encodeURIComponent(word));

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

                    }
                });
            }else{
                btn.removeClass('disabled')

            }
        })


        $('.pop-btn-open, .view-detail').click(function(){
            M.jumpUrl($(this).attr('url'));
        })

        $('body').on('click', '.record-list a', function(){
            M.jumpUrl($(this).attr('url'));
        })
        

        $('.pop-close').click(function(){
            // alert('generate image');
            $('.pop-envelope').removeClass('late').hide();

        })
        if($('#iptMoney').length > 0){
            // 1-500
            document.getElementById('iptCount').addEventListener('input', function(e){
                var v = e.target.value
                    , max = 500
                    , str = ''
                    , isHasError = true
                    ;
                console.log(v)
                if(v == 0){
                    // str = '调皮，至少发一个，请重新填写';
                    str = '';
                // }else if((v+'').length > 3){
                    // $(this).val((v+'').substr(0, 3))
                    // str = '最多只能发500个红包哦'
                }else if(v > max){
                    str = '最多只能发500个红包哦'
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
                    v = '0.000';
                    isHasError = true;
                }else if(v > 1000){
                    str = '土豪，最多只能发1000eth哦，请重新填写';
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
                    str = '最长输入20个字符'
                    isHasError = true;
                }else if($(this).val().length < 6){
                    isHasError = true;
                    str = '最少输入6个字符'
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
                if(str != ''){
                    input.parent().addClass('error');
                }
            }else{
                input.removeClass('error');
                input.parent().removeClass('error');
            }

        }

        function isClick(isAdd){
            if(isAdd) {
                $('.btn').addClass('disabled');
            }else{
                if($('input.error').length == 0){
                    $('.btn').removeClass('disabled');
                }
            }
            
        }

        if($('body').hasClass('record')){
            $(document).on('scroll', function() {
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
            $('.toast').html(str).show();
            setTimeout(function(){
                $('.toast').hide().html('');
            }, 2000)
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
                    console.log('success')
                }else{
                    
                }
            }
        });
    }
    , sendEvent: function(contract, account){

        $('.btn-send-envelution').click(function(){
            var param = {}
                , playMoney = $('.send input[name=eth]').val()
                , word = $('.send input[name=command]').val()
                , count = $('.send input[name=number]').val()
                , gasLimit = 1
                , gasPrice = '0.0001'
                , checkParam = {}
                , btn = $(this)
                ;
            if(playMoney == '' || word == '' || count == ''){
                return;
            }
            // if(word.length < 6){
            //     $('input[name="word"]').parent().addClass('error');
            // }
            if(btn.hasClass('disabled')){
                return;
            }
            btn.addClass('disabled')
            checkParam = {
                value: playMoney
                , word: word
                , count: count
            }
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
                        web3.eth.sendTransaction(
                            {
                                // from: M.walletAddr
                                to: '0x9264f90fc14af5e2335bb4be65a617467ecd2af7'
                                , value: web3.toWei(playMoney+'', 'ether')
                            }
                            , function(err, addr){

                                console.log(err)
                                console.log(addr)
                                // param.transaction_id = data.transactionHash;
                                // param.guid = data.randomHash;
                                M.sendToBehide(param);
                                console.log(count)
                                M.shareImg({
                                    count: count //红包个数
                                    , money: playMoney //金额
                                    , word: word //口令
                                    , time: new Date().getTime()
                                });
                        });

                        /*M.createPackage( contract, playMoney, function(r, data){
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
                        M.showToast(data.msg);
                        btn.removeClass('disabled');
                    }
                }
            });            

        });

    }

    
    , initWeb3: function(callback){

        // callback({}, M.walletAddr)

        /*if (typeof web3 !== 'undefined') {
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
           


        });*/
            
    }
    , createPackage: function( contract, playMoney, callback ) {
        /*var randomHash = web3.sha3( M.walletAddr+(new Date().getTime()));
       
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
                
               
        })*/
        alert(M.walletAddr)
        web3.eth.sendTransaction(
            {
                from: M.walletAddr
                , to: '0x9264f90fc14af5e2335bb4be65a617467ecd2af7'
                , value: web3.toWei(playMoney+'', 'ether')
                // , data: web3.toWei(playMoney+'', 'ether')
            }
            , function(err, addr){

                console.log(err)
                console.log(addr)
                callback(err,addr)
        });
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
            , count : 20
            , sender: M.walletAddr
        }
        // alert(M.walletAddr)
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
                            '<span class="time">'+ ele.created_at + '<i class="f-r">(包含交易费0.698 ETH))</i></span>'+
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
                    // M.sendToBehide(param);
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
                        , senderAddr = ''//发红包本人addr
                        , isSender = false//是否是发红包本人
                        , isOver = false//是否抢完
                        , isMe = false
                        ;

                    $('.head .addr').html(M.formatAddr(senderAddr));
                    $('.head .addr').html(M.formatAddr(M.walletAddr));
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
                        $('.wrap').addClass('detail-sender');
                        $('.head .ttl').html('发红包详情');
                    }

                    //非自己发的红包，并且被别人抢完了，点击查看领取详情，头部应显示红包总额
                    if(!isSender && isOver && !isMe){
                        $('.head .money .big').html(data.data.info.total_value);
                    }

                    if(isOver){
                        $('.btn-share').hide();
                        $('.bag-noreceive').hide();
                    }




                    $('.btn-share').click(function(){
                        M.shareImg({
                            count: param.count //红包个数
                            , money: data.data.info.total_value //金额
                            , word: data.data.info.word //口令
                            , time: new Date(data.expires_at*1000).getTime()
                        })
                    })
        
                    

                }else{
                    
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
    
    , init:function(){
        
        this.bind();
        try{
            this.getWalletAddr();
        }catch(e){}

        if($('body').hasClass('send')){
            // this.initWeb3(this.sendEvent);
            this.sendEvent();
        }else if($('body').hasClass('record')){
            this.getRecord();
        }else if($('body').hasClass('snatch')){
            // this.getDetail();
        }else if($('body').hasClass('detail')){
            this.getDetail();
            
        }else if($('body').hasClass('index')){
            this.getRecord();
        }
       
    }

}
$(function () { 
    M.init();
});
