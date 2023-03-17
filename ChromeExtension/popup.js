document.addEventListener("DOMContentLoaded", async function () { 
    // https://developer.chrome.com/docs/extensions/reference/tabs/#method-query
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab?.url) { // Optional chaining (?.)
		try {
			let url = new URL(tab.url);
			document.getElementById('InputDomain').value = url.hostname;
		} catch { ; }
	}

	document.getElementById('BtnGetCookies').onclick = async function () {
		var domain = document.getElementById('InputDomain').value; 
		// https://developer.chrome.com/docs/extensions/reference/cookies/
		// https://github.com/GoogleChrome/chrome-extensions-samples
		const _arrCookies = await chrome.cookies.getAll({domain: domain});  
		var arrCookies = [];
		_arrCookies.forEach(_cookie => { 
			var cookie = {}; 
			cookie['name' ] = _cookie.name;
			cookie['value'] = _cookie.value; 
			cookie['url'  ] = 'http' + (_cookie.secure ? 's://' : '://') + (_cookie.domain.charAt(0)=='.' ? _cookie.domain.slice(1) : _cookie.domain) + _cookie.path;
			cookie['path' ] = _cookie.path; 
			if (_cookie.domain.charAt(0)=='.'           ) { cookie['domain'        ] = _cookie.domain; }
			if (_cookie.hasOwnProperty('expirationDate')) { cookie['expirationDate'] = _cookie.expirationDate; }  
			if (_cookie.hasOwnProperty('httpOnly'      )) { cookie['httpOnly'      ] = _cookie.httpOnly; }  
			if (_cookie.hasOwnProperty('storeId'       )) { cookie['storeId'       ] = _cookie.storeId; }  
			if (_cookie.hasOwnProperty('secure'        )) { cookie['secure'        ] = _cookie.secure; }  
			arrCookies.push(cookie);
		});  
		document.getElementById('TextareaCookies').innerHTML=JSON.stringify(arrCookies).replaceAll("},", "},\n");
	};

	document.getElementById('BtnApplyCookies').onclick = function () {
		// url and path must match with each other, or cookies is invalid. 
		var strCookies = document.getElementById('TextareaCookies').value;
		try {
			var arrCookies = JSON.parse(strCookies);
		} catch (error) {
			console.log('[Error]', error);
			return;
		} 
		arrCookies.forEach(cookie => {
			chrome.cookies.set(cookie, function (cookie){console.log(JSON.stringify(cookie))});
		});   
	};

});
// domain/expirationDate/httpOnly/name/path/sameSite/secure/storeId/url/value  object.(propName)