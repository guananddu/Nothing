(function() {
    // 当前taskid
    // var globaltaskid;
	var videoIdMap = {}, pushedId = [];
    var jsonParse  = function (data) {
        // Make sure the incoming data is actual JSON
        // Logic borrowed from http://json.org/json2.js
        if (!/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
            .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {
            return null;
        }
        //优先使用原生的parse
        return window.JSON && window.JSON.parse ?
            window.JSON.parse( data ) :
            (new Function("return " + data))();
    };
	var jsonStringify = (function () {
	    /**
	     * 字符串处理时需要转义的字符表
	     * @private
	     */
	    var escapeMap = {
	        "\b": '\\b',
	        "\t": '\\t',
	        "\n": '\\n',
	        "\f": '\\f',
	        "\r": '\\r',
	        '"' : '\\"',
	        "\\": '\\\\'
	    };
	    
	    /**
	     * 字符串序列化
	     * @private
	     */
	    function encodeString(source) {
	        if (/["\\\x00-\x1f]/.test(source)) {
	            source = source.replace(
	                /["\\\x00-\x1f]/g, 
	                function (match) {
	                    var c = escapeMap[match];
	                    if (c) {
	                        return c;
	                    }
	                    c = match.charCodeAt();
	                    return "\\u00" 
	                            + Math.floor(c / 16).toString(16) 
	                            + (c % 16).toString(16);
	                });
	        }
	        return '"' + source + '"';
	    }
	    
	    /**
	     * 数组序列化
	     * @private
	     */
	    function encodeArray(source) {
	        var result = ["["], 
	            l = source.length,
	            preComma, i, item;
	            
	        for (i = 0; i < l; i++) {
	            item = source[i];
	            
	            switch (typeof item) {
	            case "undefined":
	            case "function":
	            case "unknown":
	                break;
	            default:
	                if(preComma) {
	                    result.push(',');
	                }
	                result.push(jsonStringify(item));
	                preComma = 1;
	            }
	        }
	        result.push("]");
	        return result.join("");
	    }
	    
	    /**
	     * 处理日期序列化时的补零
	     * @private
	     */
	    function pad(source) {
	        return source < 10 ? '0' + source : source;
	    }
	    
	    /**
	     * 日期序列化
	     * @private
	     */
	    function encodeDate(source){
	        return '"' + source.getFullYear() + "-" 
	                + pad(source.getMonth() + 1) + "-" 
	                + pad(source.getDate()) + "T" 
	                + pad(source.getHours()) + ":" 
	                + pad(source.getMinutes()) + ":" 
	                + pad(source.getSeconds()) + '"';
	    }
	    
	    return function (value) {
	        switch (typeof value) {
	        case 'undefined':
	            return 'undefined';
	            
	        case 'number':
	            return isFinite(value) ? String(value) : "null";
	            
	        case 'string':
	            return encodeString(value);
	            
	        case 'boolean':
	            return String(value);
	            
	        default:
	            if (value === null) {
	                return 'null';
	            } else if (value instanceof Array) {
	                return encodeArray(value);
	            } else if (value instanceof Date) {
	                return encodeDate(value);
	            } else {
	                var result = ['{'],
	                    encode = jsonStringify,
	                    preComma,
	                    item;
	                    
	                for (var key in value) {
	                    if (Object.prototype.hasOwnProperty.call(value, key)) {
	                        item = value[key];
	                        switch (typeof item) {
	                        case 'undefined':
	                        case 'unknown':
	                        case 'function':
	                            break;
	                        default:
	                            if (preComma) {
	                                result.push(',');
	                            }
	                            preComma = 1;
	                            result.push(encode(key) + ':' + encode(item));
	                        }
	                    }
	                }
	                result.push('}');
	                return result.join('');
	            }
	        }
	    };
	})();
    var globalSuper    = false;
    var globalUserName = '';
    var globalUserId   = '';
    var globalUsertoken = '';
	var tablecloth    = {
        // 父元素（可以是id或Dom元素，必须）
        container: 'table-container',
        // 设置主表格的id和class（即table元素的id或class，两者都可选）
        id: 'my-table-id',
        className: 'my-table-class',

        // 设置表头的id或者class（可选）
        header: {
            id: 'my-table-header-id',
            className: 'my-table-header-class'
        },

        // 设置表足的id或者class（可选）
        footer: {
            id: 'my-table-footer-id',
            className: 'my-table-footer-class'
        },

        // 设置表身（tbody元素）的id或者class（可选）
        body: {
            id: 'my-table-body-id',
            className: 'my-table-body-class'
        },

        // 设置子表格中每一个tr的class（可选，通过它可以为子表格添加一些特殊样式）
        subTableTrClass: 'my-sub-table-tr-class',

        // 主表格中的tr hover时切换的类（可选，通过它可以设置主表格被hover时的样式）
        tableTrHover: 'my-table-body-hover-class',

        // 子表格hover的颜色（可选，子表格hover时候的颜色设置）
        subTableTrColor: {
            hover: '#E4EAF9',
            out: '#E7ECEE'
        }
    };
    var ListsConf     = {
        // 设置表头具体格式
        hFormat: [
        	'<input type="checkbox" _stabletarget_="checkall" />',
            '视频ID', 
            '任务ID',
            '缩略图',
            'URL',
            '名称', 
            '描述', 
            '作者',
            '创建时间',
            '访问量',
            '状态',
            '关键词',
            // '时间',
            '播放时长',
            '喜欢',
            '不喜欢'    
        ],

        hFormatMore : [
            {},{},{},{},{},{},{},{},{},{},{},{width:'15%'}
        ],

        // 表身格式
        bFormat: [
        	function(dataItem, i, j, tr, td) {
        		var checked = (videoIdMap[dataItem.videoid] != undefined);
        		// checkbox
                return dataItem.status == 1 
                	? '<input ' + (checked ? 'checked="checked"' : '') + ' _stabletarget_="videoid" videoid="' + dataItem.videoid + '" type="checkbox" />' 
                	: '';
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.videoid;
            }, 
            function(dataItem, i, j, tr, td) {
                return dataItem.taskid;
            },
            function(dataItem, i, j, tr, td) {
                return '<img src="' + dataItem.thumbnail + '" class="thumbnail" />';
            },
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.url;
            	var show  = cutString(dataItem.url, 20, true);
                return '<span title="' + title + '">' + show + '</span>';
            },
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.title;
            	var show  = cutString(dataItem.title, 100, true);
                return '<span title="' + title + '">' + show + '</span>';
            }, 
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.describetext;
            	var show  = cutString(dataItem.describetext, 250, true);
                return '<span title="' + title + '">' + show + '</span>';
            }, 
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.author;
            	var show  = cutString(dataItem.author, 20, true);
                return '<span title="' + title + '">' + show + '</span>';
            }, 
            function(dataItem, i, j, tr, td) {
                return dataItem.createtime;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.visit;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.status;
            },
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.keywords;
            	var show  = cutString(dataItem.keywords, 40, true);
                return '<span title="' + title + '">' + show + '</span>';
            },
            // function(dataItem, i, j, tr, td) {
            //     return dataItem.time;
            // },
            function(dataItem, i, j, tr, td) {
                return dataItem.playtime;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.like;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.dislike;
            }
        ]
    };
    var TasksConf     = {
        // 设置表头具体格式
        hFormat: [
            '任务ID', 
            '任务名',
            '状态', 
            '添加时间',
            '结果',
            '关键词', 
            '最大长度',
            '最小长度',
            '页数',
            '字幕',
            '高清',
            '操作'
        ],

        hFormatMore : [],

        // 表身格式
        bFormat: [
            function(dataItem, i, j, tr, td) {
                return '<a href="javascript:void(0);" _stabletarget_="getlist" taskid="' + dataItem.id + '">' + dataItem.id + '</a>';
            },
            function(dataItem, i, j, tr, td) {
                return encodeHTML(dataItem.name);
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.status;
            }, 
            // 添加时间
            function(dataItem, i, j, tr, td) {
                return dataItem.addTime;
            }, 
            // 结果
            function(dataItem, i, j, tr, td) {
                return dataItem.result;
            }, 
            function(dataItem, i, j, tr, td) {
                return dataItem.keywords;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.maxlength;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.minlength;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.pagenum;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.iscc;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.ishd;
            },
            // 操作
            function(dataItem, i, j, tr, td) {
                td.style.textAlign = 'center';
                return (dataItem.status == '视频下载完成' || dataItem.status == '刚提交') 
                    ? ('<strong title="删除" class="deltask" _stabletarget_="deltask" taskid="' + dataItem.id + '">X</strong>') : '';
            }
        ]
    };
    var AcctsConf = {
        // 设置表头具体格式
        hFormat: [
            '用户ID', 
            '用户名',
            '权限',
            '操作'
        ],

        hFormatMore : [],

        // 表身格式
        bFormat: [
            function(dataItem, i, j, tr, td) {
                return dataItem.id;
            },
            function(dataItem, i, j, tr, td) {
                return encodeHTML(dataItem.username);
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.role == 0 ? '管理员' : '普通用户';
            },
            // 操作
            function(dataItem, i, j, tr, td) {
                td.style.textAlign = 'center';
                return dataItem.role != 0 && dataItem.id != globalUserId
                    ? ('<strong title="删除此用户" class="deltask" _stabletarget_="deluser" userid="' + dataItem.id + '">X</strong>') 
                    : '';
            }
        ]
    };
    var Liststabler   = function() {
        var _preOpt = tablecloth;
        // 生成构造函数
        var myTableConstructor = sTable(_preOpt);
        // 表格初始化
        // var meTable = new myTableConstructor(_conOpt);
        var meTable = new myTableConstructor({});
        // 绑定事件
        meTable.on('click', 'videoid', videoIdClick);
        meTable.on('click', 'checkall', function() {
            var checked = this.checked;
            meTable.getStableTargetEles('videoid', function(item, inx, arr) {
                // !item.checked && (allChecked = false);
                item.checked = checked;
                videoIdClick.call(item);
            });
        });
        // 暴露接口
        return meTable;
    }();
    var Taskstabler   = function() {
        var _preOpt = tablecloth;
        // 生成构造函数
        var myTableConstructor = sTable(_preOpt);
        // 表格初始化
        var meTable = new myTableConstructor({});
        // 绑定事件
        meTable.on('click', 'getlist', taskIdClick);
        meTable.on('click', 'deltask', delTask);
        // 暴露接口
        return meTable;
    }();
    var Acctstabler = function() {
        var _preOpt = tablecloth;
        // 生成构造函数
        var myTableConstructor = sTable(_preOpt);
        // 表格初始化
        var meTable = new myTableConstructor({});
        // 绑定事件
        meTable.on('click', 'deluser', userIdClick);
        // 暴露接口
        return meTable;
    }();
    // 蛋疼
    var buttonAction = {
        showMore: function() {
            $('#still-submit-container')[0]
                .className = 'still-submit-container-show';
            $('#submit-container')[0]
                .className = 'submit-container-hide';
        },
        hideMore: function() {
            $('#still-submit-container')[0]
                .className = 'still-submit-container';
            $('#submit-container')[0]
                .className = 'submit-container';
        }
    };
	var render = function() {
		var listsData, tasksData;
		var listsUrl = '/crawler/getList', 
			tasksUrl = '/crawler/getTasks',
            acctsUrl = '/crawler/userList';
		var perPageNum = 100;
		return {
			Lists: function(page, taskid) {
				if(page == undefined) {
					listsData = [];
                    var listsInfo;
                    var url   = taskid == undefined ? listsUrl : (listsUrl + '?id=' + taskid);
					// console.log(url);
                    $.get(url, function(o) {
                        o = jsonParse(o);
						if(o.status == 200) {
							listsData = o.data;
                            listsInfo = o.errorCode;
							var totalPage = Math.ceil(listsData.length / perPageNum);
                            pager.setTotal(totalPage);
                            Liststabler
                                .setHeaderFormat(ListsConf.hFormat)
                                .setBodyFormat(ListsConf.bFormat)
                                .setData(listsData.slice(0, perPageNum))
                                .render(true);
                            // 显示信息
                            if(taskid) {
                                $('#info-id').html(taskid);
                                $('#info-word').html(encodeHTML(listsInfo.message));
                                $('#info-total').html(listsInfo.code);
                                $('#listInfo').show();
                            }
                            // 为空提示
                            listsData.length == 0
                                && showTips('数据暂时为空！');
						}
                        if(o.status != 200) {
                            alert('操作失败，您所属的用户没有权限！');
                            return;
                        }
					});
					
					// 测试数据
					// for(var i = 0, len = 10; i < len; i ++) {
					// 	listsData.push({
					// 		videoid: i,
     //                        taskid: i,
     //                        url: 'urlurl....url....url..啊飒飒',
					// 		title: '名字名字名字名字',
					// 		describetext: '描述描述描描述描描述描述',
					// 		author: '坐着坐着坐着坐着',
					// 		createtime: '2013/03/02 10:0000',
     //                        keywords: '关键词关键词关键词关键词关键关键词',
     //                        timetext: '萨达萨达',
					// 		visit: '1234',
					// 		like: '676',
     //                        dislike: '123123',
					// 		status: 2 * Math.random() | 0,
					// 		playtime: '123',
					// 		playlength: '12:00',
					// 		quality: '66',
					// 		thumbnail: 'http://www.baidu.com/img/baidu_jgylogo3.gif',
     //                        // 增加了 addTime 字段，前端暂不处理
     //                        addTime: '2013-04-02 xxxxxxxxxx'
					// 	});
					// }
     //                // 检索信息
     //                listsInfo = {
     //                    code: 15,
     //                    message: '我是检索词'
     //                };
					// var totalPage = Math.ceil(listsData.length / perPageNum);
					// pager.setTotal(totalPage);
					// Liststabler
					// 	.setHeaderFormat(ListsConf.hFormat)
					// 	.setBodyFormat(ListsConf.bFormat)
					// 	.setData(listsData.slice(0, perPageNum))
					// 	.render(true);
     //                // 显示信息
     //                if(taskid) {
     //                    $('#info-id').html(taskid);
     //                    $('#info-word').html(encodeHTML(listsInfo.message));
     //                    $('#info-total').html(listsInfo.code);
     //                    $('#listInfo').show();
     //                }
     //                // 为空提示
     //                listsData.length == 0
     //                    && showTips('数据暂时为空！');
                    /////////////////////////////////////////////////////
				}
				else {
					Liststabler
						.setHeaderFormat(ListsConf.hFormat)
						.setBodyFormat(ListsConf.bFormat)
						.setData(listsData.slice((page - 1) * perPageNum, page * perPageNum))
						.render(true);
				}
			},
			Tasks: function(page, data, nochange) {
				if(page == undefined) {
					tasksData = [];
                    if(data != undefined) {
                        tasksData = data;
                        var totalPage = Math.ceil(tasksData.length / perPageNum);
                        pager.setTotal(totalPage);
                        Taskstabler
                            .setHeaderFormat(TasksConf.hFormat)
                            .setBodyFormat(TasksConf.bFormat)
                            .setData(tasksData.slice(0, perPageNum))
                            .render(true);
                        // 显示按钮
                        !nochange && buttonAction.showMore();
                    }
                    else {
                        $.get(tasksUrl, function(o) {
                            o = jsonParse(o);
                            if(o.status == 200) {
                                tasksData = o.data;
                                var totalPage = Math.ceil(tasksData.length / perPageNum);
                                pager.setTotal(totalPage);
                                Taskstabler
                                    .setHeaderFormat(TasksConf.hFormat)
                                    .setBodyFormat(TasksConf.bFormat)
                                    .setData(tasksData.slice(0, perPageNum))
                                    .render(true);
                                // 为空提示
                                tasksData.length == 0
                                    && showTips('数据暂时为空！');
                            }
                            if(o.status != 200) {
                                alert('操作失败，您所属的用户没有权限！');
                                return;
                            }
                        });
                        // 测试数据
                        // for(var i = 0, len = 35; i < len; i ++) {
                        //     tasksData.push({
                        //         id: i,
                        //         status: '视频下载完成',
                        //         filepath: 'c:/asd/asd/sad/sadsa/ddsa/',
                        //         starttime: '2013/03/02 10:0000',
                        //         endtime: '2013/03/02 10:0000',
                        //         filenum: '1234',
                        //         maxlength: '676',
                        //         minlength: 2 * Math.random() | 0,
                        //         pagenum: '123',
                        //         keywords: '检索词？？',
                        //         iscc: '66',
                        //         ishd: 'asd',
                        //         name: '我是任务名<span></span>！',
                        //         // 新增字段
                        //         addTime: '2013-04-02 xxxxxxxxxx',
                        //         result: '抓取结果'
                        //     });
                        // }
                        // var totalPage = Math.ceil(tasksData.length / perPageNum);
                        // pager.setTotal(totalPage);
                        // Taskstabler
                        //     .setHeaderFormat(TasksConf.hFormat)
                        //     .setBodyFormat(TasksConf.bFormat)
                        //     .setData(tasksData.slice(0, perPageNum))
                        //     .render(true);
                        // // 为空提示
                        // tasksData.length == 0
                        //     && showTips('数据暂时为空！');
                        /////////////////////////////////////////////
                    }
				}
				else {
					Taskstabler
						.setHeaderFormat(TasksConf.hFormat)
						.setBodyFormat(TasksConf.bFormat)
						.setData(tasksData.slice((page - 1) * perPageNum, page * perPageNum))
						.render(true);
				}
			},
            Accts: function() {
                $.get(acctsUrl, function(o) {
                    o = jsonParse(o);
                    if(o.status == 200) {
                        var totalPage = 0;
                        pager.setTotal(totalPage);
                        Acctstabler
                            .setHeaderFormat(AcctsConf.hFormat)
                            .setBodyFormat(AcctsConf.bFormat)
                            .setData(o.data)
                            .render(true);
                        // 为空提示
                        o.data.length == 0
                            && showTips('数据暂时为空！');
                    }
                    if(o.status != 200) {
                        alert('操作失败，您所属的用户没有权限！');
                        return;
                    }
                });
                // 测试数据
                // var data = [];
                // for(var i = 1, len = 15; i < len; i ++) {
                //     data.push({
                //         id: i,
                //         username: '用户名<span>asad!@#$',
                //         role: (Math.random() >= 0.5 ? 1 : 0)
                //     });
                // }
                // var totalPage = 0;
                // pager.setTotal(totalPage);
                // Acctstabler
                //     .setHeaderFormat(AcctsConf.hFormat)
                //     .setBodyFormat(AcctsConf.bFormat)
                //     .setData(data)
                //     .render(true);
                //////////////////////////////////////////
            }
		};
	}();
    var pager = function() {
        var target = $('#pager');
        var pagerF = 'Lists';
        var _pager = PagerConstructor(
            target,
            1,
            1,
            function(page) {
                // 分页在这里
                render[pagerF](page);
            }
        );
        _pager.render();
        // 需要暴露几个方法
        return {
            setTotal: function(total) {
                _pager.setTotal(total);
            },
            set: function(page) {
                _pager.set(page);
            },
            get: function() {
                return _pager.get();
            },
            setF: function(F) {
            	pagerF = F;
            },
            hide: function() {
                target.hide();
            },
            show: function() {
                target.show();
            }
        };
    }();
	var go = (function() {
		// var state = 'Lists';
        var state = 'Tasks';
		var idsubmitcontainer = $('#idsubmit-container');
		return {
			Lists: function(taskId) {
                $('#listInfo').hide();
                // globaltaskid = taskId;
				state = 'Lists';
				pager.setF(state);
				videoIdMap = {}, pushedId = [];
                var page = undefined;
				render[state](page, taskId);
				idsubmitcontainer[0].className 
					= 'idsubmit-container';
                $('#AddUserTarget').hide();
                pager.show();
                buttonAction.hideMore();
			},
			Tasks: function(data, nochange) {
                buttonAction.hideMore();
				state = 'Tasks';
				pager.setF(state);
				render[state](undefined, data, nochange);
				idsubmitcontainer[0].className 
					= 'idsubmit-container-none';
                $('#AddUserTarget').hide();
                pager.show();
                $('#listInfo').hide();
			},
            Accts: function() {
                state = 'Accts';
                // pager.setF(state);
                render[state]();
                idsubmitcontainer[0].className 
                    = 'idsubmit-container-none';
                $('#AddUserTarget').show();
                pager.hide();
                $('#listInfo').hide();
                buttonAction.hideMore();
            },
			Auto: function() {
                $('#listInfo').hide();
                buttonAction.hideMore();
				// goauto
				go[state]();
			},
            getState: function() {
                return state;
            }
		};
	})();
	var mainer  = (function() {
		var logincontent = $('#login-content');
		var authedcontent = $('#authed-content');
		var Lists = $('#Lists');
		var Tasks = $('#Tasks');
        var Accts = $('#Accts');
		Lists.click(function() {
			if(this.className == 'current')
				return;
			this.className     = 'current';
			Tasks[0].className = '';
            Accts[0].className = '';
			go.Lists();
		});
		Tasks.click(function() {
			if(this.className == 'current')
				return;
			this.className     = 'current';
			Lists[0].className = '';
            Accts[0].className = '';
			go.Tasks();
		});
        Accts.click(function() {
            if(!globalSuper) {
                alert('您无权限进行此操作！');
                return;
            }
            if(this.className == 'current')
                return;
            this.className     = 'current';
            Lists[0].className = '';
            Tasks[0].className = '';
            go.Accts();
        });
		var submit = $('#submit');
		submit.click(function() {
            var reg = /^\s*$/;
            if(reg.test($('#name').val())
                || reg.test($('#maxlength').val())
                || reg.test($('#minlength').val())
                || reg.test($('#pagenum').val())
                || reg.test($('#query').val())
                // || reg.test($('#iscc').val())
                // || reg.test($('#ishd').val())) {
                ) {
                    alert('每个参数都不能为空！');
                    return;
            }

            // 先请求pre
            $.post(
                '/crawler/preTasks',
                'params=' + jsonStringify({
                    str: $('#query').val()
                }),
                function(data) {
                    data = jsonParse(data);
                    if(data.status != 200) {
                        alert('操作失败，您所属的用户没有权限！');
                        return;
                    }
                    if(data.status == 200) {
                        // 为空
                        if(data.errorCode.code == 0
                            || data.data.length == 0) {
                            showTips('此检索词下暂无任务，将为此检索词添加新任务！');
                            submitTask();
                            // return
                            return;
                        }
                        // 已有任务
                        showTips('此检索词下已有相关任务，见下方列表。');
                        // render.Tasks(undefined, data.data);
                        var Lists = $('#Lists');
                        var Tasks = $('#Tasks');
                        var Accts = $('#Accts');
                        Lists[0].className = '';
                        Tasks[0].className = 'current';
                        Accts[0].className = '';
                        go.Tasks(data.data);
                    }
                }
            );

            // 测试数据
            // (function(data) {
            //     if(data.status == 200) {
            //         // 为空
            //         if(data.errorCode.code == 0
            //             || data.data.length == 0) {
            //             showTips('此检索词下暂无任务，将为此检索词添加新任务！');
            //             submitTask();
            //             // return
            //             return;
            //         }
            //         // 已有任务
            //         showTips('此检索词下已有相关任务，见下方列表。');
            //         // render.Tasks(undefined, data.data);
            //         var Lists = $('#Lists');
            //         var Tasks = $('#Tasks');
            //         var Accts = $('#Accts');
            //         Lists[0].className = '';
            //         Tasks[0].className = 'current';
            //         Accts[0].className = '';
            //         go.Tasks(data.data);
            //     }
            // })({
            //     status: 200,
            //     errorCode: {
            //         code: 120
            //     },
            //     data: [
            //         {
            //             id: 3,
            //             status: '视频下载完成',
            //             filepath: 'c:/asd/asd/sad/sadsa/ddsa/',
            //             starttime: '2013/03/02 10:0000',
            //             endtime: '2013/03/02 10:0000',
            //             filenum: '1234',
            //             maxlength: '676',
            //             minlength: 2 * Math.random() | 0,
            //             pagenum: '123',
            //             keywords: '检索词？？',
            //             iscc: '66',
            //             ishd: 'asd',
            //             name: '我是任务名<span></span>！',
            //             // 新增字段
            //             addTime: '2013-04-02 xxxxxxxxxx',
            //             result: '抓取结果'
            //         },
            //         {
            //             id: 3,
            //             status: '视频下载完成',
            //             filepath: 'c:/asd/asd/sad/sadsa/ddsa/',
            //             starttime: '2013/03/02 10:0000',
            //             endtime: '2013/03/02 10:0000',
            //             filenum: '1234',
            //             maxlength: '676',
            //             minlength: 2 * Math.random() | 0,
            //             pagenum: '123',
            //             keywords: '检索词？？',
            //             iscc: '66',
            //             ishd: 'asd',
            //             name: '我是任务名<span></span>！',
            //             // 新增字段
            //             addTime: '2013-04-02 xxxxxxxxxx',
            //             result: '抓取结果'
            //         },
            //         {
            //             id: 3,
            //             status: '视频下载完成',
            //             filepath: 'c:/asd/asd/sad/sadsa/ddsa/',
            //             starttime: '2013/03/02 10:0000',
            //             endtime: '2013/03/02 10:0000',
            //             filenum: '1234',
            //             maxlength: '676',
            //             minlength: 2 * Math.random() | 0,
            //             pagenum: '123',
            //             keywords: '检索词？？',
            //             iscc: '66',
            //             ishd: 'asd',
            //             name: '我是任务名<span></span>！',
            //             // 新增字段
            //             addTime: '2013-04-02 xxxxxxxxxx',
            //             result: '抓取结果'
            //         }
            //     ]
            // });
            ///////////////////////////////////////////////
		});
        $('#still-submit').click(function() {
            submitTask();
        });
        $('#cancel-submit').click(function() {
            buttonAction.hideMore();
            go.Auto();
        });
        // 提交任务
        function submitTask() {
            $.post(
                '/crawler/addTask',
                'params=' + jsonStringify({
                    name: $('#name').val(),
                    maxlength: $('#maxlength').val(),
                    minlength: $('#minlength').val(),
                    pagenum: $('#pagenum').val(),
                    query: $('#query').val(),
                    // isreleated: $('#isreleated').val()
                    iscc: $('#iscc-sure')[0].checked ? 1 : 0,
                    ishd: $('#ishd-sure')[0].checked ? 1 : 0
                }),
                function(data) {
                    data = jsonParse(data);
                    if(data.status != 200) {
                        alert('操作失败，您所属的用户没有权限！');
                        return;
                    }
                    go.Auto();
                    showTips('添加新任务成功！');
                }
            );
        };

        // 历史查询初始化
        // 设置语言
        $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
        var level = $('#history-query-level');
        var val   = $('#history-query-value');

        var start1 = $('#history-query-startDate1');
        var end1   = $('#history-query-endDate1');
        var start2 = $('#history-query-startDate2');
        var end2   = $('#history-query-endDate2');
        start1.datepicker({
            maxDate: '0D',
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        });
        end1.datepicker({
            maxDate: '0D',
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        });
        start2.datepicker({
            maxDate: '0D',
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        });
        end2.datepicker({
            maxDate: '0D',
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
        });
        $('#history-submit').click(function() {
            var reg = /^\s*$/;
            if(reg.test(val.val())
                && reg.test(start1.val())
                && reg.test(end1.val())
                && reg.test(start2.val())
                && reg.test(end2.val())
                ) {
                    alert('查询参数不能都为空！');
                    return;
            }
            $.post(
                '/crawler/queryHistory',
                'params=' + jsonStringify({
                    level: level.val(),
                    value: val.val(),
                    startDate1: start1.val(),
                    endDate1: end1.val(),
                    startDate2: start2.val(),
                    endDate2: end2.val()
                }),
                function(data) {
                    data = jsonParse(data);
                    // 请求失败
                    if(data.status == 1) {
                        alert(data.errorCode.message);
                        return;
                    }
                    if(data.status != 200) {
                        alert('操作失败，您所属的用户没有权限！');
                        return;
                    }
                    if(data.status == 200) {
                        var Lists = $('#Lists');
                        var Tasks = $('#Tasks');
                        var Accts = $('#Accts');
                        Lists[0].className = '';
                        Tasks[0].className = 'current';
                        Accts[0].className = '';
                        go.Tasks(data.data, true);
                    }
                }
            );
            // 测试数据
            // (function(data) {
            //     if(data.status == 200) {
            //         var Lists = $('#Lists');
            //         var Tasks = $('#Tasks');
            //         var Accts = $('#Accts');
            //         Lists[0].className = '';
            //         Tasks[0].className = 'current';
            //         Accts[0].className = '';
            //         go.Tasks(data.data, true);
            //     }
            // })({
            //     status: 200,
            //     errorCode: {
            //         code: 120
            //     },
            //     data: [
            //         {
            //             id: 3,
            //             status: '视频下载完成',
            //             filepath: 'c:/asd/asd/sad/sadsa/ddsa/',
            //             starttime: '2013/03/02 10:0000',
            //             endtime: '2013/03/02 10:0000',
            //             filenum: '1234',
            //             maxlength: '676',
            //             minlength: 2 * Math.random() | 0,
            //             pagenum: '123',
            //             keywords: '检索词？？',
            //             iscc: '66',
            //             ishd: 'asd',
            //             name: '我是任务名<span></span>！',
            //             // 新增字段
            //             addTime: '2013-04-02 xxxxxxxxxx',
            //             result: '抓取结果'
            //         },
            //         {
            //             id: 3,
            //             status: '视频下载完成',
            //             filepath: 'c:/asd/asd/sad/sadsa/ddsa/',
            //             starttime: '2013/03/02 10:0000',
            //             endtime: '2013/03/02 10:0000',
            //             filenum: '1234',
            //             maxlength: '676',
            //             minlength: 2 * Math.random() | 0,
            //             pagenum: '123',
            //             keywords: '检索词？？',
            //             iscc: '66',
            //             ishd: 'asd',
            //             name: '我是任务名<span></span>！',
            //             // 新增字段
            //             addTime: '2013-04-02 xxxxxxxxxx',
            //             result: '抓取结果'
            //         }
            //     ]
            // });
            ////////////////////////////////////////////////
        });

		return {
			init: function() {
				logincontent.hide();
				authedcontent.show();
                // 设置登录的用户名
                $('#has-logined-target').html(
                    globalUserName + 
                    ' <b>[' + (globalSuper ? '管理员' : '普通用户') + ']</b>'
                );
                globalSuper 
                    && $('#Accts').show();
				go.Auto();
                showTips('登陆成功！');
			}
		};
	})();
	// mainer.init();
	var loginer = (function() {
		var loginF = false;
		var username = $('#username');
		var password = $('#password');
		var loginbutton = $('#login');
		loginbutton.click(function() {
            var reg = /^\s*$/;
            if(reg.test(username.val())
                || reg.test(password.val())
                ) {
                    alert('请输入完整的用户名和密码！');
                    return;
            }
			$.post(
				'/crawler/login',
				'params=' + jsonStringify({
					username: username.val(),
					password: password.val()
				}),
				function(data) {
                    data = jsonParse(data);
					if(data.status != 200) {
						alert('登录失败！请检查用户名密码或稍后再试');
						return;
					}
					if(data.status == 200) {
						loginF = true;
                        globalUserName = data.data.username;
                        globalUserId   = data.data.id;
                        data.data.role == 0 
                            && (globalSuper = true);
                        globalUsertoken = password.val();
                        mainer.init();
					}
				}
			);
            // 测试数据
            // (function(data) {
            //     if(data.status != 200) {
            //         alert('登录失败！请检查用户名密码或稍后再试');
            //         return;
            //     }
            //     if(data.status == 200) {
            //         loginF = true;
            //         // 存储登录信息
            //         globalUserName = data.data.username;
            //         globalUserId   = data.data.id;
            //         data.data.role == 0 
            //             && (globalSuper = true);
            //         globalUsertoken = password.val();
            //         mainer.init();
            //     }
            // })({
            //     status: 200,
            //     data: {
            //         id: 5,
            //         username: 'meiya',
            //         role: 0
            //     }
            // });
            ////////////////////////////////////////////////////
		});
        // 注册状态
        var registerState = false;
        // 注册处理 toggle class
        $('#register-container').click(function() {
            registerState
                ? $(this).html('注册')
                : $(this).html('关闭注册');
            registerState
                ? $('#register-outer-container').hide()
                : $('#register-outer-container').show();
            // 置灰状态
            registerState = registerState ? false : true;
        });
        // 修改密码
        var editState = false;
        $('#editpass').click(function() {
            editState
                ? $(this).html('[修改密码]')
                : $(this).html('[关闭修改密码]');
            editState
                ? $('#editpass-container').hide()
                : $('#editpass-container').show();
            // 置灰状态
            editState = editState ? false : true;
        });
        var addUserState = false;
        $('#AddUserTarget').click(function() {
            addUserState
                ? $(this).html('[添加用户]')
                : $(this).html('[关闭添加用户]');
            addUserState
                ? $('#add-user-container').hide()
                : $('#add-user-container').show();
            // 置灰状态
            addUserState = addUserState ? false : true;
        });
        var historyState = false;
        $('#history-target').click(function() {
            historyState
                ? $(this).html('[历史查询]')
                : $(this).html('[关闭历史查询]');
            historyState
                ? $('#history-container').hide()
                : $('#history-container').show();
            historyState 
                && (go.getState() == 'Tasks')
                && go.Auto();
            // 置灰状态
            historyState = historyState ? false : true;
        });
        // 注册逻辑处理
        $('#register').click(function() {
            var reusername = $('#reusername');
            var repassword = $('#repassword');
            var repasswordrepeat = $('#repasswordrepeat');
            // 为空判断
            var reg = /^\s*$/;
            if(reg.test(reusername.val())
                || reg.test(repassword.val())
                || reg.test(repasswordrepeat.val())
                ) {
                    alert('请输入完整的注册信息！');
                    return;
            }
            // 用户名须是邮箱
            var mailreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if(!mailreg.test(reusername.val())) {
                alert('用户名必须是邮箱地址！');
                return;
            }
            // 密码相符吗
            if(repassword.val() !== repasswordrepeat.val()) {
                alert('两次密码输入不一致！');
                return;
            }
            // 验证通过
            $.post(
                '/crawler/addUser',
                'params=' + jsonStringify({
                    username: reusername.val(),
                    password: repassword.val()
                }),
                function(data) {
                    data = jsonParse(data);
                    // if(data.status != 0) {
                    //     alert('登录失败！');
                    //     return;
                    // }
                    // if(data.status == 0) {
                    //     loginF = true;
                    //     mainer.init();
                    // }
                    if(data.status != 200) {
                        alert('注册失败！请稍后再试');
                        return;
                    }
                    if(data.status == 200) {
                        // success
                        alert('注册成功！请确认后登录');
                        window.setTimeout(function() {
                            window.location.reload();
                        }, 500);
                        return;
                    }
                    alert('注册失败！请稍后再试');
                }
            );
            // 测试数据
            // (function(data) {
            //     if(data.status == 200) {
            //         // success
            //         alert('注册成功！请确认后登录');
            //         window.setTimeout(function() {
            //             window.location.reload();
            //         }, 500);
            //         return;
            //     }
            //     alert('注册失败！请稍后再试');
            // })({
            //     status: 200
            // });
            ////////////////////////////////////////////////////
        });

        $('#add-user').click(function() {
            if(!globalSuper) {
                alert('您无权限进行此操作！');
                return;
            }
            var addusername = $('#addusername');
            var addpassword = $('#addpassword');
            var addpasswordrepeat = $('#addpasswordrepeat');
            var userType    = $('#user-type');
            // 为空判断
            var reg = /^\s*$/;
            if(reg.test(addusername.val())
                || reg.test(addpassword.val())
                || reg.test(addpasswordrepeat.val())
                ) {
                    alert('请输入完整的用户信息！');
                    return;
            }
            // 用户名须是邮箱
            var mailreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
            if(!mailreg.test(addusername.val())) {
                alert('用户名必须是邮箱地址！');
                return;
            }
            // 密码相符吗
            if(addpassword.val() !== addpasswordrepeat.val()) {
                alert('两次密码输入不一致！');
                return;
            }
            // 验证通过
            var addUserUrl = userType.val() == 0 
                ? '/crawler/addAdmin' 
                : '/crawler/addUser';
            $.post(
                addUserUrl,
                'params=' + jsonStringify({
                    username: addusername.val(),
                    password: addpassword.val()
                }),
                function(data) {
                    data = jsonParse(data);
                    if(data.status != 200) {
                        alert('操作失败，您所属的用户没有权限！');
                        return;
                    }
                    if(data.status == 200) {
                        // success
                        showTips('添加用户成功！');
                        // 清空
                        addusername.val('');
                        addpassword.val('');
                        addpasswordrepeat.val('');
                        go.Auto();
                        return;
                    }
                    alert('添加用户失败！请稍后再试');
                }
            );
            // 测试数据
            // (function(data) {
            //     if(data.status == 0) {
            //         // success
            //         showTips('添加用户成功！');
            //         // 清空
            //         addusername.val('');
            //         addpassword.val('');
            //         addpasswordrepeat.val('');
            //         go.Auto();
            //         return;
            //     }
            //     alert('添加用户失败！请稍后再试');
            // })({
            //     status: 0
            // });
            //////////////////////////////////////////////////////
        });

        $('#edit-password').click(function() {
            var oldpassword = $('#oldpassword');
            var newpassword = $('#newpassword');
            var renewpassword = $('#renewpassword');
            // 为空判断
            var reg = /^\s*$/;
            if(reg.test(oldpassword.val())
                || reg.test(newpassword.val())
                || reg.test(renewpassword.val())
                ) {
                    alert('请输入完整的密码信息！');
                    return;
            }
            if(oldpassword.val() != globalUsertoken) {
                alert('原密码验证错误！');
                return;
            }
            // 密码相符吗
            if(newpassword.val() !== renewpassword.val()) {
                alert('两次新密码输入不一致！');
                return;
            }
            // 验证通过
            $.post(
                '/crawler/editUser',
                'params=' + jsonStringify({
                    id: globalUserId,
                    username: globalUserName,
                    password: newpassword.val()
                }),
                function(data) {
                    data = jsonParse(data);
                    if(data.status != 200) {
                        alert('操作失败，您所属的用户没有权限！');
                        return;
                    }
                    if(data.status == 200) {
                        // success
                        showTips('修改密码成功！');
                        globalUsertoken = newpassword.val();
                        // 清空
                        oldpassword.val('');
                        newpassword.val('');
                        renewpassword.val('');
                        $('#editpass')[0].click();
                        return;
                    }
                    alert('修改密码失败！请稍后再试');
                }
            );
            // 测试数据
            // (function(data) {
            //     if(data.status == 200) {
            //         // success
            //         showTips('修改密码成功！');
            //         globalUsertoken = newpassword.val();
            //         // 清空
            //         oldpassword.val('');
            //         newpassword.val('');
            //         renewpassword.val('');
            //         $('#editpass')[0].click();
            //         return;
            //     }
            //     alert('修改密码失败！请稍后再试');
            // })({
            //     status: 200
            // });
            //////////////////////////////////////////////////////
		});

		return {
			getLoginState: function() {
				return loginF;
			}
		};
	})();
	$('#idsubmit-container').click(function() {
		if(pushedId.length == 0) {
			alert('先选择视频ID！');
			return;
		}
		$.post(
			'/crawler/addVideo',
			'params=' + jsonStringify({
				videoid: pushedId
			}),
			function(data) {
                data = jsonParse(data);
                if(data.status != 200) {
                    alert('操作失败，您所属的用户没有权限！');
                    return;
                }
				go.Auto();
                showTips('成功提交视频ID！');
			}
		);
	});
    // taskIdClick
    function taskIdClick() {
        var id = this.getAttribute('taskid');
        go.Lists(id);
        // 切换状态
        var Lists = $('#Lists');
        var Tasks = $('#Tasks');
        Lists[0].className = 'current';
        Tasks[0].className = '';
    };
	// videoidclick
	function videoIdClick() {
		var id = this.getAttribute('videoid');
		var checked = this.checked;
		if(checked) {
			videoIdMap[id] = true;
			pushedId.push(id);
		}
		if(!checked) {
			delete videoIdMap[id];
			var t = [];
			for(var i = 0, len = pushedId.length; i < len; i ++) {
				pushedId[i] != id && t.push(pushedId[i]);
			}
			pushedId = t;
		}
	};
    function delTask() {
        var id = this.getAttribute('taskid');
        $.get(
            '/crawler/delTask?id=' + id,
            function(o) {
                o = jsonParse(o);
                if(o.status != 200) {
                    alert('操作失败，您所属的用户没有权限！');
                    return;
                }
                go.Auto();
                showTips('删除任务成功！');
            }
        );
    };
    function userIdClick() {
        if(!globalSuper) {
            alert('您无权限进行此操作！');
            return;
        }
        var id = this.getAttribute('userid');
        $.get(
            '/crawler/delUser?id=' + id,
            function(o) {
                o = jsonParse(o);
                if(o.status != 200) {
                    alert('操作失败，您所属的用户没有权限！');
                    return;
                }
                go.Auto();
                showTips('删除用户成功！');
            }
        );
    };
    function PagerConstructor(placeHolder, totalPages, curPage, callBack) {
        // 邻居间隔有几个
        var neighbour = 3;
        // 占位符处理
        typeof(placeHolder) == 'string' && (placeHolder = $(placeHolder));
        // 默认样式，可以自己设置
        var pagerContainerStyle = '_pager-container';
        var aNotCurTplStyle     = '_pager-not-current';
        var aIsCurTplStyle      = '_pager-is-current';
        // 上一页、下一页的样式
        var prevStyle    = '_pager-prev';
        var prevStyleDis = '_pager-prev-disabled';
        var nextStyle    = '_pager-next';
        var nextStyleDis = '_pager-next-disabled';
        var lgthen       = '_pager-lgthen';
        var lgthenDis    = '_pager-lgthen-dis';
        // 两个模板
        var aNotCurTpl = '<a hidefocus="hidefocus" href="#" page="#{0}" class="' + aNotCurTplStyle + '">#{0}</a>';
        var aIsCurTpl  = '<a hidefocus="hidefocus" href="#" page="#{0}" class="' + aIsCurTplStyle + '">#{0}</a>';
        // 省略字符
        var ellipsis = '···';
        // 内部函数
        // 是不是第一页
        function _isFirst() {
            return curPage == 1;
        };
        // 是不是最后一页
        function _isLast() {
            return curPage == totalPages;
        };
        // render
        function _render() {
            var outPuts   = '';
            if(totalPages <= 10) {
                for(var i = 1; i < totalPages + 1; i++) {
                    var thisTpl = (i == curPage ? aIsCurTpl : aNotCurTpl);
                    outPuts += stringFormat(thisTpl, i);
                }
            } else if(totalPages > 10) {
                for(var i = 1; i < totalPages + 1; i++) {
                    var thisTpl = (i == curPage ? aIsCurTpl : aNotCurTpl);
                    if(Math.abs(i - curPage) <= neighbour || i == 1 || i == totalPages) {
                        outPuts += stringFormat(thisTpl, i);
                    } else {
                        outPuts += ellipsis;
                    }
                }
                outPuts = outPuts.replace(/[·]+/g, ellipsis);
            }
            // html填充
            var t =   '<div class="' + pagerContainerStyle + '">'
                    +   '<a hidefocus="hidefocus" href="#" action="prev" class="' + prevStyle + ' ' + (_isFirst() ? prevStyleDis : '') + '"><span class="' + lgthen + ' ' + (_isFirst() ? lgthenDis : '') + '">&lt;</span>上一页</a>'
                    +       outPuts
                    +   '<a hidefocus="hidefocus" href="#" action="next" class="' + nextStyle + ' ' + (_isLast() ? nextStyleDis : '') + '">下一页<span class="' + lgthen + ' ' + (_isLast() ? lgthenDis : '') + '">&gt;</span></a>'
                    + '</div>';
            placeHolder.html(t);
        };
        // set
        function _set(nowPage) {
            if(nowPage > totalPages)
                nowPage = totalPages;
            // 重新赋值
            curPage = (+ nowPage);
            // 恢复原始html
            // outPuts = '';
            _render();
        };
        // setTotal
        function _setTotal(total) {
            totalPages = (+ total);
            _set(1);
        };
        // get
        function _get() {
            return (+ curPage);
        };
        // clear
        function _clear() {
            placeHolder.html('');
        };
        // 事件绑定
        placeHolder.on('click', function(e) {
            var target = e.target;
            var action;
            if(target.tagName.toLowerCase() == 'a') {
                if(action = target.getAttribute('action')) {
                    // 如果是上一页下一页
                    switch(action) {
                        // 上一页
                        case 'prev':
                            if(_isFirst()) 
                                break;
                            var now = (+ curPage - 1);
                            _set(now);
                            callBack(now)
                            break;
                        // 下一页
                        case 'next':
                            if(_isLast())
                                break;
                            var now = (+ curPage + 1);
                            _set(now);
                            callBack(now);
                            break;
                    }
                }
                else {
                    // 正常翻页
                    var now = target.getAttribute('page');
                    _set(now);
                    callBack(now);
                }
            }
            e.stopPropagation();
            e.preventDefault();
        });
        // 暴露接口
        return {
            render: _render,
            set: _set,
            get: _get,
            clear: _clear,
            setTotal: _setTotal
        };
    };
    function stringFormat(source, opts) {
        source = String(source);
        var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
        if(data.length){
            data = data.length == 1 ? 
                /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
                : data;
            return source.replace(/#\{(.+?)\}/g, function (match, key){
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if('[object Function]' == toString.call(replacer)){
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    };
    function hiddenSubmit(params, url, callBack, delay) {
        // 移除原有的隐藏元素
        var oldIframe, oldForm;
        (oldIframe = document
            .getElementById('_hiddenIframe_'))
            && document.body.removeChild(oldIframe);
        (oldForm = document
            .getElementById('_hiddenForm_')) 
            && document.body.removeChild(oldForm);
        // 构建参数列表
        var paramsStr  = '';
        for(var key in params) {
            paramsStr += stringFormat(
                '<input type="hidden" name="#{0}" value="#{1}" />',
                key,
                params[key]
            );
        }
        var iframe = '<iframe id="_hiddenIframe_" name="_hiddenIframe_" style="display:none;"></iframe>';
        var form   = '<form id="_hiddenForm_" target="_hiddenIframe_" action="' + url + '" method="POST">' +
                        paramsStr +
                     '</form>';
        var iframe = getDom(iframe);
        var form   = getDom(form);
        // or set content / 跨域
        // iframe.src = "data:text/html;charset=utf-8," + escape(content);
        document.body.appendChild(iframe);
        document.body.appendChild(form);
        // 提交
        form.submit();
        // 回调函数
        setTimeout(function() {
        	callBack();
        }, delay)
    };
    function getDom(domStr) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = domStr;
        return tempDiv.childNodes[0];
    };
    function encodeHTML(source) {
        return String(source)
                    .replace(/&/g,'&amp;')
                    .replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;')
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
    };
	function checkStrLength(str) {
		var counter = 0;
		for (var i = 0, len = str.length; i < len; i++) {
			counter ++;
			if (str.charCodeAt(i) > 255)
				counter ++;
		}
		return counter;
	};
	function cutString(str, maxLength, htmlEncode) {
		var len  = checkStrLength(str);
		if (len <= maxLength)
			return htmlEncode ? encodeHTML(str) : str;
		/*需要循环输入的值，以截取字符串*/
		var frontLength = 0;
		for (var i = 0, len = str.length; i < len; i++) {
			if (frontLength > maxLength)
				break;
			frontLength ++;
			if (str.charCodeAt(i) > 255)
				frontLength ++; //若为全角，则再加一
		}
		var returner = str.substring(0, i - 1) + '..';
		return htmlEncode ? encodeHTML(returner) : returner;
	};
    // tips
    function showTips(hints) {
        var me     = arguments.callee;
        if(me.timer) {
            window.clearTimeout(me.timer);
            delete me.timer;
        }
        var target = $('#tips');
        target.html(hints);
        target.show(100);
        me.timer = window.setTimeout(function() {
            target.hide(100, function() {
                window.clearTimeout(me.timer);
                delete me.timer;
            });
        }, 5000);
    };
})();