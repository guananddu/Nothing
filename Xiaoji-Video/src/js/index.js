(function() {
	var videoIdMap = {}, pushedId = [];
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
        	'',
            '视频ID', 
            '名称', 
            '描述', 
            '作者',
            '创建时间',
            '访问量',
            '喜欢',
            '状态',
            '不喜欢',
            '播放时长',
            '质量',
            '缩略图'
        ],

        hFormatMore : [],

        // 表身格式
        bFormat: [
        	function(dataItem, i, j, tr, td) {
        		var checked = (videoIdMap[dataItem.videoid] != undefined);
        		// checkbox
                return dataItem.status == 0 
                	? '<input ' + (checked ? 'checked="checked"' : '') + ' _stabletarget_="videoid" videoid="' + dataItem.videoid + '" type="checkbox" />' 
                	: '';
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.videoid;
            }, 
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.title;
            	var show  = cutString(dataItem.title, 20, true);
                return '<span title="' + title + '">' + show + '</span>';
            }, 
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.descri;
            	var show  = cutString(dataItem.descri, 20, true);
                return '<span title="' + title + '">' + show + '</span>';
            }, 
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.author;
            	var show  = cutString(dataItem.author, 15, true);
                return '<span title="' + title + '">' + show + '</span>';
            }, 
            function(dataItem, i, j, tr, td) {
                return dataItem.createtime;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.visit;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.like;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.status;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.dislike;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.playlength;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.quality;
            },
            function(dataItem, i, j, tr, td) {
                return '<img src="' + dataItem.thumbnail + '" class="thumbnail" />';
            }
        ]
    };
    var TasksConf     = {
        // 设置表头具体格式
        hFormat: [
            '任务ID', 
            '状态', 
            '文件路径', 
            '开始时间',
            '结束时间',
            '文件数量',
            '最大长度',
            '最小长度',
            '页数',
            '搜索词',
            '相关'
        ],

        hFormatMore : [],

        // 表身格式
        bFormat: [
        	function(dataItem, i, j, tr, td) {
        		return dataItem.taskid;
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.status;
            }, 
            function(dataItem, i, j, tr, td) {
            	var title = dataItem.filepath;
            	var show  = cutString(dataItem.filepath, 20, true);
                return '<span title="' + title + '">' + show + '</span>';
            }, 
            function(dataItem, i, j, tr, td) {
            	return dataItem.starttime;
            }, 
            function(dataItem, i, j, tr, td) {
            	return dataItem.endtime;
            }, 
            function(dataItem, i, j, tr, td) {
                return dataItem.filenum;
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
            	var title = dataItem.query;
            	var show  = cutString(dataItem.query, 20, true);
                return '<span title="' + title + '">' + show + '</span>';
            },
            function(dataItem, i, j, tr, td) {
                return dataItem.isreleated;
            }
        ]
    };
    var Liststabler   = function() {
        var _preOpt = tablecloth;
        // 展现等逻辑配置
        var _conOpt = {
            // 设置表头具体格式
            hFormat: [
            	'',
                '视频ID', 
                '名称', 
                '描述', 
                '作者',
                '创建时间',
                '访问量',
                '喜欢',
                '状态',
                '不喜欢',
                '播放时长',
                '质量',
                '缩略图'
            ],

            hFormatMore : [],

            // 表身格式
            bFormat: [
            	function(dataItem, i, j, tr, td) {
            		var checked = (videoIdMap[dataItem.videoid] != undefined);
            		// checkbox
                    return dataItem.status == 0 
                    	? '<input ' + (checked ? 'checked="checked"' : '') + ' _stabletarget_="videoid" videoid="' + dataItem.videoid + '" type="checkbox" />' 
                    	: '';
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.videoid;
                }, 
                function(dataItem, i, j, tr, td) {
                	var title = dataItem.title;
                	var show  = cutString(dataItem.title, 20, true);
                    return '<span title="' + title + '">' + show + '</span>';
                }, 
                function(dataItem, i, j, tr, td) {
                	var title = dataItem.descri;
                	var show  = cutString(dataItem.descri, 20, true);
                    return '<span title="' + title + '">' + show + '</span>';
                }, 
                function(dataItem, i, j, tr, td) {
                	var title = dataItem.author;
                	var show  = cutString(dataItem.author, 15, true);
                    return '<span title="' + title + '">' + show + '</span>';
                }, 
                function(dataItem, i, j, tr, td) {
                    return dataItem.createtime;
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.visit;
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.like;
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.status;
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.dislike;
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.playlength;
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.quality;
                },
                function(dataItem, i, j, tr, td) {
                    return '<img src="' + dataItem.thumbnail + '" class="thumbnail" />';
                }
            ]
        };
        // 生成构造函数
        var myTableConstructor = sTable(_preOpt);
        // 表格初始化
        var meTable = new myTableConstructor(_conOpt);
        // 绑定事件
        meTable.on('click', 'videoid', videoIdClick);
        // 暴露接口
        return meTable;
    }();
    var Taskstabler   = function() {
        var _preOpt = tablecloth;
        // 展现等逻辑配置
        var _conOpt = {
            // 设置表头具体格式
            hFormat: [
                '任务ID', 
                '状态', 
                '文件路径', 
                '开始时间',
                '结束时间',
                '文件数量',
                '最大长度',
                '最小长度',
                '页数',
                '搜索词',
                '相关'
            ],

            hFormatMore : [],

            // 表身格式
            bFormat: [
            	function(dataItem, i, j, tr, td) {
            		return dataItem.taskid;
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.status;
                }, 
                function(dataItem, i, j, tr, td) {
                	var title = dataItem.filepath;
                	var show  = cutString(dataItem.filepath, 20, true);
                    return '<span title="' + title + '">' + show + '</span>';
                }, 
                function(dataItem, i, j, tr, td) {
                	return dataItem.starttime;
                }, 
                function(dataItem, i, j, tr, td) {
                	return dataItem.endtime;
                }, 
                function(dataItem, i, j, tr, td) {
                    return dataItem.filenum;
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
                	var title = dataItem.query;
                	var show  = cutString(dataItem.query, 20, true);
                    return '<span title="' + title + '">' + show + '</span>';
                },
                function(dataItem, i, j, tr, td) {
                    return dataItem.isreleated;
                }
            ]
        };
        // 生成构造函数
        var myTableConstructor = sTable(_preOpt);
        // 表格初始化
        var meTable = new myTableConstructor(_conOpt);
        // 绑定事件
        // meTable.on('click', 'videoid', videoIdClick);
        // 暴露接口
        return meTable;
    }();
	var render = function() {
		var listsData, tasksData;
		var listsUrl = '/crawler/getList', 
			tasksUrl = '/crawler/getTasks';
		var perPageNum = 10;
		return {
			Lists: function(page) {
				if(page == undefined) {
					listsData = [];
					// $.get(listsUrl, function(o) {
					// 	if(o.status == 0) {
					// 		listsData = o.data;
					// 		var totalPage = Math.ceil(listsData.length / perPageNum);
					// 		pager.setTotal(totalPage);
					// 		Liststabler
					// 			.setData(listsData.slice(0, perPageNum))
					// 			.render(true);
					// 	}
					// });
					
					// 测试数据
					for(var i = 0, len = 113; i < len; i ++) {
						listsData.push({
							videoid: i,
							title: '名字名字名字名字',
							descri: '描述描述描描述描描述描述',
							author: '坐着坐着坐着坐着',
							createtime: '2013/03/02 10:0000',
							visit: '1234',
							like: '676',
							status: 2 * Math.random() | 0,
							dislike: '123',
							playlength: '12:00',
							quality: '66',
							thumbnail: 'http://www.baidu.com/img/baidu_jgylogo3.gif'
						});
					}
					var totalPage = Math.ceil(listsData.length / perPageNum);
					pager.setTotal(totalPage);
					Liststabler
						.setHeaderFormat(ListsConf.hFormat)
						.setBodyFormat(ListsConf.bFormat)
						.setData(listsData.slice(0, perPageNum))
						.render(true);
				}
				else {
					Liststabler
						.setHeaderFormat(ListsConf.hFormat)
						.setBodyFormat(ListsConf.bFormat)
						.setData(listsData.slice((page - 1) * perPageNum, page * perPageNum))
						.render(true);
				}
			},
			Tasks: function(page) {
				if(page == undefined) {
					tasksData = [];
					// $.get(tasksUrl, function(o) {
					// 	if(o.status == 0) {
					// 		tasksData = o.data;
					// 		var totalPage = Math.ceil(tasksData.length / perPageNum);
					// 		pager.setTotal(totalPage);
					// 		Taskstabler
					// 			.setData(tasksData.slice(0, perPageNum))
					// 			.render(true);
					// 	}
					// });
					
					// 测试数据
					for(var i = 0, len = 40; i < len; i ++) {
						tasksData.push({
							taskid: i,
							status: '状态',
							filepath: 'c:/asd/asd/sad/sadsa/ddsa/',
							starttime: '2013/03/02 10:0000',
							endtime: '2013/03/02 10:0000',
							filenum: '1234',
							maxlength: '676',
							minlength: 2 * Math.random() | 0,
							pagenum: '123',
							query: '检索词？？',
							isreleated: '66'
						});
					}
					var totalPage = Math.ceil(tasksData.length / perPageNum);
					pager.setTotal(totalPage);
					Taskstabler
						.setHeaderFormat(TasksConf.hFormat)
						.setBodyFormat(TasksConf.bFormat)
						.setData(tasksData.slice(0, perPageNum))
						.render(true);
				}
				else {
					Taskstabler
						.setHeaderFormat(TasksConf.hFormat)
						.setBodyFormat(TasksConf.bFormat)
						.setData(tasksData.slice((page - 1) * perPageNum, page * perPageNum))
						.render(true);
				}
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
            }
        };
    }();
	var go = (function() {
		var state = 'Lists';
		var idsubmitcontainer = $('#idsubmit-container');
		return {
			Lists: function() {
				state = 'Lists';
				pager.setF(state);
				videoIdMap = {}, pushedId = [];
				render[state]();
				idsubmitcontainer[0].className 
					= 'idsubmit-container';
			},
			Tasks: function() {
				state = 'Tasks';
				pager.setF(state);
				render[state]();
				idsubmitcontainer[0].className 
					= 'idsubmit-container-none';
			},
			Auto: function() {
				// goauto
				go[state]();
			}
		};
	})();
	var mainer  = (function() {
		var logincontent = $('#login-content');
		var authedcontent = $('#authed-content');
		var Lists = $('#Lists');
		var Tasks = $('#Tasks');
		Lists.click(function() {
			if(this.className == 'current')
				return;
			this.className     = 'current';
			Tasks[0].className = '';
			go.Lists();
		});
		Tasks.click(function() {
			if(this.className == 'current')
				return;
			this.className     = 'current';
			Lists[0].className = '';
			go.Tasks();
		});
		var submit = $('#submit');
		submit.click(function() {
			hiddenSubmit({
				maxlength: $('#maxlength').val(),
				minlength: $('#minlength').val(),
				pagenum: $('#pagenum').val(),
				query: $('#query').val(),
				isreleated: $('#isreleated').val()
			}, 
			'/crawler/setting', 
			function() {
				go.Auto();
			}, 
			500);
		});
		return {
			init: function() {
				logincontent.hide();
				authedcontent.show();
				go.Auto();
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
			$.post(
				'/crawler/login',
				'params=' + jsonStringify({
					username: username.val(),
					password: password.val()
				}),
				function(data) {
					if(data.status != 0) {
						alert('登录失败！');
						return;
					}
					if(data.status == 0) {
						loginF = true;
						mainer.init();
					}
				}
			);
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
				go.Auto();
			}
		);
	});
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
})();