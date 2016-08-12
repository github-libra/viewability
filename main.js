(function(view, $) {

    var $window = $(window);
    var $body = $('body');
    var viewType;
    var serviceCollectionCache = {};
    var serviceType = [
        // 优蓝信息
        { 'serviceNum': 1002, name: '优蓝信息', 'selector': '.youlan-tag' },
        // 唯我独尊
        { 'serviceNum': 82, name: '唯我独尊', 'selector': '.tag-vipding' },
        // 至尊展位
        { 'serviceNum': 33, name: '至尊展位', 'selector': '.tag-ace' },
        // 推荐展位
        { 'serviceNum': 81, name: '推荐展位', 'selector': '.tag-rec' },
        // 十万火急
        { 'serviceNum': 28, name: '十万火急', 'selector': '.tag-huoji' },
        // 置顶
        { 'serviceNum': 5, name: '置顶', 'selector': '.tag-ding' },
        // VIP主推（VIP主推的选择器逻辑要单独处理）
        { 'serviceNum': 1001, name: 'IP主推', 'selector': '.tag-vip' },
        // none
        { 'serviceNum': 0, name: '普通', 'selector': 'div' }
    ];

    if ($body.hasClass('view-item')) {
        viewType = 'item';
    } else if ($body.hasClass('view-table')) {
        viewType = 'table';
    } else {
        viewType = null;
    }

    function getServiceName(serviceId) {
        var name = "";
        for (var i = serviceType.length - 1; i >= 0; i--) {
            if (serviceType[i]['serviceNum'] === serviceId) {
                name = serviceType[i]['name'];
            }
        }
        return name;
    }


    // handle every ad element, extract info like:
    // 1. id
    // 2. type: vip/ding/normal, etc
    // 3. rank
    // 4. time
    function extractInfo(ele) {
        console.log(ele);
        var $ele = $(ele);
        var payType;
        var rank;
        var payRank;
        var serviceNum, selector;

        // 如果是 view-item与table-item视图
        if (viewType === 'item' || viewType === 'table') {
            var containerSelector = (viewType === 'item') ? '.list-ad-items' : '.table-view';
            // 获取元素的付费类型
            for (var i = 0; i < serviceType.length; i++) {
                var serviceNum = serviceType[i]['serviceNum'];
                var selector = serviceType[i]['selector'];

                // 直接find付费服务的tag的选择器样式
                if ($ele.find(selector).length <= 0) continue;

                // not vip
                if (serviceNum !== 1001) {
                    payType = serviceNum;
                    rank = $ele.index(containerSelector + " li[data-aid]");

                    if (serviceNum === 0) {
                        break;
                    }

                    if (!serviceCollectionCache[serviceNum]) {
                        serviceCollectionCache[serviceNum] = $(containerSelector + " li[data-aid]").has(selector);
                    }
                    payRank = serviceCollectionCache[serviceNum].index($ele);

                    break;

                    // is vip
                } else if ($ele.hasClass('item-pinned')) {
                    // 有V标志，必须在ad元素上有item-pinned class 真正的vip主推信息
                    payType = serviceNum;
                    rank = $ele.index(containerSelector + " li[data-aid]");

                    if (!serviceCollectionCache[serviceNum]) {
                        serviceCollectionCache[serviceNum] = $(containerSelector + " li[data-aid].item-pinned").has(selector);
                    }
                    payRank = serviceCollectionCache[serviceNum].index($ele);

                    break;
                }
            }
        }

        if (!payType) payType = 0; // 如果没有payType，则不work

        // 处理rank
        if ($.isNumeric(rank) && rank >= 0) rank++;
        if ($.isNumeric(payRank) && payRank >= 0) payRank++;

        const data = {
            'ad_id': $ele.data('aid'),
            'city': window.city,
            'category_name_en': window.category,
            'url': window.location.href,
            'platform': 'web',
            'view_type': viewType,
            'p_type': getServiceName(payType), // 付费服务的类型
            'p_type_id': payType, // 付费服务的类型
            'rank': rank, // 处于listing页面的第几个位置（waterfall页面计算不出此项）
            'p_rank': payRank, // 处于listing页面此付费服务第几个位置（waterfall页面计算不出此项）
            'time': +new Date()
                // 'user_id': '', // poster发布帖子上对应的user_id（此项在后端用aid拿到）
                // 'track_id': '',
                // 'listing_visit_id': '', // 用户的访问的唯一id（此项在后端生成）
        };

        console.log(data);

    }

    var containerSelector = (viewType === 'item') ? '.list-ad-items' : '.table-view';

    view.setSelectors([containerSelector + ' li[data-aid]'])
    view.setHandler(extractInfo);
    view.init();

})(view, jQuery);
