define(["module"],function(module){var text,fs,Cc,Ci,xpcIsWindows,progIds=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],xmlRegExp=/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,bodyRegExp=/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,hasLocation="undefined"!=typeof location&&location.href,defaultProtocol=hasLocation&&location.protocol&&location.protocol.replace(/\:/,""),defaultHostName=hasLocation&&location.hostname,defaultPort=hasLocation&&(location.port||void 0),buildMap={},masterConfig=module.config&&module.config()||{};return text={version:"2.0.14",strip:function(content){if(content){content=content.replace(xmlRegExp,"");var matches=content.match(bodyRegExp);matches&&(content=matches[1])}else content="";return content},jsEscape:function(content){return content.replace(/(['\\])/g,"\\$1").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r").replace(/[\u2028]/g,"\\u2028").replace(/[\u2029]/g,"\\u2029")},createXhr:masterConfig.createXhr||function(){var xhr,i,progId;if("undefined"!=typeof XMLHttpRequest)return new XMLHttpRequest;if("undefined"!=typeof ActiveXObject)for(i=0;3>i;i+=1){progId=progIds[i];try{xhr=new ActiveXObject(progId)}catch(e){}if(xhr){progIds=[progId];break}}return xhr},parseName:function(name){var modName,ext,temp,strip=!1,index=name.lastIndexOf("."),isRelative=0===name.indexOf("./")||0===name.indexOf("../");return-1!==index&&(!isRelative||index>1)?(modName=name.substring(0,index),ext=name.substring(index+1)):modName=name,temp=ext||modName,index=temp.indexOf("!"),-1!==index&&(strip="strip"===temp.substring(index+1),temp=temp.substring(0,index),ext?ext=temp:modName=temp),{moduleName:modName,ext:ext,strip:strip}},xdRegExp:/^((\w+)\:)?\/\/([^\/\\]+)/,useXhr:function(url,protocol,hostname,port){var uProtocol,uHostName,uPort,match=text.xdRegExp.exec(url);return match?(uProtocol=match[2],uHostName=match[3],uHostName=uHostName.split(":"),uPort=uHostName[1],uHostName=uHostName[0],!(uProtocol&&uProtocol!==protocol||uHostName&&uHostName.toLowerCase()!==hostname.toLowerCase()||(uPort||uHostName)&&uPort!==port)):!0},finishLoad:function(name,strip,content,onLoad){content=strip?text.strip(content):content,masterConfig.isBuild&&(buildMap[name]=content),onLoad(content)},load:function(name,req,onLoad,config){if(config&&config.isBuild&&!config.inlineText)return void onLoad();masterConfig.isBuild=config&&config.isBuild;var parsed=text.parseName(name),nonStripName=parsed.moduleName+(parsed.ext?"."+parsed.ext:""),url=req.toUrl(nonStripName),useXhr=masterConfig.useXhr||text.useXhr;return 0===url.indexOf("empty:")?void onLoad():void(!hasLocation||useXhr(url,defaultProtocol,defaultHostName,defaultPort)?text.get(url,function(content){text.finishLoad(name,parsed.strip,content,onLoad)},function(err){onLoad.error&&onLoad.error(err)}):req([nonStripName],function(content){text.finishLoad(parsed.moduleName+"."+parsed.ext,parsed.strip,content,onLoad)}))},write:function(pluginName,moduleName,write){if(buildMap.hasOwnProperty(moduleName)){var content=text.jsEscape(buildMap[moduleName]);write.asModule(pluginName+"!"+moduleName,"define(function () { return '"+content+"';});\n")}},writeFile:function(pluginName,moduleName,req,write,config){var parsed=text.parseName(moduleName),extPart=parsed.ext?"."+parsed.ext:"",nonStripName=parsed.moduleName+extPart,fileName=req.toUrl(parsed.moduleName+extPart)+".js";text.load(nonStripName,req,function(){var textWrite=function(contents){return write(fileName,contents)};textWrite.asModule=function(moduleName,contents){return write.asModule(moduleName,fileName,contents)},text.write(pluginName,nonStripName,textWrite,config)},config)}},"node"===masterConfig.env||!masterConfig.env&&"undefined"!=typeof process&&process.versions&&process.versions.node&&!process.versions["node-webkit"]&&!process.versions["atom-shell"]?(fs=require.nodeRequire("fs"),text.get=function(url,callback,errback){try{var file=fs.readFileSync(url,"utf8");"﻿"===file[0]&&(file=file.substring(1)),callback(file)}catch(e){errback&&errback(e)}}):"xhr"===masterConfig.env||!masterConfig.env&&text.createXhr()?text.get=function(url,callback,errback,headers){var header,xhr=text.createXhr();if(xhr.open("GET",url,!0),headers)for(header in headers)headers.hasOwnProperty(header)&&xhr.setRequestHeader(header.toLowerCase(),headers[header]);masterConfig.onXhr&&masterConfig.onXhr(xhr,url),xhr.onreadystatechange=function(){var status,err;4===xhr.readyState&&(status=xhr.status||0,status>399&&600>status?(err=new Error(url+" HTTP status: "+status),err.xhr=xhr,errback&&errback(err)):callback(xhr.responseText),masterConfig.onXhrComplete&&masterConfig.onXhrComplete(xhr,url))},xhr.send(null)}:"rhino"===masterConfig.env||!masterConfig.env&&"undefined"!=typeof Packages&&"undefined"!=typeof java?text.get=function(url,callback){var stringBuffer,line,encoding="utf-8",file=new java.io.File(url),lineSeparator=java.lang.System.getProperty("line.separator"),input=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file),encoding)),content="";try{for(stringBuffer=new java.lang.StringBuffer,line=input.readLine(),line&&line.length()&&65279===line.charAt(0)&&(line=line.substring(1)),null!==line&&stringBuffer.append(line);null!==(line=input.readLine());)stringBuffer.append(lineSeparator),stringBuffer.append(line);content=String(stringBuffer.toString())}finally{input.close()}callback(content)}:("xpconnect"===masterConfig.env||!masterConfig.env&&"undefined"!=typeof Components&&Components.classes&&Components.interfaces)&&(Cc=Components.classes,Ci=Components.interfaces,Components.utils["import"]("resource://gre/modules/FileUtils.jsm"),xpcIsWindows="@mozilla.org/windows-registry-key;1"in Cc,text.get=function(url,callback){var inStream,convertStream,fileObj,readData={};xpcIsWindows&&(url=url.replace(/\//g,"\\")),fileObj=new FileUtils.File(url);try{inStream=Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream),inStream.init(fileObj,1,0,!1),convertStream=Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream),convertStream.init(inStream,"utf-8",inStream.available(),Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER),convertStream.readString(inStream.available(),readData),convertStream.close(),inStream.close(),callback(readData.value)}catch(e){throw new Error((fileObj&&fileObj.path||"")+": "+e)}}),text});