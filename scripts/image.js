define([],function(){function noop(){}function cacheBust(url){return url=url.replace(CACHE_BUST_FLAG,""),url+=url.indexOf("?")<0?"?":"&",url+CACHE_BUST_QUERY_PARAM+"="+Math.round(2147483647*Math.random())}var CACHE_BUST_QUERY_PARAM="bust",CACHE_BUST_FLAG="!bust",RELATIVE_FLAG="!rel";return{load:function(name,req,onLoad,config){var img;config.isBuild?onLoad(null):(img=new Image,img.onerror=function(err){onLoad.error(err)},img.onload=function(){onLoad(img);try{delete img.onload}catch(err){img.onload=noop}},img.src=-1!==name.indexOf(RELATIVE_FLAG)?req.toUrl(name.replace(RELATIVE_FLAG,"")):name)},normalize:function(name){return-1===name.indexOf(CACHE_BUST_FLAG)?name:cacheBust(name)}}});