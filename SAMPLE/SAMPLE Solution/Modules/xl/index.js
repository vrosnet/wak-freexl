﻿var DIRECTORY_PATH = File(module.filename).parent.path;var os = application.os;var isMac = os.isMac;var isWindows = os.isWindows;var isLinux = os.isLinux;var EXECUTABLE_PATH = (function(){	if(isMac){		return DIRECTORY_PATH + 'MacOS/xl2sql';	}	if(isLinux){		return DIRECTORY_PATH + 'Linux64/xl2sql';	}	if(isWindows){		return DIRECTORY_PATH + 'Windows64/xl2sql.exe';	}})();var EXECUTABLE_PATH_JSON = (function(){	if(isMac){		return DIRECTORY_PATH + 'MacOS/xlstojson';	}	if(isLinux){		return DIRECTORY_PATH + 'Linux64/xlstojson';	}	if(isWindows){		return DIRECTORY_PATH + 'Windows64/xlstojson.exe';	}})();//exports.executablePath = EXECUTABLE_PATH;var execute = function(path, command, stdIn){	var result = {		'console':{			'stdIn':'',			'stdOut':'',				'stdErr':''},		'worker':{			'hasStarted':false,			'exitStatus':null,			'forced':null}	};		if((/^\S/).test(command)){		path += ' ';	}	result.console.stdIn = path + command;	var worker = new SystemWorker(result.console.stdIn);	worker.setBinary(true);	worker.onmessage = function(e){		try{			result.console.stdOut += e.data.toString('utf8');		}catch(e){		for(var i = 0;i < e.messages.length;++i){			console.error('%s', e.messages[i]);					}		}		}	worker.onerror = function(e){		try{			result.console.stdErr += e.data.toString('utf8');		}catch(e){		for(var i = 0;i < e.messages.length;++i){			console.error('%s', e.messages[i]);					}		}	}	worker.onterminated = function(e){		result.worker.hasStarted = e.hasStarted;		result.worker.exitStatus = e.exitStatus;		result.worker.forced = e.forced;					exitWait();	}	if(typeof stdIn === 'string' || stdIn instanceof Buffer){		worker.postMessage(stdIn);		worker.endOfInput();	}				worker.wait();		return result;}var escapePath = function(path){	if(typeof path === 'string'){		if(isMac || isLinux){			return path.replace(/([\\!"#$%&\'()=~|<>?;*`\[\] ])/g, '\\$1');		}			if(isWindows){			if((/[&|<>()%\^\\" ]/).test(path)){								if((/\\$/).test(path)){					path = '"' + path + '\\"';				}else{					path = '"' + path + '"';				}			}			return path;		}	}}exports.toSQL = function(path, stdIn){	if(typeof path === 'string'){		return execute(escapePath(EXECUTABLE_PATH), escapePath(path), stdIn);		}}exports.toJSON = function(path, stdIn){	if(typeof path === 'string'){		var result = execute(escapePath(EXECUTABLE_PATH_JSON), '-f ' + escapePath(path), stdIn);			if((result.worker.hasStarted === true)		&& (result.worker.exitStatus === 0)		&& (result.worker.forced === false)){			try{				return JSON.parse(result.console.stdOut)			}catch(e){				for(var i = 0;i < e.messages.length;++i){					console.error('%s', e.messages[i]);							}				return;			}		};	}}